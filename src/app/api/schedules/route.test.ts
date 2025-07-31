import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

// Mock the Supabase server client
const mockQuery = {
  data: null,
  error: null,
};

const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      order: vi.fn(() => mockQuery)
    }))
  }))
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

describe('/api/schedules GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockScheduleData = [
    {
      id: 'hist-1',
      scheduled_date: '2025-01-15',
      actual_implementation_date: null,
      is_completed: false,
      notes: null,
      patient_schedule_id: 'ps-1',
      patient_schedules: {
        patients: {
          id: 'patient-1',
          name: '김환자',
          patient_number: 'P001',
        },
        items: {
          id: 'item-1',
          name: '혈액검사',
          category: 'test',
        },
      },
    },
    {
      id: 'hist-2',
      scheduled_date: '2025-01-10',
      actual_implementation_date: '2025-01-10',
      is_completed: true,
      notes: '정상 완료',
      patient_schedule_id: 'ps-2',
      patient_schedules: {
        patients: {
          id: 'patient-2',
          name: '이환자',
          patient_number: 'P002',
        },
        items: {
          id: 'item-2',
          name: '인슐린 주사',
          category: 'injection',
        },
      },
    },
  ];

  it('should return all schedules without filters', async () => {
    mockQuery.data = mockScheduleData;
    mockQuery.error = null;

    const request = new NextRequest('http://localhost:3000/api/schedules');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.schedules).toHaveLength(2);
    expect(data.total).toBe(2);
    expect(data.schedules[0]).toEqual({
      id: 'hist-1',
      scheduled_date: '2025-01-15',
      actual_implementation_date: null,
      is_completed: false,
      notes: null,
      patient_schedule_id: 'ps-1',
      patient: {
        id: 'patient-1',
        name: '김환자',
        patient_number: 'P001',
      },
      item: {
        id: 'item-1',
        name: '혈액검사',
        category: 'test',
      },
    });
    
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('schedule_history');
  });

  it('should filter schedules by category', async () => {
    mockQuery.data = mockScheduleData;
    mockQuery.error = null;

    const request = new NextRequest('http://localhost:3000/api/schedules?category=test');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.schedules).toHaveLength(1);
    expect(data.schedules[0].item.category).toBe('test');
  });

  it('should return all schedules when category is "all"', async () => {
    mockQuery.data = mockScheduleData;
    mockQuery.error = null;

    const request = new NextRequest('http://localhost:3000/api/schedules?category=all');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.schedules).toHaveLength(2);
  });

  it('should handle database errors', async () => {
    mockQuery.data = null;
    mockQuery.error = { message: 'Database connection failed' };

    const request = new NextRequest('http://localhost:3000/api/schedules');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch schedules');
  });

  it('should handle empty results', async () => {
    mockQuery.data = [];
    mockQuery.error = null;

    const request = new NextRequest('http://localhost:3000/api/schedules');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.schedules).toHaveLength(0);
    expect(data.total).toBe(0);
  });

  it('should handle null data response', async () => {
    mockQuery.data = null;
    mockQuery.error = null;

    const request = new NextRequest('http://localhost:3000/api/schedules');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.schedules).toHaveLength(0);
    expect(data.total).toBe(0);
  });

  it('should handle unexpected errors', async () => {
    // Mock a promise rejection
    mockSupabaseClient.from.mockImplementationOnce(() => {
      throw new Error('Unexpected error');
    });

    const request = new NextRequest('http://localhost:3000/api/schedules');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });

  it('should properly transform nested data structure', async () => {
    const complexScheduleData = [{
      id: 'hist-1',
      scheduled_date: '2025-01-15',
      actual_implementation_date: '2025-01-16',
      is_completed: true,
      notes: '약간 지연됨',
      patient_schedule_id: 'ps-1',
      patient_schedules: {
        patients: {
          id: 'patient-1',
          name: '김환자',
          patient_number: 'P001',
          phone: '010-1234-5678',
        },
        items: {
          id: 'item-1',
          name: '혈액검사',
          category: 'test',
          description: '정기 혈액검사',
        },
      },
    }];

    mockQuery.data = complexScheduleData;
    mockQuery.error = null;

    const request = new NextRequest('http://localhost:3000/api/schedules');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.schedules[0]).toEqual({
      id: 'hist-1',
      scheduled_date: '2025-01-15',
      actual_implementation_date: '2025-01-16',
      is_completed: true,
      notes: '약간 지연됨',
      patient_schedule_id: 'ps-1',
      patient: {
        id: 'patient-1',
        name: '김환자',
        patient_number: 'P001',
        phone: '010-1234-5678',
      },
      item: {
        id: 'item-1',
        name: '혈액검사',
        category: 'test',
        description: '정기 혈액검사',
      },
    });
  });

  describe('Query Parameter Edge Cases', () => {
    it('should handle unknown category values', async () => {
      mockQuery.data = mockScheduleData;
      mockQuery.error = null;

      const request = new NextRequest('http://localhost:3000/api/schedules?category=unknown');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.schedules).toHaveLength(0);
    });
  });
});