import { Component, inject, input, output, signal, viewChild, ElementRef } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { AgentDebugService } from '../../core/services/agent-debug.service';
import { WorkOrder } from '../../core/models/work-order.model';

@Component({
  selector: 'app-start-work-modal',
  imports: [LucideAngularModule],
  templateUrl: './start-work-modal.component.html',
  styleUrl: './start-work-modal.component.css',
})
export class StartWorkModalComponent {
  private readonly agentDebug = inject(AgentDebugService);

  readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  readonly orden = input.required<WorkOrder>();
  readonly submitting = input(false);
  readonly externalError = input<string | null>(null);
  readonly closed = output<void>();
  readonly confirm = output<File>();

  readonly previewAntes = signal<string | null>(null);
  readonly hasPhoto = signal(false);

  private fileAntes: File | null = null;

  openFilePicker(): void {
    // #region agent log
    this.agentDebug.log(
      'start-work-modal.component.ts:openFilePicker',
      'file picker opened',
      { ordenId: this.orden().id },
      'G',
    );
    // #endregion
    this.fileInput()?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    // #region agent log
    this.agentDebug.log(
      'start-work-modal.component.ts:onFileSelected',
      'input change',
      { hasFile: !!file, name: file?.name, type: file?.type, size: file?.size },
      'G',
    );
    // #endregion
    if (!file) return;

    this.setPhotoFile(file, 'original');
    input.value = '';
  }

  private setPhotoFile(file: File, source: string): void {
    this.revokePreview(this.previewAntes());
    this.fileAntes = file;
    this.previewAntes.set(URL.createObjectURL(file));
    this.hasPhoto.set(true);
    // #region agent log
    this.agentDebug.log(
      'start-work-modal.component.ts:setPhotoFile',
      'photo ready',
      { source, fileSize: file.size, fileType: file.type },
      'G',
    );
    // #endregion
  }

  submit(): void {
    // #region agent log
    this.agentDebug.log(
      'start-work-modal.component.ts:submit',
      'submit clicked',
      { hasPhoto: this.hasPhoto(), hasFile: !!this.fileAntes },
      'H',
    );
    // #endregion
    if (!this.fileAntes) {
      return;
    }

    // #region agent log
    this.agentDebug.log(
      'start-work-modal.component.ts:submit',
      'emit confirm to parent',
      {
        ordenId: this.orden().id,
        codigoOt: this.orden().codigoOt,
        fileSize: this.fileAntes.size,
      },
      'H',
    );
    // #endregion
    this.confirm.emit(this.fileAntes);
  }

  close(): void {
    this.revokePreview(this.previewAntes());
    this.closed.emit();
  }

  private revokePreview(url: string | null): void {
    if (url) URL.revokeObjectURL(url);
  }
}
