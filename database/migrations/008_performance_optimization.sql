-- Migration: 008_performance_optimization
-- Description: Additional indexes, views, and performance optimizations
-- Created: Week 3-4 (Database Design Phase)

-- ============================================================================
-- MATERIALIZED VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Group feed with share counts
CREATE MATERIALIZED VIEW IF NOT EXISTS group_feed_summary AS
SELECT
    s.id as share_id,
    s.user_id,
    s.group_id,
    s.photo_url_thumbnail,
    s.caption,
    s.created_at,
    s.expires_at,
    u.username,
    u.display_name,
    u.avatar_url as user_avatar_url,
    (SELECT COUNT(*) FROM comments c WHERE c.share_id = s.id AND c.is_deleted = false)::integer as comment_count,
    (SELECT COUNT(*) FROM reactions r WHERE r.share_id = s.id)::integer as reaction_count
FROM shares s
JOIN users u ON u.id = s.user_id
WHERE s.is_deleted = false
ORDER BY s.created_at DESC;

CREATE UNIQUE INDEX idx_group_feed_summary_share_id ON group_feed_summary(share_id);
CREATE INDEX idx_group_feed_summary_group_id ON group_feed_summary(group_id, created_at DESC);

COMMENT ON MATERIALIZED VIEW group_feed_summary IS 'Denormalized view of group feeds with counts for performance';

-- Function to refresh group feed summary
CREATE OR REPLACE FUNCTION refresh_group_feed_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY group_feed_summary;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ADDITIONAL PERFORMANCE INDEXES
-- ============================================================================

-- Partial indexes for frequently queried subsets

-- Active users (logged in within last 30 days)
CREATE INDEX IF NOT EXISTS idx_users_active
    ON users(last_active_at DESC)
    WHERE last_active_at > (now() - interval '30 days');

-- Non-archived groups
CREATE INDEX IF NOT EXISTS idx_groups_active
    ON groups(created_at DESC)
    WHERE is_archived = false;

-- Pending daily selections that need processing
CREATE INDEX IF NOT EXISTS idx_daily_selections_pending
    ON daily_selections(selected_at DESC)
    WHERE status = 'pending_review' AND review_deadline > now();

-- Recently expired shares needing cleanup
CREATE INDEX IF NOT EXISTS idx_shares_recently_expired
    ON shares(expires_at)
    WHERE expires_at BETWEEN (now() - interval '7 days') AND now()
    AND is_deleted = false;

-- ============================================================================
-- COVERING INDEXES (Include commonly selected columns)
-- ============================================================================

-- Users: Include display info for group member lists
CREATE INDEX IF NOT EXISTS idx_users_id_with_display
    ON users(id)
    INCLUDE (username, display_name, avatar_url);

-- Shares: Include photo URLs for feed queries
CREATE INDEX IF NOT EXISTS idx_shares_group_feed
    ON shares(group_id, created_at DESC)
    INCLUDE (photo_url_thumbnail, user_id, caption)
    WHERE is_deleted = false;

-- ============================================================================
-- STATISTICS AND QUERY OPTIMIZATION
-- ============================================================================

-- Increase statistics target for frequently queried columns
ALTER TABLE shares ALTER COLUMN group_id SET STATISTICS 1000;
ALTER TABLE shares ALTER COLUMN created_at SET STATISTICS 1000;
ALTER TABLE comments ALTER COLUMN share_id SET STATISTICS 1000;
ALTER TABLE reactions ALTER COLUMN share_id SET STATISTICS 1000;

-- ============================================================================
-- HELPER FUNCTIONS FOR COMPLEX QUERIES
-- ============================================================================

-- Get user's group feed with pagination
CREATE OR REPLACE FUNCTION get_user_group_feed(
    p_user_id uuid,
    p_group_id uuid,
    p_limit integer DEFAULT 20,
    p_offset integer DEFAULT 0
)
RETURNS TABLE(
    share_id uuid,
    user_id uuid,
    username text,
    display_name text,
    user_avatar_url text,
    photo_url_thumbnail text,
    caption text,
    created_at timestamptz,
    expires_at timestamptz,
    comment_count integer,
    reaction_count integer,
    user_has_reacted boolean
) AS $$
BEGIN
    -- Verify user is a member of the group
    IF NOT EXISTS (
        SELECT 1 FROM group_members
        WHERE user_id = p_user_id AND group_id = p_group_id
    ) THEN
        RAISE EXCEPTION 'User is not a member of this group';
    END IF;

    RETURN QUERY
    SELECT
        gfs.share_id,
        gfs.user_id,
        gfs.username,
        gfs.display_name,
        gfs.user_avatar_url,
        gfs.photo_url_thumbnail,
        gfs.caption,
        gfs.created_at,
        gfs.expires_at,
        gfs.comment_count,
        gfs.reaction_count,
        EXISTS(
            SELECT 1 FROM reactions r
            WHERE r.share_id = gfs.share_id AND r.user_id = p_user_id
        ) as user_has_reacted
    FROM group_feed_summary gfs
    WHERE gfs.group_id = p_group_id
    ORDER BY gfs.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get share details with all related data
CREATE OR REPLACE FUNCTION get_share_details(
    p_share_id uuid,
    p_requesting_user_id uuid
)
RETURNS TABLE(
    share_id uuid,
    user_id uuid,
    group_id uuid,
    username text,
    display_name text,
    user_avatar_url text,
    photo_url_original text,
    photo_url_medium text,
    photo_url_thumbnail text,
    caption text,
    width integer,
    height integer,
    created_at timestamptz,
    updated_at timestamptz,
    expires_at timestamptz,
    comment_count integer,
    reaction_count integer,
    comments jsonb,
    reactions jsonb
) AS $$
DECLARE
    share_group_id uuid;
BEGIN
    -- Get group_id and verify access
    SELECT s.group_id INTO share_group_id
    FROM shares s
    WHERE s.id = p_share_id AND s.is_deleted = false;

    IF share_group_id IS NULL THEN
        RAISE EXCEPTION 'Share not found or has been deleted';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM group_members
        WHERE user_id = p_requesting_user_id AND group_id = share_group_id
    ) THEN
        RAISE EXCEPTION 'User does not have access to this share';
    END IF;

    RETURN QUERY
    SELECT
        s.id as share_id,
        s.user_id,
        s.group_id,
        u.username,
        u.display_name,
        u.avatar_url as user_avatar_url,
        s.photo_url_original,
        s.photo_url_medium,
        s.photo_url_thumbnail,
        s.caption,
        s.width,
        s.height,
        s.created_at,
        s.updated_at,
        s.expires_at,
        (SELECT COUNT(*)::integer FROM comments c WHERE c.share_id = s.id AND c.is_deleted = false),
        (SELECT COUNT(*)::integer FROM reactions r WHERE r.share_id = s.id),
        (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'id', c.id,
                    'user_id', c.user_id,
                    'username', cu.username,
                    'display_name', cu.display_name,
                    'content', c.content,
                    'created_at', c.created_at
                )
                ORDER BY c.created_at ASC
            ), '[]'::jsonb)
            FROM comments c
            JOIN users cu ON cu.id = c.user_id
            WHERE c.share_id = s.id AND c.is_deleted = false
        ) as comments,
        (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'emoji', r.emoji,
                    'count', r.count,
                    'user_reacted', r.user_reacted
                )
                ORDER BY r.count DESC
            ), '[]'::jsonb)
            FROM (
                SELECT
                    r.emoji,
                    COUNT(*)::integer as count,
                    bool_or(r.user_id = p_requesting_user_id) as user_reacted
                FROM reactions r
                WHERE r.share_id = s.id
                GROUP BY r.emoji
            ) r
        ) as reactions
    FROM shares s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = p_share_id AND s.is_deleted = false;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get user's groups with member counts
CREATE OR REPLACE FUNCTION get_user_groups(p_user_id uuid)
RETURNS TABLE(
    group_id uuid,
    group_name text,
    group_description text,
    group_avatar_url text,
    role group_role,
    member_count bigint,
    joined_at timestamptz,
    last_share_at timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        g.id as group_id,
        g.name as group_name,
        g.description as group_description,
        g.avatar_url as group_avatar_url,
        gm.role,
        (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count,
        gm.joined_at,
        (
            SELECT MAX(s.created_at)
            FROM shares s
            WHERE s.group_id = g.id AND s.is_deleted = false
        ) as last_share_at
    FROM groups g
    JOIN group_members gm ON gm.group_id = g.id
    WHERE gm.user_id = p_user_id AND g.is_archived = false
    ORDER BY last_share_at DESC NULLS LAST, g.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- QUERY PERFORMANCE MONITORING
-- ============================================================================

-- View for slow query analysis (requires pg_stat_statements extension)
CREATE OR REPLACE VIEW slow_queries AS
SELECT
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time,
    stddev_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100 -- queries slower than 100ms
ORDER BY mean_exec_time DESC
LIMIT 50;

COMMENT ON VIEW slow_queries IS 'Identifies slow queries for optimization';

-- ============================================================================
-- SCHEDULED MAINTENANCE
-- ============================================================================

-- Function to run VACUUM ANALYZE on all tables
CREATE OR REPLACE FUNCTION run_maintenance()
RETURNS void AS $$
BEGIN
    -- Refresh materialized views
    PERFORM refresh_group_feed_summary();

    -- Update statistics
    ANALYZE users;
    ANALYZE groups;
    ANALYZE group_members;
    ANALYZE daily_selections;
    ANALYZE shares;
    ANALYZE comments;
    ANALYZE reactions;
    ANALYZE user_actions;

    -- Log maintenance completion
    RAISE NOTICE 'Database maintenance completed at %', now();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION get_user_group_feed(uuid, uuid, integer, integer)
    IS 'Retrieve paginated group feed for a user with engagement metrics';
COMMENT ON FUNCTION get_share_details(uuid, uuid)
    IS 'Get complete share details including comments and reactions in single query';
COMMENT ON FUNCTION get_user_groups(uuid)
    IS 'Get all groups a user is a member of with metadata';
COMMENT ON FUNCTION run_maintenance()
    IS 'Run scheduled database maintenance tasks';
