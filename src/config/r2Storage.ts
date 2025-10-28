/**
 * CloudFlare R2 Storage configuration
 * This module will handle image uploads and storage management
 * Implementation will be completed in Phase 2
 */

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
}

export interface UploadOptions {
  key: string;
  file: Buffer | Blob;
  contentType: string;
  metadata?: Record<string, string>;
}

export interface StoragePath {
  userAvatar: (userId: string, filename: string) => string;
  shareOriginal: (shareId: string, filename: string) => string;
  shareMedium: (shareId: string, filename: string) => string;
  shareThumbnail: (shareId: string, filename: string) => string;
  temp: (uploadId: string, filename: string) => string;
}

/**
 * Storage path generators
 * Provides consistent paths for different types of uploads
 */
export const storagePaths: StoragePath = {
  userAvatar: (userId: string, filename: string) => `users/${userId}/avatar/${filename}`,

  shareOriginal: (shareId: string, filename: string) => `shares/${shareId}/original/${filename}`,

  shareMedium: (shareId: string, filename: string) => `shares/${shareId}/medium/${filename}`,

  shareThumbnail: (shareId: string, filename: string) =>
    `shares/${shareId}/thumbnail/${filename}`,

  temp: (uploadId: string, filename: string) => `temp/${uploadId}/${filename}`,
};

/**
 * Get R2 configuration from environment
 */
export const getR2Config = (): R2Config => {
  const config: R2Config = {
    accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID || '',
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
    bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || '',
    publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL || '',
  };

  // Validate configuration
  const missing = Object.entries(config)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.warn(`Missing R2 configuration: ${missing.join(', ')}`);
  }

  return config;
};

/**
 * Check if R2 is properly configured
 */
export const isR2Configured = (): boolean => {
  const config = getR2Config();
  return !!(
    config.accountId &&
    config.accessKeyId &&
    config.secretAccessKey &&
    config.bucketName
  );
};

/**
 * Generate a public URL for an R2 object
 */
export const getPublicUrl = (key: string): string => {
  const config = getR2Config();
  return `${config.publicUrl}/${key}`;
};

/**
 * Upload service interface
 * Actual implementation will be completed in Phase 2
 */
export interface UploadService {
  upload: (options: UploadOptions) => Promise<{ url: string; key: string }>;
  delete: (key: string) => Promise<void>;
  deleteMultiple: (keys: string[]) => Promise<void>;
  exists: (key: string) => Promise<boolean>;
}

// Placeholder for actual implementation
// Will be implemented using AWS S3 SDK in Phase 2
export const createUploadService = (): UploadService => {
  return {
    upload: async (_options: UploadOptions) => {
      throw new Error('Upload service not yet implemented. Will be added in Phase 2.');
    },
    delete: async (_key: string) => {
      throw new Error('Delete service not yet implemented. Will be added in Phase 2.');
    },
    deleteMultiple: async (_keys: string[]) => {
      throw new Error('Delete multiple service not yet implemented. Will be added in Phase 2.');
    },
    exists: async (_key: string) => {
      throw new Error('Exists check not yet implemented. Will be added in Phase 2.');
    },
  };
};
