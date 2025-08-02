import { NextRequest, NextResponse } from 'next/server';
import { createPureClient } from '@/lib/supabase/server';
import { z } from 'zod';

const updateItemSchema = z.object({
  name: z.string().min(1, '항목 이름은 필수입니다').optional(),
  category: z.enum(['test', 'injection'], {
    errorMap: () => ({ message: '카테고리는 test 또는 injection만 가능합니다' })
  }).optional(),
  cycle_value: z.number().min(1, '주기는 1 이상이어야 합니다').optional(),
  cycle_unit: z.enum(['weeks', 'months'], {
    errorMap: () => ({ message: '주기 단위는 weeks 또는 months만 가능합니다' })
  }).optional(),
  description: z.string().nullable().optional(),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createPureClient();
    
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '항목을 찾을 수 없습니다' },
          { status: 404 }
        );
      }
      console.error('Failed to fetch item:', error);
      return NextResponse.json(
        { error: '항목을 가져오는데 실패했습니다' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error in GET /api/items/[id]:', error);
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    // Validate request body
    const validation = updateItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten() },
        { status: 400 }
      );
    }
    
    if (Object.keys(validation.data).length === 0) {
      return NextResponse.json(
        { error: '수정할 항목을 입력해주세요' },
        { status: 400 }
      );
    }
    
    const supabase = await createPureClient();
    
    // Check if item exists
    const { data: existingItem, error: checkError } = await supabase
      .from('items')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError || !existingItem) {
      return NextResponse.json(
        { error: '항목을 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    // If name is being updated, check for duplicates
    if (validation.data.name) {
      const { data: duplicateItem } = await supabase
        .from('items')
        .select('id')
        .eq('name', validation.data.name)
        .neq('id', id)
        .single();
      
      if (duplicateItem) {
        return NextResponse.json(
          { error: '동일한 이름의 항목이 이미 존재합니다' },
          { status: 409 }
        );
      }
    }
    
    // Update item
    const { data, error } = await supabase
      .from('items')
      .update(validation.data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Failed to update item:', error);
      return NextResponse.json(
        { error: '항목 수정에 실패했습니다' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error in PUT /api/items/[id]:', error);
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createPureClient();
    
    // Check if item is being used in any patient schedules
    const { data: schedules, error: checkError } = await supabase
      .from('patient_schedules')
      .select('id')
      .eq('item_id', id)
      .limit(1);
    
    if (checkError) {
      console.error('Failed to check item usage:', checkError);
      return NextResponse.json(
        { error: '항목 사용 여부 확인에 실패했습니다' },
        { status: 500 }
      );
    }
    
    if (schedules && schedules.length > 0) {
      return NextResponse.json(
        { error: '이 항목은 환자 일정에서 사용 중이므로 삭제할 수 없습니다' },
        { status: 409 }
      );
    }
    
    // Delete item
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '항목을 찾을 수 없습니다' },
          { status: 404 }
        );
      }
      console.error('Failed to delete item:', error);
      return NextResponse.json(
        { error: '항목 삭제에 실패했습니다' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/items/[id]:', error);
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}