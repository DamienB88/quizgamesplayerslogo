/**
 * Database type definitions
 * These types will be generated from the Supabase schema in Phase 2
 * For now, this is a placeholder structure
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          phone_number: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          auto_publish_mode: boolean;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          phone_number: string;
          username: string;
          display_name: string;
          avatar_url?: string | null;
          auto_publish_mode?: boolean;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          phone_number?: string;
          username?: string;
          display_name?: string;
          avatar_url?: string | null;
          auto_publish_mode?: boolean;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_by: string;
          invite_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_by: string;
          invite_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_by?: string;
          invite_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Additional tables will be defined in Phase 2
      // - group_members
      // - daily_selections
      // - shares
      // - comments
      // - reactions
      // - user_actions
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
