import { api } from '@/infrastructure/http/api';
import type {
  EventDto,
  PagedEvents,
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
    const query = new URLSearchParams();
    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, String(value));
      }
    });
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return api.get<PagedEvents>(`${EventDiscoveryService.BASE}/published${suffix}`);
  }

  static async getEventById(id: string): Promise<EventDto> {
    return api.get<EventDto>(`${EventDiscoveryService.BASE}/${id}`);
  }
}

/**
 * Function-shaped aliases, kept because the existing call sites import them by these names.
 * Renaming the call sites at the same time as relocating the module would hide a regression
 * inside a refactor.
 */
export const getPublishedEvents = EventDiscoveryService.getPublishedEvents;
export const getEventById = EventDiscoveryService.getEventById;
