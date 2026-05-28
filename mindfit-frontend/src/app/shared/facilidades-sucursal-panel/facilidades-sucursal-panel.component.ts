import { DatePipe } from '@angular/common';
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
import { ImageCompressorService } from '../../core/services/image-compressor.service';
import { ToastService } from '../../core/services/toast.service';
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

  readonly reportForm = this.fb.nonNullable.group({
    descripcionProblema: ['', [Validators.required, Validators.maxLength(2000)]],
    notasTecnicas: ['', Validators.maxLength(2000)],
    foto: [null as File | null, requiredImageFile],
  });

  readonly resolveForm = this.fb.nonNullable.group({
    estado: ['operativo' as 'operativo' | 'mantenimiento' | 'fuera_de_servicio'],
    notasTecnicas: ['', Validators.maxLength(2000)],
  });

  readonly semaforoClass = semaforoClass;
  readonly semaforoLabel = semaforoLabel;
  readonly estadoFacilidadClass = estadoFacilidadClass;
  readonly labelEstadoFacilidad = labelEstadoFacilidad;

  readonly resumenLinea = computed(() => {
    const r = this.resumen();
    if (!r) return '';
    if (r.fueraDeServicio > 0) {
      return `${r.fueraDeServicio} fuera de servicio`;
    }
    if (r.enMantenimiento > 0) {
      return `${r.enMantenimiento} en mantenimiento`;
    }
    return 'Todas operativas';
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

  toggleDetail(): void {
    if (!this.showDetailList()) return;
    this.detailExpanded.update((v) => !v);
  }

  abrirReporteModal(): void {
    this.reportModalOpen.set(true);
    this.selectedArea.set(null);
    this.selectedGenero.set(null);
    this.esFallaGeneral.set(false);
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
  }

  seleccionarGenero(genero: GeneroFacilidad): void {
    this.selectedGenero.set(genero);
  }

  activarFallaGeneral(): void {
    this.esFallaGeneral.set(true);
    this.selectedArea.set(null);
    this.selectedGenero.set(null);
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
      this.reportForm.patchValue({ foto: null });
      this.revokePreview();
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
    }
    if (v.foto) {
      formData.append('foto_falla', v.foto, v.foto.name);
    }

    this.reporting.set(true);
    this.api.reportarAreaServicios(formData).subscribe({
      next: (res) => {
        this.reporting.set(false);
        this.cerrarReporteModal();
        this.toast.success(
          `Ticket ${res.codigoOt} creado. Operaciones asignará un técnico.`,
        );
        this.reload();
        this.reportado.emit();
      },
      error: (err) => {
        this.reporting.set(false);
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
