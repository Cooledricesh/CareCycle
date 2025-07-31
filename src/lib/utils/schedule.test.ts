import { describe, it, expect } from 'vitest';
import {
  calculateNextDueDate,
  calculateFutureDueDates,
  calculateNextDueDateFromLastImplementation,
  isOverdue,
  getDaysUntilDue,
} from './schedule';

describe('Schedule Utilities', () => {
  describe('calculateNextDueDate', () => {
    it('should calculate next due date for weeks', () => {
      const startDate = new Date(Date.UTC(2025, 0, 1)); // 2025-01-01 UTC
      const result = calculateNextDueDate({
        startDate,
        cycleValue: 4,
        cycleUnit: 'weeks',
      });
      
      expect(result.toISOString().split('T')[0]).toEqual('2025-01-29');
    });
    
    it('should calculate next due date for months', () => {
      const startDate = new Date(Date.UTC(2025, 0, 1)); // 2025-01-01 UTC
      const result = calculateNextDueDate({
        startDate,
        cycleValue: 3,
        cycleUnit: 'months',
      });
      
      expect(result.toISOString().split('T')[0]).toEqual('2025-04-01');
    });
    
    it('should handle edge case for month-end dates', () => {
      const startDate = new Date(Date.UTC(2025, 0, 31)); // 2025-01-31 UTC
      const result = calculateNextDueDate({
        startDate,
        cycleValue: 1,
        cycleUnit: 'months',
      });
      
      // February only has 28 days in 2025
      expect(result.toISOString().split('T')[0]).toEqual('2025-02-28');
    });
    
    it('should handle leap year correctly', () => {
      const startDate = new Date(Date.UTC(2024, 0, 31)); // 2024-01-31 UTC
      const result = calculateNextDueDate({
        startDate,
        cycleValue: 1,
        cycleUnit: 'months',
      });
      
      // 2024 is a leap year, so February has 29 days
      expect(result.toISOString().split('T')[0]).toEqual('2024-02-29');
    });
    
    it('should throw error for invalid cycle unit', () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      expect(() => {
        calculateNextDueDate({
          startDate,
          cycleValue: 1,
          cycleUnit: 'days' as any,
        });
      }).toThrow('Invalid cycle unit: days');
    });
  });
  
  describe('calculateFutureDueDates', () => {
    it('should calculate multiple future dates', () => {
      const startDate = new Date(Date.UTC(2025, 0, 1)); // 2025-01-01 UTC
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 4,
        cycleUnit: 'weeks',
      }, 3);
      
      expect(results).toHaveLength(3);
      expect(results[0].toISOString().split('T')[0]).toEqual('2025-01-29');
      expect(results[1].toISOString().split('T')[0]).toEqual('2025-02-26');
      expect(results[2].toISOString().split('T')[0]).toEqual('2025-03-26');
    });
    
    it('should default to 12 future dates', () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: 'months',
      });
      
      expect(results).toHaveLength(12);
    });
  });
  
  describe('calculateNextDueDateFromLastImplementation', () => {
    it('should calculate from last implementation date when provided', () => {
      const originalStartDate = new Date(Date.UTC(2025, 0, 1));
      const lastImplementationDate = new Date(Date.UTC(2025, 0, 15));
      
      const result = calculateNextDueDateFromLastImplementation(
        originalStartDate,
        4,
        'weeks',
        lastImplementationDate
      );
      
      expect(result.toISOString().split('T')[0]).toEqual('2025-02-12');
    });
    
    it('should calculate from original start date when last implementation not provided', () => {
      const originalStartDate = new Date(Date.UTC(2025, 0, 1));
      
      const result = calculateNextDueDateFromLastImplementation(
        originalStartDate,
        4,
        'weeks'
      );
      
      expect(result.toISOString().split('T')[0]).toEqual('2025-01-29');
    });
  });
  
  describe('isOverdue', () => {
    it('should return true for past dates', () => {
      const dueDate = new Date(Date.UTC(2025, 0, 1));
      const referenceDate = new Date(Date.UTC(2025, 0, 15));
      
      expect(isOverdue(dueDate, referenceDate)).toBe(true);
    });
    
    it('should return false for future dates', () => {
      const dueDate = new Date(Date.UTC(2025, 1, 1));
      const referenceDate = new Date(Date.UTC(2025, 0, 15));
      
      expect(isOverdue(dueDate, referenceDate)).toBe(false);
    });
    
    it('should return false for same date', () => {
      const dueDate = new Date(Date.UTC(2025, 0, 15));
      const referenceDate = new Date(Date.UTC(2025, 0, 15));
      
      expect(isOverdue(dueDate, referenceDate)).toBe(false);
    });
  });
  
  describe('getDaysUntilDue', () => {
    it('should return positive days for future dates', () => {
      const dueDate = new Date(Date.UTC(2025, 0, 20));
      const referenceDate = new Date(Date.UTC(2025, 0, 15));
      
      expect(getDaysUntilDue(dueDate, referenceDate)).toBe(5);
    });
    
    it('should return negative days for past dates', () => {
      const dueDate = new Date(Date.UTC(2025, 0, 10));
      const referenceDate = new Date(Date.UTC(2025, 0, 15));
      
      expect(getDaysUntilDue(dueDate, referenceDate)).toBe(-5);
    });
    
    it('should return 0 for same date', () => {
      const dueDate = new Date(Date.UTC(2025, 0, 15));
      const referenceDate = new Date(Date.UTC(2025, 0, 15));
      
      expect(getDaysUntilDue(dueDate, referenceDate)).toBe(0);
    });
    
    it('should handle string dates', () => {
      const dueDate = '2025-01-20';
      const referenceDate = new Date(Date.UTC(2025, 0, 15));
      
      expect(getDaysUntilDue(dueDate, referenceDate)).toBe(5);
    });
    
    it('should handle timezone differences correctly', () => {
      const dueDate = new Date('2025-01-20T23:59:59Z');
      const referenceDate = new Date('2025-01-15T01:00:00Z');
      
      expect(getDaysUntilDue(dueDate, referenceDate)).toBe(5);
    });
  });
  
  describe('formatDate', () => {
    it('should format date with default Korean format', () => {
      const date = new Date(Date.UTC(2025, 0, 15));
      const result = formatDate(date);
      
      expect(result).toMatch(/2025년.*1월.*15일/);
    });
    
    it('should format string date', () => {
      const date = '2025-01-15';
      const result = formatDate(date);
      
      expect(result).toMatch(/2025년.*1월.*15일/);
    });
    
    it('should format with custom format string', () => {
      const date = new Date(Date.UTC(2025, 0, 15));
      const result = formatDate(date, 'yyyy-MM-dd');
      
      expect(result).toBe('2025-01-15');
    });
    
    it('should handle different format patterns', () => {
      const date = new Date(Date.UTC(2025, 0, 15));
      const result = formatDate(date, 'MM/dd/yyyy');
      
      expect(result).toBe('01/15/2025');
    });
  });
  
  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid dates in isOverdue', () => {
      const invalidDate = new Date('invalid-date');
      const referenceDate = new Date(Date.UTC(2025, 0, 15));
      
      // Should not throw an error
      const result = isOverdue(invalidDate, referenceDate);
      expect(typeof result).toBe('boolean');
    });
    
    it('should handle invalid string dates in getDaysUntilDue', () => {
      const invalidDate = 'invalid-date';
      const referenceDate = new Date(Date.UTC(2025, 0, 15));
      
      // Should not throw an error
      const result = getDaysUntilDue(invalidDate, referenceDate);
      expect(typeof result).toBe('number');
    });
    
    it('should use current date as default reference in isOverdue', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      
      expect(isOverdue(futureDate)).toBe(false);
    });
    
    it('should use current date as default reference in getDaysUntilDue', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      
      const result = getDaysUntilDue(futureDate);
      expect(result).toBeGreaterThanOrEqual(0);
    });
    
    it('should handle calculateNextDueDate with zero cycle value', () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      expect(() => {
        calculateNextDueDate({
          startDate,
          cycleValue: 0,
          cycleUnit: 'weeks',
        });
      }).not.toThrow();
    });
    
    it('should handle calculateNextDueDate with negative cycle value', () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      expect(() => {
        calculateNextDueDate({
          startDate,
          cycleValue: -1,
          cycleUnit: 'weeks',
        });
      }).not.toThrow();
    });
    
    it('should handle very large cycle values', () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      expect(() => {
        calculateNextDueDate({
          startDate,
          cycleValue: 1000,
          cycleUnit: 'months',
        });
      }).not.toThrow();
    });
  });
  
  describe('Integration Tests', () => {
    it('should calculate consistent future dates for a patient schedule', () => {
      const originalStart = new Date(Date.UTC(2025, 0, 1));
      const cycleValue = 4;
      const cycleUnit = 'weeks' as const;
      
      // Calculate first follow-up
      const firstFollowUp = calculateNextDueDate({
        startDate: originalStart,
        cycleValue,
        cycleUnit,
      });
      
      // Calculate second follow-up from first
      const secondFollowUp = calculateNextDueDate({
        startDate: firstFollowUp,
        cycleValue,
        cycleUnit,
      });
      
      // Should be consistent with future dates calculation
      const futureDates = calculateFutureDueDates({
        startDate: originalStart,
        cycleValue,
        cycleUnit,
      }, 2);
      
      expect(firstFollowUp.getTime()).toBe(futureDates[0].getTime());
      expect(secondFollowUp.getTime()).toBe(futureDates[1].getTime());
    });
    
    it('should handle patient missing appointments scenario', () => {
      const originalStart = new Date(Date.UTC(2025, 0, 1));
      const missedDate = new Date(Date.UTC(2025, 0, 29)); // Should have been first appointment
      const actualImplementation = new Date(Date.UTC(2025, 1, 15)); // Actually came later
      
      const nextDueFromOriginal = calculateNextDueDateFromLastImplementation(
        originalStart,
        4,
        'weeks'
      );
      
      const nextDueFromActual = calculateNextDueDateFromLastImplementation(
        originalStart,
        4,
        'weeks',
        actualImplementation
      );
      
      expect(nextDueFromOriginal.getTime()).toBe(missedDate.getTime());
      expect(nextDueFromActual.getTime()).not.toBe(nextDueFromOriginal.getTime());
      expect(nextDueFromActual > actualImplementation).toBe(true);
    });
    
    it('should work with realistic healthcare schedule example', () => {
      // Monthly blood test for diabetes patient
      const firstTest = new Date(Date.UTC(2025, 0, 15)); // Jan 15
      const cycleValue = 1;
      const cycleUnit = 'months' as const;
      
      // Calculate next 6 months of tests
      const futureDates = calculateFutureDueDates({
        startDate: firstTest,
        cycleValue,
        cycleUnit,
      }, 6);
      
      expect(futureDates[0].toISOString().split('T')[0]).toBe('2025-02-15');
      expect(futureDates[1].toISOString().split('T')[0]).toBe('2025-03-15');
      expect(futureDates[2].toISOString().split('T')[0]).toBe('2025-04-15');
      expect(futureDates[3].toISOString().split('T')[0]).toBe('2025-05-15');
      expect(futureDates[4].toISOString().split('T')[0]).toBe('2025-06-15');
      expect(futureDates[5].toISOString().split('T')[0]).toBe('2025-07-15');
      
      // Check if any are overdue (assuming current date is after some of them)
      const referenceDate = new Date(Date.UTC(2025, 2, 20)); // March 20
      const overdueDates = futureDates.filter(date => isOverdue(date, referenceDate));
      
      expect(overdueDates).toHaveLength(2); // Feb and March should be overdue
    });
  });
});