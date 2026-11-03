'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Gavel,
  Lightbulb,
  Rocket,
  Search,
  Sparkles,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  Countdown,
  PHASE_LABEL,
  PhaseTimeline,
  TeamBoardService,
  getEventBySlugOrId,
  nextMilestone,
  type TeamBoard,
} from '@/domains/events';
import { PageLoader } from '@/shared/design-system/ui/loader';
import { eventRoutes } from '@/shared/routes/content.routes';
import { MyTeamPanel } from './MyTeamPanel';
import { FindTeamPanel } from './FindTeamPanel';
import { ProjectPanel } from './ProjectPanel';
import { BriefPanel } from './BriefPanel';
import { ResultsPanel } from './ResultsPanel';
import { JoinLinkBanner } from './JoinLinkBanner';
import { errorText } from './hackathonUtils';

type BoardTab = 'team' | 'find' | 'project' | 'brief' | 'results';

/**
 * `/events/{slug}/team` — the hackathon hub.
 *
 * <p>One board read (`GET …/competition/me`) drives everything; every mutation answers with the
 * refreshed board, which replaces the cache, so the page never reconciles local guesses with the
 * server. What a participant may do (teams open? submissions open? captain?) comes from that read.
 */
export function TeamBoardPage({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const joinCode = searchParams?.get('join') ?? null;

  const eventQuery = useQuery({ queryKey: ['events', 'detail', slug], queryFn: () => getEventBySlugOrId(slug), enabled: !!slug });
  const event = eventQuery.data;
  const eventId = event?.id;

  const boardKey = useMemo(() => ['competition', eventId, 'board'] as const, [eventId]);
  const boardQuery = useQuery({
    queryKey: boardKey,
    queryFn: () => TeamBoardService.board(eventId!),
    enabled: !!eventId,
    retry: false,
  });
  const board = boardQuery.data;

  const setBoard = (next: TeamBoard) => queryClient.setQueryData(boardKey, next);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['competition', eventId] });

  const requestedTab = (searchParams?.get('tab') as BoardTab | null) ?? null;
  // Once results are out they are the headline; otherwise the team comes first.
  const defaultTab: BoardTab = board?.results ? 'results' : 'team';
  const [tab, setTab] = useState<BoardTab | null>(null);
  const activeTab = tab ?? requestedTab ?? defaultTab;

  if (eventQuery.isLoading || (eventId && boardQuery.isLoading)) return <PageLoader label="Loading the team board" />;

  if (eventQuery.error || boardQuery.error || !event || !board) {
    return (
      <Shell>
        <div className="py-24 text-center">
          <p className="text-lg font-extrabold text-slate-900">This event has no team board</p>
          <p className="mt-2 text-sm text-slate-500">{errorText(boardQuery.error ?? eventQuery.error, 'The organiser has not set up a team competition for this event.')}</p>
          <Link href={eventRoutes.overview(slug)} className="mt-6 inline-flex rounded-full bg-ink px-6 py-2.5 text-sm font-bold text-on-ink">
            Back to the event
          </Link>
        </div>
      </Shell>
    );
  }

  const s = board.competition.settings;
  const milestone = nextMilestone(s);
  const tabs: { id: BoardTab; label: string; icon: typeof Users; badge?: number }[] = [
    { id: 'team', label: board.team ? 'My team' : 'Get on a team', icon: Users, badge: board.invites.length + (board.team?.pendingRequests?.filter((r) => r.kind === 'REQUEST').length ?? 0) },
    ...(!board.team && s.teamsOpen ? [{ id: 'find' as const, label: 'Find a team', icon: Search }] : []),
    ...(board.team ? [{ id: 'project' as const, label: 'Project', icon: Rocket }] : []),
    { id: 'brief', label: 'Brief & prizes', icon: BookOpen },
    ...(board.results ? [{ id: 'results' as const, label: 'Results', icon: Trophy }] : []),
  ];
  const visibleTab = tabs.some((t) => t.id === activeTab) ? activeTab : tabs[0].id;

  return (
    <Shell>
      <Link href={`${eventRoutes.overview(slug)}?view=sessions`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900">
        <ArrowLeft size={16} /> Sessions & resources
      </Link>

      {/* Hero — fixed dark palette in every theme, so the timeline reads the same everywhere. */}
      <section
        className="relative overflow-hidden rounded-[28px] p-6 text-white shadow-[0_24px_60px_-24px_rgba(30,27,75,0.6)] sm:p-8"
        style={{ background: 'radial-gradient(120% 140% at 0% 0%, #3b2a8c 0%, #141438 45%, #090b1a 100%)' }}
      >
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full opacity-40 blur-3xl" style={{ background: '#f59e0b' }} />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 size-72 rounded-full opacity-30 blur-3xl" style={{ background: '#22d3ee' }} />
        <div className="relative flex flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-amber-300">
                <Sparkles size={13} /> {s.formatLabel} · {PHASE_LABEL[s.phase]}
              </p>
              <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">{event.title}</h1>
              {event.subtitle && <p className="mt-2 max-w-2xl text-sm text-white/70">{event.subtitle}</p>}
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                <HeroPill icon={Users}>
                  Teams of {s.minTeamSize === s.maxTeamSize ? s.maxTeamSize : `${s.minTeamSize}–${s.maxTeamSize}`}
                </HeroPill>
                {board.competition.tracks.length > 0 && <HeroPill icon={Lightbulb}>{board.competition.tracks.length} tracks</HeroPill>}
                {board.competition.awards.length > 0 && <HeroPill icon={Trophy}>{board.competition.awards.length} prizes</HeroPill>}
              </div>
            </div>
            {milestone && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white/60">
                  <CalendarDays size={12} /> {milestone.label} in
                </p>
                <Countdown at={milestone.at} />
              </div>
            )}
          </div>
          <PhaseTimeline phase={s.phase} />
        </div>
      </section>

      {!board.registered && !board.judge && (
        <Callout tone="amber" title="Register to compete">
          Only registered participants can join or create a team.{' '}
          <Link href={eventRoutes.landing(slug)} className="font-bold underline">
            Register for {event.title}
          </Link>{' '}
          and come back — any invites you have will be waiting here.
        </Callout>
      )}
      {board.judge && (
        <Callout tone="violet" title="You are judging this event">
          Judges can’t join teams.{' '}
          <Link href={eventRoutes.judge(slug)} className="inline-flex items-center gap-1 font-bold underline">
            <Gavel size={13} /> Open the judging workspace
          </Link>
        </Callout>
      )}

      {joinCode && !board.team && (
        <JoinLinkBanner
          eventId={event.id}
          code={joinCode}
          registered={board.registered}
          teamsOpen={s.teamsOpen}
          landingHref={eventRoutes.landing(slug)}
          onJoined={(next) => {
            setBoard(next);
            router.replace(eventRoutes.team(slug), { scroll: false });
            toast.success(`Welcome to ${next.team?.name ?? 'the team'}!`);
          }}
          onDismiss={() => router.replace(eventRoutes.team(slug), { scroll: false })}
        />
      )}

      <nav className="sticky top-16 z-10 -mx-1 flex gap-1 overflow-x-auto rounded-full border border-slate-200/80 bg-surface/90 p-1 shadow-sm backdrop-blur" aria-label="Team board sections">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
              visibleTab === t.id ? 'bg-ink text-on-ink shadow' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <t.icon size={14} /> {t.label}
            {!!t.badge && <span className={`rounded-full px-1.5 text-[10px] ${visibleTab === t.id ? 'bg-on-ink/20 text-on-ink' : 'bg-rose-500 text-white'}`}>{t.badge}</span>}
          </button>
        ))}
      </nav>

      {visibleTab === 'team' && (
        <MyTeamPanel eventId={event.id} eventSlug={slug} board={board} onBoard={setBoard} onRefresh={refresh} onFindTeam={() => setTab('find')} />
      )}
      {visibleTab === 'find' && <FindTeamPanel eventId={event.id} board={board} onBoard={setBoard} />}
      {visibleTab === 'project' && board.team && (
        <ProjectPanel eventId={event.id} board={board} onSaved={(submission) => setBoard({ ...board, submission })} />
      )}
      {visibleTab === 'brief' && <BriefPanel competition={board.competition} />}
      {visibleTab === 'results' && board.results && (
        <ResultsPanel eventId={event.id} results={board.results} competition={board.competition} myTeamId={board.team?.id ?? null} />
      )}

      {!board.team && board.registered && s.teamsOpen && visibleTab === 'team' && board.invites.length === 0 && (
        <p className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <UserPlus size={13} /> Tip: a teammate can send you their invite link — it drops you straight into their team.
        </p>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-page-bg theme-wallpaper-frost min-h-screen w-full bg-surface text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-28 pt-28 sm:px-6">{children}</div>
    </div>
  );
}

function HeroPill({ icon: Icon, children }: { icon: typeof Users; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-white/90">
      <Icon size={12} /> {children}
    </span>
  );
}

export function Callout({ tone, title, children }: { tone: 'amber' | 'violet' | 'blue'; title: string; children: React.ReactNode }) {
  const tones = {
    amber: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100',
    violet: 'border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-100',
    blue: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-100',
  };
  return (
    <div className={`rounded-2xl border px-5 py-4 text-sm ${tones[tone]}`}>
      <p className="font-extrabold">{title}</p>
      <p className="mt-1 opacity-90">{children}</p>
    </div>
  );
}
