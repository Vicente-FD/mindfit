import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PasswordResetModalComponent } from '../password-reset/password-reset-modal.component';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, PasswordResetModalComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly recoveryModalOpen = signal(false);
  readonly pendingRecoveryBanner = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  openRecoveryModal(): void {
    this.pendingRecoveryBanner.set(null);
    this.recoveryModalOpen.set(true);
  }

  onRecoveryClosed(): void {
    this.recoveryModalOpen.set(false);
  }

  onRecoveryDeclined(): void {
    this.recoveryModalOpen.set(false);
    this.pendingRecoveryBanner.set(
      'Su solicitud de restablecimiento sigue en proceso. Un administrador le contactará o podrá intentar iniciar sesión más tarde con su nueva clave.',
    );
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.router.navigateByUrl(this.auth.getLandingRoute(res.user));
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Credenciales inválidas. Verifica tu email y contraseña.');
      },
    });
  }
}
