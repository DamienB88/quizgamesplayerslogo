-- Migration: 005_create_shares_table
-- Description: Create shares table for published content
-- Created: Week 3-4 (Database Design Phase)

-- ============================================================================
-- SHARES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS shares (
    -- Primary key
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relationships
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    daily_selection_id uuid REFERENCES daily_selections(id) ON DELETE SET NULL,

    -- Photo URLs (stored in CloudFlare R2)
    photo_url_original text NOT NULL,
    photo_url_medium text NOT NULL,
    photo_url_thumbnail text NOT NULL,

    -- Content
    caption text CHECK (char_length(caption) <= 500),
    caption_encrypted boolean DEFAULT false NOT NULL,

    -- Photo metadata
    photo_hash text NOT NULL, -- For deduplication
    width integer NOT NULL CHECK (width > 0),
    height integer NOT NULL CHECK (height > 0),
    file_size_bytes bigint NOT NULL CHECK (file_size_bytes > 0),

    -- Timestamps
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    expires_at timestamptz NOT NULL,

    -- Soft delete
    is_deleted boolean DEFAULT false NOT NULL,
    deleted_at timestamptz,

    -- Business rules
    CONSTRAINT expires_at_check CHECK (expires_at > created_at),
    CONSTRAINT deleted_at_check CHECK (deleted_at IS NULL OR is_deleted = true)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_shares_user_id ON shares(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_group_id ON shares(group_id);
CREATE INDEX IF NOT EXISTS idx_shares_created_at ON shares(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shares_expires_at ON shares(expires_at);
CREATE INDEX IF NOT EXISTS idx_shares_photo_hash ON shares(photo_hash);
CREATE INDEX IF NOT EXISTS idx_shares_is_deleted ON shares(is_deleted);

-- Composite index for feed queries
CREATE INDEX IF NOT EXISTS idx_shares_group_active_feed
    ON shares(group_id, created_at DESC)
    WHERE is_deleted = false;

-- Index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_shares_needs_expiration
    ON shares(expires_at)
    WHERE is_deleted = false AND expires_at < now();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to set expiration date (30 days from creation)
CREATE OR REPLACE FUNCTION set_share_expiration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.expires_at IS NULL THEN
        NEW.expires_at := NEW.created_at + interval '30 days';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-delete expired shares
CREATE OR REPLACE FUNCTION delete_expired_shares()
RETURNS void AS $$
BEGIN
    UPDATE shares
    SET
        is_deleted = true,
        deleted_at = now()
    WHERE
        expires_at < now()
        AND is_deleted = false;
END;
$$ LANGUAGE plpgsql;

-- Function to cascade delete comments and reactions when share is soft-deleted
CREATE OR REPLACE FUNCTION cascade_delete_share_content()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_deleted = true AND OLD.is_deleted = false THEN
        -- Soft delete all comments on this share
        UPDATE comments
        SET is_deleted = true
        WHERE share_id = NEW.id AND is_deleted = false;

        -- Delete all reactions on this share
        DELETE FROM reactions
        WHERE share_id = NEW.id;

        -- Set deleted_at if not already set
        IF NEW.deleted_at IS NULL THEN
            NEW.deleted_at := now();
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate user is group member before sharing
CREATE OR REPLACE FUNCTION validate_group_membership_for_share()
RETURNS TRIGGER AS $$
DECLARE
    is_member boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM group_members
        WHERE group_id = NEW.group_id AND user_id = NEW.user_id
    ) INTO is_member;

    IF NOT is_member THEN
        RAISE EXCEPTION 'User must be a member of the group to share content';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Set expiration date automatically
CREATE TRIGGER set_expiration_date
    BEFORE INSERT ON shares
    FOR EACH ROW
    EXECUTE FUNCTION set_share_expiration();

-- Auto-update updated_at timestamp
CREATE TRIGGER update_shares_updated_at
    BEFORE UPDATE ON shares
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Cascade delete share content (comments, reactions)
CREATE TRIGGER cascade_share_deletion
    BEFORE UPDATE ON shares
    FOR EACH ROW
    EXECUTE FUNCTION cascade_delete_share_content();

-- Validate group membership before allowing share
CREATE TRIGGER validate_group_membership
    BEFORE INSERT ON shares
    FOR EACH ROW
    EXECUTE FUNCTION validate_group_membership_for_share();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- Policy: Group members can view shares in their groups (excluding deleted)
CREATE POLICY "Group members can view shares"
    ON shares
    FOR SELECT
    USING (
        is_deleted = false
        AND group_id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can create shares in groups they're members of
CREATE POLICY "Group members can create shares"
    ON shares
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        AND group_id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can update their own shares
CREATE POLICY "Users can update own shares"
    ON shares
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Policy: Users can soft-delete their own shares
CREATE POLICY "Users can delete own shares"
    ON shares
    FOR UPDATE
    USING (user_id = auth.uid() AND is_deleted = false)
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- SCHEDULED JOBS (Reference)
-- ============================================================================

-- Note: Actual implementation will be in Supabase Edge Functions

-- Schedule: Every day at midnight, delete expired shares
-- SELECT cron.schedule('delete-expired-shares', '0 0 * * *',
--     $$ SELECT delete_expired_shares(); $$);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE shares IS 'Published content shared in groups';
COMMENT ON COLUMN shares.photo_url_original IS 'URL to original resolution photo in CloudFlare R2';
COMMENT ON COLUMN shares.photo_url_medium IS 'URL to medium resolution photo (720x1280)';
COMMENT ON COLUMN shares.photo_url_thumbnail IS 'URL to thumbnail (150x150)';
COMMENT ON COLUMN shares.caption IS 'User-provided caption (optional, max 500 chars)';
COMMENT ON COLUMN shares.caption_encrypted IS 'If true, caption is encrypted';
COMMENT ON COLUMN shares.photo_hash IS 'SHA256 hash of photo for deduplication';
COMMENT ON COLUMN shares.expires_at IS 'Automatic expiration date (30 days from creation)';
COMMENT ON COLUMN shares.is_deleted IS 'Soft delete flag - if true, share is hidden from feeds';
COMMENT ON COLUMN shares.deleted_at IS 'Timestamp when share was deleted';

COMMENT ON FUNCTION set_share_expiration() IS 'Automatically sets expiration to 30 days from creation';
COMMENT ON FUNCTION delete_expired_shares() IS 'Soft-deletes shares past their expiration date';
COMMENT ON FUNCTION cascade_delete_share_content() IS 'Deletes comments and reactions when share is deleted';
COMMENT ON FUNCTION validate_group_membership_for_share() IS 'Ensures user is group member before allowing share';
