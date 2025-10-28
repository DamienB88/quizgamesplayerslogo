import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Custom storage adapter for Expo SecureStore
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper functions for auth
export const authService = {
  async signInWithPhone(phone: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
    });
    return { data, error };
  },

  async verifyOtp(phone: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user, error };
  },

  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    return { session, error };
  },
};

// Helper functions for database operations
export const dbService = {
  // Users
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  async updateUserProfile(userId: string, updates: Partial<any>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  // Groups
  async getUserGroups(userId: string) {
    const { data, error } = await supabase
      .from('group_members')
      .select('*, groups(*)')
      .eq('user_id', userId);
    return { data, error };
  },

  async getGroupFeed(groupId: string, limit = 20) {
    const { data, error } = await supabase
      .from('shares')
      .select('*, users(*), comments(count), reactions(count)')
      .eq('group_id', groupId)
      .eq('is_deleted', false)
      .order('published_at', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  // Shares
  async createShare(share: any) {
    const { data, error } = await supabase.from('shares').insert(share).select().single();
    return { data, error };
  },

  async deleteShare(shareId: string) {
    const { data, error } = await supabase
      .from('shares')
      .update({ is_deleted: true })
      .eq('id', shareId)
      .select()
      .single();
    return { data, error };
  },

  // Comments
  async getShareComments(shareId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select('*, users(*)')
      .eq('share_id', shareId)
      .eq('is_moderated', false)
      .order('created_at', { ascending: true });
    return { data, error };
  },

  async createComment(comment: any) {
    const { data, error } = await supabase.from('comments').insert(comment).select().single();
    return { data, error };
  },

  async deleteComment(commentId: string) {
    const { data, error } = await supabase
      .from('comments')
      .update({ is_moderated: true })
      .eq('id', commentId);
    return { data, error };
  },
};

// Real-time subscriptions
export const realtimeService = {
  subscribeToGroupFeed(groupId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`group_feed_${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shares',
          filter: `group_id=eq.${groupId}`,
        },
        callback
      )
      .subscribe();
  },

  subscribeToShareComments(shareId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`share_comments_${shareId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `share_id=eq.${shareId}`,
        },
        callback
      )
      .subscribe();
  },

  unsubscribe(channel: any) {
    return supabase.removeChannel(channel);
  },
};
