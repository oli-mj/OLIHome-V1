import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Preferences } from '@capacitor/preferences';
import { BiometricAuth, BiometryError, BiometryErrorType } from '@aparajita/capacitor-biometric-auth';
import { AlertController } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {

  // Login credentials model
  loginData = {
    email: '',
    password: ''
  };

  isPdfModalOpen = false;
  pdfUrl = '';
  safePdfUrl: SafeResourceUrl | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private alertController: AlertController,
    private sanitizer: DomSanitizer
  ) { }

  async ngOnInit() {
    const { value } = await Preferences.get({ key: 'biometricEnabled' });
    if (value === 'true') {
      this.triggerBiometric();
    }
  }

  async triggerBiometric() {
    try {
      const info = await BiometricAuth.checkBiometry();
      if (!info.isAvailable) {
        console.warn('Biometry is not available');
        return;
      }

      await BiometricAuth.authenticate({
        reason: 'Please authenticate to log in',
        allowDeviceCredential: true,
      });

      console.log('Biometric login successful');
      this.router.navigate(['/main/home']);
    } catch (error) {
      if (error instanceof BiometryError && error.code !== BiometryErrorType.userCancel) {
        console.error(error.message);
      }
    }
  }

  async onLogin(form: NgForm) {
    if (form.valid) {
      try {
        await this.authService.login(this.loginData.email, this.loginData.password);
        this.router.navigate(['/main/home']);
      } catch (error) {
        console.error('Login failed', error);
      }
    }
  }

  async onForgotPassword() {
    const alert = await this.alertController.create({
      header: 'Forgot Password',
      message: 'Enter your email to receive a reset link.',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'your-email@example.com',
          value: this.loginData.email // Pre-fill with existing email if any
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Send Link',
          handler: async (data) => {
            if (data.email) {
              try {
                const res = await this.authService.forgotPassword(data.email);
                this.showToast(res.message, 'success');
              } catch (error) {
                this.showToast('Could not send reset link. Please try again.', 'danger');
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // Helper for showing results
  private async showToast(message: string, color: string) {
    const alert = await this.alertController.create({
      header: color === 'success' ? 'Success' : 'Error',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  // PDF modal handling
  openPdfModal(url: string) {
    this.pdfUrl = url;
    // Appending #toolbar=1 ensures desktop browsers show their native PDF controls
    this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url + '#toolbar=1&navpanes=0&scrollbar=1');
    this.isPdfModalOpen = true;
  }

  closePdfModal() {
    this.isPdfModalOpen = false;
    this.pdfUrl = '';
    this.safePdfUrl = null;
  }

  onPdfError(error: any) {
    console.error('PDF Load Error:', error);
    this.showToast('PDF Error: ' + (error?.message || error?.name || JSON.stringify(error)), 'danger');
  }
}
