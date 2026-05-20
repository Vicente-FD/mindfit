import { Component, inject, output, signal } from '@angular/core';
import { NgxScannerQrcodeComponent, ScannerQRCodeResult } from 'ngx-scanner-qrcode';
import { AssetsService } from '../../core/services/assets.service';
import { WorkOrdersService } from '../../core/services/work-orders.service';
import { TecnicoUiService } from '../../core/services/tecnico-ui.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { WorkOrder, WorkOrderStatus } from '../../core/models/work-order.model';

const ACTIVE: WorkOrderStatus[] = ['pendiente', 'asignada', 'en_proceso'];

@Component({
  selector: 'app-qr-scanner-modal',
  imports: [NgxScannerQrcodeComponent],
  templateUrl: './qr-scanner-modal.component.html',
  styleUrl: './qr-scanner-modal.component.css',
})
export class QrScannerModalComponent {
  private readonly assets = inject(AssetsService);
  private readonly workOrders = inject(WorkOrdersService);
  private readonly tecnicoUi = inject(TecnicoUiService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  readonly closed = output<void>();
  readonly processing = signal(false);
  private lastToken: string | null = null;

  onScan(results: ScannerQRCodeResult[]): void {
    if (this.processing()) return;

    const raw = results?.[0]?.decode?.();
    if (!raw || raw === this.lastToken) return;

    this.lastToken = raw;
    this.processing.set(true);

    this.assets.getPublicByIdentifier(raw.trim()).subscribe({
      next: (activo) => {
        this.workOrders.getMisAsignadas().subscribe({
          next: (orders) => {
            this.processing.set(false);
            const userId = this.auth.getUser()?.id;
            const match = orders.find(
              (o) =>
                o.activoId === activo.id &&
                o.asignadoAId === userId &&
                ACTIVE.includes(o.estado),
            );

            this.closed.emit();

            if (match) {
              this.tecnicoUi.showQrAlert({
                activoNombre: activo.nombre,
                orden: match,
              });
              this.toast.success('OT activa encontrada para este activo');
            } else {
              this.toast.info(
                `Activo "${activo.nombre}" sin OT activa asignada a ti`,
              );
            }
          },
          error: () => {
            this.processing.set(false);
            this.toast.error('No se pudieron consultar tus órdenes');
          },
        });
      },
      error: () => {
        this.processing.set(false);
        this.toast.error('Código QR no reconocido en el sistema');
      },
    });
  }

  close(): void {
    this.closed.emit();
  }
}
