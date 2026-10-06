'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, Clock, KeyRound, Lock, MapPin, Video } from 'lucide-react';
import { api, ApiError } from '@/infrastructure/http/api';
import { getEventBySlugOrId } from '@/domains/events';
import { TiptapContentView } from '@/domains/learning';
import { eventRoutes } from '@/shared/routes/content.routes';

/** Mirrors the backend `EventSessionContentDto`, narrowed to what this page renders. */
interface SessionContent {
  session: {
    id: string;
    title: string;
    description?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    timezone?: string | null;
    deliveryMode?: string | null;
    locationDetails?: string | null;
    meetingUrl?: string | null;
    meetingId?: string | null;
    meetingPasscode?: string | null;
  };
  released: boolean;
  /** When the Day unlocks; null once released, or when it waits on a manual release. */
  releasesAt: string | null;
  lessons: { id: string; title: string; position?: number | null; body: string | null }[];
}

/**
 * `/events/{slug}/learn/{sessionId}` — one Day of an event, as a registered learner opens it.
 *
 * <p>The Day is the unit learners open: its lessons (agenda, notes, instructions) and its join
 * link live together here, rather than the overview linking straight to a meeting. Both unlock on
 * the Day's release setting, which the backend enforces — this page only explains the state it is
 * given, and re-reads itself at the release moment so a learner waiting on it isn't left stale.
 */
export default function EventSessionRoute() {
  const params = useParams<{ slug: string; sessionId: string }>();
  const slug = params.slug as string;
  const sessionId = params.sessionId as string;

  const eventQuery = useQuery({
    queryKey: ['events', 'detail', slug],
    queryFn: () => getEventBySlugOrId(slug),
    enabled: Boolean(slug),
  });
  const eventId = eventQuery.data?.id;

  const contentQuery = useQuery({
    queryKey: ['events', 'session-content', eventId, sessionId],
    queryFn: () => api.get<SessionContent>(`/api/v1/events/${eventId}/sessions/${sessionId}/content`),
    enabled: Boolean(eventId && sessionId),
    retry: false,
  });

  const releasesAt = contentQuery.data?.releasesAt;
  const refetch = contentQuery.refetch;
  useEffect(() => {
    if (!releasesAt) return;
    const wait = new Date(releasesAt).getTime() - Date.now();
    // setTimeout's ceiling is ~24.8 days; anything further out is re-read on the next visit.
    if (wait <= 0 || wait > 2_147_000_000) return;
    const timer = setTimeout(() => void refetch(), wait + 1000);
    return () => clearTimeout(timer);
  }, [releasesAt, refetch]);

  const overviewHref = eventRoutes.overview(slug);
  const error = eventQuery.error ?? contentQuery.error;

  return (
    <div className="min-h-screen w-full bg-surface theme-page-bg theme-wallpaper-frost text-slate-900">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        <Link
          href={overviewHref}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} /> {eventQuery.data?.title ?? 'Back to the event'}
        </Link>

        {error ? (
          <Message title="We couldn't open this session" body={describeError(error)} />
        ) : !contentQuery.data ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-2/3 rounded-lg bg-slate-100" />
            <div className="h-24 rounded-2xl bg-slate-100" />
            <div className="h-48 rounded-2xl bg-slate-100" />
          </div>
        ) : (
          <SessionView content={contentQuery.data} />
        )}
      </div>
    </div>
  );
}

function SessionView({ content }: { content: SessionContent }) {
  const { session, released, releasesAt, lessons } = content;
  const when = formatSchedule(session);

  return (
    <>
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{session.title}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
          {when.date && (
            <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> {when.date}</span>
          )}
          {when.time && (
            <span className="inline-flex items-center gap-1.5"><Clock size={14} /> {when.time}</span>
          )}
          {session.locationDetails && (
            <span className="inline-flex items-center gap-1.5"><MapPin size={14} /> {session.locationDetails}</span>
          )}
        </div>
        {session.description && <p className="text-sm leading-relaxed text-slate-600">{session.description}</p>}
      </header>

      {released ? (
        session.meetingUrl && (
          <section className="rounded-2xl border border-slate-200 bg-surface p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Video size={16} /> Join this session
            </div>
            <a
              href={session.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-on-ink hover:bg-ink-hover transition-colors"
            >
              Open meeting
            </a>
            {(session.meetingId || session.meetingPasscode) && (
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                {session.meetingId && <span>Meeting ID: <span className="font-mono font-semibold text-slate-700">{session.meetingId}</span></span>}
                {session.meetingPasscode && (
                  <span className="inline-flex items-center gap-1">
                    <KeyRound size={12} /> Passcode: <span className="font-mono font-semibold text-slate-700">{session.meetingPasscode}</span>
                  </span>
                )}
              </div>
            )}
          </section>
        )
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-surface p-5 flex items-start gap-3">
          <Lock size={18} className="mt-0.5 shrink-0 text-slate-400" />
          <div>
            <p className="text-sm font-bold text-slate-900">This session hasn&apos;t opened yet</p>
            <p className="text-sm text-slate-500 mt-0.5">
              {releasesAt
                ? `Its content and join link open ${formatDateTime(releasesAt)}.`
                : 'Its content and join link open when the organisers release it.'}
            </p>
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">In this session</h2>
        {lessons.length === 0 ? (
          <p className="text-sm text-slate-500">The organisers haven&apos;t added any material to this session.</p>
        ) : (
          lessons.map((lesson) => (
            <article key={lesson.id} className="rounded-2xl border border-slate-200 bg-surface p-5 sm:p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                {!released && <Lock size={14} className="text-slate-400" />}
                {lesson.title}
              </h3>
              {released ? (
                lesson.body ? (
                  <TiptapContentView body={lesson.body} />
                ) : (
                  <p className="text-sm text-slate-400 italic">Nothing written here yet.</p>
                )
              ) : (
                <p className="text-sm text-slate-400">Available once the session opens.</p>
              )}
            </article>
          ))
        )}
      </section>
    </>
  );
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-surface p-8 text-center">
      <p className="text-base font-bold text-slate-900">{title}</p>
      <p className="text-sm text-slate-500 mt-1">{body}</p>
    </div>
  );
}

function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.isNetworkError) return error.message;
    if (error.status === 404) return 'This session no longer exists, or the event has not been published.';
    return error.message;
  }
  return 'Something went wrong loading this session.';
}

function formatSchedule(s: SessionContent['session']): { date: string | null; time: string | null } {
  const date = s.startDate
    ? new Date(`${s.startDate}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : null;
  const time = s.startTime
    ? `${s.startTime.slice(0, 5)}${s.endTime ? `–${s.endTime.slice(0, 5)}` : ''}${s.timezone ? ` (${s.timezone})` : ''}`
    : null;
  return { date, time };
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}
