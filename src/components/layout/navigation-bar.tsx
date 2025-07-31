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
    <nav className="border-b bg-white sticky top-0 z-50">
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

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              aria-label="메뉴"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t">
          <div className="flex justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center px-3 py-2 text-xs',
                    isActive
                      ? 'text-blue-700'
                      : 'text-gray-600'
                  )}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}