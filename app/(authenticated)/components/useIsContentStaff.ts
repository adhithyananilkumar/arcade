'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { channelService } from '@/domains/channels';

/** Channel roles whose holders publish content and therefore appear on course pages. */
const PUBLISHING_ROLES = ['CONTENT_CREATOR', 'CHANNEL_ADMIN', 'REVIEWER'];

/**
 * Whether this user publishes content, and so has an instructor profile worth filling in.
 *
 * Two sources, because they are genuinely different: a staff member holds a `ChannelStaff`
 * record with one of the publishing roles, while a channel *owner* holds no such record at all
 * and has to be found by listing the channels they own.
 *
 * This is a presentation hint for deciding what to show — the backend remains the authority on
 * what anyone may actually do.
 *
 * Returns `null` while the ownership check is still in flight, so callers can avoid flashing a
 * section in and then out again.
 */
export function useIsContentStaff(): boolean | null {
  const { user } = useAuthStore();
  const [ownsChannel, setOwnsChannel] = useState<boolean | null>(null);

  const hasStaffRole = Boolean(
    user?.channelMemberships?.some((m) => m.roles.some((r) => PUBLISHING_ROLES.includes(r.code))) ||
      user?.platformRoles?.some((r) => r.code === 'PLATFORM_ADMIN')
  );

  useEffect(() => {
    // Nothing to look up: either there is no session, or a staff role already answers it.
    // Returning early rather than setting state keeps this effect free of synchronous
    // setState, which cascades a render for every navigation this component survives.
    if (!user || hasStaffRole) return;
    let cancelled = false;
    channelService
      .getMyChannels()
      .then((channels) => {
        if (!cancelled) setOwnsChannel(channels.length > 0);
      })
      .catch(() => {
        if (!cancelled) setOwnsChannel(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, hasStaffRole]);

  if (!user) return false;
  if (hasStaffRole) return true;
  return ownsChannel;
}
