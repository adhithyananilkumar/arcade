'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Public
 *
 * Purpose:
 * `/channels/<id>` for callers that only hold a channel id (a course page
 * linking to its publisher). It is not a page of its own — it sends the
 * visitor to wherever that channel's one public page lives:
 *
 *   personal channel                → its owner's profile, `/<owner handle>`
 *   organization channel            → `/<channel handle>`
 *   organization without a handle   → the same organization view, served here
 *
 * Rules:
 * - Where a channel lives is the backend's answer (`/public/channels/{id}/address`);
 *   nothing here infers it.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';
import {
  ProfileEmptyState,
  ProfileService,
  ProfileSkeleton,
  type ChannelProfile,
} from '@/domains/profiles';
import { ChannelProfileView, ProfileFrame } from './ProfileOrchestrator';

type State =
  | { kind: 'loading' }
  | { kind: 'missing' }
  | { kind: 'profile'; profile: ChannelProfile };

export function ChannelAddressOrchestrator({ channelId }: { channelId: string }) {
  const router = useRouter();
  const [state, setState] = useState<{ forId: string; value: State } | null>(null);
  const current: State = state?.forId === channelId ? state.value : { kind: 'loading' };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const address = await ProfileService.getChannelAddress(channelId);
        if (cancelled) return;
        if (address.handle) {
          router.replace(`/${encodeURIComponent(address.handle)}`);
          return;
        }
        if (address.personal) {
          // A personal channel whose owner has no handle has no public page yet.
          setState({ forId: channelId, value: { kind: 'missing' } });
          return;
        }
        const profile = await ProfileService.getChannelProfileById(channelId);
        if (!cancelled) setState({ forId: channelId, value: { kind: 'profile', profile } });
      } catch {
        if (!cancelled) setState({ forId: channelId, value: { kind: 'missing' } });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [channelId, router]);

  if (current.kind === 'profile') {
    return (
      <ProfileFrame>
        <ChannelProfileView profile={current.profile} />
      </ProfileFrame>
    );
  }

  return (
    <ProfileFrame>
      {current.kind === 'loading' ? (
        <ProfileSkeleton />
      ) : (
        <ProfileEmptyState
          icon={Building2}
          title="Channel not available"
          description="This channel does not have a public page, or it is no longer active."
        />
      )}
    </ProfileFrame>
  );
}
