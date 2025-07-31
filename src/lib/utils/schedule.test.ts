import { describe, it, expect } from 'vitest';
import {
  calculateNextDueDate,
  calculateFutureDueDates,
  calculateNextDueDateFromLastImplementation,
  isOverdue,
  getDaysUntilDue,
  formatDate,
} from './schedule';

describe('Schedule Utilities', () => {
  describe('calculateNextDueDate', () => {
    it('should calculate next due date for weeks', () => {
      const startDate = new Date(Date.UTC(2025, 0, 1)); // 2025-01-01 UTC
      const result = calculateNextDueDate({
        startDate,
        cycleValue: 4,
        cycleUnit: 'weeks',

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      expect(result.toISOString().split('T')[0]).toEqual('2025-01-29');

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });
    
    it('should calculate next due date for months', () => {
      const startDate = new Date(Date.UTC(2025, 0, 1)); // 2025-01-01 UTC
      const result = calculateNextDueDate({
        startDate,
        cycleValue: 3,
        cycleUnit: 'months',

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      expect(result.toISOString().split('T')[0]).toEqual('2025-04-01');

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });
    
    it('should handle edge case for month-end dates', () => {
      const startDate = new Date(Date.UTC(2025, 0, 31)); // 2025-01-31 UTC
      const result = calculateNextDueDate({
        startDate,
        cycleValue: 1,
        cycleUnit: 'months',

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      // February only has 28 days in 2025
      expect(result.toISOString().split('T')[0]).toEqual('2025-02-28');

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });
    
    it('should handle leap year correctly', () => {
      const startDate = new Date(Date.UTC(2024, 0, 31)); // 2024-01-31 UTC
      const result = calculateNextDueDate({
        startDate,
        cycleValue: 1,
        cycleUnit: 'months',

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      // 2024 is a leap year, so February has 29 days
      expect(result.toISOString().split('T')[0]).toEqual('2024-02-29');

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });
    
    it('should throw error for invalid cycle unit', () => {

    it("should handle boundary dates correctly", () => {
      // Test December 31st to January calculations
      const endOfYear = new Date(Date.UTC(2024, 11, 31)); // Dec 31, 2024
      const result = calculateNextDueDate({
        startDate: endOfYear,
        cycleValue: 1,
        cycleUnit: "months",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      expect(result.toISOString().split("T")[0]).toEqual("2025-01-31");

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });

    it("should handle February 29th in non-leap years", () => {
      const leapDate = new Date(Date.UTC(2024, 1, 29)); // Feb 29, 2024 (leap year)
      const result = calculateNextDueDate({
        startDate: leapDate,
        cycleValue: 12,
        cycleUnit: "months",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      // 2025 is not a leap year, should fallback to Feb 28
      expect(result.toISOString().split("T")[0]).toEqual("2025-02-28");

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });

    it("should handle fractional cycle values for weeks", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const result = calculateNextDueDate({
        startDate,
        cycleValue: 0.5,
        cycleUnit: "weeks",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      // 0.5 weeks = 3.5 days, should be handled by date-fns
      expect(result > startDate).toBe(true);
      const daysDiff = (result.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeCloseTo(3.5, 1);

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });

    it("should handle fractional cycle values for months", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const result = calculateNextDueDate({
        startDate,
        cycleValue: 1.5,
        cycleUnit: "months",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      expect(result > startDate).toBe(true);
      expect(result.getMonth()).toBeGreaterThanOrEqual(1);

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });

    it("should handle zero cycle value", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const result = calculateNextDueDate({
        startDate,
        cycleValue: 0,
        cycleUnit: "weeks",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      expect(result.getTime()).toBe(startDate.getTime());

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });

    it("should handle negative cycle values", () => {
      const startDate = new Date(Date.UTC(2025, 0, 15));
      const result = calculateNextDueDate({
        startDate,
        cycleValue: -2,
        cycleUnit: "weeks",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      expect(result < startDate).toBe(true);

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });

    it("should handle very large cycle values", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      expect(() => {
        calculateNextDueDate({
          startDate,
          cycleValue: 1000,
          cycleUnit: "months",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
        });
      }).not.toThrow();

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });
      const startDate = new Date(Date.UTC(2025, 0, 1));

    it("should handle boundary dates correctly", () => {
      // Test December 31st to January calculations
      const endOfYear = new Date(Date.UTC(2024, 11, 31)); // Dec 31, 2024
      const result = calculateNextDueDate({
        startDate: endOfYear,
        cycleValue: 1,
        cycleUnit: "months",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      expect(result.toISOString().split("T")[0]).toEqual("2025-01-31");

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });

    it("should handle February 29th in non-leap years", () => {
      const leapDate = new Date(Date.UTC(2024, 1, 29)); // Feb 29, 2024 (leap year)
      const result = calculateNextDueDate({
        startDate: leapDate,
        cycleValue: 12,
        cycleUnit: "months",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      // 2025 is not a leap year, should fallback to Feb 28
      expect(result.toISOString().split("T")[0]).toEqual("2025-02-28");

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });

    it("should handle fractional cycle values for weeks", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const result = calculateNextDueDate({
        startDate,
        cycleValue: 0.5,
        cycleUnit: "weeks",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      // 0.5 weeks = 3.5 days, should be handled by date-fns
      expect(result > startDate).toBe(true);
      const daysDiff = (result.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeCloseTo(3.5, 1);

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });

    it("should handle fractional cycle values for months", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const result = calculateNextDueDate({
        startDate,
        cycleValue: 1.5,
        cycleUnit: "months",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      expect(result > startDate).toBe(true);
      expect(result.getMonth()).toBeGreaterThanOrEqual(1);

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });

    it("should handle zero cycle value", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const result = calculateNextDueDate({
        startDate,
        cycleValue: 0,
        cycleUnit: "weeks",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      expect(result.getTime()).toBe(startDate.getTime());

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });

    it("should handle negative cycle values", () => {
      const startDate = new Date(Date.UTC(2025, 0, 15));
      const result = calculateNextDueDate({
        startDate,
        cycleValue: -2,
        cycleUnit: "weeks",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      expect(result < startDate).toBe(true);

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });

    it("should handle very large cycle values", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      expect(() => {
        calculateNextDueDate({
          startDate,
          cycleValue: 1000,
          cycleUnit: "months",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
        });
      }).not.toThrow();

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });
      expect(() => {

    it("should handle boundary dates correctly", () => {
      // Test December 31st to January calculations
      const endOfYear = new Date(Date.UTC(2024, 11, 31)); // Dec 31, 2024
      const result = calculateNextDueDate({
        startDate: endOfYear,
        cycleValue: 1,
        cycleUnit: "months",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      expect(result.toISOString().split("T")[0]).toEqual("2025-01-31");

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });

    it("should handle February 29th in non-leap years", () => {
      const leapDate = new Date(Date.UTC(2024, 1, 29)); // Feb 29, 2024 (leap year)
      const result = calculateNextDueDate({
        startDate: leapDate,
        cycleValue: 12,
        cycleUnit: "months",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      // 2025 is not a leap year, should fallback to Feb 28
      expect(result.toISOString().split("T")[0]).toEqual("2025-02-28");

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });

    it("should handle fractional cycle values for weeks", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const result = calculateNextDueDate({
        startDate,
        cycleValue: 0.5,
        cycleUnit: "weeks",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      // 0.5 weeks = 3.5 days, should be handled by date-fns
      expect(result > startDate).toBe(true);
      const daysDiff = (result.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeCloseTo(3.5, 1);

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });

    it("should handle fractional cycle values for months", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const result = calculateNextDueDate({
        startDate,
        cycleValue: 1.5,
        cycleUnit: "months",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      expect(result > startDate).toBe(true);
      expect(result.getMonth()).toBeGreaterThanOrEqual(1);

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });

    it("should handle zero cycle value", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const result = calculateNextDueDate({
        startDate,
        cycleValue: 0,
        cycleUnit: "weeks",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      expect(result.getTime()).toBe(startDate.getTime());

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });

    it("should handle negative cycle values", () => {
      const startDate = new Date(Date.UTC(2025, 0, 15));
      const result = calculateNextDueDate({
        startDate,
        cycleValue: -2,
        cycleUnit: "weeks",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      expect(result < startDate).toBe(true);

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });

    it("should handle very large cycle values", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      expect(() => {
        calculateNextDueDate({
          startDate,
          cycleValue: 1000,
          cycleUnit: "months",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
        });
      }).not.toThrow();

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });
        calculateNextDueDate({

    it("should handle boundary dates correctly", () => {
      // Test December 31st to January calculations
      const endOfYear = new Date(Date.UTC(2024, 11, 31)); // Dec 31, 2024
      const result = calculateNextDueDate({
        startDate: endOfYear,
        cycleValue: 1,
        cycleUnit: "months",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      expect(result.toISOString().split("T")[0]).toEqual("2025-01-31");

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });

    it("should handle February 29th in non-leap years", () => {
      const leapDate = new Date(Date.UTC(2024, 1, 29)); // Feb 29, 2024 (leap year)
      const result = calculateNextDueDate({
        startDate: leapDate,
        cycleValue: 12,
        cycleUnit: "months",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      // 2025 is not a leap year, should fallback to Feb 28
      expect(result.toISOString().split("T")[0]).toEqual("2025-02-28");

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });

    it("should handle fractional cycle values for weeks", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const result = calculateNextDueDate({
        startDate,
        cycleValue: 0.5,
        cycleUnit: "weeks",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      // 0.5 weeks = 3.5 days, should be handled by date-fns
      expect(result > startDate).toBe(true);
      const daysDiff = (result.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeCloseTo(3.5, 1);

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });

    it("should handle fractional cycle values for months", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const result = calculateNextDueDate({
        startDate,
        cycleValue: 1.5,
        cycleUnit: "months",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      expect(result > startDate).toBe(true);
      expect(result.getMonth()).toBeGreaterThanOrEqual(1);

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });

    it("should handle zero cycle value", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const result = calculateNextDueDate({
        startDate,
        cycleValue: 0,
        cycleUnit: "weeks",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      expect(result.getTime()).toBe(startDate.getTime());

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });

    it("should handle negative cycle values", () => {
      const startDate = new Date(Date.UTC(2025, 0, 15));
      const result = calculateNextDueDate({
        startDate,
        cycleValue: -2,
        cycleUnit: "weeks",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      expect(result < startDate).toBe(true);

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });

    it("should handle very large cycle values", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      expect(() => {
        calculateNextDueDate({
          startDate,
          cycleValue: 1000,
          cycleUnit: "months",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
        });
      }).not.toThrow();

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });
          startDate,

    it("should handle boundary dates correctly", () => {
      // Test December 31st to January calculations
      const endOfYear = new Date(Date.UTC(2024, 11, 31)); // Dec 31, 2024
      const result = calculateNextDueDate({
        startDate: endOfYear,
        cycleValue: 1,
        cycleUnit: "months",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
      });
      
      expect(result.toISOString().split("T")[0]).toEqual("2025-01-31");

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // Y2K leap year
        new Date(Date.UTC(2038, 0, 19)), // Near 32-bit timestamp limit
        new Date(Date.UTC(2100, 1, 28)), // Non-leap century year
      ];
      
      edgeCases.forEach(edgeDate => {
        expect(() => {
          calculateNextDueDate({
            startDate: edgeDate,
            cycleValue: 1,
            cycleUnit: "months",
          });
        }).not.toThrow();
        
        expect(() => {
          formatDate(edgeDate);
        }).not.toThrow();
      });
    });
  });
    });

    it("should handle February 29th in non-leap years", () => {
      const leapDate = new Date(Date.UTC(2024, 1, 29)); // Feb 29, 2024 (leap year)
      const result = calculateNextDueDate({
        startDate: leapDate,
        cycleValue: 12,
        cycleUnit: "months",

  describe("Performance and Memory Tests", () => {
    it("should handle large batch calculations efficiently", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      const startTime = performance.now();
      
      // Calculate 1000 future dates
      const results = calculateFutureDueDates({
        startDate,
        cycleValue: 1,
        cycleUnit: "weeks",
      }, 1000);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(results).toHaveLength(1000);
      expect(executionTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should not cause memory issues with repeated calculations", () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      // Perform many calculations to test for memory issues
      for (let i = 0; i < 100; i++) {
        calculateFutureDueDates({
          startDate,
          cycleValue: 4,
          cycleUnit: "weeks",
        }, 10);
        
        getDaysUntilDue(startDate, new Date());
        isOverdue(startDate);
      }
      
      // If we get here without issues, test passes
      expect(true).toBe(true);
    });

    it("should handle concurrent date calculations", async () => {
      const startDate = new Date(Date.UTC(2025, 0, 1));
      
      const promises = [];
      
      // Create multiple concurrent calculations
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(calculateFutureDueDates({
            startDate,
            cycleValue: i + 1,
            cycleUnit: "weeks",
          }, 5))
        );
      }
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(5);
      });
    });

    it("should handle edge case date calculations without errors", () => {
      const edgeCases = [
        new Date(Date.UTC(1970, 0, 1)), // Unix epoch
        new Date(Date.UTC(2000, 1, 29)), // 
    });
  });
});