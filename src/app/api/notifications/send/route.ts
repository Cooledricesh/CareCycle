import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function sendScheduleNotification(
  type: string,
  userId?: string,
  date?: string
) {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return {
      success: false,
      error: '인증이 필요합니다.',
      status: 401
    };
  }
  
  // Check authorization - for now, any authenticated user can send notifications
  // In a production app, you would check for admin role here
  // Example: if (!user.user_metadata?.isAdmin) { return 403 }
  
  if (!type || !['daily', 'reminder', 'overdue'].includes(type)) {
    return {
      success: false,
      error: '유효하지 않은 알림 타입입니다.',
      status: 400
    };
  }

  // Call the Edge Function
  const { data, error } = await supabase.functions.invoke('send-schedule-notifications', {
    body: {
      type,
      userId,
      date
    }
  });

  if (error) {
    console.error('Edge Function error:', error);
    return {
      success: false,
      error: '알림 전송에 실패했습니다.',
      status: 500
    };
  }

  return {
    success: true,
    data,
    status: 200
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, userId, date } = body;

    const result = await sendScheduleNotification(type, userId, date);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json(
      { error: '내부 서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// Scheduled notification check endpoint
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const checkType = searchParams.get('check') || 'daily';
    const userId = searchParams.get('userId') || undefined;
    const date = searchParams.get('date') || undefined;

    // This endpoint can be called by a cron job to check for notifications
    const result = await sendScheduleNotification(checkType, userId, date);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Scheduled check error:', error);
    return NextResponse.json(
      { error: '예약 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}