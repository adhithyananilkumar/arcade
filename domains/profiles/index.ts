/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Profiles
 *
 * Purpose:
 * Exposes the public API for the Profiles domain — the unified profile system
 * (people and organization channels) and the shared `domain/<handle>`
 * namespace they are served from.
 *
 * Rules:
 * - Export only stable public APIs.
 * - Never export internal helpers.
 * - Never import from apps/.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

export { ProfileService } from './api/profile.service';
export {
  HandleService,
  handleShapeError,
  normalizeHandle,
  HANDLE_MAX_LENGTH,
  HANDLE_MIN_LENGTH,
} from './api/handle.service';
export { useHandleAvailability } from './hooks/useHandleAvailability';
export type { HandleAvailabilityState } from './hooks/useHandleAvailability';

export { ProfileHero } from './components/ProfileHero';
export type { ProfileHeroProps } from './components/ProfileHero';
export { ChannelHero } from './components/ChannelHero';
export type { ChannelHeroProps } from './components/ChannelHero';
export { ProfileTabs } from './components/ProfileTabs';
export type { ProfileTab, ProfileTabsProps } from './components/ProfileTabs';
export {
  CertificateCard,
  ChannelCard,
  ContentCard,
  MemberCard,
  ProfileEmptyState,
  ProfileStat,
} from './components/ProfileCards';
export { HandleField } from './components/HandleField';
export type { HandleFieldProps } from './components/HandleField';
export { HandleAppealForm } from './components/HandleAppealForm';
export type { HandleAppealFormProps } from './components/HandleAppealForm';
export {
  HandleAppealList,
  HandleAppealStatusPill,
} from './components/HandleAppealList';
export type { HandleAppealListProps } from './components/HandleAppealList';
export { ProfileSkeleton } from './components/ProfileSkeleton';

export type {
  ChannelContentItem,
  ChannelMember,
  ChannelProfile,
  FileAppealInput,
  HandleAppeal,
  HandleAppealStatus,
  HandleAvailability,
  HandleAvailabilityResult,
  HandleResolution,
  HandleSubjectType,
  PagedHandleAppeals,
  ProfileCertificate,
  ProfileChannel,
  ProfileCourse,
  ProfileStats,
  ProfileWorkshop,
  UserProfile,
} from './types/profile.types';
