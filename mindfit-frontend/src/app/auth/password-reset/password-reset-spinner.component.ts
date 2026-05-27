import { Component, input } from '@angular/core';

@Component({
  selector: 'app-password-reset-spinner',
  template: `
    <div class="pr-spinner" [class.pr-spinner--sm]="size() === 'sm'" role="status" aria-label="Cargando">
      <span class="pr-spinner__ring"></span>
    </div>
  `,
  styles: `
    .pr-spinner {
      display: flex;
      justify-content: center;
      padding: 1.5rem 0;
    }

    .pr-spinner__ring {
      display: block;
      width: 3rem;
      height: 3rem;
      border-radius: 9999px;
      border: 3px solid rgb(255 255 255 / 0.1);
      border-top-color: var(--color-orange-energy, #ff6600);
      animation: pr-spin 0.85s linear infinite;
    }

    .pr-spinner--sm .pr-spinner__ring {
      width: 1.25rem;
      height: 1.25rem;
      border-width: 2px;
    }

    @keyframes pr-spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
})
export class PasswordResetSpinnerComponent {
  readonly size = input<'md' | 'sm'>('md');
}
