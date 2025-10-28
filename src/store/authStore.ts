/**
 * Authentication State Management with Zustand
 * Manages global authentication state, session persistence, and user data
 */

import { create } from 'zustand';
import type { AuthState, User, AuthSession, AuthCredentials, RegistrationData, AppError } from '@/types';
import { authService } from '@/services/auth';
import { secureStorage } from '@/services/secureStorage';
import { encryption } from '@/services/encryption';

interface AuthStore extends AuthState {
  // Actions
  register: (data: RegistrationData) => Promise<void>;
  login: (credentials: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean } | AppError>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean } | AppError>;
  loadSession: () => Promise<void>;
  setUser: (user: User | null) => void;
  setError: (error: AppError | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Register new user
  register: async (data: RegistrationData) => {
    set({ isLoading: true, error: null });

    try {
      const result = await authService.register(data);

      if ('code' in result) {
        // Error occurred
        set({
          isLoading: false,
          error: result,
          isAuthenticated: false,
        });
        return;
      }

      // Success - initialize encryption
      await encryption.initialize();

      // Store auth tokens securely
      await secureStorage.setAuthTokens(
        result.session.accessToken,
        result.session.refreshToken,
      );

      set({
        user: result.user,
        session: result.session,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: {
          code: 'REGISTRATION_ERROR',
          message: error instanceof Error ? error.message : 'Registration failed',
        },
      });
    }
  },

  // Login existing user
  login: async (credentials: AuthCredentials) => {
    set({ isLoading: true, error: null });

    try {
      const result = await authService.login(credentials);

      if ('code' in result) {
        // Error occurred
        set({
          isLoading: false,
          error: result,
          isAuthenticated: false,
        });
        return;
      }

      // Success - initialize encryption
      await encryption.initialize();

      // Store auth tokens securely
      await secureStorage.setAuthTokens(
        result.session.accessToken,
        result.session.refreshToken,
      );

      set({
        user: result.user,
        session: result.session,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: {
          code: 'LOGIN_ERROR',
          message: error instanceof Error ? error.message : 'Login failed',
        },
      });
    }
  },

  // Logout user
  logout: async () => {
    set({ isLoading: true });

    try {
      await authService.logout();
      await secureStorage.clearAuthTokens();

      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if error occurs
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: 'Logout failed',
        },
      });
    }
  },

  // Refresh session tokens
  refreshSession: async () => {
    try {
      const result = await authService.refreshSession();

      if ('code' in result) {
        // Refresh failed - logout user
        await get().logout();
        return;
      }

      // Update tokens in secure storage
      await secureStorage.setAuthTokens(result.accessToken, result.refreshToken);

      set({
        session: result,
        error: null,
      });
    } catch (error) {
      console.error('Session refresh error:', error);
      await get().logout();
    }
  },

  // Reset password
  resetPassword: async (email: string) => {
    set({ isLoading: true, error: null });

    try {
      const result = await authService.resetPassword(email);

      set({ isLoading: false });

      if ('code' in result) {
        set({ error: result });
      }

      return result;
    } catch (error) {
      const errorResult: AppError = {
        code: 'RESET_ERROR',
        message: error instanceof Error ? error.message : 'Password reset failed',
      };
      set({ isLoading: false, error: errorResult });
      return errorResult;
    }
  },

  // Update password
  updatePassword: async (newPassword: string) => {
    set({ isLoading: true, error: null });

    try {
      const result = await authService.updatePassword(newPassword);

      set({ isLoading: false });

      if ('code' in result) {
        set({ error: result });
      }

      return result;
    } catch (error) {
      const errorResult: AppError = {
        code: 'UPDATE_ERROR',
        message: error instanceof Error ? error.message : 'Password update failed',
      };
      set({ isLoading: false, error: errorResult });
      return errorResult;
    }
  },

  // Load persisted session on app start
  loadSession: async () => {
    set({ isLoading: true });

    try {
      // Check for stored auth tokens
      const tokens = await secureStorage.getAuthTokens();

      if (!tokens) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      // Get current session from Supabase
      const session = await authService.getCurrentSession();

      if (!session) {
        // Session expired or invalid - clear stored tokens
        await secureStorage.clearAuthTokens();
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      // Initialize encryption
      await encryption.initialize();

      set({
        user: session.user,
        session,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Load session error:', error);
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  // Set user
  setUser: (user: User | null) => {
    set({ user });
  },

  // Set error
  setError: (error: AppError | null) => {
    set({ error });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

// Session refresh handler - runs every 55 minutes to refresh tokens before expiry
let refreshInterval: NodeJS.Timeout | null = null;

export const startSessionRefresh = () => {
  if (refreshInterval) return;

  refreshInterval = setInterval(
    async () => {
      const { isAuthenticated, refreshSession } = useAuthStore.getState();

      if (isAuthenticated) {
        console.log('Auto-refreshing session...');
        await refreshSession();
      }
    },
    55 * 60 * 1000, // 55 minutes
  );
};

export const stopSessionRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};
