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
 *
 * Styling matches /reach-us and the creation step: same pastel backdrop, serif editorial
 * headings, and the internal PebbleLoader while we work.
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, XCircle, MailWarning } from 'lucide-react';
import Link from 'next/link';
import '@/apps/public/landing.css';
import { channelService } from '@/domains/channels';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { PebbleLoader } from '@/domains/identity';
import { AtmosphericBackground, fadeInUp } from './invite-chrome';

function ChannelInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const { status } = useAuthStore();
  const shouldReduceMotion = useReducedMotion();

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
  const expired = effectiveErrorMessage.includes('expired');

  return (
    <div className="landing-root min-h-[calc(100vh-140px)] flex items-center justify-center relative text-[#0f172a] font-sans px-6 sm:px-12 lg:px-20 py-24 selection:bg-blue-100 selection:text-blue-900">
      <AtmosphericBackground />

      <div className="w-full max-w-lg">
        {(effectiveState === 'validating' || effectiveState === 'redirecting') && (
          <motion.div
            initial={shouldReduceMotion ? {} : 'hidden'}
            animate="visible"
            custom={0}
            variants={fadeInUp}
            className="space-y-6"
          >
            <h1 className="text-4xl sm:text-5xl tracking-tight text-[#0B132B] leading-[1.08] font-serif">
              <span className="font-bold text-[#0B132B]">One</span>{' '}
              <span className="italic font-normal text-[#205ca8]">moment.</span>
            </h1>
            <span className="block h-0.5 w-10 bg-[#205ca8]/60 rounded-full" />
            <p className="text-base text-slate-600 leading-relaxed max-w-[420px]">
              {effectiveState === 'validating'
                ? 'We are checking your invitation link.'
                : 'Your invitation checks out — taking you onward.'}
            </p>
            <div className="pt-4 flex justify-start">
              <PebbleLoader size="sm" />
            </div>
          </motion.div>
        )}

        {effectiveState === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100">
              {expired ? <MailWarning className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            </div>
            <h1 className="text-3xl sm:text-4xl font-normal font-serif italic text-[#0B132B] tracking-tight leading-snug">
              Invitation Unavailable.
            </h1>
            <span className="block h-0.5 w-10 bg-[#205ca8]/60 rounded-full" />
            <p className="text-sm text-slate-600 max-w-md leading-relaxed">{effectiveErrorMessage}</p>

            <div className="pt-4">
              <Link
                href="/"
                className="relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#0B132B] hover:bg-[#205ca8] text-white font-medium text-sm tracking-wide shadow-sm hover:shadow-md transition-all duration-300 ease-out group"
              >
                <span>Go to Homepage</span>
                <span className="w-5 h-5 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function ChannelInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="landing-root min-h-[calc(100vh-140px)] flex items-center justify-center px-6">
          <AtmosphericBackground />
          <PebbleLoader label="Loading" />
        </div>
      }
    >
      <ChannelInviteContent />
    </Suspense>
  );
}
