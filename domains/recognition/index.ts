/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Recognition
 *
 * Purpose:
 * Exposes the public API for the Recognition domain — platform-granted badges
 * (verification ticks, Arcade staff badges, one-off custom awards) shown on
 * user and channel profiles.
 *
 * Note: distinct from `domains/badges`, which is the badge *design editor* for
 * course completion artwork. The two share a word and nothing else.
 *
 * Rules:
 * - Export only stable public APIs.
 * - Never export internal helpers.
 * - Never import from apps/.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

export { RecognitionService } from './api/recognition.service';
export { VerifiedBadge, BadgeRow } from './components/VerifiedBadge';
export type { VerifiedBadgeProps, BadgeRowProps } from './components/VerifiedBadge';
export { BADGE_ICON_NAMES, resolveBadgeIcon } from './components/badgeIconMap';
export { BadgeIcon } from './components/BadgeIcon';
export type { BadgeIconProps } from './components/BadgeIcon';
export type {
  BadgeAppliesTo,
  BadgeCategory,
  BadgeDefinition,
  BadgeEffect,
  BadgeGrant,
  CreateBadgeDefinitionInput,
  GrantBadgeInput,
  PagedBadgeGrants,
  ProfileBadge,
  RecognitionSubjectType,
  UpdateBadgeDefinitionInput,
} from './types/badge.types';
