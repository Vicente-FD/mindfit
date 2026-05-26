import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { UserRole } from '../models/user.model';

export const rolesGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const toast = inject(ToastService);

    if (!auth.isAuthenticated() || !auth.isTokenValid()) {
      return router.createUrlTree(['/login']);
    }

    if (auth.hasRole(...allowedRoles)) {
      return true;
    }

    toast.error('Acceso restringido a esta sección.');
    return router.createUrlTree([auth.getLandingRoute()]);
  };
};
