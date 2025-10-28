// App Configuration Constants
export const APP_CONFIG = {
  APP_NAME: 'PrivacyFirst Social',
  VERSION: '1.0.0',
  REVIEW_WINDOW_HOURS: 3,
  CONTENT_EXPIRY_DAYS: 30,
  MAX_CAPTION_LENGTH: 500,
  MAX_COMMENT_LENGTH: 300,
  MAX_GROUP_MEMBERS: 50,
  MIN_GROUP_MEMBERS: 2,
  UNDO_TIMEOUT_SECONDS: 5,
} as const;

// Image Configuration
export const IMAGE_CONFIG = {
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1920,
  THUMBNAIL_WIDTH: 400,
  THUMBNAIL_HEIGHT: 400,
  COMPRESSION_QUALITY: 0.8,
  WEBP_QUALITY: 0.85,
  SUPPORTED_FORMATS: ['jpg', 'jpeg', 'png', 'webp'] as const,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  REFRESH_TOKEN: '@refresh_token',
  USER_DATA: '@user_data',
  ONBOARDING_COMPLETED: '@onboarding_completed',
  USER_PREFERENCES: '@user_preferences',
  SELECTED_PHOTOS_CACHE: '@selected_photos_cache',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_PHONE: '/auth/verify-phone',
  },
  USERS: {
    ME: '/users/me',
    UPDATE_PROFILE: '/users/profile',
    UPDATE_PREFERENCES: '/users/preferences',
  },
  GROUPS: {
    LIST: '/groups',
    CREATE: '/groups',
    DETAIL: (id: string) => `/groups/${id}`,
    MEMBERS: (id: string) => `/groups/${id}/members`,
    FEED: (id: string) => `/groups/${id}/feed`,
  },
  SHARES: {
    CREATE: '/shares',
    DETAIL: (id: string) => `/shares/${id}`,
    UPDATE: (id: string) => `/shares/${id}`,
    DELETE: (id: string) => `/shares/${id}`,
    COMMENTS: (id: string) => `/shares/${id}/comments`,
    REACTIONS: (id: string) => `/shares/${id}/reactions`,
  },
  DAILY_SELECTION: {
    CURRENT: '/daily-selection/current',
    ACCEPT: (id: string) => `/daily-selection/${id}/accept`,
    DECLINE: (id: string) => `/daily-selection/${id}/decline`,
  },
} as const;

// Colors (Light theme - will be expanded with dark theme)
export const COLORS = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  secondary: '#EC4899',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
} as const;

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Typography
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

// Animation Durations
export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_ERROR: 'Authentication failed. Please try again.',
  PERMISSION_DENIED: 'Permission denied. Please grant the required permissions.',
  PHOTO_SELECTION_ERROR: 'Failed to select photo. Please try again.',
  UPLOAD_ERROR: 'Failed to upload photo. Please try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  PHOTO_SHARED: 'Photo shared successfully!',
  COMMENT_POSTED: 'Comment posted!',
  CONTENT_DELETED: 'Content deleted successfully.',
  PREFERENCES_UPDATED: 'Preferences updated!',
} as const;
