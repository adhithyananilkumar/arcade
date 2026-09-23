import type { EventCardView, PublishedEventCard } from '../types/eventDiscovery.types';

/**
 * Turns a published event into the shape the explore grids render.
 *
 * Every field here used to be invented. `WEBINARS_DATA` was a fixed list of five webinars with
 * made-up titles, made-up hosts ("Next.js Core Team", "AWS Solution Architect") and made-up times,
 * rendered on the explore pages instead of whatever channels had actually published — and several
 * views additionally relabelled those five with whatever category the visitor had clicked, so the
 * page could never be empty and could never be trusted.
 *
 * Where a real event genuinely does not know something, this says so rather than filling it in.
 */
export function toEventCardView(event: PublishedEventCard): EventCardView {
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    category: event.category,
    host: event.host ?? 'Arcade',
    date: formatSchedule(event),
    status: deriveStatus(event),
    duration: formatDuration(event.durationMinutes),
    coverImageUrl: event.coverImageUrl ?? event.thumbnailUrl,
  };
}

/** "Friday, 10:00 AM" for something near; an explicit absence when nothing is scheduled. */
function formatSchedule(event: PublishedEventCard): string {
  if (!event.startDate) return 'Schedule to be announced';

  const start = toDate(event.startDate, event.startTime);
  const time = event.startTime
    ? start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : null;

  const withinAWeek = Math.abs(start.getTime() - Date.now()) < 7 * 24 * 60 * 60 * 1000;
  const day = withinAWeek
    ? start.toLocaleDateString(undefined, { weekday: 'long' })
    : start.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

  return time ? `${day}, ${time}` : day;
}

/**
 * Live / upcoming / past, from the schedule alone.
 *
 * "Live Today" means it starts today, which is as precise as the data allows — a card has a start
 * time but no authoritative notion of a session being in progress.
 */
function deriveStatus(event: PublishedEventCard): EventCardView['status'] {
  if (!event.startDate) return 'Upcoming';

  const start = toDate(event.startDate, event.startTime);
  const now = new Date();

  const sameDay =
    start.getFullYear() === now.getFullYear() &&
    start.getMonth() === now.getMonth() &&
    start.getDate() === now.getDate();

  if (sameDay) return 'Live Today';
  return start.getTime() > now.getTime() ? 'Upcoming' : 'Past';
}

function formatDuration(minutes: number | null): string {
  if (!minutes || minutes <= 0) return 'Duration TBC';
  if (minutes < 60) return `${minutes} mins`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hr${hours > 1 ? 's' : ''}` : `${hours} hr ${rest} mins`;
}

function toDate(startDate: string, startTime: string | null): Date {
  // The backend sends a LocalDate and a LocalTime, which carry no zone. Reading them in the
  // viewer's own zone is the only interpretation available, and matches how they were authored.
  return new Date(`${startDate}T${startTime ?? '00:00:00'}`);
}
