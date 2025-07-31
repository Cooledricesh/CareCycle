-- Migration: Add complete_patient_schedule function
-- This function handles all schedule completion operations in a transaction

CREATE OR REPLACE FUNCTION complete_patient_schedule(
  p_patient_id UUID,
  p_schedule_id UUID,
  p_actual_implementation_date DATE,
  p_notes TEXT DEFAULT NULL,
  p_scheduled_date DATE DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_schedule_record patient_schedules%ROWTYPE;
  v_item_record items%ROWTYPE;
  v_history_id UUID;
  v_next_due_date DATE;
  v_next_history_id UUID;
  v_result JSON;
BEGIN
  -- Start transaction (implicit in function)
  
  -- Validate input parameters
  IF p_patient_id IS NULL THEN
    RAISE EXCEPTION 'patient_id cannot be null';
  END IF;
  
  IF p_schedule_id IS NULL THEN
    RAISE EXCEPTION 'schedule_id cannot be null';
  END IF;
  
  IF p_actual_implementation_date IS NULL THEN
    RAISE EXCEPTION 'actual_implementation_date cannot be null';
  END IF;
  
  -- Get the patient schedule with items details
  SELECT ps.*, i.*
  INTO v_schedule_record, v_item_record
  FROM patient_schedules ps
  JOIN items i ON ps.item_id = i.id
  WHERE ps.id = p_schedule_id 
    AND ps.patient_id = p_patient_id 
    AND ps.is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Active patient schedule not found for patient_id: % and schedule_id: %', p_patient_id, p_schedule_id;
  END IF;
  
  -- Validate cycle_unit before processing
  IF v_item_record.cycle_unit IS NULL THEN
    RAISE EXCEPTION 'cycle_unit cannot be null for item_id: %', v_item_record.id;
  END IF;
  
  IF v_item_record.cycle_unit NOT IN ('weeks', 'months') THEN
    RAISE EXCEPTION 'Invalid cycle_unit: %. Allowed values are: weeks, months', v_item_record.cycle_unit;
  END IF;
  
  -- Calculate next due date based on item cycle
  IF v_item_record.cycle_unit = 'weeks' THEN
    v_next_due_date := p_actual_implementation_date + INTERVAL '1 week' * v_item_record.cycle_value;
  ELSIF v_item_record.cycle_unit = 'months' THEN
    v_next_due_date := p_actual_implementation_date + INTERVAL '1 month' * v_item_record.cycle_value;
  ELSE
    -- This should never be reached due to validation above, but kept for defensive programming
    RAISE EXCEPTION 'Unexpected cycle_unit: %', v_item_record.cycle_unit;
  END IF;
  
  -- Use provided scheduled_date or current next_due_date
  IF p_scheduled_date IS NULL THEN
    p_scheduled_date := v_schedule_record.next_due_date;
  END IF;
  
  -- Update or create current schedule history entry
  INSERT INTO schedule_history (
    patient_schedule_id,
    scheduled_date,
    actual_implementation_date,
    is_completed,
    notes
  ) VALUES (
    p_schedule_id,
    p_scheduled_date,
    p_actual_implementation_date,
    true,
    p_notes
  )
  ON CONFLICT (patient_schedule_id, scheduled_date) 
  DO UPDATE SET
    actual_implementation_date = EXCLUDED.actual_implementation_date,
    is_completed = EXCLUDED.is_completed,
    notes = EXCLUDED.notes,
    updated_at = timezone('utc'::text, now())
  RETURNING id INTO v_history_id;
  
  -- Update patient schedule with new dates
  UPDATE patient_schedules
  SET 
    next_due_date = v_next_due_date,
    last_implementation_date = p_actual_implementation_date,
    updated_at = timezone('utc'::text, now())
  WHERE id = p_schedule_id;
  
  -- Create next schedule history entry (incomplete)
  INSERT INTO schedule_history (
    patient_schedule_id,
    scheduled_date,
    actual_implementation_date,
    is_completed,
    notes
  ) VALUES (
    p_schedule_id,
    v_next_due_date,
    NULL,
    false,
    NULL
  )
  ON CONFLICT (patient_schedule_id, scheduled_date) DO NOTHING
  RETURNING id INTO v_next_history_id;
  
  -- If next history entry already exists, get its ID
  IF v_next_history_id IS NULL THEN
    SELECT id INTO v_next_history_id
    FROM schedule_history
    WHERE patient_schedule_id = p_schedule_id 
      AND scheduled_date = v_next_due_date;
  END IF;
  
  -- Build result JSON with updated schedule and history details
  SELECT json_build_object(
    'schedule', json_build_object(
      'id', ps.id,
      'patient_id', ps.patient_id,
      'item_id', ps.item_id,
      'first_implementation_date', ps.first_implementation_date,
      'next_due_date', ps.next_due_date,
      'last_implementation_date', ps.last_implementation_date,
      'is_active', ps.is_active,
      'created_at', ps.created_at,
      'updated_at', ps.updated_at,
      'item', json_build_object(
        'id', i.id,
        'name', i.name,
        'category', i.category,
        'cycle_value', i.cycle_value,
        'cycle_unit', i.cycle_unit,
        'description', i.description
      )
    ),
    'completed_history', json_build_object(
      'id', sh.id,
      'patient_schedule_id', sh.patient_schedule_id,
      'scheduled_date', sh.scheduled_date,
      'actual_implementation_date', sh.actual_implementation_date,
      'is_completed', sh.is_completed,
      'notes', sh.notes,
      'created_at', sh.created_at,
      'updated_at', sh.updated_at
    ),
    'next_history_id', v_next_history_id
  ) INTO v_result
  FROM patient_schedules ps
  JOIN items i ON ps.item_id = i.id
  LEFT JOIN schedule_history sh ON sh.id = v_history_id
  WHERE ps.id = p_schedule_id;
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error details and re-raise
    RAISE EXCEPTION 'Error in complete_patient_schedule: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION complete_patient_schedule(UUID, UUID, DATE, TEXT, DATE) IS 
'Completes a patient schedule by updating history, calculating next due date, and creating next incomplete history entry. All operations are performed within a transaction to ensure data consistency.';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION complete_patient_schedule(UUID, UUID, DATE, TEXT, DATE) TO authenticated;

-- Create unique constraint for schedule_history to prevent duplicate entries
-- This ensures that each scheduled_date per patient_schedule is unique
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'schedule_history_patient_schedule_id_scheduled_date_key'
  ) THEN
    ALTER TABLE schedule_history 
    ADD CONSTRAINT schedule_history_patient_schedule_id_scheduled_date_key 
    UNIQUE (patient_schedule_id, scheduled_date);
  END IF;
END $$;