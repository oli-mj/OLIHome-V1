import { Injectable, inject } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // NOTE: ApiService is injected and ready for when the backend is connected.
  private api = inject(ApiService);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  private cacheInitialized = false;

  constructor() {
    this.initCache();
  }

  private async initCache(): Promise<void> {
    if (this.cacheInitialized) return;

    const { value: token } = await Preferences.get({ key: 'authToken' });
    const { value: userStr } = await Preferences.get({ key: 'userData' });

    if (token) this.tokenSubject.next(token);
    if (userStr) this.currentUserSubject.next(JSON.parse(userStr));

    this.cacheInitialized = true;
  }

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    // -----------------------------------------------------------------------
    // TODO: Replace this placeholder with a real API call once backend is ready.
    // Example: return await lastValueFrom(this.api.post('/auth/login', { email, password }));
    // -----------------------------------------------------------------------
    const displayName = email.split('@')[0]; // Derive a friendly display name from the email
    const response = {
      token: 'PLACEHOLDER_TOKEN',
      user: { name: displayName, email: email }
    };

    await this.handleAuthSuccess(response.token, response.user);
    return response;
  }

  private async handleAuthSuccess(token: string, user: User): Promise<void> {
    this.tokenSubject.next(token);
    this.currentUserSubject.next(user);
    await Preferences.set({ key: 'authToken', value: token });
    await Preferences.set({ key: 'userData', value: JSON.stringify(user) });
  }

  async forgotPassword(email: string): Promise<any> {
    // -----------------------------------------------------------------------
    // TODO: Replace this placeholder with a real API call once backend is ready.
    // Example: return await lastValueFrom(this.api.post('/auth/forgot-password', { email }));
    // -----------------------------------------------------------------------
    return {
      message: `A password reset link has been sent to ${email}.`
    };
  }

  async logout(): Promise<void> {
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    await Preferences.remove({ key: 'authToken' });
    await Preferences.remove({ key: 'userData' });
  }

  async getToken(): Promise<string | null> {
    await this.initCache();
    return this.tokenSubject.value;
  }

  async getUserData(): Promise<User | null> {
    await this.initCache();
    return this.currentUserSubject.value;
  }

  async updateProfileImage(imageBase64: string): Promise<void> {
    // -----------------------------------------------------------------------
    // TODO: Replace this placeholder with a real API call once backend is ready.
    // Example: await lastValueFrom(this.api.post('/user/profile-image', { image: imageBase64 }));
    // -----------------------------------------------------------------------
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      // Profile image is stored locally in device Preferences for now.
      // When backend is ready, update the user object from the API response instead.
    }
  }
}
