import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const supabase = await createClient();

    // Build the query
    let query = supabase
      .from('schedule_history')
      .select(`
        *,
        patient_schedules!inner(
          *,
          patients!inner(*),
          items!inner(*)
        )
      `)
      .order('scheduled_date', { ascending: true });

    // Apply date filters
    if (startDate) {
      query = query.gte('scheduled_date', startDate);
    }
    if (endDate) {
      query = query.lte('scheduled_date', endDate);
    }

    // Apply status filter
    if (status === 'completed') {
      query = query.eq('is_completed', true);
    } else if (status === 'pending') {
      query = query.eq('is_completed', false);
    } else if (status === 'overdue') {
      query = query.eq('is_completed', false)
        .lt('scheduled_date', new Date().toISOString().split('T')[0]);
    }

    const { data: schedules, error } = await query;

    if (error) {
      console.error('Error fetching schedules:', error);
      return NextResponse.json(
        { error: 'Failed to fetch schedules' },
        { status: 500 }
      );
    }

    // Transform the data structure
    const transformedSchedules = schedules?.map(schedule => ({
      id: schedule.id,
      scheduled_date: schedule.scheduled_date,
      actual_implementation_date: schedule.actual_implementation_date,
      is_completed: schedule.is_completed,
      notes: schedule.notes,
      patient_schedule_id: schedule.patient_schedule_id,
      patient: schedule.patient_schedules.patients,
      item: schedule.patient_schedules.items,
    })) || [];

    // Apply category filter after transformation
    const filteredSchedules = category && category !== 'all'
      ? transformedSchedules.filter(s => s.item.category === category)
      : transformedSchedules;

    return NextResponse.json({
      schedules: filteredSchedules,
      total: filteredSchedules.length,
    });
  } catch (error) {
    console.error('Error in schedules API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}