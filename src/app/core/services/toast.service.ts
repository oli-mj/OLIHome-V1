import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { APP_CONFIG } from '../../constants/app.constants';

export type ToastColor = 'success' | 'danger' | 'warning' | 'info';

@Injectable()
export class ToastService {
  private toastCtrl = inject(ToastController);

  /**
   * Display a success toast message
   * @param message The message to display
   * @param duration Duration in milliseconds
   */
  async success(message: string, duration: number = APP_CONFIG.TOAST_DURATION): Promise<void> {
    await this.show(message, 'success', duration);
  }

  /**
   * Display an error toast message
   * @param message The message to display
   * @param duration Duration in milliseconds
   */
  async error(message: string, duration: number = APP_CONFIG.TOAST_DURATION): Promise<void> {
    await this.show(message, 'danger', duration);
  }

  /**
   * Display a warning toast message
   * @param message The message to display
   * @param duration Duration in milliseconds
   */
  async warning(message: string, duration: number = APP_CONFIG.TOAST_DURATION): Promise<void> {
    await this.show(message, 'warning', duration);
  }

  /**
   * Display an info toast message
   * @param message The message to display
   * @param duration Duration in milliseconds
   */
  async info(message: string, duration: number = APP_CONFIG.TOAST_DURATION): Promise<void> {
    await this.show(message, 'info', duration);
  }

  /**
   * Display a custom toast message
   * @param message The message to display
   * @param color The color/type of the toast
   * @param duration Duration in milliseconds
   */
  private async show(message: string, color: ToastColor, duration: number): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      position: 'bottom',
      color,
      buttons: [
        {
          text: 'Close',
          role: 'cancel',
        }
      ]
    });
    await toast.present();
  }
}
