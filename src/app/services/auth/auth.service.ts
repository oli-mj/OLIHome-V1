import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, Observable, lastValueFrom, map, tap } from 'rxjs';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  private cacheInitialized = false;

  constructor(private api: ApiService) {
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
    try {
      // Simulation for now
      console.log('AuthService: Login logic executing');
      const response = {
        token: 'fake-jwt-token-123456',
        user: { name: 'User 01', email: email }
      };

      if (response && response.token) {
        await this.handleAuthSuccess(response.token, response.user);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  private async handleAuthSuccess(token: string, user: User): Promise<void> {
    this.tokenSubject.next(token);
    this.currentUserSubject.next(user);

    await Preferences.set({ key: 'authToken', value: token });
    await Preferences.set({ key: 'userData', value: JSON.stringify(user) });
  }

  async forgotPassword(email: string): Promise<any> {
    try {
      // Simulation of password for now - Mj
      console.log('AuthService: Forgot password logic executing for', email);
      return {
        message: `A password reset link has been sent to ${email}`
      };
    } catch (error) {
      throw error;
    }
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
    try {
      // In a real app, this would be an API call and subject to chane later - Mj
      // await lastValueFrom(this.api.post('/user/profile-image', { image: imageBase64 }));

      // Update local state if successful
      const currentUser = this.currentUserSubject.value;
      if (currentUser) {
        // Technically image is usually served by a URL, but for demo:
        // const updatedUser = { ...currentUser, profileImage: imageBase64 };
        // this.currentUserSubject.next(updatedUser);
      }
      console.log('AuthService: Simulated uploading image to backend server...');
    } catch (error) {
      throw error;
    }
  }
}
