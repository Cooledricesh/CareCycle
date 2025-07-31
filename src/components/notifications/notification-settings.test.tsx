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