import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventTicketService, MyEventTicketService } from './eventTicket.service';
import { EventInvitationClaimService } from './eventInvitation.service';
import { api } from '@/infrastructure/http/api';

vi.mock('@/infrastructure/http/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

describe('ticket and invitation services', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches the holder credential only from the me-scoped route', async () => {
    // The QR payload is a bearer credential. It is served exclusively by routes scoped to the
    // authenticated principal, never by an organiser route that takes an arbitrary id.
    (api.get as any).mockResolvedValue([]);

    await MyEventTicketService.list();

    expect(api.get).toHaveBeenCalledWith('/api/v1/me/tickets');
  });

  it('checks in against the event in the path, so a ticket for another event cannot be used', async () => {
    (api.post as any).mockResolvedValue({});

    await EventTicketService.checkIn('event-1', { code: 'ARC-7F3K-92QD' });

    expect(api.post).toHaveBeenCalledWith('/api/v1/events/event-1/tickets/check-in', {
      code: 'ARC-7F3K-92QD',
    });
  });

  it('sends a guest hold as holdUntil so the seat is reserved rather than admissible', async () => {
    (api.post as any).mockResolvedValue({});

    await EventTicketService.issueGuestTicket('event-1', {
      email: 'guest@example.com',
      holdUntil: '2026-10-01T10:00:00Z',
    });

    expect(api.post).toHaveBeenCalledWith('/api/v1/events/event-1/tickets/guests', {
      email: 'guest@example.com',
      holdUntil: '2026-10-01T10:00:00Z',
    });
  });

  it('validates an invitation on the public route, since the invitee may have no account', async () => {
    (api.get as any).mockResolvedValue({ valid: true });

    await EventInvitationClaimService.validate('tok en/with+chars');

    expect(api.get).toHaveBeenCalledWith(
      '/api/v1/public/event-invitations/validate?token=tok%20en%2Fwith%2Bchars'
    );
  });

  it('claims on the authenticated route', async () => {
    (api.post as any).mockResolvedValue({});

    await EventInvitationClaimService.claim('abc');

    expect(api.post).toHaveBeenCalledWith('/api/v1/event-invitations/claim?token=abc');
  });
});
