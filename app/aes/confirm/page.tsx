'use client';

import { postLoginPath } from '@/domains/identity/postLoginPath';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AesService } from '@/infrastructure/auth/aes.service';
import { Loader2 } from 'lucide-react';
import { AesLogo } from '@/domains/identity';

/**
 * Where the button in the AES sign-in email lands. The link's secret is in the URL fragment (so it
 * never reaches a server log), and signing in takes one deliberate click: mail scanners that open
 * links on the recipient's behalf must not be able to use up a single-use link.
 */
export default function AesConfirmPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [link, setLink] = useState<{ challengeId: string; token: string } | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const challengeId = params.get('c');
    const token = params.get('t');
    setLink(challengeId && token ? { challengeId, token } : null);
    // Keep the secret out of history and the address bar once it has been read.
    window.history.replaceState(null, '', window.location.pathname);
  }, []);

  const signIn = async () => {
    if (!link) return;
    setBusy(true);
    setError(null);
    try {
      const { user, accessToken } = await AesService.confirm(link.challengeId, link.token);
      setAuth(user, accessToken);
      const destination = postLoginPath(user);
      // Document navigation for "/": see the same note in oauth2/redirect.
      if (destination === '/') window.location.replace('/');
      else router.replace(destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That link did not work');
      setBusy(false);
      setLink(null); // single-use: a failed link is spent, so offer a fresh start
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-5 rounded-3xl border border-slate-200 bg-surface p-7 text-center shadow-sm">
        <AesLogo className="mx-auto h-14 w-14 text-ink" />
        {link === undefined ? (
          <Loader2 className="mx-auto h-6 w-6 animate-spin" />
        ) : link ? (
          <>
            <h1 className="text-xl font-bold tracking-tight text-ink">Finish signing in</h1>
            <p className="text-sm text-slate-600">
              You asked to sign in to Arcade with AES. Continue to finish.
            </p>
            <button
              type="button"
              onClick={signIn}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-on-ink transition-colors hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign in to Arcade'}
            </button>
            <p className="text-xs text-slate-500">Didn&apos;t ask for this? Close this page — nothing has happened.</p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold tracking-tight text-ink">This link can&apos;t be used</h1>
            <p className="text-sm text-slate-600">
              {error ?? 'It may have expired or already been used.'} Start again from the sign-in page.
            </p>
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
