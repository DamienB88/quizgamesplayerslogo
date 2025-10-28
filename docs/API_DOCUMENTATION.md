# Privacy Social API Documentation

## Overview

This document describes the API architecture for the Privacy Social application. The API is built using Supabase (PostgreSQL + Row Level Security + Edge Functions) with a TypeScript client layer.

## Architecture

```
┌─────────────┐
│  Mobile App │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Supabase SDK   │
│  (TypeScript)   │
└──────┬──────────┘
       │
       ├─────────────┐
       │             │
       ▼             ▼
┌─────────────┐  ┌──────────────┐
│  PostgreSQL │  │ Edge Functions│
│  + RLS      │  │               │
└─────────────┘  └──────────────┘
       │
       ▼
┌─────────────┐
│    Redis    │
│   (Cache)   │
└─────────────┘
```

## Authentication

All API requests require authentication via Supabase Auth.

### Login

```typescript
const { data, error } = await supabase.auth.signInWithOtp({
  phone: '+1234567890',
});
```

### Get Current User

```typescript
const { data: { user } } = await supabase.auth.getUser();
```

## API Endpoints

### Users

#### Get User Profile

```typescript
GET /users/:userId

const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();
```

#### Update User Profile

```typescript
PATCH /users/:userId

const { data, error } = await supabase
  .from('users')
  .update({
    display_name: 'New Name',
    bio: 'Updated bio',
    auto_publish_mode: true
  })
  .eq('id', userId)
  .select()
  .single();
```

### Groups

#### Create Group

```typescript
POST /groups

const { data, error } = await supabase
  .from('groups')
  .insert({
    name: 'My Group',
    description: 'Group description',
    max_members: 50
  })
  .select()
  .single();
```

#### Get User's Groups

```typescript
GET /groups?user_id=:userId

const { data, error } = await supabase
  .rpc('get_user_groups', {
    p_user_id: userId
  });
```

#### Join Group via Invite Code

```typescript
POST /groups/join

const { data, error } = await supabase
  .from('group_members')
  .insert({
    group_id: groupId,
    user_id: userId
  })
  .select()
  .single();
```

### Shares (Posts)

#### Get Group Feed

```typescript
GET /shares?group_id=:groupId&limit=20&offset=0

const { data, error } = await supabase
  .rpc('get_user_group_feed', {
    p_user_id: userId,
    p_group_id: groupId,
    p_limit: 20,
    p_offset: 0
  });
```

#### Create Share

```typescript
POST /shares

const { data, error } = await supabase
  .from('shares')
  .insert({
    user_id: userId,
    group_id: groupId,
    photo_url_original: 'https://...',
    photo_url_medium: 'https://...',
    photo_url_thumbnail: 'https://...',
    caption: 'My caption',
    photo_hash: 'abc123',
    width: 1080,
    height: 1920,
    file_size_bytes: 245000
  })
  .select()
  .single();
```

#### Update Share Caption

```typescript
PATCH /shares/:shareId

const { data, error } = await supabase
  .from('shares')
  .update({ caption: 'Updated caption' })
  .eq('id', shareId)
  .eq('user_id', userId) // Ensure user owns the share
  .select()
  .single();
```

#### Delete Share

```typescript
DELETE /shares/:shareId

const { data, error } = await supabase
  .from('shares')
  .update({
    is_deleted: true,
    deleted_at: new Date().toISOString()
  })
  .eq('id', shareId)
  .eq('user_id', userId)
  .select()
  .single();
```

### Comments

#### Get Comments for Share

```typescript
GET /comments?share_id=:shareId

const { data, error } = await supabase
  .from('comments')
  .select(`
    *,
    user:users(username, display_name, avatar_url)
  `)
  .eq('share_id', shareId)
  .eq('is_deleted', false)
  .order('created_at', { ascending: true });
```

#### Create Comment

```typescript
POST /comments

const { data, error } = await supabase
  .from('comments')
  .insert({
    share_id: shareId,
    user_id: userId,
    content: 'Great photo!'
  })
  .select()
  .single();
```

#### Update Comment

```typescript
PATCH /comments/:commentId

const { data, error } = await supabase
  .from('comments')
  .update({ content: 'Updated comment' })
  .eq('id', commentId)
  .eq('user_id', userId)
  .select()
  .single();
```

#### Delete Comment (Soft Delete)

```typescript
DELETE /comments/:commentId

const { data, error } = await supabase
  .from('comments')
  .update({ is_deleted: true })
  .eq('id', commentId)
  .eq('user_id', userId)
  .select()
  .single();
```

### Reactions

#### Add Reaction

```typescript
POST /reactions

const { data, error } = await supabase
  .from('reactions')
  .insert({
    share_id: shareId,
    user_id: userId,
    emoji: '❤️'
  })
  .select()
  .single();
```

#### Remove Reaction

```typescript
DELETE /reactions/:reactionId

const { data, error } = await supabase
  .from('reactions')
  .delete()
  .eq('share_id', shareId)
  .eq('user_id', userId)
  .eq('emoji', '❤️');
```

#### Get Reaction Summary

```typescript
GET /reactions/summary?share_id=:shareId

const { data, error } = await supabase
  .rpc('get_reaction_breakdown', {
    p_share_id: shareId
  });
```

### Daily Selections

#### Get Today's Selections

```typescript
GET /daily-selections?user_id=:userId&date=:date

const today = new Date().toISOString().split('T')[0];
const { data, error } = await supabase
  .from('daily_selections')
  .select('*')
  .eq('user_id', userId)
  .gte('selected_at', `${today}T00:00:00Z`)
  .lte('selected_at', `${today}T23:59:59Z`);
```

#### Approve Selection

```typescript
PATCH /daily-selections/:selectionId/approve

const { data, error } = await supabase
  .from('daily_selections')
  .update({
    status: 'approved',
    decision_made_at: new Date().toISOString()
  })
  .eq('id', selectionId)
  .eq('user_id', userId)
  .select()
  .single();
```

#### Decline Selection

```typescript
PATCH /daily-selections/:selectionId/decline

const { data, error } = await supabase
  .from('daily_selections')
  .update({
    status: 'declined',
    decision_made_at: new Date().toISOString()
  })
  .eq('id', selectionId)
  .eq('user_id', userId)
  .select()
  .single();
```

## Real-time Subscriptions

### Subscribe to Group Feed Updates

```typescript
const subscription = supabase
  .channel(`group:${groupId}`)
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'shares',
      filter: `group_id=eq.${groupId}`
    },
    (payload) => {
      console.log('Share update:', payload);
      // Update UI accordingly
    }
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

### Subscribe to Comments on Share

```typescript
const subscription = supabase
  .channel(`share:${shareId}:comments`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'comments',
      filter: `share_id=eq.${shareId}`
    },
    (payload) => {
      console.log('New comment:', payload);
    }
  )
  .subscribe();
```

## Error Handling

All API responses follow this structure:

### Success Response

```typescript
{
  data: { /* result data */ },
  error: null
}
```

### Error Response

```typescript
{
  data: null,
  error: {
    message: "Error description",
    code: "ERROR_CODE",
    details: { /* additional info */ }
  }
}
```

### Common Error Codes

- `PGRST116`: No rows returned
- `23505`: Unique violation
- `23503`: Foreign key violation
- `42501`: Insufficient privilege (RLS)
- `23514`: Check constraint violation

## Rate Limiting

Rate limiting is implemented using Redis:

- **Reads**: 1000 requests/hour/user
- **Writes**: 100 requests/hour/user
- **Uploads**: 50 requests/hour/user

## Caching Strategy

### Cache Keys

```typescript
// User profile
`user:${userId}:profile` // TTL: 5 minutes

// Group feed
`group:${groupId}:feed:${page}` // TTL: 1 minute

// Share details
`share:${shareId}:details` // TTL: 5 minutes
```

### Cache Invalidation

Caches are automatically invalidated on:
- Create: Invalidate list caches
- Update: Invalidate specific item and list caches
- Delete: Invalidate specific item and list caches

## Best Practices

1. **Always use Row Level Security (RLS)**
   - Never bypass RLS in client applications
   - Use service role key only in Edge Functions

2. **Implement Optimistic Updates**
   ```typescript
   // Update UI immediately
   setLocalState(newData);

   // Then sync with server
   const { error } = await supabase.from('shares').update(newData);

   if (error) {
     // Rollback on error
     setLocalState(oldData);
   }
   ```

3. **Handle Network Errors**
   ```typescript
   try {
     const { data, error } = await supabase.from('users').select('*');
     if (error) throw error;
   } catch (error) {
     if (!navigator.onLine) {
       // Show offline message
     } else {
       // Handle server error
     }
   }
   ```

4. **Use Pagination**
   ```typescript
   const PAGE_SIZE = 20;
   const { data } = await supabase
     .from('shares')
     .select('*')
     .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
   ```

5. **Optimize Queries with select()**
   ```typescript
   // Good: Select only needed fields
   .select('id, username, avatar_url')

   // Avoid: Select all fields
   .select('*')
   ```

## Testing

### Example Test

```typescript
import { createClient } from '@supabase/supabase-js';

describe('Users API', () => {
  it('should update user profile', async () => {
    const supabase = createClient(url, key);

    const { data, error } = await supabase
      .from('users')
      .update({ display_name: 'Test User' })
      .eq('id', testUserId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.display_name).toBe('Test User');
  });
});
```

## Resources

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript)
- [PostgreSQL RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
