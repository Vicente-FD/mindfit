import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, startWith } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ActivosService } from '../../../core/services/activos.service';
import { WorkOrdersService } from '../../../core/services/work-orders.service';
import { TecnicoUiService } from '../../../core/services/tecnico-ui.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  WorkOrder,
  WorkOrderStatus,
} from '../../../core/models/work-order.model';
import { CloseOtModalComponent } from '../../../layout/close-ot-modal/close-ot-modal.component';

const ACTIVE_STATUSES: WorkOrderStatus[] = [
  'pendiente',
  'asignada',
  'en_proceso',
];

@Component({
  selector: 'app-tecnico-dashboard',
  imports: [CloseOtModalComponent],
  templateUrl: './tecnico-dashboard.component.html',
  styleUrl: './tecnico-dashboard.component.css',
})
export class TecnicoDashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly workOrders = inject(WorkOrdersService);
  private readonly activosService = inject(ActivosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly tecnicoUi = inject(TecnicoUiService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private scanHandled = false;

  readonly user = this.auth.user;
  readonly orders = signal<WorkOrder[]>([]);
  readonly loading = signal(true);
  readonly actionLoadingId = signal<number | null>(null);
  readonly closeTarget = signal<WorkOrder | null>(null);
  readonly now = signal(Date.now());

  readonly qrAlert = this.tecnicoUi.qrAlert;
  readonly highlightOrderId = this.tecnicoUi.highlightOrderId;

  readonly pendingCount = computed(
    () =>
      this.orders().filter((o) => o.estado === 'pendiente' || o.estado === 'asignada')
        .length,
  );

  readonly inProgressCount = computed(
    () => this.orders().filter((o) => o.estado === 'en_proceso').length,
  );

  readonly visibleOrders = computed(() =>
    this.orders()
      .filter((o) => ACTIVE_STATUSES.includes(o.estado))
      .sort((a, b) => this.priorityWeight(b.prioridad) - this.priorityWeight(a.prioridad)),
  );

  ngOnInit(): void {
    this.loadOrders();

    interval(1000)
      .pipe(startWith(0), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.now.set(Date.now()));
  }

  loadOrders(): void {
    this.loading.set(true);
    this.workOrders.getMisAsignadas().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
        this.tryHandleScanQuery();
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('No se pudieron cargar las órdenes asignadas');
      },
    });
  }

  logout(): void {
    this.auth.logout();
  }

  iniciarTrabajo(orden: WorkOrder): void {
    this.actionLoadingId.set(orden.id);
    this.workOrders.iniciarTrabajo(orden.id).subscribe({
      next: (updated) => {
        this.patchOrder(updated);
        this.actionLoadingId.set(null);
        this.toast.success(`OT ${orden.codigoOt} iniciada`);
        this.tecnicoUi.focusOrder(updated.id);
      },
      error: (err) => {
        this.actionLoadingId.set(null);
        const msg = err?.error?.message ?? 'No se pudo iniciar la orden';
        this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
      },
    });
  }

  openCloseModal(orden: WorkOrder): void {
    this.closeTarget.set(orden);
  }

  onCloseSubmitted(): void {
    this.closeTarget.set(null);
    this.loadOrders();
  }

  dismissQrAlert(): void {
    this.tecnicoUi.clearQrAlert();
  }

  elapsedLabel(orden: WorkOrder): string | null {
    if (orden.estado !== 'en_proceso' || !orden.fechaInicioReal) return null;
    const start = new Date(orden.fechaInicioReal).getTime();
    const diff = Math.max(0, this.now() - start);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  priorityClass(prioridad: WorkOrder['prioridad']): string {
    if (prioridad === 'alta') return 'priority-alta';
    if (prioridad === 'media') return 'priority-media';
    return 'priority-baja';
  }

  priorityLabel(prioridad: WorkOrder['prioridad']): string {
    const map = { alta: 'Alta', media: 'Media', baja: 'Baja' } as const;
    return map[prioridad];
  }

  activoLabel(orden: WorkOrder): string {
    const a = orden.activo;
    if (!a) return orden.titulo;
    return a.nombre;
  }

  activoDetalle(orden: WorkOrder): string {
    const a = orden.activo;
    if (!a) return orden.descripcion ?? 'Sin activo vinculado';
    const parts = [a.marca, a.modelo].filter(Boolean).join(' · ');
    const sucursal = a.sucursal?.nombre ?? orden.sucursal?.nombre ?? '—';
    return [parts || 'Sin marca/modelo', sucursal].join(' · ');
  }

  isHighlighted(id: number): boolean {
    return this.highlightOrderId() === id;
  }

  private patchOrder(updated: WorkOrder): void {
    this.orders.update((list) =>
      list.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)),
    );
  }

  private priorityWeight(p: WorkOrder['prioridad']): number {
    return p === 'alta' ? 3 : p === 'media' ? 2 : 1;
  }

  private tryHandleScanQuery(): void {
    if (this.scanHandled) return;
    const token = this.route.snapshot.queryParamMap.get('scan');
    if (!token) return;
    this.scanHandled = true;
    this.activosService.getPublic(token).subscribe({
      next: (activo) => {
        const orden = this.orders().find(
          (o) =>
            o.activoId === activo.id ||
            o.activo?.codigoQrToken === activo.codigoQrToken ||
            o.activo?.codigoQrToken === activo.codigoInventario,
        );
        if (orden) {
          this.tecnicoUi.showQrAlert({ activoNombre: activo.nombre, orden });
        } else {
          this.toast.info(`Activo: ${activo.nombre} — sin OT activa asignada`);
        }
        void this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { scan: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      },
      error: () => this.toast.error('Código QR no reconocido'),
    });
  }
}
