import { DatePipe } from '@angular/common';
import { Component, effect, inject, input, output, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ActivosService } from '../../core/services/activos.service';
import { ToastService } from '../../core/services/toast.service';
import { ActivoHistorialItem } from '../../core/models/activo-historial.model';
import { resolveMediaUrl } from '../../core/utils/media-url';

const PRIORIDAD_LABEL: Record<string, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
};

@Component({
  selector: 'app-asset-history-modal',
  imports: [LucideAngularModule, DatePipe],
  templateUrl: './asset-history-modal.component.html',
  styleUrl: './asset-history-modal.component.css',
})
export class AssetHistoryModalComponent {
  private readonly activosService = inject(ActivosService);
  private readonly toast = inject(ToastService);

  readonly activoId = input.required<number>();
  readonly activoNombre = input<string>('');
  readonly closed = output<void>();

  readonly items = signal<ActivoHistorialItem[]>([]);
  readonly loading = signal(true);
  readonly previewUrl = signal<string | null>(null);

  constructor() {
    effect(() => {
      const id = this.activoId();
      this.loading.set(true);
      this.activosService.getHistorial(id).subscribe({
        next: (data) => {
          this.items.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.toast.error('Error al cargar historial de reparaciones');
        },
      });
    });
  }

  close(): void {
    this.closed.emit();
  }

  prioridadLabel(p: string): string {
    return PRIORIDAD_LABEL[p] ?? p;
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

  duracionTexto(item: ActivoHistorialItem): string | null {
    if (!item.duracionLabel) return null;
    return `Duración de reparación: ${item.duracionLabel}`;
  }

  openPreview(url: string): void {
    this.previewUrl.set(url);
  }

  closePreview(): void {
    this.previewUrl.set(null);
  }
}
