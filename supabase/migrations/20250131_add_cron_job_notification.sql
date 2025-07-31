-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage on cron schema to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;

-- Create function to call Edge Function
CREATE OR REPLACE FUNCTION schedule_daily_notifications()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  function_url TEXT;
  auth_header TEXT;
BEGIN
  -- Get the Edge Function URL
  SELECT 
    'https://' || project_ref || '.supabase.co/functions/v1/send-schedule-notifications'
  INTO function_url
  FROM (
    SELECT split_part(current_database(), '_', 2) as project_ref
  ) t;

  -- Get service role key from vault
  SELECT decrypted_secret 
  INTO auth_header
  FROM vault.decrypted_secrets 
  WHERE name = 'service_role_key'
  LIMIT 1;

  -- Make HTTP request to Edge Function
  PERFORM
    net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || auth_header
      ),
      body := jsonb_build_object(
        'type', 'daily'
      )
    );
END;
$$;

-- Create cron job for daily notifications at 9 AM KST (0 AM UTC)
-- Note: pg_cron uses UTC time
SELECT cron.schedule(
  'daily-schedule-notifications', -- job name
  '0 0 * * *', -- cron expression: every day at 00:00 UTC (9 AM KST)
  $$SELECT schedule_daily_notifications();$$
);

-- Create cron job for reminder notifications at 9 AM KST
SELECT cron.schedule(
  'reminder-schedule-notifications', -- job name
  '0 0 * * *', -- cron expression: every day at 00:00 UTC (9 AM KST)
  $$
  SELECT net.http_post(
    url := 'https://' || split_part(current_database(), '_', 2) || '.supabase.co/functions/v1/send-schedule-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1)
    ),
    body := jsonb_build_object('type', 'reminder')
  );
  $$
);

-- Create cron job for overdue notifications at 10 AM KST  
SELECT cron.schedule(
  'overdue-schedule-notifications', -- job name
  '0 1 * * *', -- cron expression: every day at 01:00 UTC (10 AM KST)
  $$
  SELECT net.http_post(
    url := 'https://' || split_part(current_database(), '_', 2) || '.supabase.co/functions/v1/send-schedule-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1)
    ),
    body := jsonb_build_object('type', 'overdue')
  );
  $$
);

-- View all scheduled jobs
-- SELECT * FROM cron.job;

-- To unschedule a job (example):
-- SELECT cron.unschedule('daily-schedule-notifications');

COMMENT ON FUNCTION schedule_daily_notifications() IS 'Calls the Edge Function to send daily schedule notifications to all users';