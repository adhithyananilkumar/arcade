'use client';

/**
 * Landing step for the invite-gated channel creation flow.
 * Validates the token and redirects cleanly with matching luxury dark theme.
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, XCircle, MailWarning, ShieldAlert } from 'lucide-react';
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
    if (!token) return;
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
        router.replace(createPath);
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
    <div className="flex min-h-screen items-center justify-center bg-[#030712] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-center shadow-2xl backdrop-blur-2xl"
      >
        {(effectiveState === 'validating' || effectiveState === 'redirecting') && (
          <div className="flex flex-col items-center">
            <div className="mb-4 rounded-full bg-cyan-500/10 border border-cyan-500/20 p-4 text-cyan-400">
              <Loader2 className="animate-spin" size={36} />
            </div>
            <h2 className="text-xl font-bold text-white">
              {effectiveState === 'validating' ? 'Checking your invitation...' : 'Taking you onward...'}
            </h2>
            <p className="text-sm text-slate-400 mt-2">This will just take a moment.</p>
          </div>
        )}

        {effectiveState === 'error' && (
          <div className="flex flex-col items-center">
            <div className="mb-4 rounded-full bg-rose-500/10 border border-rose-500/20 p-4 text-rose-400">
              {effectiveErrorMessage.includes('expired') ? <MailWarning size={44} /> : <ShieldAlert size={44} />}
            </div>
            <h2 className="text-2xl font-bold text-white">Invitation Unavailable</h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">{effectiveErrorMessage}</p>

            <Link
              href="/"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:opacity-90 transition-opacity"
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
        <div className="flex h-screen w-full items-center justify-center bg-[#030712]">
          <Loader2 className="animate-spin text-cyan-400" size={40} />
        </div>
      }
    >
      <ChannelInviteContent />
    </Suspense>
  );
}
