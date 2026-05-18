import { Component, OnInit, inject } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { AuthService } from './core/services/auth.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private alertCtrl = inject(AlertController);
  private router = inject(Router);

  showSplash = true;
  fadeSplash = false;

  async ngOnInit() {
    // Hide the native splash screen after the app is initialized
    console.log('Hiding native splash screen');
    await SplashScreen.hide();

    // Trigger custom splash screen fade out after 2.5 seconds
    setTimeout(() => {
      this.fadeSplash = true;
      // Completely remove from DOM after the 600ms fade transition
      setTimeout(() => {
        this.showSplash = false;
      }, 600);
    }, 2500);
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to log out?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { 
          text: 'Log Out', 
          role: 'confirm',
          handler: async () => { 
            await this.authService.logout();
            this.router.navigate(['/login'], { replaceUrl: true });
          }
        }
      ]
    });

    await alert.present();
  }
}
