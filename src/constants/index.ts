/**
 * Application constants and configuration values
 */

export const APP_CONFIG = {
  // Content lifecycle
  CONTENT_EXPIRY_DAYS: 30,
  REVIEW_WINDOW_HOURS: 3,

  // Image optimization
  IMAGE_QUALITY: {
    THUMBNAIL: 0.6,
    MEDIUM: 0.75,
    FULL: 0.85,
  },

  IMAGE_MAX_DIMENSIONS: {
    THUMBNAIL: { width: 150, height: 150 },
    MEDIUM: { width: 720, height: 1280 },
    FULL: { width: 1080, height: 1920 },
  },

  // Upload limits
  MAX_UPLOAD_SIZE_MB: 10,
  MAX_CAPTION_LENGTH: 500,
  MAX_COMMENT_LENGTH: 280,

  // Group limits
  MAX_GROUP_MEMBERS: 50,
  MIN_GROUP_NAME_LENGTH: 3,
  MAX_GROUP_NAME_LENGTH: 50,

  // Notification types
  NOTIFICATION_TYPES: {
    DAILY_SELECTION: 'daily_selection',
    NEW_COMMENT: 'new_comment',
    NEW_REACTION: 'new_reaction',
    GROUP_INVITE: 'group_invite',
    CONTENT_EXPIRING: 'content_expiring',
  },

  // Storage keys
  STORAGE_KEYS: {
    ONBOARDING_COMPLETED: '@onboarding_completed',
    AUTO_PUBLISH_MODE: '@auto_publish_mode',
    AUTH_TOKEN: '@auth_token',
    USER_PREFERENCES: '@user_preferences',
  },
} as const;

export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',

  text: {
    primary: '#000000',
    secondary: '#3C3C43',
    tertiary: '#8E8E93',
  },

  background: {
    primary: '#FFFFFF',
    secondary: '#F2F2F7',
    tertiary: '#E5E5EA',
  },

  border: '#C6C6C8',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const TYPOGRAPHY = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
} as const;

export const ONBOARDING_SLIDES = [
  {
    id: 1,
    title: 'Welcome to Privacy Social',
    description: 'A new way to share moments with your closest friends while maintaining complete control over your privacy.',
  },
  {
    id: 2,
    title: 'Random Photo Selection',
    description: 'Every day, a random photo from your gallery is selected. You choose whether to share it with your private groups.',
  },
  {
    id: 3,
    title: 'Your Choice, Your Control',
    description: 'Review and approve photos before sharing, or enable auto-publish for spontaneous moments. You can change this anytime.',
  },
  {
    id: 4,
    title: 'Privacy First',
    description: 'All content expires after 30 days. End-to-end encryption keeps your moments private. No public feeds, no algorithms.',
  },
] as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  AUTH_FAILED: 'Authentication failed. Please try again.',
  PERMISSION_DENIED: 'Permission denied. Please enable the required permissions in settings.',
  UPLOAD_FAILED: 'Failed to upload photo. Please try again.',
  INVALID_INPUT: 'Invalid input. Please check your entry.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
} as const;
