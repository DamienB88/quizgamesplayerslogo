/**
 * Photo Store
 * Manages photo selection, processing, and upload state
 */

import { create } from 'zustand';
import { photoSelection, PhotoInfo, SelectionResult } from '@/services/photoSelection';
import { imageProcessing, MultiResolutionImages } from '@/services/imageProcessing';
import { photoCache } from '@/services/photoCache';
import { photoUpload, UploadProgress } from '@/services/photoUpload';
import { logger } from '@/services/logger';

interface PhotoState {
  // Current selection
  currentPhoto: PhotoInfo | null;
  currentSelection: SelectionResult | null;
  processedImages: MultiResolutionImages | null;

  // UI state
  showPreviewModal: boolean;
  isProcessing: boolean;
  isUploading: boolean;
  uploadProgress: number;

  // Error state
  error: string | null;

  // Actions
  selectRandomPhoto: () => Promise<void>;
  processSelectedPhoto: () => Promise<void>;
  uploadPhoto: (userId: string, groupId: string, caption?: string) => Promise<boolean>;
  clearSelection: () => void;
  setShowPreviewModal: (show: boolean) => void;
  clearError: () => void;
}

export const usePhotoStore = create<PhotoState>((set, get) => ({
  // Initial state
  currentPhoto: null,
  currentSelection: null,
  processedImages: null,
  showPreviewModal: false,
  isProcessing: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,

  // Select random photo
  selectRandomPhoto: async () => {
    try {
      set({ isProcessing: true, error: null });

      logger.info('Selecting random photo');
      const selection = await photoSelection.selectRandomPhoto();

      if (!selection) {
        set({
          error: 'Failed to select photo. Please check permissions.',
          isProcessing: false,
        });
        return;
      }

      set({
        currentPhoto: selection.photo,
        currentSelection: selection,
        isProcessing: false,
        showPreviewModal: true,
      });

      logger.info('Photo selected successfully', { photoId: selection.photo.id });

      // Process photo in background
      get().processSelectedPhoto();
    } catch (error) {
      logger.error('Failed to select random photo', error);
      set({
        error: 'An error occurred while selecting photo',
        isProcessing: false,
      });
    }
  },

  // Process selected photo
  processSelectedPhoto: async () => {
    try {
      const { currentPhoto } = get();
      if (!currentPhoto) {
        logger.warn('No photo to process');
        return;
      }

      set({ isProcessing: true });
      logger.info('Processing photo', { photoId: currentPhoto.id });

      // Generate multi-resolution images
      const processed = await imageProcessing.generateMultiResolution(currentPhoto.uri);

      if (!processed) {
        set({
          error: 'Failed to process photo',
          isProcessing: false,
        });
        return;
      }

      set({
        processedImages: processed,
        isProcessing: false,
      });

      // Cache processed images
      await photoCache.cachePhoto(
        currentPhoto.id,
        processed.thumbnail.uri,
        'thumbnail'
      );
      await photoCache.cachePhoto(currentPhoto.id, processed.medium.uri, 'medium');
      await photoCache.cachePhoto(currentPhoto.id, processed.full.uri, 'full');

      logger.info('Photo processed successfully', {
        photoId: currentPhoto.id,
        thumbnailSize: processed.thumbnail.fileSize,
        mediumSize: processed.medium.fileSize,
        fullSize: processed.full.fileSize,
      });
    } catch (error) {
      logger.error('Failed to process photo', error);
      set({
        error: 'Failed to process photo',
        isProcessing: false,
      });
    }
  },

  // Upload photo
  uploadPhoto: async (userId: string, groupId: string, caption?: string) => {
    try {
      const { currentPhoto, processedImages } = get();

      if (!currentPhoto || !processedImages) {
        logger.error('No photo or processed images to upload');
        set({ error: 'No photo to upload' });
        return false;
      }

      set({ isUploading: true, uploadProgress: 0, error: null });
      logger.info('Starting upload', { photoId: currentPhoto.id, userId, groupId });

      // Subscribe to progress
      const unsubscribe = photoUpload.subscribeToProgress(
        currentPhoto.id,
        (progress: UploadProgress) => {
          set({ uploadProgress: progress.progress });
        }
      );

      // Upload photo
      const result = await photoUpload.uploadPhoto(
        currentPhoto.id,
        userId,
        groupId,
        processedImages,
        caption
      );

      unsubscribe();

      if (!result.success) {
        set({
          error: result.error || 'Upload failed',
          isUploading: false,
          uploadProgress: 0,
        });
        return false;
      }

      logger.info('Photo uploaded successfully', {
        photoId: currentPhoto.id,
        urls: result.urls,
      });

      set({
        isUploading: false,
        uploadProgress: 100,
      });

      // Clear selection after successful upload
      setTimeout(() => {
        get().clearSelection();
      }, 1000);

      return true;
    } catch (error) {
      logger.error('Upload error', error);
      set({
        error: 'An error occurred during upload',
        isUploading: false,
        uploadProgress: 0,
      });
      return false;
    }
  },

  // Clear selection
  clearSelection: () => {
    set({
      currentPhoto: null,
      currentSelection: null,
      processedImages: null,
      showPreviewModal: false,
      isProcessing: false,
      isUploading: false,
      uploadProgress: 0,
      error: null,
    });
    logger.info('Selection cleared');
  },

  // Set show preview modal
  setShowPreviewModal: (show: boolean) => {
    set({ showPreviewModal: show });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
