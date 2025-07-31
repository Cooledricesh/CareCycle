import { NextRequest, NextResponse } from 'next/server';
import { createPureClient } from '@/lib/supabase/server';
import { calculateNextDueDateFromLastImplementation, isValidCycleUnit } from '@/lib/utils/schedule';
import { z } from 'zod';

const completeScheduleSchema = z.object({
  actual_implementation_date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    "유효한 날짜 형식이 아닙니다"
  ),
  notes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: scheduleHistoryId } = await context.params;
    const body = await request.json();
    
    // Validate request body
    const validation = completeScheduleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten() },
        { status: 400 }
      );
    }
    
    const { actual_implementation_date, notes } = validation.data;
    const supabase = await createPureClient();
    
    // Get schedule history entry with related data
    const { data: historyEntry, error: historyError } = await supabase
      .from('schedule_history')
      .select(`
        *,
        patient_schedules (
          *,
          items (
            cycle_value,
            cycle_unit
          )
        )
      `)
      .eq('id', scheduleHistoryId)
      .single();
    
    if (historyError || !historyEntry) {
      return NextResponse.json(
        { error: '일정을 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    if (historyEntry.is_completed) {
      return NextResponse.json(
        { error: '이미 완료된 일정입니다' },
        { status: 400 }
      );
    }
    
    // Update history entry
    const { error: updateHistoryError } = await supabase
      .from('schedule_history')
      .update({
        actual_implementation_date,
        is_completed: true,
        notes,
      })
      .eq('id', scheduleHistoryId);
    
    if (updateHistoryError) {
      console.error('Failed to update history:', updateHistoryError);
      return NextResponse.json(
        { error: '일정 완료 처리에 실패했습니다' },
        { status: 500 }
      );
    }
    
    // Calculate next due date
    const patientSchedule = historyEntry.patient_schedules;
    const item = patientSchedule.items;
    
    // Validate cycle_unit before using it
    if (!isValidCycleUnit(item.cycle_unit)) {
      return NextResponse.json(
        { error: `유효하지 않은 주기 단위입니다: ${item.cycle_unit}. 'weeks' 또는 'months'만 허용됩니다.` },
        { status: 400 }
      );
    }
    
    const nextDueDate = calculateNextDueDateFromLastImplementation(
      new Date(patientSchedule.first_implementation_date),
      item.cycle_value,
      item.cycle_unit,
      new Date(actual_implementation_date)
    );
    
    // Update patient schedule with new due date and last implementation date
    const { error: updateScheduleError } = await supabase
      .from('patient_schedules')
      .update({
        next_due_date: nextDueDate.toISOString().split('T')[0],
        last_implementation_date: actual_implementation_date,
      })
      .eq('id', patientSchedule.id);
    
    if (updateScheduleError) {
      console.error('Failed to update schedule:', updateScheduleError);
      return NextResponse.json(
        { error: '다음 일정 계산에 실패했습니다' },
        { status: 500 }
      );
    }
    
    // Create next schedule history entry
    const { error: createHistoryError } = await supabase
      .from('schedule_history')
      .insert({
        patient_schedule_id: patientSchedule.id,
        scheduled_date: nextDueDate.toISOString().split('T')[0],
        is_completed: false,
      });
    
    if (createHistoryError) {
      console.error('Failed to create next history:', createHistoryError);
      // Not failing the request as the main operation succeeded
    }
    
    return NextResponse.json({
      success: true,
      next_due_date: nextDueDate.toISOString().split('T')[0],
    });
    
  } catch (error) {
    console.error('Unexpected error in POST /api/schedules/[id]/complete:', error);
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}