import { NextRequest, NextResponse } from 'next/server';
import { createPureClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Update patient schema
const updatePatientSchema = z.object({
  patient_number: z.string().min(1, "환자 번호는 필수입니다").optional(),
  name: z.string().min(1, "환자 이름은 필수입니다").optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: 환자 상세 정보 조회
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 환자 ID입니다' },
        { status: 400 }
      );
    }

    const supabase = await createPureClient();
    
    // Get patient with active schedules and items (if any)
    const { data: patient, error } = await supabase
      .from('patients')
      .select(`
        *,
        patient_schedules!left (
          *,
          items (*)
        )
      `)
      .eq('id', id)
      .or('patient_schedules.is_active.eq.true,patient_schedules.id.is.null')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '환자를 찾을 수 없습니다' },
          { status: 404 }
        );
      }
      console.error('Error fetching patient:', error);
      return NextResponse.json(
        { error: '환자 정보를 가져오는데 실패했습니다' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(patient);
  } catch (error) {
    console.error('Unexpected error in GET /api/patients/[id]:', error);
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// PUT: 환자 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 환자 ID입니다' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validation = updatePatientSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten() },
        { status: 400 }
      );
    }

    const updateData = validation.data;
    
    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );
    
    if (Object.keys(cleanUpdateData).length === 0) {
      return NextResponse.json(
        { error: '수정할 데이터가 없습니다' },
        { status: 400 }
      );
    }

    const supabase = await createPureClient();
    
    // Check if patient number is being changed and if it already exists
    if (cleanUpdateData.patient_number) {
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .eq('patient_number', cleanUpdateData.patient_number)
        .neq('id', id)
        .single();
      
      if (existingPatient) {
        return NextResponse.json(
          { error: '이미 존재하는 환자 번호입니다' },
          { status: 409 }
        );
      }
    }
    
    // Update patient
    const { data: patient, error } = await supabase
      .from('patients')
      .update(cleanUpdateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '환자를 찾을 수 없습니다' },
          { status: 404 }
        );
      }
      console.error('Error updating patient:', error);
      return NextResponse.json(
        { error: '환자 정보 수정에 실패했습니다' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(patient);
  } catch (error) {
    console.error('Unexpected error in PUT /api/patients/[id]:', error);
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// DELETE: 환자 스케줄 비활성화 (soft delete - 환자 레코드는 유지되고 스케줄만 비활성화)
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 환자 ID입니다' },
        { status: 400 }
      );
    }

    const supabase = await createPureClient();
    
    // Check if patient exists
    const { data: existingPatient, error: checkError } = await supabase
      .from('patients')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError || !existingPatient) {
      return NextResponse.json(
        { error: '환자를 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    // Deactivate all patient schedules instead of hard delete
    const { error: scheduleError } = await supabase
      .from('patient_schedules')
      .update({ is_active: false })
      .eq('patient_id', id);
    
    if (scheduleError) {
      console.error('Error deactivating schedules:', scheduleError);
      return NextResponse.json(
        { error: '환자 일정 비활성화에 실패했습니다' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      message: '환자 스케줄이 성공적으로 비활성화되었습니다',
      patient_id: id 
    });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/patients/[id]:', error);
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}