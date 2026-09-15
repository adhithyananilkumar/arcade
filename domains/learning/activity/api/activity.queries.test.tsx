import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useActivitySummaryQuery, useDailyActivityQuery } from './activity.queries';
import { ActivityService } from './activity.service';

vi.mock('./activity.service', () => ({
  ActivityService: {
    getSummary: vi.fn(),
    getDailyActivity: vi.fn(),
  },
}));

function createWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

describe('useActivitySummaryQuery (streak rendering source)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does not fetch when disabled', () => {
    renderHook(() => useActivitySummaryQuery(false), { wrapper: createWrapper() });
    expect(ActivityService.getSummary).not.toHaveBeenCalled();
  });

  it('resolves currentStreak/longestStreak for the caller to render directly (no client-side recomputation)', async () => {
    (ActivityService.getSummary as any).mockResolvedValue({
      currentStreak: 5, longestStreak: 12, activeToday: true, lastActiveDate: '2026-08-17',
    });
    const { result } = renderHook(() => useActivitySummaryQuery(true), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.currentStreak).toBe(5);
    expect(result.current.data?.longestStreak).toBe(12);
  });

  it('exposes an error state on failure rather than silently defaulting the streak', async () => {
    (ActivityService.getSummary as any).mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useActivitySummaryQuery(true), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useDailyActivityQuery (heatmap data)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does not fetch when disabled', () => {
    renderHook(() => useDailyActivityQuery('2026-01-01', '2026-12-31', false), { wrapper: createWrapper() });
    expect(ActivityService.getDailyActivity).not.toHaveBeenCalled();
  });

  it('returns an empty array as a real empty state, not undefined, once resolved', async () => {
    (ActivityService.getDailyActivity as any).mockResolvedValue([]);
    const { result } = renderHook(
      () => useDailyActivityQuery('2026-01-01', '2026-12-31', true),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});
