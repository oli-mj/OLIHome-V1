import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Preferences } from '@capacitor/preferences';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentToken: string | null = null;
  private currentUser: any = null;
  private cacheInitialized = false;

  constructor(private api: ApiService) { }

  private async initCache(): Promise<void> {
    if (this.cacheInitialized) return;
    
    const tokenRes = await Preferences.get({ key: 'authToken' });
    const userRes = await Preferences.get({ key: 'userData' });

    this.currentToken = tokenRes.value;
    this.currentUser = userRes.value ? JSON.parse(userRes.value) : null;
    this.cacheInitialized = true;
  }

  async login(email: string, password: string):Promise<any> {
    try {
      // Uncomment this when backend is ready
      // const request$ = await this.api.post<any>('/auth/login', { email, password });
      // const response = await lastValueFrom(request$);
      
      // Dummy implementation for now:
      console.log('AuthService: Login logic executing');
      const response = {
        token: 'fake-jwt-token-123456',
        user: { name: 'User 01', email: email }
      };

      if (response && response.token) {
        // Update Cache
        this.currentToken = response.token;
        this.currentUser = response.user;
        this.cacheInitialized = true;

        // Persist to Storage
        await this.setTokenString(response.token);
        await Preferences.set({ key: 'userData', value: JSON.stringify(response.user) });
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    this.currentToken = null;
    this.currentUser = null;
    await Preferences.remove({ key: 'authToken' });
    await Preferences.remove({ key: 'userData' });
  }

  async getToken(): Promise<string | null> {
    await this.initCache();
    return this.currentToken;
  }

  private async setTokenString(token: string): Promise<void> {
    await Preferences.set({ key: 'authToken', value: token });
  }

  async getUserData(): Promise<any> {
    await this.initCache();
    return this.currentUser;
  }

  async updateProfileImage(imageBase64: string): Promise<void> {
    try {
      // Uncomment this when backend is ready
      // await lastValueFrom(this.api.post('/user/profile-image', { image: imageBase64 }));
      
      console.log('AuthService: Simulated uploading image to backend server...');
    } catch (error) {
      throw error;
    }
  }
}
