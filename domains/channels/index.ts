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
export type { ChannelDeletionRequestDto, Channel } from './api/channel.service';
export { CreateChannelModal } from './components/CreateChannelModal';