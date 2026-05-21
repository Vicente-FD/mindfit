import { Component, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Sucursal } from '../../core/models/sucursal.model';

@Component({
  selector: 'app-delete-sucursal-confirm-modal',
  imports: [LucideAngularModule],
  templateUrl: './delete-sucursal-confirm-modal.component.html',
  styleUrl: './delete-sucursal-confirm-modal.component.css',
})
export class DeleteSucursalConfirmModalComponent {
  readonly sucursal = input.required<Sucursal>();
  readonly deleting = input(false);
  readonly closed = output<void>();
  readonly confirmed = output<void>();

  close(): void {
    this.closed.emit();
  }

  confirm(): void {
    this.confirmed.emit();
  }
}
