'use client';

/**
 * Where an event invitation email lands: `/events/invite?token=…` (built by the backend's
 * EventInvitationService). This page did not exist, so the link fell through to `/events/[slug]`
 * and looked for an event whose slug was "invite".
 *
 * 1. Validate the token (public, no auth, no mutation).
 * 2. Signed out → send through /sign (sign-up if the invited address has no account yet) and come
 *    back here afterwards.
 * 3. Signed in → claim the invitation (the backend requires the account's email to match the
 *    invited address), then open the event page, where the person registers as usual.
 */

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpRight, XCircle, MailWarning } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { EventInvitationClaimService } from '@/domains/events';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { PebbleLoader } from '@/domains/identity';
import '@/apps/public/landing.css';

function EditorialBackdrop() {
  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10"
      style={{
        backgroundColor: 'var(--theme-surface, #FAFBFD)',
        backgroundImage: `var(--theme-wash, 
          radial-gradient(ellipse 70% 40% at 50% 0%, rgba(224, 236, 255, 0.25) 0%, transparent 70%),
          radial-gradient(ellipse 60% 40% at 10% 25%, rgba(233, 225, 254, 0.20) 0%, transparent 65%),
          linear-gradient(180deg, #FAFBFD 0%, #F6F8FD 35%, #F8F6FD 70%, #FAF9FB 100%)
        )`,
      }}
    />
  );
}

function EventInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const { status } = useAuthStore();

  const [state, setState] = useState<'working' | 'error'>('working');
  const [errorMessage, setErrorMessage] = useState('');
  // Claiming is a mutation; never send it twice if the effect re-runs.
  const handled = useRef(false);

  useEffect(() => {
    if (!token || status === 'loading' || handled.current) return;
    handled.current = true;

    (async () => {
      try {
        const result = await EventInvitationClaimService.validate(token);
        const eventPath = result.eventId ? `/events/${result.eventId}` : '/events';

        // Accepted first: an accepted invitation is no longer "valid" (claimable), and once its date
        // passes it also reads as expired — but its owner opening the link again should simply land
        // on the event, not be told the invitation is dead.
        if (result.alreadyAccepted) {
          router.replace(eventPath);
          return;
        }
        if (!result.valid || result.expired) {
          setState('error');
          setErrorMessage(
            result.expired
              ? 'This invitation has expired. Ask the organiser to send you a new one.'
              : 'This invitation link is invalid or has been withdrawn.'
          );
          return;
        }

        if (status !== 'authenticated') {
          const params = new URLSearchParams({
            redirect: `/events/invite?token=${encodeURIComponent(token)}`,
          });
          if (result.invitedEmail) params.set('email', result.invitedEmail);
          if (!result.accountExists) params.set('mode', 'signup');
          router.replace(`/sign?${params.toString()}`);
          return;
        }

        await EventInvitationClaimService.claim(token);
        router.replace(eventPath);
      } catch (err) {
        setState('error');
        setErrorMessage(err instanceof Error ? err.message : 'We could not open this invitation.');
      }
    })();
  }, [token, status, router]);

  const effectiveState = !token ? 'error' : state;
  const message = !token ? 'No invitation token was provided in the link.' : errorMessage;

  return (
    <div className="landing-root min-h-[calc(100vh-140px)] flex flex-col justify-center relative text-ink font-sans pt-28 sm:pt-32 lg:pt-36 pb-16 lg:pb-20 px-6 sm:px-12 lg:px-20">
      <EditorialBackdrop />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.215, 0.61, 0.355, 1] }}
        className="w-full max-w-[520px] mx-auto my-auto text-center"
      >
        {effectiveState === 'working' ? (
          <div className="flex flex-col items-center">
            <div className="mb-8">
              <PebbleLoader />
            </div>
            <h1 className="text-3xl sm:text-4xl font-normal font-serif italic text-ink tracking-tight leading-snug">
              Opening your invitation.
            </h1>
            <span className="block h-0.5 w-10 bg-[#205ca8]/60 rounded-full mx-auto mt-4" />
            <p className="text-sm text-slate-500 leading-relaxed mt-5">This will just take a moment.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100 mb-6 dark:bg-rose-500/10 dark:border-rose-500/25">
              {message.includes('expired') ? <MailWarning className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            </div>
            <h1 className="text-3xl sm:text-4xl font-normal font-serif italic text-ink tracking-tight leading-snug">
              Invitation unavailable.
            </h1>
            <span className="block h-0.5 w-10 bg-[#205ca8]/60 rounded-full mx-auto mt-4" />
            <p className="text-sm text-slate-500 leading-relaxed mt-5 max-w-sm">{message}</p>
            <Link
              href="/events"
              className="mt-9 inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-ink hover:bg-[#205ca8] text-on-ink font-medium text-sm tracking-wide shadow-sm transition-all group"
            >
              <span>Browse events</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function EventInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="landing-root relative flex min-h-[calc(100vh-140px)] items-center justify-center">
          <EditorialBackdrop />
          <PebbleLoader label="Loading" />
        </div>
      }
    >
      <EventInviteContent />
    </Suspense>
  );
}
