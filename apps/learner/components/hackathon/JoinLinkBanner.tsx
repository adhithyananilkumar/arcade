'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { AvatarStack, TeamBoardService, type TeamBoard } from '@/domains/events';
import { errorText } from './hackathonUtils';

/** Shown when the page is opened from a teammate's `?join=CODE` invite link. */
export function JoinLinkBanner({
  eventId,
  code,
  registered,
  teamsOpen,
  landingHref,
  onJoined,
  onDismiss,
}: {
  eventId: string;
  code: string;
  registered: boolean;
  teamsOpen: boolean;
  landingHref: string;
  onJoined: (board: TeamBoard) => void;
  onDismiss: () => void;
}) {
  const preview = useQuery({
    queryKey: ['competition', eventId, 'join-preview', code],
    queryFn: () => TeamBoardService.preview(eventId, code),
    retry: false,
  });
  const [busy, setBusy] = useState(false);

  if (preview.isLoading) return <div className="h-24 animate-pulse rounded-3xl bg-slate-100" />;

  if (preview.error || !preview.data) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
        <span>{errorText(preview.error, 'That invite link is not valid any more.')}</span>
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="cursor-pointer">
          <X size={16} />
        </button>
      </div>
    );
  }

  const t = preview.data;
  const full = t.memberCount >= t.maxTeamSize;
  return (
    <div
      className="relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-3xl p-5 text-white shadow-lg sm:p-6"
      style={{ background: 'linear-gradient(110deg, #4338ca 0%, #7c3aed 55%, #db2777 100%)' }}
    >
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/70">You’re invited</p>
        <p className="mt-1 text-xl font-black">Join {t.teamName}</p>
        {t.tagline && <p className="text-sm text-white/80">{t.tagline}</p>}
        <div className="mt-3 flex items-center gap-2 text-xs font-bold text-white/80">
          <AvatarStack people={t.members} /> {t.memberCount}/{t.maxTeamSize} members
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!registered ? (
          <Link href={landingHref} className="rounded-full bg-white px-5 py-2.5 text-xs font-extrabold text-indigo-700 shadow">
            Register for the event first
          </Link>
        ) : (
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-extrabold text-indigo-700 shadow transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={busy || full || !teamsOpen}
            onClick={async () => {
              setBusy(true);
              try {
                onJoined(await TeamBoardService.joinByCode(eventId, code));
              } catch (e) {
                toast.error(errorText(e));
              } finally {
                setBusy(false);
              }
            }}
          >
            {full ? 'Team is full' : !teamsOpen ? 'Teams are locked' : busy ? 'Joining…' : 'Join team'}
          </button>
        )}
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="cursor-pointer rounded-full p-2 text-white/70 hover:bg-white/10">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
