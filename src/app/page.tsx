'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { isOverdue, getDaysUntilDue } from '@/lib/utils/schedule';

interface TodaySchedule {
  id: string;
  scheduled_date: string;
  actual_implementation_date: string | null;
  is_completed: boolean;
  notes: string | null;
  patient: {
    id: string;
    patient_number: string;
    name: string;
    phone: string | null;
  };
  item: {
    id: string;
    name: string;
    category: 'test' | 'injection';
    cycle_value: number;
    cycle_unit: 'weeks' | 'months';
  };
  patient_schedule_id: string;
}

interface ScheduleSummary {
  total: number;
  completed: number;
  pending: number;
}

export default function HomePage() {
  const router = useRouter();
  const [todaySchedules, setTodaySchedules] = useState<TodaySchedule[]>([]);
  const [summary, setSummary] = useState<ScheduleSummary>({ total: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    fetchTodaySchedules();
  }, []);

  const fetchTodaySchedules = async () => {
    try {
      const response = await fetch('/api/schedules/today');
      if (!response.ok) throw new Error('Failed to fetch schedules');
      const data = await response.json();
      setTodaySchedules(data.schedules);
      setSummary(data.summary);
    } catch (error) {
      console.error('Error fetching today schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (scheduleId: string) => {
    setCompleting(scheduleId);
    try {
      const response = await fetch(`/api/schedules/${scheduleId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actual_implementation_date: new Date().toISOString().split('T')[0],
        }),
      });

      if (!response.ok) throw new Error('Failed to complete schedule');

      // Refresh the list
      await fetchTodaySchedules();
    } catch (error) {
      console.error('Error completing schedule:', error);
    } finally {
      setCompleting(null);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CareCycle</h1>
          <p className="text-muted-foreground">
            정신건강의학과 검사·주사 일정 관리 시스템
          </p>
        </div>
        <Button onClick={() => router.push('/patients/new')}>
          <Plus className="h-4 w-4 mr-2" />
          신규 환자 등록
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘의 전체 일정</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료된 일정</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">대기 중인 일정</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summary.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => router.push('/patients')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              환자 관리
            </CardTitle>
            <CardDescription>환자 목록 조회 및 관리</CardDescription>
          </CardHeader>
        </Card>
        <Card 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => router.push('/schedules')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              일정 관리
            </CardTitle>
            <CardDescription>전체 일정 조회 및 관리</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>오늘의 일정</CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">로딩 중...</p>
            </div>
          ) : todaySchedules.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">오늘 예정된 일정이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todaySchedules.map((schedule) => (
                <Card 
                  key={schedule.id}
                  className={schedule.is_completed ? 'opacity-60' : ''}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{schedule.patient.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {schedule.patient.patient_number}
                          </Badge>
                          <Badge 
                            variant={schedule.item.category === 'test' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {schedule.item.category === 'test' ? '검사' : '주사'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {schedule.item.name} ({schedule.item.cycle_value}{schedule.item.cycle_unit === 'weeks' ? '주' : '개월'} 주기)
                        </p>
                        {schedule.patient.phone && (
                          <p className="text-sm text-muted-foreground">
                            연락처: {schedule.patient.phone}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {schedule.is_completed ? (
                          <Badge variant="outline" className="bg-green-50">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            완료
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleComplete(schedule.id)}
                            disabled={completing === schedule.id}
                          >
                            {completing === schedule.id ? '처리 중...' : '완료 처리'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}