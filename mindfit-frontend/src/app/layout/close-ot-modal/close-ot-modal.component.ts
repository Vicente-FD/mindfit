import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ImageCompressorService } from '../../core/services/image-compressor.service';
import { InventarioService } from '../../core/services/inventario.service';
import { WorkOrdersService } from '../../core/services/work-orders.service';
import { ToastService } from '../../core/services/toast.service';
import { RepuestoDisponible } from '../../core/models/inventario.model';
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
  private readonly inventario = inject(InventarioService);
  private readonly compressor = inject(ImageCompressorService);
  private readonly toast = inject(ToastService);

  readonly orden = input.required<WorkOrder>();
  readonly closed = output<void>();
  readonly submitted = output<void>();
  readonly ordenNoDisponible = output<void>();

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly previewDespues = signal<string | null>(null);
  readonly catalogo = signal<RepuestoDisponible[]>([]);
  readonly loadingCatalogo = signal(false);

  private fileDespues: File | null = null;
  /** Evita reiniciar el formulario al cambiar la preview u otras señales. */
  private initializedForOrdenId: number | null = null;

  readonly form = this.fb.nonNullable.group({
    comentario: ['', [Validators.required, Validators.minLength(3)]],
    repuestos: this.fb.array([]),
  });

  constructor() {
    effect(() => {
      const ordenId = this.orden().id;
      if (ordenId === this.initializedForOrdenId) return;

      untracked(() => {
        this.initializedForOrdenId = ordenId;
        this.resetFormState();
        this.loadCatalogo();
      });
    });
  }

  /** Limpia foto después y comentarios al abrir (p. ej. tras rechazo de cierre). */
  private resetFormState(): void {
    this.revokePreview(this.previewDespues());
    this.fileDespues = null;
    this.previewDespues.set(null);
    this.error.set(null);
    this.form.reset({ comentario: '' });
    this.repuestosArray.clear();
  }

  get repuestosArray(): FormArray {
    return this.form.controls.repuestos;
  }

  private createRepuestoRow() {
    return this.fb.group({
      repuestoId: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
    });
  }

  private loadCatalogo(): void {
    this.loadingCatalogo.set(true);
    this.inventario.repuestosDisponibles().subscribe({
      next: (items) => {
        this.catalogo.set(items);
        this.loadingCatalogo.set(false);
      },
      error: () => {
        this.catalogo.set([]);
        this.loadingCatalogo.set(false);
      },
    });
  }

  addRepuestoRow(): void {
    this.repuestosArray.push(this.createRepuestoRow());
  }

  removeRepuestoRow(index: number): void {
    this.repuestosArray.removeAt(index);
  }

  stockDisponible(repuestoId: string | number): number {
    const id = Number(repuestoId);
    if (!id) return 0;
    return this.catalogo().find((r) => r.repuestoId === id)?.cantidadActual ?? 0;
  }

  rowExceedsStock(index: number): boolean {
    const row = this.repuestosArray.at(index);
    const repuestoId = Number(row.get('repuestoId')?.value);
    const cantidad = Number(row.get('cantidad')?.value);
    if (!repuestoId || !cantidad) return false;
    return cantidad > this.stockDisponible(repuestoId);
  }

  repuestosInvalidos(): boolean {
    return this.repuestosArray.controls.some((_, i) => this.rowExceedsStock(i));
  }

  canSubmit(): boolean {
    return (
      !this.loading() &&
      this.form.valid &&
      !!this.previewDespues() &&
      !this.repuestosInvalidos()
    );
  }

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
      this.fileDespues = null;
      this.revokePreview(this.previewDespues());
      this.previewDespues.set(null);
      this.error.set('No se pudo procesar la imagen seleccionada');
    } finally {
      input.value = '';
    }
  }

  submit(): void {
    if (!this.canSubmit()) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.fileDespues) {
      this.error.set('Debes adjuntar la foto del estado final (Después)');
      return;
    }

    const repuestos = this.repuestosArray.controls
      .map((row) => ({
        repuestoId: Number(row.get('repuestoId')?.value),
        cantidad: Number(row.get('cantidad')?.value),
      }))
      .filter((r) => r.repuestoId > 0 && r.cantidad > 0);

    this.loading.set(true);
    this.error.set(null);

    this.workOrders
      .cerrarOrden(this.orden().id, {
        comentario: this.form.controls.comentario.value,
        fotoDespues: this.fileDespues,
        repuestos,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.toast.success(
            'Orden cerrada. Evidencias y consumo de materiales registrados.',
          );
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
    this.initializedForOrdenId = null;
    this.revokePreview(this.previewDespues());
    this.closed.emit();
  }

  private revokePreview(url: string | null): void {
    if (url) URL.revokeObjectURL(url);
  }
}
