import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
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
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  profileImageUrl: string | ArrayBuffer | null = 'https://i.pravatar.cc/150?u=user1';
  biometricEnabled: boolean = false;
  isLoading = true;

  userName: string = '';
  userEmail: string = '';

  isProfileModalOpen = false;
  availableAvatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jocelyn',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Missy',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=George',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Abby'
  ];

  private authSub?: Subscription;

  constructor(
    private authService: AuthService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) { }

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

  async showLogoutConfirm() {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to log out?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { 
          text: 'Log Out', 
          role: 'confirm',
          handler: () => { this.authService.logout(); }
        }
      ]
    });

    await alert.present();
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
