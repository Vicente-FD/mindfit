import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ActivosService, Activo } from '../../core/services/activos.service';
import { ImageCompressorService } from '../../core/services/image-compressor.service';
import { ToastService } from '../../core/services/toast.service';
import { WorkOrderPriority } from '../../core/models/work-order.model';
import { PRIORIDADES_OT } from '../../core/models/analytics.model';
import {
  TIPOS_REPORTE_SUCURSAL,
  TipoReporteSucursal,
} from '../../core/models/tipo-reporte.model';
import { Sucursal } from '../../core/models/sucursal.model';
import { Usuario } from '../../core/models/usuario.model';
import { QrScannerModalComponent } from '../../layout/qr-scanner-modal/qr-scanner-modal.component';

export interface HybridReportSubmitPayload {
  tipoReporte: TipoReporteSucursal;
  activoId: number | null;
  descripcion: string;
  prioridad: WorkOrderPriority;
  fotoFalla?: File;
  sucursalId: number;
  titulo?: string;
  asignadoAId?: number | null;
  areaServicios?: 'bano' | 'camarin' | 'ducha';
  generoServicios?: 'hombres' | 'mujeres';
  generosServicios?: Array<'hombres' | 'mujeres'>;
  fallaGeneralServicios?: boolean;
}

function requiredImageFile(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  return value instanceof File ? null : { requiredFile: true };
}

@Component({
  selector: 'app-hybrid-report-form',
  imports: [ReactiveFormsModule, LucideAngularModule, QrScannerModalComponent],
  templateUrl: './hybrid-report-form.component.html',
  styleUrl: './hybrid-report-form.component.css',
})
export class HybridReportFormComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly activosService = inject(ActivosService);
  private readonly compressor = inject(ImageCompressorService);
  private readonly toast = inject(ToastService);

  /** sucursal = sede fija; central = admin / jefe operaciones eligen sede */
  readonly variant = input<'sucursal' | 'central'>('sucursal');
  readonly fixedSucursalId = input<number | null>(null);
  readonly sucursales = input<Sucursal[]>([]);
  readonly tecnicos = input<Usuario[]>([]);
  readonly saving = input(false);
  readonly submitLabel = input('Enviar ticket');

  readonly submitted = output<HybridReportSubmitPayload>();

  readonly prioridades = PRIORIDADES_OT;
  readonly subtiposHibrido = TIPOS_REPORTE_SUCURSAL.filter((t) => t.value !== 'maquina');
  readonly activos = signal<Activo[]>([]);
  readonly imagePreview = signal<string | null>(null);
  readonly processingFoto = signal(false);
  readonly showScanner = signal(false);
  readonly preselectedActivoNombre = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    clasificacion: ['maquina' as TipoReporteSucursal, Validators.required],
    esAreaServicios: [false],
    areaServicios: [''],
    generoServicios: [''],
    generoServiciosHombres: [false],
    generoServiciosMujeres: [false],
    fallaGeneralServicios: [false],
    sucursalId: [''],
    titulo: [''],
    activoId: ['', Validators.required],
    prioridad: ['media' as WorkOrderPriority, Validators.required],
    descripcion: ['', [Validators.required, Validators.minLength(10)]],
    asignadoAId: [''],
    foto: [null as File | null, [Validators.required, requiredImageFile]],
  });

  readonly esCentral = computed(() => this.variant() === 'central');

  readonly sucursalEfectivaId = computed(() => {
    if (this.esCentral()) {
      const v = this.form.controls.sucursalId.value;
      return v ? Number(v) : null;
    }
    return this.fixedSucursalId();
  });

  readonly activosFiltrados = computed(() => {
    const sid = this.sucursalEfectivaId();
    if (!sid) return [];
    return this.activos().filter((a) => a.sucursalId === sid);
  });

  ngOnInit(): void {
    if (this.esCentral()) {
      this.form.controls.sucursalId.setValidators([Validators.required]);
    } else {
      const sid = this.fixedSucursalId();
      if (sid) this.form.patchValue({ sucursalId: String(sid) });
    }

    this.applyValidatorsForClasificacion(this.form.controls.clasificacion.value);

    this.form.controls.clasificacion.valueChanges.subscribe((tipo) => {
      this.applyValidatorsForClasificacion(tipo);
      if (tipo !== 'maquina') {
        this.form.patchValue({ activoId: '' });
        this.preselectedActivoNombre.set(null);
      }
    });

    this.form.controls.sucursalId.valueChanges.subscribe(() => {
      this.form.patchValue({ activoId: '' });
      this.preselectedActivoNombre.set(null);
      this.loadActivos();
    });

    this.loadActivos();
  }

  ngOnDestroy(): void {
    this.revokePreview();
  }

  get esReporteMaquina(): boolean {
    return this.form.controls.clasificacion.value === 'maquina';
  }

  get esAreaServicios(): boolean {
    return (
      this.form.controls.clasificacion.value === 'infraestructura' &&
      this.form.controls.esAreaServicios.value === true
    );
  }

  /** Solo jefe de sucursal debe adjuntar foto en fallas de máquina. */
  get fotoEsObligatoria(): boolean {
    return (this.esReporteMaquina && !this.esCentral()) || this.esAreaServicios;
  }

  private applyValidatorsForClasificacion(tipo: TipoReporteSucursal): void {
    const activoCtrl = this.form.controls.activoId;
    const fotoCtrl = this.form.controls.foto;
    const areaCtrl = this.form.controls.areaServicios;
    const generoCtrl = this.form.controls.generoServicios;
    const hombresCtrl = this.form.controls.generoServiciosHombres;
    const mujeresCtrl = this.form.controls.generoServiciosMujeres;

    if (tipo === 'maquina') {
      activoCtrl.setValidators([Validators.required]);
      if (this.esCentral()) {
        fotoCtrl.clearValidators();
      } else {
        fotoCtrl.setValidators([Validators.required, requiredImageFile]);
      }
    } else {
      activoCtrl.clearValidators();
      activoCtrl.setValue('');
      const esServicios =
        tipo === 'infraestructura' && this.form.controls.esAreaServicios.value;
      if (esServicios) {
        const esGeneral = this.form.controls.fallaGeneralServicios.value === true;
        if (esGeneral) {
          areaCtrl.clearValidators();
        } else {
          areaCtrl.setValidators([Validators.required]);
        }
        if (esGeneral) {
          generoCtrl.clearValidators();
          hombresCtrl.setValue(false);
          mujeresCtrl.setValue(false);
        } else {
          generoCtrl.setValidators([Validators.required]);
        }
        fotoCtrl.setValidators([Validators.required, requiredImageFile]);
      } else {
        areaCtrl.clearValidators();
        generoCtrl.clearValidators();
        this.form.patchValue({
          areaServicios: '',
          generoServicios: '',
          generoServiciosHombres: false,
          generoServiciosMujeres: false,
          fallaGeneralServicios: false,
        });
        fotoCtrl.clearValidators();
        fotoCtrl.setValue(null);
        this.revokePreview();
      }
    }

    activoCtrl.updateValueAndValidity();
    areaCtrl.updateValueAndValidity();
    generoCtrl.updateValueAndValidity();
    hombresCtrl.updateValueAndValidity();
    mujeresCtrl.updateValueAndValidity();
    fotoCtrl.updateValueAndValidity();
  }

  setModoMaquina(): void {
    this.form.controls.clasificacion.setValue('maquina');
  }

  setModoHibrido(subtipo: TipoReporteSucursal): void {
    if (subtipo === 'maquina') return;
    this.form.controls.clasificacion.setValue(subtipo);
    this.form.controls.esAreaServicios.setValue(false);
    this.applyValidatorsForClasificacion(subtipo);
  }

  setModoAreaServicios(): void {
    this.form.controls.clasificacion.setValue('infraestructura');
    this.form.controls.esAreaServicios.setValue(true);
    this.applyValidatorsForClasificacion('infraestructura');
  }

  toggleFallaGeneralServicios(): void {
    const next = !this.form.controls.fallaGeneralServicios.value;
    this.form.controls.fallaGeneralServicios.setValue(next);
    if (next) {
      this.form.controls.generoServicios.setValue('');
      this.form.controls.generoServiciosHombres.setValue(false);
      this.form.controls.generoServiciosMujeres.setValue(false);
      this.form.controls.areaServicios.setValue('');
    }
    this.applyValidatorsForClasificacion(this.form.controls.clasificacion.value);
  }

  toggleGeneroServicio(genero: 'hombres' | 'mujeres'): void {
    if (genero === 'hombres') {
      this.form.controls.generoServiciosHombres.setValue(
        !this.form.controls.generoServiciosHombres.value,
      );
    } else {
      this.form.controls.generoServiciosMujeres.setValue(
        !this.form.controls.generoServiciosMujeres.value,
      );
    }
    const seleccionados: Array<'hombres' | 'mujeres'> = [];
    if (this.form.controls.generoServiciosHombres.value) {
      seleccionados.push('hombres');
    }
    if (this.form.controls.generoServiciosMujeres.value) {
      seleccionados.push('mujeres');
    }
    this.form.controls.generoServicios.setValue(seleccionados.join(','));
    this.form.controls.generoServicios.updateValueAndValidity();
  }

  loadActivos(): void {
    const sid = this.sucursalEfectivaId();
    if (!sid) {
      this.activos.set([]);
      return;
    }
    this.activosService.list({ sucursalId: sid }).subscribe({
      next: (a) => this.activos.set(a),
    });
  }

  openQrScanner(): void {
    if (!this.esReporteMaquina || !this.sucursalEfectivaId()) return;
    this.showScanner.set(true);
  }

  closeQrScanner(): void {
    this.showScanner.set(false);
  }

  onQrScanned(identifier: string): void {
    const sucursalId = this.sucursalEfectivaId();
    if (!sucursalId) return;

    this.activosService.getPublic(identifier).subscribe({
      next: (activo) => {
        if (activo.sucursalId !== sucursalId) {
          this.toast.error('Este equipo no pertenece a la sede seleccionada');
          return;
        }
        this.form.patchValue({ activoId: String(activo.id) });
        this.preselectedActivoNombre.set(activo.nombre);
        this.toast.success(`Activo seleccionado: ${activo.nombre}`);
      },
      error: () => this.toast.error('No se encontró el activo del código QR'),
    });
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.processingFoto.set(true);
    this.revokePreview();
    this.imagePreview.set(URL.createObjectURL(file));

    try {
      const compressed = await this.compressor.compress(file);
      this.form.patchValue({ foto: compressed });
      this.form.get('foto')?.updateValueAndValidity();
    } catch {
      this.form.patchValue({ foto: null });
      this.form.get('foto')?.updateValueAndValidity();
      this.revokePreview();
    } finally {
      this.processingFoto.set(false);
      input.value = '';
    }
  }

  clearFoto(): void {
    this.form.patchValue({ foto: null });
    this.form.get('foto')?.updateValueAndValidity();
    this.revokePreview();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const sucursalId = this.sucursalEfectivaId();
    if (!sucursalId) return;

    const clasificacion = v.clasificacion;
    const foto = v.foto instanceof File ? v.foto : undefined;

    if (clasificacion === 'maquina' && this.fotoEsObligatoria && !foto) return;

    this.submitted.emit({
      tipoReporte: clasificacion,
      activoId: clasificacion === 'maquina' ? Number(v.activoId) : null,
      descripcion: v.descripcion,
      prioridad: v.prioridad,
      fotoFalla: foto,
      sucursalId,
      titulo: v.titulo.trim() || undefined,
      asignadoAId: v.asignadoAId ? Number(v.asignadoAId) : null,
      areaServicios:
        this.esAreaServicios && !v.fallaGeneralServicios
          ? (v.areaServicios as 'bano' | 'camarin' | 'ducha')
          : undefined,
      generoServicios:
        this.esAreaServicios && !v.fallaGeneralServicios
          ? (v.generoServicios as 'hombres' | 'mujeres')
          : undefined,
      generosServicios:
        this.esAreaServicios && !v.fallaGeneralServicios
          ? (v.generoServicios
              .split(',')
              .map((g) => g.trim())
              .filter((g) => g === 'hombres' || g === 'mujeres') as Array<
              'hombres' | 'mujeres'
            >)
          : undefined,
      fallaGeneralServicios:
        this.esAreaServicios ? v.fallaGeneralServicios : false,
    });
  }

  reset(): void {
    this.revokePreview();
    this.preselectedActivoNombre.set(null);
    this.form.reset({
      clasificacion: 'maquina',
      esAreaServicios: false,
      areaServicios: '',
      generoServicios: '',
      generoServiciosHombres: false,
      generoServiciosMujeres: false,
      fallaGeneralServicios: false,
      sucursalId: this.esCentral() ? '' : String(this.fixedSucursalId() ?? ''),
      titulo: '',
      activoId: '',
      prioridad: 'media',
      descripcion: '',
      asignadoAId: '',
      foto: null,
    });
    this.applyValidatorsForClasificacion('maquina');
  }

  private revokePreview(): void {
    const url = this.imagePreview();
    if (url) URL.revokeObjectURL(url);
    this.imagePreview.set(null);
  }

  activoSeleccionado(): Activo | null {
    const id = this.form.controls.activoId.value;
    if (!id) return null;
    return this.activosFiltrados().find((a) => String(a.id) === String(id)) ?? null;
  }

  healthDotClass(estado: string): string {
    const map: Record<string, string> = {
      operativo: 'health-dot health-dot--operativo',
      fuera_servicio: 'health-dot health-dot--downtime',
      mantenimiento_preventivo: 'health-dot health-dot--preventivo',
      en_reparacion: 'health-dot health-dot--reparacion',
    };
    return map[estado] ?? 'health-dot';
  }

  healthLabel(estado: string): string {
    const map: Record<string, string> = {
      operativo: 'Operativo',
      fuera_servicio: 'Fuera de servicio',
      mantenimiento_preventivo: 'En mantenimiento preventivo',
      en_reparacion: 'En reparación',
    };
    return map[estado] ?? estado;
  }
}
