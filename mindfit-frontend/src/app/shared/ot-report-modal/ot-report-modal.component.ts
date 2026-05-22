import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Sucursal } from '../../core/models/sucursal.model';
import { MindfitDatePickerComponent } from '../../common/components/date-picker/date-picker.component';
import { DateRangeValue } from '../../common/components/date-picker/date-picker.types';

function rangeRequired(control: AbstractControl): ValidationErrors | null {
  const v = control.value as DateRangeValue | null;
  if (!v?.start || !v?.end) return { required: true };
  if (v.end < v.start) return { invalidRange: true };
  return null;
}

@Component({
  selector: 'app-ot-report-modal',
  imports: [ReactiveFormsModule, LucideAngularModule, MindfitDatePickerComponent],
  templateUrl: './ot-report-modal.component.html',
  styleUrl: './ot-report-modal.component.css',
})
export class OtReportModalComponent implements OnInit {
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
    periodo: [null as DateRangeValue | null, rangeRequired],
    sucursalId: [''],
  });

  readonly fechaInvalida = signal(false);

  ngOnInit(): void {
    this.form.controls.periodo.valueChanges.subscribe(() => this.validateRange());
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.validateRange();
      return;
    }
    const v = this.form.getRawValue();
    const p = v.periodo!;
    this.generate.emit({
      fechaInicio: p.start,
      fechaFin: p.end,
      sucursalId: v.sucursalId ? Number(v.sucursalId) : null,
    });
  }

  close(): void {
    this.closed.emit();
  }

  validateRange(): void {
    const p = this.form.controls.periodo.value;
    this.fechaInvalida.set(!!p?.start && !!p?.end && p.end < p.start);
  }

}
