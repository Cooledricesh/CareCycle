-- Add push_subscription column to profiles table for storing push notification subscriptions
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS push_subscription JSONB;

-- Add comment for documentation
COMMENT ON COLUMN profiles.push_subscription IS 'Web Push API subscription object for push notifications';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_push_subscription 
ON profiles((push_subscription IS NOT NULL))
WHERE push_subscription IS NOT NULL;