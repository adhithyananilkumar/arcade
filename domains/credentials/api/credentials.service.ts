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
  ConferHonourRequest,
  IssuedBadge,
  IssuedCertificate,
  MyBadges,
  PublicBadge,
  PublicCertificate,
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

  // ── Console (platform.credentials.manage) ──
  honours: () => api.get<IssuedBadge[]>("/api/v1/console/credentials/honours"),
  conferHonour: (request: ConferHonourRequest) =>
    api.post<IssuedBadge>("/api/v1/console/credentials/honours", request),
  revokeBadge: (code: string, reason: string) =>
    api.post<IssuedBadge>(`/api/v1/console/credentials/badges/${encodeURIComponent(code)}/revoke`, { reason }),

  // ── The holder ──
  mine: () => api.get<MyBadges>("/api/v1/me/credentials/badges"),
  setVisibility: (code: string, publicVisible: boolean) =>
    api.patch<IssuedBadge>(`/api/v1/me/credentials/badges/${encodeURIComponent(code)}/visibility`, { publicVisible }),

  myCertificates: () => api.get<IssuedCertificate[]>("/api/v1/me/credentials/certificates"),
  setCertificateVisibility: (code: string, publicVisible: boolean) =>
    api.patch<IssuedCertificate>(`/api/v1/me/credentials/certificates/${encodeURIComponent(code)}/visibility`, {
      publicVisible,
    }),
  /** The holder's own copy — works for private and revoked (watermarked) certificates too. */
  downloadMyCertificate: (code: string) =>
    api.download(`/api/v1/me/credentials/certificates/${encodeURIComponent(code)}/pdf`, `Arcade certificate ${code}.pdf`),

  // ── The public ──
  publicBadge: (code: string) => api.get<PublicBadge>(`${PUBLIC}/badges/${encodeURIComponent(code)}`),
  publicCertificate: (code: string) =>
    api.get<PublicCertificate>(`${PUBLIC}/certificates/${encodeURIComponent(code)}`),
  downloadPublicCertificate: (code: string) =>
    api.download(`${PUBLIC}/certificates/${encodeURIComponent(code)}/pdf`, `Arcade certificate ${code}.pdf`),
  /** Any credential ID — badge, certificate or grade card. */
  verify: (code: string) => api.get<VerifyResult>(`${PUBLIC}/verify/${encodeURIComponent(code)}`),
  profileBadges: (handle: string) =>
    api.get<IssuedBadge[]>(`${PUBLIC}/profiles/${encodeURIComponent(handle)}/badges`),
};

/** Where a credential's public page lives, relative to the site. Badges and certificates share it. */
export function credentialPath(code: string): string {
  return `/credentials/${encodeURIComponent(code)}`;
}

/** Where anyone can check a credential ID, public or not. */
export function verifyPath(code: string): string {
  return `/credentials/verify?id=${encodeURIComponent(code)}`;
}

/**
 * Which public page a credential ID opens. Only a routing hint — the server still decides whether
 * the ID exists, is public, and is valid.
 */
export function credentialKindOf(code: string): "CERTIFICATE" | "BADGE" {
  return code.trim().toUpperCase().replace(/[^0-9A-Z]/g, "").startsWith("CERT") ? "CERTIFICATE" : "BADGE";
}

/** The Open Badges 2.0 hosted assertion, for backpacks and third-party verifiers. */
export function openBadgesAssertionUrl(apiOrigin: string, code: string): string {
  return `${apiOrigin}${PUBLIC}/badges/${encodeURIComponent(code)}/assertion`;
}
