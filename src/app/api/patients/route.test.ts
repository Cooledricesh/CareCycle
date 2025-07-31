import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from './route';
import { NextRequest } from 'next/server';

// Mock data structures
const mockQuery = {
  data: null,
  error: null,
};

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => mockQuery)
      })),
      in: vi.fn(() => mockQuery),
      order: vi.fn(() => mockQuery)
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => mockQuery)
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => mockQuery)
    }))
  }))
};

// Mock the Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createPureClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

// Mock schedule calculation utility
vi.mock('@/lib/utils/schedule', () => ({
  calculateNextDueDate: vi.fn(() => new Date('2025-02-01')),
}));

describe('/api/patients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/patients', () => {
    const validPatientData = {
      patient_number: 'P001',
      name: '김환자',
      phone: '010-1234-5678',
      notes: '테스트 환자',
      schedules: [
        {
          item_id: '123e4567-e89b-12d3-a456-426614174000',
          first_implementation_date: '2025-01-01',
        },
      ],
    };

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should reject duplicate patient numbers', async () => {
      mockQuery.data = { id: 'existing-patient' };
      mockQuery.error = null;

      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify(validPatientData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('이미 존재하는 환자 번호입니다');
    });

    it('should return 400 for invalid patient data', async () => {
      const invalidData = {
        patient_number: '', // Invalid: empty string
        name: '김환자',
        schedules: [],
      };

      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should validate schedule item IDs are UUIDs', async () => {
      const invalidScheduleData = {
        ...validPatientData,
        schedules: [
          {
            item_id: 'invalid-uuid',
            first_implementation_date: '2025-01-01',
          },
        ],
      };

      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify(invalidScheduleData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should validate date format in schedules', async () => {
      const invalidDateData = {
        ...validPatientData,
        schedules: [
          {
            item_id: '123e4567-e89b-12d3-a456-426614174000',
            first_implementation_date: 'invalid-date',
          },
        ],
      };

      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify(invalidDateData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should handle invalid JSON request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('예상치 못한 오류가 발생했습니다');
    });
  });

  describe('GET /api/patients', () => {
    it('should return all patients when no id is provided', async () => {
      const mockPatients = [
        { id: '1', name: '김환자', patient_number: 'P001' },
        { id: '2', name: '이환자', patient_number: 'P002' },
      ];

      mockQuery.data = mockPatients;
      mockQuery.error = null;

      const request = new NextRequest('http://localhost:3000/api/patients');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockPatients);
    });

    it('should return single patient with schedules when ID is provided', async () => {
      const mockPatientWithSchedules = {
        id: '1',
        name: '김환자',
        patient_number: 'P001',
        patient_schedules: [
          {
            id: 'schedule-1',
            items: { name: '혈액검사', category: 'test' },
          },
        ],
      };

      mockQuery.data = mockPatientWithSchedules;
      mockQuery.error = null;

      const request = new NextRequest('http://localhost:3000/api/patients?id=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockPatientWithSchedules);
    });

    it('should return 404 for non-existent patient', async () => {
      mockQuery.data = null;
      mockQuery.error = { code: 'PGRST116' };

      const request = new NextRequest('http://localhost:3000/api/patients?id=non-existent');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('환자를 찾을 수 없습니다');
    });

    it('should return 500 when database error occurs', async () => {
      mockQuery.data = null;
      mockQuery.error = { message: 'Database connection failed' };

      const request = new NextRequest('http://localhost:3000/api/patients');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('데이터를 가져오는데 실패했습니다');
    });
  });
});