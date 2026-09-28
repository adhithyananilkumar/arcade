import { describe, it, expect } from 'vitest';
import {
  getAllCountries,
  getMaxNationalLength,
  parsePhoneNumberInput,
  validatePhoneNumber,
  getFlagEmoji,
} from './phone';

describe('Phone Utilities', () => {
  it('returns all supported countries with flags and dial codes', () => {
    const countries = getAllCountries();
    expect(countries.length).toBeGreaterThan(200);

    const india = countries.find((c) => c.code === 'IN');
    expect(india).toBeDefined();
    expect(india?.dialCode).toBe('+91');
    expect(india?.flag).toBe('🇮🇳');
    expect(india?.maxNationalLength).toBe(10);

    const us = countries.find((c) => c.code === 'US');
    expect(us).toBeDefined();
    expect(us?.dialCode).toBe('+1');
    expect(us?.flag).toBe('🇺🇸');
    expect(us?.maxNationalLength).toBe(10);

    const uae = countries.find((c) => c.code === 'AE');
    expect(uae).toBeDefined();
    expect(uae?.dialCode).toBe('+971');
    expect(uae?.flag).toBe('🇦🇪');
    expect(uae?.maxNationalLength).toBe(9);
  });

  describe('India (+91) numbering rules', () => {
    it('accepts valid 10-digit Indian numbers', () => {
      const result = validatePhoneNumber('9745112365', 'IN');
      expect(result.isValid).toBe(true);
      expect(result.formatted).toBe('+91 9745112365');
    });

    it('rejects 11-digit numbers for India', () => {
      const result = validatePhoneNumber('97451123658', 'IN');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Enter a valid phone number for the selected country.');
    });

    it('rejects numbers shorter than 10 digits for India', () => {
      const result = validatePhoneNumber('97451123', 'IN');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Enter a valid phone number for the selected country.');
    });

    it('enforces max length of 10 digits', () => {
      expect(getMaxNationalLength('IN')).toBe(10);
    });
  });

  describe('International countries', () => {
    it('validates US numbers (10 digits)', () => {
      expect(validatePhoneNumber('2025550143', 'US').isValid).toBe(true);
      expect(validatePhoneNumber('20255501439', 'US').isValid).toBe(false);
    });

    it('validates UK numbers (10 digits)', () => {
      expect(validatePhoneNumber('7911123456', 'GB').isValid).toBe(true);
      expect(validatePhoneNumber('791112345678', 'GB').isValid).toBe(false);
    });

    it('validates UAE numbers (9 digits)', () => {
      expect(validatePhoneNumber('501234567', 'AE').isValid).toBe(true);
      expect(validatePhoneNumber('5012345678', 'AE').isValid).toBe(false);
    });

    it('validates Australia numbers (9 digits)', () => {
      expect(validatePhoneNumber('412345678', 'AU').isValid).toBe(true);
      expect(validatePhoneNumber('4123456789', 'AU').isValid).toBe(false);
    });
  });

  describe('E.164 compliance', () => {
    it('rejects complete numbers exceeding 15 digits', () => {
      const result = validatePhoneNumber('1234567890123456', 'US');
      expect(result.isValid).toBe(false);
    });
  });

  describe('Existing phone number parsing & normalization', () => {
    it('detects country code from existing stored international numbers', () => {
      const inParsed = parsePhoneNumberInput('+91 97451 12365');
      expect(inParsed.country).toBe('IN');
      expect(inParsed.nationalNumber).toBe('9745112365');

      const usParsed = parsePhoneNumberInput('+1 (202) 555-0143');
      expect(usParsed.country).toBe('US');
      expect(usParsed.nationalNumber).toBe('2025550143');

      const aeParsed = parsePhoneNumberInput('+971501234567');
      expect(aeParsed.country).toBe('AE');
      expect(aeParsed.nationalNumber).toBe('501234567');
    });

    it('falls back to default country for raw digits', () => {
      const raw = parsePhoneNumberInput('9745112365', 'IN');
      expect(raw.country).toBe('IN');
      expect(raw.nationalNumber).toBe('9745112365');
    });
  });
});
