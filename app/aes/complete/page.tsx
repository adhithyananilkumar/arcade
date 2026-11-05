'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AesService, type AesChallenge } from '@/infrastructure/auth/aes.service';
import { Loader2, MailCheck } from 'lucide-react';
import { AesLogo } from '@/domains/identity';

const Spinner = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

/**
 * Landing page for an AES sign-in. The AES result is only a claim, so this redeems its ticket,
 * which emails a link, and asks the person to open it. The session starts in the browser that opens
 * the link, not here.
 */
function AesCompleteHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setStatus = useAuthStore((s) => s.setStatus);
  const handled = useRef(false);
  const [challenge, setChallenge] = useState<AesChallenge | null>(null);

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
      .then(setChallenge)
      .catch((err: Error) => {
        setStatus('unauthenticated');
        router.replace(`/sign?aes_error=${encodeURIComponent(err.message || 'AES sign-in failed')}`);
      });
  }, [searchParams, router, setStatus]);

  if (!challenge) return <Spinner />;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-5 rounded-3xl border border-slate-200 bg-surface p-7 text-center shadow-sm">
        <AesLogo className="mx-auto h-14 w-14 text-ink" />
        <h1 className="text-xl font-bold tracking-tight text-ink">Check your email</h1>
        <p className="flex items-start justify-center gap-2 text-sm text-slate-600">
          <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" aria-hidden />
          <span>
            We sent a sign-in link to <b className="text-ink">{challenge.sentTo}</b>. Tap the button in that email to
            finish. It works once and expires at{' '}
            {new Date(challenge.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
          </span>
        </p>
        <button
          type="button"
          onClick={() => router.replace('/sign')}
          className="block w-full text-center text-xs font-semibold text-slate-500 hover:text-ink"
        >
          Back to sign in
        </button>
      </div>
    </div>
  );
}

export default function AesCompletePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <AesCompleteHandler />
    </Suspense>
  );
}
