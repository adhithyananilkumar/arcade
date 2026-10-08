/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Credentials
 *
 * Public surface of the Credentials domain: the platform's issued, verifiable credentials.
 * Badges (five platform levels: three chosen for content, Expert with a certification, Distinguished
 * an honour Arcade confers) and certificates, on one verification model; grade cards (owned by
 * `domains/assessments`) verify through the same endpoint.
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
  ConferHonourRequest,
  CredentialKind,
  InProgressBadge,
  IssuedBadge,
  IssuedCertificate,
  MyBadges,
  PublicBadge,
  PublicCertificate,
  VerificationStatus,
  VerifyResult,
} from "./types/credential.types";

export {
  credentialsApi,
  credentialPath,
  credentialKindOf,
  verifyPath,
  openBadgesAssertionUrl,
} from "./api/credentials.service";
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
export { BadgeDetailModal } from "./components/BadgeDetailModal";
export type { BadgeDetailModalProps } from "./components/BadgeDetailModal";
export { TierLadder } from "./components/TierLadder";
export { BadgeTierPicker } from "./components/BadgeTierPicker";
export { LinkedInGlyph } from "./components/LinkedInGlyph";
export { BadgeLevelSummary } from "./components/BadgeLevelSummary";
export { CertificateFace } from "./components/CertificateFace";
export type { CertificateFaceProps } from "./components/CertificateFace";
export { IssuerLogoPreview } from "./components/IssuerLogoPreview";
export { HOST_INSTITUTION_NAME } from "./lib/hostInstitution";
export type { IssuerLogoPreviewProps } from "./components/IssuerLogoPreview";
