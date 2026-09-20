'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { initializeSession } from '@/apps/core/lib/session';

export function AuthInitializer() {
  const status = useAuthStore((s) => s.status);
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

    if (status === 'loading') {
      initializeSession();
    }
  }, [status, pathname]);

  return null;
}
