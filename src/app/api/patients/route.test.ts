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

  describe('POST /api/patients - Additional Edge Cases', () => {
    it('should handle successful patient creation with minimal data', async () => {
      mockQuery.data = null; // No existing patient
      mockQuery.error = null;

      const minimalPatientData = {
        patient_number: 'P001',
        name: '김환자',
        schedules: []
      };

      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify(minimalPatientData),
        headers: { 'Content-Type': 'application/json' },
      });

      // Mock successful insertion
      mockSupabaseClient.from().insert().select.mockReturnValueOnce({
        data: { id: '123', ...minimalPatientData },
        error: null
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty('id');
    });

    it('should handle successful patient creation with full data', async () => {
      mockQuery.data = null; // No existing patient
      mockQuery.error = null;

      const fullPatientData = {
        patient_number: 'P002',
        name: '이환자',
        phone: '010-9876-5432',
        notes: '상세한 환자 정보',
        schedules: [
          {
            item_id: '987fcdeb-51a2-43d1-b456-426614174001',
            first_implementation_date: '2025-01-15',
          },
          {
            item_id: '123e4567-e89b-12d3-a456-426614174002',
            first_implementation_date: '2025-02-01',
          }
        ],
      };

      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify(fullPatientData),
        headers: { 'Content-Type': 'application/json' },
      });

      // Mock successful insertion
      mockSupabaseClient.from().insert().select.mockReturnValueOnce({
        data: { id: '456', ...fullPatientData },
        error: null
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty('id');
    });

    it('should validate patient_number format (alphanumeric)', async () => {
      const invalidPatientNumber = {
        patient_number: 'P-001-@#$',
        name: '김환자',
        schedules: []
      };

      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify(invalidPatientNumber),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should validate name field is not empty', async () => {
      const emptyNameData = {
        patient_number: 'P001',
        name: '',
        schedules: []
      };

      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify(emptyNameData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should validate phone number format if provided', async () => {
      const invalidPhoneData = {
        patient_number: 'P001',
        name: '김환자',
        phone: 'invalid-phone',
        schedules: []
      };

      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify(invalidPhoneData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should handle database insertion error', async () => {
      mockQuery.data = null; // No existing patient
      mockQuery.error = null;

      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify(validPatientData),
        headers: { 'Content-Type': 'application/json' },
      });

      // Mock insertion error
      mockSupabaseClient.from().insert().select.mockReturnValueOnce({
        data: null,
        error: { message: 'Database insertion failed' }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('환자 생성에 실패했습니다');
    });

    it('should handle missing Content-Type header', async () => {
      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify(validPatientData),
        // No Content-Type header
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should handle empty request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        body: '',
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should validate schedule array contains valid objects', async () => {
      const invalidScheduleObjectData = {
        patient_number: 'P001',
        name: '김환자',
        schedules: [
          'invalid-schedule-item',
          {
            item_id: '123e4567-e89b-12d3-a456-426614174000',
            // Missing first_implementation_date
          }
        ]
      };

      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify(invalidScheduleObjectData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should handle future dates in schedule properly', async () => {
      mockQuery.data = null;
      mockQuery.error = null;

      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const futureDateData = {
        patient_number: 'P001',
        name: '김환자',
        schedules: [
          {
            item_id: '123e4567-e89b-12d3-a456-426614174000',
            first_implementation_date: futureDate.toISOString().split('T')[0],
          }
        ]
      };

      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify(futureDateData),
        headers: { 'Content-Type': 'application/json' },
      });

      mockSupabaseClient.from().insert().select.mockReturnValueOnce({
        data: { id: '789', ...futureDateData },
        error: null
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty('id');
    });
  });

  describe('GET /api/patients - Additional Edge Cases', () => {
    it('should handle empty patient list', async () => {
      mockQuery.data = [];
      mockQuery.error = null;

      const request = new NextRequest('http://localhost:3000/api/patients');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should handle invalid ID format in query parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/patients?id=invalid-uuid-format');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should handle multiple query parameters gracefully', async () => {
      mockQuery.data = null;
      mockQuery.error = { code: 'PGRST116' };

      const request = new NextRequest('http://localhost:3000/api/patients?id=123&extra=param&another=value');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('환자를 찾을 수 없습니다');
    });

    it('should return patient with empty schedules array', async () => {
      const mockPatientNoSchedules = {
        id: '1',
        name: '김환자',
        patient_number: 'P001',
        patient_schedules: []
      };

      mockQuery.data = mockPatientNoSchedules;
      mockQuery.error = null;

      const request = new NextRequest('http://localhost:3000/api/patients?id=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockPatientNoSchedules);
      expect(data.patient_schedules).toEqual([]);
    });

    it('should handle patient with multiple schedules', async () => {
      const mockPatientMultipleSchedules = {
        id: '1',
        name: '김환자',
        patient_number: 'P001',
        patient_schedules: [
          {
            id: 'schedule-1',
            items: { name: '혈액검사', category: 'test' },
            next_due_date: '2025-02-01',
            status: 'pending'
          },
          {
            id: 'schedule-2',
            items: { name: 'X-ray', category: 'imaging' },
            next_due_date: '2025-02-15',
            status: 'completed'
          },
          {
            id: 'schedule-3',
            items: { name: '심전도', category: 'test' },
            next_due_date: '2025-03-01',
            status: 'pending'
          }
        ]
      };

      mockQuery.data = mockPatientMultipleSchedules;
      mockQuery.error = null;

      const request = new NextRequest('http://localhost:3000/api/patients?id=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockPatientMultipleSchedules);
      expect(data.patient_schedules).toHaveLength(3);
    });

    it('should handle database timeout error', async () => {
      mockQuery.data = null;
      mockQuery.error = { message: 'Connection timeout', code: 'TIMEOUT' };

      const request = new NextRequest('http://localhost:3000/api/patients');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('데이터를 가져오는데 실패했습니다');
    });

    it('should handle malformed URL query parameters', async () => {
      mockQuery.data = [];
      mockQuery.error = null;

      const request = new NextRequest('http://localhost:3000/api/patients?id=&malformed=');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should verify correct Supabase query structure for all patients', async () => {
      const mockPatients = [
        { id: '1', name: '김환자', patient_number: 'P001' },
        { id: '2', name: '이환자', patient_number: 'P002' }
      ];

      mockQuery.data = mockPatients;
      mockQuery.error = null;

      const request = new NextRequest('http://localhost:3000/api/patients');
      await GET(request);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('patients');
      expect(mockSupabaseClient.from().select).toHaveBeenCalled();
      expect(mockSupabaseClient.from().select().order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should verify correct Supabase query structure for single patient', async () => {
      const mockPatient = {
        id: '1',
        name: '김환자',
        patient_number: 'P001',
        patient_schedules: []
      };

      mockQuery.data = mockPatient;
      mockQuery.error = null;

      const request = new NextRequest('http://localhost:3000/api/patients?id=1');
      await GET(request);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('patients');
      expect(mockSupabaseClient.from().select).toHaveBeenCalledWith(`
        *,
        patient_schedules (
          id,
          next_due_date,
          status,
          items (
            id,
            name,
            category
          )
        )
      `);
      expect(mockSupabaseClient.from().select().eq).toHaveBeenCalledWith('id', '1');
      expect(mockSupabaseClient.from().select().eq().single).toHaveBeenCalled();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle Supabase client creation failure', async () => {
      // Mock createPureClient to reject
      const { createPureClient } = await import('@/lib/supabase/server');
      vi.mocked(createPureClient).mockRejectedValueOnce(new Error('Failed to create client'));

      const request = new NextRequest('http://localhost:3000/api/patients');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('데이터를 가져오는데 실패했습니다');
    });

    it('should handle unexpected error format from Supabase', async () => {
      mockQuery.data = null;
      mockQuery.error = { 
        details: 'Constraint violation',
        hint: 'Check your data',
        code: '23505'
      };

      const request = new NextRequest('http://localhost:3000/api/patients');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('데이터를 가져오는데 실패했습니다');
    });

    it('should handle null response from Supabase when patient not found', async () => {
      mockQuery.data = null;
      mockQuery.error = null; // No error but also no data

      const request = new NextRequest('http://localhost:3000/api/patients?id=nonexistent');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('환자를 찾을 수 없습니다');
    });
  });

  describe('Data Validation and Sanitization', () => {
    it('should trim whitespace from patient data fields', async () => {
      mockQuery.data = null;
      mockQuery.error = null;

      const dataWithWhitespace = {
        patient_number: '  P001  ',
        name: '  김환자  ',
        phone: '  010-1234-5678  ',
        notes: '  테스트 환자  ',
        schedules: []
      };

      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify(dataWithWhitespace),
        headers: { 'Content-Type': 'application/json' },
      });

      mockSupabaseClient.from().insert().select.mockReturnValueOnce({
        data: { id: '123', patient_number: 'P001', name: '김환자' },
        error: null
      });

      const response = await POST(request);
      
      expect(response.status).toBe(201);
    });

    it('should handle very long patient names', async () => {
      const longNameData = {
        patient_number: 'P001',
        name: 'A'.repeat(500), // Very long name
        schedules: []
      };

      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify(longNameData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should validate Korean phone number format', async () => {
      const validKoreanPhones = [
        '010-1234-5678',
        '02-1234-5678',
        '031-123-4567'
      ];

      for (const phone of validKoreanPhones) {
        mockQuery.data = null;
        mockQuery.error = null;

        const phoneData = {
          patient_number: `P00${validKoreanPhones.indexOf(phone) + 1}`,
          name: '김환자',
          phone: phone,
          schedules: []
        };

        const request = new NextRequest('http://localhost:3000/api/patients', {
          method: 'POST',
          body: JSON.stringify(phoneData),
          headers: { 'Content-Type': 'application/json' },
        });

        mockSupabaseClient.from().insert().select.mockReturnValueOnce({
          data: { id: `${validKoreanPhones.indexOf(phone) + 1}`, ...phoneData },
          error: null
        });

        const response = await POST(request);
        expect(response.status).toBe(201);
      }
    });

    it('should validate schedule date is not in the past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30); // 30 days ago

      const pastDateData = {
        patient_number: 'P001',
        name: '김환자',
        schedules: [
          {
            item_id: '123e4567-e89b-12d3-a456-426614174000',
            first_implementation_date: pastDate.toISOString().split('T')[0],
          }
        ]
      };

      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify(pastDateData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe('Performance and Load Testing Scenarios', () => {
    it('should handle large patient data payload', async () => {
      mockQuery.data = null;
      mockQuery.error = null;

      const largeScheduleArray = Array.from({ length: 100 }, (_, i) => ({
        item_id: `123e4567-e89b-12d3-a456-42661417400${i.toString().padStart(2, '0')}`,
        first_implementation_date: '2025-01-01'
      }));

      const largePatientData = {
        patient_number: 'P001',
        name: '김환자',
        notes: 'A'.repeat(1000), // Large notes field
        schedules: largeScheduleArray
      };

      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify(largePatientData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      // Should either succeed or fail gracefully with appropriate error message
      expect([200, 201, 400, 413]).toContain(response.status);
    });

    it('should handle concurrent request simulation', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => {
        mockQuery.data = null;
        mockQuery.error = null;

        return new NextRequest('http://localhost:3000/api/patients', {
          method: 'POST',
          body: JSON.stringify({
            patient_number: `P00${i + 1}`,
            name: `환자${i + 1}`,
            schedules: []
          }),
          headers: { 'Content-Type': 'application/json' },
        });
      });

      const responses = await Promise.all(requests.map(request => POST(request)));
      
      // All requests should complete
      expect(responses).toHaveLength(5);
      responses.forEach(response => {
        expect([200, 201, 400, 409, 500]).toContain(response.status);
      });
    });
  });
});