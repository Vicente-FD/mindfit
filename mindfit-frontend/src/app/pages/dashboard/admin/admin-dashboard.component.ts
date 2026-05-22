import { Component, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { SucursalesService } from '../../../core/services/sucursales.service';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { WorkOrdersService } from '../../../core/services/work-orders.service';
import { ToastService } from '../../../core/services/toast.service';
import { Sucursal } from '../../../core/models/sucursal.model';
import { Usuario } from '../../../core/models/usuario.model';
import {
  HybridReportFormComponent,
  HybridReportSubmitPayload,
} from '../../../shared/hybrid-report-form/hybrid-report-form.component';

@Component({
  selector: 'app-admin-dashboard',
  imports: [HybridReportFormComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly sucursalesService = inject(SucursalesService);
  private readonly usuariosService = inject(UsuariosService);
  private readonly workOrders = inject(WorkOrdersService);
  private readonly toast = inject(ToastService);

  readonly user = this.auth.user;
  readonly sucursales = signal<Sucursal[]>([]);
  readonly tecnicos = signal<Usuario[]>([]);
  readonly saving = signal(false);
  readonly showReportForm = signal(false);

  ngOnInit(): void {
    this.sucursalesService.list().subscribe({ next: (s) => this.sucursales.set(s) });
    this.usuariosService.list().subscribe({
      next: (u) =>
        this.tecnicos.set(u.filter((x) => x.rol === 'tecnico' && x.estaActivo)),
    });
  }

  toggleReportForm(): void {
    this.showReportForm.update((v) => !v);
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
        sucursalId: payload.sucursalId,
        titulo: payload.titulo,
        asignadoAId: payload.asignadoAId,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.showReportForm.set(false);
          this.toast.success('Reporte registrado en la sede seleccionada');
        },
        error: (err) => {
          this.saving.set(false);
          const msg = err?.error?.message ?? 'Error al registrar reporte';
          this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
        },
      });
  }
}
