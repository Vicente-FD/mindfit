import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { ActivosService, Activo } from '../../../core/services/activos.service';
import { WorkOrdersService } from '../../../core/services/work-orders.service';
import { ImageCompressorService } from '../../../core/services/image-compressor.service';
import { ToastService } from '../../../core/services/toast.service';
import { WorkOrder } from '../../../core/models/work-order.model';
import { PRIORIDADES_OT } from '../../../core/models/analytics.model';
import {
  TIPOS_REPORTE_SUCURSAL,
  TipoReporteSucursal,
} from '../../../core/models/tipo-reporte.model';
import { QrScannerModalComponent } from '../../../layout/qr-scanner-modal/qr-scanner-modal.component';

function requiredImageFile(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  return value instanceof File ? null : { requiredFile: true };
}

@Component({
  selector: 'app-sucursal-dashboard',
  imports: [ReactiveFormsModule, LucideAngularModule, QrScannerModalComponent],
  templateUrl: './sucursal-dashboard.component.html',
  styleUrl: './sucursal-dashboard.component.css',
})
export class SucursalDashboardComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly activosService = inject(ActivosService);
  private readonly workOrders = inject(WorkOrdersService);
  private readonly compressor = inject(ImageCompressorService);
  private readonly toast = inject(ToastService);

  readonly user = this.auth.user;
  readonly prioridades = PRIORIDADES_OT;
  readonly tiposReporte = TIPOS_REPORTE_SUCURSAL;
  readonly activos = signal<Activo[]>([]);
  readonly ordenes = signal<WorkOrder[]>([]);
  readonly saving = signal(false);
  readonly imagePreview = signal<string | null>(null);
  readonly processingFoto = signal(false);
  readonly showScanner = signal(false);
  readonly preselectedActivoNombre = signal<string | null>(null);

  readonly reporteForm = this.fb.nonNullable.group({
    tipoReporte: ['maquina' as TipoReporteSucursal, Validators.required],
    activoId: ['', Validators.required],
    prioridad: ['media' as const, Validators.required],
    descripcion: ['', [Validators.required, Validators.minLength(10)]],
    foto: [null as File | null, [Validators.required, requiredImageFile]],
  });

  ngOnInit(): void {
    const sucursalId = this.user()?.sucursalId;
    if (!sucursalId) {
      this.toast.error('Su usuario no tiene sucursal asignada');
      return;
    }
    this.loadActivos();
    this.loadOrdenes();
    this.applyValidatorsForTipo(this.reporteForm.controls.tipoReporte.value);
    this.reporteForm.controls.tipoReporte.valueChanges.subscribe((tipo) => {
      this.applyValidatorsForTipo(tipo);
      if (tipo !== 'maquina') {
        this.reporteForm.patchValue({ activoId: '' });
        this.preselectedActivoNombre.set(null);
      }
    });
  }

  get esReporteMaquina(): boolean {
    return this.reporteForm.controls.tipoReporte.value === 'maquina';
  }

  get fotoEsObligatoria(): boolean {
    return this.esReporteMaquina;
  }

  private applyValidatorsForTipo(tipo: TipoReporteSucursal): void {
    const activoCtrl = this.reporteForm.controls.activoId;
    const fotoCtrl = this.reporteForm.controls.foto;

    if (tipo === 'maquina') {
      activoCtrl.setValidators([Validators.required]);
      fotoCtrl.setValidators([Validators.required, requiredImageFile]);
    } else {
      activoCtrl.setValidators(null);
      activoCtrl.setValue('');
      fotoCtrl.setValidators(null);
      fotoCtrl.setValue(null);
      this.revokePreview();
    }

    activoCtrl.updateValueAndValidity();
    fotoCtrl.updateValueAndValidity();
  }

  setTipoReporte(tipo: TipoReporteSucursal): void {
    this.reporteForm.controls.tipoReporte.setValue(tipo);
  }

  loadActivos(): void {
    const sucursalId = this.user()?.sucursalId;
    if (!sucursalId) return;
    this.activosService.list({ sucursalId }).subscribe({
      next: (a) => this.activos.set(a),
    });
  }

  ngOnDestroy(): void {
    this.revokePreview();
  }

  openQrScanner(): void {
    if (!this.esReporteMaquina) return;
    this.showScanner.set(true);
  }

  closeQrScanner(): void {
    this.showScanner.set(false);
  }

  onQrScanned(identifier: string): void {
    const sucursalId = this.user()?.sucursalId;
    if (!sucursalId) {
      this.toast.error('Su usuario no tiene sucursal asignada');
      return;
    }

    this.activosService.getPublic(identifier).subscribe({
      next: (activo) => {
        if (activo.sucursalId !== sucursalId) {
          this.toast.error('Este equipo no pertenece a su sede');
          return;
        }
        this.reporteForm.patchValue({ activoId: String(activo.id) });
        this.preselectedActivoNombre.set(activo.nombre);
        this.toast.success(`Activo seleccionado: ${activo.nombre}`);
      },
      error: () => this.toast.error('No se encontró el activo del código QR'),
    });
  }

  loadOrdenes(): void {
    this.workOrders.getMiSucursal().subscribe({
      next: (o) => this.ordenes.set(o),
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
      this.reporteForm.patchValue({ foto: compressed });
      this.reporteForm.get('foto')?.updateValueAndValidity();
    } catch {
      this.reporteForm.patchValue({ foto: null });
      this.reporteForm.get('foto')?.updateValueAndValidity();
      this.revokePreview();
      this.toast.error('No se pudo procesar la imagen');
    } finally {
      this.processingFoto.set(false);
      input.value = '';
    }
  }

  enviarReporte(): void {
    if (this.reporteForm.invalid) {
      this.reporteForm.markAllAsTouched();
      return;
    }

    const v = this.reporteForm.getRawValue();
    const tipo = v.tipoReporte;
    const foto = v.foto instanceof File ? v.foto : undefined;

    if (tipo === 'maquina' && !foto) {
      this.toast.error('Debe adjuntar una foto de la falla');
      return;
    }

    this.saving.set(true);
    this.workOrders
      .reportarFalla({
        tipoReporte: tipo,
        activoId: tipo === 'maquina' ? Number(v.activoId) : null,
        descripcion: v.descripcion,
        prioridad: v.prioridad,
        fotoFalla: foto,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.resetForm();
          this.toast.success('Ticket enviado correctamente');
          this.loadActivos();
          this.loadOrdenes();
        },
        error: (err) => {
          this.saving.set(false);
          const msg = err?.error?.message ?? 'Error al enviar reporte';
          this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
        },
      });
  }

  private resetForm(): void {
    this.revokePreview();
    this.preselectedActivoNombre.set(null);
    this.reporteForm.reset({
      tipoReporte: 'maquina',
      activoId: '',
      prioridad: 'media',
      descripcion: '',
      foto: null,
    });
    this.applyValidatorsForTipo('maquina');
  }

  private revokePreview(): void {
    const url = this.imagePreview();
    if (url) URL.revokeObjectURL(url);
    this.imagePreview.set(null);
  }

  activoSeleccionado(): Activo | null {
    const id = this.reporteForm.controls.activoId.value;
    if (!id) return null;
    return this.activos().find((a) => String(a.id) === String(id)) ?? null;
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

  estadoLabel(estado: string): string {
    const map: Record<string, string> = {
      pendiente: 'Pendiente — en revisión',
      asignada: 'Técnico asignado',
      en_proceso: 'En proceso',
      finalizada: 'Trabajo finalizado',
      aprobada: 'Solucionado / Aprobado',
      rechazada: 'Rechazado por operaciones',
    };
    return map[estado] ?? estado;
  }
}
