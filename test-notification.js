// 브라우저 콘솔에서 실행할 테스트 코드

// 1. 테스트 알림 생성
async function createTestNotification() {
  const { createClient } = await import('@/lib/supabase/client');
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('로그인이 필요합니다');
    return;
  }
  
  // notifications 테이블에 직접 알림 추가
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: user.id,
      type: 'daily',
      title: '오늘의 검사 일정 알림',
      message: '테스트 알림입니다. 실시간 알림이 작동하는지 확인합니다.',
      is_read: false,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) {
    console.error('알림 생성 실패:', error);
  } else {
    console.log('알림 생성 성공:', data);
  }
}

// 2. 알림 목록 조회
async function listNotifications() {
  const { createClient } = await import('@/lib/supabase/client');
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('알림 조회 실패:', error);
  } else {
    console.log('알림 목록:', data);
  }
}

// 실행
console.log('createTestNotification() - 테스트 알림 생성');
console.log('listNotifications() - 알림 목록 조회');