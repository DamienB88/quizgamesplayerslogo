-- Migration: 004_create_daily_selections_table
-- Description: Create daily_selections table for tracking daily photo selections
-- Created: Week 3-4 (Database Design Phase)

-- ============================================================================
-- DAILY_SELECTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_selections (
    -- Primary key
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relationships
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

    -- Photo information (encrypted on client)
    photo_local_uri text NOT NULL,
    photo_metadata jsonb DEFAULT '{}'::jsonb,

    -- Selection timing
    selected_at timestamptz DEFAULT now() NOT NULL,
    review_deadline timestamptz NOT NULL,

    -- Status tracking
    status selection_status DEFAULT 'pending_review' NOT NULL,
    decision_made_at timestamptz,

    -- Timestamps
    created_at timestamptz DEFAULT now() NOT NULL,

    -- Business rules
    CONSTRAINT review_deadline_check CHECK (review_deadline > selected_at),
    CONSTRAINT decision_time_check CHECK (decision_made_at IS NULL OR decision_made_at <= review_deadline + interval '1 hour')
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_daily_selections_user_id ON daily_selections(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_selections_group_id ON daily_selections(group_id);
CREATE INDEX IF NOT EXISTS idx_daily_selections_status ON daily_selections(status);
CREATE INDEX IF NOT EXISTS idx_daily_selections_selected_at ON daily_selections(selected_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_selections_review_deadline ON daily_selections(review_deadline) WHERE status = 'pending_review';

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_daily_selections_user_group_status
    ON daily_selections(user_id, group_id, status);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to set review deadline (3 hours from selection)
CREATE OR REPLACE FUNCTION set_review_deadline()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.review_deadline IS NULL THEN
        NEW.review_deadline := NEW.selected_at + interval '3 hours';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-publish if user has auto_publish_mode enabled
CREATE OR REPLACE FUNCTION handle_auto_publish()
RETURNS TRIGGER AS $$
DECLARE
    user_auto_publish boolean;
BEGIN
    SELECT auto_publish_mode INTO user_auto_publish
    FROM users
    WHERE id = NEW.user_id;

    IF user_auto_publish THEN
        NEW.status := 'approved';
        NEW.decision_made_at := now();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to mark expired selections
CREATE OR REPLACE FUNCTION mark_expired_selections()
RETURNS void AS $$
BEGIN
    UPDATE daily_selections
    SET status = 'expired'
    WHERE status = 'pending_review'
        AND review_deadline < now();
END;
$$ LANGUAGE plpgsql;

-- Function to ensure only one pending selection per user per group per day
CREATE OR REPLACE FUNCTION enforce_one_selection_per_day()
RETURNS TRIGGER AS $$
DECLARE
    existing_count integer;
BEGIN
    SELECT COUNT(*) INTO existing_count
    FROM daily_selections
    WHERE user_id = NEW.user_id
        AND group_id = NEW.group_id
        AND DATE(selected_at) = DATE(NEW.selected_at)
        AND status IN ('pending_review', 'approved');

    IF existing_count > 0 THEN
        RAISE EXCEPTION 'User already has a selection for this group today';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Set review deadline automatically
CREATE TRIGGER set_selection_review_deadline
    BEFORE INSERT ON daily_selections
    FOR EACH ROW
    EXECUTE FUNCTION set_review_deadline();

-- Handle auto-publish for users with auto_publish_mode
CREATE TRIGGER auto_publish_selection
    BEFORE INSERT ON daily_selections
    FOR EACH ROW
    EXECUTE FUNCTION handle_auto_publish();

-- Enforce one selection per day rule
CREATE TRIGGER one_selection_per_day
    BEFORE INSERT ON daily_selections
    FOR EACH ROW
    EXECUTE FUNCTION enforce_one_selection_per_day();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE daily_selections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own selections
CREATE POLICY "Users can view own selections"
    ON daily_selections
    FOR SELECT
    USING (user_id = auth.uid());

-- Policy: Users can create their own selections
CREATE POLICY "Users can create own selections"
    ON daily_selections
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own pending selections
CREATE POLICY "Users can update own pending selections"
    ON daily_selections
    FOR UPDATE
    USING (user_id = auth.uid() AND status = 'pending_review')
    WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own pending selections
CREATE POLICY "Users can delete own pending selections"
    ON daily_selections
    FOR DELETE
    USING (user_id = auth.uid() AND status = 'pending_review');

-- ============================================================================
-- SCHEDULED JOBS (Via pg_cron or Supabase Edge Functions)
-- ============================================================================

-- Note: The following is a reference for scheduled job setup
-- Actual implementation will be in Supabase Edge Functions

-- Schedule: Every hour, mark expired selections
-- SELECT cron.schedule('mark-expired-selections', '0 * * * *',
--     $$ SELECT mark_expired_selections(); $$);

-- Schedule: Every day at random time, create daily selections for users
-- This will be handled by Edge Function: daily-photo-selection

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE daily_selections IS 'Tracks daily random photo selections for users';
COMMENT ON COLUMN daily_selections.photo_local_uri IS 'Encrypted local URI of selected photo (client-side encryption)';
COMMENT ON COLUMN daily_selections.photo_metadata IS 'EXIF-stripped metadata in JSON format';
COMMENT ON COLUMN daily_selections.review_deadline IS 'Deadline for user to review and approve/decline (3 hours from selection)';
COMMENT ON COLUMN daily_selections.status IS 'Current status: pending_review, approved, declined, or expired';
COMMENT ON COLUMN daily_selections.decision_made_at IS 'Timestamp when user made decision to approve/decline';

COMMENT ON FUNCTION set_review_deadline() IS 'Automatically sets review deadline to 3 hours from selection time';
COMMENT ON FUNCTION handle_auto_publish() IS 'Auto-approves selection if user has auto_publish_mode enabled';
COMMENT ON FUNCTION mark_expired_selections() IS 'Marks selections as expired if review deadline has passed';
COMMENT ON FUNCTION enforce_one_selection_per_day() IS 'Ensures user can only have one selection per group per day';
