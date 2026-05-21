import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ActivosService, Activo } from '../../../core/services/activos.service';
import { WorkOrdersService } from '../../../core/services/work-orders.service';
import { ImageCompressorService } from '../../../core/services/image-compressor.service';
import { ToastService } from '../../../core/services/toast.service';
import { WorkOrder } from '../../../core/models/work-order.model';
import { PRIORIDADES_OT } from '../../../core/models/analytics.model';

function requiredImageFile(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  return value instanceof File ? null : { requiredFile: true };
}

@Component({
  selector: 'app-sucursal-dashboard',
  imports: [ReactiveFormsModule],
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
  readonly activos = signal<Activo[]>([]);
  readonly ordenes = signal<WorkOrder[]>([]);
  readonly saving = signal(false);
  readonly imagePreview = signal<string | null>(null);
  readonly processingFoto = signal(false);

  readonly reporteForm = this.fb.nonNullable.group({
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
    this.activosService.list({ sucursalId }).subscribe({
      next: (a) => this.activos.set(a),
    });
    this.loadOrdenes();
  }

  ngOnDestroy(): void {
    this.revokePreview();
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
    const foto = v.foto;
    if (!(foto instanceof File)) {
      this.toast.error('Debe adjuntar una foto de la falla');
      return;
    }

    this.saving.set(true);
    this.workOrders
      .reportarFalla({
        activoId: Number(v.activoId),
        descripcion: v.descripcion,
        prioridad: v.prioridad,
        fotoFalla: foto,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.resetForm();
          this.toast.success('Ticket de falla enviado');
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
    this.reporteForm.reset({
      activoId: '',
      prioridad: 'media',
      descripcion: '',
      foto: null,
    });
  }

  private revokePreview(): void {
    const url = this.imagePreview();
    if (url) URL.revokeObjectURL(url);
    this.imagePreview.set(null);
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
