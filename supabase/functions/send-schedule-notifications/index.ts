import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: 'daily' | 'reminder' | 'overdue';
  patientId?: string;
  date?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, patientId, date } = await req.json() as NotificationRequest;
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
    const patientSchedules = schedules.reduce((acc: any, schedule: any) => {
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
    }, {});

    // Send emails using Resend
    const emailPromises = Object.values(patientSchedules).map(async (data: any) => {
      const subject = type === 'overdue' 
        ? `[CareCycle] 지연된 검사/주사 일정 알림`
        : `[CareCycle] 예정된 검사/주사 일정 알림`;

      const scheduleList = data.schedules.map((schedule: any) => 
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
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});