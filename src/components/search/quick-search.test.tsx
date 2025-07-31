import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { QuickSearch } from './quick-search';

// Mock the router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

// Mock debounce utility
vi.mock('@/lib/utils', () => ({
  debounce: vi.fn((fn, delay) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }),
}));

describe('QuickSearch', () => {
  const mockPush = vi.fn();
  const mockRouter = {
    push: mockPush,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as Mock).mockReturnValue(mockRouter);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should render search input and button', () => {
    render(<QuickSearch />);
    
    expect(screen.getByPlaceholderText('환자 이름 또는 번호로 검색...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '전체 환자' })).toBeInTheDocument();
    expect(screen.getByText('빠른 환자 검색')).toBeInTheDocument();
  });

  it('should not search when query is less than 2 characters', async () => {
    render(<QuickSearch />);
    
    const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
    
    fireEvent.change(input, { target: { value: 'a' } });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should perform search when query is 2 or more characters', async () => {
    const mockPatients = [
      { id: '1', name: '김환자', patient_number: 'P001' },
      { id: '2', name: '김철수', patient_number: 'P002' },
    ];

    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ patients: mockPatients }),
    });

    render(<QuickSearch />);
    
    const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
    
    fireEvent.change(input, { target: { value: '김환' } });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/patients/search?q=%EA%B9%80%ED%99%98');
    });
  });

  it('should display search results', async () => {
    const mockPatients = [
      { id: '1', name: '김환자', patient_number: 'P001' },
      { id: '2', name: '김철수', patient_number: 'P002' },
    ];

    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ patients: mockPatients }),
    });

    render(<QuickSearch />);
    
    const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
    
    fireEvent.change(input, { target: { value: '김' } });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByText('김환자')).toBeInTheDocument();
    });

    expect(screen.getByText('김철수')).toBeInTheDocument();
    expect(screen.getByText('환자번호: P001')).toBeInTheDocument();
    expect(screen.getByText('환자번호: P002')).toBeInTheDocument();
  });

  it('should show loading spinner while searching', async () => {
    (fetch as Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(<QuickSearch />);
    
    const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
    
    fireEvent.change(input, { target: { value: '김환자' } });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner') || document.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  it('should show no results message when no patients found', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ patients: [] }),
    });

    render(<QuickSearch />);
    
    const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
    
    fireEvent.change(input, { target: { value: '존재하지않는환자' } });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument();
    });
  });

  it('should navigate to patient page when patient is selected', async () => {
    const mockPatients = [
      { id: 'patient-1', name: '김환자', patient_number: 'P001' },
    ];

    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ patients: mockPatients }),
    });

    render(<QuickSearch />);
    
    const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
    
    fireEvent.change(input, { target: { value: '김환자' } });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByText('김환자')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('김환자'));

    expect(mockPush).toHaveBeenCalledWith('/patients/patient-1');
  });

  it('should clear search when patient is selected', async () => {
    const mockPatients = [
      { id: 'patient-1', name: '김환자', patient_number: 'P001' },
    ];

    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ patients: mockPatients }),
    });

    render(<QuickSearch />);
    
    const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...') as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: '김환자' } });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByText('김환자')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('김환자'));

    expect(input.value).toBe('');
  });

  it('should navigate to patients list when "전체 환자" button is clicked', () => {
    render(<QuickSearch />);
    
    const allPatientsButton = screen.getByRole('button', { name: '전체 환자' });
    fireEvent.click(allPatientsButton);

    expect(mockPush).toHaveBeenCalledWith('/patients');
  });

  it('should handle fetch errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    (fetch as Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<QuickSearch />);
    
    const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
    
    fireEvent.change(input, { target: { value: '김환자' } });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Search error:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('should handle non-ok response gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    (fetch as Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<QuickSearch />);
    
    const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
    
    fireEvent.change(input, { target: { value: '김환자' } });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      // The component should not display results or throw errors silently
      expect(screen.queryByText('김환자')).not.toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('should debounce search requests', async () => {
    render(<QuickSearch />);
    
    const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
    
    // Type quickly
    fireEvent.change(input, { target: { value: 'ㄱ' } });
    fireEvent.change(input, { target: { value: '김' } });
    fireEvent.change(input, { target: { value: '김환' } });
    fireEvent.change(input, { target: { value: '김환자' } });
    
    // Only advance by debounce delay once
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should only make one API call
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/api/patients/search?q=%EA%B9%80%ED%99%98%EC%9E%90');
  });

  it('should hide results when input is cleared', async () => {
    const mockPatients = [
      { id: '1', name: '김환자', patient_number: 'P001' },
    ];

    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ patients: mockPatients }),
    });

    render(<QuickSearch />);
    
    const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
    
    // Search first
    fireEvent.change(input, { target: { value: '김환자' } });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByText('김환자')).toBeInTheDocument();
    });

    // Clear input
    fireEvent.change(input, { target: { value: '' } });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.queryByText('김환자')).not.toBeInTheDocument();
    });
  });

  it('should handle malformed API response', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ /* missing patients field */ }),
    });

    render(<QuickSearch />);
    
    const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
    
    fireEvent.change(input, { target: { value: '김환자' } });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument();
    });
  });

  it('should properly encode search query for URL', async () => {
    render(<QuickSearch />);
    
    const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
    
    fireEvent.change(input, { target: { value: '특수문자 &/?=' } });
    
    act(() => {
      vi.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/patients/search?q=%ED%8A%B9%EC%88%98%EB%AC%B8%EC%9E%90%20%26%2F%3F%3D');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should focus on input field when rendered', () => {
      render(<QuickSearch />);
      
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
      input.focus();
      
      expect(document.activeElement).toBe(input);
    });

    it('should allow keyboard navigation of search results', async () => {
      const mockPatients = [
        { id: '1', name: '김환자', patient_number: 'P001' },
        { id: '2', name: '김철수', patient_number: 'P002' },
      ];

      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ patients: mockPatients }),
      });

      render(<QuickSearch />);
      
      const input = screen.getByPlaceholderText('환자 이름 또는 번호로 검색...');
      
      fireEvent.change(input, { target: { value: '김' } });
      
      act(() => {
        vi.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(screen.getByText('김환자')).toBeInTheDocument();
      });

      const firstResult = screen.getByText('김환자').closest('button');
      const secondResult = screen.getByText('김철수').closest('button');

      expect(firstResult).toBeInTheDocument();
      expect(secondResult).toBeInTheDocument();
    });
  });
});