'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Core
 *
 * Purpose:
 * Route guard layout ensuring a user is authenticated.
 *
 * Rules:
 * - Handles redirects to /sign.
 * - Delegates rendering to nested children.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthService } from '@/infrastructure/auth/auth.service';
import { UserService } from '@/domains/identity';
import { PebbleLoader } from '@/domains/identity/components/PebbleLoader';

function AuthTransition({ label }: { label: string }) {
  return (
    <div
      className="flex h-screen w-full flex-col items-center justify-center gap-2"
      style={{
        background:
          'linear-gradient(to bottom, #E9EEFB 0%, #F8FAFC 35%, #FFFFFF 70%, #EAF7EF 100%)',
      }}
    >
      <PebbleLoader label={label} />
    </div>
  );
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, status, setStatus, setAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (status === 'loading') {
        try {
          let { accessToken, user } = await AuthService.refresh();

          setAuth(user || {}, accessToken);

          if (!user || Object.keys(user).length === 0) {
            try {
              user = await UserService.getMe();
              setAuth(user, accessToken);
            } catch (err) {
              console.error('Failed to fetch user profile after refresh', err);
            }
          }
        } catch {
          setStatus('unauthenticated');
        }
      }
    };
    initAuth();
  }, [status, setAuth, setStatus]);

  useEffect(() => {
    if (!mounted) return;

    if (status === 'unauthenticated' && !pathname.startsWith('/sign')) {
      router.push('/sign');
    } else if (status === 'authenticated' && user) {
      const isOnboarding = pathname.startsWith('/onboarding');
      if (user.onboardingCompleted === false && !isOnboarding) {
        router.push('/onboarding');
      } else if (user.onboardingCompleted === true && isOnboarding) {
        router.push('/');
      }
    }
  }, [mounted, status, user, pathname, router]);

  if (!mounted) return null;

  if (status === 'loading') {
    return <AuthTransition label="Getting things ready" />;
  }

  if (status === 'authenticated' && user) {
    const isOnboarding = pathname.startsWith('/onboarding');

    if (user.onboardingCompleted === false && !isOnboarding) {
      return <AuthTransition label="Preparing your setup" />;
    }

    if (user.onboardingCompleted === true && isOnboarding) {
      return <AuthTransition label="Taking you in" />;
    }
  }

  return status === 'authenticated' ? <>{children}</> : null;
}
