'use client';

import { postLoginPath } from '@/domains/identity/postLoginPath';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AesService } from '@/infrastructure/auth/aes.service';
import { Loader2 } from 'lucide-react';
import { AesLogo } from '@/domains/identity';

/**
 * Where the button in the AES sign-in email lands. The link's secret is in the URL fragment, which
 * browsers never send to a server, so mail scanners that fetch the page over HTTP see nothing to
 * spend; opening the link signs the person straight in (one tap, no second button). A scanner that
 * ran the page's script would use the link up, which only costs the person a fresh sign-in.
 */
export default function AesConfirmPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const started = useRef(false);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return; // single-use: only ever redeem once
    started.current = true;

    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const challengeId = params.get('c');
    const token = params.get('t');
    // Keep the secret out of history and the address bar once it has been read.
    window.history.replaceState(null, '', window.location.pathname);

    if (!challengeId || !token) {
      setFailure('It may have expired or already been used.');
      return;
    }

    AesService.confirm(challengeId, token)
      .then(({ user, accessToken }) => {
        setAuth(user, accessToken);
        const destination = postLoginPath(user);
        // Document navigation for "/": see the same note in oauth2/redirect.
        if (destination === '/') window.location.replace('/');
        else router.replace(destination);
      })
      .catch((err) => setFailure(err instanceof Error ? err.message : 'That link did not work.'));
  }, [router, setAuth]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-5 rounded-3xl border border-slate-200 bg-surface p-7 text-center shadow-sm">
        <AesLogo className="mx-auto h-14 w-14 text-ink" />
        {failure === null ? (
          <>
            <h1 className="text-xl font-bold tracking-tight text-ink">Signing you in…</h1>
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold tracking-tight text-ink">This link can&apos;t be used</h1>
            <p className="text-sm text-slate-600">{failure} Start again from the sign-in page.</p>
            <button
              type="button"
              onClick={() => router.replace('/sign')}
              className="flex w-full items-center justify-center rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-on-ink transition-colors hover:bg-ink-hover"
            >
              Back to sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}
