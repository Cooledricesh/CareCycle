import { NextRequest, NextResponse } from 'next/server';
import { createPureClient } from '@/lib/supabase/server';
import { calculateNextDueDate, isValidCycleUnit } from '@/lib/utils/schedule';
import { z } from 'zod';

// Add schedule schema
const addScheduleSchema = z.object({
  item_id: z.string().uuid("유효한 항목 ID가 아닙니다"),
  first_implementation_date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    "유효한 날짜 형식이 아닙니다"
  ),
});

// Update schedule schema
const updateScheduleSchema = z.object({
  schedule_id: z.string().uuid("유효한 스케줄 ID가 아닙니다"),
  first_implementation_date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    "유효한 날짜 형식이 아닙니다"
  ).optional(),
  is_active: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: 환자의 모든 일정 조회 (활성 및 비활성 포함)
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active_only') === 'true';
    const includeHistory = searchParams.get('include_history') === 'true';
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 환자 ID입니다' },
        { status: 400 }
      );
    }

    const supabase = await createPureClient();
    
    // Check if patient exists
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id, name, patient_number')
      .eq('id', id)
      .single();
    
    if (patientError || !patient) {
      return NextResponse.json(
        { error: '환자를 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    // Build query for schedules
    let query = supabase
      .from('patient_schedules')
      .select(`
        *,
        items (
          id,
          name,
          category,
          cycle_value,
          cycle_unit,
          description
        )
        ${includeHistory ? `,
        schedule_history (
          id,
          scheduled_date,
          actual_implementation_date,
          is_completed,
          notes,
          created_at
        )` : ''}
      `)
      .eq('patient_id', id)
      .order('created_at', { ascending: false });
    
    // Filter by active status if requested
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    const { data: schedules, error: schedulesError } = await query;
    
    if (schedulesError) {
      console.error('Error fetching schedules:', schedulesError);
      return NextResponse.json(
        { error: '일정을 가져오는데 실패했습니다' },
        { status: 500 }
      );
    }
    
    // Group schedules by status
    const activeSchedules = schedules?.filter(s => s.is_active) || [];
    const inactiveSchedules = schedules?.filter(s => !s.is_active) || [];
    
    // Calculate overdue schedules
    const today = new Date().toISOString().split('T')[0];
    const overdueSchedules = activeSchedules.filter(s => s.next_due_date < today);
    const upcomingSchedules = activeSchedules.filter(s => s.next_due_date >= today);
    
    return NextResponse.json({
      patient,
      schedules: schedules || [],
      summary: {
        total: schedules?.length || 0,
        active: activeSchedules.length,
        inactive: inactiveSchedules.length,
        overdue: overdueSchedules.length,
        upcoming: upcomingSchedules.length,
      }
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/patients/[id]/schedules:', error);
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// POST: 환자에게 새 일정 추가
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 환자 ID입니다' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validation = addScheduleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { item_id, first_implementation_date } = validation.data;
    
    const supabase = await createPureClient();
    
    // Check if patient exists
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('id', id)
      .single();
    
    if (patientError || !patient) {
      return NextResponse.json(
        { error: '환자를 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    // Check if item exists and get its cycle info
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('id, name, cycle_value, cycle_unit')
      .eq('id', item_id)
      .single();
    
    if (itemError || !item) {
      return NextResponse.json(
        { error: '항목을 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    // Check if this patient already has an active schedule for this item
    const { data: existingSchedule } = await supabase
      .from('patient_schedules')
      .select('id')
      .eq('patient_id', id)
      .eq('item_id', item_id)
      .eq('is_active', true)
      .single();
    
    if (existingSchedule) {
      return NextResponse.json(
        { error: '이 환자는 해당 항목에 대한 활성 일정이 이미 있습니다' },
        { status: 409 }
      );
    }
    
    // Calculate next due date
    const firstImplementationDate = new Date(first_implementation_date);
    
    // Validate cycle_unit before using it
    if (!isValidCycleUnit(item.cycle_unit)) {
      return NextResponse.json(
        { error: `유효하지 않은 주기 단위입니다: ${item.cycle_unit}. 'weeks' 또는 'months'만 허용됩니다.` },
        { status: 400 }
      );
    }
    
    const nextDueDate = calculateNextDueDate({
      startDate: firstImplementationDate,
      cycleValue: item.cycle_value,
      cycleUnit: item.cycle_unit,
    });
    
    // Create new schedule
    const { data: schedule, error: scheduleError } = await supabase
      .from('patient_schedules')
      .insert({
        patient_id: id,
        item_id,
        first_implementation_date,
        next_due_date: nextDueDate.toISOString().split('T')[0],
        is_active: true,
      })
      .select(`
        *,
        items (*)
      `)
      .single();
    
    if (scheduleError) {
      console.error('Error creating schedule:', scheduleError);
      return NextResponse.json(
        { error: '일정 생성에 실패했습니다' },
        { status: 500 }
      );
    }
    
    // Create initial history entry
    const { error: historyError } = await supabase
      .from('schedule_history')
      .insert({
        patient_schedule_id: schedule.id,
        scheduled_date: first_implementation_date,
        is_completed: false,
      });
    
    if (historyError) {
      console.error('Error creating history entry:', historyError);
      // Don't fail the request as the main schedule was created
    }
    
    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/patients/[id]/schedules:', error);
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// PUT: 환자 일정 수정
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 환자 ID입니다' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validation = updateScheduleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { schedule_id, first_implementation_date, is_active } = validation.data;
    
    const supabase = await createPureClient();
    
    // Check if schedule exists and belongs to this patient
    const { data: existingSchedule, error: checkError } = await supabase
      .from('patient_schedules')
      .select(`
        *,
        items (cycle_value, cycle_unit)
      `)
      .eq('id', schedule_id)
      .eq('patient_id', id)
      .single();
    
    if (checkError || !existingSchedule) {
      return NextResponse.json(
        { error: '일정을 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }
    
    if (first_implementation_date) {
      updateData.first_implementation_date = first_implementation_date;
      
      // Recalculate next due date if first implementation date changes
      const firstDate = new Date(first_implementation_date);
      
      // Validate cycle_unit before using it
      if (!isValidCycleUnit(existingSchedule.items.cycle_unit)) {
        return NextResponse.json(
          { error: `유효하지 않은 주기 단위입니다: ${existingSchedule.items.cycle_unit}. 'weeks' 또는 'months'만 허용됩니다.` },
          { status: 400 }
        );
      }
      
      const nextDueDate = calculateNextDueDate({
        startDate: firstDate,
        cycleValue: existingSchedule.items.cycle_value,
        cycleUnit: existingSchedule.items.cycle_unit,
      });
      updateData.next_due_date = nextDueDate.toISOString().split('T')[0];
    }
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: '수정할 데이터가 없습니다' },
        { status: 400 }
      );
    }
    
    // Update schedule
    const { data: schedule, error: updateError } = await supabase
      .from('patient_schedules')
      .update(updateData)
      .eq('id', schedule_id)
      .select(`
        *,
        items (*)
      `)
      .single();
    
    if (updateError) {
      console.error('Error updating schedule:', updateError);
      return NextResponse.json(
        { error: '일정 수정에 실패했습니다' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Unexpected error in PUT /api/patients/[id]/schedules:', error);
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}