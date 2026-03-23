import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Preferences } from '@capacitor/preferences';
import { BiometricAuth, BiometryError, BiometryErrorType } from '@aparajita/capacitor-biometric-auth';

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

  constructor(
    private router: Router,
    private authService: AuthService
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

}
