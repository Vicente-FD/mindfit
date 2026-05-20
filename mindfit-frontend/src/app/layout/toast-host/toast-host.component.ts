import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-host',
  template: `
    <div class="toast-host" aria-live="polite">
      @for (msg of toast.messages(); track msg.id) {
        <div class="toast" [class]="'toast-' + msg.type" (click)="toast.dismiss(msg.id)">
          {{ msg.text }}
        </div>
      }
    </div>
  `,
  styles: `
    .toast-host {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 100;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: min(22rem, calc(100vw - 2rem));
    }
    .toast {
      border-radius: 0.75rem;
      padding: 0.75rem 1rem;
      font-size: 0.8rem;
      cursor: pointer;
      border: 1px solid rgb(255 255 255 / 0.1);
      background: #1a1a1c;
      color: #fff;
      box-shadow: 0 8px 24px rgb(0 0 0 / 0.35);
    }
    .toast-success {
      border-color: rgb(34 197 94 / 0.4);
    }
    .toast-error {
      border-color: rgb(255 102 0 / 0.45);
      color: #ff6600;
    }
  `,
})
export class ToastHostComponent {
  readonly toast = inject(ToastService);
}
