'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { UserService } from "@/domains/identity";
import { Loader2 } from 'lucide-react';

import DashboardNavbar from '@/apps/learner/layout/DashboardNavbar';
import DashboardLoading from '@/app/(authenticated)/dashboard/loading';

function OAuthRedirectHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, setStatus } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth Error:', error);
      setStatus('unauthenticated');
      router.push(`/sign?error=${error}`);
      return;
    }

    if (token) {
      // Temporarily set the token in the store so the UserService can use it
      useAuthStore.setState({ accessToken: token });
      
      // Fetch the user's profile
      UserService.getMe()
        .then((user) => {
          setAuth(user, token);
          router.push('/dashboard');
        })
        .catch((err) => {
          console.error('Failed to fetch user profile after OAuth:', err);
          setStatus('unauthenticated');
          router.push('/sign?error=profile_fetch_failed');
        });
    } else {
      router.push('/sign');
    }
  }, [searchParams, router, setAuth, setStatus]);

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#f8fafc] text-slate-900" style={{ fontFamily: 'var(--font-geist-sans)' }}>
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-indigo-200/30 to-purple-200/30 blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-200/20 to-emerald-200/20 blur-3xl pointer-events-none z-0" />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        <DashboardNavbar />
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
