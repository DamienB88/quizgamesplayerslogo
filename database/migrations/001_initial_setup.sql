-- Migration: 001_initial_setup
-- Description: Initial database setup with extensions and utility functions
-- Created: Week 3-4 (Database Design Phase)

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for encryption functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to hash sensitive data (phone numbers, IP addresses)
CREATE OR REPLACE FUNCTION hash_sensitive_data(data text)
RETURNS text AS $$
BEGIN
    RETURN encode(digest(data, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to generate invite codes
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS text AS $$
DECLARE
    chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Excludes similar looking chars
    result text := '';
    i integer;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Group member roles
CREATE TYPE group_role AS ENUM ('admin', 'member');

-- Daily selection status
CREATE TYPE selection_status AS ENUM ('pending_review', 'approved', 'declined', 'expired');

-- User action types for audit trail
CREATE TYPE action_type AS ENUM (
    'edit_caption',
    'delete_post',
    'delete_comment',
    'moderate_comment',
    'remove_reaction',
    'update_profile',
    'join_group',
    'leave_group'
);

-- Target types for audit trail
CREATE TYPE target_type AS ENUM ('share', 'comment', 'reaction', 'user', 'group');

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION update_updated_at_column() IS 'Trigger function to automatically update updated_at timestamp';
COMMENT ON FUNCTION hash_sensitive_data(text) IS 'Hash sensitive data using SHA256';
COMMENT ON FUNCTION generate_invite_code() IS 'Generate random 8-character invite code';

COMMENT ON TYPE group_role IS 'Roles for group members';
COMMENT ON TYPE selection_status IS 'Status of daily photo selections';
COMMENT ON TYPE action_type IS 'Types of user actions for audit trail';
COMMENT ON TYPE target_type IS 'Types of targets for user actions';
