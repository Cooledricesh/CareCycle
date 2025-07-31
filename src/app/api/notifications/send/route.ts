import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, patientId, date } = body;

    if (!type || !['daily', 'reminder', 'overdue'].includes(type)) {
      return NextResponse.json(
        { error: '유효하지 않은 알림 타입입니다.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('send-schedule-notifications', {
      body: {
        type,
        patientId,
        date
      }
    });

    if (error) {
      console.error('Edge Function error:', error);
      return NextResponse.json(
        { error: '알림 전송에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
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

    // This endpoint can be called by a cron job to check for notifications
    const response = await POST(
      new NextRequest(request.url, {
        method: 'POST',
        body: JSON.stringify({ type: checkType }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Scheduled check error:', error);
    return NextResponse.json(
      { error: '예약 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}