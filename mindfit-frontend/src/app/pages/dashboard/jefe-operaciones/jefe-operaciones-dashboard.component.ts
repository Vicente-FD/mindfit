import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { interval, startWith } from 'rxjs';
import { WorkOrdersService } from '../../../core/services/work-orders.service';
import { SucursalesService } from '../../../core/services/sucursales.service';
import { ActivosService } from '../../../core/services/activos.service';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { OtPdfReportService } from '../../../core/services/ot-pdf-report.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  ClasificacionOt,
  OrdenesTab,
  REVERTIR_APROBACION_MS,
  WorkOrder,
  WorkOrderStatus,
} from '../../../core/models/work-order.model';
import { resolveMediaUrl } from '../../../core/utils/media-url';
import { Usuario } from '../../../core/models/usuario.model';
import { Sucursal } from '../../../core/models/sucursal.model';
import { Activo } from '../../../core/services/activos.service';
import { PRIORIDADES_OT } from '../../../core/models/analytics.model';
import { formatDateTimeChile } from '../../../core/utils/date-format';
import { LucideAngularModule } from 'lucide-angular';
import { DeleteOtConfirmModalComponent } from '../../../shared/delete-ot-confirm-modal/delete-ot-confirm-modal.component';
import { EditOtModalComponent } from '../../../shared/edit-ot-modal/edit-ot-modal.component';
import { OtReportModalComponent } from '../../../shared/ot-report-modal/ot-report-modal.component';
import { RejectOtModalComponent } from '../../../shared/reject-ot-modal/reject-ot-modal.component';

@Component({
  selector: 'app-jefe-operaciones-dashboard',
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
    DeleteOtConfirmModalComponent,
    EditOtModalComponent,
    OtReportModalComponent,
    RejectOtModalComponent,
  ],
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
  private readonly pdfReport = inject(OtPdfReportService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly prioridades = PRIORIDADES_OT;
  readonly ordenes = signal<WorkOrder[]>([]);
  readonly sucursales = signal<Sucursal[]>([]);
  readonly activos = signal<Activo[]>([]);
  readonly tecnicos = signal<Usuario[]>([]);
  readonly kpis = signal<{ efectividadPe: number; otsReportadas: number } | null>(
    null,
  );
  readonly activeTab = signal<OrdenesTab>('activas');
  readonly loadingOrdenes = signal(false);
  readonly showCreateForm = signal(false);
  readonly showReportModal = signal(false);
  readonly generatingPdf = signal(false);
  readonly clasificacionTipo = signal<ClasificacionOt>('maquina');
  readonly sucursalFormId = signal('');
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly deleteTarget = signal<WorkOrder | null>(null);
  readonly editTarget = signal<WorkOrder | null>(null);
  readonly rejectTarget = signal<WorkOrder | null>(null);
  readonly approvingId = signal<number | null>(null);
  readonly rejecting = signal(false);
  readonly revertingId = signal<number | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly now = signal(Date.now());

  readonly isHistorico = computed(() => this.activeTab() === 'historico');
  readonly isPorAprobar = computed(() => this.activeTab() === 'por_aprobar');
  readonly isActivas = computed(() => this.activeTab() === 'activas');

  readonly activosFiltrados = computed(() => {
    const sid = this.sucursalFormId();
    if (!sid) return [];
    const id = Number(sid);
    return this.activos().filter((a) => a.sucursalId === id);
  });

  readonly otForm = this.fb.nonNullable.group({
    titulo: ['', Validators.required],
    descripcion: [''],
    sucursalId: ['', Validators.required],
    activoId: ['', Validators.required],
    prioridad: ['media' as const],
    asignadoAId: [''],
  });

  ngOnInit(): void {
    interval(1000)
      .pipe(startWith(0), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.now.set(Date.now()));

    this.reload();
    this.sucursalesService.list().subscribe({ next: (s) => this.sucursales.set(s) });
    this.usuariosService.list().subscribe({
      next: (u) =>
        this.tecnicos.set(u.filter((x) => x.rol === 'tecnico' && x.estaActivo)),
    });
    this.analytics.getKpis().subscribe({
      next: (k) =>
        this.kpis.set({
          efectividadPe: k.efectividadPe,
          otsReportadas: k.otsReportadas,
        }),
    });

    this.otForm
      .get('sucursalId')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v) => {
        this.sucursalFormId.set(v);
        this.otForm.patchValue({ activoId: '' }, { emitEvent: false });
      });
  }

  switchTab(tab: OrdenesTab): void {
    if (this.activeTab() === tab) return;
    this.activeTab.set(tab);
    this.reload();
  }

  toggleCreateForm(): void {
    this.showCreateForm.update((v) => !v);
  }

  openReportModal(): void {
    this.showReportModal.set(true);
  }

  closeReportModal(): void {
    this.showReportModal.set(false);
  }

  onGenerateReport(payload: {
    fechaInicio: string;
    fechaFin: string;
    sucursalId: number | null;
  }): void {
    this.generatingPdf.set(true);
    this.workOrders
      .listAll({
        fechaInicio: payload.fechaInicio,
        fechaFin: payload.fechaFin,
        sucursalId: payload.sucursalId ?? undefined,
      })
      .subscribe({
        next: async (ordenes) => {
          try {
            const sucursalLabel = payload.sucursalId
              ? (this.sucursales().find((s) => s.id === payload.sucursalId)
                  ?.nombre ?? 'Sucursal')
              : 'Todas las sucursales';
            await this.pdfReport.downloadPdf(ordenes, {
              fechaInicio: payload.fechaInicio,
              fechaFin: payload.fechaFin,
              sucursalLabel,
            });
            this.toast.success('Reporte PDF generado correctamente');
            this.closeReportModal();
          } catch {
            this.toast.error('No se pudo generar el PDF');
          } finally {
            this.generatingPdf.set(false);
          }
        },
        error: () => {
          this.generatingPdf.set(false);
          this.toast.error('Error al obtener datos para el reporte');
        },
      });
  }

  setClasificacion(tipo: ClasificacionOt): void {
    this.clasificacionTipo.set(tipo);
    const activoCtrl = this.otForm.controls.activoId;
    if (tipo === 'infraestructura') {
      activoCtrl.clearValidators();
      activoCtrl.setValue('');
    } else {
      activoCtrl.setValidators(Validators.required);
    }
    activoCtrl.updateValueAndValidity();
  }

  private estadoFiltroTab(): 'activas' | 'por_aprobar' | 'finalizadas' {
    const tab = this.activeTab();
    if (tab === 'historico') return 'finalizadas';
    if (tab === 'por_aprobar') return 'por_aprobar';
    return 'activas';
  }

  reload(): void {
    this.loadingOrdenes.set(true);
    this.workOrders.listAll({ estado: this.estadoFiltroTab() }).subscribe({
      next: (o) => {
        this.ordenes.set(o);
        this.loadingOrdenes.set(false);
      },
      error: () => {
        this.loadingOrdenes.set(false);
        this.toast.error('Error al cargar órdenes de trabajo');
      },
    });
    if (this.isActivas()) {
      this.activosService.list().subscribe({ next: (a) => this.activos.set(a) });
    }
  }

  canModificarOrden(orden: WorkOrder): boolean {
    return orden.estado !== 'finalizada' && orden.estado !== 'aprobada';
  }

  evidenciaAntes(orden: WorkOrder): string | null {
    const e = orden.evidencias?.find((x) => x.tipoEvidencia === 'antes');
    return e ? resolveMediaUrl(e.urlImagen) : null;
  }

  evidenciaDespues(orden: WorkOrder): string | null {
    const e = orden.evidencias?.find((x) => x.tipoEvidencia === 'despues');
    return e ? resolveMediaUrl(e.urlImagen) : null;
  }

  openPreview(url: string): void {
    this.previewUrl.set(url);
  }

  closePreview(): void {
    this.previewUrl.set(null);
  }

  puedeRevertirAprobacion(orden: WorkOrder): boolean {
    if (orden.estado !== 'aprobada' || !orden.fechaAprobacion) return false;
    const elapsed =
      this.now() - new Date(orden.fechaAprobacion).getTime();
    return elapsed >= 0 && elapsed < REVERTIR_APROBACION_MS;
  }

  segundosRestantesRevertir(orden: WorkOrder): number {
    if (!orden.fechaAprobacion) return 0;
    const restante =
      REVERTIR_APROBACION_MS -
      (this.now() - new Date(orden.fechaAprobacion).getTime());
    return Math.max(0, Math.ceil(restante / 1000));
  }

  revertirAprobacion(orden: WorkOrder): void {
    if (!this.puedeRevertirAprobacion(orden)) {
      this.toast.error('El plazo de 2 minutos para revertir ha expirado');
      return;
    }
    this.revertingId.set(orden.id);
    this.workOrders.revertirAprobacion(orden.id).subscribe({
      next: () => {
        this.revertingId.set(null);
        this.toast.success(
          `${orden.codigoOt} devuelta a Por Aprobar — puede revisar de nuevo`,
        );
        this.activeTab.set('por_aprobar');
        this.reload();
      },
      error: (err) => {
        this.revertingId.set(null);
        const msg = err?.error?.message ?? 'No se pudo revertir la aprobación';
        this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
      },
    });
  }

  aprobarOrden(orden: WorkOrder): void {
    this.approvingId.set(orden.id);
    this.workOrders.aprobar(orden.id).subscribe({
      next: () => {
        this.approvingId.set(null);
        this.toast.success(
          `${orden.codigoOt} aprobada — histórico (2 min para revertir si fue un error)`,
        );
        this.reload();
      },
      error: (err) => {
        this.approvingId.set(null);
        const msg = err?.error?.message ?? 'No se pudo aprobar la orden';
        this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
      },
    });
  }

  openReject(orden: WorkOrder): void {
    this.rejectTarget.set(orden);
  }

  closeReject(): void {
    this.rejectTarget.set(null);
  }

  confirmReject(motivo: string): void {
    const orden = this.rejectTarget();
    if (!orden) return;
    this.rejecting.set(true);
    this.workOrders.rechazar(orden.id, motivo).subscribe({
      next: () => {
        this.rejecting.set(false);
        this.rejectTarget.set(null);
        this.toast.success(
          `${orden.codigoOt} rechazada — devuelta al técnico en órdenes activas`,
        );
        this.activeTab.set('activas');
        this.reload();
      },
      error: (err) => {
        this.rejecting.set(false);
        const msg = err?.error?.message ?? 'No se pudo rechazar la orden';
        this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
      },
    });
  }

  ultimoComentarioTecnico(orden: WorkOrder): string | null {
    const list = orden.comentarios ?? [];
    if (!list.length) return null;
    const sorted = [...list].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return sorted[0]?.comentario ?? null;
  }

  crearOt(): void {
    if (this.otForm.invalid) {
      this.otForm.markAllAsTouched();
      return;
    }
    const v = this.otForm.getRawValue();
    const clasificacion = this.clasificacionTipo();
    this.saving.set(true);

    this.workOrders
      .create({
        titulo: v.titulo,
        descripcion: v.descripcion || undefined,
        sucursalId: Number(v.sucursalId),
        clasificacion,
        activoId:
          clasificacion === 'maquina' && v.activoId
            ? Number(v.activoId)
            : undefined,
        prioridad: v.prioridad,
        tipoMantenimiento: 'correctivo',
      })
      .subscribe({
        next: (orden) => {
          const tecnicoId = v.asignadoAId ? Number(v.asignadoAId) : null;
          const finish = () => {
            this.saving.set(false);
            this.showCreateForm.set(false);
            this.resetForm();
            this.activeTab.set('activas');
            this.reload();
          };

          if (tecnicoId) {
            this.workOrders.asignar(orden.id, tecnicoId).subscribe({
              next: () => {
                this.toast.success('OT creada y asignada');
                finish();
              },
              error: () => {
                this.saving.set(false);
                this.toast.error('OT creada, pero falló la asignación del técnico');
                this.reload();
              },
            });
          } else {
            this.toast.success('OT creada');
            finish();
          }
        },
        error: (err) => {
          this.saving.set(false);
          const msg = err?.error?.message ?? 'Error al crear OT';
          this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
        },
      });
  }

  private resetForm(): void {
    this.clasificacionTipo.set('maquina');
    this.setClasificacion('maquina');
    this.otForm.reset({
      titulo: '',
      descripcion: '',
      sucursalId: '',
      activoId: '',
      prioridad: 'media',
      asignadoAId: '',
    });
    this.sucursalFormId.set('');
  }

  asignar(orden: WorkOrder, tecnicoId: string): void {
    if (!tecnicoId) {
      this.toast.error('Seleccione un técnico');
      return;
    }
    this.workOrders.asignar(orden.id, Number(tecnicoId)).subscribe({
      next: () => {
        this.toast.success('Técnico asignado');
        this.reload();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Error al asignar';
        this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
      },
    });
  }

  puedeAsignar(orden: WorkOrder): boolean {
    if (this.isHistorico()) return false;
    if (this.tecnicoNombre(orden)) return false;
    return orden.estado === 'pendiente' || orden.estado === 'asignada';
  }

  muestraEjecutado(orden: WorkOrder): boolean {
    return (
      !!orden.fechaFinReal &&
      (orden.estado === 'finalizada' || orden.estado === 'aprobada')
    );
  }

  formatFecha(iso: string | null | undefined): string {
    return formatDateTimeChile(iso);
  }

  tecnicoNombre(orden: WorkOrder): string | null {
    return (
      orden.asignadoA?.nombre ??
      orden.tecnicoAsignado?.nombre ??
      null
    );
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

  estadoLabel(estado: WorkOrderStatus): string {
    if (this.isPorAprobar() && estado === 'finalizada') {
      return 'Pendiente aprobación';
    }
    const map: Record<WorkOrderStatus, string> = {
      pendiente: 'Pendiente',
      asignada: 'Asignada',
      en_proceso: 'En proceso',
      finalizada: 'Finalizada',
      aprobada: 'Aprobada',
    };
    return map[estado] ?? estado;
  }

  estadoBadgeClass(estado: WorkOrderStatus): string {
    return `estado-badge estado-${estado}`;
  }

  prioridadClass(prioridad: WorkOrder['prioridad']): string {
    if (prioridad === 'alta') return 'priority-alta';
    if (prioridad === 'media') return 'priority-media';
    return 'priority-baja';
  }

  prioridadLabel(prioridad: WorkOrder['prioridad']): string {
    const map = { alta: 'Alta', media: 'Media', baja: 'Baja' } as const;
    return map[prioridad];
  }

  esInfraestructura(orden: WorkOrder): boolean {
    return orden.clasificacion === 'infraestructura';
  }

  openEdit(orden: WorkOrder): void {
    if (!this.canModificarOrden(orden)) {
      this.toast.error('No se puede editar una orden finalizada o aprobada');
      return;
    }
    this.editTarget.set(orden);
  }

  closeEdit(): void {
    this.editTarget.set(null);
  }

  onEditSaved(): void {
    this.reload();
  }

  openDelete(orden: WorkOrder): void {
    if (!this.canModificarOrden(orden)) {
      this.toast.error('No se puede eliminar una orden finalizada o aprobada');
      return;
    }
    this.deleteTarget.set(orden);
  }

  closeDelete(): void {
    this.deleteTarget.set(null);
  }

  confirmDelete(): void {
    const orden = this.deleteTarget();
    if (!orden) return;
    this.deleting.set(true);
    this.workOrders.remove(orden.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteTarget.set(null);
        this.toast.success('Orden de trabajo eliminada');
        this.reload();
      },
      error: (err) => {
        this.deleting.set(false);
        const msg = err?.error?.message ?? 'Error al eliminar OT';
        this.toast.error(Array.isArray(msg) ? msg.join(', ') : String(msg));
      },
    });
  }
}
