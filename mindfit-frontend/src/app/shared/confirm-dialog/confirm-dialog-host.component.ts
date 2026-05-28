import { Component, inject } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ConfirmDialogService } from './confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog-host',
  imports: [LucideAngularModule],
  templateUrl: './confirm-dialog-host.component.html',
  styleUrl: './confirm-dialog-host.component.css',
})
export class ConfirmDialogHostComponent {
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly dialog = this.confirmDialog.open;

  cancel(): void {
    this.confirmDialog.finish(false);
  }

  confirm(): void {
    this.confirmDialog.finish(true);
  }
}
