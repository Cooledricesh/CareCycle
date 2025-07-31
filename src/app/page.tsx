'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, CheckCircle2, AlertCircle, Plus, Heart, Sparkles, Coffee, Sun } from 'lucide-react';
import { isOverdue, getDaysUntilDue } from '@/lib/utils/schedule';
import { QuickSearch } from '@/components/search/quick-search';

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
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedItemName, setCompletedItemName] = useState('');

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
    const schedule = todaySchedules.find(s => s.id === scheduleId);
    if (schedule) {
      setCompletedItemName(schedule.item.name);
    }
    
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

      // Show celebration animation
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);

      // Refresh the list
      await fetchTodaySchedules();
    } catch (error) {
      console.error('Error completing schedule:', error);
    } finally {
      setCompleting(null);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { message: '좋은 아침입니다', icon: Sun };
    if (hour < 18) return { message: '오늘도 수고 많으십니다', icon: Coffee };
    return { message: '오늘 하루도 고생하셨습니다', icon: Heart };
  };

  const getEncouragingMessage = () => {
    const messages = [
      '오늘도 환자분들을 위한 따뜻한 돌봄을 해주셔서 감사합니다',
      '선생님의 세심한 관리가 환자분들에게 큰 힘이 됩니다',
      '한 분 한 분 정성스러운 케어, 정말 소중한 일입니다',
      '환자분들의 건강한 일상을 위한 선생님의 노력에 감사드립니다'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getLoadingMessages = () => {
    const messages = [
      '오늘의 일정을 준비하고 있어요',
      '환자분들의 정보를 확인하고 있어요',
      '차트를 정리하고 있어요',
      '오늘도 좋은 하루 되세요'
    ];
    return messages;
  };

  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(0);
  const loadingMessages = getLoadingMessages();

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setCurrentLoadingMessage(prev => (prev + 1) % loadingMessages.length);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [loading, loadingMessages.length]);

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CareCycle
            </h1>
            <Sparkles className="h-6 w-6 text-purple-500 animate-pulse" />
          </div>
          <p className="text-muted-foreground">
            정신건강의학과 검사·주사 일정 관리 시스템
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="text-sm text-blue-600 font-medium flex items-center gap-1">
              {(() => {
                const greeting = getGreeting();
                const Icon = greeting.icon;
                return (
                  <>
                    <Icon className="h-4 w-4" />
                    {greeting.message}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
        <Button 
          onClick={() => router.push('/patients/new')}
          className="hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          신규 환자 등록
        </Button>
      </div>

      {/* Quick Search */}
      <QuickSearch />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘의 전체 일정</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold animate-count-up">{summary.total}</div>
            <p className="text-xs text-muted-foreground mt-1">건의 일정이 있어요</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료된 일정</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 animate-count-up">{summary.completed}</div>
            <p className="text-xs text-green-600 mt-1">
              {summary.total > 0 && summary.completed === summary.total 
                ? '모든 일정을 완료했어요! 👏' 
                : `${summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0}% 완료`
              }
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">대기 중인 일정</CardTitle>
            <Clock className="h-4 w-4 text-orange-600 group-hover:animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 animate-count-up">{summary.pending}</div>
            <p className="text-xs text-orange-600 mt-1">
              {summary.pending === 0 ? '모두 완료! 🎉' : '조금만 더 힘내세요!'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card 
          className="cursor-pointer hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group active:scale-95"
          onClick={() => router.push('/patients')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 group-hover:text-blue-600 transition-colors">
              <Users className="h-5 w-5 group-hover:scale-110 transition-transform" />
              환자 관리
            </CardTitle>
            <CardDescription className="group-hover:text-blue-500">환자분들의 소중한 정보를 관리해요</CardDescription>
          </CardHeader>
        </Card>
        <Card 
          className="cursor-pointer hover:bg-gradient-to-br hover:from-green-50 hover:to-blue-50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group active:scale-95"
          onClick={() => router.push('/schedules')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 group-hover:text-green-600 transition-colors">
              <Calendar className="h-5 w-5 group-hover:scale-110 transition-transform" />
              일정 관리
            </CardTitle>
            <CardDescription className="group-hover:text-green-500">체계적인 케어 스케줄을 관리해요</CardDescription>
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
            <div className="text-center py-12">
              <div className="relative">
                <div className="h-16 w-16 mx-auto mb-4 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
                <Sparkles className="h-6 w-6 text-blue-500 absolute top-5 left-1/2 transform -translate-x-1/2 animate-pulse" />
              </div>
              <p className="text-muted-foreground font-medium animate-fade-in">
                {loadingMessages[currentLoadingMessage]}
              </p>
              <div className="flex justify-center mt-2">
                {loadingMessages.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 w-1 mx-1 rounded-full transition-all duration-300 ${
                      index === currentLoadingMessage ? 'bg-blue-500 w-4' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : todaySchedules.length === 0 ? (
            <div className="text-center py-12">
              <div className="relative mb-6">
                <Calendar className="h-16 w-16 text-blue-200 mx-auto" />
                <Heart className="h-6 w-6 text-pink-400 absolute -top-1 -right-1 animate-bounce" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">잠시 쉬어가는 시간이에요</h3>
              <p className="text-muted-foreground mb-4">오늘은 예정된 일정이 없습니다</p>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mx-4">
                <p className="text-sm text-blue-600 font-medium">
                  {getEncouragingMessage()}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {todaySchedules.map((schedule, index) => (
                <Card 
                  key={schedule.id}
                  className={`card-hover transition-all duration-300 ${
                    schedule.is_completed 
                      ? 'opacity-60 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                      : 'hover:shadow-lg hover:border-blue-200'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-1">
                            {schedule.is_completed && (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                            {schedule.patient.name}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className="text-xs hover:bg-blue-50 transition-colors"
                          >
                            {schedule.patient.patient_number}
                          </Badge>
                          <Badge 
                            variant={schedule.item.category === 'test' ? 'default' : 'secondary'}
                            className={`text-xs transition-all duration-200 ${
                              schedule.item.category === 'test' 
                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            }`}
                          >
                            {schedule.item.category === 'test' ? '🔬 검사' : '💉 주사'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">
                          {schedule.item.name} 
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full ml-2">
                            {schedule.item.cycle_value}{schedule.item.cycle_unit === 'weeks' ? '주' : '개월'} 주기
                          </span>
                        </p>
                        {schedule.patient.phone && (
                          <p className="text-sm text-blue-600 flex items-center gap-1">
                            📞 {schedule.patient.phone}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {schedule.is_completed ? (
                          <div className="text-center">
                            <Badge 
                              variant="outline" 
                              className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700 shadow-sm"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1 animate-pulse" />
                              완료됨
                            </Badge>
                            <p className="text-xs text-green-600 mt-1 font-medium">
                              수고하셨어요! 🎉
                            </p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Button
                              size="sm"
                              onClick={() => handleComplete(schedule.id)}
                              disabled={completing === schedule.id}
                              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:scale-105 transition-all duration-200 hover:shadow-lg active:scale-95 text-white font-medium"
                            >
                              {completing === schedule.id ? (
                                <>
                                  <div className="h-3 w-3 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                                  처리 중...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  완료 처리
                                </>
                              )}
                            </Button>
                            <p className="text-xs text-blue-600 mt-1 font-medium">
                              터치해서 완료
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* All Tasks Completed Celebration */}
          {summary.total > 0 && summary.completed === summary.total && (
            <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-xl p-8 mt-6 text-center border-2 border-green-200 shadow-lg animate-bounce-in">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                모든 일정을 완료하셨습니다!
              </h3>
              <p className="text-green-700 text-base font-medium mb-4">
                오늘도 환자분들을 위한 세심한 케어를 해주셔서 감사합니다.
              </p>
              <div className="flex justify-center items-center gap-2 text-green-600">
                <Heart className="h-5 w-5 text-pink-500 animate-pulse" />
                <span className="text-sm font-medium">당신의 따뜻한 마음이 세상을 더 건강하게 만들어요</span>
                <Heart className="h-5 w-5 text-pink-500 animate-pulse" />
              </div>
              
              {/* Floating particles */}
              <div className="relative mt-4">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse`}
                    style={{
                      left: `${20 + (i * 10)}%`,
                      top: `${-10 + (i % 2) * 20}px`,
                      animationDelay: `${i * 0.2}s`
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-lg shadow-2xl p-8 text-center animate-bounce-in">
            <div className="text-6xl mb-4 animate-pulse">🎉</div>
            <h3 className="text-xl font-bold text-green-600 mb-2">완료되었습니다!</h3>
            <p className="text-muted-foreground">
              {completedItemName}이(가) 성공적으로 처리되었어요
            </p>
            <div className="flex justify-center mt-4">
              <CheckCircle2 className="h-8 w-8 text-green-500 animate-pulse" />
            </div>
          </div>
          
          {/* Confetti Animation */}
          <div className="fixed inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Footer Message */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full text-sm text-muted-foreground">
          <Heart className="h-4 w-4 text-pink-400" />
          <span>매일 환자분들을 위해 최선을 다하는 선생님, 고맙습니다</span>
          <Sparkles className="h-4 w-4 text-purple-400" />
        </div>
      </div>
    </div>
  );
}