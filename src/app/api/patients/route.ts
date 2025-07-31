import { NextRequest, NextResponse } from 'next/server';
import { createPureClient } from '@/lib/supabase/server';
import { calculateNextDueDate } from '@/lib/utils/schedule';
import { z } from 'zod';

// Request validation schema
const createPatientSchema = z.object({
  patient_number: z.string().min(1, "환자 번호는 필수입니다"),
  name: z.string().min(1, "환자 이름은 필수입니다"),
  phone: z.string().optional(),
  notes: z.string().optional(),
  schedules: z.array(z.object({
    item_id: z.string().uuid("유효한 항목 ID가 아닙니다"),
    first_implementation_date: z.string().refine(
      (date) => !isNaN(Date.parse(date)),
      "유효한 날짜 형식이 아닙니다"
    ),
  })).min(1, "최소 하나의 일정이 필요합니다"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = createPatientSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { patient_number, name, phone, notes, schedules } = validation.data;
    
    const supabase = await createPureClient();
    
    // Check if patient number already exists
    const { data: existingPatient } = await supabase
      .from('patients')
      .select('id')
      .eq('patient_number', patient_number)
      .single();
    
    if (existingPatient) {
      return NextResponse.json(
        { error: '이미 존재하는 환자 번호입니다' },
        { status: 409 }
      );
    }
    
    // Start transaction by creating patient first
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .insert({
        patient_number,
        name,
        phone,
        notes,
      })
      .select()
      .single();
    
    if (patientError) {
      console.error('Failed to create patient:', patientError);
      return NextResponse.json(
        { error: '환자 생성에 실패했습니다' },
        { status: 500 }
      );
    }
    
    // Get item details for cycle calculation
    const itemIds = schedules.map(s => s.item_id);
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('id, cycle_value, cycle_unit')
      .in('id', itemIds);
    
    if (itemsError || !items) {
      console.error('Failed to fetch items:', itemsError);
      return NextResponse.json(
        { error: '항목 정보를 가져오는데 실패했습니다' },
        { status: 500 }
      );
    }
    
    // Create schedules with calculated next due dates
    const schedulesToCreate = schedules.map(schedule => {
      const item = items.find(i => i.id === schedule.item_id);
      if (!item) {
        throw new Error(`Item ${schedule.item_id} not found`);
      }
      
      const firstImplementationDate = new Date(schedule.first_implementation_date);
      const nextDueDate = calculateNextDueDate({
        startDate: firstImplementationDate,
        cycleValue: item.cycle_value,
        cycleUnit: item.cycle_unit as 'weeks' | 'months',
      });
      
      return {
        patient_id: patient.id,
        item_id: schedule.item_id,
        first_implementation_date: schedule.first_implementation_date,
        next_due_date: nextDueDate.toISOString().split('T')[0],
        is_active: true,
      };
    });
    
    const { data: patientSchedules, error: schedulesError } = await supabase
      .from('patient_schedules')
      .insert(schedulesToCreate)
      .select();
    
    if (schedulesError) {
      console.error('Failed to create schedules:', schedulesError);
      
      // Rollback: delete the patient if schedules failed
      await supabase
        .from('patients')
        .delete()
        .eq('id', patient.id);
      
      return NextResponse.json(
        { error: '일정 생성에 실패했습니다' },
        { status: 500 }
      );
    }
    
    // Create initial schedule history entries
    const historyEntries = patientSchedules.map(ps => ({
      patient_schedule_id: ps.id,
      scheduled_date: ps.first_implementation_date,
      is_completed: false,
    }));
    
    const { error: historyError } = await supabase
      .from('schedule_history')
      .insert(historyEntries);
    
    if (historyError) {
      console.error('Failed to create history entries:', historyError);
      // Note: Not rolling back here as the main data is already created
    }
    
    return NextResponse.json({
      patient,
      schedules: patientSchedules,
    }, { status: 201 });
    
  } catch (error) {
    console.error('Unexpected error in POST /api/patients:', error);
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch patients with schedules
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('id');
    
    const supabase = await createPureClient();
    
    if (patientId) {
      // Get single patient with schedules
      const { data, error } = await supabase
        .from('patients')
        .select(`
          *,
          patient_schedules (
            *,
            items (*)
          )
        `)
        .eq('id', patientId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json(
            { error: '환자를 찾을 수 없습니다' },
            { status: 404 }
          );
        }
        throw error;
      }
      
      return NextResponse.json(data);
    } else {
      // Get all patients
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error in GET /api/patients:', error);
    return NextResponse.json(
      { error: '데이터를 가져오는데 실패했습니다' },
      { status: 500 }
    );
  }
}