import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { PermisosUi, hasAnyPermiso } from '../models/permisos-ui.model';

export const permisoGuard = (
  permiso: keyof PermisosUi | readonly (keyof PermisosUi)[],
): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const toast = inject(ToastService);

    if (!auth.isAuthenticated() || !auth.isTokenValid()) {
      return router.createUrlTree(['/login']);
    }

    const keys = (
      Array.isArray(permiso) ? permiso : [permiso]
    ) as (keyof PermisosUi)[];

    const u = auth.getUser();
    const allowed =
      keys.length === 1
        ? auth.canAccess(keys[0])
        : u
          ? hasAnyPermiso(u.rol, u.permisosUi, keys)
          : false;

    if (allowed) {
      return true;
    }

    toast.error('Acceso restringido a esta sección.');
    const landing = auth.getLandingRoute(u);
    if (landing === '/login') {
      auth.forceLogout();
      return router.createUrlTree(['/login']);
    }
    return router.createUrlTree([landing]);
  };
};
