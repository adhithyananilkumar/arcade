import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isJwtExpired, getValidAccessToken } from './jwt';
import { useAuthStore } from './auth.store';
import { AuthService } from './auth.service';

function createMockJwt(expSecondsFromNow: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(Date.now() / 1000) + expSecondsFromNow;
  const payload = btoa(JSON.stringify({ sub: 'user-1', exp }));
  return `${header}.${payload}.signature`;
}

describe('jwt utils', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    vi.restoreAllMocks();
  });

  describe('isJwtExpired', () => {
    it('returns true for null, empty or invalid strings', () => {
      expect(isJwtExpired('')).toBe(true);
      expect(isJwtExpired('invalid-token')).toBe(true);
      // @ts-expect-error test non-string
      expect(isJwtExpired(null)).toBe(true);
    });

    it('returns true for expired token', () => {
      const expiredToken = createMockJwt(-60); // 1 minute ago
      expect(isJwtExpired(expiredToken)).toBe(true);
    });

    it('returns true for token expiring within skew buffer', () => {
      const expiringSoonToken = createMockJwt(10); // expires in 10s, skew is 30s
      expect(isJwtExpired(expiringSoonToken, 30)).toBe(true);
    });

    it('returns false for unexpired token outside skew buffer', () => {
      const validToken = createMockJwt(600); // 10 minutes from now
      expect(isJwtExpired(validToken, 30)).toBe(false);
    });
  });

  describe('getValidAccessToken', () => {
    it('returns existing token if unexpired', async () => {
      const validToken = createMockJwt(600);
      useAuthStore.getState().setAuth(
        { id: '1', email: 'test@example.com', fullName: 'Test' },
        validToken
      );

      const token = await getValidAccessToken();
      expect(token).toBe(validToken);
    });

    it('refreshes token if current token is expired', async () => {
      const expiredToken = createMockJwt(-60);
      const freshToken = createMockJwt(900);
      useAuthStore.getState().setAuth(
        { id: '1', email: 'test@example.com', fullName: 'Test' },
        expiredToken
      );

      vi.spyOn(AuthService, 'refresh').mockResolvedValue({
        accessToken: freshToken,
        user: { id: '1', email: 'test@example.com', fullName: 'Test' },
      });

      const token = await getValidAccessToken();
      expect(token).toBe(freshToken);
      expect(useAuthStore.getState().accessToken).toBe(freshToken);
    });

    it('clears auth if refresh fails', async () => {
      const expiredToken = createMockJwt(-60);
      useAuthStore.getState().setAuth(
        { id: '1', email: 'test@example.com', fullName: 'Test' },
        expiredToken
      );

      vi.spyOn(AuthService, 'refresh').mockRejectedValue(new Error('Refresh failed'));

      const token = await getValidAccessToken();
      expect(token).toBeNull();
      expect(useAuthStore.getState().accessToken).toBeNull();
      expect(useAuthStore.getState().status).toBe('unauthenticated');
    });
  });
});
