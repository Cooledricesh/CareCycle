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

// HTML escape function to prevent XSS and rendering issues
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

interface NotificationRequest {
  type: 'daily' | 'reminder' | 'overdue';
  userId?: string;
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

// Type for schedule groups
interface ScheduleGroup {
  schedules: Array<{
    patient: Patient;
    item: Item;
    scheduled_date: string;
    is_overdue: boolean;
    history_id: string;
  }>;
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  notification_enabled: boolean;
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
    const { type, userId, date } = body as NotificationRequest;

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

    // Validate userId if provided
    if (userId !== undefined && typeof userId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid userId. Must be a string' }),
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

    // Get all users who have notifications enabled
    let usersQuery = supabase
      .from('profiles')
      .select('*')
      .eq('notification_enabled', true);
    
    if (userId) {
      usersQuery = usersQuery.eq('id', userId);
    }

    const { data: users, error: usersError } = await usersQuery;

    if (usersError) {
      throw usersError;
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users with notifications enabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
      .eq('is_completed', false)
      .eq('is_notified', false);

    if (type === 'daily') {
      // Get today's schedules
      query = query.eq('scheduled_date', targetDate);
    } else if (type === 'reminder') {
      // Get schedules where notification should be sent (notification_scheduled_at <= today)
      // Create ISO string for end of UTC day (23:59:59.999)
      const endOfDayUTC = `${targetDate}T23:59:59.999Z`;
      query = query.lte('notification_scheduled_at', endOfDayUTC);
    } else if (type === 'overdue') {
      // Get overdue schedules
      query = query.lt('scheduled_date', targetDate);
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

    // Prepare schedule data
    const scheduleData: ScheduleGroup['schedules'] = schedules.map((schedule: ScheduleHistory) => ({
      patient: schedule.patient_schedules.patients,
      item: schedule.patient_schedules.items,
      scheduled_date: schedule.scheduled_date,
      is_overdue: new Date(schedule.scheduled_date) < new Date(targetDate),
      history_id: schedule.id
    }));

    // Send emails to users with batch processing and rate limiting
    const BATCH_SIZE = 5; // Number of emails to send per batch
    const BATCH_DELAY_MS = 1000; // Delay between batches in milliseconds
    
    const results = [];
    
    // Process users in batches
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);
      
      // Process current batch
      const batchPromises = batch.map(async (user: Profile) => {
        const subject = type === 'overdue' 
          ? `[CareCycle] 지연된 환자 검사/주사 일정 알림`
          : type === 'reminder'
          ? `[CareCycle] 예정된 환자 검사/주사 일정 알림`
          : `[CareCycle] 오늘의 환자 검사/주사 일정`;

        // Group schedules by patient for better organization
        const patientGroups = scheduleData.reduce((acc: { [key: string]: typeof scheduleData }, schedule) => {
          const patientId = schedule.patient.id;
          if (!acc[patientId]) {
            acc[patientId] = [];
          }
          acc[patientId].push(schedule);
          return acc;
        }, {});

        const scheduleList = Object.entries(patientGroups).map(([_, patientSchedules]) => {
          const patient = patientSchedules[0].patient;
          const items = patientSchedules.map(s => 
            `  - ${escapeHtml(s.item.name)} (${s.item.cycle_value}${s.item.cycle_unit === 'weeks' ? '주' : '개월'} 주기) - ${s.scheduled_date}${s.is_overdue ? ' [지연됨]' : ''}`
          ).join('\n');
          return `${escapeHtml(patient.name)} (${escapeHtml(patient.patient_number)}):\n${items}`;
        }).join('\n\n');

        const emailBody = `
안녕하세요, ${escapeHtml(user.full_name || user.email)}님.

CareCycle에서 관리 중인 환자들의 검사/주사 일정을 알려드립니다.
${type === 'overdue' ? '\n다음 일정이 지연되었습니다:\n' : type === 'reminder' ? '\n다음 일정이 예정되어 있습니다:\n' : '\n오늘 예정된 일정:\n'}
${scheduleList}

각 환자에게 연락하여 일정을 확인해 주시기 바랍니다.

감사합니다.
CareCycle 팀 드림
        `;

        // Use Resend API to send the email
        if (RESEND_API_KEY && RESEND_API_KEY !== '') {
          try {
            const response = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'CareCycle <noreply@carecycle.app>',
                to: user.email,
                subject,
                text: emailBody,
              }),
            });

            if (!response.ok) {
              const error = await response.text();
              console.error(`Failed to send email to ${user.email}:`, error);
              return { user: user.email, status: 'failed', error };
            }

            // Mark schedules as notified
            const scheduleIds = scheduleData.map(s => s.history_id);
            await supabase
              .from('schedule_history')
              .update({ is_notified: true })
              .in('id', scheduleIds);

            // Save notification record
            await supabase
              .from('notifications')
              .insert({
                user_id: user.id,
                type,
                title: subject,
                message: emailBody,
                schedule_ids: scheduleIds
              });

            return { user: user.email, status: 'sent' };
          } catch (error) {
            console.error(`Error sending email to ${user.email}:`, error);
            return { user: user.email, status: 'failed', error: error.message };
          }
        } else {
          // If no Resend API key, just log the email
          console.log(`[DEMO MODE] Would send email to ${user.email}:`, emailBody);
          return { user: user.email, status: 'demo_sent' };
        }
      });
      
      // Wait for current batch to complete
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches if not the last batch
      if (i + BATCH_SIZE < users.length) {
        console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1} completed. Waiting ${BATCH_DELAY_MS}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Notifications processed',
        results,
        totalSchedules: schedules.length,
        totalUsers: users.length,
        successCount: results.filter(r => r.status === 'sent' || r.status === 'demo_sent').length
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