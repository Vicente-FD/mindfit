import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { WorkOrdersService } from '../../../core/services/work-orders.service';
import { ToastService } from '../../../core/services/toast.service';
import { WorkOrder } from '../../../core/models/work-order.model';
import {
  HybridReportFormComponent,
  HybridReportSubmitPayload,
} from '../../../shared/hybrid-report-form/hybrid-report-form.component';
import { FacilidadesSucursalPanelComponent } from '../../../shared/facilidades-sucursal-panel/facilidades-sucursal-panel.component';

@Component({
  selector: 'app-sucursal-dashboard',
  imports: [
    LucideAngularModule,
    HybridReportFormComponent,
    FacilidadesSucursalPanelComponent,
  ],
  templateUrl: './sucursal-dashboard.component.html',
  styleUrl: './sucursal-dashboard.component.css',
})
export class SucursalDashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly workOrders = inject(WorkOrdersService);
  private readonly toast = inject(ToastService);

  readonly user = this.auth.user;
  readonly ordenes = signal<WorkOrder[]>([]);
  readonly saving = signal(false);

  readonly reportForm = viewChild(HybridReportFormComponent);

  ngOnInit(): void {
    if (!this.user()?.sucursalId) {
      this.toast.error('Su usuario no tiene sucursal asignada');
      return;
    }
    this.loadOrdenes();
  }

  onReportSubmit(payload: HybridReportSubmitPayload): void {
    this.saving.set(true);
    this.workOrders
      .reportarFalla({
        tipoReporte: payload.tipoReporte,
        activoId: payload.activoId,
        descripcion: payload.descripcion,
        prioridad: payload.prioridad,
        fotoFalla: payload.fotoFalla,
        areaServicios: payload.areaServicios,
        generoServicios: payload.generoServicios,
        generosServicios: payload.generosServicios,
        fallaGeneralServicios: payload.fallaGeneralServicios,
        elementosAfectados: payload.elementosAfectados,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.reportForm()?.reset();
          this.toast.success('Ticket enviado correctamente');
          this.loadOrdenes();
        },
        error: (err) => {
          this.saving.set(false);
          const msg = err?.error?.message ?? 'Error al enviar reporte';
          this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
        },
      });
  }

  loadOrdenes(): void {
    this.workOrders.getMiSucursal().subscribe({
      next: (o) => this.ordenes.set(o),
    });
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
