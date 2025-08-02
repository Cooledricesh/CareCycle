'use client';

import { useEffect, useState } from 'react';
import { registerServiceWorker, requestNotificationPermission, subscribeToPushNotifications, skipWaitingAndReload } from '@/lib/service-worker/register';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export function ServiceWorkerProvider() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initServiceWorker = async () => {
      const reg = await registerServiceWorker();
      if (reg) {
        setRegistration(reg);
        
        // Check for updates periodically
        const interval = setInterval(() => {
          reg.update();
        }, 60 * 60 * 1000); // Check every hour
        
        return () => clearInterval(interval);
      }
    };

    initServiceWorker();
  }, []);

  useEffect(() => {
    // Listen for service worker update events
    const handleUpdateFound = (event: CustomEvent) => {
      console.log('Service worker update found');
      setShowUpdatePrompt(true);
    };

    window.addEventListener('serviceWorkerUpdateFound', handleUpdateFound as EventListener);
    
    return () => {
      window.removeEventListener('serviceWorkerUpdateFound', handleUpdateFound as EventListener);
    };
  }, []);

  const handleEnableNotifications = async () => {
    try {
      const permission = await requestNotificationPermission();
      
      if (permission && registration) {
        await subscribeToPushNotifications(registration);
        toast({
          title: '알림 활성화됨',
          description: '이제 푸시 알림을 받을 수 있습니다',
        });
      } else {
        toast({
          title: '알림 권한 거부됨',
          description: '브라우저 설정에서 알림을 활성화해주세요',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      toast({
        title: '오류',
        description: '알림 활성화에 실패했습니다',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = () => {
    // Send message to service worker to skip waiting with user consent
    skipWaitingAndReload();
    setShowUpdatePrompt(false);
  };

  return (
    <>
      {/* Update prompt */}
      {showUpdatePrompt && (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white shadow-lg rounded-lg p-4 border z-50">
          <h3 className="font-semibold mb-2">업데이트 사용 가능</h3>
          <p className="text-sm text-muted-foreground mb-4">
            새로운 버전이 준비되었습니다. 페이지를 새로고침하여 업데이트하세요.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleUpdate} size="sm">
              새로고침
            </Button>
            <Button
              onClick={() => setShowUpdatePrompt(false)}
              variant="outline"
              size="sm"
            >
              나중에
            </Button>
          </div>
        </div>
      )}

      {/* Notification permission prompt */}
      {registration && Notification.permission === 'default' && (
        <div className="fixed top-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-blue-50 border border-blue-200 rounded-lg p-4 z-50">
          <h3 className="font-semibold text-blue-900 mb-2">알림 활성화</h3>
          <p className="text-sm text-blue-700 mb-4">
            일정 알림을 받으려면 푸시 알림을 활성화하세요.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleEnableNotifications} size="sm">
              알림 켜기
            </Button>
            <Button
              onClick={() => {
                const el = document.querySelector('.fixed.top-20');
                if (el) el.remove();
              }}
              variant="outline"
              size="sm"
            >
              나중에
            </Button>
          </div>
        </div>
      )}
    </>
  );
}