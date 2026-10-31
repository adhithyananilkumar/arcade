'use client';

import { postLoginPath } from '@/domains/identity/postLoginPath';
import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AesService } from '@/infrastructure/auth/aes.service';
import { Loader2 } from 'lucide-react';

/** Landing page for an AES sign-in: redeems the ticket the BFF callback attached, then goes home. */
function AesCompleteHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, setStatus } = useAuthStore();
  const handled = useRef(false);

  useEffect(() => {
    // The ticket is single-use: only ever redeem it once.
    if (handled.current) return;
    handled.current = true;

    const ticket = searchParams.get('aes_ticket');
    if (!ticket) {
      router.replace('/sign');
      return;
    }

    AesService.exchange(ticket)
      .then(({ user, accessToken }) => {
        setAuth(user, accessToken);
        const destination = postLoginPath(user);
        // Document navigation for "/": see the same note in oauth2/redirect.
        if (destination === '/') window.location.replace('/');
        else router.replace(destination);
      })
      .catch((err: Error) => {
        setStatus('unauthenticated');
        router.replace(`/sign?aes_error=${encodeURIComponent(err.message || 'AES sign-in failed')}`);
      });
  }, [searchParams, router, setAuth, setStatus]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

export default function AesCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <AesCompleteHandler />
    </Suspense>
  );
}
