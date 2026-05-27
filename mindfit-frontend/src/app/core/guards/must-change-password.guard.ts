import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Redirige a /dashboard/perfil mientras el usuario tenga contraseña temporal. */
export const mustChangePasswordGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.mustChangePassword()) {
    return true;
  }

  if (state.url.includes('/dashboard/perfil')) {
    return true;
  }

  return router.createUrlTree(['/dashboard/perfil']);
};
