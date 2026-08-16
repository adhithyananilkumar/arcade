/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Core
 *
 * Purpose:
 * Single authoritative "resume a session" routine. Attempts a cookie-based
 * token refresh, hydrates the auth store, and falls back to fetching the
 * full profile via UserService when the refresh response didn't include
 * one. Both AuthInitializer (app-wide) and ProtectedLayout (authenticated
 * route group) call this instead of each independently reimplementing the
 * same refresh+setAuth+getMe-fallback sequence.
 * ------------------------------------------------------------------
 */

import { useAuthStore, type User } from '@/infrastructure/auth/auth.store';
import { AuthService } from '@/infrastructure/auth/auth.service';
import { UserService } from '@/domains/identity';

export async function initializeSession(): Promise<void> {
  const { setAuth, clearAuth } = useAuthStore.getState();
  try {
    const { accessToken, user: refreshedUser } = await AuthService.refresh();
    let user: User | undefined = refreshedUser;
    setAuth(user || useAuthStore.getState().user || ({} as User), accessToken);

    if (!user || Object.keys(user).length === 0) {
      try {
        user = await UserService.getMe();
        setAuth(user, accessToken);
      } catch (err) {
        console.error('Failed to fetch user profile after refresh', err);
      }
    }
  } catch {
    clearAuth();
  }
}
