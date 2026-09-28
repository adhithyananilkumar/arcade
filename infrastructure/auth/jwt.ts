import { useAuthStore, type User } from './auth.store';
import { AuthService } from './auth.service';

/**
 * Checks whether a JWT is expired or within `skewSeconds` of expiring.
 * Does not verify signature (client-side only).
 */
export function isJwtExpired(token: string, skewSeconds = 30): boolean {
  if (!token || typeof token !== 'string') return true;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const { exp } = JSON.parse(jsonPayload);
    if (typeof exp !== 'number') return false;
    return Date.now() >= (exp - skewSeconds) * 1000;
  } catch {
    return true;
  }
}

/**
 * Returns a valid, non-expired access token. If the current token in the auth store
 * is missing or expired, it automatically refreshes it via the BFF refresh route.
 * If refresh fails, it clears the auth store and returns null.
 */
export async function getValidAccessToken(): Promise<string | null> {
  const state = useAuthStore.getState();
  let token = state.accessToken;

  if (token && !isJwtExpired(token)) {
    return token;
  }

  try {
    const res = await AuthService.refresh();
    if (res?.accessToken) {
      state.setAuth(res.user || state.user || ({} as User), res.accessToken);
      return res.accessToken;
    }
  } catch {
    state.clearAuth();
    return null;
  }

  return null;
}
