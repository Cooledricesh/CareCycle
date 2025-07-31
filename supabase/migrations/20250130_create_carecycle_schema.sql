-- Create items table (for managing test/injection types)
CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('test', 'injection')),
  cycle_value INTEGER NOT NULL,
  cycle_unit VARCHAR(20) NOT NULL CHECK (cycle_unit IN ('weeks', 'months')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_number VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create patient_schedules table
CREATE TABLE IF NOT EXISTS patient_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  first_implementation_date DATE NOT NULL,
  next_due_date DATE NOT NULL,
  last_implementation_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(patient_id, item_id)
);

-- Create schedule_history table (for tracking implementations)
CREATE TABLE IF NOT EXISTS schedule_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_schedule_id UUID NOT NULL REFERENCES patient_schedules(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  actual_implementation_date DATE,
  is_completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_patient_schedules_patient_id ON patient_schedules(patient_id);
CREATE INDEX idx_patient_schedules_item_id ON patient_schedules(item_id);
CREATE INDEX idx_patient_schedules_next_due_date ON patient_schedules(next_due_date);
CREATE INDEX idx_schedule_history_patient_schedule_id ON schedule_history(patient_schedule_id);
CREATE INDEX idx_schedule_history_scheduled_date ON schedule_history(scheduled_date);

-- Insert default items based on PRD requirements
INSERT INTO items (name, category, cycle_value, cycle_unit, description) VALUES
  ('심리검사', 'test', 3, 'months', '3개월마다 시행하는 심리검사'),
  ('뇌파검사', 'test', 6, 'months', '6개월마다 시행하는 뇌파검사'),
  ('장기지속형 주사제 4주', 'injection', 4, 'weeks', '4주 간격의 장기지속형 주사제'),
  ('장기지속형 주사제 12주', 'injection', 12, 'weeks', '12주 간격의 장기지속형 주사제'),
  ('장기지속형 주사제 24주', 'injection', 24, 'weeks', '24주 간격의 장기지속형 주사제')
ON CONFLICT (name) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating updated_at columns
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_schedules_updated_at BEFORE UPDATE ON patient_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_history_updated_at BEFORE UPDATE ON schedule_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_history ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (will be refined later)
CREATE POLICY "Allow all authenticated users to view items" ON items
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all authenticated users to manage patients" ON patients
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all authenticated users to manage patient_schedules" ON patient_schedules
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all authenticated users to manage schedule_history" ON schedule_history
  FOR ALL USING (auth.uid() IS NOT NULL);