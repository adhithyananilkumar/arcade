/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Profiles
 *
 * Purpose:
 * Reads for the unified profile system.
 *
 * Rules:
 * - Every endpoint here is public (`/api/v1/public/**`). The backend decides
 *   what a public payload may contain — published work only, no private
 *   learner state — and this service must not be given an authenticated
 *   variant that quietly widens that.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { api, ApiError } from '@/infrastructure/http/api';
import type {
  ChannelProfile,
  HandleResolution,
  UserProfile,
} from '../types/profile.types';

export const ProfileService = {
  /**
   * What lives at `domain/<handle>`, or null when nothing does.
   *
   * Returns null on 404 rather than throwing: "nothing here" is the expected answer for any
   * mistyped URL, and the catch-all route needs to render a not-found page, not an error.
   */
  async resolveHandle(handle: string): Promise<HandleResolution | null> {
    try {
      return await api.get<HandleResolution>(
        `/api/v1/public/handles/${encodeURIComponent(handle)}`,
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  getUserProfile(handle: string): Promise<UserProfile> {
    return api.get<UserProfile>(
      `/api/v1/public/profiles/${encodeURIComponent(handle)}`,
    );
  },

  getChannelProfileByHandle(handle: string): Promise<ChannelProfile> {
    return api.get<ChannelProfile>(
      `/api/v1/public/channels/handle/${encodeURIComponent(handle)}`,
    );
  },

  /**
   * By id, for callers that already hold one — a course page linking to its publisher. The
   * payload carries the channel's handle so the link they render points at the canonical
   * address rather than at an id.
   */
  getChannelProfileById(channelId: string): Promise<ChannelProfile> {
    return api.get<ChannelProfile>(`/api/v1/public/channels/${channelId}`);
  },
};
