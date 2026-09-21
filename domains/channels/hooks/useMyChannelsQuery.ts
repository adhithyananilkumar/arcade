'use client';

import { useQuery } from '@tanstack/react-query';
import { channelService } from '../api/channel.service';
import type { Channel } from '../api/channel.service';

/**
 * Shared query keys for "the channels this user relates to".
 *
 * <p>The point of these being shared constants is deduplication. Three separate shell components
 * ask whether the user owns a channel — the navbar (to decide whether to show channel entries),
 * `useStudioAccess` (to decide whether Studio is reachable) and `useIsContentStaff` (to decide
 * whether to offer an instructor profile) — and each used to do it with its own `useEffect`. That
 * is three identical requests on every page load, none of them cached. Under one query key React
 * Query collapses them into one request and serves the rest from cache.
 */
export const myChannelsKeys = {
  owned: ['my-channels'] as const,
  workspaces: ['my-workspaces'] as const,
};

/**
 * Channels this user owns.
 *
 * <p>`staleTime` is longer than the app default because channel membership is not something that
 * changes while someone navigates between pages — and this feeds persistent chrome, so the app
 * default would still refetch it on every full page load.
 */
export interface SharedChannelQueryOptions {
  /**
   * Skip the request when the caller already knows the answer — e.g. a user whose platform role
   * settles the question without any lookup. Because every caller shares one query key, a caller
   * that disables itself still reads the cache if another caller enabled it.
   */
  enabled?: boolean;
}

export function useMyChannelsQuery({ enabled = true }: SharedChannelQueryOptions = {}) {
  return useQuery({
    queryKey: myChannelsKeys.owned,
    queryFn: () => channelService.getMyChannels(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/** Org channels this user is staff on. See {@link useMyChannelsQuery}. */
export function useMyWorkspacesQuery({ enabled = true }: SharedChannelQueryOptions = {}) {
  return useQuery({
    queryKey: myChannelsKeys.workspaces,
    queryFn: () => channelService.getMyWorkspaces(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Whether the user owns or staffs any channel at all — the question the navbar actually asks.
 *
 * <p>Returns `undefined` while either query is still loading, so callers can distinguish "not yet
 * known" from "no", rather than rendering a false and then correcting it.
 */
export function useHasAnyChannel(): boolean | undefined {
  const owned = useMyChannelsQuery();
  const workspaces = useMyWorkspacesQuery();

  if (owned.isPending || workspaces.isPending) {
    return undefined;
  }
  return (owned.data?.length ?? 0) > 0 || (workspaces.data?.length ?? 0) > 0;
}

export type { Channel };
