'use client';

/**
 * Landing step for the invite-gated channel creation flow (see the "Invitation -> Channel
 * Creation Flow" plan, Frontend §2). Reached from either the invite email or the in-app
 * notification — both point at this same URL with `?token=`.
 *
 * Responsibilities:
 * 1. Validate the token (public, no auth, no mutation).
 * 2. Always require login before proceeding, regardless of how the user arrived:
 *    - Already authenticated -> skip straight to the channel-type/form page.
 *    - Not authenticated -> bounce through /sign with `redirect` + `email` so they land back
 *      here (well, on the create step) once signed in.
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, XCircle, MailWarning } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { channelService } from '@/domains/channels';
import { useAuthStore } from '@/infrastructure/auth/auth.store';

function ChannelInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const { status } = useAuthStore();

  const [state, setState] = useState<'validating' | 'redirecting' | 'error'>('validating');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // No token at all is a render-time condition, not something to resolve via an effect —
    // handled directly below instead of round-tripping through state.
    if (!token) return;
    // Wait for the app-wide auth bootstrap to resolve before deciding where to send the user.
    if (status === 'loading') return;

    let cancelled = false;

    (async () => {
      try {
        const result = await channelService.validateCreationInvitation(token);
        if (cancelled) return;

        if (!result.valid || result.expired) {
          setState('error');
          setErrorMessage(
            result.expired
              ? 'This invitation link has expired. Ask the person who invited you to send a new one.'
              : 'This invitation link is invalid.'
          );
          return;
        }

        setState('redirecting');
        const createPath = `/channel-invite/create?token=${encodeURIComponent(token)}`;

        if (status === 'authenticated') {
          router.replace(createPath);
          return;
        }

        const params = new URLSearchParams({ redirect: createPath });
        if (result.email) params.set('email', result.email);
        if (result.accountExists === false) params.set('mode', 'signup');
        router.replace(`/sign?${params.toString()}`);
      } catch (err) {
        if (!cancelled) {
          setState('error');
          setErrorMessage(err instanceof Error ? err.message : 'Failed to validate the invitation.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, status, router]);

  const effectiveState = !token ? 'error' : state;
  const effectiveErrorMessage = !token ? 'No invitation token was provided in the URL.' : errorMessage;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-xl shadow-indigo-100/50"
      >
        {(effectiveState === 'validating' || effectiveState === 'redirecting') && (
          <div className="flex flex-col items-center">
            <div className="mb-4 rounded-full bg-indigo-50 p-4 text-indigo-600">
              <Loader2 className="animate-spin" size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {effectiveState === 'validating' ? 'Checking your invitation...' : 'Taking you onward...'}
            </h2>
            <p className="text-sm text-gray-500 mt-2">This will just take a moment.</p>
          </div>
        )}

        {effectiveState === 'error' && (
          <div className="flex flex-col items-center">
            <div className="mb-4 rounded-full bg-red-50 p-4 text-red-500">
              {effectiveErrorMessage.includes('expired') ? <MailWarning size={48} /> : <XCircle size={48} />}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Invitation Unavailable</h2>
            <p className="text-sm text-gray-500 mt-2">{effectiveErrorMessage}</p>

            <Link
              href="/"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              Go to Homepage
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function ChannelInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
        </div>
      }
    >
      <ChannelInviteContent />
    </Suspense>
  );
}
