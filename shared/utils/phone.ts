import {
  type CountryCode,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from 'libphonenumber-js';
import metadata from 'libphonenumber-js/metadata.min.json';

export interface Country {
  code: CountryCode;
  name: string;
  dialCode: string;
  flag: string;
  maxNationalLength: number;
}

/** Flag emoji from ISO 3166-1 alpha-2 code */
export function getFlagEmoji(countryCode: string): string {
  try {
    return String.fromCodePoint(
      ...[...countryCode.toUpperCase()].map((c) => 127397 + c.charCodeAt(0))
    );
  } catch {
    return '🌐';
  }
}

/** Specific mobile national length overrides */
const COUNTRY_MAX_LENGTHS: Partial<Record<CountryCode, number>> = {
  IN: 10, // India mobile numbers are strictly 10 digits
  US: 10, // US/NANP 10 digits
  CA: 10, // Canada 10 digits
  GB: 10, // UK mobile 10 digits
  AE: 9,  // UAE mobile 9 digits (e.g. 50 123 4567)
  AU: 9,  // Australia mobile 9 digits (e.g. 412 345 678)
  NZ: 10, // New Zealand 9-10 digits
  SG: 8,  // Singapore 8 digits
  MY: 10, // Malaysia 9-10 digits
  QA: 8,  // Qatar 8 digits
  SA: 9,  // Saudi Arabia 9 digits
  OM: 8,  // Oman 8 digits
  KW: 8,  // Kuwait 8 digits
  BH: 8,  // Bahrain 8 digits
  DE: 11, // Germany up to 11 digits
  FR: 9,  // France 9 digits
  IT: 10, // Italy 10 digits
  ES: 9,  // Spain 9 digits
  JP: 10, // Japan 10 digits
  CN: 11, // China 11 digits
};

export const POPULAR_COUNTRY_CODES: CountryCode[] = [
  'IN', // India
  'US', // United States
  'GB', // United Kingdom
  'AE', // UAE
  'AU', // Australia
  'CA', // Canada
  'SG', // Singapore
  'SA', // Saudi Arabia
  'DE', // Germany
];

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

/** Returns maximum allowed digits for the national phone number */
export function getMaxNationalLength(country: CountryCode): number {
  if (COUNTRY_MAX_LENGTHS[country]) {
    return COUNTRY_MAX_LENGTHS[country]!;
  }
  try {
    const code = getCountryCallingCode(country);
    const m = (metadata.countries as Record<string, any>)[country];
    const lengths = m ? m[3] : [];
    if (Array.isArray(lengths) && lengths.length > 0) {
      return Math.min(15 - code.length, Math.max(...lengths));
    }
    return Math.max(4, 15 - code.length);
  } catch {
    return 15;
  }
}

/** Memoized list of all supported countries */
let cachedCountries: Country[] | null = null;

export function getAllCountries(): Country[] {
  if (cachedCountries) return cachedCountries;

  const countryCodes = getCountries();
  const list: Country[] = [];

  for (const code of countryCodes) {
    try {
      const callingCode = getCountryCallingCode(code);
      const name = regionNames.of(code) || code;
      list.push({
        code,
        name,
        dialCode: `+${callingCode}`,
        flag: getFlagEmoji(code),
        maxNationalLength: getMaxNationalLength(code),
      });
    } catch {
      // Ignore invalid or unassigned codes
    }
  }

  // Sort alphabetically by country name
  list.sort((a, b) => a.name.localeCompare(b.name));
  cachedCountries = list;
  return list;
}

/** Parse an existing phone string into country and national number */
export function parsePhoneNumberInput(
  value: string | undefined | null,
  defaultCountry: CountryCode = 'IN'
): { country: CountryCode; nationalNumber: string } {
  if (!value) {
    return { country: defaultCountry, nationalNumber: '' };
  }

  const trimmed = value.trim();

  // If string starts with '+', parse international format
  if (trimmed.startsWith('+')) {
    try {
      const parsed = parsePhoneNumberFromString(trimmed);
      if (parsed && parsed.country) {
        const maxLen = getMaxNationalLength(parsed.country);
        const digits = (parsed.nationalNumber || '').slice(0, maxLen);
        return {
          country: parsed.country,
          nationalNumber: digits,
        };
      }
    } catch {
      // Fallback
    }

    // Try matching dial codes manually from available countries
    const countries = getAllCountries();
    // Sort descending by dialCode length to match e.g. +971 before +97
    const sorted = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length);
    for (const c of sorted) {
      if (trimmed.startsWith(c.dialCode)) {
        const remaining = trimmed.slice(c.dialCode.length).replace(/\D/g, '');
        return {
          country: c.code,
          nationalNumber: remaining.slice(0, c.maxNationalLength),
        };
      }
    }
  }

  // If raw digits without '+', treat as national number for default country
  const digits = trimmed.replace(/\D/g, '');
  const maxLen = getMaxNationalLength(defaultCountry);
  return {
    country: defaultCountry,
    nationalNumber: digits.slice(0, maxLen),
  };
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  formatted: string;
  fullNumber: string;
}

/**
 * Validates a phone number based on selected country and E.164 rules.
 */
export function validatePhoneNumber(
  nationalNumber: string,
  country: CountryCode,
  required: boolean = false
): ValidationResult {
  const digits = nationalNumber.replace(/\D/g, '');

  if (!digits) {
    if (required) {
      return {
        isValid: false,
        error: 'Phone number is required.',
        formatted: '',
        fullNumber: '',
      };
    }
    return {
      isValid: true,
      formatted: '',
      fullNumber: '',
    };
  }

  const callingCode = getCountryCallingCode(country);
  const maxNational = getMaxNationalLength(country);

  // India strict rule: mobile numbers must be 10 digits
  if (country === 'IN') {
    if (digits.length !== 10) {
      return {
        isValid: false,
        error: 'Enter a valid phone number for the selected country.',
        formatted: `+${callingCode} ${digits}`,
        fullNumber: `+${callingCode}${digits}`,
      };
    }
  } else if (digits.length > maxNational) {
    return {
      isValid: false,
      error: 'Enter a valid phone number for the selected country.',
      formatted: `+${callingCode} ${digits}`,
      fullNumber: `+${callingCode}${digits}`,
    };
  }

  // Complete international phone number must comply with E.164 maximum of 15 digits
  const fullNumber = `+${callingCode}${digits}`;
  if (callingCode.length + digits.length > 15) {
    return {
      isValid: false,
      error: 'Enter a valid phone number for the selected country.',
      formatted: `+${callingCode} ${digits}`,
      fullNumber,
    };
  }

  try {
    const parsed = parsePhoneNumberFromString(fullNumber, country);
    if (!parsed || !parsed.isValid()) {
      return {
        isValid: false,
        error: 'Enter a valid phone number for the selected country.',
        formatted: `+${callingCode} ${digits}`,
        fullNumber,
      };
    }

    return {
      isValid: true,
      formatted: `+${callingCode} ${digits}`,
      fullNumber,
    };
  } catch {
    return {
      isValid: false,
      error: 'Enter a valid phone number for the selected country.',
      formatted: `+${callingCode} ${digits}`,
      fullNumber,
    };
  }
}
