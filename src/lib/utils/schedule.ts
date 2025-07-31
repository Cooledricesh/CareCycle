import { addWeeks, addMonths } from 'date-fns';

export type CycleUnit = 'weeks' | 'months';

export interface ScheduleCalculationParams {
  startDate: Date;
  cycleValue: number;
  cycleUnit: CycleUnit;
}

/**
 * Calculate the next due date based on the cycle configuration
 * @param params - Schedule calculation parameters
 * @returns The next due date
 */
export function calculateNextDueDate(params: ScheduleCalculationParams): Date {
  const { startDate, cycleValue, cycleUnit } = params;
  
  if (cycleUnit === 'weeks') {
    return addWeeks(startDate, cycleValue);
  } else if (cycleUnit === 'months') {
    return addMonths(startDate, cycleValue);
  }
  
  throw new Error(`Invalid cycle unit: ${cycleUnit}`);
}

/**
 * Calculate all future due dates up to a certain limit
 * @param params - Schedule calculation parameters
 * @param count - Number of future dates to calculate
 * @returns Array of future due dates
 */
export function calculateFutureDueDates(
  params: ScheduleCalculationParams,
  count: number = 12
): Date[] {
  const dates: Date[] = [];
  let currentDate = params.startDate;
  
  for (let i = 0; i < count; i++) {
    const nextDate = calculateNextDueDate({
      ...params,
      startDate: currentDate,
    });
    dates.push(nextDate);
    currentDate = nextDate;
  }
  
  return dates;
}

/**
 * Calculate the next due date from the last implementation date
 * If no last implementation date is provided, calculate from the original start date
 * @param originalStartDate - The original first implementation date
 * @param cycleValue - The cycle value (e.g., 4 for 4 weeks)
 * @param cycleUnit - The cycle unit ('weeks' or 'months')
 * @param lastImplementationDate - The last actual implementation date (optional)
 * @returns The next due date
 */
export function calculateNextDueDateFromLastImplementation(
  originalStartDate: Date,
  cycleValue: number,
  cycleUnit: CycleUnit,
  lastImplementationDate?: Date
): Date {
  const baseDate = lastImplementationDate || originalStartDate;
  
  return calculateNextDueDate({
    startDate: baseDate,
    cycleValue,
    cycleUnit,
  });
}

/**
 * Check if a date is overdue
 * @param dueDate - The due date to check
 * @param referenceDate - The reference date (defaults to today)
 * @returns True if the due date is before the reference date
 */
export function isOverdue(dueDate: Date, referenceDate: Date = new Date()): boolean {
  // Compare only the date parts (ignoring time)
  const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const referenceDateOnly = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  
  return dueDateOnly < referenceDateOnly;
}

/**
 * Get the number of days until the due date
 * @param dueDate - The due date
 * @param referenceDate - The reference date (defaults to today)
 * @returns Number of days (negative if overdue)
 */
export function getDaysUntilDue(dueDate: Date, referenceDate: Date = new Date()): number {
  // Create date-only versions to ignore time component
  const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const referenceDateOnly = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  
  const diffInMs = dueDateOnly.getTime() - referenceDateOnly.getTime();
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}