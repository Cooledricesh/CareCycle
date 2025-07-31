import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SECRET_KEY = Deno.env.get('SUPABASE_SECRET_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: 'daily' | 'reminder' | 'overdue';
  patientId?: string;
  date?: string;
}

// Type definitions for the database response
interface Patient {
  id: string;
  patient_number: string;
  name: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface Item {
  id: string;
  name: string;
  category: 'test' | 'injection';
  cycle_value: number;
  cycle_unit: 'weeks' | 'months';
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface PatientSchedule {
  id: string;
  patient_id: string;
  item_id: string;
  first_implementation_date: string;
  next_due_date: string;
  last_implementation_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  patients: Patient;
  items: Item;
}

interface ScheduleHistory {
  id: string;
  patient_schedule_id: string;
  scheduled_date: string;
  actual_implementation_date: string | null;
  is_completed: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  patient_schedules: PatientSchedule;
}

// Type for the accumulator in reduce
interface PatientScheduleGroup {
  patient: Patient;
  schedules: Array<{
    item: Item;
    scheduled_date: string;
    is_overdue: boolean;
  }>;
}

interface PatientSchedulesMap {
  [patientId: string]: PatientScheduleGroup;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    let body: any;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate required fields
    const { type, patientId, date } = body as NotificationRequest;

    // Check if type is provided and valid
    if (!type) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: type' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!['daily', 'reminder', 'overdue'].includes(type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid type. Must be one of: daily, reminder, overdue' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate patientId if provided
    if (patientId !== undefined && typeof patientId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid patientId. Must be a string' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate date if provided
    if (date !== undefined) {
      if (typeof date !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Invalid date. Must be a string' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Check if date is in valid format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return new Response(
          JSON.stringify({ error: 'Invalid date format. Must be YYYY-MM-DD' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Check if date is a valid date
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return new Response(
          JSON.stringify({ error: 'Invalid date value' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    const targetDate = date || new Date().toISOString().split('T')[0];

    // Fetch schedules based on notification type
    let query = supabase
      .from('schedule_history')
      .select(`
        *,
        patient_schedules!inner(
          *,
          patients!inner(*),
          items!inner(*)
        )
      `)
      .eq('is_completed', false);

    if (type === 'daily') {
      // Get today's schedules
      query = query.eq('scheduled_date', targetDate);
    } else if (type === 'reminder') {
      // Get upcoming schedules (next 3 days)
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 3);
      query = query
        .gte('scheduled_date', targetDate)
        .lte('scheduled_date', endDate.toISOString().split('T')[0]);
    } else if (type === 'overdue') {
      // Get overdue schedules
      query = query.lt('scheduled_date', targetDate);
    }

    if (patientId) {
      query = query.eq('patient_schedules.patient_id', patientId);
    }

    const { data: schedules, error } = await query;

    if (error) {
      throw error;
    }

    if (!schedules || schedules.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No schedules to notify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group schedules by patient
    const patientSchedules = schedules.reduce((acc: PatientSchedulesMap, schedule: ScheduleHistory) => {
      const patientId = schedule.patient_schedules.patients.id;
      if (!acc[patientId]) {
        acc[patientId] = {
          patient: schedule.patient_schedules.patients,
          schedules: []
        };
      }
      acc[patientId].schedules.push({
        item: schedule.patient_schedules.items,
        scheduled_date: schedule.scheduled_date,
        is_overdue: new Date(schedule.scheduled_date) < new Date(targetDate)
      });
      return acc;
    }, {} as PatientSchedulesMap);

    // Send emails using Resend
    const emailPromises = Object.values(patientSchedules).map(async (data: PatientScheduleGroup) => {
      const subject = type === 'overdue' 
        ? `[CareCycle] 지연된 검사/주사 일정 알림`
        : `[CareCycle] 예정된 검사/주사 일정 알림`;

      const scheduleList = data.schedules.map((schedule) => 
        `- ${schedule.item.name} (${schedule.item.cycle_value}${schedule.item.cycle_unit === 'weeks' ? '주' : '개월'} 주기) - ${schedule.scheduled_date}${schedule.is_overdue ? ' [지연됨]' : ''}`
      ).join('\n');

      const emailBody = `
안녕하세요, ${data.patient.name}님.

CareCycle에서 알려드립니다.
${type === 'overdue' ? '다음 일정이 지연되었습니다:' : '다음 일정이 예정되어 있습니다:'}

${scheduleList}

병원에 문의하여 일정을 확인해 주시기 바랍니다.

감사합니다.
CareCycle 팀 드림
      `;

      // Here you would use Resend API to send the email
      // For now, we'll just log it
      console.log(`Sending email to ${data.patient.name}:`, emailBody);

      // TODO: Implement actual Resend API call
      // const response = await fetch('https://api.resend.com/emails', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${RESEND_API_KEY}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     from: 'CareCycle <notifications@carecycle.com>',
      //     to: data.patient.email,
      //     subject,
      //     text: emailBody,
      //   }),
      // });

      return { patient: data.patient.name, status: 'sent' };
    });

    const results = await Promise.all(emailPromises);

    return new Response(
      JSON.stringify({ 
        message: 'Notifications sent',
        results,
        totalSchedules: schedules.length,
        totalPatients: Object.keys(patientSchedules).length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});