-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage on cron schema to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;

-- Create a configuration table for storing project-specific settings
CREATE TABLE IF NOT EXISTS public.app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert project reference (this should be set during deployment)
-- The value will need to be updated with the actual project reference
INSERT INTO public.app_config (key, value) 
VALUES ('project_ref', 'YOUR_PROJECT_REF_HERE')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = timezone('utc'::text, now());

-- Create helper function for sending notifications
CREATE OR REPLACE FUNCTION send_notification_request(notification_type TEXT)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  function_url TEXT;
  auth_header TEXT;
  project_ref TEXT;
BEGIN
  -- Get project reference from config table
  SELECT value 
  INTO project_ref
  FROM public.app_config 
  WHERE key = 'project_ref'
  LIMIT 1;

  -- Validate project reference
  IF project_ref IS NULL OR project_ref = 'YOUR_PROJECT_REF_HERE' THEN
    RAISE EXCEPTION 'Project reference not configured. Please update app_config table with actual project_ref value.';
  END IF;

  -- Build the Edge Function URL
  function_url := format('https://%s.supabase.co/functions/v1/send-schedule-notifications', project_ref);

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
        'type', notification_type
      )
    );
END;
$$;

-- Create function to call Edge Function  
CREATE OR REPLACE FUNCTION schedule_daily_notifications()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delegate to the helper function with 'daily' type
  PERFORM send_notification_request('daily');
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
  $$SELECT send_notification_request('reminder');$$
);

-- Create cron job for overdue notifications at 10 AM KST  
SELECT cron.schedule(
  'overdue-schedule-notifications', -- job name
  '0 1 * * *', -- cron expression: every day at 01:00 UTC (10 AM KST)
  $$SELECT send_notification_request('overdue');$$
);

-- View all scheduled jobs
-- SELECT * FROM cron.job;

-- To unschedule a job (example):
-- SELECT cron.unschedule('daily-schedule-notifications');

COMMENT ON FUNCTION schedule_daily_notifications() IS 'Calls the Edge Function to send daily schedule notifications to all users';
COMMENT ON FUNCTION send_notification_request(TEXT) IS 'Helper function to send notification requests to the Edge Function';
COMMENT ON TABLE public.app_config IS 'Application configuration table for storing project-specific settings';