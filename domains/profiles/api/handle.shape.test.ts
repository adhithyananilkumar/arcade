import { describe, expect, it } from 'vitest';
import {
  HANDLE_MAX_LENGTH,
  HANDLE_MIN_LENGTH,
  handleShapeError,
  normalizeHandle,
} from './handle.service';

/**
 * Pins the client-side handle shape check to the backend's rule.
 *
 * The handle shape is stated in three places — the `platform_handles` CHECK constraints,
 * `PlatformHandleService`, and this file. The backend keeps its own two in step with
 * `HandleShapeContractTest`, which reads the migrations and compares them to the service. That
 * test cannot see this repository, so this is the third leg: an explicit table of verdicts that
 * fails the moment someone changes the client rule on its own.
 *
 * This layer is only a typing-time convenience — the server validates independently and its
 * answer always wins — so a mismatch here is not a data-integrity bug. It is a UX one: a client
 * that is stricter than the server refuses names the user could actually have, and one that is
 * more permissive lets them type a name that will be rejected on submit.
 *
 * The rule, as of V307: 2–30 characters, starts and ends alphanumeric, inner `.`/`_`/`-`
 * permitted but never two in a row.
 */
describe('handle shape (must match PlatformHandleService and platform_handles)', () => {
  it('agrees with the backend on the length bounds', () => {
    // Asserted as literals on purpose. The backend equivalents are pinned by
    // HandleShapeContractTest; if either side moves, exactly one of the two tests fails and
    // names the other.
    expect(HANDLE_MIN_LENGTH).toBe(2);
    expect(HANDLE_MAX_LENGTH).toBe(30);
  });

  const accepted = [
    'ab',
    'a1',
    '9z',
    'ada',
    'acme',
    'acme-hq',
    'acme.institute',
    'arcade_team_2025',
    'a'.repeat(HANDLE_MIN_LENGTH),
    'a'.repeat(HANDLE_MAX_LENGTH),
  ];

  it.each(accepted)('accepts %j', (candidate) => {
    expect(handleShapeError(candidate)).toBeNull();
  });

  const rejected: [string, string][] = [
    ['', 'required'],
    ['a', 'at least'],
    ['a'.repeat(HANDLE_MAX_LENGTH + 1), 'at most'],
    // Separators may not lead, trail, or double up.
    ['-ab', 'start and end'],
    ['ab-', 'start and end'],
    ['.ab', 'start and end'],
    ['ab.', 'start and end'],
    ['_ab', 'start and end'],
    ['ab_', 'start and end'],
    ['a--b', 'in a row'],
    ['a..b', 'in a row'],
    ['a__b', 'in a row'],
    ['a-.b', 'in a row'],
    // Characters outside the permitted set.
    ['a b', 'letters, numbers'],
    ['a@b', 'letters, numbers'],
    ['a/b', 'letters, numbers'],
    ['abc!', 'letters, numbers'],
  ];

  it.each(rejected)('rejects %j with a reason mentioning %j', (candidate, reason) => {
    const error = handleShapeError(candidate);
    expect(error).not.toBeNull();
    expect(error).toContain(reason);
  });

  describe('normalization', () => {
    it('strips a pasted @ and lowercases, so /Acme and /acme are one place', () => {
      expect(normalizeHandle('  @Acme_HQ ')).toBe('acme_hq');
    });

    it('validates the normalized form, not the raw input', () => {
      // A pasted "@Ada" is a valid handle even though the raw string starts with punctuation.
      expect(handleShapeError('@Ada')).toBeNull();
    });
  });
});
