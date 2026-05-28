import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import type {
  AreaFacilidad,
  FacilidadCriticaItem,
  FacilidadHistorialItem,
  FacilidadesResumen,
  GeneroFacilidad,
} from '../../core/models/facilidad-critica.model';
import { FacilidadesCriticasService } from '../../core/services/facilidades-criticas.service';
import { SucursalesService } from '../../core/services/sucursales.service';
import { ImageCompressorService } from '../../core/services/image-compressor.service';
import { ToastService } from '../../core/services/toast.service';
import {
  ELEMENTOS_POR_AREA,
  LABEL_ELEMENTO,
  type CapacidadesServicios,
  type ElementoAfectado,
  type TipoFacilidadKey,
  type TipoElementoServicio,
  capacidadMax,
  emptyElementosRecord,
  resolveCapacidades,
  resolveTipoFacilidadKey,
} from '../../core/utils/capacidades-servicios.util';
import {
  estadoFacilidadClass,
  labelEstadoFacilidad,
  semaforoClass,
  semaforoLabel,
} from '../../core/utils/facilidad-semaforo.util';

function requiredImageFile(control: { value: unknown }) {
  return control.value instanceof File ? null : { requiredFile: true };
}

@Component({
  selector: 'app-facilidades-sucursal-panel',
  imports: [ReactiveFormsModule, LucideAngularModule, DatePipe],
  templateUrl: './facilidades-sucursal-panel.component.html',
  styleUrl: './facilidades-sucursal-panel.component.css',
})
export class FacilidadesSucursalPanelComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(FacilidadesCriticasService);
  private readonly sucursalesService = inject(SucursalesService);
  private readonly compressor = inject(ImageCompressorService);
  private readonly toast = inject(ToastService);

  readonly sucursalId = input<number | null>(null);
  readonly allowResolve = input(false);
  /** Si false, solo barra resumen + botón reportar (vista jefe sucursal). */
  readonly showDetailList = input(false);

  readonly reportado = output<void>();

  readonly resumen = signal<FacilidadesResumen | null>(null);
  readonly loading = signal(true);
  readonly detailExpanded = signal(false);
  readonly reporting = signal(false);
  readonly resolvingId = signal<number | null>(null);
  readonly reportModalOpen = signal(false);
  readonly historialTarget = signal<FacilidadCriticaItem | null>(null);
  readonly historial = signal<FacilidadHistorialItem[]>([]);
  readonly historialLoading = signal(false);
  readonly imagePreview = signal<string | null>(null);
  readonly processingFoto = signal(false);

  readonly selectedArea = signal<AreaFacilidad | null>(null);
  readonly selectedGenero = signal<GeneroFacilidad | null>(null);
  readonly esFallaGeneral = signal(false);
  readonly capacidades = signal<CapacidadesServicios>(resolveCapacidades());
  readonly elementosCantidad = signal<Record<TipoElementoServicio, number>>(
    emptyElementosRecord(['wc', 'urinarios', 'lavamanos', 'duchas', 'lockers']),
  );

  readonly LABEL_ELEMENTO = LABEL_ELEMENTO;

  readonly reportForm = this.fb.nonNullable.group({
    descripcionProblema: ['', [Validators.required, Validators.maxLength(2000)]],
    notasTecnicas: ['', Validators.maxLength(2000)],
    foto: [null as File | null, requiredImageFile],
  });

  readonly resolveForm = this.fb.nonNullable.group({
    estado: [
      'operativo' as
        | 'operativo'
        | 'degradado'
        | 'mantenimiento'
        | 'fuera_de_servicio',
    ],
    notasTecnicas: ['', Validators.maxLength(2000)],
  });

  readonly semaforoClass = semaforoClass;
  readonly semaforoLabel = semaforoLabel;
  readonly estadoFacilidadClass = estadoFacilidadClass;
  readonly labelEstadoFacilidad = labelEstadoFacilidad;

  private readonly tipoFacilidadToKey: Record<string, TipoFacilidadKey> = {
    bano_hombres: 'bano_hombres',
    bano_mujeres: 'bano_mujeres',
    camarin_hombres: 'camarin_hombres',
    camarin_mujeres: 'camarin_mujeres',
    duchas_hombres: 'duchas_hombres',
    duchas_mujeres: 'duchas_mujeres',
  };

  readonly resumenLinea = computed(() => {
    const r = this.resumen();
    if (!r) return '';
    if (r.fueraDeServicio > 0) {
      return `${r.fueraDeServicio} fuera de servicio`;
    }
    if (r.degradadas > 0) {
      return `${r.degradadas} degradada(s) / parcial`;
    }
    if (r.enMantenimiento > 0) {
      return `${r.enMantenimiento} en mantenimiento`;
    }
    return 'Todas operativas';
  });

  readonly elementosDisponibles = computed((): TipoElementoServicio[] => {
    const area = this.selectedArea();
    if (!area) return [];
    return ELEMENTOS_POR_AREA[area];
  });

  readonly puedeEnviarReporte = computed(() => {
    if (this.esFallaGeneral()) return true;
    return this.selectedArea() != null && this.selectedGenero() != null;
  });

  constructor() {
    effect(() => {
      this.sucursalId();
      this.reload();
    });
  }

  ngOnDestroy(): void {
    this.revokePreview();
  }

  reload(): void {
    this.loading.set(true);
    const sid = this.sucursalId();
    this.loadCapacidades(sid);
    const req = sid != null ? this.api.porSucursal(sid) : this.api.miSucursal();
    req.subscribe({
      next: (r) => {
        this.resumen.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('No se pudieron cargar las facilidades críticas');
      },
    });
  }

  private loadCapacidades(sucursalId: number | null): void {
    if (sucursalId == null) {
      this.capacidades.set(resolveCapacidades());
      return;
    }
    this.sucursalesService.getById(sucursalId).subscribe({
      next: (s) =>
        this.capacidades.set(resolveCapacidades(s.capacidadesServicios)),
      error: () => this.capacidades.set(resolveCapacidades()),
    });
  }

  maxElemento(el: TipoElementoServicio): number {
    const area = this.selectedArea();
    const genero = this.selectedGenero();
    if (!area || !genero) return 0;
    const tipo = resolveTipoFacilidadKey(area, genero);
    return capacidadMax(this.capacidades(), tipo, el);
  }

  setElementoCantidad(el: TipoElementoServicio, raw: string): void {
    const max = this.maxElemento(el);
    const n = Math.max(0, Math.min(max, Number(raw) || 0));
    this.elementosCantidad.update((prev) => ({ ...prev, [el]: n }));
  }

  private resetElementosCantidad(): void {
    const els = this.elementosDisponibles();
    this.elementosCantidad.set(
      emptyElementosRecord(
        els.length
          ? els
          : (['wc', 'urinarios', 'lavamanos', 'duchas', 'lockers'] as TipoElementoServicio[]),
      ),
    );
  }

  private buildElementosAfectados(): ElementoAfectado[] {
    return this.elementosDisponibles()
      .map((tipo_elemento) => ({
        tipo_elemento,
        cantidad: this.elementosCantidad()[tipo_elemento] ?? 0,
      }))
      .filter((e) => e.cantidad > 0);
  }

  capacidadTipoLabel(tipoFacilidad: string): string {
    const key = this.tipoFacilidadToKey[tipoFacilidad];
    if (!key) return '';
    const caps = this.capacidades()[key];
    if (!caps) return '';

    const parts: string[] = [];
    for (const [el, qty] of Object.entries(caps)) {
      const n = Number(qty) || 0;
      if (n <= 0) continue;
      const label = LABEL_ELEMENTO[el as TipoElementoServicio] ?? el;
      parts.push(`${n} ${label}`);
    }
    return parts.join(' · ');
  }

  toggleDetail(): void {
    if (!this.showDetailList()) return;
    this.detailExpanded.update((v) => !v);
  }

  abrirReporteModal(): void {
    this.reportModalOpen.set(true);
    this.selectedArea.set(null);
    this.selectedGenero.set(null);
    this.esFallaGeneral.set(false);
    this.resetElementosCantidad();
    this.reportForm.reset({
      descripcionProblema: '',
      notasTecnicas: '',
      foto: null,
    });
    this.revokePreview();
  }

  cerrarReporteModal(): void {
    this.reportModalOpen.set(false);
    this.revokePreview();
  }

  seleccionarArea(area: AreaFacilidad): void {
    this.esFallaGeneral.set(false);
    this.selectedArea.set(area);
    this.selectedGenero.set(null);
    this.resetElementosCantidad();
  }

  seleccionarGenero(genero: GeneroFacilidad): void {
    this.selectedGenero.set(genero);
    this.resetElementosCantidad();
  }

  activarFallaGeneral(): void {
    this.esFallaGeneral.set(true);
    this.selectedArea.set(null);
    this.selectedGenero.set(null);
    this.resetElementosCantidad();
  }

  async onFotoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.processingFoto.set(true);
    this.revokePreview();
    this.imagePreview.set(URL.createObjectURL(file));

    try {
      const compressed = await this.compressor.compress(file);
      this.reportForm.patchValue({ foto: compressed });
      this.reportForm.get('foto')?.updateValueAndValidity();
    } catch {
      if (file.type.startsWith('image/')) {
        this.reportForm.patchValue({ foto: file });
        this.reportForm.get('foto')?.updateValueAndValidity();
        this.toast.error(
          'No se pudo comprimir la imagen; se enviará el archivo original.',
        );
      } else {
        this.reportForm.patchValue({ foto: null });
        this.revokePreview();
        this.toast.error('Seleccione una imagen válida (JPG, PNG o WEBP).');
      }
    } finally {
      this.processingFoto.set(false);
      input.value = '';
    }
  }

  clearFoto(): void {
    this.reportForm.patchValue({ foto: null });
    this.reportForm.get('foto')?.updateValueAndValidity();
    this.revokePreview();
  }

  enviarReporte(): void {
    if (!this.puedeEnviarReporte() || this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }

    const elementos = this.buildElementosAfectados();
    if (!this.esFallaGeneral() && elementos.length === 0) {
      this.toast.error('Indique al menos un elemento dañado');
      return;
    }

    const v = this.reportForm.getRawValue();
    const formData = new FormData();
    formData.append('descripcionProblema', v.descripcionProblema.trim());
    if (v.notasTecnicas.trim()) {
      formData.append('notasTecnicas', v.notasTecnicas.trim());
    }
    formData.append('prioridad', 'media');
    formData.append(
      'esFallaGeneral',
      this.esFallaGeneral() ? 'true' : 'false',
    );
    if (!this.esFallaGeneral()) {
      formData.append('area', this.selectedArea()!);
      formData.append('genero', this.selectedGenero()!);
      formData.append('elementosAfectados', JSON.stringify(elementos));
    }
    if (v.foto) {
      formData.append('foto_falla', v.foto, v.foto.name);
    }

    this.reporting.set(true);
    this.api
      .reportarAreaServicios(formData)
      .pipe(finalize(() => this.reporting.set(false)))
      .subscribe({
        next: (res) => {
          this.cerrarReporteModal();
          this.toast.success(
            `Ticket ${res.codigoOt} creado. Operaciones asignará un técnico.`,
          );
          this.reload();
          this.reportado.emit();
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'No se pudo enviar el reporte';
          this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
        },
      });
  }

  abrirHistorial(item: FacilidadCriticaItem): void {
    this.historialTarget.set(item);
    this.historialLoading.set(true);
    this.api.historial(item.id).subscribe({
      next: (rows) => {
        this.historial.set(rows);
        this.historialLoading.set(false);
      },
      error: () => {
        this.historialLoading.set(false);
        this.toast.error('No se pudo cargar el historial');
      },
    });
  }

  cerrarHistorial(): void {
    this.historialTarget.set(null);
    this.historial.set([]);
  }

  abrirResolver(item: FacilidadCriticaItem): void {
    this.resolveForm.patchValue({
      estado: item.estado === 'fuera_de_servicio' ? 'operativo' : item.estado,
      notasTecnicas: item.notasTecnicas ?? '',
    });
    this.historialTarget.set(item);
    this.historialLoading.set(true);
    this.api.historial(item.id).subscribe({
      next: (rows) => {
        this.historial.set(rows);
        this.historialLoading.set(false);
      },
      error: () => {
        this.historialLoading.set(false);
        this.toast.error('No se pudo cargar el historial');
      },
    });
  }

  enviarResolver(): void {
    const item = this.historialTarget();
    if (!item || !this.allowResolve() || this.resolveForm.invalid) {
      this.resolveForm.markAllAsTouched();
      return;
    }
    const v = this.resolveForm.getRawValue();
    this.resolvingId.set(item.id);
    this.api
      .actualizarEstado(item.id, {
        estado: v.estado,
        notasTecnicas: v.notasTecnicas.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.resolvingId.set(null);
          this.cerrarHistorial();
          this.toast.success('Estado actualizado');
          this.reload();
        },
        error: (err) => {
          this.resolvingId.set(null);
          const msg = err?.error?.message ?? 'No se pudo actualizar';
          this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
        },
      });
  }

  private revokePreview(): void {
    const url = this.imagePreview();
    if (url) URL.revokeObjectURL(url);
    this.imagePreview.set(null);
  }
}
