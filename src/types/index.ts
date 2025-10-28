/**
 * Core type definitions for the Privacy Social app
 */

export interface User {
  id: string;
  phoneNumber: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  // Privacy preferences
  autoPublishMode: boolean;
  onboardingCompleted: boolean;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  inviteCode?: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

export interface DailySelection {
  id: string;
  userId: string;
  groupId: string;
  photoUri: string;
  selectedAt: string;
  publishedAt?: string;
  expiresAt: string;
  status: 'pending_review' | 'published' | 'declined';
}

export interface Share {
  id: string;
  userId: string;
  groupId: string;
  dailySelectionId: string;
  photoUrl: string;
  caption?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  editHistory?: EditHistory[];
}

export interface Comment {
  id: string;
  shareId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isModerated: boolean;
}

export interface Reaction {
  id: string;
  shareId: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface EditHistory {
  editedAt: string;
  previousCaption: string;
}

export interface UserAction {
  id: string;
  userId: string;
  action: 'edit_caption' | 'delete_post' | 'moderate_comment' | 'remove_reaction';
  targetId: string;
  targetType: 'share' | 'comment' | 'reaction';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  animationUrl?: string;
  imageUrl?: string;
}

export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: AppError;
  status: number;
}

// Navigation types (will be extended with expo-router typed routes)
export type RootStackParamList = {
  index: undefined;
  '(onboarding)': undefined;
  '(auth)': undefined;
  '(tabs)': undefined;
};
