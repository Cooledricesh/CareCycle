import { createClient } from '@supabase/supabase-js';

// Test script to verify transaction support in schedule completion
// This script will test the atomic nature of the complete_patient_schedule function

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined. Please check your .env.local file.');
}

if (!supabasePublishableKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not defined. Please check your .env.local file.');
}

const supabase = createClient(supabaseUrl, supabasePublishableKey);

async function testTransactionSupport() {
  console.log('Testing transaction support for schedule completion...\n');

  try {
    // First, fetch a sample patient schedule
    const { data: schedules, error: fetchError } = await supabase
      .from('patient_schedules')
      .select('*, patients(*), items(*)')
      .eq('is_active', true)
      .limit(1);

    if (fetchError || !schedules || schedules.length === 0) {
      console.error('No active schedules found to test');
      return;
    }

    const schedule = schedules[0];
    console.log(`Testing with schedule ID: ${schedule.id}`);
    console.log(`Patient: ${schedule.patients.name}`);
    console.log(`Item: ${schedule.items.name}\n`);

    // Test 1: Successful completion
    console.log('Test 1: Attempting successful completion...');
    const { data: result1, error: error1 } = await supabase.rpc('complete_patient_schedule', {
      p_patient_id: schedule.patient_id,
      p_schedule_id: schedule.id,
      p_actual_implementation_date: new Date().toISOString().split('T')[0],
      p_notes: 'Test completion - transaction support verification',
      p_scheduled_date: null
    });

    if (error1) {
      console.error('Error in successful completion test:', error1.message);
    } else {
      console.log('✅ Successful completion test passed');
      console.log(`  - History entry created: ${result1.history_entry.id}`);
      console.log(`  - Next due date updated to: ${result1.schedule.next_due_date}`);
      console.log(`  - Next history entry created: ${result1.next_history_id}\n`);
    }

    // Test 2: Duplicate completion (should fail with 409)
    console.log('Test 2: Attempting duplicate completion (should fail)...');
    const { data: result2, error: error2 } = await supabase.rpc('complete_patient_schedule', {
      p_patient_id: schedule.patient_id,
      p_schedule_id: schedule.id,
      p_actual_implementation_date: new Date().toISOString().split('T')[0],
      p_notes: 'Duplicate test - should fail',
      p_scheduled_date: result1?.history_entry.scheduled_date
    });

    if (error2) {
      if (error2.message.includes('이미 완료된 일정입니다')) {
        console.log('✅ Duplicate prevention test passed - correctly rejected duplicate completion\n');
      } else {
        console.error('❌ Unexpected error:', error2.message);
      }
    } else {
      console.error('❌ Duplicate prevention test failed - duplicate was allowed\n');
    }

    // Test 3: Invalid schedule ID (should fail with 404)
    console.log('Test 3: Attempting completion with invalid schedule ID (should fail)...');
    const { data: result3, error: error3 } = await supabase.rpc('complete_patient_schedule', {
      p_patient_id: schedule.patient_id,
      p_schedule_id: '00000000-0000-0000-0000-000000000000',
      p_actual_implementation_date: new Date().toISOString().split('T')[0],
      p_notes: 'Invalid schedule test',
      p_scheduled_date: null
    });

    if (error3) {
      if (error3.message.includes('활성 일정을 찾을 수 없습니다')) {
        console.log('✅ Invalid schedule test passed - correctly rejected invalid schedule\n');
      } else {
        console.error('❌ Unexpected error:', error3.message);
      }
    } else {
      console.error('❌ Invalid schedule test failed - invalid schedule was accepted\n');
    }

    // Test 4: Verify transaction atomicity
    console.log('Test 4: Verifying transaction atomicity...');
    
    // Check that all related data is consistent
    const { data: verifySchedule } = await supabase
      .from('patient_schedules')
      .select('*, items(*)')
      .eq('id', schedule.id)
      .single();

    const { data: verifyHistory } = await supabase
      .from('schedule_history')
      .select('*')
      .eq('patient_schedule_id', schedule.id)
      .order('created_at', { ascending: false })
      .limit(2);

    if (verifySchedule && verifyHistory && verifyHistory.length >= 2) {
      const completedEntry = verifyHistory.find(h => h.is_completed);
      const nextEntry = verifyHistory.find(h => !h.is_completed);

      if (completedEntry && nextEntry && 
          verifySchedule.last_implementation_date === completedEntry.actual_implementation_date &&
          verifySchedule.next_due_date === nextEntry.scheduled_date) {
        console.log('✅ Transaction atomicity verified - all data is consistent');
        console.log(`  - Schedule last_implementation_date: ${verifySchedule.last_implementation_date}`);
        console.log(`  - Schedule next_due_date: ${verifySchedule.next_due_date}`);
        console.log(`  - Completed history entry date: ${completedEntry.actual_implementation_date}`);
        console.log(`  - Next history entry scheduled date: ${nextEntry.scheduled_date}\n`);
      } else {
        console.error('❌ Transaction atomicity test failed - data inconsistency detected\n');
      }
    }

    console.log('Transaction support testing completed!');

    // Cleanup: Remove test data
    console.log('\nCleaning up test data...');
    try {
      // Delete test history entries created during the test
      if (result1?.history_entry?.id) {
        const { error: deleteHistoryError } = await supabase
          .from('schedule_history')
          .delete()
          .eq('id', result1.history_entry.id);
        
        if (deleteHistoryError) {
          console.error('Failed to delete test history entry:', deleteHistoryError.message);
        } else {
          console.log('✅ Deleted test completion history entry');
        }
      }

      if (result1?.next_history_id) {
        const { error: deleteNextHistoryError } = await supabase
          .from('schedule_history')
          .delete()
          .eq('id', result1.next_history_id);
        
        if (deleteNextHistoryError) {
          console.error('Failed to delete next history entry:', deleteNextHistoryError.message);
        } else {
          console.log('✅ Deleted next scheduled history entry');
        }
      }

      // Reset the schedule to its original state
      const { error: resetScheduleError } = await supabase
        .from('patient_schedules')
        .update({
          last_implementation_date: schedule.last_implementation_date,
          next_due_date: schedule.next_due_date
        })
        .eq('id', schedule.id);

      if (resetScheduleError) {
        console.error('Failed to reset schedule:', resetScheduleError.message);
      } else {
        console.log('✅ Reset schedule to original state');
      }

      console.log('\nCleanup completed successfully!');
    } catch (cleanupError) {
      console.error('Cleanup failed:', cleanupError);
      console.log('\n⚠️  Manual cleanup may be required for schedule ID:', schedule.id);
    }

  } catch (error) {
    console.error('Test script error:', error);
  }
}

// Run the test
testTransactionSupport();