import { Injectable, inject } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { STORAGE_KEYS } from '../../constants/app.constants';

@Injectable()
export class PreferencesService {
  /**
   * Save biometric preference
   */
  async setBiometricEnabled(enabled: boolean): Promise<void> {
    await Preferences.set({
      key: STORAGE_KEYS.BIOMETRIC_ENABLED || 'biometricEnabled',
      value: String(enabled)
    });
  }

  /**
   * Get biometric preference
   */
  async getBiometricEnabled(): Promise<boolean> {
    const { value } = await Preferences.get({
      key: STORAGE_KEYS.BIOMETRIC_ENABLED || 'biometricEnabled'
    });
    return value === 'true';
  }

  /**
   * Save profile image
   */
  async setProfileImage(imageUrl: string): Promise<void> {
    await Preferences.set({
      key: STORAGE_KEYS.PROFILE_IMAGE,
      value: imageUrl
    });
  }

  /**
   * Get profile image
   */
  async getProfileImage(): Promise<string | null> {
    const { value } = await Preferences.get({
      key: STORAGE_KEYS.PROFILE_IMAGE
    });
    return value;
  }

  /**
   * Save theme preference
   */
  async setTheme(theme: 'light' | 'dark'): Promise<void> {
    await Preferences.set({
      key: STORAGE_KEYS.THEME,
      value: theme
    });
  }

  /**
   * Get theme preference
   */
  async getTheme(): Promise<'light' | 'dark'> {
    const { value } = await Preferences.get({
      key: STORAGE_KEYS.THEME
    });
    return (value as 'light' | 'dark') || 'light';
  }

  /**
   * Save language preference
   */
  async setLanguage(language: string): Promise<void> {
    await Preferences.set({
      key: STORAGE_KEYS.LANGUAGE,
      value: language
    });
  }

  /**
   * Get language preference
   */
  async getLanguage(): Promise<string> {
    const { value } = await Preferences.get({
      key: STORAGE_KEYS.LANGUAGE
    });
    return value || 'en';
  }

  /**
   * Clear all preferences
   */
  async clear(): Promise<void> {
    await Preferences.clear();
  }
}
