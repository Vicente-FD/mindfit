import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Sucursal } from '../../core/models/sucursal.model';

@Component({
  selector: 'app-ot-report-modal',
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './ot-report-modal.component.html',
  styleUrl: './ot-report-modal.component.css',
})
export class OtReportModalComponent {
  private readonly fb = inject(FormBuilder);

  readonly sucursales = input.required<Sucursal[]>();
  readonly generating = input(false);
  readonly closed = output<void>();
  readonly generate = output<{
    fechaInicio: string;
    fechaFin: string;
    sucursalId: number | null;
  }>();

  readonly form = this.fb.nonNullable.group({
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required],
    sucursalId: [''],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    if (v.fechaFin < v.fechaInicio) {
      return;
    }
    this.generate.emit({
      fechaInicio: v.fechaInicio,
      fechaFin: v.fechaFin,
      sucursalId: v.sucursalId ? Number(v.sucursalId) : null,
    });
  }

  close(): void {
    this.closed.emit();
  }

  readonly fechaInvalida = signal(false);

  validateRange(): void {
    const v = this.form.getRawValue();
    this.fechaInvalida.set(
      !!v.fechaInicio && !!v.fechaFin && v.fechaFin < v.fechaInicio,
    );
  }
}
