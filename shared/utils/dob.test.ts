import { describe, it, expect } from 'vitest';
import {
  calculateAge,
  validateDateOfBirth,
  getMaxAllowedDobString,
  getTodayDateString,
  UNDER_AGE_ERROR_MESSAGE,
  FUTURE_DATE_ERROR_MESSAGE,
} from './dob';

describe('Date of Birth & Age Restriction Utilities', () => {
  // Reference date: 2026-09-28 (11:54 AM local time)
  const refDate = new Date('2026-09-28T12:00:00');

  describe('calculateAge', () => {
    it('returns exact age on the exact 16th birthday', () => {
      // Born 2010-09-28: turned 16 today
      expect(calculateAge('2010-09-28', refDate)).toBe(16);
    });

    it('returns 15 if the 16th birthday is tomorrow', () => {
      // Born 2010-09-29: turns 16 tomorrow
      expect(calculateAge('2010-09-29', refDate)).toBe(15);
    });

    it('returns 16 if the 16th birthday was yesterday', () => {
      // Born 2010-09-27: turned 16 yesterday
      expect(calculateAge('2010-09-27', refDate)).toBe(16);
    });

    it('returns exact age for someone born in another month', () => {
      // Born 2010-12-01: still 15
      expect(calculateAge('2010-12-01', refDate)).toBe(15);
      // Born 2010-01-01: 16
      expect(calculateAge('2010-01-01', refDate)).toBe(16);
      // Born 2000-05-15: 26
      expect(calculateAge('2000-05-15', refDate)).toBe(26);
    });

    it('returns -1 for future dates', () => {
      expect(calculateAge('2026-10-01', refDate)).toBe(-1);
      expect(calculateAge('2030-01-01', refDate)).toBe(-1);
    });
  });

  describe('validateDateOfBirth (minimum 16 years)', () => {
    it('validates a user who is exactly 16 today', () => {
      const res = validateDateOfBirth('2010-09-28', 16, true, refDate);
      expect(res.isValid).toBe(true);
      expect(res.age).toBe(16);
      expect(res.error).toBeUndefined();
    });

    it('rejects a user who turns 16 tomorrow with clear message', () => {
      const res = validateDateOfBirth('2010-09-29', 16, true, refDate);
      expect(res.isValid).toBe(false);
      expect(res.age).toBe(15);
      expect(res.error).toBe(UNDER_AGE_ERROR_MESSAGE);
    });

    it('rejects younger users (e.g. 14, 15 years old)', () => {
      const res14 = validateDateOfBirth('2012-03-10', 16, true, refDate);
      expect(res14.isValid).toBe(false);
      expect(res14.age).toBe(14);
      expect(res14.error).toBe(UNDER_AGE_ERROR_MESSAGE);

      const res15 = validateDateOfBirth('2011-05-20', 16, true, refDate);
      expect(res15.isValid).toBe(false);
      expect(res15.age).toBe(15);
      expect(res15.error).toBe(UNDER_AGE_ERROR_MESSAGE);
    });

    it('accepts older users (e.g. 25, 40 years old)', () => {
      const res = validateDateOfBirth('2000-01-01', 16, true, refDate);
      expect(res.isValid).toBe(true);
      expect(res.age).toBe(26);
    });

    it('rejects future dates with appropriate message', () => {
      const res = validateDateOfBirth('2026-10-15', 16, true, refDate);
      expect(res.isValid).toBe(false);
      expect(res.error).toBe(FUTURE_DATE_ERROR_MESSAGE);
    });

    it('handles empty dates when required', () => {
      const res = validateDateOfBirth('', 16, true, refDate);
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Date of birth is required.');
    });
  });

  describe('getMaxAllowedDobString and getTodayDateString', () => {
    it('calculates the exact maximum valid DOB string for 16 years old', () => {
      expect(getMaxAllowedDobString(16, refDate)).toBe('2010-09-28');
    });

    it('returns today date string for HTML max attribute', () => {
      expect(getTodayDateString(refDate)).toBe('2026-09-28');
    });
  });
});
