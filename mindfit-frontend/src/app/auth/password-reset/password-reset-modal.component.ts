import {
  Component,
  OnDestroy,
  inject,
  input,
  output,
  signal,
  effect,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { PasswordResetWsService } from './password-reset-ws.service';
import type {
  PasswordResetViewState,
  SolicitarRecuperacionResponse,
} from './password-reset.types';
import { PasswordResetSpinnerComponent } from './password-reset-spinner.component';

@Component({
  selector: 'app-password-reset-modal',
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
    PasswordResetSpinnerComponent,
  ],
  providers: [PasswordResetWsService],
  templateUrl: './password-reset-modal.component.html',
  styleUrl: './password-reset-modal.component.css',
})
export class PasswordResetModalComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly ws = inject(PasswordResetWsService);

  readonly open = input(false);

  readonly closed = output<void>();
  readonly declined = output<void>();

  readonly viewState = signal<PasswordResetViewState>('FORM');
  readonly submitting = signal(false);
  readonly waitingHint = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly tempPassword = signal<string | null>(null);
  readonly showPassword = signal(false);

  private watchToken: string | null = null;
  private waitSub: Subscription | null = null;

  readonly emailForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    effect(() => {
      if (!this.open()) {
        this.resetInternal();
      }
    });
  }

  ngOnDestroy(): void {
    this.teardownWait();
    this.ws.disconnect();
  }

  close(): void {
    this.teardownWait();
    this.ws.disconnect();
    this.closed.emit();
    this.resetInternal();
  }

  submitEmail(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    const email = this.emailForm.controls.email.value.trim();
    this.submitting.set(true);
    this.errorMessage.set(null);

    this.auth.solicitarRecuperacion(email).subscribe({
      next: (res: SolicitarRecuperacionResponse) => {
        this.submitting.set(false);
        this.watchToken = res.watchToken ?? null;
        this.viewState.set('CONFIRM');
      },
      error: () => {
        this.submitting.set(false);
        this.watchToken = null;
        this.viewState.set('CONFIRM');
      },
    });
  }

  chooseWait(): void {
    if (!this.watchToken) {
      this.errorMessage.set(
        'No fue posible activar la espera en tiempo real. Su solicitud sigue registrada; un administrador la procesará.',
      );
      this.declined.emit();
      this.close();
      return;
    }

    this.viewState.set('WAITING');
    this.errorMessage.set(null);
    this.waitingHint.set(
      'Esperando que un administrador genere su clave temporal…',
    );

    this.ws.connect(this.watchToken);
    this.waitSub = this.ws.waitForCompletion().subscribe({
      next: (payload) => {
        this.tempPassword.set(payload.contrasenaTemporal);
        this.viewState.set('RESULT');
        this.waitingHint.set(null);
        this.teardownWait();
      },
      error: (err: Error) => {
        this.errorMessage.set(err.message ?? 'Tiempo de espera agotado.');
        this.viewState.set('CONFIRM');
        this.teardownWait();
      },
    });
  }

  chooseDecline(): void {
    this.teardownWait();
    this.ws.disconnect();
    this.declined.emit();
    this.close();
  }

  toggleShowPassword(): void {
    this.showPassword.update((v) => !v);
  }

  async copyPassword(): Promise<void> {
    const pwd = this.tempPassword();
    if (!pwd) return;
    try {
      await navigator.clipboard.writeText(pwd);
    } catch {
      /* el usuario puede copiar manualmente */
    }
  }

  finishResult(): void {
    this.close();
  }

  private teardownWait(): void {
    this.waitSub?.unsubscribe();
    this.waitSub = null;
  }

  private resetInternal(): void {
    this.teardownWait();
    this.ws.disconnect();
    this.viewState.set('FORM');
    this.submitting.set(false);
    this.waitingHint.set(null);
    this.errorMessage.set(null);
    this.tempPassword.set(null);
    this.showPassword.set(false);
    this.watchToken = null;
    this.emailForm.reset();
  }
}
