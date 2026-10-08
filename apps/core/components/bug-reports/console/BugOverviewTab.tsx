'use client';

import { useEffect, useState } from 'react';
import { CircleAlert, Clock, Inbox, Loader2, MessageCircleQuestion, ShieldAlert, UserX } from 'lucide-react';
import {
  BugTriageService,
  IMPACT_SHORT,
  BugStatusBadge,
  type BugImpact,
  type BugStatus,
  type BugTrackerStats,
} from '@/domains/bug-reports';

function Stat({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  onClick,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: typeof Inbox;
  tone: string;
  onClick?: () => void;
}) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className={`rounded-2xl border border-slate-200/80 bg-surface px-4 py-3.5 text-left shadow-[0_2px_8px_rgba(20,20,43,0.04)] ${onClick ? 'cursor-pointer transition hover:-translate-y-px hover:shadow-md' : ''}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tone}`}>
          <Icon size={14} />
        </span>
      </div>
      <p className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight text-ink">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p>}
    </Comp>
  );
}

function Bars({ rows, onPick }: { rows: { key: string; label: string; count: number }[]; onPick?: (key: string) => void }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  if (rows.length === 0) return <p className="py-6 text-center text-xs text-slate-400">Nothing open.</p>;
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.key}>
          <button
            type="button"
            disabled={!onPick}
            onClick={() => onPick?.(r.key)}
            className="group w-full cursor-pointer text-left disabled:cursor-default"
          >
            <div className="mb-1 flex items-center justify-between text-[12px]">
              <span className="truncate font-medium text-slate-600 group-hover:text-slate-900">{r.label}</span>
              <span className="font-bold tabular-nums text-slate-800">{r.count}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-ink/80" style={{ width: `${(r.count / max) * 100}%` }} />
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-surface p-4 shadow-[0_2px_8px_rgba(20,20,43,0.04)]">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">{title}</h3>
      {children}
    </section>
  );
}

/** Where the test release stands: what's open, what's urgent, and where bugs cluster. */
export function BugOverviewTab({
  refreshKey,
  onOpenTracker,
}: {
  refreshKey: number;
  onOpenTracker: (filters: Record<string, string | null>) => void;
  onOpenBug: (id: string) => void;
}) {
  const [stats, setStats] = useState<BugTrackerStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    BugTriageService.stats()
      .then((s) => !cancelled && setStats(s))
      .catch((err) => !cancelled && setError(err?.message || 'Could not load bug figures.'));
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (error) return <p className="rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>;
  if (!stats) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const maxDay = Math.max(1, ...stats.last14Days.map((d) => Math.max(d.created, d.resolved)));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Stat label="Open" value={stats.open} icon={Inbox} tone="bg-slate-100 text-slate-700" onClick={() => onOpenTracker({ view: 'open' })} />
        <Stat label="Needs triage" value={stats.newCount} icon={CircleAlert} tone="bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300" onClick={() => onOpenTracker({ view: 'new' })} />
        <Stat label="Blockers" value={stats.blockersOpen} icon={ShieldAlert} tone="bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300" onClick={() => onOpenTracker({ view: 'blockers' })} />
        <Stat label="Unassigned" value={stats.unassignedOpen} icon={UserX} tone="bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" onClick={() => onOpenTracker({ view: 'unassigned' })} />
        <Stat label="Waiting on reporter" value={stats.needsInfo} icon={MessageCircleQuestion} tone="bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-300" onClick={() => onOpenTracker({ view: 'waiting' })} />
        <Stat
          label="Median fix time"
          value={stats.medianHoursToResolve === null ? '—' : stats.medianHoursToResolve < 48 ? `${stats.medianHoursToResolve}h` : `${Math.round(stats.medianHoursToResolve / 24)}d`}
          hint={`${stats.resolvedLast7Days} resolved this week`}
          icon={Clock}
          tone="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
        />
      </div>

      <Panel title="Last 14 days">
        <div className="flex h-36 items-end gap-1.5">
          {stats.last14Days.map((d) => (
            <div key={d.day} className="group relative flex h-full flex-1 flex-col justify-end">
              <div className="flex h-full items-end justify-center gap-0.5">
                <div className="w-1/2 max-w-3 rounded-t bg-ink/80" style={{ height: `${(d.created / maxDay) * 100}%`, minHeight: d.created ? 3 : 0 }} />
                <div className="w-1/2 max-w-3 rounded-t bg-emerald-400" style={{ height: `${(d.resolved / maxDay) * 100}%`, minHeight: d.resolved ? 3 : 0 }} />
              </div>
              <span className="pointer-events-none absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-on-ink group-hover:block">
                {new Date(d.day).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}: {d.created} new · {d.resolved} resolved
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-ink/80" /> Reported
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-emerald-400" /> Resolved
          </span>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Open by category">
          <Bars rows={stats.openByCategory} />
        </Panel>
        <Panel title="Open by reporter impact">
          <Bars
            rows={stats.openByImpact.map((r) => ({ ...r, label: IMPACT_SHORT[r.key as BugImpact] ?? r.key }))}
            onPick={(impact) => onOpenTracker({ view: 'open', impact })}
          />
        </Panel>
        <Panel title="Pages with the most open bugs">
          <Bars rows={stats.topRoutes} onPick={(route) => onOpenTracker({ view: 'open', q: route === '(unknown)' ? null : route })} />
        </Panel>
      </div>

      <Panel title="All reports by status">
        <div className="flex flex-wrap gap-2">
          {stats.byStatus.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => onOpenTracker({ view: 'all', status: r.key })}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-surface px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:border-slate-300"
            >
              <BugStatusBadge status={r.key as BugStatus} />
              <span className="tabular-nums text-slate-400">{r.count}</span>
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}
