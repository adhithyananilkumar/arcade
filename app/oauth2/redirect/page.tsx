'use client';

import { postLoginPath } from '@/domains/identity/postLoginPath';
import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthService } from '@/infrastructure/auth/auth.service';
import { Loader2 } from 'lucide-react';

import LearnerNavbar from '@/apps/learner/layout/LearnerNavbar';
import DashboardLoading from '@/app/(authenticated)/loading';

function OAuthRedirectHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, setStatus } = useAuthStore();

  const handled = useRef(false);

  useEffect(() => {
    // The code is single-use: a second run (remount, re-render with the same params) would burn
    // it against the backend and fail, so only ever exchange once.
    if (handled.current) return;
    handled.current = true;

    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth Error:', error);
      setStatus('unauthenticated');
      router.push(`/sign?error=${error}`);
      return;
    }

    if (!code) {
      router.push('/sign');
      return;
    }

    AuthService.exchangeOAuthCode(code)
      .then(({ user, accessToken }) => {
        setAuth(user, accessToken);
        const destination = postLoginPath(user);
        // Document navigation for "/": middleware picks landing vs dashboard from the session
        // cookie just set, and a soft navigation could replay the cached signed-out landing page.
        if (destination === '/') window.location.replace('/');
        else router.replace(destination);
      })
      .catch((err) => {
        console.error('Failed to complete Google sign-in:', err);
        setStatus('unauthenticated');
        router.push('/sign?error=oauth_exchange_failed');
      });
  }, [searchParams, router, setAuth, setStatus]);

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900" style={{ fontFamily: 'var(--font-geist-sans)' }}>
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-indigo-200/30 to-purple-200/30 blur-3xl pointer-events-none z-0 dark:from-indigo-500/20 dark:to-purple-500/20" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-200/20 to-emerald-200/20 blur-3xl pointer-events-none z-0 dark:from-blue-500/20 dark:to-emerald-500/20" />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        <LearnerNavbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          <DashboardLoading />
        </main>
      </div>
    </div>
  );
}

export default function OAuthRedirectPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <OAuthRedirectHandler />
    </Suspense>
  );
}
