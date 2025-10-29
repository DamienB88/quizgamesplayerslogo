/**
 * Photo Upload Service
 * Handles photo uploads with progress tracking, retry logic, and error handling
 */

import * as FileSystem from 'expo-file-system';
import { supabase } from '@/config/supabase';
import { logger } from './logger';
import { MultiResolutionImages } from './imageProcessing';

export interface UploadProgress {
  photoId: string;
  totalBytes: number;
  sentBytes: number;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

export interface UploadResult {
  success: boolean;
  photoId: string;
  urls?: {
    thumbnail: string;
    medium: string;
    full: string;
  };
  error?: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

class PhotoUploadService {
  private uploadProgress: Map<string, UploadProgress> = new Map();
  private uploadCallbacks: Map<string, (progress: UploadProgress) => void> = new Map();

  /**
   * Upload photo with all resolutions
   */
  async uploadPhoto(
    photoId: string,
    userId: string,
    groupId: string,
    images: MultiResolutionImages,
    caption?: string
  ): Promise<UploadResult> {
    try {
      logger.info('Starting photo upload', { photoId, userId, groupId });

      // Initialize progress
      this.updateProgress(photoId, {
        photoId,
        totalBytes: 0,
        sentBytes: 0,
        progress: 0,
        status: 'pending',
      });

      // Upload each resolution with retry logic
      const thumbnailUrl = await this.uploadWithRetry(
        images.thumbnail.uri,
        `${userId}/${groupId}/${photoId}/thumbnail.jpg`,
        photoId
      );

      if (!thumbnailUrl) {
        throw new Error('Failed to upload thumbnail');
      }

      const mediumUrl = await this.uploadWithRetry(
        images.medium.uri,
        `${userId}/${groupId}/${photoId}/medium.jpg`,
        photoId
      );

      if (!mediumUrl) {
        throw new Error('Failed to upload medium resolution');
      }

      const fullUrl = await this.uploadWithRetry(
        images.full.uri,
        `${userId}/${groupId}/${photoId}/full.jpg`,
        photoId
      );

      if (!fullUrl) {
        throw new Error('Failed to upload full resolution');
      }

      // Create database record
      const { error: dbError } = await supabase.from('shares').insert({
        user_id: userId,
        group_id: groupId,
        photo_id: photoId,
        thumbnail_url: thumbnailUrl,
        medium_url: mediumUrl,
        full_url: fullUrl,
        caption: caption || null,
        created_at: new Date().toISOString(),
      });

      if (dbError) {
        logger.error('Failed to create share record', dbError);
        throw dbError;
      }

      // Update progress to completed
      this.updateProgress(photoId, {
        photoId,
        totalBytes: 100,
        sentBytes: 100,
        progress: 100,
        status: 'completed',
      });

      logger.info('Photo upload completed', { photoId, urls: { thumbnailUrl, mediumUrl, fullUrl } });

      return {
        success: true,
        photoId,
        urls: {
          thumbnail: thumbnailUrl,
          medium: mediumUrl,
          full: fullUrl,
        },
      };
    } catch (error) {
      logger.error('Photo upload failed', error, { photoId });

      this.updateProgress(photoId, {
        photoId,
        totalBytes: 0,
        sentBytes: 0,
        progress: 0,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        success: false,
        photoId,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Upload single file with retry logic
   */
  private async uploadWithRetry(
    localUri: string,
    storagePath: string,
    photoId: string,
    retryCount: number = 0
  ): Promise<string | null> {
    try {
      // Read file as base64
      const fileData = await FileSystem.readAsStringAsync(localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to blob
      const byteCharacters = atob(fileData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(storagePath, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(storagePath);

      logger.info('File uploaded successfully', { storagePath, url: urlData.publicUrl });
      return urlData.publicUrl;
    } catch (error) {
      logger.error(`Upload attempt ${retryCount + 1} failed`, error, { storagePath });

      // Retry logic
      if (retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * Math.pow(2, retryCount); // Exponential backoff
        logger.info(`Retrying upload in ${delay}ms`, { storagePath, retryCount: retryCount + 1 });

        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.uploadWithRetry(localUri, storagePath, photoId, retryCount + 1);
      }

      logger.error('Max retries reached, upload failed', error, { storagePath });
      return null;
    }
  }

  /**
   * Subscribe to upload progress
   */
  subscribeToProgress(
    photoId: string,
    callback: (progress: UploadProgress) => void
  ): () => void {
    this.uploadCallbacks.set(photoId, callback);

    // Send current progress immediately
    const current = this.uploadProgress.get(photoId);
    if (current) {
      callback(current);
    }

    // Return unsubscribe function
    return () => {
      this.uploadCallbacks.delete(photoId);
    };
  }

  /**
   * Get current upload progress
   */
  getProgress(photoId: string): UploadProgress | null {
    return this.uploadProgress.get(photoId) || null;
  }

  /**
   * Cancel upload (if possible)
   */
  async cancelUpload(photoId: string): Promise<boolean> {
    try {
      // Update progress to cancelled
      this.updateProgress(photoId, {
        photoId,
        totalBytes: 0,
        sentBytes: 0,
        progress: 0,
        status: 'failed',
        error: 'Upload cancelled by user',
      });

      logger.info('Upload cancelled', { photoId });
      return true;
    } catch (error) {
      logger.error('Failed to cancel upload', error, { photoId });
      return false;
    }
  }

  /**
   * Update progress and notify subscribers
   */
  private updateProgress(photoId: string, progress: UploadProgress): void {
    this.uploadProgress.set(photoId, progress);

    const callback = this.uploadCallbacks.get(photoId);
    if (callback) {
      callback(progress);
    }
  }

  /**
   * Clear completed uploads from memory
   */
  clearCompletedUploads(): void {
    for (const [photoId, progress] of this.uploadProgress.entries()) {
      if (progress.status === 'completed' || progress.status === 'failed') {
        this.uploadProgress.delete(photoId);
        this.uploadCallbacks.delete(photoId);
      }
    }
  }
}

// Export singleton instance
let photoUploadServiceInstance: PhotoUploadService | null = null;

export function getPhotoUploadService(): PhotoUploadService {
  if (!photoUploadServiceInstance) {
    photoUploadServiceInstance = new PhotoUploadService();
  }
  return photoUploadServiceInstance;
}

// Export convenience functions
export const photoUpload = {
  uploadPhoto: (
    photoId: string,
    userId: string,
    groupId: string,
    images: MultiResolutionImages,
    caption?: string
  ) => getPhotoUploadService().uploadPhoto(photoId, userId, groupId, images, caption),
  subscribeToProgress: (photoId: string, callback: (progress: UploadProgress) => void) =>
    getPhotoUploadService().subscribeToProgress(photoId, callback),
  getProgress: (photoId: string) => getPhotoUploadService().getProgress(photoId),
  cancelUpload: (photoId: string) => getPhotoUploadService().cancelUpload(photoId),
  clearCompletedUploads: () => getPhotoUploadService().clearCompletedUploads(),
};
