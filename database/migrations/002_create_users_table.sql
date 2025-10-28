-- Migration: 002_create_users_table
-- Description: Create users table for user profiles and preferences
-- Created: Week 3-4 (Database Design Phase)

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    -- Primary key (matches Supabase Auth user ID)
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Authentication & Identity
    phone_number text UNIQUE NOT NULL,
    username text UNIQUE NOT NULL CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
    display_name text NOT NULL CHECK (char_length(display_name) >= 1 AND char_length(display_name) <= 50),

    -- Profile
    avatar_url text,
    bio text CHECK (char_length(bio) <= 200),

    -- Preferences
    auto_publish_mode boolean DEFAULT false NOT NULL,
    onboarding_completed boolean DEFAULT false NOT NULL,

    -- Timestamps
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    last_active_at timestamptz DEFAULT now() NOT NULL,

    -- Constraints
    CONSTRAINT username_format CHECK (username ~* '^[a-z0-9_]+$'),
    CONSTRAINT phone_number_hashed CHECK (char_length(phone_number) = 64) -- SHA256 hash length
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_last_active_at ON users(last_active_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy: Users can view public data of other users (for group members)
-- Note: More restrictive policy will be added after groups table is created
CREATE POLICY "Users can view public profiles"
    ON users
    FOR SELECT
    USING (true); -- Will be restricted to group members only after groups implementation

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'User profiles and preferences';
COMMENT ON COLUMN users.id IS 'User ID (matches Supabase Auth user ID)';
COMMENT ON COLUMN users.phone_number IS 'Hashed phone number for privacy';
COMMENT ON COLUMN users.username IS 'Unique username (lowercase letters, numbers, underscores only)';
COMMENT ON COLUMN users.display_name IS 'User display name shown to others';
COMMENT ON COLUMN users.bio IS 'User biography (max 200 characters)';
COMMENT ON COLUMN users.auto_publish_mode IS 'If true, daily selections are auto-published without review';
COMMENT ON COLUMN users.onboarding_completed IS 'Tracks if user has completed onboarding flow';
COMMENT ON COLUMN users.last_active_at IS 'Last time user was active in the app';
