import { api } from '@/infrastructure/http/api';
import type { MyEventRegistration, ResourceType } from '../types/events.types';

/**
 * Registering for an event, and reading back the caller's own registration.
 *
 * Replaces `app/(public)/workshop/api/registration.ts`, which posted
 * `resourceType: 'WORKSHOP'` — a value the backend enum no longer has, so every call 400'd — and
 * sent no idempotency key at all.
 */
export class EventRegistrationService {
  private static readonly BASE = '/api/v1/events';

  private static readonly RESOURCE_TYPE: ResourceType = 'EVENT';

  /**
   * Registers the caller for an event.
   *
   * The idempotency key is required by this signature rather than generated here on purpose: a key
   * minted per call is a key that changes on every retry, which makes the server's replay path
   * unreachable for exactly the requests that need it. Callers pass one stable key per logical
   * attempt and reuse it when retrying.
   */
  static async register(eventId: string, idempotencyKey: string) {
    return api.post('/api/v1/enrollments', {
      resourceType: EventRegistrationService.RESOURCE_TYPE,
      resourceId: eventId,
      idempotencyKey,
    });
  }

  /**
   * The caller's own registration, or null when they have none.
   *
   * A 404 is the expected answer for "not registered", not a failure, so it is translated rather
   * than thrown.
   */
  static async getMine(eventId: string): Promise<MyEventRegistration | null> {
    try {
      return await api.get<MyEventRegistration>(
        `${EventRegistrationService.BASE}/${eventId}/participants/me`
      );
    } catch (error: unknown) {
      if (EventRegistrationService.isNotFound(error)) {
        return null;
      }
      throw error;
    }
  }

  private static isNotFound(error: unknown): boolean {
    const status = (error as { status?: number })?.status;
    if (status === 404) return true;
    // The shared client does not expose a status on every error path, so the message is the
    // fallback rather than the primary check.
    return Boolean((error as { message?: string })?.message?.includes('404'));
  }
}
