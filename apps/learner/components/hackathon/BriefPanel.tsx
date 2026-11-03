'use client';

import { useState } from 'react';
import { CalendarDays, Gavel, Lightbulb, ScrollText, Trophy } from 'lucide-react';
import { formatCompetitionDate, type Competition } from '@/domains/events';
import { panelClass } from './hackathonUtils';

/** Rules, timeline, tracks, prizes and how projects are judged. */
export function BriefPanel({ competition }: { competition: Competition }) {
  const { settings: s, tracks, criteria, awards } = competition;
  // Read once per mount: past/upcoming dots needn't tick live.
  const [now] = useState(() => Date.now());
  const totalWeight = criteria.reduce((n, c) => n + c.weight, 0) || 1;
  const timeline = [
    { label: 'Submissions open', at: s.submissionOpensAt ?? null },
    { label: 'Teams lock', at: s.teamFormationDeadline },
    { label: 'Submissions close', at: s.submissionDeadline },
    { label: 'Judging ends', at: s.judgingDeadline },
    { label: 'Results', at: s.resultsPublishedAt },
  ].filter((t) => t.at);

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="flex flex-col gap-5 lg:col-span-2">
        {awards.length > 0 && (
          <section className={panelClass}>
            <Heading icon={Trophy}>Prizes</Heading>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {awards.map((a, i) => (
                <li
                  key={a.id}
                  className="relative overflow-hidden rounded-2xl border border-amber-200/70 p-4 dark:border-amber-500/25"
                  style={{ background: i === 0 ? 'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(251,191,36,0.03))' : undefined }}
                >
                  <p className="text-sm font-extrabold text-slate-900">{a.name}</p>
                  {a.prize && <p className="mt-1 text-lg font-black text-amber-600 dark:text-amber-300">{a.prize}</p>}
                  {a.description && <p className="mt-1 text-xs text-slate-500">{a.description}</p>}
                  {a.trackId && <p className="mt-2 text-[11px] font-bold text-violet-600">{tracks.find((t) => t.id === a.trackId)?.name} track</p>}
                  {a.teamName && <p className="mt-2 text-xs font-bold text-emerald-600">Won by {a.teamName}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {tracks.length > 0 && (
          <section className={panelClass}>
            <Heading icon={Lightbulb}>Tracks</Heading>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {tracks.map((t) => (
                <li key={t.id} className="rounded-2xl border border-violet-200/70 bg-violet-50/40 p-4 dark:border-violet-500/25 dark:bg-violet-500/5">
                  <p className="text-sm font-extrabold text-slate-900">{t.name}</p>
                  {t.description && <p className="mt-1 whitespace-pre-line text-xs text-slate-600">{t.description}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className={panelClass}>
          <Heading icon={ScrollText}>Rules</Heading>
          {s.rules ? (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">{s.rules}</p>
          ) : (
            <p className="mt-4 text-sm text-slate-500">The organiser hasn’t posted extra rules.</p>
          )}
          <ul className="mt-4 flex flex-col gap-1.5 text-xs text-slate-600">
            <li>• Teams of {s.minTeamSize === s.maxTeamSize ? s.maxTeamSize : `${s.minTeamSize} to ${s.maxTeamSize}`} registered participants{s.maxTeams ? `, up to ${s.maxTeams} teams` : ''}.</li>
            <li>• One project per team. The submission asks for: {competition.fields.length ? competition.fields.map((f) => f.label + (f.required ? '' : ' (optional)')).join(', ') : 'a project title'}.</li>
            <li>• Judging is blind — judges see your project, never your team.</li>
            <li>• Judges can’t be on a team.</li>
          </ul>
        </section>
      </div>

      <aside className="flex flex-col gap-5">
        <section className={panelClass}>
          <Heading icon={CalendarDays}>Timeline</Heading>
          {timeline.length === 0 ? (
            <p className="mt-3 text-xs text-slate-500">Dates to be announced.</p>
          ) : (
            <ol className="relative ml-1.5 mt-4 space-y-4 border-l-2 border-slate-100">
              {timeline.map((t) => (
                <li key={t.label} className="relative pl-5">
                  <span className={`absolute -left-[5px] mt-1 size-2 rounded-full ${new Date(t.at!).getTime() < now ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                  <p className="text-xs font-bold text-slate-900">{t.label}</p>
                  <p className="text-[11px] text-slate-500">{formatCompetitionDate(t.at)}</p>
                </li>
              ))}
            </ol>
          )}
        </section>

        {criteria.length > 0 && (
          <section className={panelClass}>
            <Heading icon={Gavel}>How you’re judged</Heading>
            <ul className="mt-4 flex flex-col gap-3">
              {criteria.map((c) => {
                const pct = Math.round((c.weight / totalWeight) * 100);
                return (
                  <li key={c.id}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">{c.name}</span>
                      <span className="text-[11px] font-bold text-slate-500">{pct}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${pct}%` }} />
                    </div>
                    {c.description && <p className="mt-1 text-[11px] text-slate-500">{c.description}</p>}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </aside>
    </div>
  );
}

function Heading({ icon: Icon, children }: { icon: typeof Trophy; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
      <Icon size={16} className="text-indigo-500" /> {children}
    </h2>
  );
}
