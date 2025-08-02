import { NextRequest, NextResponse } from 'next/server';
import { createPureClient } from '@/lib/supabase/server';
import { z } from 'zod';

const itemSchema = z.object({
  name: z.string().min(1, '항목 이름은 필수입니다'),
  category: z.enum(['test', 'injection'], {
    errorMap: () => ({ message: '카테고리는 test 또는 injection만 가능합니다' })
  }),
  cycle_value: z.number().min(1, '주기는 1 이상이어야 합니다'),
  cycle_unit: z.enum(['weeks', 'months'], {
    errorMap: () => ({ message: '주기 단위는 weeks 또는 months만 가능합니다' })
  }),
  description: z.string().nullable().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createPureClient();
    
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Failed to fetch items:', error);
      return NextResponse.json(
        { error: '항목을 가져오는데 실패했습니다' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error in GET /api/items:', error);
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = itemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten() },
        { status: 400 }
      );
    }
    
    const supabase = await createPureClient();
    
    // Check if item with same name already exists
    const { data: existingItems, error: checkError } = await supabase
      .from('items')
      .select('id')
      .eq('name', validation.data.name)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Failed to check existing items:', checkError);
      return NextResponse.json(
        { error: '기존 항목 확인에 실패했습니다' },
        { status: 500 }
      );
    }
    
    if (existingItems) {
      return NextResponse.json(
        { error: '동일한 이름의 항목이 이미 존재합니다' },
        { status: 409 }
      );
    }
    
    // Create new item
    const { data, error } = await supabase
      .from('items')
      .insert(validation.data)
      .select()
      .single();
    
    if (error) {
      console.error('Failed to create item:', error);
      return NextResponse.json(
        { error: '항목 생성에 실패했습니다' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/items:', error);
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}