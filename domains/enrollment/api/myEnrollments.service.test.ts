import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MyEnrollmentsService } from './myEnrollments.service';
import { api } from '@/infrastructure/http/api';

vi.mock('@/infrastructure/http/api', () => ({
  api: { get: vi.fn() },
}));

const emptyPage = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: 20,
  first: true,
  last: true,
};

describe('MyEnrollmentsService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('list() hits the self-service endpoint with no user id anywhere in the request', async () => {
    (api.get as any).mockResolvedValue(emptyPage);

    await MyEnrollmentsService.list();

    expect(api.get).toHaveBeenCalledWith('/api/v1/me/enrollments');
  });

  it('list() serialises filters, paging and sort as query params', async () => {
    (api.get as any).mockResolvedValue(emptyPage);

    await MyEnrollmentsService.list({
      resourceType: 'COURSE',
      page: 2,
      size: 50,
      sort: 'enrolledAt',
      direction: 'desc',
    });

    expect(api.get).toHaveBeenCalledWith(
      '/api/v1/me/enrollments?resourceType=COURSE&page=2&size=50&sort=enrolledAt&direction=desc'
    );
  });

  it('list() repeats the status param rather than joining it, matching the backend contract', async () => {
    (api.get as any).mockResolvedValue(emptyPage);

    await MyEnrollmentsService.list({ status: ['GRANTED', 'REVOKED'] });

    expect(api.get).toHaveBeenCalledWith(
      '/api/v1/me/enrollments?status=GRANTED&status=REVOKED'
    );
  });

  it('getForResource() addresses the enrollment by resource type and id', async () => {
    (api.get as any).mockResolvedValue({
      resourceType: 'COURSE',
      resourceId: 'course-1',
      enrolled: false,
      enrollment: null,
    });

    const result = await MyEnrollmentsService.getForResource('COURSE', 'course-1');

    expect(api.get).toHaveBeenCalledWith('/api/v1/me/enrollments/COURSE/course-1');
    // Not-enrolled resolves normally — it is a state, not an error.
    expect(result.enrolled).toBe(false);
    expect(result.enrollment).toBeNull();
  });

  it('listEvents() defaults to the full timeframe and a bounded page', async () => {
    (api.get as any).mockResolvedValue(emptyPage);

    await MyEnrollmentsService.listEvents();

    expect(api.get).toHaveBeenCalledWith('/api/v1/me/events?timeframe=ALL&page=0&size=20');
  });

  it('listEvents() passes an explicit timeframe through', async () => {
    (api.get as any).mockResolvedValue(emptyPage);

    await MyEnrollmentsService.listEvents('UPCOMING', 1, 10);

    expect(api.get).toHaveBeenCalledWith('/api/v1/me/events?timeframe=UPCOMING&page=1&size=10');
  });
});
