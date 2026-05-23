import {
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { MindfitDatePickerComponent } from '../../../common/components/date-picker/date-picker.component';
import { WorkOrdersService } from '../../../core/services/work-orders.service';
import { SucursalesService } from '../../../core/services/sucursales.service';
import { ToastService } from '../../../core/services/toast.service';
import { OtCalendarExportService } from '../../../core/services/ot-calendar-export.service';
import { Sucursal } from '../../../core/models/sucursal.model';
import {
  CalendarDayEntry,
  activoResumenOt,
  buildCalendarGrid,
  currentMesKey,
  mesLabelFromKey,
  PRIORIDAD_OT_LABEL,
  tecnicoResumenOt,
} from '../../../core/utils/ot-day-label.util';
import { WorkOrder } from '../../../core/models/work-order.model';

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

@Component({
  selector: 'app-weekly-tracker-calendar',
  imports: [FormsModule, LucideAngularModule, MindfitDatePickerComponent],
  templateUrl: './weekly-tracker-calendar.component.html',
  styleUrl: './weekly-tracker-calendar.component.css',
})
export class WeeklyTrackerCalendarComponent implements OnInit {
  private readonly workOrders = inject(WorkOrdersService);
  private readonly sucursalesService = inject(SucursalesService);
  private readonly toast = inject(ToastService);
  private readonly exportService = inject(OtCalendarExportService);

  readonly calendarView = viewChild<ElementRef<HTMLElement>>('calendarView');

  readonly mesFiltro = signal(currentMesKey());
  readonly sucursalFiltro = signal<number | ''>('');
  readonly loading = signal(false);
  readonly exportingPdf = signal(false);
  readonly exportingExcel = signal(false);
  readonly ordenes = signal<WorkOrder[]>([]);
  readonly sucursales = signal<Sucursal[]>([]);
  readonly selectedEntry = signal<CalendarDayEntry | null>(null);

  readonly weekdayLabels = WEEKDAY_LABELS;

  readonly mesLabel = computed(() => mesLabelFromKey(this.mesFiltro()));

  readonly sucursalLabel = computed(() => {
    const id = this.sucursalFiltro();
    if (id === '') return 'Todas las sedes';
    return this.sucursales().find((s) => s.id === id)?.nombre ?? '—';
  });

  readonly calendarCells = computed(() =>
    buildCalendarGrid(this.mesFiltro(), this.ordenes()),
  );

  readonly totalOrdenes = computed(() => this.ordenes().length);

  ngOnInit(): void {
    this.loadSucursales();
    this.loadCalendario();
  }

  onMesChange(mes: string | null): void {
    if (!mes) return;
    this.mesFiltro.set(mes);
    this.loadCalendario();
  }

  onSucursalChange(value: number | ''): void {
    this.sucursalFiltro.set(value);
    this.loadCalendario();
  }

  openDetail(entry: CalendarDayEntry): void {
    this.selectedEntry.set(entry);
  }

  closeDetail(): void {
    this.selectedEntry.set(null);
  }

  badgeClass(label: CalendarDayEntry['label']): string {
    switch (label) {
      case 'reportado_finalizado':
      case 'reportado':
        return 'ot-badge ot-badge--reportado';
      case 'finalizado':
        return 'ot-badge ot-badge--finalizado';
      case 'trabajando':
        return 'ot-badge ot-badge--trabajando';
    }
  }

  badgeIcon(label: CalendarDayEntry['label']): string {
    switch (label) {
      case 'reportado_finalizado':
        return 'zap';
      case 'reportado':
        return 'flag';
      case 'finalizado':
        return 'check-circle-2';
      case 'trabajando':
        return 'wrench';
    }
  }

  activoLabel(ot: WorkOrder): string {
    return activoResumenOt(ot);
  }

  tecnicoLabel(ot: WorkOrder): string {
    return tecnicoResumenOt(ot);
  }

  prioridadLabel(ot: WorkOrder): string {
    return PRIORIDAD_OT_LABEL[ot.prioridad] ?? ot.prioridad;
  }

  prioridadClass(ot: WorkOrder): string {
    return `prioridad prioridad--${ot.prioridad}`;
  }

  async exportarPdf(): Promise<void> {
    const el = this.calendarView()?.nativeElement;
    if (!el) return;
    this.exportingPdf.set(true);
    try {
      await this.exportService.exportPdf(el, this.mesFiltro());
    } catch {
      this.toast.error('No se pudo generar el PDF del calendario');
    } finally {
      this.exportingPdf.set(false);
    }
  }

  exportarExcel(): void {
    if (!this.ordenes().length) {
      this.toast.error('No hay OTs para exportar en este mes');
      return;
    }
    this.exportingExcel.set(true);
    try {
      this.exportService.exportPlanilla(this.ordenes(), this.mesFiltro());
    } finally {
      this.exportingExcel.set(false);
    }
  }

  private loadSucursales(): void {
    this.sucursalesService.list().subscribe({
      next: (items) => this.sucursales.set(items),
      error: () => this.toast.error('No se pudieron cargar las sucursales'),
    });
  }

  private loadCalendario(): void {
    this.loading.set(true);
    const sucursalId = this.sucursalFiltro();
    this.workOrders
      .getCalendario({
        mes: this.mesFiltro(),
        sucursalId: sucursalId === '' ? undefined : sucursalId,
      })
      .subscribe({
        next: (res) => {
          this.ordenes.set(res.ordenes);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.toast.error('No se pudo cargar el calendario de OTs');
        },
      });
  }
}
