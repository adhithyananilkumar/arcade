'use client';

import { useEffect, useState } from 'react';
import { channelService } from '../api/channel.service';

export interface StudioAccessState {
  hasAccess: boolean;
  loading: boolean;
}

/**
 * Whether the current user should see/reach Content Studio.
 *
 * Owning a channel always qualifies (the owner has full authority). Being merely a *staff
 * member* of an org channel does not by itself — that only counts if their assigned role
 * actually holds a content-authoring permission (channel.videos.upload). Bare membership used
 * to be the only check here, which surfaced the Studio nav link/route to staff with e.g.
 * settings- or staff-management-only roles who have nothing to do there.
 *
 * This is a display-only convenience — the backend is the real authority on what a request
 * can actually do once inside Studio.
 */
export function useStudioAccess(): StudioAccessState {
  const [state, setState] = useState<StudioAccessState>({ hasAccess: false, loading: true });

  useEffect(() => {
    let cancelled = false;

    Promise.all([channelService.getMyChannels(), channelService.getMyWorkspaces()])
      .then(async ([channels, workspaces]) => {
        if (cancelled) return;

        if (channels.length > 0) {
          setState({ hasAccess: true, loading: false });
          return;
        }

        const workspacePermissions = await Promise.all(
          workspaces.map((w) =>
            channelService.getMyChannelPermissions(w.id).catch((): string[] => [])
          )
        );
        if (cancelled) return;

        const canAuthorContent = workspacePermissions.some(
          (perms) => perms.includes('ALL') || perms.includes('channel.videos.upload')
        );
        setState({ hasAccess: canAuthorContent, loading: false });
      })
      .catch(() => {
        if (!cancelled) setState({ hasAccess: false, loading: false });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
