'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bell } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';

export function NotificationListener() {
  const { toast } = useToast();
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new as {
            id: string;
            title: string;
            message: string;
            type: string;
            created_at: string;
          };

          // Show toast notification
          toast({
            title: notification.title,
            description: notification.message.split('\n')[0].substring(0, 100) + '...',
            action: (
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>알림 확인</span>
              </div>
            ),
          });

          // Play notification sound (optional)
          // const audio = new Audio('/notification-sound.mp3');
          // audio.play().catch(() => {});
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast, supabase]);

  return null;
}