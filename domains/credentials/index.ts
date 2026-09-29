/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Credentials
 *
 * Public surface of the Credentials domain: the platform's issued, verifiable credentials.
 * Badges today (three platform levels); certificates will join them on the same verification model.
 *
 * Not to be confused with `domains/recognition` (profile badges such as the verified tick, granted
 * by staff and asserting identity) or `domains/badges` (the archived creator badge designer — see
 * docs/archive/badge-editor.md).
 * ------------------------------------------------------------------
 */

export type {
  BadgeAssignment,
  BadgeCatalogue,
  BadgeClassInfo,
  BadgeContentType,
  BadgeFamilyInfo,
  BadgeFamilyKey,
  BadgeLevel,
  BadgeTierInfo,
  InProgressBadge,
  IssuedBadge,
  MyBadges,
  PublicBadge,
  VerificationStatus,
  VerifyResult,
} from "./types/credential.types";

export { credentialsApi, credentialPath, openBadgesAssertionUrl } from "./api/credentials.service";
export {
  renderBadgeSvg,
  parseBadgeClassCode,
  badgeClassCode,
  isBadgeLevel,
  BADGE_ART_VIEWBOX,
} from "./lib/badgeArt";
export { TIER_STYLE, BADGE_LEVELS } from "./lib/tierStyle";
export {
  linkedInAddToProfileUrl,
  linkedInShareUrl,
  xShareUrl,
  downloadBadgeImage,
} from "./lib/share";
export type { ShareableCredential } from "./lib/share";
export { CredentialBadge } from "./components/CredentialBadge";
export type { CredentialBadgeProps } from "./components/CredentialBadge";
export { TierLadder } from "./components/TierLadder";
export { BadgeTierPicker } from "./components/BadgeTierPicker";
export { LinkedInGlyph } from "./components/LinkedInGlyph";
export { BadgeLevelSummary } from "./components/BadgeLevelSummary";
