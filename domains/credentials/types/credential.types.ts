/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Credentials
 *
 * Wire shapes of the credential badge API (backend `certification.badges`). The backend owns every
 * rule — which tiers exist, what they mean, who may choose one, whether a badge verifies — and the
 * frontend only renders these.
 * ------------------------------------------------------------------
 */

import type { BadgeFamilyKey, BadgeLevel } from "../lib/badgeArt";

export type { BadgeFamilyKey, BadgeLevel };

/** The content types that award badges. */
export type BadgeContentType = BadgeFamilyKey;

export interface BadgeTierInfo {
  level: BadgeLevel;
  key: "LEVEL_1" | "LEVEL_2" | "LEVEL_3";
  /** "Foundation", "Intermediate", "Advanced". */
  name: string;
  /** "Level 2 · Intermediate". */
  label: string;
  /** What holding a badge at this level says about the holder. */
  meaning: string;
  /** Which content warrants this level. */
  guidance: string;
}

export interface BadgeFamilyInfo {
  key: BadgeFamilyKey;
  label: string;
  contentType: BadgeContentType;
  criteria: string;
}

export interface BadgeClassInfo {
  /** e.g. `ARC-COURSE-L3` — stable and public. */
  code: string;
  name: string;
  family: BadgeFamilyInfo;
  tier: BadgeTierInfo;
}

export interface BadgeCatalogue {
  tiers: BadgeTierInfo[];
  families: BadgeFamilyInfo[];
  classes: BadgeClassInfo[];
}

export interface BadgeAssignment {
  contentType: BadgeContentType;
  contentId: string;
  contentTitle: string;
  family: BadgeFamilyInfo;
  /** Null when the content awards no badge. */
  tier: BadgeTierInfo | null;
  badgeClass: BadgeClassInfo | null;
  criteria: string;
  /** Badges already issued on this content; they keep the tier they were earned at. */
  awardedCount: number;
  /** Set when the tier cannot be changed right now. */
  lockedReason: string | null;
  updatedAt: string | null;
}

export interface IssuedBadge {
  credentialCode: string;
  badgeClass: BadgeClassInfo;
  /** The content's title — the individual award's name. */
  name: string;
  criteria: string;
  contentType: BadgeContentType;
  contentId: string;
  contentPath: string | null;
  recipientName: string;
  recipientHandle: string | null;
  issuerName: string;
  issuerHandle: string | null;
  issuedAt: string;
  publicVisible: boolean;
  revoked: boolean;
  revokedAt: string | null;
  revokedReason: string | null;
}

export interface InProgressBadge {
  contentType: BadgeContentType;
  contentId: string;
  name: string;
  contentPath: string | null;
  issuerName: string | null;
  badgeClass: BadgeClassInfo;
  progressPercent: number;
}

export interface MyBadges {
  earned: IssuedBadge[];
  inProgress: InProgressBadge[];
  highestTier: number;
  total: number;
}

export type VerificationStatus = "VALID" | "REVOKED" | "TAMPERED" | "NOT_FOUND";

export interface PublicBadge {
  badge: IssuedBadge;
  content: {
    title: string;
    summary: string | null;
    imageUrl: string | null;
    path: string | null;
    issuerLogoUrl: string | null;
    highlights: string[];
    /** False when the content has since been removed; the credential still stands. */
    available: boolean;
  };
  verification: {
    status: Exclude<VerificationStatus, "NOT_FOUND">;
    signatureValid: boolean;
    signatureAlgorithm: string;
    checkedAt: string;
    message: string;
  };
}

export interface VerifyResult {
  credentialCode: string;
  status: VerificationStatus;
  signatureValid: boolean;
  publicPage: boolean;
  name: string | null;
  badgeClass: BadgeClassInfo | null;
  recipientName: string | null;
  issuerName: string | null;
  issuedAt: string | null;
  revokedAt: string | null;
  message: string;
}
