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
export type { ProfileHeroProps, ProfileKind } from './components/ProfileHero';
export { LearnerProfileView } from './components/LearnerProfileView';
export type { LearnerProfileViewProps } from './components/LearnerProfileView';
export { InstructorProfileView } from './components/InstructorProfileView';
export type { InstructorProfileViewProps } from './components/InstructorProfileView';
export {
  AboutPanel,
  AchievementsPanel,
  ActivityPanel,
  ContentLibrary,
  LinksPanel,
  OrganizationsPanel,
  PeoplePanel,
  QuietProfilePanel,
} from './components/ProfilePanels';
export type {
  AchievementsPanelProps,
  ContentLibraryProps,
  PanelStat,
} from './components/ProfilePanels';
export { ContentCard, ProfileEmptyState } from './components/ProfileCards';
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
export { ProfileEditModal } from './components/ProfileEditModal';
export type { ProfileEditModalProps } from './components/ProfileEditModal';

export type {
  ChannelAddress,
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
  PublicActivity,
  UserProfile,
} from './types/profile.types';
