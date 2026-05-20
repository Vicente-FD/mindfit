import { Injectable, signal } from '@angular/core';
import { WorkOrder } from '../models/work-order.model';

export interface QrScanAlert {
  activoNombre: string;
  orden: WorkOrder;
}

@Injectable({ providedIn: 'root' })
export class TecnicoUiService {
  readonly highlightOrderId = signal<number | null>(null);
  readonly qrAlert = signal<QrScanAlert | null>(null);
  readonly assetSheetToken = signal<string | null>(null);
  readonly pendingStartOrder = signal<WorkOrder | null>(null);
  readonly pendingCloseOrder = signal<WorkOrder | null>(null);

  focusOrder(orderId: number): void {
    this.highlightOrderId.set(orderId);
    requestAnimationFrame(() => {
      const el = document.getElementById(`ot-card-${orderId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  showQrAlert(alert: QrScanAlert): void {
    this.qrAlert.set(alert);
    this.focusOrder(alert.orden.id);
  }

  clearQrAlert(): void {
    this.qrAlert.set(null);
  }

  openAssetSheet(identifier: string): void {
    this.assetSheetToken.set(identifier.trim());
    this.clearQrAlert();
  }

  closeAssetSheet(): void {
    this.assetSheetToken.set(null);
  }

  queueStart(orden: WorkOrder): void {
    this.pendingStartOrder.set(orden);
    this.focusOrder(orden.id);
  }

  queueClose(orden: WorkOrder): void {
    this.pendingCloseOrder.set(orden);
    this.focusOrder(orden.id);
  }

  clearHighlight(): void {
    this.highlightOrderId.set(null);
  }
}
