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
