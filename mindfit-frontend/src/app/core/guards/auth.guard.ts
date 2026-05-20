import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated() && auth.isTokenValid()) {
    return true;
  }

  localStorage.removeItem('mindfit_token');
  localStorage.removeItem('mindfit_user');
  return router.createUrlTree(['/login']);
};
