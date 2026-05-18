import { Component, OnInit, ViewChild, ElementRef, OnDestroy, inject } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { ToastService } from '../core/services/toast.service';
import { PreferencesService } from '../core/services/preferences.service';
import { AlertController } from '@ionic/angular';
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
  private toastService = inject(ToastService);
  private preferencesService = inject(PreferencesService);
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
    const bioEnabled = await this.preferencesService.getBiometricEnabled();
    this.biometricEnabled = bioEnabled;

    // 3. Load Profile Image from local storage if available
    const imgUrl = await this.preferencesService.getProfileImage();
    if (imgUrl) {
      this.profileImageUrl = imgUrl;
    }

    // Simulate initial loading delay for UX demonstration of skeletons
    setTimeout(() => {
      if (this.userName) this.isLoading = false;
    }, 1000);
  }

  ngOnDestroy() {
    this.authSub?.unsubscribe();
  }

  async onBiometricToggle(event: { detail: { checked: boolean } }): Promise<void> {
    const checked = event.detail.checked;
    
    if (checked) {
      try {
        // Actual Biometric Check
        const result = await BiometricAuth.checkBiometry();
        if (result.isAvailable) {
          this.biometricEnabled = true;
          await this.preferencesService.setBiometricEnabled(true);
          await this.toastService.success('Biometric login enabled successfully.');
        } else {
          await this.toastService.warning('Biometrics not available on this device.');
          this.biometricEnabled = false;
        }
      } catch (err) {
        console.error('Biometric error:', err);
        this.biometricEnabled = false;
        await this.toastService.error('Failed to enable biometric login.');
      }
    } else {
      this.biometricEnabled = false;
      await this.preferencesService.setBiometricEnabled(false);
    }
  }

  async selectAvatar(url: string) {
    this.profileImageUrl = url;
    this.isProfileModalOpen = false;

    // Save locally
    await this.preferencesService.setProfileImage(url);

    // Send to backend
    try {
      await this.authService.updateProfileImage(url);
      await this.toastService.success('Profile picture updated!');
    } catch (err) {
      await this.toastService.error('Failed to update avatar.');
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
          await this.preferencesService.setProfileImage(this.profileImageUrl);
          try {
            await this.authService.updateProfileImage(this.profileImageUrl);
            await this.toastService.success('Profile image uploaded successfully.');
          } catch (err) {
            await this.toastService.error('Failed to upload image.');
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
    await this.toastService.success('Changes saved successfully!');
  }
}
