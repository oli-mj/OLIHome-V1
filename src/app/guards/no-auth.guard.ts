import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const noAuthGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = await authService.getToken();

  if (!token) {
    return true;
  }

  return router.createUrlTree(['/main']);
};
