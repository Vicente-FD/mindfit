import { Component, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { WorkOrder } from '../../core/models/work-order.model';

@Component({
  selector: 'app-delete-ot-confirm-modal',
  imports: [LucideAngularModule],
  templateUrl: './delete-ot-confirm-modal.component.html',
  styleUrl: './delete-ot-confirm-modal.component.css',
})
export class DeleteOtConfirmModalComponent {
  readonly orden = input.required<WorkOrder>();
  readonly closed = output<void>();
  readonly deleting = input(false);
  readonly confirmed = output<void>();

  close(): void {
    this.closed.emit();
  }

  confirm(): void {
    this.confirmed.emit();
  }
}
