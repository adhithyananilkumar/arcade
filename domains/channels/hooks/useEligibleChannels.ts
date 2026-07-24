'use client';

import { useEffect, useState } from 'react';
import { channelService, Channel } from '../api/channel.service';

export interface EligibleChannelsState {
  channels: Channel[];
  loading: boolean;
}

/**
 * Every channel the current user could create content under right now — their owned channel(s)
 * plus any org channel they staff with content-authoring rights (channel.videos.upload / ALL).
 * Used to drive the channel picker in content-creation flows: auto-select when there's exactly
 * one, otherwise the caller must ask the user to pick. Purely a UI convenience — the backend
 * (ContentChannelResolver) is the real authority and re-validates whatever is submitted.
 */
export function useEligibleChannels(): EligibleChannelsState {
  const [state, setState] = useState<EligibleChannelsState>({ channels: [], loading: true });

  useEffect(() => {
    let cancelled = false;

    Promise.all([channelService.getMyChannels(), channelService.getMyWorkspaces()])
      .then(async ([owned, workspaces]) => {
        if (cancelled) return;

        const ownedIds = new Set(owned.map((c) => c.id));
        const staffedCandidates = workspaces.filter((w) => !ownedIds.has(w.id));

        const staffedChecks = await Promise.all(
          staffedCandidates.map(async (channel) => {
            const perms = await channelService.getMyChannelPermissions(channel.id).catch((): string[] => []);
            const canAuthor = perms.includes('ALL') || perms.includes('channel.videos.upload');
            return canAuthor ? channel : null;
          })
        );
        if (cancelled) return;

        const eligible = [...owned, ...staffedChecks.filter((c): c is Channel => c !== null)];
        setState({ channels: eligible, loading: false });
      })
      .catch(() => {
        if (!cancelled) setState({ channels: [], loading: false });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
