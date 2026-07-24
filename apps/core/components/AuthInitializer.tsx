'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthService } from '@/infrastructure/auth/auth.service';
// Statically imported (not dynamic) so the bypass below runs synchronously,
// before ProtectedLayout's own mount effect can race it with a real
// AuthService.refresh() call. Tree-shaken away when unused; harmless either
// way since it's just static JSON. See mock/README.md.
import mockSession from '@/mock/data/session.json';

export function AuthInitializer() {
  const { setAuth, clearAuth, setStatus, status } = useAuthStore();
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    // ---- DEV-ONLY AUTH BYPASS -------------------------------------------
    // Gated by NEXT_PUBLIC_AUTH_BYPASS. Only ever reachable when that env
    // var is literally the string "true" at build time, so it cannot be
    // active in a production build (see next.config.ts for the hard
    // build-time guard). Seeds the real auth store with a mock session from
    // mock/data/session.json so the rest of the app (including
    // ProtectedLayout) treats this as a normal authenticated session.
    if (process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true') {
      setAuth(mockSession.user, mockSession.accessToken);
      return;
    }
    // -----------------------------------------------------------------------

    const initAuth = async () => {
      try {
        const { accessToken, user } = await AuthService.refresh();
        setAuth(user || useAuthStore.getState().user!, accessToken);
      } catch (error) {
        // Refresh failed (or no token), set to unauthenticated
        clearAuth();
      }
    };

    if (status === 'loading') {
      initAuth();
    }
  }, [setAuth, clearAuth, status, setStatus]);

  return null;
}
