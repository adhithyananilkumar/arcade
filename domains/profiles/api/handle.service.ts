/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Profiles
 *
 * Purpose:
 * Claiming a handle, checking one, and the appeal flow for one you cannot have.
 *
 * Rules:
 * - Availability is answered by the server, never guessed here. The namespace
 *   is shared between users and channels and includes platform-reserved names,
 *   so a client-side check would be wrong in exactly the cases that matter.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { api } from '@/infrastructure/http/api';
import type {
  FileAppealInput,
  HandleAppeal,
  HandleAppealStatus,
  HandleAvailabilityResult,
  PagedHandleAppeals,
} from '../types/profile.types';

const BASE = '/api/v1/handles';
const ADMIN_BASE = '/api/v1/platform/handles';

/**
 * Shape rules, mirrored from the backend's `PlatformHandleService` so a form can give immediate
 * feedback as somebody types.
 *
 * This is a convenience, not a gate: the server validates independently and its answer wins. Keep
 * these in step with `SHAPE` / `DOUBLED_SEPARATOR` there and with the `platform_handles` CHECK
 * constraints — all three describe the same rule.
 */
export const HANDLE_MIN_LENGTH = 2;
export const HANDLE_MAX_LENGTH = 30;

const SHAPE = /^[a-z0-9][a-z0-9._-]{0,28}[a-z0-9]$/;
const DOUBLED_SEPARATOR = /[._-]{2}/;

/** Canonical form: trimmed, a pasted leading `@` dropped, lowercased. */
export function normalizeHandle(raw: string): string {
  const trimmed = raw.trim().replace(/^@/, '');
  return trimmed.toLowerCase();
}

/** Returns null when well-formed, or the reason it is not. Shape only — says nothing about availability. */
export function handleShapeError(raw: string): string | null {
  const normalized = normalizeHandle(raw);
  if (!normalized) return 'Handle is required.';
  if (normalized.length < HANDLE_MIN_LENGTH)
    return `Handle must be at least ${HANDLE_MIN_LENGTH} characters.`;
  if (normalized.length > HANDLE_MAX_LENGTH)
    return `Handle must be at most ${HANDLE_MAX_LENGTH} characters.`;
  if (DOUBLED_SEPARATOR.test(normalized))
    return 'Handle cannot contain two dots, underscores or hyphens in a row.';
  if (!SHAPE.test(normalized))
    return 'Handle may use letters, numbers, dots, underscores and hyphens, and must start and end with a letter or number.';
  return null;
}

export const HandleService = {
  /**
   * Whether a name can be claimed, with alternatives when it cannot.
   *
   * Pass `channelId` to ask on a channel's behalf — that is what turns the channel's own current
   * handle from TAKEN into ALREADY_YOURS, so re-saving an unchanged settings form does not report
   * the channel's own name as unavailable.
   */
  checkAvailability(
    handle: string,
    channelId?: string,
  ): Promise<HandleAvailabilityResult> {
    const query = new URLSearchParams({ handle });
    if (channelId) query.set('channelId', channelId);
    return api.get<HandleAvailabilityResult>(
      `${BASE}/availability?${query.toString()}`,
    );
  },

  claimForMe(handle: string): Promise<{ handle: string }> {
    return api.put<{ handle: string }>(`${BASE}/me`, { handle });
  },

  claimForChannel(
    channelId: string,
    handle: string,
  ): Promise<{ handle: string }> {
    return api.put<{ handle: string }>(`${BASE}/channels/${channelId}`, {
      handle,
    });
  },

  // --- Appeals -------------------------------------------------------------

  fileAppeal(input: FileAppealInput): Promise<HandleAppeal> {
    return api.post<HandleAppeal>(`${BASE}/appeals`, input);
  },

  /** The caller's own appeals, plus those of every channel they own or staff. */
  myAppeals(): Promise<HandleAppeal[]> {
    return api.get<HandleAppeal[]>(`${BASE}/appeals/mine`);
  },

  channelAppeals(channelId: string): Promise<HandleAppeal[]> {
    return api.get<HandleAppeal[]>(`${BASE}/appeals/channels/${channelId}`);
  },

  withdrawAppeal(appealId: string): Promise<HandleAppeal> {
    return api.post<HandleAppeal>(`${BASE}/appeals/${appealId}/withdraw`);
  },

  // --- Review queue (platform.handles.manage) ------------------------------

  reviewQueue(params: {
    status?: HandleAppealStatus;
    page?: number;
    size?: number;
  } = {}): Promise<PagedHandleAppeals> {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    query.set('page', String(params.page ?? 0));
    query.set('size', String(params.size ?? 20));
    return api.get<PagedHandleAppeals>(
      `${ADMIN_BASE}/appeals?${query.toString()}`,
    );
  },

  pendingAppealCount(): Promise<{ pending: number }> {
    return api.get<{ pending: number }>(`${ADMIN_BASE}/appeals/pending-count`);
  },

  competingClaims(appealId: string): Promise<HandleAppeal[]> {
    return api.get<HandleAppeal[]>(
      `${ADMIN_BASE}/appeals/${appealId}/competing`,
    );
  },

  markUnderReview(appealId: string): Promise<HandleAppeal> {
    return api.post<HandleAppeal>(`${ADMIN_BASE}/appeals/${appealId}/review`);
  },

  /** Approving transfers the handle; rejecting changes nothing but the record. */
  decideAppeal(
    appealId: string,
    approve: boolean,
    note?: string,
  ): Promise<HandleAppeal> {
    return api.post<HandleAppeal>(`${ADMIN_BASE}/appeals/${appealId}/decision`, {
      approve,
      note,
    });
  },
};
