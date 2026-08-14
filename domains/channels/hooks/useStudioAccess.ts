'use client';

import { useEffect, useState } from 'react';
import { channelService } from '../api/channel.service';
import { api } from '@/infrastructure/http/api';

export interface StudioAccessState {
  hasAccess: boolean;
  loading: boolean;
}

/**
 * Whether the current user should see/reach Content Studio.
 *
 * Owning a channel always qualifies. Being a collaborator on courses/content qualifies.
 * Being a staff member of an org channel with content-authoring permissions qualifies.
 */
export function useStudioAccess(): StudioAccessState {
  const [state, setState] = useState<StudioAccessState>({ hasAccess: false, loading: true });

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      channelService.getMyChannels().catch(() => []),
      channelService.getMyWorkspaces().catch(() => []),
      api.get<any[]>('/api/courses').catch(() => [])
    ])
      .then(async ([channels, workspaces, courses]) => {
        if (cancelled) return;

        if ((channels && channels.length > 0) || (courses && courses.length > 0)) {
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
          (perms) =>
            perms.includes('ALL') ||
            perms.includes('channel.videos.upload') ||
            perms.includes('channel.videos.upload.own')
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
