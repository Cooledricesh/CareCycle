'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  CalendarDays, 
  Users, 
  Home,
  Activity,
  Settings
} from 'lucide-react';
import { NotificationBadge } from '@/components/notifications/notification-badge';

const navItems = [
  {
    title: '홈',
    href: '/',
    icon: Home,
  },
  {
    title: '환자 관리',
    href: '/patients',
    icon: Users,
  },
  {
    title: '일정 관리',
    href: '/schedules',
    icon: CalendarDays,
  },
  {
    title: '설정',
    href: '/settings',
    icon: Settings,
  },
];

export function NavigationBar() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white sticky top-0 z-50 md:static">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Activity className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-xl">CareCycle</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || 
                  (item.href !== '/' && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Notification Badge */}
          <div className="flex items-center">
            <NotificationBadge />
          </div>
        </div>

      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center px-3 py-2 text-xs flex-1 h-full transition-colors',
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="font-medium">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}