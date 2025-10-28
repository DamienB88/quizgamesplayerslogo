/**
 * Authentication Service
 * Handles user authentication with email/password, registration with nickname,
 * JWT token management, and rate limiting
 */

import { supabase } from '@/config/supabase';
import type {
  AuthCredentials,
  RegistrationData,
  AuthSession,
  User,
  AppError,
} from '@/types';
import { getCache, CacheKeys, CacheTTL } from './cache';

// Rate limiting constants
const RATE_LIMITS = {
  LOGIN_ATTEMPTS: 5, // Max attempts per hour
  REGISTRATION_ATTEMPTS: 3, // Max attempts per hour
  PASSWORD_RESET_ATTEMPTS: 3, // Max attempts per hour
} as const;

export class AuthService {
  private cache = getCache();

  /**
   * Register a new user with email, password, and nickname
   */
  async register(data: RegistrationData): Promise<{ user: User; session: AuthSession } | AppError> {
    try {
      // Check rate limit
      const rateLimitKey = CacheKeys.rateLimit(data.email, 'registration');
      const attempts = await this.cache.get<number>(rateLimitKey) || 0;

      if (attempts >= RATE_LIMITS.REGISTRATION_ATTEMPTS) {
        return {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many registration attempts. Please try again later.',
        };
      }

      // Increment rate limit counter
      await this.cache.increment(rateLimitKey);
      await this.cache.expire(rateLimitKey, CacheTTL.LONG); // 1 hour

      // Validate nickname availability
      const nicknameAvailable = await this.isNicknameAvailable(data.nickname);
      if (!nicknameAvailable) {
        return {
          code: 'NICKNAME_TAKEN',
          message: 'This nickname is already taken. Please choose another.',
        };
      }

      // Validate username availability
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', data.username)
        .single();

      if (existingUser) {
        return {
          code: 'USERNAME_TAKEN',
          message: 'This username is already taken. Please choose another.',
        };
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            nickname: data.nickname,
          },
        },
      });

      if (authError || !authData.user) {
        return {
          code: authError?.status?.toString() || 'AUTH_ERROR',
          message: authError?.message || 'Failed to create account',
        };
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: data.email,
          username: data.username,
          display_name: data.nickname,
          onboarding_completed: false,
          auto_publish_mode: false,
        });

      if (profileError) {
        // Rollback auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        return {
          code: 'PROFILE_ERROR',
          message: 'Failed to create user profile',
          details: profileError,
        };
      }

      // Reserve nickname
      const { error: nicknameError } = await supabase.rpc('reserve_nickname', {
        p_user_id: authData.user.id,
        p_nickname: data.nickname,
      });

      if (nicknameError) {
        console.error('Nickname reservation error:', nicknameError);
        // Don't fail registration if nickname reservation fails
        // The display_name is already set
      }

      // Get user profile
      const user = await this.getUserProfile(authData.user.id);
      if (!user) {
        return {
          code: 'USER_NOT_FOUND',
          message: 'User profile not found',
        };
      }

      // Create session
      const session = this.createSession(authData.user, authData.session!);

      // Clear rate limit on successful registration
      await this.cache.delete(rateLimitKey);

      return { user, session };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        code: 'REGISTRATION_ERROR',
        message: error instanceof Error ? error.message : 'Failed to register',
      };
    }
  }

  /**
   * Login with email and password
   */
  async login(credentials: AuthCredentials): Promise<{ user: User; session: AuthSession } | AppError> {
    try {
      // Check rate limit
      const rateLimitKey = CacheKeys.rateLimit(credentials.email, 'login');
      const attempts = await this.cache.get<number>(rateLimitKey) || 0;

      if (attempts >= RATE_LIMITS.LOGIN_ATTEMPTS) {
        return {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many login attempts. Please try again later.',
        };
      }

      // Increment rate limit counter
      await this.cache.increment(rateLimitKey);
      await this.cache.expire(rateLimitKey, CacheTTL.LONG); // 1 hour

      // Authenticate
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError || !authData.user || !authData.session) {
        return {
          code: authError?.status?.toString() || 'AUTH_ERROR',
          message: authError?.message || 'Invalid email or password',
        };
      }

      // Get user profile
      const user = await this.getUserProfile(authData.user.id);
      if (!user) {
        return {
          code: 'USER_NOT_FOUND',
          message: 'User profile not found',
        };
      }

      // Update last active timestamp
      await supabase
        .from('users')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', authData.user.id);

      // Create session
      const session = this.createSession(authData.user, authData.session);

      // Clear rate limit on successful login
      await this.cache.delete(rateLimitKey);

      return { user, session };
    } catch (error) {
      console.error('Login error:', error);
      return {
        code: 'LOGIN_ERROR',
        message: error instanceof Error ? error.message : 'Failed to login',
      };
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    await supabase.auth.signOut();
    // Clear cached user data
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await this.cache.delete(CacheKeys.userProfile(user.id));
    }
  }

  /**
   * Refresh authentication tokens
   */
  async refreshSession(): Promise<AuthSession | AppError> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error || !data.session || !data.user) {
        return {
          code: 'REFRESH_ERROR',
          message: 'Failed to refresh session',
        };
      }

      return this.createSession(data.user, data.session);
    } catch (error) {
      console.error('Session refresh error:', error);
      return {
        code: 'REFRESH_ERROR',
        message: error instanceof Error ? error.message : 'Failed to refresh session',
      };
    }
  }

  /**
   * Reset password via email
   */
  async resetPassword(email: string): Promise<{ success: boolean } | AppError> {
    try {
      // Check rate limit
      const rateLimitKey = CacheKeys.rateLimit(email, 'password_reset');
      const attempts = await this.cache.get<number>(rateLimitKey) || 0;

      if (attempts >= RATE_LIMITS.PASSWORD_RESET_ATTEMPTS) {
        return {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many password reset attempts. Please try again later.',
        };
      }

      // Increment rate limit counter
      await this.cache.increment(rateLimitKey);
      await this.cache.expire(rateLimitKey, CacheTTL.LONG); // 1 hour

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'privacysocial://reset-password',
      });

      if (error) {
        return {
          code: 'RESET_ERROR',
          message: error.message,
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        code: 'RESET_ERROR',
        message: error instanceof Error ? error.message : 'Failed to reset password',
      };
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<{ success: boolean } | AppError> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return {
          code: 'UPDATE_ERROR',
          message: error.message,
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Password update error:', error);
      return {
        code: 'UPDATE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to update password',
      };
    }
  }

  /**
   * Get current user session
   */
  async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      return this.createSession(user, session);
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  /**
   * Check if nickname is available (case-insensitive)
   */
  async isNicknameAvailable(nickname: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_nickname_available', {
        p_nickname: nickname,
      });

      if (error) {
        console.error('Nickname availability check error:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Nickname availability error:', error);
      return false;
    }
  }

  /**
   * Validate nickname format
   */
  validateNickname(nickname: string): { valid: boolean; error?: string } {
    const trimmed = nickname.trim();

    if (trimmed.length < 2) {
      return { valid: false, error: 'Nickname must be at least 2 characters long' };
    }

    if (trimmed.length > 30) {
      return { valid: false, error: 'Nickname must be at most 30 characters long' };
    }

    if (!/^[a-zA-Z0-9_\- ]+$/.test(trimmed)) {
      return {
        valid: false,
        error: 'Nickname can only contain letters, numbers, underscores, hyphens, and spaces',
      };
    }

    // Check for reserved words
    const reserved = ['admin', 'moderator', 'system', 'support', 'privacy', 'social'];
    if (reserved.some(word => trimmed.toLowerCase().includes(word))) {
      return { valid: false, error: 'Nickname contains reserved words' };
    }

    return { valid: true };
  }

  /**
   * Get user profile from database
   */
  private async getUserProfile(userId: string): Promise<User | null> {
    try {
      // Check cache first
      const cacheKey = CacheKeys.userProfile(userId);
      const cached = await this.cache.get<User>(cacheKey);
      if (cached) return cached;

      // Fetch from database
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.error('Failed to fetch user profile:', error);
        return null;
      }

      // Map database fields to User interface
      const user: User = {
        id: data.id,
        email: data.email,
        username: data.username,
        displayName: data.display_name,
        avatarUrl: data.avatar_url,
        bio: data.bio,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        lastActiveAt: data.last_active_at,
        autoPublishMode: data.auto_publish_mode,
        onboardingCompleted: data.onboarding_completed,
      };

      // Cache the user profile
      await this.cache.set(cacheKey, user, CacheTTL.MEDIUM);

      return user;
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }

  /**
   * Create session object from Supabase auth data
   */
  private createSession(user: any, session: any): AuthSession {
    return {
      user: {
        id: user.id,
        email: user.email!,
        username: user.user_metadata?.username || '',
        displayName: user.user_metadata?.nickname || '',
        avatarUrl: user.user_metadata?.avatar_url,
        bio: user.user_metadata?.bio,
        createdAt: user.created_at,
        updatedAt: user.updated_at || user.created_at,
        lastActiveAt: new Date().toISOString(),
        autoPublishMode: false,
        onboardingCompleted: false,
      },
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at || 0,
    };
  }
}

// Export singleton instance
let authServiceInstance: AuthService | null = null;

export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
}

// Export convenience functions
export const authService = {
  register: (data: RegistrationData) => getAuthService().register(data),
  login: (credentials: AuthCredentials) => getAuthService().login(credentials),
  logout: () => getAuthService().logout(),
  refreshSession: () => getAuthService().refreshSession(),
  resetPassword: (email: string) => getAuthService().resetPassword(email),
  updatePassword: (newPassword: string) => getAuthService().updatePassword(newPassword),
  getCurrentSession: () => getAuthService().getCurrentSession(),
  isNicknameAvailable: (nickname: string) => getAuthService().isNicknameAvailable(nickname),
  validateNickname: (nickname: string) => getAuthService().validateNickname(nickname),
};
