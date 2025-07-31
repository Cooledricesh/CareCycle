import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { NavigationBar } from '@/components/layout/navigation-bar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CareCycle - 의료진 일정 관리 시스템',
  description: '정신건강의학과 의료진을 위한 검사·주사 일정 자동 관리 시스템',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <NavigationBar />
            <main className="pb-16 md:pb-0">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
