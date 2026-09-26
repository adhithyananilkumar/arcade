/**
 * The public, read-side shape of an event.
 *
 * Mirrors the backend `EventDto` record field for field. Distinct from the authoring types in
 * `event.types.ts`, which describe the wizard's working state: this is what the server returns for
 * a published event, and consumers on the learner side read it directly.
 */

export type EventStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PUBLISHED'
  | 'UNPUBLISHED'
  | 'REJECTED'
  | 'ARCHIVED';

export type EventTypeName = 'WORKSHOP' | 'WEBINAR' | 'BOOTCAMP' | 'MASTERCLASS' | 'CONFERENCE';

export type EventDeliveryMode = 'ONLINE' | 'OFFLINE' | 'HYBRID';

export type EventDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';

export type EventVisibility = 'PUBLIC' | 'UNLISTED' | 'PRIVATE' | 'DRAFT_ONLY';

export interface EventDto {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  description: string | null;
  status: EventStatus;
  category: string;
  tags: string[];
  thumbnailUrl: string | null;
  coverImageUrl: string | null;
  promoVideoUrl: string | null;
  eventType: EventTypeName | null;
  deliveryMode: EventDeliveryMode | null;
  difficulty: EventDifficulty | null;
  language: string | null;
  /** Minor units, matching the backend. Zero or null means free. */
  priceAmount: number | null;
  currency: string | null;
  capacity: number | null;
  visibility: EventVisibility;
  createdBy: string | null;
  /** The owning channel — the actual publisher, and what belongs on a byline. */
  channelName: string | null;
  channelId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PagedEvents {
  content: EventDto[];
  totalPages: number;
  totalElements: number;
}

export interface PublishedEventsQuery {
  search?: string;
  category?: string;
  type?: string;
  page?: number;
  size?: number;
}

/** Mirrors the backend `PublishedEventCardDto` — a published event shaped for a discovery card. */
export interface PublishedEventCard {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  category: string;
  /** The owning channel. Never an invented person. */
  host: string | null;
  coverImageUrl: string | null;
  thumbnailUrl: string | null;
  eventType: EventTypeName | null;
  deliveryMode: EventDeliveryMode | null;
  difficulty: EventDifficulty | null;
  priceAmount: number | null;
  currency: string | null;
  capacity: number | null;
  /** ISO date of the earliest session, or null when nothing is scheduled yet. */
  startDate: string | null;
  /** ISO local time of that session. */
  startTime: string | null;
  sessionCount: number;
  /** Total scheduled minutes, or null when no session carries both a start and an end. */
  durationMinutes: number | null;
}

/**
 * The display shape the explore grids render.
 *
 * Derived entirely from a real event. Every field the mock data invented — host, date, status,
 * duration — now comes from the event and its schedule, and says so honestly when it is unknown.
 */
export interface EventCardView {
  id: string;
  slug: string;
  title: string;
  category: string;
  /** Lets a view split bootcamps from webinars without a second request. */
  eventType: EventTypeName | null;
  /** The event's own blurb. Empty when the author wrote none — never invented copy. */
  desc: string;
  host: string;
  date: string;
  status: 'Live Today' | 'Upcoming' | 'Recorded Video' | 'Past';
  duration: string;
  coverImageUrl: string | null;
}

/** One filter option and how many published events it actually has. */
export interface EventFacet {
  value: string;
  count: number;
}

/**
 * What is genuinely on the platform, for building a discovery filter bar.
 *
 * Counts are database totals, not the size of whatever page the client holds — the explore page
 * used to derive its numbers from its own capped page, so they moved with the page size.
 */
export interface EventFacets {
  total: number;
  /** Only categories that have at least one published event, busiest first. */
  categories: EventFacet[];
  types: EventFacet[];
}
