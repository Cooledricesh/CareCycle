import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from './route';

// Mock Supabase
const mockSupabaseClient = {
  from: vi.fn(() => mockSupabaseClient),
  select: vi.fn(() => mockSupabaseClient),
  eq: vi.fn(() => mockSupabaseClient),
  update: vi.fn(() => mockSupabaseClient),
  neq: vi.fn(() => mockSupabaseClient),
  single: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createPureClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

// Mock params
const mockParams = {
  params: Promise.resolve({ id: '123e4567-e89b-12d3-a456-426614174000' }),
};

describe('/api/patients/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return patient with schedules', async () => {
      const mockPatient = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: '테스트 환자',
        patient_number: 'P001',
        phone: '010-1234-5678',
        notes: '테스트 노트',
        patient_schedules: [
          {
            id: 'schedule-1',
            item_id: 'item-1',
            first_implementation_date: '2024-01-01',
            next_due_date: '2024-02-01',
            is_active: true,
            items: {
              id: 'item-1',
              name: '혈액검사',
              category: 'test',
            }
          }
        ]
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockPatient,
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/patients/123e4567-e89b-12d3-a456-426614174000');
      const response = await GET(request, mockParams);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockPatient);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('patients');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', '123e4567-e89b-12d3-a456-426614174000');
    });

    it('should return 404 for non-existent patient', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const request = new NextRequest('http://localhost:3000/api/patients/123e4567-e89b-12d3-a456-426614174000');
      const response = await GET(request, mockParams);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('환자를 찾을 수 없습니다');
    });

    it('should return 400 for invalid UUID', async () => {
      const invalidParams = {
        params: Promise.resolve({ id: 'invalid-uuid' }),
      };

      const request = new NextRequest('http://localhost:3000/api/patients/invalid-uuid');
      const response = await GET(request, invalidParams);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('유효하지 않은 환자 ID입니다');
    });
  });

  describe('PUT', () => {
    it('should update patient successfully', async () => {
      const updateData = {
        name: '수정된 환자',
        phone: '010-9876-5432',
      };

      const updatedPatient = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: '수정된 환자',
        patient_number: 'P001',
        phone: '010-9876-5432',
        notes: '테스트 노트',
      };

      // Mock check for existing patient_number (should return null since we're not changing it)
      mockSupabaseClient.single
        .mockResolvedValueOnce({ data: null, error: null }) // No existing patient with same number
        .mockResolvedValueOnce({ data: updatedPatient, error: null }); // Updated patient

      const request = new NextRequest('http://localhost:3000/api/patients/123e4567-e89b-12d3-a456-426614174000', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, mockParams);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedPatient);
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(updateData);
    });

    it('should return 409 for duplicate patient number', async () => {
      const updateData = {
        patient_number: 'P002',
      };

      // Mock existing patient with same number
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { id: 'other-patient-id' },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/patients/123e4567-e89b-12d3-a456-426614174000', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, mockParams);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('이미 존재하는 환자 번호입니다');
    });

    it('should return 400 for empty update data', async () => {
      const request = new NextRequest('http://localhost:3000/api/patients/123e4567-e89b-12d3-a456-426614174000', {
        method: 'PUT',
        body: JSON.stringify({}),
      });

      const response = await PUT(request, mockParams);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('수정할 데이터가 없습니다');
    });
  });

  describe('DELETE', () => {
    it('should soft delete patient by deactivating schedules', async () => {
      // Mock patient exists
      mockSupabaseClient.single.mockResolvedValue({
        data: { id: '123e4567-e89b-12d3-a456-426614174000' },
        error: null,
      });

      // Mock successful schedule deactivation
      mockSupabaseClient.update.mockResolvedValue({
        data: [],
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/patients/123e4567-e89b-12d3-a456-426614174000', {
        method: 'DELETE',
      });

      const response = await DELETE(request, mockParams);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('환자가 성공적으로 삭제되었습니다');
      expect(data.patient_id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({ is_active: false });
    });

    it('should return 404 for non-existent patient', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const request = new NextRequest('http://localhost:3000/api/patients/123e4567-e89b-12d3-a456-426614174000', {
        method: 'DELETE',
      });

      const response = await DELETE(request, mockParams);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('환자를 찾을 수 없습니다');
    });
  });
});