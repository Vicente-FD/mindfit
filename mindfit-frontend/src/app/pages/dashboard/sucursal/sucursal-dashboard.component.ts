import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ActivosService, Activo } from '../../../core/services/activos.service';
import { WorkOrdersService } from '../../../core/services/work-orders.service';
import { ImageCompressorService } from '../../../core/services/image-compressor.service';
import { ToastService } from '../../../core/services/toast.service';
import { WorkOrder } from '../../../core/models/work-order.model';
import { PRIORIDADES_OT } from '../../../core/models/analytics.model';

@Component({
  selector: 'app-sucursal-dashboard',
  imports: [ReactiveFormsModule],
  templateUrl: './sucursal-dashboard.component.html',
  styleUrl: './sucursal-dashboard.component.css',
})
export class SucursalDashboardComponent implements OnInit {
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
  private fotoFile: File | null = null;

  readonly reportForm = this.fb.nonNullable.group({
    activoId: ['', Validators.required],
    prioridad: ['media' as const, Validators.required],
    descripcion: ['', [Validators.required, Validators.minLength(10)]],
  });

  ngOnInit(): void {
    const sucursalId = this.user()?.sucursalId;
    if (!sucursalId) {
      this.toast.error('Su usuario no tiene sucursal asignada');
      return;
    }
    this.activosService.list(sucursalId).subscribe({
      next: (a) => this.activos.set(a),
    });
    this.loadOrdenes();
  }

  loadOrdenes(): void {
    this.workOrders.getMiSucursal().subscribe({
      next: (o) => this.ordenes.set(o),
    });
  }

  async onFoto(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      this.fotoFile = await this.compressor.compress(file);
    } catch {
      this.toast.error('No se pudo procesar la imagen');
    }
  }

  enviarReporte(): void {
    if (this.reportForm.invalid) return;
    const v = this.reportForm.getRawValue();
    this.saving.set(true);
    this.workOrders
      .reportarFalla({
        activoId: Number(v.activoId),
        descripcion: v.descripcion,
        prioridad: v.prioridad,
        fotoFalla: this.fotoFile ?? undefined,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.fotoFile = null;
          this.toast.success('Ticket de falla enviado');
          this.reportForm.reset({ activoId: '', prioridad: 'media', descripcion: '' });
          this.loadOrdenes();
        },
        error: (err) => {
          this.saving.set(false);
          const msg = err?.error?.message ?? 'Error al enviar reporte';
          this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
        },
      });
  }

  estadoLabel(estado: string): string {
    const map: Record<string, string> = {
      pendiente: 'Pendiente — sin técnico',
      asignada: 'Técnico asignado',
      en_proceso: 'En proceso',
      finalizada: 'Trabajo finalizado',
      aprobada: 'Solucionado / Aprobado',
    };
    return map[estado] ?? estado;
  }
}
