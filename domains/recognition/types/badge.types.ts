/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Recognition
 *
 * Purpose:
 * Types for platform-granted badges shown on user and channel profiles.
 *
 * Rules:
 * - Mirrors the backend's `RecognitionDtos`. The backend owns what a badge
 *   means, who may hold one, and how it is presented — nothing here decides
 *   any of that.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

/** What kind of statement a badge makes. */
export type BadgeCategory = 'VERIFICATION' | 'STAFF' | 'CUSTOM';

/** Which kind of profile a badge may be granted to. */
export type BadgeAppliesTo = 'USER' | 'CHANNEL' | 'ANY';

/**
 * How prominently a badge renders.
 *
 * The backend sends this per badge rather than the client deciding from the code, so a badge
 * created by an administrator next month renders correctly with no deploy — and so a client
 * cannot award itself the heavier treatment.
 */
export type BadgeEffect = 'NONE' | 'GLOW' | 'PRISM';

export type RecognitionSubjectType = 'USER' | 'CHANNEL';

/**
 * A badge as it appears on a profile.
 *
 * `label` is already resolved: the backend has applied the grant's title override on top of the
 * definition's display name, so "Arcade Developer" may arrive as "Arcade Team Lead". `tenure` and
 * `note` are the extra lines on the hover card.
 */
export interface ProfileBadge {
  code: string;
  label: string;
  description?: string | null;
  category: BadgeCategory;
  /** A kebab-case lucide icon name, resolved at render time. */
  icon: string;
  /** Hex, e.g. `#1d9bf0`. Drives the badge's fill and any glow. */
  accentColor: string;
  effect: BadgeEffect;
  displayOrder: number;
  /** A period, shown after the label: "2025-26", "since 2024". */
  tenure?: string | null;
  note?: string | null;
  grantedAt: string;
}

/** A catalog entry in the admin surface. */
export interface BadgeDefinition {
  id: string;
  code: string;
  displayName: string;
  description?: string | null;
  category: BadgeCategory;
  appliesTo: BadgeAppliesTo;
  icon: string;
  accentColor: string;
  effect: BadgeEffect;
  displayOrder: number;
  /**
   * Seeded and kept in sync by the backend's `RecognitionBootstrap`. System definitions cannot be
   * edited through the API, so the admin UI must render them read-only rather than offering a
   * form whose save will be refused.
   */
  systemDefined: boolean;
  active: boolean;
  liveGrantCount: number;
}

/** A grant as shown in the admin surface — the full record, including who did what. */
export interface BadgeGrant {
  id: string;
  badgeCode: string;
  badgeName: string;
  category: BadgeCategory;
  icon: string;
  accentColor: string;
  effect: BadgeEffect;
  subjectType: RecognitionSubjectType;
  subjectId: string;
  subjectName: string;
  subjectHandle?: string | null;
  subjectAvatarUrl?: string | null;
  title?: string | null;
  tenure?: string | null;
  note?: string | null;
  grantedByName: string;
  grantedAt: string;
  revokedByName?: string | null;
  revokedAt?: string | null;
  revocationReason?: string | null;
  expiresAt?: string | null;
  live: boolean;
}

export interface CreateBadgeDefinitionInput {
  code: string;
  displayName: string;
  description?: string;
  category: BadgeCategory;
  appliesTo: BadgeAppliesTo;
  icon?: string;
  accentColor?: string;
  effect?: BadgeEffect;
  displayOrder?: number;
}

export interface UpdateBadgeDefinitionInput {
  displayName?: string;
  description?: string;
  icon?: string;
  accentColor?: string;
  effect?: BadgeEffect;
  displayOrder?: number;
  active?: boolean;
}

export interface GrantBadgeInput {
  badgeCode: string;
  subjectType: RecognitionSubjectType;
  subjectId: string;
  /** Overrides the definition's display name for this holder. */
  title?: string;
  tenure?: string;
  note?: string;
  /** ISO datetime. A grant past its expiry stops rendering without anyone revoking it. */
  expiresAt?: string;
}

export interface PagedBadgeGrants {
  content: BadgeGrant[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
