-- Migration: 006_create_comments_reactions_tables
-- Description: Create comments and reactions tables for user interactions
-- Created: Week 3-4 (Database Design Phase)

-- ============================================================================
-- COMMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS comments (
    -- Primary key
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relationships
    share_id uuid NOT NULL REFERENCES shares(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Content
    content text NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 280),
    content_encrypted boolean DEFAULT false NOT NULL,

    -- Timestamps
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,

    -- Moderation
    is_moderated boolean DEFAULT false NOT NULL,
    moderated_by uuid REFERENCES users(id) ON DELETE SET NULL,
    moderated_at timestamptz,

    -- Soft delete
    is_deleted boolean DEFAULT false NOT NULL,

    -- Business rules
    CONSTRAINT moderation_check CHECK (
        (is_moderated = false AND moderated_by IS NULL AND moderated_at IS NULL)
        OR
        (is_moderated = true AND moderated_by IS NOT NULL AND moderated_at IS NOT NULL)
    )
);

-- ============================================================================
-- REACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS reactions (
    -- Primary key
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relationships
    share_id uuid NOT NULL REFERENCES shares(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Reaction data
    emoji text NOT NULL CHECK (char_length(emoji) <= 10), -- Allow for complex emojis

    -- Timestamp
    created_at timestamptz DEFAULT now() NOT NULL,

    -- Ensure unique reaction per user per share per emoji
    UNIQUE(share_id, user_id, emoji)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_share_id ON comments(share_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_is_deleted ON comments(is_deleted);

-- Composite index for feed queries (active comments on share)
CREATE INDEX IF NOT EXISTS idx_comments_share_active
    ON comments(share_id, created_at DESC)
    WHERE is_deleted = false;

-- Reactions indexes
CREATE INDEX IF NOT EXISTS idx_reactions_share_id ON reactions(share_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_created_at ON reactions(created_at DESC);

-- Index for aggregating reactions by emoji
CREATE INDEX IF NOT EXISTS idx_reactions_share_emoji ON reactions(share_id, emoji);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to validate user can comment on share (must be group member)
CREATE OR REPLACE FUNCTION validate_comment_permission()
RETURNS TRIGGER AS $$
DECLARE
    share_group_id uuid;
    is_member boolean;
BEGIN
    -- Get the group_id from the share
    SELECT group_id INTO share_group_id
    FROM shares
    WHERE id = NEW.share_id AND is_deleted = false;

    IF share_group_id IS NULL THEN
        RAISE EXCEPTION 'Share not found or has been deleted';
    END IF;

    -- Check if user is a member of the group
    SELECT EXISTS (
        SELECT 1 FROM group_members
        WHERE group_id = share_group_id AND user_id = NEW.user_id
    ) INTO is_member;

    IF NOT is_member THEN
        RAISE EXCEPTION 'User must be a group member to comment';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate user can react to share (must be group member)
CREATE OR REPLACE FUNCTION validate_reaction_permission()
RETURNS TRIGGER AS $$
DECLARE
    share_group_id uuid;
    is_member boolean;
BEGIN
    -- Get the group_id from the share
    SELECT group_id INTO share_group_id
    FROM shares
    WHERE id = NEW.share_id AND is_deleted = false;

    IF share_group_id IS NULL THEN
        RAISE EXCEPTION 'Share not found or has been deleted';
    END IF;

    -- Check if user is a member of the group
    SELECT EXISTS (
        SELECT 1 FROM group_members
        WHERE group_id = share_group_id AND user_id = NEW.user_id
    ) INTO is_member;

    IF NOT is_member THEN
        RAISE EXCEPTION 'User must be a group member to react';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate moderation permission (only share owner can moderate)
CREATE OR REPLACE FUNCTION validate_moderation_permission()
RETURNS TRIGGER AS $$
DECLARE
    share_owner_id uuid;
BEGIN
    IF NEW.is_moderated = true AND OLD.is_moderated = false THEN
        -- Get the share owner
        SELECT user_id INTO share_owner_id
        FROM shares
        WHERE id = NEW.share_id;

        IF share_owner_id != NEW.moderated_by THEN
            RAISE EXCEPTION 'Only the share owner can moderate comments';
        END IF;

        -- Set moderation timestamp if not set
        IF NEW.moderated_at IS NULL THEN
            NEW.moderated_at := now();
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get comment count for a share
CREATE OR REPLACE FUNCTION get_comment_count(p_share_id uuid)
RETURNS integer AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::integer
        FROM comments
        WHERE share_id = p_share_id AND is_deleted = false
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get reaction count for a share
CREATE OR REPLACE FUNCTION get_reaction_count(p_share_id uuid)
RETURNS integer AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::integer
        FROM reactions
        WHERE share_id = p_share_id
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get reaction breakdown by emoji
CREATE OR REPLACE FUNCTION get_reaction_breakdown(p_share_id uuid)
RETURNS TABLE(emoji text, count bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT r.emoji, COUNT(*) as count
    FROM reactions r
    WHERE r.share_id = p_share_id
    GROUP BY r.emoji
    ORDER BY count DESC, r.emoji;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Comments triggers
CREATE TRIGGER validate_comment_group_membership
    BEFORE INSERT ON comments
    FOR EACH ROW
    EXECUTE FUNCTION validate_comment_permission();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER validate_comment_moderation
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION validate_moderation_permission();

-- Reactions triggers
CREATE TRIGGER validate_reaction_group_membership
    BEFORE INSERT ON reactions
    FOR EACH ROW
    EXECUTE FUNCTION validate_reaction_permission();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Comments policies
CREATE POLICY "Group members can view comments"
    ON comments
    FOR SELECT
    USING (
        is_deleted = false
        AND share_id IN (
            SELECT s.id FROM shares s
            JOIN group_members gm ON gm.group_id = s.group_id
            WHERE gm.user_id = auth.uid() AND s.is_deleted = false
        )
    );

CREATE POLICY "Group members can create comments"
    ON comments
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        AND share_id IN (
            SELECT s.id FROM shares s
            JOIN group_members gm ON gm.group_id = s.group_id
            WHERE gm.user_id = auth.uid() AND s.is_deleted = false
        )
    );

CREATE POLICY "Users can update own comments"
    ON comments
    FOR UPDATE
    USING (user_id = auth.uid() AND is_deleted = false)
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Share owners can moderate comments"
    ON comments
    FOR UPDATE
    USING (
        share_id IN (
            SELECT id FROM shares WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own comments"
    ON comments
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid() AND is_deleted = true);

-- Reactions policies
CREATE POLICY "Group members can view reactions"
    ON reactions
    FOR SELECT
    USING (
        share_id IN (
            SELECT s.id FROM shares s
            JOIN group_members gm ON gm.group_id = s.group_id
            WHERE gm.user_id = auth.uid() AND s.is_deleted = false
        )
    );

CREATE POLICY "Group members can create reactions"
    ON reactions
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        AND share_id IN (
            SELECT s.id FROM shares s
            JOIN group_members gm ON gm.group_id = s.group_id
            WHERE gm.user_id = auth.uid() AND s.is_deleted = false
        )
    );

CREATE POLICY "Users can delete own reactions"
    ON reactions
    FOR DELETE
    USING (user_id = auth.uid());

CREATE POLICY "Share owners can delete reactions on their shares"
    ON reactions
    FOR DELETE
    USING (
        share_id IN (
            SELECT id FROM shares WHERE user_id = auth.uid()
        )
    );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE comments IS 'Comments on shared content';
COMMENT ON COLUMN comments.content IS 'Comment text (max 280 characters)';
COMMENT ON COLUMN comments.content_encrypted IS 'If true, content is encrypted';
COMMENT ON COLUMN comments.is_moderated IS 'If true, comment has been moderated by share owner';
COMMENT ON COLUMN comments.moderated_by IS 'User who moderated the comment (share owner)';
COMMENT ON COLUMN comments.is_deleted IS 'Soft delete flag - if true, comment is hidden';

COMMENT ON TABLE reactions IS 'Emoji reactions to shared content';
COMMENT ON COLUMN reactions.emoji IS 'Emoji character (supports complex emojis)';

COMMENT ON FUNCTION get_comment_count(uuid) IS 'Returns count of active comments for a share';
COMMENT ON FUNCTION get_reaction_count(uuid) IS 'Returns total count of reactions for a share';
COMMENT ON FUNCTION get_reaction_breakdown(uuid) IS 'Returns count of each emoji type for a share';
