import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ImageCompressorService } from '../../core/services/image-compressor.service';
import { WorkOrdersService } from '../../core/services/work-orders.service';
import { ToastService } from '../../core/services/toast.service';
import { WorkOrder } from '../../core/models/work-order.model';

@Component({
  selector: 'app-close-ot-modal',
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './close-ot-modal.component.html',
  styleUrl: './close-ot-modal.component.css',
})
export class CloseOtModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly workOrders = inject(WorkOrdersService);
  private readonly compressor = inject(ImageCompressorService);
  private readonly toast = inject(ToastService);

  readonly orden = input.required<WorkOrder>();
  readonly closed = output<void>();
  readonly submitted = output<void>();
  readonly ordenNoDisponible = output<void>();

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly previewDespues = signal<string | null>(null);

  private fileDespues: File | null = null;

  readonly form = this.fb.nonNullable.group({
    comentario: ['', [Validators.required, Validators.minLength(3)]],
  });

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const compressed = await this.compressor.compress(file);
      this.revokePreview(this.previewDespues());
      this.fileDespues = compressed;
      this.previewDespues.set(URL.createObjectURL(compressed));
      this.error.set(null);
    } catch {
      this.error.set('No se pudo procesar la imagen seleccionada');
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.fileDespues) {
      this.error.set('Debes adjuntar la foto del estado final (Después)');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.workOrders
      .cerrarOrden(this.orden().id, {
        comentario: this.form.controls.comentario.value,
        fotoDespues: this.fileDespues,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.toast.success('Orden cerrada correctamente. Evidencias enviadas.');
          this.submitted.emit();
          this.close();
        },
        error: (err) => {
          this.loading.set(false);
          if (err?.status === 404) {
            this.toast.error('Esta orden ya no está disponible (fue eliminada)');
            this.ordenNoDisponible.emit();
            this.close();
            return;
          }
          const msg =
            err?.error?.message ??
            'No se pudo cerrar la orden. Intenta nuevamente.';
          const text = Array.isArray(msg) ? msg.join(', ') : String(msg);
          this.error.set(text);
          this.toast.error(text);
        },
      });
  }

  close(): void {
    this.revokePreview(this.previewDespues());
    this.closed.emit();
  }

  private revokePreview(url: string | null): void {
    if (url) URL.revokeObjectURL(url);
  }
}
