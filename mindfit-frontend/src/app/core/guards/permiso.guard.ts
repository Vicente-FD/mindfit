import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PermisosUi } from '../models/permisos-ui.model';

export const permisoGuard = (permiso: keyof PermisosUi): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated() || !auth.isTokenValid()) {
      return router.createUrlTree(['/login']);
    }

    if (auth.canAccess(permiso)) {
      return true;
    }

    return router.createUrlTree([auth.getDashboardRouteForRole()]);
  };
};
