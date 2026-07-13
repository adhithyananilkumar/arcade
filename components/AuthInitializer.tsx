'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { AuthService } from '@/services/auth.service';

export function AuthInitializer() {
  const { setAuth, clearAuth, setStatus, status } = useAuthStore();
  const initRef = useRef(false);

  useEffect(() => {
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
  }, [setAuth, clearAuth, status, setStatus]);

  return null;
}
