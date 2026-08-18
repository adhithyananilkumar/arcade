import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMyInterestsQuery, useUpdateMyInterestsMutation, interestKeys } from './interest.queries';
import { InterestService } from './interest.service';

vi.mock('./interest.service', () => ({
  InterestService: {
    list: vi.fn(),
    getMine: vi.fn(),
    updateMine: vi.fn(),
  },
}));

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return { client, wrapper: ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  ) };
}

describe('useMyInterestsQuery', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does not fetch when disabled (e.g. logged-out / not-yet-authenticated)', () => {
    const { wrapper } = createWrapper();
    renderHook(() => useMyInterestsQuery(false), { wrapper });
    expect(InterestService.getMine).not.toHaveBeenCalled();
  });

  it('fetches the learner selection when enabled', async () => {
    (InterestService.getMine as any).mockResolvedValue([{ id: '1', name: 'AI', slug: 'ai', parentId: null }]);
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useMyInterestsQuery(true), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: '1', name: 'AI', slug: 'ai', parentId: null }]);
  });

  it('surfaces an error state when the request fails', async () => {
    (InterestService.getMine as any).mockRejectedValue(new Error('network down'));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useMyInterestsQuery(true), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useUpdateMyInterestsMutation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('writes the mutation result into the mine-query cache so the UI updates immediately', async () => {
    const updated = [{ id: '2', name: 'Cloud', slug: 'cloud', parentId: null }];
    (InterestService.updateMine as any).mockResolvedValue(updated);
    const { client, wrapper } = createWrapper();

    const { result } = renderHook(() => useUpdateMyInterestsMutation(), { wrapper });
    result.current.mutate(['2']);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(client.getQueryData(interestKeys.mine())).toEqual(updated);
  });
});
