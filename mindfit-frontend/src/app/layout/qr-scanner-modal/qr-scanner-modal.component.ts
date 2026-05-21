import { Component, inject, input, output, signal } from '@angular/core';
import { NgxScannerQrcodeComponent, ScannerQRCodeResult } from 'ngx-scanner-qrcode';
import { TecnicoUiService } from '../../core/services/tecnico-ui.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-qr-scanner-modal',
  imports: [NgxScannerQrcodeComponent],
  templateUrl: './qr-scanner-modal.component.html',
  styleUrl: './qr-scanner-modal.component.css',
})
export class QrScannerModalComponent {
  private readonly tecnicoUi = inject(TecnicoUiService);
  private readonly toast = inject(ToastService);

  /** `tecnico`: abre ficha técnico; `emit`: devuelve identificador al padre */
  readonly mode = input<'tecnico' | 'emit'>('tecnico');
  readonly closed = output<void>();
  readonly scanned = output<string>();
  readonly processing = signal(false);
  private lastToken: string | null = null;

  onScan(results: ScannerQRCodeResult[]): void {
    if (this.processing()) return;

    const raw = results?.[0]?.decode?.();
    if (!raw || raw === this.lastToken) return;

    this.lastToken = raw;
    this.processing.set(true);

    const token = raw.trim();
    if (this.mode() === 'emit') {
      this.scanned.emit(token);
      this.toast.success('Código QR leído');
    } else {
      this.tecnicoUi.openAssetSheet(token);
      this.toast.success('Ficha del activo cargada');
    }
    this.processing.set(false);
    this.closed.emit();
  }

  close(): void {
    this.closed.emit();
  }
}
