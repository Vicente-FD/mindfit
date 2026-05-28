import { Injectable, signal } from '@angular/core';

export type ConfirmDialogVariant = 'danger' | 'primary';

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  readonly open = signal<ConfirmDialogConfig | null>(null);

  private pendingResolve: ((confirmed: boolean) => void) | null = null;

  confirm(config: ConfirmDialogConfig): Promise<boolean> {
    if (this.pendingResolve) {
      this.finish(false);
    }

    return new Promise<boolean>((resolve) => {
      this.pendingResolve = resolve;
      this.open.set({
        confirmLabel: 'Confirmar',
        cancelLabel: 'Cancelar',
        variant: 'danger',
        ...config,
      });
    });
  }

  finish(confirmed: boolean): void {
    this.pendingResolve?.(confirmed);
    this.pendingResolve = null;
    this.open.set(null);
  }
}
