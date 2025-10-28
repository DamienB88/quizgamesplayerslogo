import { create } from 'zustand';
import { User } from '@/types';
import { authService } from '@/services/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  signIn: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  signIn: async (phone: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await authService.signInWithPhone(phone);
      if (error) throw error;
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  verifyOtp: async (phone: string, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await authService.verifyOtp(phone, token);
      if (error) throw error;
      if (data.user) {
        set({
          user: data.user as any,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await authService.signOut();
      if (error) throw error;
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  loadUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const { user, error } = await authService.getCurrentUser();
      if (error) throw error;
      set({
        user: user as any,
        isAuthenticated: !!user,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false, isAuthenticated: false });
    }
  },

  clearError: () => set({ error: null }),
}));
