import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, startWith } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { WorkOrdersService } from '../../../core/services/work-orders.service';
import { TecnicoUiService } from '../../../core/services/tecnico-ui.service';
import { ToastService } from '../../../core/services/toast.service';
import { AgentDebugService } from '../../../core/services/agent-debug.service';
import {
  WorkOrder,
  WorkOrderStatus,
} from '../../../core/models/work-order.model';
import { CloseOtModalComponent } from '../../../layout/close-ot-modal/close-ot-modal.component';
import { StartWorkModalComponent } from '../../../layout/start-work-modal/start-work-modal.component';

const ACTIVE_STATUSES: WorkOrderStatus[] = [
  'pendiente',
  'asignada',
  'en_proceso',
];

@Component({
  selector: 'app-tecnico-dashboard',
  imports: [CloseOtModalComponent, StartWorkModalComponent],
  templateUrl: './tecnico-dashboard.component.html',
  styleUrl: './tecnico-dashboard.component.css',
})
export class TecnicoDashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly workOrders = inject(WorkOrdersService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly tecnicoUi = inject(TecnicoUiService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly agentDebug = inject(AgentDebugService);
  private scanHandled = false;
  private ordersRequestId = 0;

  readonly user = this.auth.user;
  readonly orders = signal<WorkOrder[]>([]);
  readonly loading = signal(true);
  readonly actionLoadingId = signal<number | null>(null);
  readonly closeTarget = signal<WorkOrder | null>(null);
  readonly startTarget = signal<WorkOrder | null>(null);
  readonly startSubmitting = signal(false);
  readonly startError = signal<string | null>(null);
  readonly now = signal(Date.now());

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

  constructor() {
    effect(() => {
      const start = this.tecnicoUi.pendingStartOrder();
      if (start) {
        this.openStartModal(start);
        this.tecnicoUi.pendingStartOrder.set(null);
      }
    });
    effect(() => {
      const close = this.tecnicoUi.pendingCloseOrder();
      if (close) {
        this.closeTarget.set(close);
        this.tecnicoUi.pendingCloseOrder.set(null);
      }
    });
  }

  ngOnInit(): void {
    this.loadOrders();

    interval(1000)
      .pipe(startWith(0), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.now.set(Date.now()));
  }

  loadOrders(options?: { silent?: boolean }): void {
    const silent = options?.silent ?? false;
    const requestId = ++this.ordersRequestId;
    if (!silent) {
      this.loading.set(true);
    }
    this.workOrders.getMisAsignadas().subscribe({
      next: (data) => {
        if (requestId !== this.ordersRequestId) {
          // #region agent log
          this.agentDebug.log(
            'tecnico-dashboard.component.ts:loadOrders',
            'stale response ignored',
            { requestId, current: this.ordersRequestId, silent },
            'C',
          );
          // #endregion
          return;
        }
        // #region agent log
        this.agentDebug.log(
          'tecnico-dashboard.component.ts:loadOrders',
          'mis-asignadas loaded',
          {
            silent,
            count: data.length,
            estados: data.map((o) => ({
              id: o.id,
              codigo: o.codigoOt,
              estado: o.estado,
              fechaInicio: o.fechaInicioReal,
            })),
          },
          'C,E',
        );
        // #endregion
        this.orders.set(data);
        if (!silent) {
          this.loading.set(false);
        }
        this.tryHandleScanQuery();
      },
      error: () => {
        if (!silent) {
          this.loading.set(false);
        }
        this.toast.error('No se pudieron cargar las órdenes asignadas');
      },
    });
  }

  logout(): void {
    this.auth.logout();
  }

  openStartModal(orden: WorkOrder): void {
    this.startError.set(null);
    // #region agent log
    this.agentDebug.log(
      'tecnico-dashboard.component.ts:openStartModal',
      'opening modal immediately',
      { ordenId: orden.id, codigo: orden.codigoOt, estado: orden.estado },
      'I',
    );
    // #endregion

    if (orden.estado !== 'asignada' && orden.estado !== 'pendiente') {
      this.toast.error(
        `Esta OT ya está en estado «${orden.estado}». Actualizando lista…`,
      );
      this.loadOrders({ silent: true });
      return;
    }

    this.startTarget.set(orden);

    this.workOrders.getById(orden.id).subscribe({
      next: (fresh) => {
        if (fresh.estado !== 'asignada' && fresh.estado !== 'pendiente') {
          this.startTarget.set(null);
          this.toast.error(
            `Esta OT ya está en estado «${fresh.estado}». Actualizando lista…`,
          );
          this.patchOrder(fresh);
          this.loadOrders({ silent: true });
          return;
        }
        this.startTarget.set(fresh);
      },
      error: () => {
        // #region agent log
        this.agentDebug.log(
          'tecnico-dashboard.component.ts:openStartModal',
          'getById failed, keeping modal with list data',
          { ordenId: orden.id },
          'I',
        );
        // #endregion
      },
    });
  }

  onConfirmStart(file: File): void {
    const orden = this.startTarget();
    if (!orden) return;

    this.startSubmitting.set(true);
    this.startError.set(null);
    // #region agent log
    this.agentDebug.log(
      'tecnico-dashboard.component.ts:onConfirmStart',
      'iniciar HTTP from parent',
      { ordenId: orden.id, codigo: orden.codigoOt, fileSize: file.size },
      'H',
    );
    // #endregion

    this.workOrders.iniciarTrabajo(orden.id, file).subscribe({
      next: (updated) => {
        this.startSubmitting.set(false);
        // #region agent log
        this.agentDebug.log(
          'tecnico-dashboard.component.ts:onConfirmStart',
          'iniciar HTTP success',
          { ordenId: updated.id, estado: updated.estado },
          'H,B',
        );
        // #endregion
        this.onWorkStarted(updated);
      },
      error: (err) => {
        this.startSubmitting.set(false);
        // #region agent log
        this.agentDebug.log(
          'tecnico-dashboard.component.ts:onConfirmStart',
          'iniciar HTTP error',
          { ordenId: orden.id, status: err?.status, body: err?.error },
          'H,A',
        );
        // #endregion
        if (err?.status === 404) {
          this.toast.error('Esta orden ya no está disponible (fue eliminada)');
          this.onOrdenNoDisponible();
          return;
        }
        const msg = err?.error?.message ?? 'No se pudo iniciar la orden';
        const text = Array.isArray(msg) ? msg.join(', ') : String(msg);
        this.startError.set(text);
        this.toast.error(text);
      },
    });
  }

  onStartModalClosed(): void {
    this.startTarget.set(null);
    this.startSubmitting.set(false);
    this.startError.set(null);
  }

  onWorkStarted(updated: WorkOrder): void {
    const orden: WorkOrder = {
      ...updated,
      estado: 'en_proceso',
      fechaInicioReal:
        updated.fechaInicioReal ?? new Date().toISOString(),
    };
    this.ordersRequestId++;
    // #region agent log
    this.agentDebug.log(
      'tecnico-dashboard.component.ts:onWorkStarted',
      'started event received',
      {
        id: orden.id,
        codigo: orden.codigoOt,
        estado: orden.estado,
        fechaInicio: orden.fechaInicioReal,
        requestId: this.ordersRequestId,
      },
      'E',
    );
    // #endregion
    this.patchOrder(orden);
    this.startTarget.set(null);
    this.toast.success(`Trabajo iniciado — ${orden.codigoOt}`);
    this.loadOrders({ silent: true });
    this.tecnicoUi.focusOrder(orden.id);
  }

  openCloseModal(orden: WorkOrder): void {
    this.closeTarget.set(orden);
  }

  onCloseSubmitted(): void {
    this.closeTarget.set(null);
    this.toast.success(
      'Cierre enviado. El jefe de operaciones debe aprobar la OT.',
    );
    this.loadOrders();
  }

  onOrdenNoDisponible(): void {
    this.startTarget.set(null);
    this.closeTarget.set(null);
    this.loadOrders();
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
    this.tecnicoUi.openAssetSheet(token);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { scan: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
