import { describe, expect, it } from 'vitest';
import { refreshCookieOptions } from './refreshCookie';

const req = (url: string, headers: Record<string, string> = {}) => new Request(url, { headers });

describe('refreshCookieOptions', () => {
  it('is not Secure over plain http, so browsers on a LAN IP keep the cookie', () => {
    expect(refreshCookieOptions(req('http://10.25.9.242:3000/api/internal/auth/login')).secure).toBe(false);
  });

  it('is Secure over https', () => {
    expect(refreshCookieOptions(req('https://arcade.example/api/internal/auth/login')).secure).toBe(true);
  });

  it('trusts the proxy protocol behind TLS termination', () => {
    const r = req('http://internal:3000/api/internal/auth/login', { 'x-forwarded-proto': 'https, http' });
    expect(refreshCookieOptions(r).secure).toBe(true);
  });
});
