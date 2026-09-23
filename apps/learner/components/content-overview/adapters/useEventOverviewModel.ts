'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Globe, Layers, Signal, Users, Video } from 'lucide-react';
import { api, ApiError } from '@/infrastructure/http/api';
import { useMyEnrollmentForResourceQuery } from '@/domains/enrollment';
import { getEventBySlugOrId } from '@/domains/events';
import type { EventDto } from '@/domains/events';
import { eventRoutes } from '@/shared/routes/content.routes';
import type {
  ContentOverviewModel,
  OverviewFact,
  OverviewItem,
} from '../contentOverview.types';

/**
 * One scheduled sitting of an event.
 *
 * <p>Mirrors the backend's `EventSessionDto`, narrowed to the fields the overview renders. The
 * meeting fields are redacted server-side for anyone without a granted enrollment, so their
 * absence here is a legitimate state, not a loading gap.
 */
interface EventSession {
  id: string;
  title: string;
  description?: string | null;
  sessionNumber?: number | null;
  startDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  timezone?: string | null;
  deliveryMode?: string | null;
  meetingUrl?: string | null;
}

/**
 * Builds the overview model for an event.
 *
 * <p>The shape is the same as a course's: sessions take the place of lessons, and the schedule
 * takes the place of the syllabus. What differs is that an event has no lesson-completion notion,
 * so {@code progress.percent} is null and the hub draws no ring rather than a permanently empty
 * one — see `OverviewHero`.
 *
 * <p>Sessions are only fetched once the event has resolved, because the sessions endpoint is keyed
 * by event id while the route addresses the event by slug.
 */
export function useEventOverviewModel(slugOrId: string): ContentOverviewModel {
  const eventQuery = useQuery({
    queryKey: ['events', 'detail', slugOrId],
    queryFn: () => getEventBySlugOrId(slugOrId),
    enabled: Boolean(slugOrId),
  });

  const event: EventDto | undefined = eventQuery.data;

  const sessionsQuery = useQuery({
    queryKey: ['events', 'sessions', event?.id],
    queryFn: () => api.get<EventSession[]>(`/api/v1/events/${event!.id}/sessions`),
    enabled: Boolean(event?.id),
    retry: false,
  });

  const enrollmentQuery = useMyEnrollmentForResourceQuery('EVENT', event?.id);

  const sessions = useMemo(
    () =>
      [...(sessionsQuery.data ?? [])].sort(
        (a, b) =>
          (a.sessionNumber ?? 0) - (b.sessionNumber ?? 0) ||
          (a.startDate ?? '').localeCompare(b.startDate ?? ''),
      ),
    [sessionsQuery.data],
  );

  const items: OverviewItem[] = useMemo(
    () =>
      sessions.map((session, index) => ({
        id: session.id,
        title: session.title,
        kind: 'SESSION' as const,
        durationLabel: formatWhen(session),
        // A session is "done" once its day has passed. Deliberately not a completion record:
        // attendance is not tracked, and claiming someone completed a session they may have
        // skipped would be a lie the ring then repeats as a percentage.
        completed: hasPassed(session),
        // Sessions have no player of their own yet, so the only openable thing is the join link,
        // and only for learners the backend chose to reveal it to.
        href: session.meetingUrl ?? null,
        locked: !session.meetingUrl,
        order: index,
      })),
    [sessions],
  );

  const nextSession = useMemo(() => sessions.find((s) => !hasPassed(s)), [sessions]);

  const eventId = event?.id ?? '';

  return {
    contentType: 'EVENT',
    contentId: eventId,
    noteContentType: 'events',

    title: event?.title ?? '',
    subtitle: event?.subtitle ?? null,
    description: event?.description ?? null,
    coverImageUrl: event?.coverImageUrl ?? event?.thumbnailUrl ?? null,
    outcomes: [],

    channel: null,
    people: [],
    facts: buildFacts(event, sessions.length),

    progress: {
      // Events have no percent-complete concept — see the note on `completed` above.
      percent: null,
      completedItems: items.filter((item) => item.completed).length,
      totalItems: items.length,
      state: items.length > 0 && items.every((i) => i.completed) ? 'COMPLETED' : 'IN_PROGRESS',
    },

    resume: nextSession?.meetingUrl
      ? { label: 'Join the next session', itemTitle: nextSession.title, href: nextSession.meetingUrl }
      : null,

    sections: items.length > 0 ? [{ id: 'sessions', title: 'Sessions', items }] : [],

    overviewHref: eventRoutes.overview(slugOrId),
    notesHref: eventRoutes.notes(slugOrId),
    landingHref: eventRoutes.landing(slugOrId),

    isLoading: eventQuery.isLoading || (Boolean(event?.id) && sessionsQuery.isLoading),
    error: describeLoadFailure(eventQuery.error),
    // Never judged from a read that is still in flight. Registering invalidates the enrollment
    // cache and navigates here in the same tick, so a naive read of `enrolled` returns the answer
    // from before the learner registered and tells them they have not — see the course adapter.
    isEntitled:
      enrollmentQuery.data && !enrollmentQuery.isFetching ? enrollmentQuery.data.enrolled : true,
  };
}

function buildFacts(event: EventDto | undefined, sessionCount: number): OverviewFact[] {
  if (!event) return [];

  // Both can genuinely be absent on a draft-shaped event. Omitting the row is better than
  // rendering an empty one, and toTitleCase would previously have thrown on null -- the old type
  // claimed these were always present, so nothing caught it.
  const facts: OverviewFact[] = [];
  if (event.eventType) {
    facts.push({ icon: Layers, label: 'Format', value: toTitleCase(event.eventType) });
  }
  if (event.deliveryMode) {
    facts.push({ icon: Video, label: 'Delivery', value: toTitleCase(event.deliveryMode) });
  }

  if (sessionCount > 0) {
    facts.push({ icon: CalendarDays, label: 'Sessions', value: String(sessionCount) });
  }
  if (event.difficulty) {
    facts.push({ icon: Signal, label: 'Level', value: toTitleCase(event.difficulty) });
  }
  if (event.language) {
    facts.push({ icon: Globe, label: 'Language', value: event.language });
  }
  if (event.capacity) {
    facts.push({ icon: Users, label: 'Capacity', value: `${event.capacity} seats` });
  }
  return facts;
}

/** "12 Mar, 18:00" — date and start time, which is what a schedule row needs at a glance. */
function formatWhen(session: EventSession): string | null {
  if (!session.startDate) return null;

  const date = new Date(session.startDate).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
  return session.startTime ? `${date}, ${session.startTime.slice(0, 5)}` : date;
}

/** Whole days only: a session is past once its date is behind us, regardless of time zone noise. */
function hasPassed(session: EventSession): boolean {
  if (!session.startDate) return false;
  const today = new Date().toISOString().slice(0, 10);
  return session.startDate < today;
}

function toTitleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function describeLoadFailure(error: unknown): string | null {
  if (!error) return null;
  if (error instanceof ApiError) {
    if (error.isNetworkError) return error.message;
    if (error.status === 404) return 'This event no longer exists, or has not been published.';
    return error.message;
  }
  return 'Something went wrong loading this event.';
}
