import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.page.html',
  styleUrls: ['./profile-settings.page.scss'],
  standalone: false,
})
export class ProfileSettingsPage implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  
  profileImageUrl: string | ArrayBuffer | null = 'https://i.pravatar.cc/150?u=user1';
  biometricEnabled: boolean = false;
  
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

  constructor(private authService: AuthService) { }

  async ngOnInit() {
    // Load Biometric config
    const { value: bioValue } = await Preferences.get({ key: 'biometricEnabled' });
    this.biometricEnabled = bioValue === 'true';

    // Load Profile Image from local storage if available
    const { value: imgValue } = await Preferences.get({ key: 'profileImage' });
    if (imgValue) {
      this.profileImageUrl = imgValue;
    }

    // Load User Data from Auth Service
    const user = await this.authService.getUserData();
    if (user) {
      this.userName = user.name || 'User';
      this.userEmail = user.email || 'No Email';
    }
  }

  async onBiometricToggle(event: any) {
    this.biometricEnabled = event.detail.checked;
    await Preferences.set({
      key: 'biometricEnabled',
      value: this.biometricEnabled ? 'true' : 'false'
    });
  }

  async selectAvatar(url: string) {
    this.profileImageUrl = url;
    this.isProfileModalOpen = false;
    
    // Save locally
    await Preferences.set({ key: 'profileImage', value: url });
    
    // Send to backend
    try {
      await this.authService.updateProfileImage(url);
    } catch (err) {
      console.error('Failed to update avatar:', err);
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
          // 1. Save locally for instant load on restart
          await Preferences.set({ key: 'profileImage', value: this.profileImageUrl });
          
          // 2. Upload to backend server via AuthService
          try {
            await this.authService.updateProfileImage(this.profileImageUrl);
          } catch (err) {
            console.error('Failed to upload profile image:', err);
          }
        }
      };

      reader.readAsDataURL(file);
    }
  }

}
