# CareCycle Development Guide

## 🚀 Development Commands

```bash
# Development
npm run dev                    # Start development server with TurboPack
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run ESLint

# Testing
npm run test                   # Run tests with Vitest
npm run test:ui                # Run tests with UI
npm run test:coverage          # Generate test coverage report

# Database (requires Supabase CLI)
supabase db push               # Apply migrations
supabase functions deploy      # Deploy edge functions
```

## 🏗️ Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.4.5 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query (TanStack Query v5)
- **Database**: Supabase (PostgreSQL)
- **Forms**: React Hook Form + Zod validation
- **Testing**: Vitest + Testing Library
- **PWA**: Service Worker + Web Push API

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (REST endpoints)
│   ├── patients/          # Patient management pages
│   ├── schedules/         # Schedule management pages
│   └── providers.tsx      # Global providers setup
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components
│   └── notifications/     # Notification system
├── lib/
│   ├── supabase/          # Database clients
│   └── utils/             # Utility functions
└── types/                 # TypeScript types
```

## 📋 Key Patterns & Code Examples

### 1. Component Structure Pattern
```tsx
// src/app/patients/[id]/page.tsx:55-142
export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [schedules, setSchedules] = useState<PatientSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
      fetchSchedules();
    }
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}`);
      if (!response.ok) throw new Error('Failed to fetch patient');
      const data = await response.json();
      setPatient(data.patient);
    } catch (error) {
      console.error('Error fetching patient:', error);
    }
  };

  return (
    <div className="container py-8">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          뒤로가기
        </Button>
      </div>
      {/* Main content */}
    </div>
  );
}
```

### 2. Form Handling Pattern
```tsx
// src/app/patients/new/page.tsx:77-137
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validation with toast feedback
  if (!formData.patient_number || !formData.name) {
    toast({
      title: '입력 오류',
      description: '환자 번호와 이름은 필수 입력 항목입니다.',
      variant: 'destructive',
    });
    return;
  }

  setLoading(true);

  try {
    const response = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        schedules: validSchedules,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '환자 등록에 실패했습니다.');
    }

    toast({
      title: '성공',
      description: '환자가 성공적으로 등록되었습니다.',
    });

    router.push('/patients');
  } catch (error) {
    toast({
      title: '오류',
      description: error instanceof Error ? error.message : '환자 등록에 실패했습니다.',
      variant: 'destructive',
    });
  } finally {
    setLoading(false);
  }
};
```

### 3. API Route Pattern with Validation
```tsx
// src/app/api/patients/route.ts:4-35
const createPatientSchema = z.object({
  patient_number: z.string().min(1, "환자 번호는 필수입니다"),
  name: z.string().min(1, "환자 이름은 필수입니다"),
  phone: z.string().optional(),
  notes: z.string().optional(),
  schedules: z.array(z.object({
    item_id: z.string().uuid("유효한 항목 ID가 아닙니다"),
    first_implementation_date: z.string().refine(
      (date) => !isNaN(Date.parse(date)),
      "유효한 날짜 형식이 아닙니다"
    ),
  })).min(1, "최소 하나의 일정이 필요합니다"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = createPatientSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = await createPureClient();
    // Database operations...
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
```

### 4. State Management with React Query
```tsx
// src/app/providers.tsx:16-42
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <NotificationListener />
          <ServiceWorkerProvider />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
```

### 5. Styling Convention (shadcn/ui + CVA)
```tsx
// src/components/ui/button.tsx:7-34
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
```

### 6. Supabase Client Pattern
```tsx
// src/lib/supabase/server.ts:33-46
// Pure client for server-side operations without cookies
export async function createPureClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );
}
```

### 7. Import Pattern & Module Organization
```tsx
// External dependencies first
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Internal absolute imports using @/ alias
import { createPureClient } from '@/lib/supabase/server';
import { calculateNextDueDate, isValidCycleUnit } from '@/lib/utils/schedule';

// UI components from shadcn
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Icons
import { ArrowLeft, Calendar, Plus } from 'lucide-react';
```

### 8. Error Handling Pattern
```tsx
// Consistent error handling across API routes
try {
  // Operation
} catch (error) {
  console.error('Specific context:', error);
  
  if (error instanceof SomeSpecificError) {
    return NextResponse.json(
      { error: 'User-friendly message' },
      { status: 400 }
    );
  }
  
  return NextResponse.json(
    { error: '예상치 못한 오류가 발생했습니다' },
    { status: 500 }
  );
}
```

## 🔐 Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx  # New format
SUPABASE_SECRET_KEY=sb_secret_xxx                        # New format
RESEND_API_KEY=re_xxx                                    # Optional: for email
```

## 📝 Database Schema Overview

Key tables:
- `patients`: Patient information
- `items`: Test/injection items with cycles
- `patient_schedules`: Active schedules linking patients to items
- `schedule_history`: Completed schedule records
- `notifications`: Push notification subscriptions

## 🧪 Testing Conventions

```tsx
// Example test pattern
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

describe('Component', () => {
  it('should handle user interaction', async () => {
    render(<Component />);
    
    const button = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(button);
    
    expect(await screen.findByText('Success')).toBeInTheDocument();
  });
});
```

## 🚨 Important Notes

1. **Supabase Keys**: Using new API key format (sb_publishable_, sb_secret_)
2. **Mobile First**: All UI components are mobile-optimized with PWA support
3. **Korean UI**: Interface is in Korean for medical staff
4. **Type Safety**: Strict TypeScript with Zod validation
5. **Security**: Row Level Security (RLS) enabled on all tables

<vooster-docs>
- @vooster-docs/prd.md
- @vooster-docs/architecture.md
- @vooster-docs/step-by-step.md
- @vooster-docs/tdd.md
- @vooster-docs/clean-code.md
- @vooster-docs/git-commit-message.md
</vooster-docs>

# Supabase API Keys Migration (2025)

## Important: Supabase Key System Change
Supabase is migrating from legacy JWT-based keys to new API key system:

### Legacy Keys (Being Phased Out)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Client-side key (public)
- `SUPABASE_SERVICE_ROLE_KEY`: Server-side key (secret)

### New Keys (Current Standard)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`): Replaces anon key
- `SUPABASE_SECRET_KEY` (`sb_secret_...`): Replaces service_role key

### Migration Timeline
- **2025년 6월**: 새 API 키 시스템 프리뷰
- **2025년 7월**: 정식 출시
- **2025년 11월**: 새 프로젝트는 레거시 키 없음
- **2026년 말**: 레거시 키 완전 폐기

### Security Note
- Never commit `.env.local` to git
- Secret keys must never be exposed in client-side code
- Rotate keys immediately if exposed