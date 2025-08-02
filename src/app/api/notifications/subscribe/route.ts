import { NextRequest, NextResponse } from 'next/server';
import { createPureClient } from '@/lib/supabase/server';
import { z } from 'zod';

const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate subscription data
    const validation = pushSubscriptionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: '유효하지 않은 구독 데이터입니다' },
        { status: 400 }
      );
    }
    
    const supabase = await createPureClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }
    
    // Check if we need to create a push_subscriptions table
    // For now, we'll store it in the profiles table
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        push_subscription: validation.data,
        notification_enabled: true,
      })
      .eq('id', user.id);
    
    if (updateError) {
      console.error('Failed to save push subscription:', updateError);
      return NextResponse.json(
        { error: '푸시 구독 저장에 실패했습니다' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: '푸시 알림이 활성화되었습니다' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/notifications/subscribe:', error);
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createPureClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      );
    }
    
    // Remove push subscription
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        push_subscription: null,
      })
      .eq('id', user.id);
    
    if (updateError) {
      console.error('Failed to remove push subscription:', updateError);
      return NextResponse.json(
        { error: '푸시 구독 제거에 실패했습니다' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: '푸시 알림이 비활성화되었습니다' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in DELETE /api/notifications/subscribe:', error);
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}