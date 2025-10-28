/**
 * Secure Storage Service
 * Uses React Native Keychain to securely store sensitive data
 * such as encryption keys, auth tokens, and user preferences
 */

import * as Keychain from 'react-native-keychain';
import type { SecureStorageData, EncryptionKeys } from '@/types';

const STORAGE_KEY = 'privacy_social_secure_storage';

export class SecureStorageService {
  /**
   * Store data securely in the device keychain
   */
  async setItem<T extends keyof SecureStorageData>(
    key: T,
    value: SecureStorageData[T],
  ): Promise<boolean> {
    try {
      // Get existing data
      const existingData = await this.getAll();

      // Merge with new data
      const updatedData = {
        ...existingData,
        [key]: value,
      };

      // Store in keychain
      const result = await Keychain.setGenericPassword(
        STORAGE_KEY,
        JSON.stringify(updatedData),
        {
          service: STORAGE_KEY,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
        },
      );

      return result !== false;
    } catch (error) {
      console.error(`Secure storage set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Retrieve data from secure storage
   */
  async getItem<T extends keyof SecureStorageData>(
    key: T,
  ): Promise<SecureStorageData[T] | null> {
    try {
      const allData = await this.getAll();
      return allData[key] || null;
    } catch (error) {
      console.error(`Secure storage get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Get all stored data
   */
  async getAll(): Promise<SecureStorageData> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: STORAGE_KEY,
      });

      if (!credentials) {
        return {};
      }

      return JSON.parse(credentials.password) as SecureStorageData;
    } catch (error) {
      console.error('Secure storage getAll error:', error);
      return {};
    }
  }

  /**
   * Remove specific key from storage
   */
  async removeItem(key: keyof SecureStorageData): Promise<boolean> {
    try {
      const allData = await this.getAll();
      delete allData[key];

      if (Object.keys(allData).length === 0) {
        // If no data left, clear the keychain entry
        return await Keychain.resetGenericPassword({ service: STORAGE_KEY });
      }

      // Update keychain with remaining data
      const result = await Keychain.setGenericPassword(
        STORAGE_KEY,
        JSON.stringify(allData),
        {
          service: STORAGE_KEY,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
        },
      );

      return result !== false;
    } catch (error) {
      console.error(`Secure storage remove error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all secure storage
   */
  async clear(): Promise<boolean> {
    try {
      return await Keychain.resetGenericPassword({ service: STORAGE_KEY });
    } catch (error) {
      console.error('Secure storage clear error:', error);
      return false;
    }
  }

  /**
   * Check if storage is available on the device
   */
  async isAvailable(): Promise<boolean> {
    try {
      const result = await Keychain.getSupportedBiometryType();
      // If we can check biometry type, keychain is available
      return true;
    } catch (error) {
      console.error('Secure storage availability check error:', error);
      return false;
    }
  }

  /**
   * Store encryption keys securely
   */
  async setEncryptionKeys(keys: EncryptionKeys): Promise<boolean> {
    return this.setItem('encryptionKeys', keys);
  }

  /**
   * Retrieve encryption keys
   */
  async getEncryptionKeys(): Promise<EncryptionKeys | null> {
    return this.getItem('encryptionKeys');
  }

  /**
   * Store auth tokens securely
   */
  async setAuthTokens(accessToken: string, refreshToken: string): Promise<boolean> {
    return this.setItem('authTokens', { accessToken, refreshToken });
  }

  /**
   * Retrieve auth tokens
   */
  async getAuthTokens(): Promise<{ accessToken: string; refreshToken: string } | null> {
    return this.getItem('authTokens');
  }

  /**
   * Clear auth tokens (on logout)
   */
  async clearAuthTokens(): Promise<boolean> {
    return this.removeItem('authTokens');
  }

  /**
   * Store user preferences securely
   */
  async setUserPreferences(preferences: Record<string, any>): Promise<boolean> {
    return this.setItem('userPreferences', preferences);
  }

  /**
   * Retrieve user preferences
   */
  async getUserPreferences(): Promise<Record<string, any> | null> {
    return this.getItem('userPreferences');
  }
}

// Export singleton instance
let secureStorageInstance: SecureStorageService | null = null;

export function getSecureStorage(): SecureStorageService {
  if (!secureStorageInstance) {
    secureStorageInstance = new SecureStorageService();
  }
  return secureStorageInstance;
}

// Export convenience functions
export const secureStorage = {
  setItem: <T extends keyof SecureStorageData>(key: T, value: SecureStorageData[T]) =>
    getSecureStorage().setItem(key, value),
  getItem: <T extends keyof SecureStorageData>(key: T) =>
    getSecureStorage().getItem(key),
  removeItem: (key: keyof SecureStorageData) =>
    getSecureStorage().removeItem(key),
  clear: () =>
    getSecureStorage().clear(),
  isAvailable: () =>
    getSecureStorage().isAvailable(),

  // Convenience methods
  setEncryptionKeys: (keys: EncryptionKeys) =>
    getSecureStorage().setEncryptionKeys(keys),
  getEncryptionKeys: () =>
    getSecureStorage().getEncryptionKeys(),
  setAuthTokens: (accessToken: string, refreshToken: string) =>
    getSecureStorage().setAuthTokens(accessToken, refreshToken),
  getAuthTokens: () =>
    getSecureStorage().getAuthTokens(),
  clearAuthTokens: () =>
    getSecureStorage().clearAuthTokens(),
  setUserPreferences: (preferences: Record<string, any>) =>
    getSecureStorage().setUserPreferences(preferences),
  getUserPreferences: () =>
    getSecureStorage().getUserPreferences(),
};
