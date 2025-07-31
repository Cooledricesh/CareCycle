import { NextRequest, NextResponse } from 'next/server';
import { createPureClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    
    // Use provided date or today's date in UTC
    const targetDate = dateParam 
      ? new Date(dateParam) 
      : new Date();
    
    const dateString = targetDate.toISOString().split('T')[0];
    
    const supabase = await createPureClient();
    
    // Get today's schedules with related data
    const { data, error } = await supabase
      .from('schedule_history')
      .select(`
        *,
        patient_schedules (
          *,
          patients (*),
          items (*)
        )
      `)
      .eq('scheduled_date', dateString)
      .order('is_completed', { ascending: true })
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Failed to fetch today schedules:', error);
      return NextResponse.json(
        { error: '일정을 가져오는데 실패했습니다' },
        { status: 500 }
      );
    }
    
    // Format the response for easier frontend consumption
    const formattedData = data.map(schedule => ({
      id: schedule.id,
      scheduled_date: schedule.scheduled_date,
      actual_implementation_date: schedule.actual_implementation_date,
      is_completed: schedule.is_completed,
      notes: schedule.notes,
      patient: {
        id: schedule.patient_schedules.patients.id,
        patient_number: schedule.patient_schedules.patients.patient_number,
        name: schedule.patient_schedules.patients.name,
        phone: schedule.patient_schedules.patients.phone,
      },
      item: {
        id: schedule.patient_schedules.items.id,
        name: schedule.patient_schedules.items.name,
        category: schedule.patient_schedules.items.category,
        cycle_value: schedule.patient_schedules.items.cycle_value,
        cycle_unit: schedule.patient_schedules.items.cycle_unit,
      },
      patient_schedule_id: schedule.patient_schedule_id,
    }));
    
    return NextResponse.json({
      date: dateString,
      schedules: formattedData,
      summary: {
        total: formattedData.length,
        completed: formattedData.filter(s => s.is_completed).length,
        pending: formattedData.filter(s => !s.is_completed).length,
      },
    });
    
  } catch (error) {
    console.error('Unexpected error in GET /api/schedules/today:', error);
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}