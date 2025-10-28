/**
 * Daily Photo Selection Edge Function
 *
 * This function runs daily (via cron) to create daily photo selections for users.
 * It selects a random photo from each user's gallery for each group they're in.
 *
 * Schedule: Daily at random times between 9 AM and 12 PM user local time
 */

import { createSupabaseClient } from '../_shared/supabaseClient.ts';
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';

interface SelectionRequest {
  userId: string;
  groupId: string;
  photoLocalUri: string;
  photoMetadata?: Record<string, any>;
}

Deno.serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createSupabaseClient();

    // Verify this is a scheduled task or authorized request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse('Unauthorized', 401);
    }

    // Check if this is a manual trigger or scheduled run
    const url = new URL(req.url);
    const mode = url.searchParams.get('mode') || 'scheduled';

    if (mode === 'scheduled') {
      // Automated daily selection
      return await processScheduledSelections(supabase);
    } else if (mode === 'manual') {
      // Manual selection for a specific user
      const body: SelectionRequest = await req.json();
      return await processManualSelection(supabase, body);
    } else {
      return errorResponse('Invalid mode parameter', 400);
    }
  } catch (error) {
    console.error('Error in daily-photo-selection:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
});

/**
 * Process scheduled daily selections for all users
 */
async function processScheduledSelections(supabase: any) {
  console.log('Starting scheduled daily photo selection...');

  // Get all users who have completed onboarding
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, auto_publish_mode')
    .eq('onboarding_completed', true);

  if (usersError) {
    throw new Error(`Failed to fetch users: ${usersError.message}`);
  }

  console.log(`Found ${users.length} users for photo selection`);

  const results = {
    total_users: users.length,
    selections_created: 0,
    errors: [] as string[],
  };

  // Process each user
  for (const user of users) {
    try {
      // Get user's groups
      const { data: memberships, error: membershipError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (membershipError) {
        results.errors.push(`User ${user.id}: ${membershipError.message}`);
        continue;
      }

      // Create selection for each group
      for (const membership of memberships) {
        // Check if user already has a selection for today
        const today = new Date().toISOString().split('T')[0];
        const { data: existing, error: checkError } = await supabase
          .from('daily_selections')
          .select('id')
          .eq('user_id', user.id)
          .eq('group_id', membership.group_id)
          .gte('selected_at', `${today}T00:00:00Z`)
          .lte('selected_at', `${today}T23:59:59Z`)
          .single();

        if (existing) {
          console.log(`User ${user.id} already has selection for group ${membership.group_id}`);
          continue;
        }

        // In production, this would trigger the mobile app to select a random photo
        // For now, we create a placeholder selection that the app will fulfill
        const { error: insertError } = await supabase
          .from('daily_selections')
          .insert({
            user_id: user.id,
            group_id: membership.group_id,
            photo_local_uri: 'pending://selection',
            photo_metadata: { status: 'pending_client_selection' },
            status: 'pending_review',
          });

        if (insertError) {
          results.errors.push(`User ${user.id}, Group ${membership.group_id}: ${insertError.message}`);
        } else {
          results.selections_created++;
        }
      }
    } catch (error) {
      results.errors.push(`User ${user.id}: ${error.message}`);
    }
  }

  console.log('Scheduled photo selection completed:', results);

  return jsonResponse({
    success: true,
    message: 'Daily photo selection completed',
    results,
  });
}

/**
 * Process manual photo selection for a specific user
 */
async function processManualSelection(supabase: any, body: SelectionRequest) {
  const { userId, groupId, photoLocalUri, photoMetadata = {} } = body;

  if (!userId || !groupId || !photoLocalUri) {
    return errorResponse('Missing required fields: userId, groupId, photoLocalUri', 400);
  }

  // Verify user is a member of the group
  const { data: membership, error: membershipError } = await supabase
    .from('group_members')
    .select('id')
    .eq('user_id', userId)
    .eq('group_id', groupId)
    .single();

  if (membershipError || !membership) {
    return errorResponse('User is not a member of this group', 403);
  }

  // Check if user already has a pending or approved selection for today
  const today = new Date().toISOString().split('T')[0];
  const { data: existing } = await supabase
    .from('daily_selections')
    .select('id, status')
    .eq('user_id', userId)
    .eq('group_id', groupId)
    .gte('selected_at', `${today}T00:00:00Z`)
    .lte('selected_at', `${today}T23:59:59Z`)
    .in('status', ['pending_review', 'approved'])
    .single();

  if (existing) {
    return errorResponse('User already has a selection for this group today', 409);
  }

  // Create the selection
  const { data: selection, error: insertError } = await supabase
    .from('daily_selections')
    .insert({
      user_id: userId,
      group_id: groupId,
      photo_local_uri: photoLocalUri,
      photo_metadata: photoMetadata,
      status: 'pending_review',
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to create selection: ${insertError.message}`);
  }

  return jsonResponse({
    success: true,
    message: 'Photo selection created successfully',
    selection,
  });
}

/* To deploy this function:

1. Install Supabase CLI:
   npm install -g supabase

2. Login to Supabase:
   supabase login

3. Link to your project:
   supabase link --project-ref your-project-ref

4. Deploy the function:
   supabase functions deploy daily-photo-selection

5. Set up secrets:
   supabase secrets set SUPABASE_URL=https://your-project.supabase.co
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

6. Schedule the function (via Supabase dashboard or pg_cron):
   - Go to Database > Extensions > enable pg_cron
   - Run: SELECT cron.schedule('daily-photo-selection', '0 9 * * *',
           $$SELECT net.http_post(
               url:='https://your-project.supabase.co/functions/v1/daily-photo-selection?mode=scheduled',
               headers:='{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
           ) as request_id;$$);
*/
