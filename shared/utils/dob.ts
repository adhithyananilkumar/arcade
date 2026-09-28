/**
 * Age & Date of Birth validation utilities
 * Enforces a strict minimum age requirement (default: 16 years old)
 * using the complete calendar date (day, month, year).
 */

export const MIN_AGE_YEARS = 16;
export const UNDER_AGE_ERROR_MESSAGE = 'You must be at least 16 years old to continue.';
export const FUTURE_DATE_ERROR_MESSAGE = 'Date of birth cannot be in the future.';

/**
 * Returns today's date formatted as YYYY-MM-DD.
 */
export function getTodayDateString(referenceDate: Date = new Date()): string {
  const y = referenceDate.getFullYear();
  const m = String(referenceDate.getMonth() + 1).padStart(2, '0');
  const d = String(referenceDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns the latest date of birth (YYYY-MM-DD) that satisfies the minimum age.
 * For example, if today is 2026-09-28 and minAge is 16, returns 2010-09-28.
 */
export function getMaxAllowedDobString(minAgeYears: number = MIN_AGE_YEARS, referenceDate: Date = new Date()): string {
  const y = referenceDate.getFullYear() - minAgeYears;
  const m = String(referenceDate.getMonth() + 1).padStart(2, '0');
  const d = String(referenceDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Calculates exact age in full years from a complete date of birth (YYYY-MM-DD).
 * Takes into account whether the birthday has already occurred on the current date.
 * Someone who turns 16 tomorrow is still considered under 16 today.
 */
export function calculateAge(
  dobString: string | undefined | null,
  referenceDate: Date = new Date()
): number {
  if (!dobString || !dobString.trim()) return -1;

  const parts = dobString.trim().split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return -1;

  const [birthYear, birthMonth, birthDay] = parts;
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth() + 1;
  const currentDay = referenceDate.getDate();

  // If date is in the future
  if (
    birthYear > currentYear ||
    (birthYear === currentYear && birthMonth > currentMonth) ||
    (birthYear === currentYear && birthMonth === currentMonth && birthDay > currentDay)
  ) {
    return -1;
  }

  let age = currentYear - birthYear;
  // If the birthday has not occurred yet this year, decrement age
  if (
    birthMonth > currentMonth ||
    (birthMonth === currentMonth && birthDay > currentDay)
  ) {
    age--;
  }

  return age;
}

export interface DobValidationResult {
  isValid: boolean;
  age: number;
  error?: string;
}

/**
 * Validates that a date of birth satisfies the minimum age restriction.
 */
export function validateDateOfBirth(
  dobString: string | undefined | null,
  minAgeYears: number = MIN_AGE_YEARS,
  required: boolean = true,
  referenceDate: Date = new Date()
): DobValidationResult {
  if (!dobString || !dobString.trim()) {
    if (required) {
      return { isValid: false, age: -1, error: 'Date of birth is required.' };
    }
    return { isValid: true, age: 0 };
  }

  const parts = dobString.trim().split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    return { isValid: false, age: -1, error: 'Please enter a valid date of birth.' };
  }

  const [birthYear, birthMonth, birthDay] = parts;
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth() + 1;
  const currentDay = referenceDate.getDate();

  // Check future date
  if (
    birthYear > currentYear ||
    (birthYear === currentYear && birthMonth > currentMonth) ||
    (birthYear === currentYear && birthMonth === currentMonth && birthDay > currentDay)
  ) {
    return {
      isValid: false,
      age: -1,
      error: FUTURE_DATE_ERROR_MESSAGE,
    };
  }

  const age = calculateAge(dobString, referenceDate);

  if (age < minAgeYears) {
    return {
      isValid: false,
      age,
      error: UNDER_AGE_ERROR_MESSAGE,
    };
  }

  return {
    isValid: true,
    age,
  };
}
