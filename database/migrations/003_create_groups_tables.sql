-- Migration: 003_create_groups_tables
-- Description: Create groups and group_members tables for private groups
-- Created: Week 3-4 (Database Design Phase)

-- ============================================================================
-- GROUPS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS groups (
    -- Primary key
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Group details
    name text NOT NULL CHECK (char_length(name) >= 3 AND char_length(name) <= 50),
    description text CHECK (char_length(description) <= 500),
    avatar_url text,

    -- Ownership
    created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Invite management
    invite_code text UNIQUE,
    invite_code_expires_at timestamptz,

    -- Settings
    max_members integer DEFAULT 50 NOT NULL CHECK (max_members > 0 AND max_members <= 100),
    is_archived boolean DEFAULT false NOT NULL,

    -- Timestamps
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- GROUP_MEMBERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS group_members (
    -- Primary key
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relationships
    group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Role & permissions
    role group_role DEFAULT 'member' NOT NULL,

    -- Invitation tracking
    invited_by uuid REFERENCES users(id) ON DELETE SET NULL,
    joined_at timestamptz DEFAULT now() NOT NULL,

    -- Preferences
    notification_enabled boolean DEFAULT true NOT NULL,

    -- Ensure unique membership
    UNIQUE(group_id, user_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Groups indexes
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);
CREATE INDEX IF NOT EXISTS idx_groups_invite_code ON groups(invite_code) WHERE invite_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_groups_created_at ON groups(created_at DESC);

-- Group members indexes
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_role ON group_members(role);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp for groups
CREATE TRIGGER update_groups_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate invite code when group is created
CREATE OR REPLACE FUNCTION auto_generate_invite_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invite_code IS NULL THEN
        NEW.invite_code := generate_invite_code();
        NEW.invite_code_expires_at := now() + interval '30 days';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_group_invite_code
    BEFORE INSERT ON groups
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_invite_code();

-- Automatically add creator as admin when group is created
CREATE OR REPLACE FUNCTION add_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO group_members (group_id, user_id, role)
    VALUES (NEW.id, NEW.created_by, 'admin');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER add_group_creator_as_admin
    AFTER INSERT ON groups
    FOR EACH ROW
    EXECUTE FUNCTION add_creator_as_admin();

-- Enforce max members limit
CREATE OR REPLACE FUNCTION check_max_members()
RETURNS TRIGGER AS $$
DECLARE
    current_count integer;
    max_allowed integer;
BEGIN
    SELECT COUNT(*), g.max_members INTO current_count, max_allowed
    FROM group_members gm
    JOIN groups g ON g.id = gm.group_id
    WHERE gm.group_id = NEW.group_id
    GROUP BY g.max_members;

    IF current_count >= max_allowed THEN
        RAISE EXCEPTION 'Group has reached maximum member limit of %', max_allowed;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_members
    BEFORE INSERT ON group_members
    FOR EACH ROW
    EXECUTE FUNCTION check_max_members();

-- Prevent removing the last admin
CREATE OR REPLACE FUNCTION prevent_last_admin_removal()
RETURNS TRIGGER AS $$
DECLARE
    admin_count integer;
BEGIN
    IF OLD.role = 'admin' THEN
        SELECT COUNT(*) INTO admin_count
        FROM group_members
        WHERE group_id = OLD.group_id AND role = 'admin' AND id != OLD.id;

        IF admin_count = 0 THEN
            RAISE EXCEPTION 'Cannot remove the last admin from a group';
        END IF;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_removing_last_admin
    BEFORE DELETE ON group_members
    FOR EACH ROW
    EXECUTE FUNCTION prevent_last_admin_removal();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Groups policies
CREATE POLICY "Group members can view their groups"
    ON groups
    FOR SELECT
    USING (
        id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Group admins can update groups"
    ON groups
    FOR UPDATE
    USING (
        id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can create groups"
    ON groups
    FOR INSERT
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group admins can archive groups"
    ON groups
    FOR UPDATE
    USING (
        id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Group members policies
CREATE POLICY "Users can view group memberships"
    ON group_members
    FOR SELECT
    USING (
        group_id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join groups"
    ON group_members
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave groups"
    ON group_members
    FOR DELETE
    USING (user_id = auth.uid());

CREATE POLICY "Admins can manage group members"
    ON group_members
    FOR ALL
    USING (
        group_id IN (
            SELECT group_id FROM group_members WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE groups IS 'Private groups where users share content';
COMMENT ON COLUMN groups.invite_code IS 'Unique invite code for joining the group';
COMMENT ON COLUMN groups.invite_code_expires_at IS 'Expiration date for the invite code';
COMMENT ON COLUMN groups.max_members IS 'Maximum number of members allowed in the group';
COMMENT ON COLUMN groups.is_archived IS 'If true, group is archived and no new content can be posted';

COMMENT ON TABLE group_members IS 'Junction table for user-group relationships';
COMMENT ON COLUMN group_members.role IS 'User role in the group (admin or member)';
COMMENT ON COLUMN group_members.invited_by IS 'User who invited this member (NULL if self-joined)';
COMMENT ON COLUMN group_members.notification_enabled IS 'If true, user receives notifications for this group';
