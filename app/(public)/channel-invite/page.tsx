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
import { ArrowUpRight, XCircle, MailWarning } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { channelService } from '@/domains/channels';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { PebbleLoader } from '@/domains/identity/components/PebbleLoader';
import '@/apps/public/landing.css';

/** Same pastel atmospheric backdrop used across the public editorial pages (see /reach-us). */
function EditorialBackdrop() {
  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10"
      style={{
        backgroundColor: '#FAFBFD',
        backgroundImage: `
          radial-gradient(ellipse 70% 40% at 50% 0%, rgba(224, 236, 255, 0.25) 0%, transparent 70%),
          radial-gradient(ellipse 60% 40% at 10% 25%, rgba(233, 225, 254, 0.20) 0%, transparent 65%),
          radial-gradient(ellipse 60% 40% at 90% 75%, rgba(253, 232, 240, 0.18) 0%, transparent 65%),
          linear-gradient(
            180deg,
            #FAFBFD 0%,
            #F6F8FD 35%,
            #F8F6FD 70%,
            #FAF9FB 100%
          )
        `,
      }}
    />
  );
}

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
    <div className="landing-root min-h-[calc(100vh-140px)] flex flex-col justify-center relative text-[#0f172a] font-sans pt-28 sm:pt-32 lg:pt-36 pb-16 lg:pb-20 px-6 sm:px-12 lg:px-20 selection:bg-blue-100 selection:text-blue-900">
      <EditorialBackdrop />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.215, 0.61, 0.355, 1] }}
        className="w-full max-w-[520px] mx-auto my-auto text-center"
      >
        {(effectiveState === 'validating' || effectiveState === 'redirecting') && (
          <div className="flex flex-col items-center">
            <div className="mb-8">
              <PebbleLoader />
            </div>
            <h1 className="text-3xl sm:text-4xl font-normal font-serif italic text-[#0B132B] tracking-tight leading-snug">
              {effectiveState === 'validating' ? 'Checking your invitation.' : 'Taking you onward.'}
            </h1>
            <span className="block h-0.5 w-10 bg-[#205ca8]/60 rounded-full mx-auto mt-4" />
            <p className="text-sm text-slate-500 leading-relaxed mt-5">
              This will just take a moment.
            </p>
          </div>
        )}

        {effectiveState === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100 mb-6">
              {effectiveErrorMessage.includes('expired') ? (
                <MailWarning className="w-6 h-6" />
              ) : (
                <XCircle className="w-6 h-6" />
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-normal font-serif italic text-[#0B132B] tracking-tight leading-snug">
              Invitation unavailable.
            </h1>
            <span className="block h-0.5 w-10 bg-[#205ca8]/60 rounded-full mx-auto mt-4" />
            <p className="text-sm text-slate-500 leading-relaxed mt-5 max-w-sm">
              {effectiveErrorMessage}
            </p>

            <Link
              href="/"
              className="mt-9 relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#0B132B] hover:bg-[#205ca8] text-white font-medium text-sm tracking-wide shadow-sm hover:shadow-md transition-all duration-300 ease-out group"
            >
              <span>Go to Homepage</span>
              <span className="w-5 h-5 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                <ArrowUpRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
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
        <div className="landing-root relative flex min-h-[calc(100vh-140px)] items-center justify-center">
          <EditorialBackdrop />
          <PebbleLoader label="Loading" />
        </div>
      }
    >
      <ChannelInviteContent />
    </Suspense>
  );
}
