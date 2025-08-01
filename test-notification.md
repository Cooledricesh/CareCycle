# 알림 시스템 테스트 가이드

## 구현 완료 사항

### 1. 데이터베이스 스키마
- ✅ `schedule_history` 테이블에 알림 관련 컬럼 추가
  - `notification_scheduled_at`: 알림 발송 예정 시간
  - `is_notified`: 알림 발송 여부
- ✅ `profiles` 테이블 생성 (사용자 프로필 및 알림 설정)
- ✅ `notifications` 테이블 생성 (발송된 알림 기록)
- ✅ 새 일정 생성 시 자동으로 알림 예정일 계산 (7일 전)

### 2. Edge Function
- ✅ 관리 직원에게 알림 발송하도록 수정
- ✅ 일일/사전/지연 알림 타입별 처리
- ✅ Resend API 연동 구현 (API 키 설정 시 실제 이메일 발송)
- ✅ 알림 발송 후 상태 업데이트 및 기록 저장

### 3. Cron Job
- ✅ 매일 오전 9시 (KST) 자동 알림 설정
  - 일일 알림: 오전 9시
  - 사전 알림: 오전 9시
  - 지연 알림: 오전 10시

### 4. 프론트엔드
- ✅ 실시간 알림 수신 (NotificationListener)
- ✅ 알림 뱃지 및 드롭다운 (NotificationBadge)
- ✅ 알림 설정 UI (NotificationPreferences)
- ✅ 수동 알림 발송 기능

## 테스트 방법

### 1. 데이터베이스 마이그레이션 실행
```bash
# Supabase 대시보드에서 SQL Editor 열기
# /supabase/migrations/20250131_add_notification_columns.sql 내용 실행
# /supabase/migrations/20250131_add_cron_job_notification.sql 내용 실행
```

### 2. Edge Function 배포
```bash
# Supabase CLI 설치 (아직 안했다면)
npm install -g supabase

# 로그인
supabase login

# Edge Function 배포
supabase functions deploy send-schedule-notifications --project-ref cmtpkxllcwlcjjgtxzbf
```

### 3. 환경 변수 설정
```bash
# Supabase 대시보드 > Edge Functions > send-schedule-notifications > Secrets
# RESEND_API_KEY 추가 (https://resend.com에서 발급)
```

### 4. 테스트 시나리오

#### A. 수동 알림 발송 테스트
1. 앱 실행: `npm run dev`
2. 로그인
3. 설정 페이지(/settings) 이동
4. "지금 보내기" 버튼 클릭
5. 콘솔에서 알림 내용 확인 (RESEND_API_KEY 없으면 demo mode)

#### B. 실시간 알림 수신 테스트
1. 두 개의 브라우저 탭 열기
2. 같은 계정으로 로그인
3. 한 탭에서 알림 발송
4. 다른 탭에서 실시간으로 Toast 및 뱃지 업데이트 확인

#### C. 알림 설정 테스트
1. 설정 페이지에서 알림 토글 OFF
2. 알림 발송 시도
3. 해당 사용자는 알림 받지 않음 확인

#### D. Cron Job 테스트 (Production)
1. Supabase 대시보드 > Database > Cron Jobs 확인
2. 다음 SQL로 수동 실행 가능:
```sql
SELECT schedule_daily_notifications();
```

## 주의사항

1. **Resend API 키**: 실제 이메일 발송을 위해서는 Resend API 키가 필요합니다.
   - https://resend.com 에서 무료 계정 생성
   - API 키 발급 후 Supabase Edge Function Secrets에 추가

2. **Cron Job**: pg_cron은 Supabase Pro 플랜 이상에서만 사용 가능합니다.
   - 무료 플랜에서는 외부 cron 서비스 사용 권장

3. **이메일 주소**: profiles 테이블에 사용자 이메일이 저장되어 있어야 합니다.

## 문제 해결

### 알림이 발송되지 않는 경우
1. Edge Function 로그 확인: Supabase 대시보드 > Functions > Logs
2. schedule_history 테이블에서 notification_scheduled_at 값 확인
3. profiles 테이블에서 notification_enabled 상태 확인

### 실시간 알림이 작동하지 않는 경우
1. 브라우저 콘솔에서 WebSocket 연결 에러 확인
2. Supabase Realtime이 활성화되어 있는지 확인

### Cron Job이 실행되지 않는 경우
1. pg_cron 확장이 활성화되어 있는지 확인
2. cron.job 테이블에서 job 상태 확인:
```sql
SELECT * FROM cron.job;
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```