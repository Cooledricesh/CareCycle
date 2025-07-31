import { NextRequest, NextResponse } from 'next/server';
import { createPureClient } from '@/lib/supabase/server';
import { calculateNextDueDate, isValidCycleUnit } from '@/lib/utils/schedule';
import { z } from 'zod';

// Update individual schedule schema
const updateIndividualScheduleSchema = z.object({
  first_implementation_date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    "유효한 날짜 형식이 아닙니다"
  ).optional(),
  next_due_date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    "유효한 날짜 형식이 아닙니다"
  ).optional(),
  last_implementation_date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    "유효한 날짜 형식이 아닙니다"
  ).optional(),
  is_active: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string; scheduleId: string }>;
}

// GET: 개별 일정 상세 조회
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id, scheduleId } = await params;
    
    // Validate UUID formats
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id) || !uuidRegex.test(scheduleId)) {
      return NextResponse.json(
        { error: '유효하지 않은 ID입니다' },
        { status: 400 }
      );
    }

    const supabase = await createPureClient();
    
    // Get schedule with item details and history
    const { data: schedule, error } = await supabase
      .from('patient_schedules')
      .select(`
        *,
        items (*),
        schedule_history (
          id,
          scheduled_date,
          actual_implementation_date,
          is_completed,
          notes,
          created_at
        )
      `)
      .eq('id', scheduleId)
      .eq('patient_id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '일정을 찾을 수 없습니다' },
          { status: 404 }
        );
      }
      console.error('Error fetching schedule:', error);
      return NextResponse.json(
        { error: '일정을 가져오는데 실패했습니다' },
        { status: 500 }
      );
    }
    
    // Sort history by scheduled date descending
    if (schedule.schedule_history) {
      schedule.schedule_history.sort((a, b) => 
        new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime()
      );
    }
    
    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Unexpected error in GET /api/patients/[id]/schedules/[scheduleId]:', error);
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// PUT: 개별 일정 수정
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id, scheduleId } = await params;
    
    // Validate UUID formats
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id) || !uuidRegex.test(scheduleId)) {
      return NextResponse.json(
        { error: '유효하지 않은 ID입니다' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validation = updateIndividualScheduleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten() },
        { status: 400 }
      );
    }

    const updateData = validation.data;
    
    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );
    
    if (Object.keys(cleanUpdateData).length === 0) {
      return NextResponse.json(
        { error: '수정할 데이터가 없습니다' },
        { status: 400 }
      );
    }

    const supabase = await createPureClient();
    
    // Check if schedule exists and belongs to this patient
    const { data: existingSchedule, error: checkError } = await supabase
      .from('patient_schedules')
      .select(`
        *,
        items (cycle_value, cycle_unit)
      `)
      .eq('id', scheduleId)
      .eq('patient_id', id)
      .single();
    
    if (checkError || !existingSchedule) {
      return NextResponse.json(
        { error: '일정을 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    // If first_implementation_date is being changed, recalculate next_due_date
    if (cleanUpdateData.first_implementation_date && typeof cleanUpdateData.first_implementation_date === 'string' && !cleanUpdateData.next_due_date) {
      const firstDate = new Date(cleanUpdateData.first_implementation_date);
      
      // Validate cycle_unit before using it
      const cycleUnit = existingSchedule.items.cycle_unit;
      if (!isValidCycleUnit(cycleUnit)) {
        return NextResponse.json(
          { error: `유효하지 않은 주기 단위입니다: ${cycleUnit}. 'weeks' 또는 'months'만 허용됩니다.` },
          { status: 400 }
        );
      }
      
      const nextDueDate = calculateNextDueDate({
        startDate: firstDate,
        cycleValue: existingSchedule.items.cycle_value,
        cycleUnit: cycleUnit,
      });
      cleanUpdateData.next_due_date = nextDueDate.toISOString().split('T')[0];
    }
    
    // Update schedule
    const { data: schedule, error: updateError } = await supabase
      .from('patient_schedules')
      .update(cleanUpdateData)
      .eq('id', scheduleId)
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
    console.error('Unexpected error in PUT /api/patients/[id]/schedules/[scheduleId]:', error);
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// DELETE: 일정 삭제 (soft delete - is_active를 false로 설정)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id, scheduleId } = await params;
    
    // Validate UUID formats
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id) || !uuidRegex.test(scheduleId)) {
      return NextResponse.json(
        { error: '유효하지 않은 ID입니다' },
        { status: 400 }
      );
    }

    const supabase = await createPureClient();
    
    // Check if schedule exists and belongs to this patient
    const { data: existingSchedule, error: checkError } = await supabase
      .from('patient_schedules')
      .select('id, is_active')
      .eq('id', scheduleId)
      .eq('patient_id', id)
      .single();
    
    if (checkError || !existingSchedule) {
      return NextResponse.json(
        { error: '일정을 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    if (!existingSchedule.is_active) {
      return NextResponse.json(
        { error: '이미 삭제된 일정입니다' },
        { status: 400 }
      );
    }
    
    // Soft delete: set is_active to false
    const { data: schedule, error: deleteError } = await supabase
      .from('patient_schedules')
      .update({ is_active: false })
      .eq('id', scheduleId)
      .select()
      .single();
    
    if (deleteError) {
      console.error('Error deleting schedule:', deleteError);
      return NextResponse.json(
        { error: '일정 삭제에 실패했습니다' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: '일정이 성공적으로 삭제되었습니다',
      schedule_id: scheduleId
    });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/patients/[id]/schedules/[scheduleId]:', error);
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}