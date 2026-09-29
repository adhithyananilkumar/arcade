import { describe, expect, it } from 'vitest';
import {
  formatNicknameInput,
  greetingName,
  navPillName,
  nicknameError,
  nicknameLength,
  suggestNickname,
} from './nickname';

describe('formatNicknameInput', () => {
  it.each([
    ['adhi', 'Adhi'],
    ['ADHI', 'Adhi'],
    ['dr. rubin', 'Dr. rubin'],
    ['Dr. Rubin', 'Dr. Rubin'],
    ['Dr. RUBIN', 'Dr. Rubin'],
    ['Dr.Rubin', 'Dr.rubin'],
    ['  a  b', 'A b'],
    ['Adhi2_!', 'Adhi'],
    ['.-adhi', 'Adhi'],
    ['Jo .x', 'Jo x'],
    ['Mary-Jo', 'Mary-jo'],
  ])('%s → %s', (raw, expected) => {
    expect(formatNicknameInput(raw)).toBe(expected);
  });

  it('stops at eight characters, not counting spaces', () => {
    expect(formatNicknameInput('Adhithyan')).toBe('Adhithya');
    expect(formatNicknameInput('Dr. Rubins')).toBe('Dr. Rubin');
    expect(nicknameLength('Dr. Rubin')).toBe(8);
  });

  it('keeps one trailing space so the next word can be typed', () => {
    expect(formatNicknameInput('Dr. ')).toBe('Dr. ');
  });

  it('always produces something the server accepts once long enough', () => {
    for (const raw of ['dr. RUBIN', 'aDHI', 'x  Y z', 'ÉMILE', 'o\'neil']) {
      const formatted = formatNicknameInput(raw).trim();
      if (nicknameLength(formatted) >= 2) expect(nicknameError(formatted)).toBeNull();
    }
  });
});

describe('nicknameError', () => {
  it.each(['Jo', 'Adhithya', 'Dr. Rubin', 'Dr. rubin', ' Adhi '])('accepts %s', (v) => {
    expect(nicknameError(v)).toBeNull();
  });

  it.each(['', 'A', 'adhi', 'Dr. RUBIN', 'Adhithyan', 'AdHi', 'Dr  Rubin'])('rejects %s', (v) => {
    expect(nicknameError(v)).not.toBeNull();
  });
});

describe('suggestNickname', () => {
  it('sentence-cases a first name that fits', () => {
    expect(suggestNickname('ADHI')).toBe('Adhi');
  });

  it('suggests nothing rather than cutting a long name short', () => {
    expect(suggestNickname('Adhithyan')).toBe('');
  });
});

describe('display names', () => {
  it('prefers the nickname', () => {
    const user = { nickname: 'Dr. Rubin', firstName: 'RUBIN' };
    expect(greetingName(user)).toBe('Dr. Rubin');
    expect(navPillName(user)).toBe('dr. rubin');
  });

  it('falls back to the first name, first letter capital and the rest lowercase', () => {
    const user = { nickname: null, firstName: 'ADHITHYAN' };
    expect(greetingName(user)).toBe('Adhithyan');
    expect(navPillName(user)).toBe('adhithyan');
  });
});
