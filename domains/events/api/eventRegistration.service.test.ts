import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventRegistrationService } from './eventRegistration.service';
import { api } from '@/infrastructure/http/api';

vi.mock('@/infrastructure/http/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}));

describe('EventRegistrationService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('registers with resourceType EVENT, not the removed WORKSHOP value', async () => {
    // The whole reason this service exists. The file it replaced posted resourceType: 'WORKSHOP',
    // which the backend enum no longer has, so every registration attempt 400'd -- silently, from
    // two live components.
    (api.post as any).mockResolvedValue({});

    await EventRegistrationService.register('event-1', 'key-1');

    expect(api.post).toHaveBeenCalledWith('/api/v1/enrollments', {
      resourceType: 'EVENT',
      resourceId: 'event-1',
      idempotencyKey: 'key-1',
    });
  });

  it('sends the caller-supplied idempotency key rather than minting one', async () => {
    // A key minted per call changes on every retry, which makes the server's replay path
    // unreachable for exactly the requests that need it.
    (api.post as any).mockResolvedValue({});

    await EventRegistrationService.register('event-1', 'stable-key');
    await EventRegistrationService.register('event-1', 'stable-key');

    const keys = (api.post as any).mock.calls.map((call: unknown[]) => (call[1] as any).idempotencyKey);
    expect(keys).toEqual(['stable-key', 'stable-key']);
  });

  it('getMine() returns the registration when there is one', async () => {
    const registration = { id: 'r1', eventId: 'event-1', registrationStatus: 'APPROVED' };
    (api.get as any).mockResolvedValue(registration);

    await expect(EventRegistrationService.getMine('event-1')).resolves.toBe(registration);
    expect(api.get).toHaveBeenCalledWith('/api/v1/events/event-1/participants/me');
  });

  it('getMine() treats a 404 as "not registered" rather than an error', async () => {
    // Not being registered is the expected answer for most visitors, not a failure.
    (api.get as any).mockRejectedValue({ status: 404 });

    await expect(EventRegistrationService.getMine('event-1')).resolves.toBeNull();
  });

  it('getMine() falls back to the message when no status is exposed', async () => {
    (api.get as any).mockRejectedValue(new Error('Request failed with 404'));

    await expect(EventRegistrationService.getMine('event-1')).resolves.toBeNull();
  });

  it('getMine() rethrows anything that is not a 404', async () => {
    // A 500 must not be reported to the learner as "you are not registered".
    const serverError = { status: 500, message: 'boom' };
    (api.get as any).mockRejectedValue(serverError);

    await expect(EventRegistrationService.getMine('event-1')).rejects.toBe(serverError);
  });
});
