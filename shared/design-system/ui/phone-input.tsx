'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ChevronDown, Search, Check, AlertCircle } from 'lucide-react';
import { type CountryCode } from 'libphonenumber-js';
import {
  getAllCountries,
  POPULAR_COUNTRY_CODES,
  getMaxNationalLength,
  parsePhoneNumberInput,
  validatePhoneNumber,
  type Country,
} from '@/shared/utils/phone';
import { cn } from '@/shared/utils/utils';

export interface PhoneInputProps {
  value?: string;
  onChange?: (value: string, meta: { isValid: boolean; country: CountryCode; nationalNumber: string }) => void;
  onValidate?: (isValid: boolean) => void;
  defaultCountry?: CountryCode;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  variant?: 'default' | 'compact' | 'auth' | 'underline';
  showError?: boolean;
  errorMessage?: string;
  autoFocus?: boolean;
}

export function PhoneInput({
  value = '',
  onChange,
  onValidate,
  defaultCountry = 'IN',
  disabled = false,
  required = false,
  placeholder,
  className,
  id,
  name,
  variant = 'default',
  showError = true,
  errorMessage,
  autoFocus = false,
}: PhoneInputProps) {
  // Parse initial value
  const initial = useMemo(
    () => parsePhoneNumberInput(value, defaultCountry),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [selectedCountryCode, setSelectedCountryCode] = useState<CountryCode>(initial.country);
  const [nationalNumber, setNationalNumber] = useState<string>(initial.nationalNumber);
  const [isTouched, setIsTouched] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const numberInputRef = useRef<HTMLInputElement>(null);

  const allCountries = useMemo(() => getAllCountries(), []);

  const selectedCountry = useMemo(() => {
    return allCountries.find((c) => c.code === selectedCountryCode) || allCountries[0];
  }, [allCountries, selectedCountryCode]);

  const maxDigits = useMemo(() => {
    return getMaxNationalLength(selectedCountryCode);
  }, [selectedCountryCode]);

  // Sync internal state if external value changes significantly from outside
  useEffect(() => {
    if (value === undefined) return;
    const parsed = parsePhoneNumberInput(value, selectedCountryCode);
    if (parsed.country !== selectedCountryCode) {
      setSelectedCountryCode(parsed.country);
    }
    if (parsed.nationalNumber !== nationalNumber) {
      setNationalNumber(parsed.nationalNumber);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // Validation
  const validation = useMemo(() => {
    return validatePhoneNumber(nationalNumber, selectedCountryCode, required);
  }, [nationalNumber, selectedCountryCode, required]);

  // Notify parent of validity changes
  useEffect(() => {
    onValidate?.(validation.isValid);
  }, [validation.isValid, onValidate]);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    if (!isDropdownOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen) {
      setSearchQuery('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isDropdownOpen]);

  // Filtered countries for dropdown
  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allCountries;
    return allCountries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dialCode.includes(q)
    );
  }, [allCountries, searchQuery]);

  const popularCountries = useMemo(() => {
    if (searchQuery.trim()) return [];
    return POPULAR_COUNTRY_CODES.map((code) =>
      allCountries.find((c) => c.code === code)
    ).filter(Boolean) as Country[];
  }, [allCountries, searchQuery]);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountryCode(country.code);
    setIsDropdownOpen(false);

    // If existing digits exceed new country's max, trim it
    const trimmedDigits = nationalNumber.slice(0, country.maxNationalLength);
    setNationalNumber(trimmedDigits);

    const val = validatePhoneNumber(trimmedDigits, country.code, required);
    onChange?.(val.formatted, {
      isValid: val.isValid,
      country: country.code,
      nationalNumber: trimmedDigits,
    });

    setTimeout(() => {
      numberInputRef.current?.focus();
    }, 50);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTouched(true);
    const raw = e.target.value;
    const digitsOnly = raw.replace(/\D/g, '');
    const limited = digitsOnly.slice(0, maxDigits);

    setNationalNumber(limited);

    const val = validatePhoneNumber(limited, selectedCountryCode, required);
    onChange?.(val.formatted, {
      isValid: val.isValid,
      country: selectedCountryCode,
      nationalNumber: limited,
    });
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    setIsTouched(true);
    const pastedText = e.clipboardData.getData('text');
    if (!pastedText) return;

    // Check if pasted text contains an international code with '+'
    if (pastedText.trim().startsWith('+')) {
      const parsed = parsePhoneNumberInput(pastedText, selectedCountryCode);
      setSelectedCountryCode(parsed.country);
      setNationalNumber(parsed.nationalNumber);

      const val = validatePhoneNumber(parsed.nationalNumber, parsed.country, required);
      onChange?.(val.formatted, {
        isValid: val.isValid,
        country: parsed.country,
        nationalNumber: parsed.nationalNumber,
      });
      return;
    }

    // Otherwise treat as national digits
    const digits = pastedText.replace(/\D/g, '').slice(0, maxDigits);
    setNationalNumber(digits);

    const val = validatePhoneNumber(digits, selectedCountryCode, required);
    onChange?.(val.formatted, {
      isValid: val.isValid,
      country: selectedCountryCode,
      nationalNumber: digits,
    });
  };

  const displayPlaceholder = useMemo(() => {
    if (placeholder) return placeholder;
    if (selectedCountryCode === 'IN') return '98765 43210';
    if (selectedCountryCode === 'US' || selectedCountryCode === 'CA') return '202 555 0143';
    if (selectedCountryCode === 'GB') return '7911 123456';
    if (selectedCountryCode === 'AE') return '50 123 4567';
    if (selectedCountryCode === 'AU') return '412 345 678';
    return `${maxDigits} digits`;
  }, [placeholder, selectedCountryCode, maxDigits]);

  const hasError = isTouched && !validation.isValid && (required || nationalNumber.length > 0);
  const activeError = errorMessage || validation.error;

  // Variant-specific styles
  const isCompact = variant === 'compact';
  const isAuth = variant === 'auth';
  const isUnderline = variant === 'underline';

  return (
    <div className={cn("relative w-full", className)}>
      <div
        className={cn(
          "relative flex items-center transition-all duration-200",
          isUnderline && "w-full py-3 bg-transparent border-b border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-white text-base focus-within:border-[#205ca8] dark:focus-within:border-sky-400 rounded-none shadow-none transition-colors",
          isCompact && "rounded-lg border border-slate-300 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 px-1.5 py-1 text-xs focus-within:ring-1 focus-within:ring-sky-500 focus-within:border-sky-500",
          isAuth && "rounded-[20px] bg-transparent text-[15px]",
          !isCompact && !isAuth && !isUnderline && "rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1.5 text-sm focus-within:ring-1 focus-within:ring-sky-500 focus-within:border-sky-500 shadow-2xs",
          hasError && (isUnderline ? "border-red-500 dark:border-red-500 focus-within:border-red-500" : "border-red-500 dark:border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20"),
          disabled && "opacity-60 cursor-not-allowed bg-slate-100 dark:bg-neutral-800"
        )}
      >
        {/* Country Selector Button */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className={cn(
              "flex items-center transition-colors focus:outline-none",
              isUnderline
                ? "py-0 px-0 hover:opacity-80 text-slate-900 dark:text-white select-none leading-normal"
                : "gap-1.5 rounded-lg px-2 py-1 text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800",
              isCompact && "px-1.5 py-0.5 text-xs",
              disabled && "hover:bg-transparent cursor-not-allowed"
            )}
            title={`${selectedCountry.name} (${selectedCountry.dialCode})`}
            aria-label="Select country code"
            aria-expanded={isDropdownOpen}
          >
            {isUnderline ? (
              <span className="flex items-center gap-1.5 text-base font-normal text-slate-900 dark:text-white leading-normal">
                <span>{selectedCountry.code}</span>
                <span>{selectedCountry.dialCode}</span>
                <ChevronDown size={14} className={cn("text-slate-400 transition-transform duration-150 shrink-0", isDropdownOpen && "rotate-180")} />
              </span>
            ) : (
              <>
                <span className={cn("text-base leading-none select-none", isCompact && "text-sm")}>
                  {selectedCountry.flag}
                </span>
                <span className={cn("font-bold text-slate-700 dark:text-neutral-200 text-xs", isCompact && "text-[11px]")}>
                  {selectedCountry.dialCode}
                </span>
                <ChevronDown size={isCompact ? 10 : 12} className={cn("text-slate-400 transition-transform duration-150", isDropdownOpen && "rotate-180")} />
              </>
            )}
          </button>

          {/* Country Dropdown Menu */}
          {isDropdownOpen && (
            <div
              className="absolute left-0 top-full mt-2 z-50 w-72 max-w-[85vw] rounded-2xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            >
              {/* Search bar */}
              <div className="p-2.5 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50">
                <div className="relative flex items-center">
                  <Search size={14} className="absolute left-2.5 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search country or code..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Country List */}
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-50 dark:divide-neutral-800/40 overscroll-contain">
                {popularCountries.length > 0 && (
                  <div className="p-1">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                      Popular
                    </div>
                    {popularCountries.map((c) => (
                      <button
                        key={`pop-${c.code}`}
                        type="button"
                        onClick={() => handleCountrySelect(c)}
                        className={cn(
                          "w-full flex items-center justify-between px-2.5 py-2 text-left text-xs rounded-lg transition-colors",
                          c.code === selectedCountryCode
                            ? "bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-300 font-bold"
                            : "hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base leading-none shrink-0">{c.flag}</span>
                          <span className="truncate">{c.name}</span>
                        </div>
                        <span className="font-mono text-slate-400 shrink-0 ml-2">{c.dialCode}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="p-1">
                  {popularCountries.length > 0 && (
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                      All countries
                    </div>
                  )}
                  {filteredCountries.length === 0 ? (
                    <div className="px-3 py-4 text-center text-xs text-slate-400">
                      No country found
                    </div>
                  ) : (
                    filteredCountries.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => handleCountrySelect(c)}
                        className={cn(
                          "w-full flex items-center justify-between px-2.5 py-2 text-left text-xs rounded-lg transition-colors",
                          c.code === selectedCountryCode
                            ? "bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-300 font-bold"
                            : "hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base leading-none shrink-0">{c.flag}</span>
                          <span className="truncate">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span className="font-mono text-slate-400">{c.dialCode}</span>
                          {c.code === selectedCountryCode && (
                            <Check size={12} className="text-sky-600 dark:text-sky-400" />
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vertical divider */}
        <span className={cn(
          "w-px shrink-0 self-center",
          isUnderline ? "h-5 bg-slate-300 dark:bg-neutral-600 mx-3" : "h-4 bg-slate-200 dark:bg-neutral-700 mx-1.5"
        )} />

        {/* National Number Input */}
        <input
          ref={numberInputRef}
          id={id}
          name={name}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={nationalNumber}
          onChange={handleInputChange}
          onPaste={handlePaste}
          onBlur={() => setIsTouched(true)}
          disabled={disabled}
          required={required}
          maxLength={maxDigits}
          placeholder={displayPlaceholder}
          autoFocus={autoFocus}
          className={cn(
            "w-full min-w-0 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500",
            isUnderline && "text-base py-0 font-normal leading-normal tracking-normal placeholder:font-normal placeholder:text-slate-400",
            isCompact && "text-xs py-0.5 font-medium",
            isAuth && "text-[15px] font-bold placeholder:font-medium",
            !isCompact && !isAuth && !isUnderline && "text-sm py-1 font-medium"
          )}
        />
      </div>

      {/* Error message */}
      {showError && hasError && activeError && (
        <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-600 dark:text-red-400 animate-in fade-in duration-150">
          <AlertCircle size={12} className="shrink-0" />
          <span>{activeError}</span>
        </div>
      )}
    </div>
  );
}
