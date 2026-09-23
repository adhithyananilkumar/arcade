import { api } from '@/infrastructure/http/api';
import type {
  EventDto,
  EventFacets,
  PagedEvents,
  PublishedEventCard,
  PublishedEventsQuery,
} from '../types/eventDiscovery.types';

/**
 * Reading published events — the learner-facing discovery path.
 *
 * Moved here from `app/(public)/events/api/event.service.ts`. A domain, not a route folder, because
 * three consumers under `apps/learner` depend on it and none of them live under that route.
 */
export class EventDiscoveryService {
  private static readonly BASE = '/api/v1/events';

  /**
   * Published events, filtered and paged.
   *
   * Undefined params are dropped rather than serialised as the string "undefined", which is what a
   * blanket `new URLSearchParams(params)` does.
   */
  static async getPublishedEvents(params?: PublishedEventsQuery): Promise<PagedEvents> {
    return api.get<PagedEvents>(`${EventDiscoveryService.BASE}/published${buildQuery(params)}`);
  }

  /** Published events shaped for a discovery card — carries the schedule the grid needs. */
  static async getPublishedEventCards(
    params?: PublishedEventsQuery
  ): Promise<{ content: PublishedEventCard[]; totalPages: number; totalElements: number }> {
    return api.get(`${EventDiscoveryService.BASE}/published/cards${buildQuery(params)}`);
  }

  /** Category and type counts across everything published. */
  static async getPublishedFacets(): Promise<EventFacets> {
    return api.get<EventFacets>(`${EventDiscoveryService.BASE}/published/facets`);
  }

  static async getEventById(id: string): Promise<EventDto> {
    return api.get<EventDto>(`${EventDiscoveryService.BASE}/${id}`);
  }

  static async getEventBySlug(slug: string): Promise<EventDto> {
    return api.get<EventDto>(`${EventDiscoveryService.BASE}/slug/${encodeURIComponent(slug)}`);
  }

  /**
   * Resolves whatever the route handed us.
   *
   * The public event route is `/events/[slug]`, but the same component is reachable with an id
   * from the studio preview. Sending a slug to the by-id endpoint is what produced
   * `Invalid parameter 'id'` on every event page — the server parses that path segment as a UUID.
   */
  static async getEventBySlugOrId(slugOrId: string): Promise<EventDto> {
    return UUID_PATTERN.test(slugOrId)
      ? EventDiscoveryService.getEventById(slugOrId)
      : EventDiscoveryService.getEventBySlug(slugOrId);
  }
}

/**
 * Serialises only the params that were actually set.
 *
 * A blanket `new URLSearchParams(params)` turns an absent filter into the literal string
 * "undefined", which the server then tries to match.
 */
function buildQuery(params?: PublishedEventsQuery): string {
  const query = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });
  return query.toString() ? `?${query.toString()}` : '';
}

/** Canonical 8-4-4-4-12 hex form, which is what Spring will accept for a UUID path variable. */
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Function-shaped aliases, kept because the existing call sites import them by these names.
 * Renaming the call sites at the same time as relocating the module would hide a regression
 * inside a refactor.
 */
export const getPublishedEvents = EventDiscoveryService.getPublishedEvents;
export const getPublishedEventCards = EventDiscoveryService.getPublishedEventCards;
export const getPublishedFacets = EventDiscoveryService.getPublishedFacets;
export const getEventById = EventDiscoveryService.getEventById;
export const getEventBySlug = EventDiscoveryService.getEventBySlug;
export const getEventBySlugOrId = EventDiscoveryService.getEventBySlugOrId;
