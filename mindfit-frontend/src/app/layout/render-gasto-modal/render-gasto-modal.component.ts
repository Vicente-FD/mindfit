import { Component, inject, input, output, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { GastosService } from '../../core/services/gastos.service';
import { ImageCompressorService } from '../../core/services/image-compressor.service';
import { ToastService } from '../../core/services/toast.service';
import { LIMITE_MENSUAL_GASTO } from '../../core/models/gastos.model';

@Component({
  selector: 'app-render-gasto-modal',
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './render-gasto-modal.component.html',
  styleUrl: './render-gasto-modal.component.css',
})
export class RenderGastoModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly gastos = inject(GastosService);
  private readonly compressor = inject(ImageCompressorService);
  private readonly toast = inject(ToastService);

  readonly saldoDisponible = input.required<number>();
  readonly limiteMensual = input(LIMITE_MENSUAL_GASTO);
  readonly closed = output<void>();
  readonly submitted = output<void>();

  readonly loading = signal(false);
  readonly previewBoleta = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  private boletaFile: File | null = null;

  readonly form = this.fb.nonNullable.group({
    monto: [null as number | null, [Validators.required, Validators.min(1)]],
    descripcion: ['', [Validators.required, Validators.minLength(3)]],
  });

  readonly montoSolicitado = signal(0);

  readonly excedeSaldo = () => {
    const monto = this.montoSolicitado();
    return monto > 0 && monto > this.saldoDisponible();
  };

  readonly puedeEnviar = () =>
    this.form.valid &&
    !!this.boletaFile &&
    !this.excedeSaldo() &&
    !this.loading();

  onMontoInput(): void {
    const raw = this.form.controls.monto.value;
    const n = raw == null ? 0 : Number(raw);
    this.montoSolicitado.set(Number.isFinite(n) ? n : 0);
  }

  async onBoletaSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const compressed = await this.compressor.compress(file);
      this.revokePreview();
      this.boletaFile = compressed;
      this.previewBoleta.set(URL.createObjectURL(compressed));
      this.error.set(null);
    } catch {
      this.toast.error('No se pudo procesar la imagen de la boleta');
    }
    input.value = '';
  }

  submit(): void {
    if (!this.puedeEnviar() || !this.boletaFile) return;

    const monto = Number(this.form.controls.monto.value);
    const descripcion = this.form.controls.descripcion.value.trim();

    const fd = new FormData();
    fd.append('monto', String(monto));
    fd.append('descripcion', descripcion);
    fd.append('boleta', this.boletaFile, this.boletaFile.name);

    this.loading.set(true);
    this.error.set(null);

    this.gastos.crearRendicion(fd).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Gasto rendido. Queda pendiente de aprobación.');
        this.submitted.emit();
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message ?? 'No se pudo registrar el gasto';
        const text = Array.isArray(msg) ? msg.join(', ') : String(msg);
        this.error.set(text);
        this.toast.error(text);
      },
    });
  }

  close(): void {
    this.revokePreview();
    this.closed.emit();
  }

  private revokePreview(): void {
    const url = this.previewBoleta();
    if (url) URL.revokeObjectURL(url);
    this.previewBoleta.set(null);
    this.boletaFile = null;
  }

  formatClp(value: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
