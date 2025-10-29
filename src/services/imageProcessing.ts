/**
 * Image Processing Service
 * Handles EXIF stripping, compression, format conversion, and multi-resolution generation
 */

import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { logger } from './logger';
import { useNetworkStore } from './network';

export interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
  fileSize: number;
  format: 'jpeg' | 'png' | 'webp';
}

export interface MultiResolutionImages {
  thumbnail: ProcessedImage;
  medium: ProcessedImage;
  full: ProcessedImage;
  originalUri: string;
}

export interface CompressionOptions {
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  maxWidth?: number;
  maxHeight?: number;
  stripEXIF?: boolean;
}

class ImageProcessingService {
  /**
   * Strip EXIF data from image
   * This is done automatically by expo-image-manipulator when we manipulate the image
   */
  async stripEXIF(uri: string): Promise<string | null> {
    try {
      // Simply manipulating the image with no changes will strip EXIF
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [], // No actions - just re-save
        {
          compress: 1, // No compression
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      logger.info('EXIF data stripped', { originalUri: uri, newUri: result.uri });
      return result.uri;
    } catch (error) {
      logger.error('Failed to strip EXIF', error, { uri });
      return null;
    }
  }

  /**
   * Compress image with adaptive quality based on network conditions
   */
  async compressImage(
    uri: string,
    options: CompressionOptions = {}
  ): Promise<ProcessedImage | null> {
    try {
      const {
        quality = this.getAdaptiveQuality(),
        format = 'jpeg',
        maxWidth,
        maxHeight,
        stripEXIF = true,
      } = options;

      // Get original image info
      const info = await FileSystem.getInfoAsync(uri);
      if (!info.exists) {
        logger.error('Image file does not exist', { uri });
        return null;
      }

      // Prepare manipulation actions
      const actions: ImageManipulator.Action[] = [];

      // Resize if max dimensions specified
      if (maxWidth || maxHeight) {
        actions.push({
          resize: {
            width: maxWidth,
            height: maxHeight,
          },
        });
      }

      // Determine save format
      let saveFormat: ImageManipulator.SaveFormat;
      switch (format) {
        case 'png':
          saveFormat = ImageManipulator.SaveFormat.PNG;
          break;
        case 'webp':
          saveFormat = ImageManipulator.SaveFormat.WEBP;
          break;
        case 'jpeg':
        default:
          saveFormat = ImageManipulator.SaveFormat.JPEG;
          break;
      }

      // Process image
      const result = await ImageManipulator.manipulateAsync(uri, actions, {
        compress: quality,
        format: saveFormat,
      });

      // Get file size
      const fileInfo = await FileSystem.getInfoAsync(result.uri);
      const fileSize = fileInfo.exists && 'size' in fileInfo ? fileInfo.size || 0 : 0;

      logger.info('Image compressed', {
        originalUri: uri,
        newUri: result.uri,
        quality,
        format,
        fileSize,
      });

      return {
        uri: result.uri,
        width: result.width,
        height: result.height,
        fileSize,
        format,
      };
    } catch (error) {
      logger.error('Failed to compress image', error, { uri, options });
      return null;
    }
  }

  /**
   * Get adaptive quality based on network conditions
   */
  getAdaptiveQuality(): number {
    const { type, isConnected } = useNetworkStore.getState();

    if (!isConnected) {
      return 0.5; // Low quality when offline (for caching)
    }

    switch (type) {
      case 'wifi':
        return 0.9; // High quality on WiFi
      case 'cellular':
        return 0.7; // Medium quality on cellular
      case 'ethernet':
        return 0.95; // Very high quality on ethernet
      default:
        return 0.8; // Default medium-high quality
    }
  }

  /**
   * Generate multi-resolution images (thumbnail, medium, full)
   */
  async generateMultiResolution(
    uri: string
  ): Promise<MultiResolutionImages | null> {
    try {
      // Thumbnail: 150x150
      const thumbnail = await this.compressImage(uri, {
        maxWidth: 150,
        maxHeight: 150,
        quality: 0.7,
        format: 'jpeg',
        stripEXIF: true,
      });

      if (!thumbnail) {
        logger.error('Failed to generate thumbnail');
        return null;
      }

      // Medium: 800x800
      const medium = await this.compressImage(uri, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8,
        format: 'jpeg',
        stripEXIF: true,
      });

      if (!medium) {
        logger.error('Failed to generate medium resolution');
        return null;
      }

      // Full: Original size with compression and EXIF stripping
      const full = await this.compressImage(uri, {
        quality: this.getAdaptiveQuality(),
        format: 'jpeg',
        stripEXIF: true,
      });

      if (!full) {
        logger.error('Failed to generate full resolution');
        return null;
      }

      logger.info('Multi-resolution images generated', {
        thumbnail: thumbnail.fileSize,
        medium: medium.fileSize,
        full: full.fileSize,
      });

      return {
        thumbnail,
        medium,
        full,
        originalUri: uri,
      };
    } catch (error) {
      logger.error('Failed to generate multi-resolution images', error, { uri });
      return null;
    }
  }

  /**
   * Convert image to WebP format
   */
  async convertToWebP(uri: string, quality: number = 0.8): Promise<ProcessedImage | null> {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [],
        {
          compress: quality,
          format: ImageManipulator.SaveFormat.WEBP,
        }
      );

      const fileInfo = await FileSystem.getInfoAsync(result.uri);
      const fileSize = fileInfo.exists && 'size' in fileInfo ? fileInfo.size || 0 : 0;

      logger.info('Image converted to WebP', {
        originalUri: uri,
        newUri: result.uri,
        fileSize,
      });

      return {
        uri: result.uri,
        width: result.width,
        height: result.height,
        fileSize,
        format: 'webp',
      };
    } catch (error) {
      logger.error('Failed to convert to WebP', error, { uri });
      return null;
    }
  }

  /**
   * Get image dimensions without processing
   */
  async getImageDimensions(uri: string): Promise<{ width: number; height: number } | null> {
    try {
      // Use manipulateAsync with no actions to get dimensions
      const result = await ImageManipulator.manipulateAsync(uri, [], {
        compress: 1,
        format: ImageManipulator.SaveFormat.JPEG,
      });

      return {
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      logger.error('Failed to get image dimensions', error, { uri });
      return null;
    }
  }

  /**
   * Calculate file size reduction percentage
   */
  async calculateCompressionRatio(
    originalUri: string,
    compressedUri: string
  ): Promise<number> {
    try {
      const originalInfo = await FileSystem.getInfoAsync(originalUri);
      const compressedInfo = await FileSystem.getInfoAsync(compressedUri);

      if (!originalInfo.exists || !compressedInfo.exists) {
        return 0;
      }

      const originalSize = 'size' in originalInfo ? originalInfo.size || 0 : 0;
      const compressedSize = 'size' in compressedInfo ? compressedInfo.size || 0 : 0;

      if (originalSize === 0) return 0;

      const reduction = ((originalSize - compressedSize) / originalSize) * 100;
      return Math.round(reduction);
    } catch (error) {
      logger.error('Failed to calculate compression ratio', error);
      return 0;
    }
  }
}

// Export singleton instance
let imageProcessingServiceInstance: ImageProcessingService | null = null;

export function getImageProcessingService(): ImageProcessingService {
  if (!imageProcessingServiceInstance) {
    imageProcessingServiceInstance = new ImageProcessingService();
  }
  return imageProcessingServiceInstance;
}

// Export convenience functions
export const imageProcessing = {
  stripEXIF: (uri: string) => getImageProcessingService().stripEXIF(uri),
  compressImage: (uri: string, options?: CompressionOptions) =>
    getImageProcessingService().compressImage(uri, options),
  getAdaptiveQuality: () => getImageProcessingService().getAdaptiveQuality(),
  generateMultiResolution: (uri: string) =>
    getImageProcessingService().generateMultiResolution(uri),
  convertToWebP: (uri: string, quality?: number) =>
    getImageProcessingService().convertToWebP(uri, quality),
  getImageDimensions: (uri: string) =>
    getImageProcessingService().getImageDimensions(uri),
  calculateCompressionRatio: (originalUri: string, compressedUri: string) =>
    getImageProcessingService().calculateCompressionRatio(originalUri, compressedUri),
};
