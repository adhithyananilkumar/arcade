'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { UserService } from '@/services/user.service';
import { Loader2 } from 'lucide-react';

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
      router.push(`/login?error=${error}`);
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
          router.push('/login?error=profile_fetch_failed');
        });
    } else {
      router.push('/login');
    }
  }, [searchParams, router, setAuth, setStatus]);

  return (
    <div className="flex h-screen w-full items-center justify-center flex-col gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="text-gray-500 font-medium">Authenticating with Google...</p>
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
