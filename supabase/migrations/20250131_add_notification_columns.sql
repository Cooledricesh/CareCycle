-- Add notification-related columns to existing tables

-- Add notification columns to schedule_history table
ALTER TABLE schedule_history 
ADD COLUMN IF NOT EXISTS notification_scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_notified BOOLEAN DEFAULT false;

-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create notifications table to track sent notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('daily', 'reminder', 'overdue')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  schedule_ids UUID[] NOT NULL, -- Array of schedule history IDs included in this notification
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schedule_history_notification_scheduled_at 
ON schedule_history(notification_scheduled_at) 
WHERE is_notified = false;

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Enable RLS on new tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles table
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS policies for notifications table
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger to update notification_scheduled_at when schedule_history is created
CREATE OR REPLACE FUNCTION calculate_notification_scheduled_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate notification date as 7 days before scheduled_date
  NEW.notification_scheduled_at := NEW.scheduled_date::timestamp - INTERVAL '7 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_notification_scheduled_at
BEFORE INSERT ON schedule_history
FOR EACH ROW
EXECUTE FUNCTION calculate_notification_scheduled_at();

-- Create trigger to update updated_at for profiles
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create or update profile when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update existing users in profiles table
INSERT INTO profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Add comments for documentation
COMMENT ON COLUMN schedule_history.notification_scheduled_at IS 'The date when notification should be sent for this schedule';
COMMENT ON COLUMN schedule_history.is_notified IS 'Whether notification has been sent for this schedule';
COMMENT ON COLUMN profiles.notification_enabled IS 'Whether the user wants to receive notifications';
COMMENT ON TABLE notifications IS 'Tracks all notifications sent to users';