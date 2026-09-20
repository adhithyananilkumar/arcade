import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  myEnrollmentKeys,
  useMyEnrollmentsQuery,
  useMyEnrollmentForResourceQuery,
  useMyEventsQuery,
} from './myEnrollments.queries';
import { MyEnrollmentsService } from './myEnrollments.service';

vi.mock('./myEnrollments.service', () => ({
  MyEnrollmentsService: {
    list: vi.fn(),
    getForResource: vi.fn(),
    listEvents: vi.fn(),
  },
}));

function createWrapper(client = new QueryClient({ defaultOptions: { queries: { retry: false } } })) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { Wrapper, client };
}

const emptyPage = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: 20,
  first: true,
  last: true,
};

beforeEach(() => vi.clearAllMocks());

describe('myEnrollmentKeys — stable, domain-namespaced, prefix-invalidatable', () => {
  it('namespaces every key under the same root so one invalidation covers all three reads', () => {
    const root = myEnrollmentKeys.all;
    expect(root).toEqual(['me', 'enrollments']);
    expect(myEnrollmentKeys.list({}).slice(0, 2)).toEqual(root);
    expect(myEnrollmentKeys.resource('COURSE', 'c1').slice(0, 2)).toEqual(root);
    expect(myEnrollmentKeys.events('ALL', 0, 20).slice(0, 2)).toEqual(root);
  });

  it('produces a distinct key per parameter set, so paging does not reuse a stale page', () => {
    expect(myEnrollmentKeys.list({ page: 0 })).not.toEqual(myEnrollmentKeys.list({ page: 1 }));
    expect(myEnrollmentKeys.events('UPCOMING', 0, 20)).not.toEqual(
      myEnrollmentKeys.events('PAST', 0, 20)
    );
  });
});

describe('useMyEnrollmentsQuery', () => {
  it('does not fire while disabled — an anonymous visitor never calls an authenticated endpoint', () => {
    const { Wrapper } = createWrapper();
    renderHook(() => useMyEnrollmentsQuery({}, false), { wrapper: Wrapper });
    expect(MyEnrollmentsService.list).not.toHaveBeenCalled();
  });

  it('passes the caller\'s filter/sort/pagination straight through to the service', async () => {
    vi.mocked(MyEnrollmentsService.list).mockResolvedValue(emptyPage);
    const { Wrapper } = createWrapper();
    const params = {
      resourceType: 'COURSE' as const,
      page: 2,
      size: 12,
      sort: 'updatedAt' as const,
      direction: 'desc' as const,
    };
    const { result } = renderHook(() => useMyEnrollmentsQuery(params), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(MyEnrollmentsService.list).toHaveBeenCalledWith(params);
  });

  it('surfaces an empty library as a successful empty page, not an error', async () => {
    vi.mocked(MyEnrollmentsService.list).mockResolvedValue(emptyPage);
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useMyEnrollmentsQuery({}), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.content).toEqual([]);
    expect(result.current.isError).toBe(false);
  });

  it('starts in a loading state rather than rendering an empty library first', () => {
    vi.mocked(MyEnrollmentsService.list).mockReturnValue(new Promise(() => {}));
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useMyEnrollmentsQuery({}), { wrapper: Wrapper });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useMyEnrollmentForResourceQuery', () => {
  it('does not fire for an undefined resource id', () => {
    const { Wrapper } = createWrapper();
    renderHook(() => useMyEnrollmentForResourceQuery('COURSE', undefined), { wrapper: Wrapper });
    expect(MyEnrollmentsService.getForResource).not.toHaveBeenCalled();
  });

  it('resolves not-enrolled normally — it is a state, not an error', async () => {
    vi.mocked(MyEnrollmentsService.getForResource).mockResolvedValue({
      resourceType: 'COURSE',
      resourceId: 'c1',
      enrolled: false,
      enrollment: null,
    });
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useMyEnrollmentForResourceQuery('COURSE', 'c1'), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.enrolled).toBe(false);
    expect(result.current.isError).toBe(false);
  });
});

describe('useMyEventsQuery', () => {
  it('does not fire while disabled', () => {
    const { Wrapper } = createWrapper();
    renderHook(() => useMyEventsQuery('UPCOMING', 0, 20, false), { wrapper: Wrapper });
    expect(MyEnrollmentsService.listEvents).not.toHaveBeenCalled();
  });

  it('asks the server for the timeframe — upcoming/past is not decided in the browser', async () => {
    vi.mocked(MyEnrollmentsService.listEvents).mockResolvedValue(emptyPage);
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useMyEventsQuery('PAST', 1, 12), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(MyEnrollmentsService.listEvents).toHaveBeenCalledWith('PAST', 1, 12);
  });
});
