import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { AssetsService } from '../../core/services/assets.service';
import { AuthService } from '../../core/services/auth.service';
import { WorkOrdersService } from '../../core/services/work-orders.service';
import { ToastService } from '../../core/services/toast.service';
import { ActivoFicha } from '../../core/models/asset-ficha.model';
import { ActivoHistorialItem } from '../../core/models/activo-historial.model';
import {
  WorkOrder,
  WorkOrderStatus,
} from '../../core/models/work-order.model';
import { resolveMediaUrl } from '../../core/utils/media-url';

const ACTIVE: WorkOrderStatus[] = ['pendiente', 'asignada', 'en_proceso'];

@Component({
  selector: 'app-asset-details-sheet',
  imports: [LucideAngularModule, DatePipe],
  templateUrl: './asset-details-sheet.component.html',
  styleUrl: './asset-details-sheet.component.css',
})
export class AssetDetailsSheetComponent {
  private readonly assets = inject(AssetsService);
  private readonly workOrders = inject(WorkOrdersService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly identifier = input.required<string>();
  readonly closed = output<void>();
  readonly startWork = output<WorkOrder>();
  readonly requestClose = output<WorkOrder>();
  readonly viewTask = output<WorkOrder>();

  readonly ficha = signal<ActivoFicha | null>(null);
  readonly myOrders = signal<WorkOrder[]>([]);
  readonly loading = signal(true);
  readonly previewUrl = signal<string | null>(null);

  readonly miOrdenActiva = computed(() => {
    const f = this.ficha();
    const uid = this.auth.getUser()?.id;
    if (!f || !uid) return null;
    return (
      this.myOrders().find(
        (o) =>
          o.activoId === f.activo.id &&
          o.asignadoAId === uid &&
          ACTIVE.includes(o.estado),
      ) ?? null
    );
  });

  readonly estadoOperativoLabel = computed(() => {
    const f = this.ficha();
    if (!f) return '';
    const map: Record<string, string> = {
      operativo: 'Operativo',
      fuera_servicio: 'Fuera de servicio',
      mantenimiento_preventivo: 'Mantenimiento preventivo',
    };
    return map[f.activo.estadoOperacional] ?? f.activo.estadoOperacional;
  });

  constructor() {
    effect(() => {
      const token = this.identifier();
      this.loading.set(true);
      this.assets.getFicha(token).subscribe({
        next: (data) => {
          this.ficha.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.toast.error('No se pudo cargar la ficha del activo');
          this.close();
        },
      });
      this.workOrders.getMisAsignadas().subscribe({
        next: (orders) => this.myOrders.set(orders),
      });
    });
  }

  close(): void {
    this.closed.emit();
  }

  mediaUrl(path: string): string {
    return resolveMediaUrl(path);
  }

  evidenciaAntes(item: ActivoHistorialItem): string | null {
    const e = item.evidencias.find((x) => x.tipoEvidencia === 'antes');
    return e ? this.mediaUrl(e.urlImagen) : null;
  }

  evidenciaDespues(item: ActivoHistorialItem): string | null {
    const e = item.evidencias.find((x) => x.tipoEvidencia === 'despues');
    return e ? this.mediaUrl(e.urlImagen) : null;
  }

  openPreview(url: string): void {
    this.previewUrl.set(url);
  }

  closePreview(): void {
    this.previewUrl.set(null);
  }

  onPrimaryAction(): void {
    const orden = this.miOrdenActiva();
    if (!orden) return;
    if (orden.estado === 'en_proceso') {
      this.requestClose.emit(orden);
    } else {
      this.startWork.emit(orden);
    }
    this.close();
  }

  verTarea(): void {
    const orden = this.miOrdenActiva();
    if (orden) {
      this.viewTask.emit(orden);
      this.close();
    }
  }
}
