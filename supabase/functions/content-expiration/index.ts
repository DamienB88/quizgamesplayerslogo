/**
 * Content Expiration Edge Function
 *
 * This function runs daily to:
 * 1. Soft-delete expired shares (30+ days old)
 * 2. Mark expired daily selections
 * 3. Clean up old user actions (90+ days)
 * 4. Optionally trigger R2 cleanup
 *
 * Schedule: Daily at 2 AM UTC
 */

import { createSupabaseClient } from '../_shared/supabaseClient.ts';
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createSupabaseClient();

    // Verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse('Unauthorized', 401);
    }

    console.log('Starting content expiration cleanup...');

    const results = {
      expired_shares: 0,
      expired_selections: 0,
      cleaned_actions: 0,
      errors: [] as string[],
    };

    // 1. Delete expired shares
    try {
      const { error: sharesError, count } = await supabase
        .from('shares')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .lt('expires_at', new Date().toISOString())
        .eq('is_deleted', false);

      if (sharesError) {
        results.errors.push(`Shares: ${sharesError.message}`);
      } else {
        results.expired_shares = count || 0;
        console.log(`Expired ${count} shares`);
      }
    } catch (error) {
      results.errors.push(`Shares cleanup error: ${error.message}`);
    }

    // 2. Mark expired daily selections
    try {
      const { error: selectionsError, count } = await supabase
        .from('daily_selections')
        .update({ status: 'expired' })
        .eq('status', 'pending_review')
        .lt('review_deadline', new Date().toISOString());

      if (selectionsError) {
        results.errors.push(`Selections: ${selectionsError.message}`);
      } else {
        results.expired_selections = count || 0;
        console.log(`Marked ${count} selections as expired`);
      }
    } catch (error) {
      results.errors.push(`Selections cleanup error: ${error.message}`);
    }

    // 3. Clean up old user actions (90+ days)
    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { error: actionsError, count } = await supabase
        .from('user_actions')
        .delete()
        .lt('created_at', ninetyDaysAgo.toISOString());

      if (actionsError) {
        results.errors.push(`Actions: ${actionsError.message}`);
      } else {
        results.cleaned_actions = count || 0;
        console.log(`Cleaned up ${count} old user actions`);
      }
    } catch (error) {
      results.errors.push(`Actions cleanup error: ${error.message}`);
    }

    // 4. Get list of deleted share photos for R2 cleanup
    // Note: In production, this would trigger a separate R2 cleanup process
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: deletedShares, error: deletedError } = await supabase
      .from('shares')
      .select('id, photo_url_original, photo_url_medium, photo_url_thumbnail')
      .eq('is_deleted', true)
      .lt('deleted_at', sevenDaysAgo.toISOString())
      .limit(100); // Process in batches

    if (deletedError) {
      results.errors.push(`Fetching deleted shares: ${deletedError.message}`);
    } else if (deletedShares && deletedShares.length > 0) {
      console.log(`Found ${deletedShares.length} shares ready for R2 cleanup`);
      // In production, trigger R2 cleanup here or via separate function
      // await triggerR2Cleanup(deletedShares);
    }

    // 5. Refresh materialized views
    try {
      await supabase.rpc('refresh_group_feed_summary');
      console.log('Refreshed materialized views');
    } catch (error) {
      results.errors.push(`Materialized view refresh: ${error.message}`);
    }

    console.log('Content expiration cleanup completed:', results);

    return jsonResponse({
      success: true,
      message: 'Content expiration cleanup completed',
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in content-expiration:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
});

/* To deploy this function:

1. Deploy the function:
   supabase functions deploy content-expiration

2. Set up secrets (if not already done):
   supabase secrets set SUPABASE_URL=https://your-project.supabase.co
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

3. Schedule the function to run daily at 2 AM UTC:
   SELECT cron.schedule(
     'content-expiration-cleanup',
     '0 2 * * *',  -- Daily at 2 AM UTC
     $$SELECT net.http_post(
         url:='https://your-project.supabase.co/functions/v1/content-expiration',
         headers:='{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
     ) as request_id;$$
   );

4. Monitor function execution:
   - View logs in Supabase dashboard under Edge Functions
   - Check cron job history: SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

5. Manual trigger for testing:
   curl -X POST 'https://your-project.supabase.co/functions/v1/content-expiration' \
     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
*/
