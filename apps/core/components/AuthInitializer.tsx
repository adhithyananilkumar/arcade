'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthService } from '@/infrastructure/auth/auth.service';

export function AuthInitializer() {
  const { setAuth, clearAuth, setStatus, status } = useAuthStore();
  const pathname = usePathname();
  const initRef = useRef(false);

  useEffect(() => {
    // /oauth2/redirect performs its own explicit auth handshake using the
    // token in the URL. Running the cookie-based refresh here too races
    // it: if this refresh resolves after that page's setAuth and fails
    // (routine right after a first-time OAuth login), its clearAuth()
    // clobbers the session the redirect handler just established, and the
    // user lands back on the public landing page instead of the dashboard.
    if (pathname?.startsWith('/oauth2/redirect')) return;

    if (initRef.current) return;
    initRef.current = true;

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
  }, [setAuth, clearAuth, status, setStatus, pathname]);

  return null;
}
