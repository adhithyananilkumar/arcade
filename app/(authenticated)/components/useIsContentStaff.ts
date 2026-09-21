'use client';

import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { useMyChannelsQuery } from '@/domains/channels';

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

  const hasStaffRole = Boolean(
    user?.channelMemberships?.some((m) => m.roles.some((r) => PUBLISHING_ROLES.includes(r.code))) ||
      user?.platformRoles?.some((r) => r.code === 'PLATFORM_ADMIN')
  );

  // Shares the app shell's channel query rather than issuing its own. The navbar and
  // `useStudioAccess` ask the same question on the same render, so three `useEffect`s meant three
  // identical uncached requests per page load; under one query key they collapse to one.
  //
  // `enabled` keeps it off the wire entirely when the answer is already known: no session, or a
  // staff role that settles it without any lookup.
  const owned = useMyChannelsQuery({ enabled: Boolean(user) && !hasStaffRole });

  if (!user) return false;
  if (hasStaffRole) return true;
  if (owned.isPending) return null;
  return (owned.data?.length ?? 0) > 0;
}
