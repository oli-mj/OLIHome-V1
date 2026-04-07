import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Preferences } from '@capacitor/preferences';
import { BiometricAuth, BiometryError, BiometryErrorType } from '@aparajita/capacitor-biometric-auth';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth/auth.service';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capawesome-team/capacitor-file-opener';

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

  constructor(
    private router: Router,
    private authService: AuthService,
    private alertController: AlertController
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

  // Native PDF Opener
  async openPdfNative(url: string) {
    try {
      // 1. Fetch the file byte data from local assets folder
      const response = await fetch(url);
      const blob = await response.blob();
      
      // 2. Transcode blob to Base64 required by Filesystem API
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const base64String = base64data.split(',')[1];
        
        // 3. Write securely to Cache memory on the Android/iOS filesystem
        const fileName = url.split('/').pop() || 'document.pdf';
        const writeResult = await Filesystem.writeFile({
          path: fileName,
          data: base64String,
          directory: Directory.Cache
        });
        
        // 4. Trigger the device's native app prompt immediately over our screen
        await FileOpener.openFile({
          path: writeResult.uri,
          mimeType: 'application/pdf'
        });
      };
    } catch (error: any) {
      console.error('File Open Error:', error);
      this.showToast('Could not open document natively.', 'danger');
    }
  }
}
