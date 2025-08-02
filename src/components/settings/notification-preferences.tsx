'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/auth-provider';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  notification_enabled: boolean;
}

export function NotificationPreferences() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (error) {
        // Profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user!.id,
              email: user!.email!,
              full_name: user!.user_metadata?.full_name || null,
              notification_enabled: true,
            })
            .select()
            .single();

          if (createError) throw createError;
          setProfile(newProfile);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast({
        title: '프로필 로드 실패',
        description: '프로필 정보를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateNotificationSettings = async (enabled: boolean) => {
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ notification_enabled: enabled })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({ ...profile, notification_enabled: enabled });
      
      toast({
        title: '설정 저장 완료',
        description: enabled 
          ? '알림을 받으실 수 있습니다.' 
          : '알림이 비활성화되었습니다.',
      });
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      toast({
        title: '설정 저장 실패',
        description: '알림 설정을 저장하는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">프로필을 찾을 수 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          알림 설정
        </CardTitle>
        <CardDescription>
          환자 검사/주사 일정에 대한 알림 수신 설정을 관리합니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex-1 space-y-1">
              <Label htmlFor="email-notifications" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                이메일 알림
              </Label>
              <p className="text-sm text-muted-foreground">
                매일 오전 9시에 예정된 검사/주사 일정을 이메일로 받습니다
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={profile.notification_enabled}
              onCheckedChange={updateNotificationSettings}
              disabled={saving}
            />
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">알림 종류</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                일일 알림: 오늘 예정된 모든 환자 일정
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                사전 알림: 7일 이내 예정된 일정 미리 알림
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                지연 알림: 기한이 지난 미완료 일정
              </li>
            </ul>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm">
              <span className="font-medium">현재 이메일:</span> {profile.email}
            </p>
            {profile.full_name && (
              <p className="text-sm mt-1">
                <span className="font-medium">이름:</span> {profile.full_name}
              </p>
            )}
          </div>
        </div>

        {!profile.notification_enabled && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex gap-2">
              <XCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-900">
                  알림이 비활성화되어 있습니다
                </p>
                <p className="text-sm text-amber-800">
                  환자 일정 관리를 위해 알림을 활성화하는 것을 권장합니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}