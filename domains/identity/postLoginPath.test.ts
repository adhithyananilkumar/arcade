import { describe, expect, it } from 'vitest';
import { postLoginPath } from './postLoginPath';

describe('postLoginPath', () => {
  it('sends a user who has not finished onboarding straight to /onboarding, never via the landing page', () => {
    expect(postLoginPath({ onboardingCompleted: false })).toBe('/onboarding');
    // ...even when a return path was requested: onboarding comes first
    expect(postLoginPath({ onboardingCompleted: false }, '/courses/1')).toBe('/onboarding');
  });

  it('honours a same-origin return path once onboarded', () => {
    expect(postLoginPath({ onboardingCompleted: true }, '/courses/1?x=1')).toBe('/courses/1?x=1');
  });

  it('falls back to / when nothing is requested or onboarding state is unknown', () => {
    expect(postLoginPath({ onboardingCompleted: true })).toBe('/');
    expect(postLoginPath({}, null)).toBe('/');
  });

  it('rejects off-site and protocol-relative return paths', () => {
    expect(postLoginPath({ onboardingCompleted: true }, '//evil.com')).toBe('/');
    expect(postLoginPath({ onboardingCompleted: true }, '/' + String.fromCharCode(92) + 'evil.com')).toBe('/');
    expect(postLoginPath({ onboardingCompleted: true }, 'https://evil.com')).toBe('/');
  });
});
