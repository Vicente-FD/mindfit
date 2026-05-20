import { Component, input, output } from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { Activo } from '../../core/services/activos.service';

@Component({
  selector: 'app-qr-label-modal',
  imports: [QRCodeComponent],
  templateUrl: './qr-label-modal.component.html',
  styleUrl: './qr-label-modal.component.css',
})
export class QrLabelModalComponent {
  readonly activo = input.required<Activo>();
  readonly closed = output<void>();

  scanUrl(activo: Activo): string {
    const token = activo.codigoQrToken || activo.codigoInventario;
    return `${window.location.origin}/dashboard/tecnico?scan=${encodeURIComponent(token)}`;
  }

  print(): void {
    window.print();
  }

  close(): void {
    this.closed.emit();
  }
}
