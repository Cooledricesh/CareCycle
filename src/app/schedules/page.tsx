'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Filter, Search, CheckCircle2, AlertCircle, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDate, getDaysUntilDue, isOverdue } from '@/lib/utils/schedule';
import { useToast } from '@/hooks/use-toast';

interface Schedule {
  id: string;
  scheduled_date: string;
  actual_implementation_date: string | null;
  is_completed: boolean;
  notes: string | null;
  patient_schedule_id: string;
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
}

export default function SchedulesPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'test' | 'injection'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [selectedSchedules, setSelectedSchedules] = useState<Set<string>>(new Set());
  const [batchCompleting, setBatchCompleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSchedules();
  }, [dateRange, categoryFilter, statusFilter]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (dateRange !== 'all') {
        const today = new Date();
        let startDate = new Date();
        let endDate = new Date();

        switch (dateRange) {
          case 'today':
            // Today only
            break;
          case 'week':
            endDate.setDate(today.getDate() + 7);
            break;
          case 'month':
            endDate.setDate(today.getDate() + 30);
            break;
        }

        params.append('startDate', startDate.toISOString().split('T')[0]);
        params.append('endDate', endDate.toISOString().split('T')[0]);
      }

      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/schedules?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch schedules');
      const data = await response.json();
      setSchedules(data.schedules || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
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

      // Remove from selected if it was selected
      setSelectedSchedules(prev => {
        const newSet = new Set(prev);
        newSet.delete(scheduleId);
        return newSet;
      });

      // Refresh the list
      await fetchSchedules();
    } catch (error) {
      console.error('Error completing schedule:', error);
    } finally {
      setCompleting(null);
    }
  };

  const handleBatchComplete = async () => {
    if (selectedSchedules.size === 0) return;

    setBatchCompleting(true);
    const today = new Date().toISOString().split('T')[0];
    let successCount = 0;
    let failCount = 0;

    try {
      // Complete each selected schedule
      for (const scheduleId of selectedSchedules) {
        try {
          const response = await fetch(`/api/schedules/${scheduleId}/complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              actual_implementation_date: today,
            }),
          });

          if (response.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
        }
      }

      // Show result
      if (successCount > 0) {
        toast({
          title: '일괄 처리 완료',
          description: `${successCount}개의 일정이 완료 처리되었습니다${failCount > 0 ? ` (${failCount}개 실패)` : ''}`,
        });
      } else {
        toast({
          title: '일괄 처리 실패',
          description: '일정 완료 처리에 실패했습니다',
          variant: 'destructive',
        });
      }

      // Clear selection
      setSelectedSchedules(new Set());

      // Refresh the list
      await fetchSchedules();
    } catch (error) {
      console.error('Error batch completing schedules:', error);
      toast({
        title: '오류',
        description: '일괄 처리 중 오류가 발생했습니다',
        variant: 'destructive',
      });
    } finally {
      setBatchCompleting(false);
    }
  };

  const toggleScheduleSelection = (scheduleId: string) => {
    setSelectedSchedules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(scheduleId)) {
        newSet.delete(scheduleId);
      } else {
        newSet.add(scheduleId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    const pendingSchedules = filteredSchedules.filter(s => !s.is_completed);
    if (selectedSchedules.size === pendingSchedules.length) {
      setSelectedSchedules(new Set());
    } else {
      setSelectedSchedules(new Set(pendingSchedules.map(s => s.id)));
    }
  };

  // Filter schedules based on search query
  const filteredSchedules = schedules.filter(schedule => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      schedule.patient.name.toLowerCase().includes(query) ||
      schedule.patient.patient_number.toLowerCase().includes(query) ||
      schedule.item.name.toLowerCase().includes(query)
    );
  });

  // Group schedules by date
  const groupedSchedules = filteredSchedules.reduce((groups, schedule) => {
    const date = schedule.scheduled_date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(schedule);
    return groups;
  }, {} as Record<string, Schedule[]>);

  const sortedDates = Object.keys(groupedSchedules).sort();

  return (
    <div className="container px-4 py-4 md:py-8 mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">일정 관리</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          모든 환자의 검사 및 주사 일정을 관리합니다
        </p>
      </div>

      {/* Batch Actions */}
      {selectedSchedules.size > 0 && (
        <Card className="mb-4 border-blue-200 bg-blue-50">
          <CardContent className="py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm font-medium text-blue-900">
                {selectedSchedules.size}개 일정 선택됨
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedSchedules(new Set())}
                >
                  선택 해제
                </Button>
                <Button
                  size="sm"
                  onClick={handleBatchComplete}
                  disabled={batchCompleting}
                >
                  {batchCompleting ? '처리 중...' : '일괄 완료 처리'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            필터 및 검색
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="환자명, 번호, 항목 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
              <SelectTrigger>
                <SelectValue placeholder="기간 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">오늘</SelectItem>
                <SelectItem value="week">이번 주</SelectItem>
                <SelectItem value="month">이번 달</SelectItem>
                <SelectItem value="all">전체</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={(value: any) => setCategoryFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="종류 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="test">검사</SelectItem>
                <SelectItem value="injection">주사</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="pending">대기중</SelectItem>
                <SelectItem value="completed">완료</SelectItem>
                <SelectItem value="overdue">지연</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Schedule List */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">일정을 불러오는 중...</p>
        </div>
      ) : sortedDates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">해당하는 일정이 없습니다.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(date => {
            const dateSchedules = groupedSchedules[date];
            const dateObj = new Date(date);
            const isToday = formatDate(dateObj, 'yyyy-MM-dd') === formatDate(new Date(), 'yyyy-MM-dd');
            
            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">
                      {formatDate(dateObj)}
                    </h3>
                    {isToday && (
                      <Badge variant="default">오늘</Badge>
                    )}
                    <Badge variant="outline">
                      {dateSchedules.length}건
                    </Badge>
                  </div>
                  {dateSchedules.some(s => !s.is_completed) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const pendingSchedulesForDate = dateSchedules.filter(s => !s.is_completed);
                        const allSelected = pendingSchedulesForDate.every(s => selectedSchedules.has(s.id));
                        
                        if (allSelected) {
                          // Deselect all
                          setSelectedSchedules(prev => {
                            const newSet = new Set(prev);
                            pendingSchedulesForDate.forEach(s => newSet.delete(s.id));
                            return newSet;
                          });
                        } else {
                          // Select all
                          setSelectedSchedules(prev => {
                            const newSet = new Set(prev);
                            pendingSchedulesForDate.forEach(s => newSet.add(s.id));
                            return newSet;
                          });
                        }
                      }}
                    >
                      {dateSchedules.filter(s => !s.is_completed).every(s => selectedSchedules.has(s.id)) ? (
                        <>
                          <CheckSquare className="h-4 w-4 mr-1" />
                          전체 해제
                        </>
                      ) : (
                        <>
                          <Square className="h-4 w-4 mr-1" />
                          전체 선택
                        </>
                      )}
                    </Button>
                  )}
                </div>
                
                <div className="grid gap-3">
                  {dateSchedules.map(schedule => {
                    const overdue = !schedule.is_completed && isOverdue(schedule.scheduled_date);
                    
                    return (
                      <Card 
                        key={schedule.id}
                        className={`${schedule.is_completed ? 'opacity-60' : ''} ${overdue ? 'border-red-200' : ''}`}
                      >
                        <CardContent className="p-3 md:p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              {!schedule.is_completed && (
                                <Checkbox
                                  checked={selectedSchedules.has(schedule.id)}
                                  onCheckedChange={() => toggleScheduleSelection(schedule.id)}
                                  className="mt-1"
                                />
                              )}
                              <div className="flex-1 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 
                                  className="font-semibold text-sm md:text-base cursor-pointer hover:text-blue-600"
                                  onClick={() => router.push(`/patients/${schedule.patient.id}`)}
                                >
                                  {schedule.patient.name}
                                </h4>
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
                              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                                <span>{schedule.item.name}</span>
                                <span>
                                  {schedule.item.cycle_value}
                                  {schedule.item.cycle_unit === 'weeks' ? '주' : '개월'} 주기
                                </span>
                                {schedule.patient.phone && (
                                  <span className="truncate">연락처: {schedule.patient.phone}</span>
                                )}
                              </div>
                            </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {schedule.is_completed ? (
                                <Badge variant="outline" className="bg-green-50">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  완료
                                </Badge>
                              ) : overdue ? (
                                <Badge variant="outline" className="bg-red-50 text-red-700">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  지연
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
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}