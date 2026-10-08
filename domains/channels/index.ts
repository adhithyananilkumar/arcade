/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Channels
 *
 * Purpose:
 * Exposes the public API for the Channels domain.
 *
 * Rules:
 * - Export only stable public APIs.
 * - Never export internal helpers.
 * - Never import from apps/.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

export { ChannelStaffService } from './api/channel-staff.service';
export type { ChannelStaff, ChannelInvitation } from './api/channel-staff.service';
export { channelService } from './api/channel.service';
export type {
  ChannelDeletionRequestDto,
  Channel,
  ChannelApplicantProfile,
  ChannelApplicantInput,
  ChannelOrganizationInput,
  CreateChannelRequestOptions,
  ValidateCreationInvitationResponse,
  ChannelAuditLogEntry,
  ChannelAnalytics,
  ChannelAnalyticsTimeframe,
  ChannelContentItem,
  ChannelSummary,
  ChannelSummaryQuery,
  ChannelSettingsUpdate,
  ChannelSignatory,
  ChannelSignatoryUpdate,
  CredentialBrandingItem,
  CredentialBrandingReadiness,
  OwnershipTransferResponse,
} from './api/channel.service';
export { InviteUserModal } from './components/InviteUserModal';
export { ChannelPicker } from './components/ChannelPicker';
export { ChannelBrandingNotice, isBrandingIncomplete, brandingSetupHref } from './components/ChannelBrandingNotice';
export {
  PendingChannelInvitations,
  useMyChannelInvitations,
  myChannelInvitationsKey,
} from './components/PendingChannelInvitations';
export { ChannelDoodleBanner } from './components/ChannelDoodleBanner';
export { useStudioAccess } from './hooks/useStudioAccess';
export { useEligibleChannels } from './hooks/useEligibleChannels';
export {
  useMyChannelsQuery,
  useMyWorkspacesQuery,
  useUserChannels,
  useHasAnyChannel,
  myChannelsKeys,
} from './hooks/useMyChannelsQuery';
export {
  useChannelSummariesQuery,
  useChannelCountsQuery,
  usePendingChannelRequestsQuery,
  usePendingDeletionRequestsQuery,
  useChannelAuditLogQuery,
  useInvalidateChannelAdmin,
  channelAdminKeys,
} from './hooks/useChannelAdminQueries';