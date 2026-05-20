import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { WorkOrder } from '../../core/models/work-order.model';

@Component({
  selector: 'app-reject-ot-modal',
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './reject-ot-modal.component.html',
  styleUrl: './reject-ot-modal.component.css',
})
export class RejectOtModalComponent {
  private readonly fb = inject(FormBuilder);

  readonly orden = input.required<WorkOrder>();
  readonly rejecting = input(false);
  readonly closed = output<void>();
  readonly confirmed = output<string>();

  readonly form = this.fb.nonNullable.group({
    motivo: ['', [Validators.required, Validators.minLength(3)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.confirmed.emit(this.form.controls.motivo.value);
  }

  close(): void {
    this.closed.emit();
  }
}
