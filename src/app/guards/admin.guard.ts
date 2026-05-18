import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { ToastController } from '@ionic/angular';

/**
 * Route guard to check if user has admin or management role
 * Only allows access to admin booking verification pages
 */
export const adminGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastController = inject(ToastController);

  try {
    const user = await authService.getUserData();

    if (!user) {
      await showErrorToast(toastController, 'Please log in first');
      return router.createUrlTree(['/login']);
    }

    const isAdmin = user.role === 'admin' || user.role === 'management';

    if (!isAdmin) {
      await showErrorToast(toastController, 'You do not have permission to access this page');
      return router.createUrlTree(['/main']);
    }

    return true;
  } catch (error) {
    console.error('Admin guard error:', error);
    await showErrorToast(toastController, 'Authentication error');
    return router.createUrlTree(['/login']);
  }
};

/**
 * Helper to show error toast
 */
async function showErrorToast(toastController: ToastController, message: string) {
  const toast = await toastController.create({
    message,
    duration: 3000,
    position: 'bottom',
    color: 'danger',
  });
  await toast.present();
}
