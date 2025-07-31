'use client';

import { useState } from 'react';
import { Bell, Send, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export function NotificationSettings() {
  const { toast } = useToast();
  const [sending, setSending] = useState<string | null>(null);

  const notificationTypes = [
    {
      id: 'daily',
      title: '일일 알림',
      description: '오늘 예정된 모든 검사/주사 일정을 알려드립니다',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'reminder',
      title: '사전 알림',
      description: '앞으로 3일 이내 예정된 일정을 미리 알려드립니다',
      icon: Bell,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      id: 'overdue',
      title: '지연 알림',
      description: '기한이 지난 검사/주사 일정을 알려드립니다',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const sendNotification = async (type: string) => {
    setSending(type);
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '알림 전송에 실패했습니다');
      }

      toast({
        title: '알림 전송 완료',
        description: `${data.data?.totalPatients || 0}명의 환자에게 알림을 전송했습니다.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Notification error:', error);
      toast({
        title: '알림 전송 실패',
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
        variant: 'destructive',
      });
    } finally {
      setSending(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          알림 관리
        </CardTitle>
        <CardDescription>
          환자들에게 검사/주사 일정 알림을 보낼 수 있습니다
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {notificationTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card key={type.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-lg ${type.bgColor}`}>
                        <Icon className={`h-5 w-5 ${type.color}`} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium">{type.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {type.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendNotification(type.id)}
                      disabled={sending === type.id}
                    >
                      {sending === type.id ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-900 mr-2" />
                          전송 중...
                        </>
                      ) : (
                        <>
                          <Send className="h-3 w-3 mr-2" />
                          지금 보내기
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">자동 알림 설정</p>
              <p className="text-sm text-muted-foreground">
                매일 오전 9시에 자동으로 일일 알림이 전송됩니다.
                Supabase Cron Jobs를 통해 설정할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}