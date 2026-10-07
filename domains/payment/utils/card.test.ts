import { describe, expect, it } from 'vitest';
import {
  cvvLength,
  detectNetwork,
  expiryInFuture,
  formatCardNumber,
  formatExpiry,
  luhnValid,
  maskForDisplay,
  parseExpiry,
  resolveNetwork,
  vpaLooksValid,
} from './card';

describe('card helpers', () => {
  it('detects networks from leading digits', () => {
    expect(detectNetwork('4111')).toBe('visa');
    expect(detectNetwork('5500 0000')).toBe('mastercard');
    expect(detectNetwork('2221')).toBe('mastercard');
    expect(detectNetwork('3782')).toBe('amex');
    expect(detectNetwork('6521')).toBe('rupay');
    expect(detectNetwork('6011')).toBe('discover');
    expect(detectNetwork('')).toBe('');
  });

  it('prefers the gateway name, falling back to the prefix', () => {
    expect(resolveNetwork('RuPay', '4111')).toBe('rupay');
    expect(resolveNetwork('Diners Club', '')).toBe('diners');
    expect(resolveNetwork('', '4111')).toBe('visa');
  });

  it('groups digits, Amex 4-6-5', () => {
    expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111');
    expect(formatCardNumber('378282246310005')).toBe('3782 822463 10005');
    expect(formatCardNumber('4111-1111')).toBe('4111 1111');
  });

  it('checks Luhn', () => {
    expect(luhnValid('4111 1111 1111 1111')).toBe(true);
    expect(luhnValid('4111 1111 1111 1112')).toBe(false);
    expect(luhnValid('4111')).toBe(false);
  });

  it('formats and validates expiry', () => {
    expect(formatExpiry('0')).toBe('0');
    expect(formatExpiry('4')).toBe('04 / ');
    expect(formatExpiry('07')).toBe('07 / ');
    expect(formatExpiry('0728')).toBe('07 / 28');
    expect(formatExpiry('07 /', '07 / ')).toBe('07');
    expect(parseExpiry('13 / 28')).toBeNull();
    expect(parseExpiry('07 / 28')).toEqual({ month: '07', year: '28' });
    const now = new Date(2026, 9, 7);
    expect(expiryInFuture('10 / 26', now)).toBe(true);
    expect(expiryInFuture('09 / 26', now)).toBe(false);
  });

  it('knows CVV length and masks the card face', () => {
    expect(cvvLength('amex')).toBe(4);
    expect(cvvLength('visa')).toBe(3);
    expect(maskForDisplay('4111111111111111', 'visa')).toBe('•••• •••• •••• 1111');
    expect(maskForDisplay('41', 'visa')).toBe('•••• •••• •••• ••••');
  });

  it('shape-checks UPI IDs', () => {
    expect(vpaLooksValid('learner@okhdfcbank')).toBe(true);
    expect(vpaLooksValid('9876543210@ybl')).toBe(true);
    expect(vpaLooksValid('nobank@')).toBe(false);
    expect(vpaLooksValid('no-at-sign')).toBe(false);
  });
});
