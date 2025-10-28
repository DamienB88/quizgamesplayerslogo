-- Migration: 007_create_user_actions_table
-- Description: Create user_actions table for audit trail (GDPR compliance)
-- Created: Week 3-4 (Database Design Phase)

-- ============================================================================
-- USER_ACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_actions (
    -- Primary key
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User who performed the action
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Action details
    action_type action_type NOT NULL,
    target_type target_type NOT NULL,
    target_id uuid NOT NULL,

    -- Additional context
    metadata jsonb DEFAULT '{}'::jsonb,

    -- Request information (for security auditing)
    ip_address inet, -- Will be hashed
    user_agent text,

    -- Timestamp (immutable - actions cannot be deleted)
    created_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_action_type ON user_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_user_actions_target_type ON user_actions(target_type);
CREATE INDEX IF NOT EXISTS idx_user_actions_target_id ON user_actions(target_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_created_at ON user_actions(created_at DESC);

-- Composite index for common queries (user's actions by type)
CREATE INDEX IF NOT EXISTS idx_user_actions_user_type
    ON user_actions(user_id, action_type, created_at DESC);

-- Index for cleanup (actions older than retention period)
CREATE INDEX IF NOT EXISTS idx_user_actions_old_records
    ON user_actions(created_at)
    WHERE created_at < (now() - interval '90 days');

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to log user actions automatically
CREATE OR REPLACE FUNCTION log_user_action(
    p_user_id uuid,
    p_action_type action_type,
    p_target_type target_type,
    p_target_id uuid,
    p_metadata jsonb DEFAULT '{}'::jsonb,
    p_ip_address text DEFAULT NULL,
    p_user_agent text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
    action_id uuid;
    hashed_ip inet;
BEGIN
    -- Hash IP address if provided
    IF p_ip_address IS NOT NULL THEN
        hashed_ip := ('0.0.0.0/' ||
            left(hash_sensitive_data(p_ip_address), 8))::inet;
    END IF;

    -- Insert action log
    INSERT INTO user_actions (
        user_id,
        action_type,
        target_type,
        target_id,
        metadata,
        ip_address,
        user_agent
    )
    VALUES (
        p_user_id,
        p_action_type,
        p_target_type,
        p_target_id,
        p_metadata,
        hashed_ip,
        p_user_agent
    )
    RETURNING id INTO action_id;

    RETURN action_id;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Function to clean up old audit logs (90 days retention)
CREATE OR REPLACE FUNCTION cleanup_old_user_actions()
RETURNS integer AS $$
DECLARE
    deleted_count integer;
BEGIN
    WITH deleted AS (
        DELETE FROM user_actions
        WHERE created_at < (now() - interval '90 days')
        RETURNING *
    )
    SELECT COUNT(*)::integer INTO deleted_count FROM deleted;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's action history
CREATE OR REPLACE FUNCTION get_user_action_history(
    p_user_id uuid,
    p_limit integer DEFAULT 50,
    p_offset integer DEFAULT 0
)
RETURNS TABLE(
    id uuid,
    action_type action_type,
    target_type target_type,
    target_id uuid,
    metadata jsonb,
    created_at timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ua.id,
        ua.action_type,
        ua.target_type,
        ua.target_id,
        ua.metadata,
        ua.created_at
    FROM user_actions ua
    WHERE ua.user_id = p_user_id
    ORDER BY ua.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to prevent updates and deletes (audit trail is immutable)
CREATE OR REPLACE FUNCTION prevent_user_action_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'User actions are immutable and cannot be modified or deleted';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Prevent updates to user_actions (immutable audit trail)
CREATE TRIGGER prevent_user_action_update
    BEFORE UPDATE ON user_actions
    FOR EACH ROW
    EXECUTE FUNCTION prevent_user_action_modification();

-- Prevent deletes from user_actions (except for automated cleanup)
CREATE TRIGGER prevent_user_action_delete
    BEFORE DELETE ON user_actions
    FOR EACH ROW
    WHEN (OLD.created_at > (now() - interval '90 days'))
    EXECUTE FUNCTION prevent_user_action_modification();

-- ============================================================================
-- AUDIT LOGGING TRIGGERS FOR OTHER TABLES
-- ============================================================================

-- Auto-log when shares are updated (caption edit)
CREATE OR REPLACE FUNCTION log_share_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.caption IS DISTINCT FROM NEW.caption THEN
        PERFORM log_user_action(
            NEW.user_id,
            'edit_caption',
            'share',
            NEW.id,
            jsonb_build_object(
                'old_caption', OLD.caption,
                'new_caption', NEW.caption
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_caption_edit
    AFTER UPDATE ON shares
    FOR EACH ROW
    EXECUTE FUNCTION log_share_update();

-- Auto-log when shares are deleted
CREATE OR REPLACE FUNCTION log_share_deletion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_deleted = true AND OLD.is_deleted = false THEN
        PERFORM log_user_action(
            NEW.user_id,
            'delete_post',
            'share',
            NEW.id,
            jsonb_build_object(
                'deleted_at', NEW.deleted_at
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_post_deletion
    AFTER UPDATE ON shares
    FOR EACH ROW
    EXECUTE FUNCTION log_share_deletion();

-- Auto-log when comments are moderated
CREATE OR REPLACE FUNCTION log_comment_moderation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_moderated = true AND OLD.is_moderated = false THEN
        PERFORM log_user_action(
            NEW.moderated_by,
            'moderate_comment',
            'comment',
            NEW.id,
            jsonb_build_object(
                'comment_user_id', NEW.user_id,
                'moderated_at', NEW.moderated_at
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_comment_moderate
    AFTER UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION log_comment_moderation();

-- Auto-log when users join groups
CREATE OR REPLACE FUNCTION log_group_join()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM log_user_action(
        NEW.user_id,
        'join_group',
        'group',
        NEW.group_id,
        jsonb_build_object(
            'invited_by', NEW.invited_by,
            'joined_at', NEW.joined_at
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_user_join_group
    AFTER INSERT ON group_members
    FOR EACH ROW
    EXECUTE FUNCTION log_group_join();

-- Auto-log when users leave groups
CREATE OR REPLACE FUNCTION log_group_leave()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM log_user_action(
        OLD.user_id,
        'leave_group',
        'group',
        OLD.group_id,
        jsonb_build_object(
            'left_at', now()
        )
    );
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_user_leave_group
    BEFORE DELETE ON group_members
    FOR EACH ROW
    EXECUTE FUNCTION log_group_leave();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own action history
CREATE POLICY "Users can view own actions"
    ON user_actions
    FOR SELECT
    USING (user_id = auth.uid());

-- Policy: Users can insert their own actions (via application)
CREATE POLICY "Users can log own actions"
    ON user_actions
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- No UPDATE or DELETE policies - actions are immutable

-- ============================================================================
-- SCHEDULED JOBS (Reference)
-- ============================================================================

-- Note: Actual implementation will be in Supabase Edge Functions

-- Schedule: Every day at 2 AM, clean up old user actions (90+ days)
-- SELECT cron.schedule('cleanup-old-user-actions', '0 2 * * *',
--     $$ SELECT cleanup_old_user_actions(); $$);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE user_actions IS 'Audit trail of user actions for GDPR compliance and security';
COMMENT ON COLUMN user_actions.action_type IS 'Type of action performed';
COMMENT ON COLUMN user_actions.target_type IS 'Type of target affected by the action';
COMMENT ON COLUMN user_actions.target_id IS 'ID of the target affected';
COMMENT ON COLUMN user_actions.metadata IS 'Additional context about the action (JSON)';
COMMENT ON COLUMN user_actions.ip_address IS 'Hashed IP address of the request';
COMMENT ON COLUMN user_actions.user_agent IS 'User agent string of the client';

COMMENT ON FUNCTION log_user_action(uuid, action_type, target_type, uuid, jsonb, text, text)
    IS 'Manually log a user action to the audit trail';
COMMENT ON FUNCTION cleanup_old_user_actions()
    IS 'Delete user actions older than 90 days (GDPR retention policy)';
COMMENT ON FUNCTION get_user_action_history(uuid, integer, integer)
    IS 'Retrieve user action history with pagination';
