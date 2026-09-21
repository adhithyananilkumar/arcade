'use client';

import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { channelService } from '../api/channel.service';
import type {
  ChannelSummary,
  ChannelSummaryQuery,
  ChannelDeletionRequestDto,
  ChannelAuditLogEntry,
} from '../api/channel.service';

/**
 * Shared keys for the channel-administration reads.
 *
 * <p>These exist for deduplication. The `/console/channels` page renders all three of its tab
 * panels at once and merely hides the inactive ones with CSS, so each panel fetched on mount; the
 * page separately fetched the deletion list to put a count on a tab; and the navbar fetched two of
 * the same lists for its pending-tasks menu. One page load issued `delete-requests` three times,
 * `channels` twice and `requests` twice. Under shared keys they collapse to one request each, and
 * switching tabs costs nothing.
 *
 * <p>The listing keys include their query parameters, so changing a filter, a search term or a page
 * is a different cache entry rather than a refetch that overwrites the previous one — going back to
 * a filter you already looked at is instant.
 */
export const channelAdminKeys = {
  summaries: (params: ChannelSummaryQuery = {}) =>
    [
      'channel-summaries',
      params.status ?? null,
      params.type ?? null,
      params.search ?? null,
      params.page ?? 0,
      params.size ?? 20,
    ] as const,
  counts: ['channel-counts'] as const,
  pendingRequests: (page = 0, size = 20, search?: string) =>
    ['channel-pending-requests', page, size, search ?? null] as const,
  deletionRequests: ['channel-deletion-requests'] as const,
  auditLog: ['channel-audit-log'] as const,
};

export interface ChannelAdminQueryOptions {
  /** Skip the request — for callers whose permissions mean they will never render the result. */
  enabled?: boolean;
}

/**
 * One page of the administration channel listing, filtered and searched by the backend.
 *
 * <p>`staleTime` is short: this is a work queue, and an admin who has just approved something
 * expects the list to reflect it. Mutations should call {@link useInvalidateChannelAdmin} rather
 * than relying on this expiring.
 *
 * <p>`placeholderData` keeps the previous page on screen while the next one loads, so paging and
 * filtering do not blank the table on every keystroke.
 */
export function useChannelSummariesQuery(
  params: ChannelSummaryQuery = {},
  { enabled = true }: ChannelAdminQueryOptions = {},
) {
  const query = useQuery({
    queryKey: channelAdminKeys.summaries(params),
    queryFn: () => channelService.getChannelSummaries(params),
    enabled,
    staleTime: 30 * 1000,
    placeholderData: (previous) => previous,
  });

  return {
    channels: query.data?.content ?? ([] as ChannelSummary[]),
    totalElements: query.data?.totalElements ?? 0,
    totalPages: query.data?.totalPages ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
  };
}

/**
 * Channel counts per status, for the console's stat tiles.
 *
 * <p>Its own query because the tiles show every status at once while the table shows one page of
 * one status. Counting over a listing is what forced that listing to be complete.
 */
export function useChannelCountsQuery({ enabled = true }: ChannelAdminQueryOptions = {}) {
  const { data } = useQuery({
    queryKey: channelAdminKeys.counts,
    queryFn: () => channelService.getChannelCounts(),
    enabled,
    staleTime: 30 * 1000,
  });

  const counts = data ?? {};
  return useMemo(
    () => ({
      pending: counts.PENDING ?? 0,
      active: counts.ACTIVE ?? 0,
      suspended: counts.SUSPENDED ?? 0,
      rejected: counts.REJECTED ?? 0,
      total: Object.values(counts).reduce((sum, n) => sum + n, 0),
    }),
    [data], // eslint-disable-line react-hooks/exhaustive-deps -- `counts` is derived from `data`
  );
}

/**
 * One page of pending channel creation requests.
 *
 * <p>Read both by the console's Channels panel and by the navbar's pending-task menu, which wants
 * only a handful — hence the explicit `size`.
 */
export function usePendingChannelRequestsQuery(
  { page = 0, size = 20, search }: { page?: number; size?: number; search?: string } = {},
  { enabled = true }: ChannelAdminQueryOptions = {},
) {
  const query = useQuery({
    queryKey: channelAdminKeys.pendingRequests(page, size, search),
    queryFn: () => channelService.getPendingRequests({ page, size, search }),
    enabled,
    staleTime: 30 * 1000,
    placeholderData: (previous) => previous,
  });

  return {
    requests: query.data?.content ?? ([] as ChannelSummary[]),
    totalElements: query.data?.totalElements ?? 0,
    totalPages: query.data?.totalPages ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
}

/**
 * Channel deletion requests.
 *
 * <p>Left unpaged: this is a small, actively-worked queue — zero rows on this database, and it is
 * bounded by how many channels are mid-deletion rather than by how many channels exist. Paging it
 * would add machinery without removing a cost.
 */
export function usePendingDeletionRequestsQuery({ enabled = true }: ChannelAdminQueryOptions = {}) {
  return useQuery<ChannelDeletionRequestDto[]>({
    queryKey: channelAdminKeys.deletionRequests,
    queryFn: () => channelService.getPendingDeletionRequests(),
    enabled,
    staleTime: 30 * 1000,
  });
}

/** The channel audit log. */
export function useChannelAuditLogQuery({ enabled = true }: ChannelAdminQueryOptions = {}) {
  return useQuery<ChannelAuditLogEntry[]>({
    queryKey: channelAdminKeys.auditLog,
    queryFn: () => channelService.getAuditLog(),
    enabled,
    staleTime: 60 * 1000,
  });
}

/**
 * Invalidates the administration reads after a mutation.
 *
 * <p>Approving a channel, reviewing a deletion or hard-deleting one changes several of these lists
 * at once — and the audit log records every one of those actions — so they are invalidated
 * together. This is why the panels no longer refetch by calling their own loaders after a mutation:
 * each panel used to refresh only its own copy, leaving the others, and the navbar's badge, stale.
 *
 * <p>The listing keys are invalidated by prefix, so every cached filter and page combination is
 * refreshed rather than only the one currently on screen.
 */
export function useInvalidateChannelAdmin() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['channel-summaries'] });
    queryClient.invalidateQueries({ queryKey: ['channel-pending-requests'] });
    queryClient.invalidateQueries({ queryKey: channelAdminKeys.counts });
    queryClient.invalidateQueries({ queryKey: channelAdminKeys.deletionRequests });
    queryClient.invalidateQueries({ queryKey: channelAdminKeys.auditLog });
  };
}
