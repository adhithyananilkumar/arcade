'use client';

import { useQuery } from '@tanstack/react-query';
import { channelService } from '../api/channel.service';
import { useMyChannelsQuery, useMyWorkspacesQuery } from './useMyChannelsQuery';

export interface StudioAccessState {
  hasAccess: boolean;
  loading: boolean;
}

/**
 * Whether the current user should see/reach Content Studio.
 *
 * Owning a channel always qualifies. Being a collaborator on courses/content qualifies.
 * Being a staff member of an org channel with content-authoring permissions qualifies.
 *
 * <p>This runs in the app shell, so it runs on every page. It used to do so as one `useEffect`
 * fetching the user's channels, their workspaces and *every course they can see*, uncached — three
 * requests per page load, two of them duplicating what the navbar was fetching at the same moment
 * for its own copy of the same question. The channel lookups are now shared query hooks, so all
 * the shell's callers collapse onto one request each and subsequent navigations are served from
 * cache.
 *
 * <p>The permission probe per workspace is still a request each, but it only runs for a user who
 * owns nothing and authors nothing — the case where the answer is not already decided — and only
 * after the cheap checks have failed.
 */
export function useStudioAccess(): StudioAccessState {
  const owned = useMyChannelsQuery();
  const workspaces = useMyWorkspacesQuery();

  const ownsChannel = (owned.data?.length ?? 0) > 0;

  // Authoring a course qualifies on its own, so this is only worth asking when owning a channel
  // has not already settled it. `enabled` is what keeps it off the critical path for the common
  // case of a user who owns a channel.
  const authored = useQuery({
    queryKey: ['my-authored-content-count'],
    queryFn: () => channelService.getMyAuthoredContentCount(),
    enabled: !owned.isPending && !ownsChannel,
    staleTime: 5 * 60 * 1000,
  });

  const workspaceIds = (workspaces.data ?? []).map((w) => w.id);

  // Last resort: does any workspace grant content-authoring rights? Only reached when the user
  // neither owns a channel nor has authored anything.
  const needsPermissionProbe =
    !owned.isPending &&
    !ownsChannel &&
    !authored.isPending &&
    (authored.data ?? 0) === 0 &&
    !workspaces.isPending &&
    workspaceIds.length > 0;

  const workspacePermissions = useQuery({
    queryKey: ['my-workspace-authoring-rights', workspaceIds],
    enabled: needsPermissionProbe,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const perms = await Promise.all(
        workspaceIds.map((id) => channelService.getMyChannelPermissions(id).catch((): string[] => [])),
      );
      return perms.some(
        (p) =>
          p.includes('ALL') ||
          p.includes('channel.videos.upload') ||
          p.includes('channel.videos.upload.own'),
      );
    },
  });

  if (owned.isPending || workspaces.isPending) {
    return { hasAccess: false, loading: true };
  }
  if (ownsChannel) {
    return { hasAccess: true, loading: false };
  }
  if (authored.isPending) {
    return { hasAccess: false, loading: true };
  }
  if ((authored.data ?? 0) > 0) {
    return { hasAccess: true, loading: false };
  }
  if (workspaceIds.length === 0) {
    return { hasAccess: false, loading: false };
  }
  if (workspacePermissions.isPending) {
    return { hasAccess: false, loading: true };
  }
  return { hasAccess: Boolean(workspacePermissions.data), loading: false };
}
