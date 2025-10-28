/**
 * Supabase client configuration
 * This module initializes and exports the Supabase client for use throughout the app
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Import environment variables
// Note: In production, these should come from process.env or a secure config
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase credentials not found. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your environment variables.',
  );
}

/**
 * Supabase client instance
 * Used for all database operations, authentication, and realtime subscriptions
 */
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Storage key for auth tokens
    storageKey: 'privacy-social-auth',
    // Auto refresh tokens
    autoRefreshToken: true,
    // Persist session across app restarts
    persistSession: true,
    // Detect session from URL (useful for magic links)
    detectSessionInUrl: false,
  },
  realtime: {
    // Realtime configuration for live updates
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'x-app-version': '0.1.0',
    },
  },
});

/**
 * Helper function to check if Supabase is properly configured
 */
export const isSupabaseConfigured = (): boolean => {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
};

/**
 * Helper function to get the current user
 */
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }

  return user;
};

/**
 * Helper function to sign out
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Export types for use in other modules
export type SupabaseClient = typeof supabase;
