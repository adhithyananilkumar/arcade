import { api } from '@/infrastructure/http/api';
import type {
  EventInvitation,
  EventInvitationValidation,
} from '../types/events.types';

/** An organiser controlling who may register for a private event. */
export class EventInvitationService {
  private static readonly BASE = '/api/v1/events';

  static async listForEvent(eventId: string): Promise<EventInvitation[]> {
    return api.get<EventInvitation[]>(`${EventInvitationService.BASE}/${eventId}/invitations`);
  }

  static async invite(eventId: string, email: string): Promise<EventInvitation> {
    return api.post<EventInvitation>(
      `${EventInvitationService.BASE}/${eventId}/invitations`,
      { email }
    );
  }

  static async revoke(eventId: string, invitationId: string): Promise<void> {
    await api.delete<void>(
      `${EventInvitationService.BASE}/${eventId}/invitations/${invitationId}`
    );
  }
}

/** The invitee's side: look at an invitation, then take it up. */
export class EventInvitationClaimService {
  /**
   * Unauthenticated, and a pure read — the invitee may have no account yet, and opening the link
   * to see what it is must not consume the offer.
   */
  static async validate(token: string): Promise<EventInvitationValidation> {
    return api.get<EventInvitationValidation>(
      `/api/v1/public/event-invitations/validate?token=${encodeURIComponent(token)}`
    );
  }

  /** Requires a signed-in user whose address matches the one invited. */
  static async claim(token: string): Promise<EventInvitation> {
    return api.post<EventInvitation>(
      `/api/v1/event-invitations/claim?token=${encodeURIComponent(token)}`
    );
  }
}
