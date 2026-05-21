import {
  Component,
  inject,
  input,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';
import html2canvas from 'html2canvas';
import { Activo } from '../../core/services/activos.service';
import { ToastService } from '../../core/services/toast.service';

const PRINT_CLONE_ID = 'printable-qr-card-print';

@Component({
  selector: 'app-qr-label-modal',
  imports: [QRCodeComponent],
  templateUrl: './qr-label-modal.component.html',
  styleUrl: './qr-label-modal.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class QrLabelModalComponent {
  private readonly toast = inject(ToastService);

  readonly activo = input.required<Activo>();
  readonly closed = output<void>();
  readonly downloading = signal(false);

  scanUrl(activo: Activo): string {
    const token = activo.codigoQrToken || activo.codigoInventario;
    return `${window.location.origin}/dashboard/tecnico?scan=${encodeURIComponent(token)}`;
  }

  codigoEtiqueta(activo: Activo): string {
    const raw =
      activo.codigoInventario || activo.codigoQrToken || `activo-${activo.id}`;
    return raw.replace(/[^a-zA-Z0-9._-]+/g, '-');
  }

  async descargarComoImagen(): Promise<void> {
    const el = document.getElementById('printable-qr-card');
    if (!el) {
      this.toast.error('No se encontró la etiqueta para exportar');
      return;
    }

    this.downloading.set(true);
    try {
      await new Promise((r) => requestAnimationFrame(() => r(undefined)));

      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#1a1a1c',
        logging: false,
      });

      const codigo = this.codigoEtiqueta(this.activo());
      const link = document.createElement('a');
      link.download = `${codigo}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      this.toast.success(`Etiqueta descargada (${codigo}.png)`);
    } catch {
      this.toast.error('No se pudo generar la imagen de la etiqueta');
    } finally {
      this.downloading.set(false);
    }
  }

  print(): void {
    const source = document.getElementById('printable-qr-card');
    if (!source) {
      window.print();
      return;
    }

    const existing = document.getElementById(PRINT_CLONE_ID);
    existing?.remove();

    const clone = source.cloneNode(true) as HTMLElement;
    clone.id = PRINT_CLONE_ID;
    document.body.appendChild(clone);

    const cleanup = () => {
      document.getElementById(PRINT_CLONE_ID)?.remove();
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);

    requestAnimationFrame(() => window.print());
  }

  close(): void {
    document.getElementById(PRINT_CLONE_ID)?.remove();
    this.closed.emit();
  }
}
