# Supabase Setup Guide

This guide will walk you through setting up Supabase for the Privacy Social application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js 18+ installed locally
- Supabase CLI installed (`npm install -g supabase`)

## Step 1: Create a New Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in the details:
   - **Name**: privacy-social-app
   - **Database Password**: Choose a strong password (save it securely!)
   - **Region**: Select the closest region to your users
4. Click "Create new project"

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values to your `.env` file:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

## Step 3: Run Database Migrations

The database schema will be created in Phase 2 of the development roadmap. For now, the infrastructure is ready.

```bash
# When migrations are available, run:
npm run db:migrate
```

## Step 4: Configure Row Level Security (RLS)

RLS policies will be set up in Phase 2. These policies ensure users can only access their own data and their group members' data.

## Step 5: Set Up Storage Buckets

While we primarily use CloudFlare R2 for image storage, Supabase Storage can be used as a backup or for certain file types.

1. Go to **Storage** in your Supabase dashboard
2. Create the following buckets:
   - `avatars` (public)
   - `temp-uploads` (private)

## Step 6: Configure Authentication

1. Go to **Authentication** → **Settings**
2. Enable the following auth providers:
   - **Phone** (primary login method)
3. Configure phone auth:
   - Choose a phone auth provider (Twilio recommended)
   - Add your Twilio credentials
4. Set up email templates for verification if needed

## Step 7: Set Up Realtime

1. Go to **Database** → **Replication**
2. Enable realtime for the following tables (will be created in Phase 2):
   - `shares`
   - `comments`
   - `reactions`
   - `group_members`

## Step 8: Configure Edge Functions (Optional)

Edge Functions will be used for:
- Daily photo selection scheduling
- Content expiration handling
- Push notification triggers

These will be set up in later phases.

## Local Development

For local development, you can use Docker to run a local Supabase instance:

```bash
# Start Supabase locally
supabase start

# This will start:
# - PostgreSQL database
# - Supabase Studio (localhost:54323)
# - Auth server
# - Realtime server
# - Storage server
```

## Environment Variables

Make sure your `.env` file has all required Supabase variables:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Next Steps

- Phase 2 will include the full database schema
- Row Level Security policies
- Edge Functions for background tasks
- Realtime subscriptions setup

## Troubleshooting

### Connection Issues
- Ensure your IP is whitelisted in Supabase settings
- Check that your API keys are correct
- Verify your network allows connections to Supabase

### Authentication Issues
- Ensure phone provider credentials are correct
- Check rate limits haven't been exceeded
- Verify callback URLs are configured

## Security Considerations

⚠️ **Important Security Notes:**

1. **Never commit** `.env` files with real credentials
2. **Service role key** should only be used on the server, never in client apps
3. Use **anon key** for client-side operations
4. Enable **RLS** on all tables
5. Regularly rotate your API keys
6. Use **environment-specific** projects (dev, staging, prod)

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
