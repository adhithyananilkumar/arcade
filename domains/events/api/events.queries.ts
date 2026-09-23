import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EventDiscoveryService } from './eventDiscovery.service';
import { EventInvitationService } from './eventInvitation.service';
import { EventRegistrationService } from './eventRegistration.service';
import { EventTicketService, MyEventTicketService } from './eventTicket.service';
import type { CheckInRequest, IssueGuestTicketRequest } from '../types/events.types';
import type { PublishedEventsQuery } from '../types/eventDiscovery.types';
import { toEventCardView } from '../lib/toEventCardView';

/**
 * Query keys for the Events domain.
 *
 * `all` is the invalidation root, matching `myEnrollmentKeys`: registering for an event changes
 * the registration, the ticket list and the seat count at once, so one invalidation refreshes
 * everything that could have moved rather than leaving a stale panel on screen.
 */
export const eventKeys = {
  all: ['events'] as const,
  registration: (eventId: string) => ['events', 'registration', eventId] as const,
  myTickets: () => ['events', 'me', 'tickets'] as const,
  myTicket: (ticketId: string) => ['events', 'me', 'tickets', ticketId] as const,
  tickets: (eventId: string) => ['events', 'tickets', eventId] as const,
  invitations: (eventId: string) => ['events', 'invitations', eventId] as const,
  publishedCards: (params: PublishedEventsQuery) =>
    ['events', 'published', 'cards', params] as const,
};

/**
 * Published events, already mapped to the shape the explore grids render.
 *
 * Mapping here rather than in each view means every grid derives its host, date and duration the
 * same way, from the same event — which is what the six copies of `WEBINARS_DATA` did not.
 */
export function usePublishedEventCardsQuery(
  params: PublishedEventsQuery = {},
  enabled = true
) {
  return useQuery({
    queryKey: eventKeys.publishedCards(params),
    queryFn: async () => {
      const page = await EventDiscoveryService.getPublishedEventCards(params);
      return {
        ...page,
        content: page.content.map(toEventCardView),
      };
    },
    enabled,
  });
}

/** The caller's own registration for one event. Null means "not registered", not an error. */
export function useMyEventRegistrationQuery(eventId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: eventKeys.registration(eventId ?? ''),
    queryFn: () => EventRegistrationService.getMine(eventId as string),
    enabled: enabled && Boolean(eventId),
  });
}

export function useMyTicketsQuery(enabled = true) {
  return useQuery({
    queryKey: eventKeys.myTickets(),
    queryFn: () => MyEventTicketService.list(),
    enabled,
  });
}

export function useMyTicketQuery(ticketId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: eventKeys.myTicket(ticketId ?? ''),
    queryFn: () => MyEventTicketService.get(ticketId as string),
    enabled: enabled && Boolean(ticketId),
  });
}

export function useEventTicketsQuery(eventId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: eventKeys.tickets(eventId ?? ''),
    queryFn: () => EventTicketService.listForEvent(eventId as string),
    enabled: enabled && Boolean(eventId),
  });
}

export function useEventInvitationsQuery(eventId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: eventKeys.invitations(eventId ?? ''),
    queryFn: () => EventInvitationService.listForEvent(eventId as string),
    enabled: enabled && Boolean(eventId),
  });
}

/**
 * Registers for an event.
 *
 * The caller supplies the idempotency key so a retry reuses it. Invalidates the whole domain,
 * because a successful registration also produces a ticket.
 */
export function useRegisterForEventMutation(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idempotencyKey: string) =>
      EventRegistrationService.register(eventId, idempotencyKey),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useIssueGuestTicketMutation(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: IssueGuestTicketRequest) =>
      EventTicketService.issueGuestTicket(eventId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.tickets(eventId) });
    },
  });
}

export function useCancelTicketMutation(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ticketId: string) => EventTicketService.cancel(eventId, ticketId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.tickets(eventId) });
    },
  });
}

/**
 * Admits somebody at the door.
 *
 * Deliberately does not invalidate on success: a person scanning a queue needs the result of
 * *this* scan on screen immediately, and refetching the whole ticket list between scans makes the
 * door slower exactly when it is busiest.
 */
export function useCheckInMutation(eventId: string) {
  return useMutation({
    mutationFn: (request: CheckInRequest) => EventTicketService.checkIn(eventId, request),
  });
}

export function useInviteToEventMutation(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => EventInvitationService.invite(eventId, email),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.invitations(eventId) });
    },
  });
}

export function useRevokeInvitationMutation(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => EventInvitationService.revoke(eventId, invitationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: eventKeys.invitations(eventId) });
    },
  });
}
