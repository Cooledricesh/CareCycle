import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ patients: [] });
    }

    const supabase = await createClient();

    const { data: patients, error } = await supabase
      .from('patients')
      .select('id, name, patient_number')
      .or(`name.ilike.%${query}%,patient_number.ilike.%${query}%`)
      .order('name')
      .limit(10);

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json(
        { error: 'Failed to search patients' },
        { status: 500 }
      );
    }

    return NextResponse.json({ patients: patients || [] });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}