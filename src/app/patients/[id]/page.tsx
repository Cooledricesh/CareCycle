'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit2, Calendar, Clock, CheckCircle2, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, getDaysUntilDue, isOverdue } from '@/lib/utils/schedule';

interface Patient {
  id: string;
  patient_number: string;
  name: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface PatientSchedule {
  id: string;
  patient_id: string;
  item_id: string;
  first_implementation_date: string;
  next_due_date: string;
  last_implementation_date: string | null;
  is_active: boolean;
  item: {
    id: string;
    name: string;
    category: 'test' | 'injection';
    cycle_value: number;
    cycle_unit: 'weeks' | 'months';
  };
  history?: Array<{
    id: string;
    scheduled_date: string;
    actual_implementation_date: string | null;
    is_completed: boolean;
    notes: string | null;
  }>;
}

interface ScheduleStats {
  totalSchedules: number;
  completedSchedules: number;
  completionRate: number;
  overdueSchedules: number;
}

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [schedules, setSchedules] = useState<PatientSchedule[]>([]);
  const [stats, setStats] = useState<ScheduleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('active');

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

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/patients/${patientId}/schedules?includeHistory=true`);
      if (!response.ok) throw new Error('Failed to fetch schedules');
      const data = await response.json();
      setSchedules(data.schedules);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (scheduleId: string) => {
    setCompleting(scheduleId);
    try {
      const response = await fetch(`/api/patients/${patientId}/schedules/${scheduleId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actualImplementationDate: new Date().toISOString().split('T')[0],
        }),
      });

      if (!response.ok) throw new Error('Failed to complete schedule');

      // Refresh schedules
      await fetchSchedules();
    } catch (error) {
      console.error('Error completing schedule:', error);
    } finally {
      setCompleting(null);
    }
  };

  const activeSchedules = schedules.filter(s => s.is_active);
  const inactiveSchedules = schedules.filter(s => !s.is_active);

  if (!patient) {
    return (
      <div className="container py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로가기
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{patient.name}</h1>
            <Badge variant="outline" className="mt-1">
              환자번호: {patient.patient_number}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/patients/${patientId}/edit`)}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            정보 수정
          </Button>
          <Button
            onClick={() => router.push(`/patients/${patientId}/schedules/new`)}
          >
            <Plus className="h-4 w-4 mr-2" />
            일정 추가
          </Button>
        </div>
      </div>

      {/* Patient Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>환자 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">연락처</dt>
              <dd className="mt-1 text-sm">{patient.phone || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">등록일</dt>
              <dd className="mt-1 text-sm">{formatDate(patient.created_at)}</dd>
            </div>
            {patient.notes && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">메모</dt>
                <dd className="mt-1 text-sm whitespace-pre-wrap">{patient.notes}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">전체 일정</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSchedules}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">완료된 일정</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedSchedules}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">완료율</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{stats.completionRate}%</div>
                <Progress value={stats.completionRate} className="h-2" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">지연된 일정</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdueSchedules}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Schedules Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>일정 관리</CardTitle>
          <CardDescription>
            검사 및 주사 일정을 관리합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">
                진행 중 ({activeSchedules.length})
              </TabsTrigger>
              <TabsTrigger value="inactive">
                종료됨 ({inactiveSchedules.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4 mt-4">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : activeSchedules.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">진행 중인 일정이 없습니다.</p>
                  <Button
                    className="mt-4"
                    onClick={() => router.push(`/patients/${patientId}/schedules/new`)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    일정 추가하기
                  </Button>
                </div>
              ) : (
                activeSchedules.map((schedule) => {
                  const daysUntil = getDaysUntilDue(schedule.next_due_date);
                  const overdue = isOverdue(schedule.next_due_date);
                  
                  return (
                    <Card key={schedule.id} className={overdue ? 'border-red-200' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{schedule.item.name}</h4>
                              <Badge variant={schedule.item.category === 'test' ? 'default' : 'secondary'}>
                                {schedule.item.category === 'test' ? '검사' : '주사'}
                              </Badge>
                              <Badge variant="outline">
                                {schedule.item.cycle_value}
                                {schedule.item.cycle_unit === 'weeks' ? '주' : '개월'} 주기
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>다음 예정일: {formatDate(schedule.next_due_date)}</span>
                              {overdue ? (
                                <span className="flex items-center gap-1 text-red-600">
                                  <AlertCircle className="h-3 w-3" />
                                  {Math.abs(daysUntil)}일 지연
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {daysUntil}일 남음
                                </span>
                              )}
                            </div>
                            {schedule.last_implementation_date && (
                              <p className="text-sm text-muted-foreground">
                                마지막 시행일: {formatDate(schedule.last_implementation_date)}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleComplete(schedule.id)}
                            disabled={completing === schedule.id}
                          >
                            {completing === schedule.id ? '처리 중...' : '완료'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="inactive" className="space-y-4 mt-4">
              {inactiveSchedules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  종료된 일정이 없습니다.
                </div>
              ) : (
                inactiveSchedules.map((schedule) => (
                  <Card key={schedule.id} className="opacity-60">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{schedule.item.name}</h4>
                          <Badge variant="outline">종료</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          마지막 시행일: {schedule.last_implementation_date ? formatDate(schedule.last_implementation_date) : '-'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}