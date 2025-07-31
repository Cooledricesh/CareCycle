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
  });
});