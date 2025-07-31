import { NextRequest, NextResponse } from 'next/server';
import { createPureClient } from '@/lib/supabase/server';

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