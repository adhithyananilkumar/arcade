import { api } from '@/infrastructure/http/api';
import type {
  CheckInRequest,
  CheckInResponse,
  EventTicket,
  IssueGuestTicketRequest,
  MyEventTicket,
} from '../types/events.types';

/** The holder's own tickets. The only place a QR credential is ever fetched. */
export class MyEventTicketService {
  private static readonly BASE = '/api/v1/me/tickets';

  static async list(): Promise<MyEventTicket[]> {
    return api.get<MyEventTicket[]>(MyEventTicketService.BASE);
  }

  static async get(ticketId: string): Promise<MyEventTicket> {
    return api.get<MyEventTicket>(`${MyEventTicketService.BASE}/${ticketId}`);
  }
}

/** An organiser's view of who holds a seat, and the door they are admitted at. */
export class EventTicketService {
  private static readonly BASE = '/api/v1/events';

  static async listForEvent(eventId: string): Promise<EventTicket[]> {
    return api.get<EventTicket[]>(`${EventTicketService.BASE}/${eventId}/tickets`);
  }

  /** Adds a guest, speaker, or a seat reserved for a partner cohort. */
  static async issueGuestTicket(
    eventId: string,
    request: IssueGuestTicketRequest
  ): Promise<EventTicket> {
    return api.post<EventTicket>(
      `${EventTicketService.BASE}/${eventId}/tickets/guests`,
      request
    );
  }

  /** Promotes a reserved seat to an admissible ticket. */
  static async confirm(eventId: string, ticketId: string): Promise<EventTicket> {
    return api.post<EventTicket>(
      `${EventTicketService.BASE}/${eventId}/tickets/${ticketId}/confirm`
    );
  }

  static async cancel(eventId: string, ticketId: string): Promise<void> {
    await api.delete<void>(`${EventTicketService.BASE}/${eventId}/tickets/${ticketId}`);
  }

  /**
   * Admits somebody at the door.
   *
   * `alreadyAdmitted` on the response is not an error — it means this is the right person and they
   * already came through, which is what the person scanning needs to see.
   */
  static async checkIn(eventId: string, request: CheckInRequest): Promise<CheckInResponse> {
    return api.post<CheckInResponse>(
      `${EventTicketService.BASE}/${eventId}/tickets/check-in`,
      request
    );
  }
}
