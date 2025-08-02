-- This migration should be run after deployment to set the actual project reference
-- Replace 'YOUR_ACTUAL_PROJECT_REF' with your Supabase project reference

UPDATE public.app_config 
SET 
  value = 'cmtpkxllcwlcjjgtxzbf',
  updated_at = timezone('utc'::text, now())
WHERE key = 'project_ref';

-- Verify the update
SELECT key, value FROM public.app_config WHERE key = 'project_ref';