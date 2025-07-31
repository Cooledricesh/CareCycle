import { describe, it, expect, vi } from 'vitest';
import { POST, GET } from './route';
import { NextRequest } from 'next/server';

// Mock the entire Supabase module
vi.mock('@/lib/supabase/server', () => ({
  createPureClient: vi.fn(),
}));

describe('POST /api/patients', () => {
  it('should validate required fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/patients', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });
  
  it('should reject duplicate patient numbers', async () => {
    // Mock existing patient
    const { createPureClient } = await import('@/lib/supabase/server');
    vi.mocked(createPureClient).mockResolvedValueOnce({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({ 
              data: { id: 'existing-patient' }, 
              error: null 
            })),
          })),
        })),
      })),
    } as any);
    
    const request = new NextRequest('http://localhost:3000/api/patients', {
      method: 'POST',
      body: JSON.stringify({
        patient_number: 'P001',
        name: 'Test Patient',
        schedules: [
          {
            item_id: 'item-1',
            first_implementation_date: '2025-01-01',
          },
        ],
      }),
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(409);
    expect(data.error).toBe('이미 존재하는 환자 번호입니다');
  });
});

describe('GET /api/patients', () => {
  it('should return all patients when no id is provided', async () => {
    const request = new NextRequest('http://localhost:3000/api/patients');
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });
  
  it('should return 404 for non-existent patient', async () => {
    const { createPureClient } = await import('@/lib/supabase/server');
    vi.mocked(createPureClient).mockResolvedValueOnce({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({ 
              data: null, 
              error: { code: 'PGRST116' } 
            })),
          })),
        })),
      })),
    } as any);
    
    const request = new NextRequest('http://localhost:3000/api/patients?id=non-existent');
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(404);
    expect(data.error).toBe('환자를 찾을 수 없습니다');
  });
});