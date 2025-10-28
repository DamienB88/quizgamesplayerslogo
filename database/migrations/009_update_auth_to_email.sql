-- Migration: 009_update_auth_to_email
-- Description: Update authentication from phone to email and add nicknames table
-- Created: Week 5-6 (Authentication & Security Foundation)

-- ============================================================================
-- UPDATE USERS TABLE FOR EMAIL AUTHENTICATION
-- ============================================================================

-- Drop phone_number column and add email
ALTER TABLE users DROP COLUMN IF EXISTS phone_number;

-- Add email column (will be synced with auth.users)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email text UNIQUE NOT NULL;

-- Add email index
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Update username constraint to allow longer usernames for email-based system
ALTER TABLE users DROP CONSTRAINT IF EXISTS username_format;
ALTER TABLE users ADD CONSTRAINT username_format CHECK (username ~* '^[a-z0-9_]{3,30}$');

-- ============================================================================
-- NICKNAMES TABLE
-- ============================================================================

-- Create nicknames table for tracking active nicknames
CREATE TABLE IF NOT EXISTS nicknames (
    -- Primary key
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User who owns this nickname
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- The nickname itself
    nickname text UNIQUE NOT NULL CHECK (char_length(nickname) >= 2 AND char_length(nickname) <= 30),

    -- Status
    is_active boolean DEFAULT true NOT NULL,

    -- Timestamps
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,

    -- Ensure nickname format (alphanumeric, underscores, hyphens, spaces allowed)
    CONSTRAINT nickname_format CHECK (nickname ~* '^[a-zA-Z0-9_\- ]+$'),

    -- Only one active nickname per user
    UNIQUE(user_id, is_active) WHERE is_active = true
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_nicknames_user_id ON nicknames(user_id);
CREATE INDEX IF NOT EXISTS idx_nicknames_nickname ON nicknames(nickname);
CREATE INDEX IF NOT EXISTS idx_nicknames_active ON nicknames(is_active) WHERE is_active = true;

-- Index for case-insensitive nickname lookups
CREATE INDEX IF NOT EXISTS idx_nicknames_nickname_lower
    ON nicknames(LOWER(nickname)) WHERE is_active = true;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to check if nickname is available (case-insensitive)
CREATE OR REPLACE FUNCTION is_nickname_available(p_nickname text)
RETURNS boolean AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM nicknames
        WHERE LOWER(nickname) = LOWER(p_nickname)
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to reserve a nickname for a user
CREATE OR REPLACE FUNCTION reserve_nickname(p_user_id uuid, p_nickname text)
RETURNS uuid AS $$
DECLARE
    nickname_id uuid;
BEGIN
    -- Check if nickname is available
    IF NOT is_nickname_available(p_nickname) THEN
        RAISE EXCEPTION 'Nickname "%" is already taken', p_nickname;
    END IF;

    -- Deactivate any existing nicknames for this user
    UPDATE nicknames
    SET is_active = false, updated_at = now()
    WHERE user_id = p_user_id AND is_active = true;

    -- Create new nickname
    INSERT INTO nicknames (user_id, nickname, is_active)
    VALUES (p_user_id, p_nickname, true)
    RETURNING id INTO nickname_id;

    RETURN nickname_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's current active nickname
CREATE OR REPLACE FUNCTION get_user_nickname(p_user_id uuid)
RETURNS text AS $$
BEGIN
    RETURN (
        SELECT nickname FROM nicknames
        WHERE user_id = p_user_id AND is_active = true
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to validate and sanitize nickname input
CREATE OR REPLACE FUNCTION validate_nickname(p_nickname text)
RETURNS text AS $$
DECLARE
    sanitized text;
BEGIN
    -- Trim whitespace
    sanitized := TRIM(p_nickname);

    -- Check length
    IF char_length(sanitized) < 2 THEN
        RAISE EXCEPTION 'Nickname must be at least 2 characters long';
    END IF;

    IF char_length(sanitized) > 30 THEN
        RAISE EXCEPTION 'Nickname must be at most 30 characters long';
    END IF;

    -- Check format
    IF sanitized !~* '^[a-zA-Z0-9_\- ]+$' THEN
        RAISE EXCEPTION 'Nickname can only contain letters, numbers, underscores, hyphens, and spaces';
    END IF;

    -- Check for inappropriate words (basic filter - expand in production)
    IF sanitized ~* 'admin|moderator|system|support' THEN
        RAISE EXCEPTION 'Nickname contains reserved words';
    END IF;

    RETURN sanitized;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp for nicknames
CREATE TRIGGER update_nicknames_updated_at
    BEFORE UPDATE ON nicknames
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to sync display_name with nickname
CREATE OR REPLACE FUNCTION sync_nickname_to_display_name()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user's display_name when nickname changes
    IF NEW.is_active = true THEN
        UPDATE users
        SET display_name = NEW.nickname, updated_at = now()
        WHERE id = NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_nickname_on_insert
    AFTER INSERT ON nicknames
    FOR EACH ROW
    WHEN (NEW.is_active = true)
    EXECUTE FUNCTION sync_nickname_to_display_name();

CREATE TRIGGER sync_nickname_on_update
    AFTER UPDATE ON nicknames
    FOR EACH ROW
    WHEN (NEW.is_active = true AND (OLD.is_active = false OR OLD.nickname != NEW.nickname))
    EXECUTE FUNCTION sync_nickname_to_display_name();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on nicknames table
ALTER TABLE nicknames ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all active nicknames (for availability checking)
CREATE POLICY "Anyone can view active nicknames"
    ON nicknames
    FOR SELECT
    USING (is_active = true);

-- Policy: Users can view their own nickname history
CREATE POLICY "Users can view own nickname history"
    ON nicknames
    FOR SELECT
    USING (user_id = auth.uid());

-- Policy: Users can create nicknames for themselves
CREATE POLICY "Users can create own nicknames"
    ON nicknames
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own nicknames
CREATE POLICY "Users can update own nicknames"
    ON nicknames
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- UPDATE EXISTING DATA
-- ============================================================================

-- Update the constraint check for users table to remove phone_number requirement
ALTER TABLE users DROP CONSTRAINT IF EXISTS phone_number_hashed;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE nicknames IS 'User nicknames with history tracking and uniqueness enforcement';
COMMENT ON COLUMN nicknames.nickname IS 'User-chosen display name (unique, case-insensitive)';
COMMENT ON COLUMN nicknames.is_active IS 'Only one active nickname per user allowed';
COMMENT ON COLUMN nicknames.user_id IS 'User who owns this nickname';

COMMENT ON FUNCTION is_nickname_available(text)
    IS 'Check if a nickname is available (case-insensitive)';
COMMENT ON FUNCTION reserve_nickname(uuid, text)
    IS 'Reserve a nickname for a user, deactivating any previous nicknames';
COMMENT ON FUNCTION get_user_nickname(uuid)
    IS 'Get the active nickname for a user';
COMMENT ON FUNCTION validate_nickname(text)
    IS 'Validate and sanitize nickname input';
