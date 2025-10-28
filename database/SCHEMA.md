# Database Schema Design - Privacy Social App

## Overview

This document describes the complete database schema for the Privacy Social application. The database is designed with privacy-first principles, supporting end-to-end encryption, automatic content expiration, and comprehensive user control.

## Database Technology

- **PostgreSQL 15+** via Supabase
- **Row Level Security (RLS)** for data isolation
- **PgBouncer** for connection pooling
- **Redis** for caching layer

## Schema Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Privacy Social Database                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    users     │◄───────►│group_members │◄───────►│    groups    │
└──────────────┘         └──────────────┘         └──────────────┘
       │                        │                         │
       │                        │                         │
       ▼                        │                         │
┌──────────────┐                │                         │
│daily_        │                │                         │
│selections    │                │                         │
└──────────────┘                │                         │
       │                        │                         │
       │                        ▼                         │
       └──────────►┌──────────────┐◄────────────────────┘
                   │    shares    │
                   └──────────────┘
                          │
                  ┌───────┴───────┐
                  │               │
                  ▼               ▼
            ┌──────────┐    ┌──────────┐
            │ comments │    │reactions │
            └──────────┘    └──────────┘

                   ┌──────────────┐
                   │user_actions  │ (Audit Trail)
                   └──────────────┘
```

## Table Definitions

### 1. users

Stores user profile and preference data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | User's unique identifier (from Supabase Auth) |
| phone_number | text | UNIQUE, NOT NULL | User's phone number (hashed) |
| username | text | UNIQUE, NOT NULL | Unique username |
| display_name | text | NOT NULL | User's display name |
| avatar_url | text | NULL | URL to user's avatar image |
| bio | text | NULL | User biography (max 200 chars) |
| auto_publish_mode | boolean | DEFAULT false | Auto-publish preference |
| onboarding_completed | boolean | DEFAULT false | Onboarding status |
| created_at | timestamptz | DEFAULT now() | Account creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |
| last_active_at | timestamptz | DEFAULT now() | Last activity timestamp |

**Indexes:**
- `idx_users_username` on `username`
- `idx_users_phone_number` on `phone_number`

**RLS Policies:**
- Users can read their own data
- Users can update their own profile
- Users can read public data of group members

---

### 2. groups

Private groups where users share content.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Group's unique identifier |
| name | text | NOT NULL | Group name (3-50 chars) |
| description | text | NULL | Group description (max 500 chars) |
| avatar_url | text | NULL | URL to group avatar |
| created_by | uuid | FOREIGN KEY → users(id) | Creator's user ID |
| invite_code | text | UNIQUE, NULL | Invite code for joining |
| invite_code_expires_at | timestamptz | NULL | Invite code expiration |
| max_members | integer | DEFAULT 50 | Maximum group members |
| is_archived | boolean | DEFAULT false | Archive status |
| created_at | timestamptz | DEFAULT now() | Group creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

**Indexes:**
- `idx_groups_created_by` on `created_by`
- `idx_groups_invite_code` on `invite_code`

**RLS Policies:**
- Group members can read group data
- Group admins can update group data
- Anyone with valid invite code can read basic group info

---

### 3. group_members

Junction table for user-group relationships.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Membership unique identifier |
| group_id | uuid | FOREIGN KEY → groups(id) | Group ID |
| user_id | uuid | FOREIGN KEY → users(id) | User ID |
| role | text | CHECK (role IN ('admin', 'member')) | User's role in group |
| joined_at | timestamptz | DEFAULT now() | When user joined |
| invited_by | uuid | FOREIGN KEY → users(id), NULL | Who invited the user |
| notification_enabled | boolean | DEFAULT true | Notification preference |

**Indexes:**
- `idx_group_members_group_id` on `group_id`
- `idx_group_members_user_id` on `user_id`
- `idx_group_members_composite` on `(group_id, user_id)` (UNIQUE)

**RLS Policies:**
- Users can read memberships for groups they're in
- Group admins can manage memberships
- Users can update their own membership settings

---

### 4. daily_selections

Tracks daily photo selections and their status.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Selection unique identifier |
| user_id | uuid | FOREIGN KEY → users(id) | User ID |
| group_id | uuid | FOREIGN KEY → groups(id) | Target group ID |
| photo_local_uri | text | NOT NULL | Local photo URI (encrypted) |
| photo_metadata | jsonb | NULL | Photo metadata (EXIF stripped) |
| selected_at | timestamptz | DEFAULT now() | When photo was selected |
| review_deadline | timestamptz | NOT NULL | Review deadline (3 hours) |
| status | text | CHECK (status IN ('pending_review', 'approved', 'declined', 'expired')) | Selection status |
| decision_made_at | timestamptz | NULL | When user made decision |
| created_at | timestamptz | DEFAULT now() | Record creation timestamp |

**Indexes:**
- `idx_daily_selections_user_id` on `user_id`
- `idx_daily_selections_group_id` on `group_id`
- `idx_daily_selections_status` on `status`
- `idx_daily_selections_selected_at` on `selected_at`

**RLS Policies:**
- Users can read their own selections
- Users can update their own pending selections

---

### 5. shares

Published content shared in groups.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Share unique identifier |
| user_id | uuid | FOREIGN KEY → users(id) | User who shared |
| group_id | uuid | FOREIGN KEY → groups(id) | Target group |
| daily_selection_id | uuid | FOREIGN KEY → daily_selections(id) | Source selection |
| photo_url_original | text | NOT NULL | Original photo URL (R2) |
| photo_url_medium | text | NOT NULL | Medium size URL |
| photo_url_thumbnail | text | NOT NULL | Thumbnail URL |
| caption | text | NULL | User's caption (max 500 chars) |
| caption_encrypted | boolean | DEFAULT false | Caption encryption status |
| photo_hash | text | NOT NULL | Photo hash for deduplication |
| width | integer | NOT NULL | Original width |
| height | integer | NOT NULL | Original height |
| file_size_bytes | bigint | NOT NULL | File size in bytes |
| created_at | timestamptz | DEFAULT now() | Share creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |
| expires_at | timestamptz | NOT NULL | Expiration date (30 days) |
| is_deleted | boolean | DEFAULT false | Soft delete flag |
| deleted_at | timestamptz | NULL | Deletion timestamp |

**Indexes:**
- `idx_shares_user_id` on `user_id`
- `idx_shares_group_id` on `group_id`
- `idx_shares_created_at` on `created_at`
- `idx_shares_expires_at` on `expires_at`
- `idx_shares_photo_hash` on `photo_hash`
- `idx_shares_is_deleted` on `is_deleted`

**RLS Policies:**
- Group members can read shares in their groups
- Share owners can update their own shares
- Share owners can soft delete their shares

---

### 6. comments

Comments on shared content.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Comment unique identifier |
| share_id | uuid | FOREIGN KEY → shares(id) | Share being commented on |
| user_id | uuid | FOREIGN KEY → users(id) | Comment author |
| content | text | NOT NULL | Comment text (max 280 chars) |
| content_encrypted | boolean | DEFAULT false | Encryption status |
| created_at | timestamptz | DEFAULT now() | Comment creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |
| is_moderated | boolean | DEFAULT false | Moderation flag |
| moderated_by | uuid | FOREIGN KEY → users(id), NULL | Who moderated |
| moderated_at | timestamptz | NULL | When moderated |
| is_deleted | boolean | DEFAULT false | Soft delete flag |

**Indexes:**
- `idx_comments_share_id` on `share_id`
- `idx_comments_user_id` on `user_id`
- `idx_comments_created_at` on `created_at`

**RLS Policies:**
- Group members can read comments on shares in their groups
- Comment authors can update their own comments
- Share owners can moderate comments on their shares

---

### 7. reactions

Emoji reactions to shared content.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Reaction unique identifier |
| share_id | uuid | FOREIGN KEY → shares(id) | Share being reacted to |
| user_id | uuid | FOREIGN KEY → users(id) | User who reacted |
| emoji | text | NOT NULL | Emoji character |
| created_at | timestamptz | DEFAULT now() | Reaction timestamp |

**Indexes:**
- `idx_reactions_share_id` on `share_id`
- `idx_reactions_user_id` on `user_id`
- `idx_reactions_composite` on `(share_id, user_id, emoji)` (UNIQUE)

**RLS Policies:**
- Group members can read reactions on shares in their groups
- Users can create/delete their own reactions
- Share owners can moderate reactions on their shares

---

### 8. user_actions

Audit trail for user actions (GDPR compliance).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Action unique identifier |
| user_id | uuid | FOREIGN KEY → users(id) | User who performed action |
| action_type | text | NOT NULL | Action type (edit, delete, moderate, etc.) |
| target_type | text | NOT NULL | Target type (share, comment, reaction) |
| target_id | uuid | NOT NULL | Target's ID |
| metadata | jsonb | NULL | Additional action data |
| ip_address | inet | NULL | User's IP address (hashed) |
| user_agent | text | NULL | User's browser/app info |
| created_at | timestamptz | DEFAULT now() | Action timestamp |

**Indexes:**
- `idx_user_actions_user_id` on `user_id`
- `idx_user_actions_action_type` on `action_type`
- `idx_user_actions_created_at` on `created_at`

**RLS Policies:**
- Users can read their own action history
- Actions are immutable (no updates/deletes)

---

## Database Functions & Triggers

### Automatic Timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

Applied to: users, groups, shares, comments

### Auto-expire Content

```sql
CREATE OR REPLACE FUNCTION check_content_expiration()
RETURNS void AS $$
BEGIN
    UPDATE shares
    SET is_deleted = true, deleted_at = now()
    WHERE expires_at < now() AND is_deleted = false;
END;
$$ language 'plpgsql';
```

### Group Member Count

```sql
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE groups
    SET member_count = (
        SELECT COUNT(*) FROM group_members WHERE group_id = NEW.group_id
    )
    WHERE id = NEW.group_id;
    RETURN NEW;
END;
$$ language 'plpgsql';
```

## Data Retention Policy

- **Shares**: Automatically deleted after 30 days
- **Comments & Reactions**: Deleted when parent share is deleted
- **User Actions**: Retained for 90 days for compliance
- **Daily Selections**: Deleted after 7 days if not published

## Privacy & Security Considerations

1. **Phone Numbers**: Hashed before storage
2. **Photo URIs**: Encrypted in daily_selections
3. **Captions/Comments**: Optional encryption flag
4. **IP Addresses**: Hashed in user_actions
5. **RLS Policies**: Enforce data isolation
6. **Soft Deletes**: Allow user data recovery within grace period

## Performance Optimizations

- Composite indexes for common query patterns
- Partial indexes on frequently filtered columns
- Connection pooling via PgBouncer
- Redis caching for frequently accessed data
- Materialized views for analytics (future)

---

**Version**: 1.0
**Last Updated**: Week 3-4 (Database Design Phase)
**Next Review**: End of Phase 2
