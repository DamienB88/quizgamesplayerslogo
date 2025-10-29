/**
 * Photo Cache Service
 * Secure local photo caching with expiration and size limits
 */

import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

interface CachedPhotoMetadata {
  id: string;
  uri: string;
  localUri: string;
  timestamp: string;
  expiresAt: string;
  fileSize: number;
  resolution: 'thumbnail' | 'medium' | 'full';
}

interface CacheStats {
  totalItems: number;
  totalSize: number;
  oldestItem: string | null;
  newestItem: string | null;
}

const CACHE_DIR = `${FileSystem.cacheDirectory}photos/`;
const CACHE_METADATA_KEY = 'photo_cache_metadata';
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
const DEFAULT_EXPIRATION_DAYS = 7;

class PhotoCacheService {
  /**
   * Initialize cache directory
   */
  async initialize(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
        logger.info('Photo cache directory created', { path: CACHE_DIR });
      }
    } catch (error) {
      logger.error('Failed to initialize photo cache', error);
    }
  }

  /**
   * Cache a photo locally
   */
  async cachePhoto(
    id: string,
    uri: string,
    resolution: 'thumbnail' | 'medium' | 'full',
    expirationDays: number = DEFAULT_EXPIRATION_DAYS
  ): Promise<string | null> {
    try {
      await this.initialize();

      // Generate local filename
      const filename = `${id}_${resolution}_${Date.now()}.jpg`;
      const localUri = `${CACHE_DIR}${filename}`;

      // Copy file to cache
      await FileSystem.copyAsync({
        from: uri,
        to: localUri,
      });

      // Get file size
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      const fileSize = fileInfo.exists && 'size' in fileInfo ? fileInfo.size || 0 : 0;

      // Save metadata
      const metadata: CachedPhotoMetadata = {
        id,
        uri,
        localUri,
        timestamp: new Date().toISOString(),
        expiresAt: new Date(
          Date.now() + expirationDays * 24 * 60 * 60 * 1000
        ).toISOString(),
        fileSize,
        resolution,
      };

      await this.saveMetadata(metadata);

      // Check cache size and cleanup if needed
      await this.cleanupIfNeeded();

      logger.info('Photo cached', { id, resolution, fileSize, localUri });
      return localUri;
    } catch (error) {
      logger.error('Failed to cache photo', error, { id, uri, resolution });
      return null;
    }
  }

  /**
   * Get cached photo URI
   */
  async getCachedPhoto(
    id: string,
    resolution: 'thumbnail' | 'medium' | 'full'
  ): Promise<string | null> {
    try {
      const allMetadata = await this.getAllMetadata();
      const metadata = allMetadata.find(
        (m) => m.id === id && m.resolution === resolution
      );

      if (!metadata) {
        return null;
      }

      // Check if expired
      if (new Date(metadata.expiresAt) < new Date()) {
        logger.info('Cached photo expired', { id, resolution });
        await this.deleteCachedPhoto(id, resolution);
        return null;
      }

      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(metadata.localUri);
      if (!fileInfo.exists) {
        logger.warn('Cached photo file missing', { id, resolution });
        await this.removeMetadata(metadata.id, metadata.resolution);
        return null;
      }

      return metadata.localUri;
    } catch (error) {
      logger.error('Failed to get cached photo', error, { id, resolution });
      return null;
    }
  }

  /**
   * Delete cached photo
   */
  async deleteCachedPhoto(
    id: string,
    resolution: 'thumbnail' | 'medium' | 'full'
  ): Promise<boolean> {
    try {
      const allMetadata = await this.getAllMetadata();
      const metadata = allMetadata.find(
        (m) => m.id === id && m.resolution === resolution
      );

      if (!metadata) {
        return false;
      }

      // Delete file
      const fileInfo = await FileSystem.getInfoAsync(metadata.localUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(metadata.localUri);
      }

      // Remove metadata
      await this.removeMetadata(id, resolution);

      logger.info('Cached photo deleted', { id, resolution });
      return true;
    } catch (error) {
      logger.error('Failed to delete cached photo', error, { id, resolution });
      return false;
    }
  }

  /**
   * Clear all cached photos
   */
  async clearCache(): Promise<boolean> {
    try {
      // Delete cache directory
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
      }

      // Clear metadata
      await AsyncStorage.removeItem(CACHE_METADATA_KEY);

      // Recreate directory
      await this.initialize();

      logger.info('Photo cache cleared');
      return true;
    } catch (error) {
      logger.error('Failed to clear cache', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<CacheStats> {
    try {
      const allMetadata = await this.getAllMetadata();

      if (allMetadata.length === 0) {
        return {
          totalItems: 0,
          totalSize: 0,
          oldestItem: null,
          newestItem: null,
        };
      }

      const totalSize = allMetadata.reduce((sum, m) => sum + m.fileSize, 0);
      const sorted = [...allMetadata].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      return {
        totalItems: allMetadata.length,
        totalSize,
        oldestItem: sorted[0].timestamp,
        newestItem: sorted[sorted.length - 1].timestamp,
      };
    } catch (error) {
      logger.error('Failed to get cache stats', error);
      return {
        totalItems: 0,
        totalSize: 0,
        oldestItem: null,
        newestItem: null,
      };
    }
  }

  /**
   * Cleanup expired photos and enforce size limit
   */
  async cleanupIfNeeded(): Promise<void> {
    try {
      const allMetadata = await this.getAllMetadata();
      const now = new Date();

      // Remove expired photos
      const validMetadata = [];
      for (const metadata of allMetadata) {
        if (new Date(metadata.expiresAt) < now) {
          await this.deleteCachedPhoto(metadata.id, metadata.resolution);
        } else {
          validMetadata.push(metadata);
        }
      }

      // Check total size
      const totalSize = validMetadata.reduce((sum, m) => sum + m.fileSize, 0);

      if (totalSize > MAX_CACHE_SIZE) {
        // Remove oldest photos until under limit
        const sorted = [...validMetadata].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        let currentSize = totalSize;
        for (const metadata of sorted) {
          if (currentSize <= MAX_CACHE_SIZE * 0.8) {
            break; // Keep 20% buffer
          }

          await this.deleteCachedPhoto(metadata.id, metadata.resolution);
          currentSize -= metadata.fileSize;
        }

        logger.info('Cache cleanup completed', { removedSize: totalSize - currentSize });
      }
    } catch (error) {
      logger.error('Failed to cleanup cache', error);
    }
  }

  /**
   * Save metadata for cached photo
   */
  private async saveMetadata(metadata: CachedPhotoMetadata): Promise<void> {
    const allMetadata = await this.getAllMetadata();
    const filtered = allMetadata.filter(
      (m) => !(m.id === metadata.id && m.resolution === metadata.resolution)
    );
    filtered.push(metadata);
    await AsyncStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(filtered));
  }

  /**
   * Remove metadata for cached photo
   */
  private async removeMetadata(
    id: string,
    resolution: 'thumbnail' | 'medium' | 'full'
  ): Promise<void> {
    const allMetadata = await this.getAllMetadata();
    const filtered = allMetadata.filter(
      (m) => !(m.id === id && m.resolution === resolution)
    );
    await AsyncStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(filtered));
  }

  /**
   * Get all cached photo metadata
   */
  private async getAllMetadata(): Promise<CachedPhotoMetadata[]> {
    try {
      const data = await AsyncStorage.getItem(CACHE_METADATA_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      logger.error('Failed to get cache metadata', error);
      return [];
    }
  }
}

// Export singleton instance
let photoCacheServiceInstance: PhotoCacheService | null = null;

export function getPhotoCacheService(): PhotoCacheService {
  if (!photoCacheServiceInstance) {
    photoCacheServiceInstance = new PhotoCacheService();
  }
  return photoCacheServiceInstance;
}

// Export convenience functions
export const photoCache = {
  initialize: () => getPhotoCacheService().initialize(),
  cachePhoto: (
    id: string,
    uri: string,
    resolution: 'thumbnail' | 'medium' | 'full',
    expirationDays?: number
  ) => getPhotoCacheService().cachePhoto(id, uri, resolution, expirationDays),
  getCachedPhoto: (id: string, resolution: 'thumbnail' | 'medium' | 'full') =>
    getPhotoCacheService().getCachedPhoto(id, resolution),
  deleteCachedPhoto: (id: string, resolution: 'thumbnail' | 'medium' | 'full') =>
    getPhotoCacheService().deleteCachedPhoto(id, resolution),
  clearCache: () => getPhotoCacheService().clearCache(),
  getCacheStats: () => getPhotoCacheService().getCacheStats(),
  cleanupIfNeeded: () => getPhotoCacheService().cleanupIfNeeded(),
};
