import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Redirige /dashboard al primer módulo permitido del sidebar (sin renderizar hijo por defecto).
 */
export const dashboardRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.getUser();

  if (!user || !auth.isTokenValid()) {
    return router.createUrlTree(['/login']);
  }

  const landing = auth.getLandingRoute(user);
  if (landing === '/login') {
    auth.forceLogout();
    return router.createUrlTree(['/login']);
  }

  return router.createUrlTree([landing]);
};
