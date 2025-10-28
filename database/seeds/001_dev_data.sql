-- Seed Data: Development & Testing
-- WARNING: This is for development only! Do NOT run in production!

-- Note: This seed file assumes you have already created test users in Supabase Auth
-- You'll need to replace the UUIDs below with actual user IDs from your Supabase Auth

-- ============================================================================
-- TEST USERS
-- ============================================================================

-- Insert test users (using example UUIDs - replace with real Auth user IDs)
INSERT INTO users (
    id,
    phone_number,
    username,
    display_name,
    bio,
    auto_publish_mode,
    onboarding_completed
) VALUES
    -- User 1: Alice (admin, auto-publish enabled)
    ('11111111-1111-1111-1111-111111111111'::uuid,
     hash_sensitive_data('+1-555-0101'),
     'alice_wonder',
     'Alice Wonder',
     'Photography enthusiast 📸',
     true,
     true),

    -- User 2: Bob (standard user)
    ('22222222-2222-2222-2222-222222222222'::uuid,
     hash_sensitive_data('+1-555-0102'),
     'bob_builder',
     'Bob Builder',
     'Building cool things',
     false,
     true),

    -- User 3: Charlie (standard user)
    ('33333333-3333-3333-3333-333333333333'::uuid,
     hash_sensitive_data('+1-555-0103'),
     'charlie_chaplin',
     'Charlie Chaplin',
     'Silent but deadly 🎭',
     false,
     true),

    -- User 4: Diana (standard user)
    ('44444444-4444-4444-4444-444444444444'::uuid,
     hash_sensitive_data('+1-555-0104'),
     'diana_prince',
     'Diana Prince',
     'Wonder woman 💪',
     true,
     true),

    -- User 5: Eve (new user, onboarding not completed)
    ('55555555-5555-5555-5555-555555555555'::uuid,
     hash_sensitive_data('+1-555-0105'),
     'eve_curious',
     'Eve',
     NULL,
     false,
     false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TEST GROUPS
-- ============================================================================

INSERT INTO groups (
    id,
    name,
    description,
    created_by
) VALUES
    -- Group 1: Family group
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
     'Family Photos',
     'Our family photo sharing group',
     '11111111-1111-1111-1111-111111111111'::uuid),

    -- Group 2: Friends group
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
     'Best Friends Forever',
     'Daily moments with the crew 🎉',
     '22222222-2222-2222-2222-222222222222'::uuid),

    -- Group 3: Work group
    ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
     'Work Team',
     'Team building through photos',
     '33333333-3333-3333-3333-333333333333'::uuid)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- GROUP MEMBERSHIPS
-- ============================================================================

-- Note: Creators are automatically added as admins via trigger
-- Add additional members

-- Family Photos group members
INSERT INTO group_members (group_id, user_id, role, invited_by) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'member', '11111111-1111-1111-1111-111111111111'::uuid),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'member', '11111111-1111-1111-1111-111111111111'::uuid)
ON CONFLICT (group_id, user_id) DO NOTHING;

-- Best Friends Forever group members
INSERT INTO group_members (group_id, user_id, role, invited_by) VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'member', '22222222-2222-2222-2222-222222222222'::uuid),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, 'admin', '22222222-2222-2222-2222-222222222222'::uuid),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'member', '22222222-2222-2222-2222-222222222222'::uuid)
ON CONFLICT (group_id, user_id) DO NOTHING;

-- Work Team group members
INSERT INTO group_members (group_id, user_id, role, invited_by) VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'member', '33333333-3333-3333-3333-333333333333'::uuid),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'member', '33333333-3333-3333-3333-333333333333'::uuid)
ON CONFLICT (group_id, user_id) DO NOTHING;

-- ============================================================================
-- TEST SHARES
-- ============================================================================

INSERT INTO shares (
    id,
    user_id,
    group_id,
    photo_url_original,
    photo_url_medium,
    photo_url_thumbnail,
    caption,
    photo_hash,
    width,
    height,
    file_size_bytes,
    created_at
) VALUES
    -- Share 1: Alice's photo in Family group
    ('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid,
     '11111111-1111-1111-1111-111111111111'::uuid,
     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
     'https://example.r2.dev/shares/dddd/original.webp',
     'https://example.r2.dev/shares/dddd/medium.webp',
     'https://example.r2.dev/shares/dddd/thumbnail.webp',
     'Beautiful sunset today! 🌅',
     'abc123hash',
     1080,
     1920,
     245000,
     now() - interval '2 hours'),

    -- Share 2: Bob's photo in Best Friends group
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid,
     '22222222-2222-2222-2222-222222222222'::uuid,
     'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
     'https://example.r2.dev/shares/eeee/original.webp',
     'https://example.r2.dev/shares/eeee/medium.webp',
     'https://example.r2.dev/shares/eeee/thumbnail.webp',
     'Coffee break ☕',
     'def456hash',
     1080,
     1920,
     180000,
     now() - interval '5 hours'),

    -- Share 3: Charlie's photo in Work Team
    ('ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid,
     '33333333-3333-3333-3333-333333333333'::uuid,
     'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
     'https://example.r2.dev/shares/ffff/original.webp',
     'https://example.r2.dev/shares/ffff/medium.webp',
     'https://example.r2.dev/shares/ffff/thumbnail.webp',
     'Team lunch! 🍕',
     'ghi789hash',
     1080,
     1920,
     320000,
     now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TEST COMMENTS
-- ============================================================================

INSERT INTO comments (share_id, user_id, content, created_at) VALUES
    -- Comments on Alice's sunset photo
    ('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'Wow, amazing colors!', now() - interval '1 hour 45 minutes'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'Where was this taken?', now() - interval '1 hour 30 minutes'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'At the beach near home! 🏖️', now() - interval '1 hour'),

    -- Comments on Bob's coffee photo
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'Looks delicious!', now() - interval '4 hours 30 minutes'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, 'Is that the new café downtown?', now() - interval '4 hours'),

    -- Comments on Charlie's team lunch
    ('ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'Wish I was there!', now() - interval '20 hours'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'Next time let''s do sushi!', now() - interval '18 hours')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TEST REACTIONS
-- ============================================================================

INSERT INTO reactions (share_id, user_id, emoji) VALUES
    -- Reactions on Alice's photo
    ('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '❤️'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, '😍'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, '🌅'),

    -- Reactions on Bob's photo
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '☕'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '👍'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, '☕'),

    -- Reactions on Charlie's photo
    ('ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '🍕'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '🍕'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '😋')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- REFRESH MATERIALIZED VIEWS
-- ============================================================================

REFRESH MATERIALIZED VIEW group_feed_summary;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Seed data loaded successfully!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Test Users:';
    RAISE NOTICE '  - alice_wonder (auto-publish: ON)';
    RAISE NOTICE '  - bob_builder';
    RAISE NOTICE '  - charlie_chaplin';
    RAISE NOTICE '  - diana_prince (auto-publish: ON)';
    RAISE NOTICE '  - eve_curious (onboarding not completed)';
    RAISE NOTICE '';
    RAISE NOTICE 'Test Groups:';
    RAISE NOTICE '  - Family Photos (3 members)';
    RAISE NOTICE '  - Best Friends Forever (4 members)';
    RAISE NOTICE '  - Work Team (3 members)';
    RAISE NOTICE '';
    RAISE NOTICE 'Test Content:';
    RAISE NOTICE '  - 3 shares with photos';
    RAISE NOTICE '  - 7 comments';
    RAISE NOTICE '  - 9 reactions';
    RAISE NOTICE '';
    RAISE NOTICE 'WARNING: This is development data only!';
    RAISE NOTICE 'Do NOT use in production!';
    RAISE NOTICE '==============================================';
END $$;
