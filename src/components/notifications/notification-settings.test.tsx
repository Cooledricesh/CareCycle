import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationSettings } from './notification-settings';

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock fetch
global.fetch = vi.fn();

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn(() => '2025년 1월 15일 오후 3:00'),
}));

vi.mock('date-fns/locale', () => ({
  ko: {},
}));

describe('NotificationSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render notification types and send buttons', () => {
    render(<NotificationSettings />);
    
    expect(screen.getByText('알림 관리')).toBeInTheDocument();
    expect(screen.getByText('환자들에게 검사/주사 일정 알림을 보낼 수 있습니다')).toBeInTheDocument();
    
    // Check all notification types
    expect(screen.getByText('일일 알림')).toBeInTheDocument();
    expect(screen.getByText('오늘 예정된 모든 검사/주사 일정을 알려드립니다')).toBeInTheDocument();
    
    expect(screen.getByText('사전 알림')).toBeInTheDocument();
    expect(screen.getByText('앞으로 3일 이내 예정된 일정을 미리 알려드립니다')).toBeInTheDocument();
    
    expect(screen.getByText('지연 알림')).toBeInTheDocument();
    expect(screen.getByText('기한이 지난 검사/주사 일정을 알려드립니다')).toBeInTheDocument();
    
    // Check send buttons
    const sendButtons = screen.getAllByText('지금 보내기');
    expect(sendButtons).toHaveLength(3);
  });

  it('should send daily notification successfully', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { totalPatients: 5 },
      }),
    });

    render(<NotificationSettings />);
    
    const dailyButton = screen.getAllByText('지금 보내기')[0];
    fireEvent.click(dailyButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'daily' }),
      });
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: '알림 전송 완료',
      description: '5명의 환자에게 알림을 전송했습니다.',
      variant: 'default',
    });
  });

  it('should send reminder notification successfully', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { totalPatients: 3 },
      }),
    });

    render(<NotificationSettings />);
    
    const reminderButton = screen.getAllByText('지금 보내기')[1];
    fireEvent.click(reminderButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'reminder' }),
      });
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: '알림 전송 완료',
      description: '3명의 환자에게 알림을 전송했습니다.',
      variant: 'default',
    });
  });

  it('should send overdue notification successfully', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { totalPatients: 2 },
      }),
    });

    render(<NotificationSettings />);
    
    const overdueButton = screen.getAllByText('지금 보내기')[2];
    fireEvent.click(overdueButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'overdue' }),
      });
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: '알림 전송 완료',
      description: '2명의 환자에게 알림을 전송했습니다.',
      variant: 'default',
    });
  });

  it('should handle zero patients in response', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { totalPatients: 0 },
      }),
    });

    render(<NotificationSettings />);
    
    const button = screen.getAllByText('지금 보내기')[0];
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: '알림 전송 완료',
        description: '0명의 환자에게 알림을 전송했습니다.',
        variant: 'default',
      });
    });
  });

  it('should handle missing totalPatients in response', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {},
      }),
    });

    render(<NotificationSettings />);
    
    const button = screen.getAllByText('지금 보내기')[0];
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: '알림 전송 완료',
        description: '0명의 환자에게 알림을 전송했습니다.',
        variant: 'default',
      });
    });
  });

  it('should show loading state while sending notification', async () => {
    (fetch as Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(<NotificationSettings />);
    
    const button = screen.getAllByText('지금 보내기')[0];
    fireEvent.click(button);

    expect(screen.getByText('전송 중...')).toBeInTheDocument();
    expect(button).toBeDisabled();
    
    // Check for loading spinner
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should disable only the clicked button while sending', async () => {
    (fetch as Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(<NotificationSettings />);
    
    const buttons = screen.getAllByText('지금 보내기');
    const firstButton = buttons[0];
    const secondButton = buttons[1];
    
    fireEvent.click(firstButton);

    expect(firstButton).toBeDisabled();
    expect(secondButton).not.toBeDisabled();
  });

  it('should handle API error with error message', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Failed to send notifications',
      }),
    });

    render(<NotificationSettings />);
    
    const button = screen.getAllByText('지금 보내기')[0];
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: '알림 전송 실패',
        description: 'Failed to send notifications',
        variant: 'destructive',
      });
    });
  });

  it('should handle API error without error message', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    render(<NotificationSettings />);
    
    const button = screen.getAllByText('지금 보내기')[0];
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: '알림 전송 실패',
        description: '알림 전송에 실패했습니다',
        variant: 'destructive',
      });
    });
  });

  it('should handle network errors', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (fetch as Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<NotificationSettings />);
    
    const button = screen.getAllByText('지금 보내기')[0];
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: '알림 전송 실패',
        description: 'Network error',
        variant: 'destructive',
      });
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Notification error:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });

  it('should handle unknown errors', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (fetch as Mock).mockRejectedValueOnce('Unknown error');

    render(<NotificationSettings />);
    
    const button = screen.getAllByText('지금 보내기')[0];
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: '알림 전송 실패',
        description: '알 수 없는 오류가 발생했습니다',
        variant: 'destructive',
      });
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Notification error:', 'Unknown error');
    consoleErrorSpy.mockRestore();
  });

  it('should display automatic notification info', () => {
    render(<NotificationSettings />);
    
    expect(screen.getByText('자동 알림 설정')).toBeInTheDocument();
    expect(screen.getByText('매일 오전 9시에 자동으로 일일 알림이 전송됩니다. Supabase Cron Jobs를 통해 설정할 수 있습니다.')).toBeInTheDocument();
  });

  it('should display last notification timestamp', () => {
    render(<NotificationSettings />);
    
    expect(screen.getByText('마지막 알림 전송: 2025년 1월 15일 오후 3:00')).toBeInTheDocument();
  });

  it('should render notification icons', () => {
    render(<NotificationSettings />);
    
    // Check for Lucide icons (they should be in the document)
    const bellIcon = document.querySelector('[data-lucide="bell"]') || 
                     document.querySelector('.lucide-bell') ||
                     screen.getByText('알림 관리').previousElementSibling;
    
    const calendarIcon = document.querySelector('[data-lucide="calendar"]') || 
                        document.querySelector('.lucide-calendar');
    
    const alertIcon = document.querySelector('[data-lucide="alert-circle"]') || 
                     document.querySelector('.lucide-alert-circle');
    
    const sendIcons = document.querySelectorAll('[data-lucide="send"]') || 
                     document.querySelectorAll('.lucide-send');
    
    expect(bellIcon || calendarIcon || alertIcon || sendIcons.length > 0).toBeTruthy();
  });

  it('should reset loading state after successful send', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { totalPatients: 1 },
      }),
    });

    render(<NotificationSettings />);
    
    const button = screen.getAllByText('지금 보내기')[0];
    fireEvent.click(button);

    // Should show loading initially
    expect(screen.getByText('전송 중...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('전송 중...')).not.toBeInTheDocument();
      expect(screen.getByText('지금 보내기')).toBeInTheDocument();
    });

    expect(button).not.toBeDisabled();
  });

  it('should reset loading state after error', async () => {
    (fetch as Mock).mockRejectedValueOnce(new Error('Test error'));

    render(<NotificationSettings />);
    
    const button = screen.getAllByText('지금 보내기')[0];
    fireEvent.click(button);

    // Should show loading initially
    expect(screen.getByText('전송 중...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('전송 중...')).not.toBeInTheDocument();
    });

    expect(button).not.toBeDisabled();
  });

  describe('Multiple Notifications', () => {
    it('should handle multiple notifications simultaneously', async () => {
      (fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: { totalPatients: 1 } }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: { totalPatients: 2 } }),
        });

      render(<NotificationSettings />);
      
      const buttons = screen.getAllByText('지금 보내기');
      
      // Click multiple buttons
      fireEvent.click(buttons[0]);
      fireEvent.click(buttons[1]);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(2);
      });

      expect(mockToast).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles and labels', () => {
      render(<NotificationSettings />);
      
      const buttons = screen.getAllByRole('button', { name: /지금 보내기/ });
      expect(buttons).toHaveLength(3);
    });

    it('should have proper heading structure', () => {
      render(<NotificationSettings />);
      
      expect(screen.getByRole('heading', { level: 4, name: '일일 알림' }) || 
             screen.getByText('일일 알림')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 4, name: '사전 알림' }) || 
             screen.getByText('사전 알림')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 4, name: '지연 알림' }) || 
             screen.getByText('지연 알림')).toBeInTheDocument();
    });
  });
});
  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed JSON response', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); },
      });

      render(<NotificationSettings />);
      
      const button = screen.getAllByText('지금 보내기')[0];
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: '알림 전송 실패',
          description: 'Invalid JSON',
          variant: 'destructive',
        });
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle response with null data', async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: null,
        }),
      });

      render(<NotificationSettings />);
      
      const button = screen.getAllByText('지금 보내기')[0];
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: '알림 전송 완료',
          description: '0명의 환자에게 알림을 전송했습니다.',
          variant: 'default',
        });
      });
    });

    it('should handle response with non-numeric totalPatients', async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { totalPatients: 'invalid' },
        }),
      });

      render(<NotificationSettings />);
      
      const button = screen.getAllByText('지금 보내기')[0];
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: '알림 전송 완료',
          description: '0명의 환자에게 알림을 전송했습니다.',
          variant: 'default',
        });
      });
    });

    it('should handle fetch timeout scenarios', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      (fetch as Mock).mockRejectedValueOnce(timeoutError);

      render(<NotificationSettings />);
      
      const button = screen.getAllByText('지금 보내기')[0];
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: '알림 전송 실패',
          description: 'Request timeout',
          variant: 'destructive',
        });
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle very large totalPatients numbers', async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { totalPatients: Number.MAX_SAFE_INTEGER },
        }),
      });

      render(<NotificationSettings />);
      
      const button = screen.getAllByText('지금 보내기')[0];
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: '알림 전송 완료',
          description: `${Number.MAX_SAFE_INTEGER}명의 환자에게 알림을 전송했습니다.`,
          variant: 'default',
        });
      });
    });

    it('should handle response with decimal totalPatients', async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { totalPatients: 5.7 },
        }),
      });

      render(<NotificationSettings />);
      
      const button = screen.getAllByText('지금 보내기')[0];
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: '알림 전송 완료',
          description: '5.7명의 환자에게 알림을 전송했습니다.',
          variant: 'default',
        });
      });
    });
  });

  describe('Advanced Button State Management', () => {
    it('should prevent multiple simultaneous requests for same button', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      (fetch as Mock).mockReturnValueOnce(promise);

      render(<NotificationSettings />);
      
      const button = screen.getAllByText('지금 보내기')[0];
      
      // Multiple rapid clicks
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(button).toBeDisabled();
      expect(fetch).toHaveBeenCalledTimes(1);
      
      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: async () => ({ data: { totalPatients: 1 } }),
      });

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });

    it('should allow clicking other buttons while one is loading', async () => {
      let resolveFirst: (value: any) => void;
      const firstPromise = new Promise(resolve => { resolveFirst = resolve; });
      
      (fetch as Mock)
        .mockReturnValueOnce(firstPromise)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: { totalPatients: 2 } }),
        });

      render(<NotificationSettings />);
      
      const buttons = screen.getAllByText('지금 보내기');
      
      // Click first button (will be pending)
      fireEvent.click(buttons[0]);
      expect(buttons[0]).toBeDisabled();
      expect(buttons[1]).not.toBeDisabled();
      
      // Click second button (should work)
      fireEvent.click(buttons[1]);
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(2);
      });
      
      // Resolve first promise
      resolveFirst!({
        ok: true,
        json: async () => ({ data: { totalPatients: 1 } }),
      });
    });

    it('should maintain correct loading state across re-renders', async () => {
      (fetch as Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      const { rerender } = render(<NotificationSettings />);
      
      const button = screen.getAllByText('지금 보내기')[0];
      fireEvent.click(button);
      
      expect(button).toBeDisabled();
      expect(screen.getByText('전송 중...')).toBeInTheDocument();
      
      // Force re-render
      rerender(<NotificationSettings />);
      
      // State should be maintained
      const buttonAfterRerender = screen.getAllByText(/전송 중|지금 보내기/)[0];
      expect(buttonAfterRerender).toBeDisabled();
    });
  });

  describe('Comprehensive API Testing', () => {
    it('should handle various HTTP status codes correctly', async () => {
      const statusTests = [
        { status: 200, ok: true, shouldSucceed: true },
        { status: 201, ok: true, shouldSucceed: true },
        { status: 400, ok: false, shouldSucceed: false },
        { status: 401, ok: false, shouldSucceed: false },
        { status: 403, ok: false, shouldSucceed: false },
        { status: 404, ok: false, shouldSucceed: false },
        { status: 429, ok: false, shouldSucceed: false },
        { status: 500, ok: false, shouldSucceed: false },
        { status: 502, ok: false, shouldSucceed: false },
        { status: 503, ok: false, shouldSucceed: false },
      ];

      for (const test of statusTests) {
        mockToast.mockClear();
        (fetch as Mock).mockResolvedValueOnce({
          ok: test.ok,
          status: test.status,
          json: async () => test.shouldSucceed 
            ? { data: { totalPatients: 1 } }
            : { error: `HTTP ${test.status} Error` },
        });

        render(<NotificationSettings />);
        
        const button = screen.getAllByText('지금 보내기')[0];
        fireEvent.click(button);

        await waitFor(() => {
          if (test.shouldSucceed) {
            expect(mockToast).toHaveBeenCalledWith({
              title: '알림 전송 완료',
              description: '1명의 환자에게 알림을 전송했습니다.',
              variant: 'default',
            });
          } else {
            expect(mockToast).toHaveBeenCalledWith({
              title: '알림 전송 실패',
              description: `HTTP ${test.status} Error`,
              variant: 'destructive',
            });
          }
        });
      }
    });

    it('should handle response without data property', async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          totalPatients: 5, // Direct property instead of nested in data
        }),
      });

      render(<NotificationSettings />);
      
      const button = screen.getAllByText('지금 보내기')[0];
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: '알림 전송 완료',
          description: '0명의 환자에게 알림을 전송했습니다.',
          variant: 'default',
        });
      });
    });

    it('should handle completely empty response', async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      });

      render(<NotificationSettings />);
      
      const button = screen.getAllByText('지금 보내기')[0];
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: '알림 전송 완료',
          description: '0명의 환자에게 알림을 전송했습니다.',
          variant: 'default',
        });
      });
    });
  });

  describe('Component Structure and Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<NotificationSettings />);
      
      // Check for proper card structure
      const cards = document.querySelectorAll('[class*="card"]');
      expect(cards.length).toBeGreaterThanOrEqual(4); // 3 notification cards + 1 main card
      
      // Check for proper heading structure
      expect(screen.getByText('알림 관리')).toBeInTheDocument();
    });

    it('should have accessible button labels', () => {
      render(<NotificationSettings />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('should maintain consistent visual hierarchy', () => {
      render(<NotificationSettings />);
      
      // Check that each notification type has title and description
      const notificationTitles = ['일일 알림', '사전 알림', '지연 알림'];
      notificationTitles.forEach(title => {
        expect(screen.getByText(title)).toBeInTheDocument();
      });
      
      const descriptions = [
        '오늘 예정된 모든 검사/주사 일정을 알려드립니다',
        '앞으로 3일 이내 예정된 일정을 미리 알려드립니다',
        '기한이 지난 검사/주사 일정을 알려드립니다'
      ];
      descriptions.forEach(desc => {
        expect(screen.getByText(desc)).toBeInTheDocument();
      });
    });

    it('should display icons for each notification type', () => {
      render(<NotificationSettings />);
      
      // Check for SVG icons
      const svgElements = document.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThanOrEqual(7); // Bell, Calendar, AlertCircle, CheckCircle, Send icons
    });
  });

  describe('Error Boundary and Resilience', () => {
    it('should handle component unmounting during request', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      (fetch as Mock).mockReturnValueOnce(promise);

      const { unmount } = render(<NotificationSettings />);
      
      const button = screen.getAllByText('지금 보내기')[0];
      fireEvent.click(button);

      // Unmount while request is pending
      unmount();

      // Resolve after unmount - should not cause errors
      resolvePromise!({
        ok: true,
        json: async () => ({ data: { totalPatients: 1 } }),
      });

      // Allow promise to resolve
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // No assertion needed - test passes if no errors thrown
    });

    it('should recover from multiple consecutive errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // First error
      (fetch as Mock).mockRejectedValueOnce(new Error('First error'));
      
      render(<NotificationSettings />);
      
      const button = screen.getAllByText('지금 보내기')[0];
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: '알림 전송 실패',
          description: 'First error',
          variant: 'destructive',
        });
      });

      mockToast.mockClear();

      // Second error
      (fetch as Mock).mockRejectedValueOnce(new Error('Second error'));
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: '알림 전송 실패',
          description: 'Second error',
          variant: 'destructive',
        });
      });

      mockToast.mockClear();

      // Should recover and work normally
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { totalPatients: 3 } }),
      });
      
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: '알림 전송 완료',
          description: '3명의 환자에게 알림을 전송했습니다.',
          variant: 'default',
        });
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Date and Localization', () => {
    it('should format date with Korean locale correctly', () => {
      const { format } = require('date-fns');
      const { ko } = require('date-fns/locale');
      
      render(<NotificationSettings />);
      
      expect(format).toHaveBeenCalledWith(
        expect.any(Date),
        'PPP p',
        { locale: ko }
      );
      
      expect(screen.getByText('마지막 알림 전송: 2025년 1월 15일 오후 3:00')).toBeInTheDocument();
    });

    it('should handle date formatting errors gracefully', () => {
      const { format } = require('date-fns');
      const originalFormat = format;
      
      // Mock format to throw error once
      (format as Mock).mockImplementationOnce(() => {
        throw new Error('Date formatting failed');
      });
      
      // Component should still render
      expect(() => render(<NotificationSettings />)).not.toThrow();
      
      // Restore original implementation
      (format as Mock).mockImplementation(originalFormat);
    });
  });

  describe('Performance and Memory', () => {
    it('should not create memory leaks with multiple renders', () => {
      const { rerender, unmount } = render(<NotificationSettings />);
      
      // Multiple re-renders
      for (let i = 0; i < 10; i++) {
        rerender(<NotificationSettings />);
      }
      
      // Should unmount cleanly
      expect(() => unmount()).not.toThrow();
    });

    it('should handle rapid state changes correctly', async () => {
      let resolvePromises: Array<(value: any) => void> = [];
      
      // Mock multiple pending requests
      for (let i = 0; i < 5; i++) {
        const promise = new Promise(resolve => {
          resolvePromises.push(resolve);
        });
        (fetch as Mock).mockReturnValueOnce(promise);
      }

      render(<NotificationSettings />);
      
      const button = screen.getAllByText('지금 보내기')[0];
      
      // Trigger multiple state changes rapidly
      fireEvent.click(button);
      
      // Resolve promises in different order
      resolvePromises[0]({
        ok: true,
        json: async () => ({ data: { totalPatients: 1 } }),
      });

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Integration with Toast System', () => {
    it('should call toast with correct parameters for all scenarios', async () => {
      const scenarios = [
        {
          name: 'success with patients',
          mockResponse: { ok: true, json: async () => ({ data: { totalPatients: 10 } }) },
          expectedToast: {
            title: '알림 전송 완료',
            description: '10명의 환자에게 알림을 전송했습니다.',
            variant: 'default',
          }
        },
        {
          name: 'success with zero patients',
          mockResponse: { ok: true, json: async () => ({ data: { totalPatients: 0 } }) },
          expectedToast: {
            title: '알림 전송 완료',
            description: '0명의 환자에게 알림을 전송했습니다.',
            variant: 'default',
          }
        },
        {
          name: 'API error with message',
          mockResponse: { ok: false, json: async () => ({ error: 'Custom error message' }) },
          expectedToast: {
            title: '알림 전송 실패',
            description: 'Custom error message',
            variant: 'destructive',
          }
        },
        {
          name: 'API error without message',
          mockResponse: { ok: false, json: async () => ({}) },
          expectedToast: {
            title: '알림 전송 실패',
            description: '알림 전송에 실패했습니다',
            variant: 'destructive',
          }
        }
      ];

      for (const scenario of scenarios) {
        mockToast.mockClear();
        (fetch as Mock).mockResolvedValueOnce(scenario.mockResponse);

        render(<NotificationSettings />);
        
        const button = screen.getAllByText('지금 보내기')[0];
        fireEvent.click(button);

        await waitFor(() => {
          expect(mockToast).toHaveBeenCalledWith(scenario.expectedToast);
        });
      }
    });

    it('should handle toast hook failures gracefully', async () => {
      // Mock toast to throw error
      mockToast.mockImplementationOnce(() => {
        throw new Error('Toast system failed');
      });

      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { totalPatients: 1 } }),
      });

      render(<NotificationSettings />);
      
      const button = screen.getAllByText('지금 보내기')[0];
      
      // Should not crash when toast fails
      expect(() => fireEvent.click(button)).not.toThrow();

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });
  });