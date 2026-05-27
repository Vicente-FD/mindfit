import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserRole } from '../../../core/models/user.model';
import {
  hasMinLength,
  hasNumber,
  hasUppercase,
  passwordStrengthValidator,
  passwordsMatchValidator,
} from '../../../core/validators/password.validators';

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Super Admin',
  jefe_operaciones: 'Jefe de Operaciones',
  tecnico: 'Técnico',
  jefe_sucursal: 'Jefe de Sucursal',
  gerente_bi: 'Gerente / BI',
  bodeguero: 'Bodeguero',
  ejecutivo_ventas: 'Ejecutivo de Ventas',
};

const SESSION_LABELS: Record<string, string> = {
  conectado: 'Conectado',
  desconectado: 'Desconectado',
  reposo: 'En reposo',
};

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
})
export class PerfilComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly user = this.auth.user;
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly mustChange = this.auth.mustChangePassword;
  readonly loadingProfile = signal(true);

  readonly showActual = signal(false);
  readonly showNueva = signal(false);
  readonly showConfirmar = signal(false);

  readonly passwordForm = this.fb.nonNullable.group(
    {
      passwordActual: ['', Validators.required],
      nuevoPassword: [
        '',
        [Validators.required, passwordStrengthValidator()],
      ],
      confirmarPassword: ['', Validators.required],
    },
    {
      validators: passwordsMatchValidator('nuevoPassword', 'confirmarPassword'),
    },
  );

  /** Fuerza recomputación de validaciones al escribir en el formulario reactivo. */
  private readonly formRevision = signal(0);

  readonly nuevoPasswordValue = computed(() => {
    this.formRevision();
    return this.passwordForm.controls.nuevoPassword.value;
  });

  readonly confirmPasswordValue = computed(() => {
    this.formRevision();
    return this.passwordForm.controls.confirmarPassword.value;
  });

  readonly ruleMinLength = computed(() =>
    hasMinLength(this.nuevoPasswordValue()),
  );
  readonly ruleUppercase = computed(() =>
    hasUppercase(this.nuevoPasswordValue()),
  );
  readonly ruleNumber = computed(() => hasNumber(this.nuevoPasswordValue()));

  readonly passwordsMismatch = computed(() => {
    const confirm = this.confirmPasswordValue();
    const nueva = this.nuevoPasswordValue();
    if (!confirm || !nueva) return false;
    return confirm !== nueva;
  });

  readonly canSubmit = computed(() => {
    this.formRevision();
    if (this.saving()) return false;

    const { passwordActual, nuevoPassword, confirmarPassword } =
      this.passwordForm.getRawValue();

    if (!passwordActual.trim() || !nuevoPassword || !confirmarPassword) {
      return false;
    }
    if (nuevoPassword !== confirmarPassword) return false;
    if (
      !hasMinLength(nuevoPassword) ||
      !hasUppercase(nuevoPassword) ||
      !hasNumber(nuevoPassword)
    ) {
      return false;
    }
    return true;
  });

  readonly initials = computed(() => {
    const nombre = this.user()?.nombre?.trim() ?? '';
    if (!nombre) return '?';
    const parts = nombre.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  });

  readonly rolLabel = computed(() => {
    const rol = this.user()?.rol;
    return rol ? ROLE_LABELS[rol] : '—';
  });

  readonly sedeLabel = computed(() => {
    const u = this.user();
    if (!u) return '—';
    if (!u.sucursalId) return 'Casa Central (Multisitio)';
    return u.sucursalNombre ?? `Sede #${u.sucursalId}`;
  });

  readonly estadoSesionLabel = computed(() => {
    const estado = this.user()?.estadoSesion ?? 'desconectado';
    return SESSION_LABELS[estado] ?? estado;
  });

  ngOnInit(): void {
    this.passwordForm.valueChanges.subscribe(() => {
      this.formRevision.update((n) => n + 1);
    });
    this.passwordForm.statusChanges.subscribe(() => {
      this.formRevision.update((n) => n + 1);
    });

    this.auth.refreshSessionProfile().subscribe({
      next: (profile) => {
        this.auth.applySessionProfile(profile);
        this.loadingProfile.set(false);
      },
      error: () => this.loadingProfile.set(false),
    });
  }

  toggleVisibility(field: 'actual' | 'nueva' | 'confirmar'): void {
    if (field === 'actual') this.showActual.update((v) => !v);
    if (field === 'nueva') this.showNueva.update((v) => !v);
    if (field === 'confirmar') this.showConfirmar.update((v) => !v);
  }

  onSubmit(): void {
    if (!this.canSubmit()) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { passwordActual, nuevoPassword } = this.passwordForm.getRawValue();
    this.saving.set(true);
    this.error.set(null);

    this.auth.cambiarPasswordPerfil(passwordActual, nuevoPassword).subscribe({
      next: () => {
        this.saving.set(false);
        this.passwordForm.reset();
        this.formRevision.update((n) => n + 1);
        this.toast.success('Contraseña actualizada correctamente');
        if (!this.auth.mustChangePassword()) {
          this.router.navigateByUrl(this.auth.getLandingRoute());
        }
      },
      error: (err) => {
        this.saving.set(false);
        const msg =
          err?.error?.message ??
          'No se pudo actualizar la contraseña. Intente nuevamente.';
        this.error.set(Array.isArray(msg) ? msg.join(', ') : String(msg));
      },
    });
  }
}
