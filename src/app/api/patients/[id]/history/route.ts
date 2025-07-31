import { NextRequest, NextResponse } from 'next/server';
import { createPureClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Type definitions for history entries
interface Item {
  id: string;
  name: string;
  category: string;
}

interface PatientSchedule {
  patient_id: string;
  items: Item;
}

interface HistoryEntry {
  id: string;
  scheduled_date: string;
  is_completed: boolean;
  completed_at?: string | null;
  notes?: string | null;
  patient_schedules: PatientSchedule;
  [key: string]: any; // For any additional fields from the database
}

interface Statistics {
  total: number;
  completed: number;
  pending: number;
  completion_rate: number;
}

// Grouped data types
interface ItemGroupedData {
  item: Item;
  entries: HistoryEntry[];
  statistics: Statistics;
}

interface PeriodGroupedData {
  period: string;
  entries: HistoryEntry[];
  statistics: Statistics;
}

// GET: 환자의 전체 일정 히스토리 조회
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 환자 ID입니다' },
        { status: 400 }
      );
    }

    // Query parameters
    const completedOnly = searchParams.get('completed_only') === 'true';
    const itemId = searchParams.get('item_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? (isNaN(parseInt(limitParam)) ? 50 : parseInt(limitParam)) : 50;
    const offsetParam = searchParams.get('offset');
    const offset = offsetParam ? (isNaN(parseInt(offsetParam)) ? 0 : parseInt(offsetParam)) : 0;
    const groupBy = searchParams.get('group_by'); // 'item', 'month', 'year'
    
    const supabase = await createPureClient();
    
    // Check if patient exists
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id, name, patient_number')
      .eq('id', id)
      .single();
    
    if (patientError || !patient) {
      return NextResponse.json(
        { error: '환자를 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    // Build the base query
    let query = supabase
      .from('schedule_history')
      .select(`
        *,
        patient_schedules!inner (
          patient_id,
          items (
            id,
            name,
            category
          )
        )
      `)
      .eq('patient_schedules.patient_id', id)
      .order('scheduled_date', { ascending: false });
    
    // Apply filters
    if (completedOnly) {
      query = query.eq('is_completed', true);
    }
    
    if (itemId) {
      query = query.eq('patient_schedules.item_id', itemId);
    }
    
    if (startDate) {
      query = query.gte('scheduled_date', startDate);
    }
    
    if (endDate) {
      query = query.lte('scheduled_date', endDate);
    }
    
    // Apply pagination - fetch one extra record to determine if there are more
    if (limit) {
      query = query.range(offset, offset + limit);
    }
    
    const { data: history, error: historyError } = await query;
    
    if (historyError) {
      console.error('Error fetching patient history:', historyError);
      return NextResponse.json(
        { error: '환자 기록을 가져오는데 실패했습니다' },
        { status: 500 }
      );
    }
    
    // Check if there are more records
    const hasMore = (history?.length || 0) > limit;
    
    // Trim the extra record if we fetched one
    const trimmedHistory = hasMore && history ? history.slice(0, limit) : (history || []);
    
    // Calculate overall statistics using trimmed data
    const totalEntries = trimmedHistory.length;
    const completedEntries = trimmedHistory.filter(h => h.is_completed).length;
    const pendingEntries = totalEntries - completedEntries;
    const completionRate = totalEntries > 0 ? (completedEntries / totalEntries) * 100 : 0;
    
    // Group data if requested
    let groupedData = null;
    if (groupBy && trimmedHistory.length > 0) {
      switch (groupBy) {
        case 'item':
          groupedData = groupByItem(trimmedHistory);
          break;
        case 'month':
          groupedData = groupByMonth(trimmedHistory);
          break;
        case 'year':
          groupedData = groupByYear(trimmedHistory);
          break;
      }
    }
    
    return NextResponse.json({
      patient,
      history: trimmedHistory,
      statistics: {
        total: totalEntries,
        completed: completedEntries,
        pending: pendingEntries,
        completion_rate: Math.round(completionRate * 100) / 100,
      },
      grouped_data: groupedData,
      pagination: {
        limit,
        offset,
        has_more: hasMore,
      }
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/patients/[id]/history:', error);
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// Helper function to group by item
function groupByItem(history: HistoryEntry[]): ItemGroupedData[] {
  const grouped = history.reduce<Record<string, ItemGroupedData>>((acc, entry) => {
    const itemId = entry.patient_schedules.items.id;
    const itemName = entry.patient_schedules.items.name;
    const itemCategory = entry.patient_schedules.items.category;
    
    if (!acc[itemId]) {
      acc[itemId] = {
        item: {
          id: itemId,
          name: itemName,
          category: itemCategory,
        },
        entries: [],
        statistics: {
          total: 0,
          completed: 0,
          pending: 0,
          completion_rate: 0,
        }
      };
    }
    
    acc[itemId].entries.push(entry);
    acc[itemId].statistics.total++;
    
    if (entry.is_completed) {
      acc[itemId].statistics.completed++;
    } else {
      acc[itemId].statistics.pending++;
    }
    
    acc[itemId].statistics.completion_rate = 
      (acc[itemId].statistics.completed / acc[itemId].statistics.total) * 100;
    
    return acc;
  }, {});
  
  return Object.values(grouped);
}

// Helper function to group by month
function groupByMonth(history: HistoryEntry[]): PeriodGroupedData[] {
  const grouped = history.reduce<Record<string, PeriodGroupedData>>((acc, entry) => {
    const date = new Date(entry.scheduled_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        period: monthKey,
        entries: [],
        statistics: {
          total: 0,
          completed: 0,
          pending: 0,
          completion_rate: 0,
        }
      };
    }
    
    acc[monthKey].entries.push(entry);
    acc[monthKey].statistics.total++;
    
    if (entry.is_completed) {
      acc[monthKey].statistics.completed++;
    } else {
      acc[monthKey].statistics.pending++;
    }
    
    acc[monthKey].statistics.completion_rate = 
      (acc[monthKey].statistics.completed / acc[monthKey].statistics.total) * 100;
    
    return acc;
  }, {});
  
  return Object.values(grouped).sort((a, b) => b.period.localeCompare(a.period));
}

// Helper function to group by year
function groupByYear(history: HistoryEntry[]): PeriodGroupedData[] {
  const grouped = history.reduce<Record<string, PeriodGroupedData>>((acc, entry) => {
    const year = new Date(entry.scheduled_date).getFullYear().toString();
    
    if (!acc[year]) {
      acc[year] = {
        period: year,
        entries: [],
        statistics: {
          total: 0,
          completed: 0,
          pending: 0,
          completion_rate: 0,
        }
      };
    }
    
    acc[year].entries.push(entry);
    acc[year].statistics.total++;
    
    if (entry.is_completed) {
      acc[year].statistics.completed++;
    } else {
      acc[year].statistics.pending++;
    }
    
    acc[year].statistics.completion_rate = 
      (acc[year].statistics.completed / acc[year].statistics.total) * 100;
    
    return acc;
  }, {});
  
  return Object.values(grouped).sort((a, b) => b.period.localeCompare(a.period));
}