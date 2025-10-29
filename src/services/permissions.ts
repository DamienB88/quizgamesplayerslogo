/**
 * Permissions Service
 * Handles requesting and checking native device permissions
 */

import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { Alert, Linking, Platform } from 'react-native';
import { logger } from './logger';

export type PermissionType = 'camera' | 'photos' | 'notifications';

export interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
}

class PermissionsService {
  /**
   * Check if photo library permission is granted
   */
  async checkPhotoPermission(): Promise<PermissionStatus> {
    try {
      const { status, canAskAgain } = await ImagePicker.getMediaLibraryPermissionsAsync();

      return {
        granted: status === 'granted',
        canAskAgain,
      };
    } catch (error) {
      logger.error('Failed to check photo permission', error);
      return { granted: false, canAskAgain: true };
    }
  }

  /**
   * Request photo library permission
   */
  async requestPhotoPermission(): Promise<PermissionStatus> {
    try {
      const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status === 'granted') {
        logger.info('Photo library permission granted');
        return { granted: true, canAskAgain };
      } else {
        logger.warn('Photo library permission denied', { status, canAskAgain });
        return { granted: false, canAskAgain };
      }
    } catch (error) {
      logger.error('Failed to request photo permission', error);
      return { granted: false, canAskAgain: true };
    }
  }

  /**
   * Check if camera permission is granted
   */
  async checkCameraPermission(): Promise<PermissionStatus> {
    try {
      const { status, canAskAgain } = await ImagePicker.getCameraPermissionsAsync();

      return {
        granted: status === 'granted',
        canAskAgain,
      };
    } catch (error) {
      logger.error('Failed to check camera permission', error);
      return { granted: false, canAskAgain: true };
    }
  }

  /**
   * Request camera permission
   */
  async requestCameraPermission(): Promise<PermissionStatus> {
    try {
      const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();

      if (status === 'granted') {
        logger.info('Camera permission granted');
        return { granted: true, canAskAgain };
      } else {
        logger.warn('Camera permission denied', { status, canAskAgain });
        return { granted: false, canAskAgain };
      }
    } catch (error) {
      logger.error('Failed to request camera permission', error);
      return { granted: false, canAskAgain: true };
    }
  }

  /**
   * Check if notification permission is granted
   */
  async checkNotificationPermission(): Promise<PermissionStatus> {
    try {
      const { status, canAskAgain } = await Notifications.getPermissionsAsync();

      return {
        granted: status === 'granted',
        canAskAgain,
      };
    } catch (error) {
      logger.error('Failed to check notification permission', error);
      return { granted: false, canAskAgain: true };
    }
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<PermissionStatus> {
    try {
      const { status, canAskAgain } = await Notifications.requestPermissionsAsync();

      if (status === 'granted') {
        logger.info('Notification permission granted');
        return { granted: true, canAskAgain };
      } else {
        logger.warn('Notification permission denied', { status, canAskAgain });
        return { granted: false, canAskAgain };
      }
    } catch (error) {
      logger.error('Failed to request notification permission', error);
      return { granted: false, canAskAgain: true };
    }
  }

  /**
   * Show alert and redirect to settings if permission is denied
   */
  async showPermissionDeniedAlert(type: PermissionType): Promise<void> {
    const permissionNames = {
      camera: 'Camera',
      photos: 'Photo Library',
      notifications: 'Notifications',
    };

    const name = permissionNames[type];

    Alert.alert(
      `${name} Access Required`,
      `Privacy Social needs ${name.toLowerCase()} access to function properly. Please enable it in Settings.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => Linking.openSettings(),
        },
      ]
    );
  }

  /**
   * Check and request permission with user-friendly messaging
   */
  async ensurePermission(type: PermissionType): Promise<boolean> {
    let status: PermissionStatus;

    // Check current status
    switch (type) {
      case 'camera':
        status = await this.checkCameraPermission();
        break;
      case 'photos':
        status = await this.checkPhotoPermission();
        break;
      case 'notifications':
        status = await this.checkNotificationPermission();
        break;
    }

    // If already granted, return true
    if (status.granted) {
      return true;
    }

    // If can't ask again, show settings alert
    if (!status.canAskAgain) {
      await this.showPermissionDeniedAlert(type);
      return false;
    }

    // Request permission
    switch (type) {
      case 'camera':
        status = await this.requestCameraPermission();
        break;
      case 'photos':
        status = await this.requestPhotoPermission();
        break;
      case 'notifications':
        status = await this.requestNotificationPermission();
        break;
    }

    // If still not granted and can't ask again, show settings alert
    if (!status.granted && !status.canAskAgain) {
      await this.showPermissionDeniedAlert(type);
    }

    return status.granted;
  }
}

// Export singleton instance
let permissionsServiceInstance: PermissionsService | null = null;

export function getPermissionsService(): PermissionsService {
  if (!permissionsServiceInstance) {
    permissionsServiceInstance = new PermissionsService();
  }
  return permissionsServiceInstance;
}

// Export convenience functions
export const permissions = {
  checkPhotoPermission: () => getPermissionsService().checkPhotoPermission(),
  requestPhotoPermission: () => getPermissionsService().requestPhotoPermission(),
  checkCameraPermission: () => getPermissionsService().checkCameraPermission(),
  requestCameraPermission: () => getPermissionsService().requestCameraPermission(),
  checkNotificationPermission: () => getPermissionsService().checkNotificationPermission(),
  requestNotificationPermission: () => getPermissionsService().requestNotificationPermission(),
  ensurePermission: (type: PermissionType) => getPermissionsService().ensurePermission(type),
  showPermissionDeniedAlert: (type: PermissionType) =>
    getPermissionsService().showPermissionDeniedAlert(type),
};
