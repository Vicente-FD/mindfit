import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const rolesGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated() || !auth.isTokenValid()) {
      return router.createUrlTree(['/login']);
    }

    if (auth.hasRole(...allowedRoles)) {
      return true;
    }

    return router.createUrlTree([auth.getDashboardRouteForRole()]);
  };
};
