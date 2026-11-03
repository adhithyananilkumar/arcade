'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, Circle, CircleDot, Gavel, Lock } from 'lucide-react';
import {
  CompetitionChip,
  JudgingService,
  SubmissionAnswersView,
  formatCompetitionDate,
  getEventBySlugOrId,
  type JudgingCriterion,
  type JudgingDetail,
} from '@/domains/events';
import { PageLoader } from '@/shared/design-system/ui/loader';
import { errorText, inputClass, panelClass, primaryButton, secondaryButton } from './hackathonUtils';

/**
 * `/events/{slug}/judge` — a judge's queue and scorecard.
 *
 * <p>The live total is a preview of the backend formula (weighted share of each maximum, out of
 * 100); the stored total is always the backend's own, returned on save.
 */
export function JudgeWorkspacePage({ slug }: { slug: string }) {
  const queryClient = useQueryClient();
  const eventQuery = useQuery({ queryKey: ['events', 'detail', slug], queryFn: () => getEventBySlugOrId(slug), enabled: !!slug });
  const eventId = eventQuery.data?.id;
  const queueQuery = useQuery({
    queryKey: ['competition', eventId, 'judging'],
    queryFn: () => JudgingService.queue(eventId!),
    enabled: !!eventId,
    retry: false,
  });
  const [picked, setSelected] = useState<string | null>(null);
  const items = queueQuery.data?.items ?? [];
  // Defaults to the top of the queue until the judge picks one.
  const selected = picked ?? items[0]?.submissionId ?? null;

  if (eventQuery.isLoading || (eventId && queueQuery.isLoading)) return <PageLoader label="Loading your judging queue" />;

  const done = items.filter((i) => i.myStatus === 'FINAL').length;
  const settings = queueQuery.data?.settings;

  return (
    <div className="theme-page-bg theme-wallpaper-frost min-h-screen w-full bg-surface text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-28 pt-28 sm:px-6">
        <Link href="/judging" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft size={16} /> All your judging
        </Link>

        {queueQuery.error ? (
          <div className="py-24 text-center">
            <Gavel className="mx-auto text-slate-300" size={36} />
            <p className="mt-3 text-lg font-extrabold text-slate-900">Judging workspace unavailable</p>
            <p className="mt-1 text-sm text-slate-500">{errorText(queueQuery.error)}</p>
            <Link href="/judging" className={`${primaryButton} mt-6`}>Open your judging invitations</Link>
          </div>
        ) : (
          <>
            <header
              className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] p-6 text-white"
              style={{ background: 'radial-gradient(120% 140% at 0% 0%, #1e3a8a 0%, #0f172a 60%, #020617 100%)' }}
            >
              <div>
                <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-sky-300">
                  <Gavel size={13} /> Judging · {settings?.formatLabel} · blind
                </p>
                <h1 className="mt-1 text-2xl font-black">{eventQuery.data?.title}</h1>
                <p className="mt-1 text-xs text-white/60">
                  {settings?.judgingOpen
                    ? settings.judgingDeadline
                      ? `Scores due ${formatCompetitionDate(settings.judgingDeadline)}`
                      : 'Scoring is open'
                    : settings?.resultsPublishedAt
                      ? 'Results are published — scores are locked'
                      : `Opens when submissions close (${formatCompetitionDate(settings?.submissionDeadline)})`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black tabular-nums">
                  {done}
                  <span className="text-white/40">/{items.length}</span>
                </p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">finalised</p>
              </div>
            </header>

            {items.length === 0 ? (
              <div className="py-20 text-center">
                <Lock className="mx-auto text-slate-300" size={32} />
                <p className="mt-3 text-sm font-bold text-slate-700">Nothing to score yet</p>
                <p className="mt-1 text-xs text-slate-500">Submitted projects appear here once submissions close.</p>
              </div>
            ) : (
              <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
                <ul className={`${panelClass} flex max-h-[70vh] flex-col gap-1 overflow-y-auto p-2 sm:p-2`}>
                  {items.map((i) => (
                    <li key={i.submissionId}>
                      <button
                        type="button"
                        onClick={() => setSelected(i.submissionId)}
                        className={`flex w-full cursor-pointer items-start gap-3 rounded-2xl px-3 py-3 text-left transition ${selected === i.submissionId ? 'bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:ring-blue-500/30' : 'hover:bg-slate-50'}`}
                      >
                        {i.myStatus === 'FINAL' ? (
                          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                        ) : i.myStatus === 'DRAFT' ? (
                          <CircleDot size={18} className="mt-0.5 shrink-0 text-amber-500" />
                        ) : (
                          <Circle size={18} className="mt-0.5 shrink-0 text-slate-300" />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Entry {String(i.entryNumber).padStart(2, '0')}</span>
                          <span className="block truncate text-sm font-bold text-slate-900">{i.title}</span>
                          {i.trackName && <span className="block truncate text-xs text-slate-500">{i.trackName}</span>}
                        </span>
                        {i.myTotal != null && <span className="text-xs font-black tabular-nums text-slate-700">{Number(i.myTotal).toFixed(0)}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
                {selected && eventId && (
                  <Scorecard
                    key={selected}
                    eventId={eventId}
                    submissionId={selected}
                    onSaved={() => queryClient.invalidateQueries({ queryKey: ['competition', eventId, 'judging'] })}
                    onNext={() => {
                      const idx = items.findIndex((i) => i.submissionId === selected);
                      const next = items.slice(idx + 1).find((i) => i.myStatus !== 'FINAL') ?? items.find((i) => i.myStatus !== 'FINAL' && i.submissionId !== selected);
                      if (next) setSelected(next.submissionId);
                    }}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Scorecard({ eventId, submissionId, onSaved, onNext }: { eventId: string; submissionId: string; onSaved: () => void; onNext: () => void }) {
  const detail = useQuery({
    queryKey: ['competition', eventId, 'judging', submissionId],
    queryFn: () => JudgingService.detail(eventId, submissionId),
    retry: false,
  });
  if (detail.isLoading) return <div className="h-96 animate-pulse rounded-3xl bg-slate-100" />;
  if (detail.error || !detail.data) return <p className="text-sm text-rose-600">{errorText(detail.error)}</p>;
  return <ScorecardBody data={detail.data} eventId={eventId} onSaved={onSaved} onNext={onNext} />;
}

function previewTotal(criteria: JudgingCriterion[], scores: Record<string, number>): number | null {
  if (criteria.length === 0) return null;
  let weighted = 0;
  let weights = 0;
  for (const c of criteria) {
    const v = scores[c.id];
    if (v == null) return null;
    weighted += (v / c.maxScore) * c.weight;
    weights += c.weight;
  }
  return (weighted / weights) * 100;
}

function ScorecardBody({ data, eventId, onSaved, onNext }: { data: JudgingDetail; eventId: string; onSaved: () => void; onNext: () => void }) {
  const { submission: p, criteria, myEvaluation } = data;
  const [scores, setScores] = useState<Record<string, number>>(myEvaluation?.scores ?? {});
  const [comment, setComment] = useState(myEvaluation?.comment ?? '');
  const [feedback, setFeedback] = useState(myEvaluation?.feedback ?? '');
  const [busy, setBusy] = useState<'draft' | 'final' | null>(null);
  const total = useMemo(() => previewTotal(criteria, scores), [criteria, scores]);
  const locked = !data.judgingOpen;

  const save = async (submitFinal: boolean) => {
    setBusy(submitFinal ? 'final' : 'draft');
    try {
      await JudgingService.evaluate(eventId, p.id, { scores, comment: comment || null, feedback: feedback || null, submitFinal });
      toast.success(submitFinal ? 'Scorecard finalised' : 'Draft saved');
      onSaved();
      if (submitFinal) onNext();
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <article className={`${panelClass} flex flex-col gap-5`}>
        <header>
          <div className="flex flex-wrap items-center gap-2">
            <CompetitionChip tone="blue">Entry {String(data.entryNumber).padStart(2, '0')}</CompetitionChip>
            {p.trackName && <CompetitionChip tone="violet">{p.trackName}</CompetitionChip>}
            <CompetitionChip>Submitted {formatCompetitionDate(p.submittedAt)}</CompetitionChip>
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900">{p.title}</h2>
          {p.tagline && <p className="mt-1 text-sm text-slate-500">{p.tagline}</p>}
        </header>
        {/* Blind: only the work, never who made it. */}
        <SubmissionAnswersView fields={data.fields} answers={p.answers} />
      </article>

      <aside className={`${panelClass} flex h-fit flex-col gap-5 xl:sticky xl:top-20`}>
        <div className="flex items-end justify-between">
          <h3 className="text-sm font-extrabold text-slate-900">Your scorecard</h3>
          <div className="text-right">
            <p className="text-3xl font-black tabular-nums text-slate-900">{total != null ? total.toFixed(1) : '—'}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">out of 100</p>
          </div>
        </div>
        {criteria.map((c) => (
          <div key={c.id}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-bold text-slate-900">
                {c.name} <span className="font-semibold text-slate-400">×{c.weight}</span>
              </span>
              <span className="text-sm font-black tabular-nums text-slate-900">
                {scores[c.id] ?? '–'}
                <span className="text-xs text-slate-400">/{c.maxScore}</span>
              </span>
            </div>
            {c.description && <p className="text-[11px] text-slate-500">{c.description}</p>}
            <div className="mt-2 flex flex-wrap gap-1">
              {Array.from({ length: c.maxScore + 1 }, (_, v) => v).map((v) => (
                <button
                  key={v}
                  type="button"
                  disabled={locked}
                  onClick={() => setScores((s) => ({ ...s, [c.id]: v }))}
                  className={`size-7 cursor-pointer rounded-lg text-[11px] font-bold transition disabled:cursor-not-allowed ${
                    scores[c.id] === v ? 'bg-ink text-on-ink' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Feedback for the team</span>
          <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={3} disabled={locked} className={`${inputClass} resize-y`} placeholder="Shared with the team when results are published" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Private note to organisers</span>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} disabled={locked} className={`${inputClass} resize-y`} placeholder="Only organisers see this" />
        </label>
        {myEvaluation?.status === 'FINAL' && <p className="text-[11px] font-semibold text-emerald-600">Finalised — saving a draft re-opens it.</p>}
        {!locked && (
          <div className="flex gap-2">
            <button type="button" className={`${secondaryButton} flex-1`} disabled={busy !== null} onClick={() => save(false)}>
              {busy === 'draft' ? 'Saving…' : 'Save draft'}
            </button>
            <button type="button" className={`${primaryButton} flex-1`} disabled={busy !== null || total == null} onClick={() => save(true)}>
              {busy === 'final' ? 'Saving…' : 'Finalise & next'}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
