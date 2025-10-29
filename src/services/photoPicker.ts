/**
 * Photo Picker Service
 * Handles photo selection from library or camera with permission management
 */

import * as ImagePicker from 'expo-image-picker';
import { permissions } from './permissions';
import { logger } from './logger';

export interface PhotoAsset {
  uri: string;
  width: number;
  height: number;
  type?: 'image' | 'video';
  fileName?: string;
  fileSize?: number;
}

export interface PhotoPickerOptions {
  allowsMultipleSelection?: boolean;
  quality?: number;
  allowsEditing?: boolean;
  aspect?: [number, number];
  mediaTypes?: 'images' | 'videos' | 'all';
}

class PhotoPickerService {
  /**
   * Pick photo from library
   */
  async pickFromLibrary(
    options: PhotoPickerOptions = {}
  ): Promise<PhotoAsset[] | null> {
    try {
      // Ensure photo library permission
      const hasPermission = await permissions.ensurePermission('photos');
      if (!hasPermission) {
        logger.warn('Photo library permission denied');
        return null;
      }

      const {
        allowsMultipleSelection = false,
        quality = 0.8,
        allowsEditing = false,
        aspect,
        mediaTypes = 'images',
      } = options;

      // Convert mediaTypes to ImagePicker format
      let imagePickerMediaTypes = ImagePicker.MediaTypeOptions.Images;
      if (mediaTypes === 'videos') {
        imagePickerMediaTypes = ImagePicker.MediaTypeOptions.Videos;
      } else if (mediaTypes === 'all') {
        imagePickerMediaTypes = ImagePicker.MediaTypeOptions.All;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: imagePickerMediaTypes,
        allowsMultipleSelection,
        quality,
        allowsEditing,
        aspect,
      });

      if (result.canceled) {
        logger.info('Photo selection canceled');
        return null;
      }

      const assets: PhotoAsset[] = result.assets.map((asset) => ({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: asset.type as 'image' | 'video',
        fileName: asset.fileName,
        fileSize: asset.fileSize,
      }));

      logger.info('Photos selected from library', { count: assets.length });
      return assets;
    } catch (error) {
      logger.error('Failed to pick photo from library', error);
      return null;
    }
  }

  /**
   * Take photo with camera
   */
  async takePhoto(options: PhotoPickerOptions = {}): Promise<PhotoAsset | null> {
    try {
      // Ensure camera permission
      const hasPermission = await permissions.ensurePermission('camera');
      if (!hasPermission) {
        logger.warn('Camera permission denied');
        return null;
      }

      const { quality = 0.8, allowsEditing = false, aspect } = options;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality,
        allowsEditing,
        aspect,
      });

      if (result.canceled) {
        logger.info('Camera capture canceled');
        return null;
      }

      const asset = result.assets[0];
      const photo: PhotoAsset = {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: 'image',
        fileName: asset.fileName,
        fileSize: asset.fileSize,
      };

      logger.info('Photo captured from camera');
      return photo;
    } catch (error) {
      logger.error('Failed to take photo with camera', error);
      return null;
    }
  }

  /**
   * Get random photos from library (for Privacy Social's random selection feature)
   * Note: This is a placeholder. Actual implementation will require native modules
   * or more sophisticated approach to access photo library metadata
   */
  async getRandomPhotos(count: number = 1): Promise<PhotoAsset[] | null> {
    try {
      // For now, use the picker to select photos
      // TODO: Implement native module for true random selection without user interaction
      logger.info('Random photo selection - using picker', { count });

      return await this.pickFromLibrary({
        allowsMultipleSelection: count > 1,
      });
    } catch (error) {
      logger.error('Failed to get random photos', error);
      return null;
    }
  }
}

// Export singleton instance
let photoPickerServiceInstance: PhotoPickerService | null = null;

export function getPhotoPickerService(): PhotoPickerService {
  if (!photoPickerServiceInstance) {
    photoPickerServiceInstance = new PhotoPickerService();
  }
  return photoPickerServiceInstance;
}

// Export convenience functions
export const photoPicker = {
  pickFromLibrary: (options?: PhotoPickerOptions) =>
    getPhotoPickerService().pickFromLibrary(options),
  takePhoto: (options?: PhotoPickerOptions) =>
    getPhotoPickerService().takePhoto(options),
  getRandomPhotos: (count?: number) =>
    getPhotoPickerService().getRandomPhotos(count),
};
