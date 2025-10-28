// Core User Types
export interface User {
  id: string;
  phone_number: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  auto_publish_mode: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

// Group Types
export interface Group {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
}

// Content Types
export interface Share {
  id: string;
  user_id: string;
  group_id: string;
  image_url: string;
  thumbnail_url: string;
  caption?: string;
  selected_at: string;
  published_at?: string;
  expires_at: string;
  is_deleted: boolean;
  edit_count: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  share_id: string;
  user_id: string;
  content: string;
  is_edited: boolean;
  is_moderated: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reaction {
  id: string;
  share_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

// Daily Selection Types
export interface DailySelection {
  id: string;
  user_id: string;
  group_id: string;
  selected_photo_uri: string;
  selection_date: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  review_deadline: string;
  created_at: string;
}

// Onboarding Types
export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  animationSource: any;
  image?: any;
}

export enum OnboardingStep {
  WELCOME = 'welcome',
  HOW_IT_WORKS = 'how_it_works',
  PRIVACY = 'privacy',
  GROUPS = 'groups',
  CONSENT = 'consent',
  PREFERENCES = 'preferences',
}

// User Action Audit Types
export interface UserAction {
  id: string;
  user_id: string;
  action_type: 'edit_caption' | 'delete_share' | 'moderate_comment' | 'remove_reaction';
  target_id: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// Navigation Types
export type RootStackParamList = {
  '(tabs)': undefined;
  'onboarding': undefined;
  'auth/login': undefined;
  'auth/register': undefined;
  'group/[id]': { id: string };
  'share/[id]': { id: string };
  'settings': undefined;
  'profile': undefined;
};

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Image Types
export interface ImageAsset {
  uri: string;
  width: number;
  height: number;
  fileName?: string;
  fileSize?: number;
  type?: string;
}
