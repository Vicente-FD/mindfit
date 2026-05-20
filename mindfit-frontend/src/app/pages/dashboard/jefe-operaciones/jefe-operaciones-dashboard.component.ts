import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { WorkOrdersService } from '../../../core/services/work-orders.service';
import { SucursalesService } from '../../../core/services/sucursales.service';
import { ActivosService } from '../../../core/services/activos.service';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { ToastService } from '../../../core/services/toast.service';
import { WorkOrder } from '../../../core/models/work-order.model';
import { Usuario } from '../../../core/models/usuario.model';
import { Sucursal } from '../../../core/models/sucursal.model';
import { Activo } from '../../../core/services/activos.service';
import { PRIORIDADES_OT } from '../../../core/models/analytics.model';

@Component({
  selector: 'app-jefe-operaciones-dashboard',
  imports: [ReactiveFormsModule],
  templateUrl: './jefe-operaciones-dashboard.component.html',
  styleUrl: './jefe-operaciones-dashboard.component.css',
})
export class JefeOperacionesDashboardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly workOrders = inject(WorkOrdersService);
  private readonly sucursalesService = inject(SucursalesService);
  private readonly activosService = inject(ActivosService);
  private readonly usuariosService = inject(UsuariosService);
  private readonly analytics = inject(AnalyticsService);
  private readonly toast = inject(ToastService);

  readonly prioridades = PRIORIDADES_OT;
  readonly ordenes = signal<WorkOrder[]>([]);
  readonly sucursales = signal<Sucursal[]>([]);
  readonly activos = signal<Activo[]>([]);
  readonly tecnicos = signal<Usuario[]>([]);
  readonly kpis = signal<{ efectividadPe: number; otsReportadas: number } | null>(
    null,
  );

  readonly otForm = this.fb.nonNullable.group({
    titulo: ['', Validators.required],
    descripcion: [''],
    sucursalId: ['', Validators.required],
    activoId: [''],
    prioridad: ['media' as const],
    asignadoAId: [''],
  });

  ngOnInit(): void {
    this.reload();
    this.sucursalesService.list().subscribe({ next: (s) => this.sucursales.set(s) });
    this.usuariosService.list().subscribe({
      next: (u) => this.tecnicos.set(u.filter((x) => x.rol === 'tecnico' && x.estaActivo)),
    });
    this.analytics.getKpis().subscribe({
      next: (k) =>
        this.kpis.set({
          efectividadPe: k.efectividadPe,
          otsReportadas: k.otsReportadas,
        }),
    });
  }

  reload(): void {
    this.workOrders.listAll().subscribe({
      next: (o) => this.ordenes.set(o),
      error: () => this.toast.error('Error al cargar OTs'),
    });
    this.activosService.list().subscribe({ next: (a) => this.activos.set(a) });
  }

  crearOt(): void {
    if (this.otForm.invalid) return;
    const v = this.otForm.getRawValue();
    this.workOrders
      .create({
        titulo: v.titulo,
        descripcion: v.descripcion,
        sucursalId: Number(v.sucursalId),
        activoId: v.activoId ? Number(v.activoId) : undefined,
        prioridad: v.prioridad,
        tipoMantenimiento: 'correctivo',
      })
      .subscribe({
        next: (orden) => {
          const tecnicoId = v.asignadoAId ? Number(v.asignadoAId) : null;
          if (tecnicoId) {
            this.workOrders.asignar(orden.id, tecnicoId).subscribe({
              next: () => {
                this.toast.success('OT creada y asignada');
                this.otForm.reset({
                  titulo: '',
                  descripcion: '',
                  sucursalId: '',
                  activoId: '',
                  prioridad: 'media',
                  asignadoAId: '',
                });
                this.reload();
              },
            });
          } else {
            this.toast.success('OT creada');
            this.reload();
          }
        },
        error: () => this.toast.error('Error al crear OT'),
      });
  }

  asignar(orden: WorkOrder, asignadoAId: string): void {
    if (!asignadoAId) return;
    this.workOrders.asignar(orden.id, Number(asignadoAId)).subscribe({
      next: () => {
        this.toast.success('Técnico asignado');
        this.reload();
      },
      error: () => this.toast.error('Error al asignar'),
    });
  }

  estadoLabel(estado: string): string {
    return estado.replace(/_/g, ' ');
  }
}
