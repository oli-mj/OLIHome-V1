import { Component, OnInit, ViewChild, ElementRef, OnDestroy, inject } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { AuthService } from '../services/auth/auth.service';
import { ToastController, AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.page.html',
  styleUrls: ['./profile-settings.page.scss'],
  standalone: false,
})
export class ProfileSettingsPage implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  profileImageUrl: string | ArrayBuffer | null = 'assets/avatars/avatar-1.png';
  biometricEnabled: boolean = false;
  isLoading = true;

  userName: string = '';
  userEmail: string = '';

  isProfileModalOpen = false;
  availableAvatars = [
    'assets/avatars/avatar-1.png',
    'assets/avatars/avatar-2.png',
    'assets/avatars/avatar-3.png',
    'assets/avatars/avatar-4.png',
    'assets/avatars/avatar-5.png',
    'assets/avatars/avatar-6.png',
  ];

  private authSub?: Subscription;

  async ngOnInit() {
    // 1. Subscribe to User Data (Reactive)
    this.authSub = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.name || 'User';
        this.userEmail = user.email || 'No Email';
        this.isLoading = false;
      }
    });

    // 2. Load Biometric config
    const { value: bioValue } = await Preferences.get({ key: 'biometricEnabled' });
    this.biometricEnabled = bioValue === 'true';

    // 3. Load Profile Image from local storage if available
    const { value: imgValue } = await Preferences.get({ key: 'profileImage' });
    if (imgValue) {
      this.profileImageUrl = imgValue;
    }

    // Simulate initial loading delay for UX demonstration of skeletons
    setTimeout(() => {
      if (this.userName) this.isLoading = false;
    }, 1000);
  }

  ngOnDestroy() {
    this.authSub?.unsubscribe();
  }

  async onBiometricToggle(event: any) {
    const checked = event.detail.checked;
    
    if (checked) {
      try {
        // Actual Biometric Check
        const result = await BiometricAuth.checkBiometry();
        if (result.isAvailable) {
          this.biometricEnabled = true;
          await Preferences.set({ key: 'biometricEnabled', value: 'true' });
          this.showToast('Biometric login enabled successfully.');
        } else {
          this.showToast('Biometrics not available on this device.', 'warning');
          this.biometricEnabled = false;
        }
      } catch (err) {
        console.error('Biometric error:', err);
        this.biometricEnabled = false;
        this.showToast('Failed to enable biometric login.', 'danger');
      }
    } else {
      this.biometricEnabled = false;
      await Preferences.set({ key: 'biometricEnabled', value: 'false' });
    }
  }

  async selectAvatar(url: string) {
    this.profileImageUrl = url;
    this.isProfileModalOpen = false;

    // Save locally
    await Preferences.set({ key: 'profileImage', value: url });

    // Send to backend
    try {
      await this.authService.updateProfileImage(url);
      this.showToast('Profile picture updated!');
    } catch (err) {
      this.showToast('Failed to update avatar.', 'danger');
    }
  }

  triggerFileInput() {
    this.isProfileModalOpen = false;
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = async () => {
        this.profileImageUrl = reader.result;
        if (typeof this.profileImageUrl === 'string') {
          await Preferences.set({ key: 'profileImage', value: this.profileImageUrl });
          try {
            await this.authService.updateProfileImage(this.profileImageUrl);
            this.showToast('Profile image uploaded successfully.');
          } catch (err) {
            this.showToast('Failed to upload image.', 'danger');
          }
        }
      };

      reader.readAsDataURL(file);
    }
  }

  async saveChanges() {
    // TODO: When backend is ready, send updated profile data via API here.
    // For now, settings like biometric and profile image are already saved
    // to device storage as each toggle/selection is made.
    this.showToast('Changes saved successfully!');
  }

  private async showToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
