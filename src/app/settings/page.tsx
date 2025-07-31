'use client';

import { Settings, Database, Bell, Shield, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationSettings } from '@/components/notifications/notification-settings';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8" />
          설정
        </h1>
        <p className="text-muted-foreground">
          시스템 설정 및 환경 구성을 관리합니다
        </p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">알림</TabsTrigger>
          <TabsTrigger value="system">시스템</TabsTrigger>
          <TabsTrigger value="security">보안</TabsTrigger>
          <TabsTrigger value="about">정보</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                시스템 상태
              </CardTitle>
              <CardDescription>
                데이터베이스 및 시스템 정보
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">데이터베이스</span>
                  <Badge variant="outline" className="bg-green-50">
                    Supabase PostgreSQL
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">프론트엔드</span>
                  <Badge variant="outline">Next.js 15.4.5</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">UI 라이브러리</span>
                  <Badge variant="outline">shadcn/ui</Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium">배포 환경</span>
                  <Badge variant="outline">Vercel</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                보안 설정
              </CardTitle>
              <CardDescription>
                인증 및 보안 관련 설정
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Row Level Security (RLS)</h4>
                  <p className="text-sm text-muted-foreground">
                    모든 테이블에 RLS가 활성화되어 있으며, 인증된 사용자만 데이터에 접근할 수 있습니다.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">API 키 보안</h4>
                  <p className="text-sm text-muted-foreground">
                    2025년 새로운 Supabase API 키 형식을 사용하고 있습니다.
                    환경 변수를 통해 안전하게 관리됩니다.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">HTTPS 전송</h4>
                  <p className="text-sm text-muted-foreground">
                    모든 API 통신은 HTTPS를 통해 암호화되어 전송됩니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                CareCycle 정보
              </CardTitle>
              <CardDescription>
                시스템 정보 및 버전
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">CareCycle</h4>
                  <p className="text-sm text-muted-foreground">
                    정신건강의학과 의료진을 위한 검사·주사 일정 자동 관리 시스템
                  </p>
                </div>
                <div className="grid gap-3 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">버전</span>
                    <Badge>v1.0.0</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">최대 관리 환자 수</span>
                    <span className="text-sm font-medium">220명</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">지원 검사 종류</span>
                    <span className="text-sm font-medium">심리검사, 뇌파검사</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">지원 주사 종류</span>
                    <span className="text-sm font-medium">4주, 12주, 24주 장기지속형</span>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    © 2025 CareCycle. 의료진의 업무 효율성을 위해 만들어졌습니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}