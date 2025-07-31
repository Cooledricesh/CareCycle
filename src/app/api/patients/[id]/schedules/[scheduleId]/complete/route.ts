import { NextRequest, NextResponse } from 'next/server';
import { createPureClient } from '@/lib/supabase/server';
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
    
    // Call the PostgreSQL function to handle all operations in a transaction
    const { data: result, error: rpcError } = await supabase
      .rpc('complete_patient_schedule', {
        p_patient_id: id,
        p_schedule_id: scheduleId,
        p_actual_implementation_date: actual_implementation_date,
        p_notes: notes || null,
        p_scheduled_date: scheduled_date || null
      });
    
    if (rpcError) {
      console.error('Error completing schedule:', rpcError);
      
      // Handle specific error messages from the function
      if (rpcError.message.includes('활성 일정을 찾을 수 없습니다')) {
        return NextResponse.json(
          { error: '활성 일정을 찾을 수 없습니다' },
          { status: 404 }
        );
      }
      
      if (rpcError.message.includes('이미 완료된 일정입니다')) {
        return NextResponse.json(
          { error: '이미 완료된 일정입니다' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: '일정 완료 처리 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }
    
    if (!result) {
      return NextResponse.json(
        { error: '일정 완료 처리에 실패했습니다' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: '일정이 성공적으로 완료되었습니다',
      schedule: result.schedule,
      history_entry: result.history_entry,
      next_due_date: result.schedule.next_due_date,
    }, { status: 200 });
    
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