/**
 * Photo Selection Service
 * Handles random photo selection from device library
 */

import * as MediaLibrary from 'expo-media-library';
import { logger } from './logger';
import { permissions } from './permissions';

export interface PhotoInfo {
  id: string;
  uri: string;
  filename: string;
  width: number;
  height: number;
  creationTime: number;
  modificationTime: number;
  duration?: number;
  mediaType: 'photo' | 'video';
}

export interface SelectionResult {
  photo: PhotoInfo;
  totalPhotos: number;
  selectionTimestamp: string;
}

class PhotoSelectionService {
  /**
   * Get random photo from device library
   */
  async selectRandomPhoto(): Promise<SelectionResult | null> {
    try {
      // Ensure photo library permission
      const hasPermission = await permissions.ensurePermission('photos');
      if (!hasPermission) {
        logger.error('Photo library permission denied for random selection');
        return null;
      }

      // Get total number of photos
      const albumInfo = await MediaLibrary.getAlbumAsync('Camera Roll');
      if (!albumInfo) {
        logger.error('Could not access Camera Roll album');
        return null;
      }

      const assets = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        first: 1000, // Get first 1000 to have a good pool
        sortBy: MediaLibrary.SortBy.creationTime,
      });

      if (assets.assets.length === 0) {
        logger.warn('No photos found in library');
        return null;
      }

      // Randomly select one photo
      const randomIndex = Math.floor(Math.random() * assets.assets.length);
      const selectedAsset = assets.assets[randomIndex];

      const photo: PhotoInfo = {
        id: selectedAsset.id,
        uri: selectedAsset.uri,
        filename: selectedAsset.filename,
        width: selectedAsset.width,
        height: selectedAsset.height,
        creationTime: selectedAsset.creationTime,
        modificationTime: selectedAsset.modificationTime,
        duration: selectedAsset.duration,
        mediaType: selectedAsset.mediaType,
      };

      logger.info('Random photo selected', {
        photoId: photo.id,
        totalPhotos: assets.assets.length,
      });

      return {
        photo,
        totalPhotos: assets.assets.length,
        selectionTimestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Failed to select random photo', error);
      return null;
    }
  }

  /**
   * Get multiple random photos (for batch selection)
   */
  async selectMultipleRandomPhotos(count: number): Promise<PhotoInfo[]> {
    try {
      const hasPermission = await permissions.ensurePermission('photos');
      if (!hasPermission) {
        logger.error('Photo library permission denied');
        return [];
      }

      const assets = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        first: 1000,
        sortBy: MediaLibrary.SortBy.creationTime,
      });

      if (assets.assets.length === 0) {
        return [];
      }

      // Shuffle and take 'count' photos
      const shuffled = [...assets.assets].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(count, assets.assets.length));

      return selected.map((asset) => ({
        id: asset.id,
        uri: asset.uri,
        filename: asset.filename,
        width: asset.width,
        height: asset.height,
        creationTime: asset.creationTime,
        modificationTime: asset.modificationTime,
        duration: asset.duration,
        mediaType: asset.mediaType,
      }));
    } catch (error) {
      logger.error('Failed to select multiple random photos', error);
      return [];
    }
  }

  /**
   * Get photo info by ID
   */
  async getPhotoById(id: string): Promise<PhotoInfo | null> {
    try {
      const asset = await MediaLibrary.getAssetInfoAsync(id);
      if (!asset) {
        logger.error('Photo not found', { photoId: id });
        return null;
      }

      return {
        id: asset.id,
        uri: asset.uri,
        filename: asset.filename,
        width: asset.width,
        height: asset.height,
        creationTime: asset.creationTime,
        modificationTime: asset.modificationTime,
        duration: asset.duration,
        mediaType: asset.mediaType,
      };
    } catch (error) {
      logger.error('Failed to get photo by ID', error, { photoId: id });
      return null;
    }
  }

  /**
   * Get total photo count in library
   */
  async getTotalPhotoCount(): Promise<number> {
    try {
      const hasPermission = await permissions.ensurePermission('photos');
      if (!hasPermission) {
        return 0;
      }

      const assets = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        first: 1,
      });

      return assets.totalCount;
    } catch (error) {
      logger.error('Failed to get total photo count', error);
      return 0;
    }
  }
}

// Export singleton instance
let photoSelectionServiceInstance: PhotoSelectionService | null = null;

export function getPhotoSelectionService(): PhotoSelectionService {
  if (!photoSelectionServiceInstance) {
    photoSelectionServiceInstance = new PhotoSelectionService();
  }
  return photoSelectionServiceInstance;
}

// Export convenience functions
export const photoSelection = {
  selectRandomPhoto: () => getPhotoSelectionService().selectRandomPhoto(),
  selectMultipleRandomPhotos: (count: number) =>
    getPhotoSelectionService().selectMultipleRandomPhotos(count),
  getPhotoById: (id: string) => getPhotoSelectionService().getPhotoById(id),
  getTotalPhotoCount: () => getPhotoSelectionService().getTotalPhotoCount(),
};
