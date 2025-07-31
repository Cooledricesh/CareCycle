import { NextRequest, NextResponse } from 'next/server';
import { createPureClient } from '@/lib/supabase/server';
import { calculateNextDueDate } from '@/lib/utils/schedule';
import { z } from 'zod';

// Complete schedule schema
const completeScheduleSchema = z.object({
  actual_implementation_date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    "유효한 날짜 형식이 아닙니다"
  ),
  notes: z.string().optional(),
  scheduled_date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    "유효한 날짜 형식이 아닙니다"
  ).optional(), // If not provided, use next_due_date from schedule
});

interface RouteParams {
  params: Promise<{ id: string; scheduleId: string }>;
}

// POST: 일정 완료 처리
export async function POST(
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
    const validation = completeScheduleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { actual_implementation_date, notes, scheduled_date } = validation.data;
    
    const supabase = await createPureClient();
    
    // Get schedule with item details
    const { data: schedule, error: scheduleError } = await supabase
      .from('patient_schedules')
      .select(`
        *,
        items (
          id,
          name,
          cycle_value,
          cycle_unit
        )
      `)
      .eq('id', scheduleId)
      .eq('patient_id', id)
      .eq('is_active', true)
      .single();
    
    if (scheduleError || !schedule) {
      return NextResponse.json(
        { error: '활성 일정을 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    // Use scheduled_date from request or next_due_date from schedule
    const targetScheduledDate = scheduled_date || schedule.next_due_date;
    
    // Check if there's already a completed entry for this scheduled date
    const { data: existingHistory } = await supabase
      .from('schedule_history')
      .select('id, is_completed')
      .eq('patient_schedule_id', scheduleId)
      .eq('scheduled_date', targetScheduledDate)
      .single();
    
    if (existingHistory?.is_completed) {
      return NextResponse.json(
        { error: '이미 완료된 일정입니다' },
        { status: 409 }
      );
    }
    
    // Calculate next due date based on actual implementation date
    const actualDate = new Date(actual_implementation_date);
    const nextDueDate = calculateNextDueDate({
      startDate: actualDate,
      cycleValue: schedule.items.cycle_value,
      cycleUnit: schedule.items.cycle_unit as 'weeks' | 'months',
    });
    
    // Start transaction-like operations
    try {
      // 1. Update or create schedule history entry
      let historyEntry;
      if (existingHistory) {
        // Update existing entry
        const { data, error } = await supabase
          .from('schedule_history')
          .update({
            actual_implementation_date,
            is_completed: true,
            notes,
          })
          .eq('id', existingHistory.id)
          .select()
          .single();
        
        if (error) throw error;
        historyEntry = data;
      } else {
        // Create new entry
        const { data, error } = await supabase
          .from('schedule_history')
          .insert({
            patient_schedule_id: scheduleId,
            scheduled_date: targetScheduledDate,
            actual_implementation_date,
            is_completed: true,
            notes,
          })
          .select()
          .single();
        
        if (error) throw error;
        historyEntry = data;
      }
      
      // 2. Update patient schedule with new next due date and last implementation date
      const { data: updatedSchedule, error: updateError } = await supabase
        .from('patient_schedules')
        .update({
          next_due_date: nextDueDate.toISOString().split('T')[0],
          last_implementation_date: actual_implementation_date,
        })
        .eq('id', scheduleId)
        .select(`
          *,
          items (*)
        `)
        .single();
      
      if (updateError) throw updateError;
      
      // 3. Create next schedule history entry (incomplete)
      const { error: nextHistoryError } = await supabase
        .from('schedule_history')
        .insert({
          patient_schedule_id: scheduleId,
          scheduled_date: nextDueDate.toISOString().split('T')[0],
          is_completed: false,
        });
      
      if (nextHistoryError) {
        console.error('Error creating next history entry:', nextHistoryError);
        // Don't fail the request as the main completion was successful
      }
      
      return NextResponse.json({
        message: '일정이 성공적으로 완료되었습니다',
        schedule: updatedSchedule,
        history_entry: historyEntry,
        next_due_date: nextDueDate.toISOString().split('T')[0],
      }, { status: 200 });
      
    } catch (transactionError) {
      console.error('Transaction error:', transactionError);
      return NextResponse.json(
        { error: '일정 완료 처리 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Unexpected error in POST /api/patients/[id]/schedules/[scheduleId]/complete:', error);
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// GET: 일정 완료 기록 조회
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

    const { searchParams } = new URL(request.url);
    const completedOnly = searchParams.get('completed_only') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    
    const supabase = await createPureClient();
    
    // Check if schedule exists and belongs to this patient
    const { data: schedule, error: scheduleError } = await supabase
      .from('patient_schedules')
      .select('id')
      .eq('id', scheduleId)
      .eq('patient_id', id)
      .single();
    
    if (scheduleError || !schedule) {
      return NextResponse.json(
        { error: '일정을 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    // Build query for history
    let query = supabase
      .from('schedule_history')
      .select('*')
      .eq('patient_schedule_id', scheduleId)
      .order('scheduled_date', { ascending: false });
    
    if (completedOnly) {
      query = query.eq('is_completed', true);
    }
    
    if (limit) {
      query = query.range(offset, offset + limit - 1);
    }
    
    const { data: history, error: historyError } = await query;
    
    if (historyError) {
      console.error('Error fetching schedule history:', historyError);
      return NextResponse.json(
        { error: '일정 기록을 가져오는데 실패했습니다' },
        { status: 500 }
      );
    }
    
    // Calculate statistics
    const completedCount = history?.filter(h => h.is_completed).length || 0;
    const totalCount = history?.length || 0;
    const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    
    return NextResponse.json({
      history: history || [],
      statistics: {
        total: totalCount,
        completed: completedCount,
        pending: totalCount - completedCount,
        completion_rate: Math.round(completionRate * 100) / 100,
      }
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/patients/[id]/schedules/[scheduleId]/complete:', error);
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}