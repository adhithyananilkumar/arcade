'use client';

import { useQuery } from '@tanstack/react-query';
import { MessageSquareQuote, Trophy } from 'lucide-react';
import {
  CompetitionChip,
  LeaderboardTable,
  Podium,
  SubmissionAnswersView,
  TeamBoardService,
  type Competition,
  type CompetitionResults,
} from '@/domains/events';
import { panelClass } from './hackathonUtils';

/** Podium, full ranking, prizes, the team's own feedback, and the project gallery. */
export function ResultsPanel({
  eventId,
  results,
  competition,
  myTeamId,
}: {
  eventId: string;
  results: CompetitionResults;
  competition: Competition;
  myTeamId: string | null;
}) {
  const gallery = useQuery({
    queryKey: ['competition', eventId, 'gallery'],
    queryFn: () => TeamBoardService.gallery(eventId),
    enabled: competition.settings.galleryAfterResults,
    retry: false,
  });

  return (
    <div className="flex flex-col gap-5">
      {results.myRank != null && (
        <div className="rounded-3xl p-6 text-center text-white shadow-lg" style={{ background: 'linear-gradient(120deg, #b45309, #f59e0b 50%, #fbbf24)' }}>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80">Your team placed</p>
          <p className="mt-1 text-5xl font-black">#{results.myRank}</p>
        </div>
      )}

      <section className={`${panelClass} pt-8`}>
        <Podium entries={results.leaderboard} />
      </section>

      {results.awards.some((a) => a.teamName) && (
        <section className={panelClass}>
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
            <Trophy size={16} className="text-amber-500" /> Award winners
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.awards
              .filter((a) => a.teamName)
              .map((a) => (
                <li key={a.id} className={`rounded-2xl border p-4 ${a.teamId === myTeamId ? 'border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10' : 'border-slate-200'}`}>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{a.name}</p>
                  <p className="mt-1 text-base font-black text-slate-900">{a.teamName}</p>
                  {a.prize && <p className="text-xs font-bold text-amber-600">{a.prize}</p>}
                </li>
              ))}
          </ul>
        </section>
      )}

      {results.myFeedback.length > 0 && (
        <section className={panelClass}>
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
            <MessageSquareQuote size={16} className="text-indigo-500" /> Feedback from the judges
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {results.myFeedback.map((f, i) => (
              <li key={i} className="rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                “{f}”
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={panelClass}>
        <h2 className="mb-4 text-sm font-extrabold text-slate-900">Leaderboard</h2>
        <LeaderboardTable entries={results.leaderboard} highlightTeamId={myTeamId} />
      </section>

      {gallery.data && gallery.data.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-extrabold text-slate-900">Project gallery</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.data.map((p) => (
              <article key={p.id} className={`${panelClass} flex flex-col gap-3`}>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{p.teamName}</p>
                  <h3 className="text-base font-black text-slate-900">{p.title}</h3>
                  {p.tagline && <p className="text-xs text-slate-500">{p.tagline}</p>}
                </div>
                <div className="line-clamp-[10]">
                  <SubmissionAnswersView fields={competition.fields} answers={p.answers} compact />
                </div>
                <div className="flex flex-wrap gap-1">
                  {p.trackName && <CompetitionChip tone="violet">{p.trackName}</CompetitionChip>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
