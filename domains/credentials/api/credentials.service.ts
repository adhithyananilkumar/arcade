/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Credentials
 *
 * API wrapper for credential badges. Public endpoints (`/api/v1/public/credentials/**`) need no
 * session; the shared client sends one when present and the server ignores it there.
 * ------------------------------------------------------------------
 */

import { api } from "@/infrastructure/http/api";
import type {
  BadgeAssignment,
  BadgeCatalogue,
  BadgeContentType,
  IssuedBadge,
  MyBadges,
  PublicBadge,
  VerifyResult,
} from "../types/credential.types";

const PUBLIC = "/api/v1/public/credentials";

export const credentialsApi = {
  /** The platform's fifteen badge classes, five tiers and three families. */
  catalogue: () => api.get<BadgeCatalogue>(`${PUBLIC}/badge-classes`),

  // ── Studio ──
  getAssignment: (type: BadgeContentType, contentId: string) =>
    api.get<BadgeAssignment>(`/api/credentials/badge-assignments/${type}/${contentId}`),
  assignTier: (type: BadgeContentType, contentId: string, tier: number) =>
    api.put<BadgeAssignment>(`/api/credentials/badge-assignments/${type}/${contentId}`, { tier }),
  clearTier: (type: BadgeContentType, contentId: string) =>
    api.delete<BadgeAssignment>(`/api/credentials/badge-assignments/${type}/${contentId}`),

  // ── The holder ──
  mine: () => api.get<MyBadges>("/api/v1/me/credentials/badges"),
  setVisibility: (code: string, publicVisible: boolean) =>
    api.patch<IssuedBadge>(`/api/v1/me/credentials/badges/${encodeURIComponent(code)}/visibility`, { publicVisible }),

  // ── The public ──
  publicBadge: (code: string) => api.get<PublicBadge>(`${PUBLIC}/badges/${encodeURIComponent(code)}`),
  verify: (code: string) => api.get<VerifyResult>(`${PUBLIC}/verify/${encodeURIComponent(code)}`),
  profileBadges: (handle: string) =>
    api.get<IssuedBadge[]>(`${PUBLIC}/profiles/${encodeURIComponent(handle)}/badges`),
};

/** Where a credential's public page lives, relative to the site. */
export function credentialPath(code: string): string {
  return `/credentials/${encodeURIComponent(code)}`;
}

/** The Open Badges 2.0 hosted assertion, for backpacks and third-party verifiers. */
export function openBadgesAssertionUrl(apiOrigin: string, code: string): string {
  return `${apiOrigin}${PUBLIC}/badges/${encodeURIComponent(code)}/assertion`;
}
