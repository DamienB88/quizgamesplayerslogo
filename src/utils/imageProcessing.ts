import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { IMAGE_CONFIG } from '@/constants';
import type { ImageAsset } from '@/types';

/**
 * Compresses and resizes an image for optimal storage and performance
 */
export async function compressImage(
  uri: string,
  quality: number = IMAGE_CONFIG.COMPRESSION_QUALITY
): Promise<string> {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: IMAGE_CONFIG.MAX_WIDTH,
            height: IMAGE_CONFIG.MAX_HEIGHT,
          },
        },
      ],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.WEBP,
      }
    );

    return manipResult.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
}

/**
 * Creates a thumbnail version of an image
 */
export async function createThumbnail(uri: string): Promise<string> {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: IMAGE_CONFIG.THUMBNAIL_WIDTH,
            height: IMAGE_CONFIG.THUMBNAIL_HEIGHT,
          },
        },
      ],
      {
        compress: IMAGE_CONFIG.COMPRESSION_QUALITY,
        format: ImageManipulator.SaveFormat.WEBP,
      }
    );

    return manipResult.uri;
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    throw error;
  }
}

/**
 * Strips EXIF metadata from an image for privacy
 * Note: expo-image-manipulator already removes EXIF data when processing
 */
export async function stripMetadata(uri: string): Promise<string> {
  // Process the image to remove metadata
  return await compressImage(uri, 1.0);
}

/**
 * Gets image file information
 */
export async function getImageInfo(uri: string): Promise<{
  size: number;
  width: number;
  height: number;
}> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    const imageInfo = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 1,
      format: ImageManipulator.SaveFormat.WEBP,
    });

    return {
      size: fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0,
      width: imageInfo.width,
      height: imageInfo.height,
    };
  } catch (error) {
    console.error('Error getting image info:', error);
    throw error;
  }
}

/**
 * Validates if a file is a supported image format
 */
export function isSupportedImageFormat(fileName: string): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return IMAGE_CONFIG.SUPPORTED_FORMATS.includes(extension as any);
}

/**
 * Process image for upload: compress, create thumbnail, strip metadata
 */
export async function processImageForUpload(uri: string): Promise<{
  fullImage: string;
  thumbnail: string;
  metadata: {
    width: number;
    height: number;
    size: number;
  };
}> {
  try {
    // Strip metadata and compress
    const processedUri = await stripMetadata(uri);

    // Create thumbnail
    const thumbnailUri = await createThumbnail(processedUri);

    // Get image info
    const info = await getImageInfo(processedUri);

    return {
      fullImage: processedUri,
      thumbnail: thumbnailUri,
      metadata: info,
    };
  } catch (error) {
    console.error('Error processing image for upload:', error);
    throw error;
  }
}
