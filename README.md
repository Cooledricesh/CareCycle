# CareCycle - 의료진 일정 관리 시스템

정신건강의학과 의료진을 위한 검사·주사 일정 자동 관리 시스템

## 🏥 개요

CareCycle은 의료진의 반복적인 일정 관리 업무를 자동화하여 업무 효율성을 획기적으로 향상시키는 웹 애플리케이션입니다.

### 주요 특징
- 🔄 자동 일정 계산 및 관리
- 📅 일별 체크리스트 제공
- 🔔 스마트 알림 시스템
- 📊 직관적인 대시보드
- 🔍 빠른 환자 검색

## 🚀 시작하기

### 사전 요구사항
- Node.js 18.0 이상
- npm 또는 yarn
- Supabase 계정

### 설치

1. 저장소 클론
```bash
git clone https://github.com/yourusername/carecycle.git
cd carecycle
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 내용을 추가:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SECRET_KEY=your_secret_key

# Optional: Resend (for email notifications)
RESEND_API_KEY=your_resend_api_key
```

4. 데이터베이스 마이그레이션 실행
```bash
# Supabase CLI를 사용하여 마이그레이션 실행
supabase db push
```

5. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 15.4.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Query
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Date**: date-fns

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Edge Functions**: Supabase Edge Functions
- **Email**: Resend

### DevOps
- **Hosting**: Vercel
- **Testing**: Vitest + Testing Library
- **CI/CD**: GitHub Actions

## 📁 프로젝트 구조

```
CareCycle/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 라우트
│   │   ├── patients/          # 환자 관리 페이지
│   │   ├── schedules/         # 일정 관리 페이지
│   │   └── settings/          # 설정 페이지
│   ├── components/            # React 컴포넌트
│   │   ├── ui/               # UI 기본 컴포넌트
│   │   ├── layout/           # 레이아웃 컴포넌트
│   │   └── ...
│   ├── lib/                   # 유틸리티 및 설정
│   │   ├── supabase/         # Supabase 클라이언트
│   │   └── utils/            # 유틸리티 함수
│   └── types/                # TypeScript 타입 정의
├── supabase/
│   ├── migrations/           # 데이터베이스 마이그레이션
│   └── functions/            # Edge Functions
└── tests/                    # 테스트 파일
```

## 🔐 보안

- **Row Level Security (RLS)**: 모든 테이블에 활성화
- **API Key Management**: 2025년 새로운 Supabase API 키 형식 사용
- **HTTPS**: 모든 통신 암호화
- **환경 변수**: 민감한 정보는 환경 변수로 관리

## 📊 주요 기능

### 1. 환자 관리
- 환자 등록 및 정보 관리
- 환자별 일정 설정
- 빠른 검색 기능

### 2. 일정 관리
- 자동 일정 계산
- 일별/주별/월별 조회
- 완료 처리 및 이력 관리

### 3. 알림 시스템
- 일일 알림
- 사전 알림 (3일 전)
- 지연 알림

### 4. 대시보드
- 오늘의 일정 요약
- 완료율 통계
- 빠른 액션 버튼

## 🧪 테스트

```bash
# 테스트 실행
npm run test

# 테스트 커버리지
npm run test:coverage

# 테스트 감시 모드
npm run test:watch
```

## 🚀 배포

### Vercel 배포

1. Vercel 계정 생성 및 로그인
2. GitHub 저장소 연결
3. 환경 변수 설정
4. 배포

### Supabase Edge Functions 배포

```bash
supabase functions deploy send-schedule-notifications
```

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트 관련 문의사항은 이슈 트래커를 통해 남겨주세요.

---

Made with ❤️ for healthcare professionals

이 프로젝트는 [`EasyNext`](https://github.com/easynext/easynext)를 사용해 생성되었습니다.
