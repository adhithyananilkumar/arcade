'use client';

import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowRight, Check, Clock3, EyeOff, Gavel, Inbox, X } from 'lucide-react';
import { JudgingService, PHASE_LABEL, formatCompetitionDate, type JudgingAssignment } from '@/domains/events';
import { PageLoader } from '@/shared/design-system/ui/loader';
import { eventRoutes } from '@/shared/routes/content.routes';
import { errorText, panelClass, primaryButton, secondaryButton } from './hackathonUtils';

/**
 * `/judging` — where a judge lands from the invitation notification or email: invitations waiting
 * for an answer, then every event they judge with how much is left to score. Accepting is what
 * opens an event's judging workspace.
 */
export function JudgingHubPage() {
  const queryClient = useQueryClient();
  const key = ['judging', 'assignments'];
  const query = useQuery({ queryKey: key, queryFn: () => JudgingService.assignments(), retry: false });
  const [busy, setBusy] = useState<string | null>(null);

  const respond = async (a: JudgingAssignment, accept: boolean) => {
    setBusy(a.judgeId);
    try {
      queryClient.setQueryData(key, await JudgingService.respond(a.judgeId, accept));
      toast.success(accept ? `You are now judging ${a.eventTitle}` : 'Invitation declined');
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(null);
    }
  };

  if (query.isLoading) return <PageLoader label="Loading your judging" />;

  const invites = (query.data ?? []).filter((a) => a.status === 'INVITED');
  const active = (query.data ?? []).filter((a) => a.status === 'ACCEPTED');

  // Not a judge (never invited, or declined everything): this page does not exist for them.
  if (query.isSuccess && invites.length === 0 && active.length === 0) notFound();

  return (
    <div className="theme-page-bg theme-wallpaper-frost min-h-screen w-full bg-surface text-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pb-28 pt-28 sm:px-6">
        <header className="relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-[28px] bg-ink p-6 text-on-ink shadow-md sm:p-8">
          <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-blue-500/25 blur-3xl" />
          <div className="relative">
            <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] opacity-70">
              <Gavel size={13} /> Judging
            </p>
            <h1 className="mt-1 text-2xl font-black sm:text-3xl">Your judging</h1>
            <p className="mt-1 flex items-center gap-1.5 text-xs opacity-60">
              <EyeOff size={12} /> Judging is blind — you see each project, never who built it.
            </p>
          </div>
          <div className="relative flex gap-6 text-right">
            <Figure value={invites.length} label="invitations" />
            <Figure value={active.reduce((n, a) => n + a.toScore, 0)} label="to score" />
          </div>
        </header>

        {query.error && <p className="text-sm text-rose-600 dark:text-rose-300">{errorText(query.error)}</p>}

        {invites.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-extrabold text-slate-900">Invitations</h2>
            {invites.map((a) => (
              <article key={a.judgeId} className={`${panelClass} flex flex-wrap items-center justify-between gap-4 border-blue-300/60 dark:border-blue-400/30`}>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#205ca8] dark:text-blue-300">{a.formatLabel}</p>
                  <h3 className="text-lg font-black text-slate-900">{a.eventTitle}</h3>
                  <p className="text-xs text-slate-500">
                    {a.channelName ? `${a.channelName} · ` : ''}
                    {a.trackName ? `${a.trackName} track · ` : ''}
                    Submissions close {formatCompetitionDate(a.submissionDeadline)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className={primaryButton} disabled={busy !== null} onClick={() => respond(a, true)}>
                    <Check size={14} /> Accept
                  </button>
                  <button type="button" className={secondaryButton} disabled={busy !== null} onClick={() => respond(a, false)}>
                    <X size={14} /> Decline
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-extrabold text-slate-900">Events you judge</h2>
          {active.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/10">
              <Inbox size={26} />
            </div>
              <p className="text-sm font-bold text-slate-700">Nothing to judge yet</p>
              <p className="text-xs text-slate-500">When an organiser invites you and you accept, the event appears here.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {active.map((a) => {
                const total = a.toScore + a.finalized;
                const pct = total > 0 ? Math.round((a.finalized / total) * 100) : 0;
                return (
                  <Link key={a.judgeId} href={eventRoutes.judge(a.eventSlug)} className={`${panelClass} group flex flex-col gap-3 transition hover:-translate-y-0.5 hover:shadow-lg`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{a.formatLabel} · {PHASE_LABEL[a.phase]}</p>
                        <h3 className="truncate text-base font-black text-slate-900">{a.eventTitle}</h3>
                      </div>
                      <ArrowRight size={16} className="mt-1 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700" />
                    </div>
                    {a.judgingOpen || total > 0 ? (
                      <>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
                          <div className="h-full rounded-full bg-[#205ca8] dark:bg-blue-400" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs text-slate-600">
                          <strong className="text-slate-900">{a.toScore}</strong> to score · {a.finalized} done
                          {a.judgingDeadline ? ` · due ${formatCompetitionDate(a.judgingDeadline)}` : ''}
                        </p>
                      </>
                    ) : (
                      <p className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock3 size={13} /> Opens when submissions close ({formatCompetitionDate(a.submissionDeadline)})
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Figure({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="text-3xl font-black tabular-nums">{value}</p>
      <p className="text-[11px] font-bold uppercase tracking-wider opacity-60">{label}</p>
    </div>
  );
}
