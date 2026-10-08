'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { ApiError } from '@/infrastructure/http/api';
import { channelService, type CredentialBrandingReadiness } from '../api/channel.service';

/** The backend refused a submission because the channel's credential branding is incomplete. */
export function isBrandingIncomplete(error: unknown): boolean {
  return error instanceof ApiError && error.code === 'CHANNEL_BRANDING_INCOMPLETE';
}

/** Where a channel sets up the branding it is missing (Manage → Identity & branding). */
export function brandingSetupHref(channelId: string, readiness?: CredentialBrandingReadiness | null): string {
  const focus = readiness?.missing[0] === 'LOGO' ? 'logo' : 'signatory';
  return `/channels/${channelId}/manage?tab=identity&focus=${focus}`;
}

/**
 * Warns, before anyone tries, that a channel cannot publish yet: it has no logo (organisations) or
 * no certificate signature, both printed on every badge and certificate it awards. The backend
 * enforces this on submit (`CHANNEL_BRANDING_INCOMPLETE`); this is the early, actionable notice —
 * what is missing, why, and a link to where it is set. Renders nothing when the channel is ready
 * or the check fails.
 *
 * `refreshKey` re-checks (e.g. after a refused submit).
 */
export function ChannelBrandingNotice({
  channelId,
  refreshKey,
  context = 'publish',
  className,
}: {
  channelId: string | null | undefined;
  refreshKey?: unknown;
  /** `create`: shown while creating content — creation is allowed, publishing is not. */
  context?: 'create' | 'publish';
  className?: string;
}) {
  // Tagged with its channel, so a stale answer is never shown for a newly picked channel.
  const [result, setResult] = useState<{ channelId: string; readiness: CredentialBrandingReadiness | null } | null>(null);

  useEffect(() => {
    if (!channelId) return;
    let live = true;
    channelService
      .getBrandingReadiness(channelId)
      .then((r) => live && setResult({ channelId, readiness: r }))
      .catch(() => live && setResult({ channelId, readiness: null }));
    return () => {
      live = false;
    };
  }, [channelId, refreshKey]);

  const readiness = result && result.channelId === channelId ? result.readiness : null;
  if (!channelId || !readiness || readiness.missing.length === 0) return null;

  const items = readiness.missing.map((m) => (m === 'LOGO' ? 'a logo' : 'a certificate signature (image, name and title)'));
  const what = items.join(' and ');

  return (
    <div
      role="alert"
      className={`flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-500/10 ${className ?? ''}`}
    >
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
      <div className="min-w-0 flex-1 text-[12.5px] font-medium leading-relaxed text-amber-900 dark:text-amber-100">
        <p className="font-bold">
          {context === 'create'
            ? 'You can create this now, but the channel cannot publish it yet'
            : 'This channel cannot publish yet'}
        </p>
        <p className="mt-0.5">
          It needs {what} first — they are printed on every badge and certificate learners earn from it.{' '}
          {readiness.personal
            ? 'Add your signature and title in your channel’s Identity & branding.'
            : 'A channel manager can add them in the channel’s Identity & branding.'}
        </p>
        <Link
          href={brandingSetupHref(channelId, readiness)}
          className="mt-2 inline-flex items-center gap-1.5 font-extrabold text-amber-800 underline-offset-2 hover:underline dark:text-amber-200"
        >
          Set up badges &amp; certificates <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
