'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Check, Crown, Medal, Trophy, Users } from 'lucide-react';
import type {
  CompetitionPerson,
  CompetitionPhase,
  CompetitionSettings,
  LeaderboardEntry,
  TeamCard,
} from '../../types/competition.types';

/**
 * Pure building blocks shared by the participant team board, the judge workspace and the Studio
 * hackathon desk. Data in, callbacks out — no fetching here.
 */

// ── formatting ──

export function formatCompetitionDate(iso: string | null | undefined): string {
  if (!iso) return 'Not set';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

export function initials(name: string | null | undefined): string {
  const parts = (name ?? '?').trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '?') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

const PHASES: { id: CompetitionPhase; label: string }[] = [
  { id: 'TEAM_FORMATION', label: 'Teams form' },
  { id: 'SUBMISSIONS_OPEN', label: 'Build & submit' },
  { id: 'JUDGING', label: 'Judging' },
  { id: 'RESULTS', label: 'Results' },
];

export const PHASE_LABEL: Record<CompetitionPhase, string> = {
  TEAM_FORMATION: 'Team formation',
  SUBMISSIONS_OPEN: 'Submissions open',
  JUDGING: 'Judging',
  RESULTS: 'Results out',
};

/** The next deadline the participant should care about, for the countdown. */
export function nextMilestone(s: CompetitionSettings): { label: string; at: string } | null {
  const now = Date.now();
  const candidates: { label: string; at: string | null }[] = [
    { label: 'Submissions open', at: s.submissionOpensAt },
    { label: 'Teams lock', at: s.teamFormationDeadline },
    { label: 'Submissions close', at: s.submissionDeadline },
    { label: 'Judging ends', at: s.judgingDeadline },
  ];
  const upcoming = candidates
    .filter((c): c is { label: string; at: string } => !!c.at && new Date(c.at).getTime() > now)
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  return upcoming[0] ?? null;
}

// ── people ──

export function PersonAvatar({ person, size = 36, ring = false }: { person: CompetitionPerson | null; size?: number; ring?: boolean }) {
  const style = { width: size, height: size, fontSize: Math.max(10, size * 0.36) };
  const cls = `inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-violet-500 font-extrabold text-white ${
    ring ? 'ring-2 ring-surface' : ''
  }`;
  if (person?.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={person.avatarUrl} alt={person.name ?? ''} style={style} className={`${cls} object-cover`} />;
  }
  return (
    <span style={style} className={cls} aria-hidden>
      {initials(person?.name)}
    </span>
  );
}

export function AvatarStack({ people, max = 5, size = 28 }: { people: CompetitionPerson[]; max?: number; size?: number }) {
  const shown = people.slice(0, max);
  return (
    <div className="flex items-center">
      {shown.map((p, i) => (
        <span key={p.userId} style={{ marginLeft: i === 0 ? 0 : -size / 3 }} title={p.name ?? undefined}>
          <PersonAvatar person={p} size={size} ring />
        </span>
      ))}
      {people.length > max && (
        <span
          style={{ width: size, height: size, marginLeft: -size / 3 }}
          className="inline-flex items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700 ring-2 ring-surface"
        >
          +{people.length - max}
        </span>
      )}
    </div>
  );
}

// ── timeline ──

/** The four-step journey, with the current step lit. */
export function PhaseTimeline({ phase }: { phase: CompetitionPhase }) {
  const current = PHASES.findIndex((p) => p.id === phase);
  return (
    <ol className="flex w-full items-center gap-2" aria-label="Competition timeline">
      {PHASES.map((p, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={p.id} className="flex flex-1 items-center gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
                  active
                    ? 'bg-amber-400 text-slate-900 shadow-[0_0_0_4px_rgba(251,191,36,0.25)]'
                    : done
                      ? 'bg-emerald-400 text-slate-900'
                      : 'bg-white/15 text-white/70'
                }`}
              >
                {done ? <Check size={14} /> : i + 1}
              </span>
              <span className={`truncate text-xs font-bold ${active ? 'text-white' : 'text-white/60'}`}>{p.label}</span>
            </div>
            {i < PHASES.length - 1 && <span className={`h-0.5 flex-1 rounded-full ${done ? 'bg-emerald-400/70' : 'bg-white/15'}`} />}
          </li>
        );
      })}
    </ol>
  );
}

/** A ticking countdown to `at`. */
export function Countdown({ at }: { at: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const ms = Math.max(0, new Date(at).getTime() - now);
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const cells = d > 0 ? [[d, 'd'], [h, 'h'], [m, 'm']] : [[h, 'h'], [m, 'm'], [s, 's']];
  return (
    <div className="flex items-end gap-1.5 font-mono">
      {cells.map(([v, u]) => (
        <span key={u as string} className="flex items-baseline gap-0.5">
          <span className="rounded-lg bg-white/10 px-2 py-1 text-xl font-black tabular-nums text-white">{String(v).padStart(2, '0')}</span>
          <span className="text-[10px] font-bold uppercase text-white/50">{u}</span>
        </span>
      ))}
    </div>
  );
}

// ── chips ──

export function Chip({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet' }) {
  const tones = {
    neutral: 'border-slate-200 bg-slate-50 text-slate-600',
    blue: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
    amber: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
    red: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
    violet: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300',
  };
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${tones[tone]}`}>{children}</span>;
}

// ── team cards ──

export function TeamCardView({
  team,
  action,
}: {
  team: TeamCard;
  action?: ReactNode;
}) {
  const full = team.memberCount >= team.maxTeamSize;
  return (
    <article className="group flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-surface p-5 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgba(15,23,42,0.18)]">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-sm font-black text-white">
            {initials(team.name)}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-extrabold text-slate-900">{team.name}</h3>
            {team.tagline && <p className="line-clamp-1 text-xs text-slate-500">{team.tagline}</p>}
          </div>
        </div>
        {team.lookingForMembers && !full ? <Chip tone="green">Recruiting</Chip> : full ? <Chip>Full</Chip> : null}
      </header>

      <div className="flex flex-wrap gap-1.5">
        {team.trackName && <Chip tone="violet">{team.trackName}</Chip>}
        {team.skillsWanted.map((s) => (
          <Chip key={s} tone="blue">
            {s}
          </Chip>
        ))}
      </div>

      <footer className="mt-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AvatarStack people={team.members} />
          <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
            <Users size={13} /> {team.memberCount}/{team.maxTeamSize}
          </span>
        </div>
        {action}
      </footer>
    </article>
  );
}

// ── leaderboard ──

const PODIUM_STYLE = [
  'from-amber-300 to-amber-500 text-amber-950',
  'from-slate-200 to-slate-400 text-slate-900',
  'from-orange-300 to-orange-500 text-orange-950',
];

export function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  const top = entries.filter((e) => e.rank > 0 && e.rank <= 3).slice(0, 3);
  if (top.length === 0) return null;
  // Visual order 2 · 1 · 3.
  const order = [top[1], top[0], top[2]].filter(Boolean) as LeaderboardEntry[];
  return (
    <div className="flex items-end justify-center gap-3 sm:gap-5">
      {order.map((e) => {
        const tall = e.rank === 1 ? 'h-40' : e.rank === 2 ? 'h-32' : 'h-24';
        return (
          <div key={e.submissionId} className="flex w-28 flex-col items-center gap-2 sm:w-40">
            {e.rank === 1 ? <Crown className="text-amber-500" size={26} /> : <Medal className="text-slate-400" size={22} />}
            <p className="line-clamp-1 text-center text-sm font-extrabold text-slate-900">{e.teamName}</p>
            <p className="line-clamp-1 text-center text-[11px] text-slate-500">{e.title}</p>
            <div className={`flex w-full ${tall} flex-col items-center justify-start rounded-t-2xl bg-gradient-to-b pt-3 ${PODIUM_STYLE[e.rank - 1] ?? PODIUM_STYLE[2]}`}>
              <span className="text-3xl font-black">{e.rank}</span>
              <span className="text-xs font-bold opacity-80">{e.averageScore?.toFixed(1)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function LeaderboardTable({
  entries,
  highlightTeamId,
  onSelect,
  criteria,
}: {
  entries: LeaderboardEntry[];
  highlightTeamId?: string | null;
  onSelect?: (entry: LeaderboardEntry) => void;
  criteria?: { id: string; name: string }[];
}) {
  if (entries.length === 0) {
    return <p className="py-6 text-center text-xs font-medium text-slate-400">No submitted projects yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <th className="py-2.5 pr-3">Rank</th>
            <th className="py-2.5 pr-3">Team · Project</th>
            <th className="py-2.5 pr-3">Track</th>
            {criteria?.map((c) => (
              <th key={c.id} className="py-2.5 pr-3 text-right">{c.name}</th>
            ))}
            <th className="py-2.5 pr-3 text-right">Judges</th>
            <th className="py-2.5 text-right">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {entries.map((e) => (
            <tr
              key={e.submissionId}
              onClick={onSelect ? () => onSelect(e) : undefined}
              className={`${onSelect ? 'cursor-pointer hover:bg-slate-50' : ''} ${e.teamId === highlightTeamId ? 'bg-amber-50/70 dark:bg-amber-500/10' : ''}`}
            >
              <td className="py-3 pr-3">
                {e.rank > 0 ? (
                  <span className={`inline-flex size-7 items-center justify-center rounded-full text-xs font-black ${e.rank <= 3 ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200' : 'bg-slate-100 text-slate-600'}`}>
                    {e.rank}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </td>
              <td className="py-3 pr-3">
                <p className="font-bold text-slate-900">{e.teamName}</p>
                <p className="text-xs text-slate-500">{e.title}</p>
                {e.awards.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {e.awards.map((a) => (
                      <Chip key={a} tone="amber">
                        <Trophy size={10} /> {a}
                      </Chip>
                    ))}
                  </div>
                )}
              </td>
              <td className="py-3 pr-3 text-xs text-slate-500">{e.trackName ?? '—'}</td>
              {criteria?.map((c) => (
                <td key={c.id} className="py-3 pr-3 text-right text-xs tabular-nums text-slate-600">
                  {e.criterionAverages[c.id] != null ? Number(e.criterionAverages[c.id]).toFixed(1) : '—'}
                </td>
              ))}
              <td className="py-3 pr-3 text-right text-xs tabular-nums text-slate-500">{e.finalEvaluations}</td>
              <td className="py-3 text-right font-black tabular-nums text-slate-900">{e.averageScore != null ? Number(e.averageScore).toFixed(2) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
