/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Profiles
 *
 * Purpose:
 * Types for the unified profile system — user profiles, organization channel
 * profiles, and the shared `domain/<handle>` namespace they are served from.
 *
 * Rules:
 * - Mirrors the backend's `PublicProfileResponse`, `ChannelProfileResponse`
 *   and `HandleDtos`. The backend decides what a profile contains and which
 *   sections are present; nothing here re-derives that.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import type { ProfileBadge } from '@/domains/recognition';

/** What occupies a name in the shared namespace. */
export type HandleSubjectType = 'USER' | 'CHANNEL' | 'RESERVED';

/**
 * The answer to "what lives at /acme".
 *
 * The catch-all profile route asks this first, because a handle may belong to a person or to an
 * organization and the two render completely different pages.
 */
export interface HandleResolution {
  handle: string;
  subjectType: HandleSubjectType;
  subjectId: string;
  /**
   * A legacy safety net. Personal channels are not issued handles — their owner's profile is
   * their page — so in practice this is always false for a resolvable channel.
   */
  personalChannel: boolean;
}

export type HandleAvailability =
  | 'AVAILABLE'
  | 'ALREADY_YOURS'
  | 'TAKEN'
  | 'RESERVED'
  | 'INVALID';

export interface HandleAvailabilityResult {
  handle: string;
  normalized: string;
  availability: HandleAvailability;
  claimable: boolean;
  /**
   * Whether a refusal is worth contesting. False for a malformed name — no decision could make
   * it servable — and true for one that is taken or platform-reserved.
   */
  appealable: boolean;
  message?: string | null;
  suggestions: string[];
}

// ---------------------------------------------------------------------------
// User profile
// ---------------------------------------------------------------------------

export interface ProfileCourse {
  id: string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  status: string;
  createdAt?: string | null;
}

export interface ProfileWorkshop {
  id: string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  status: string;
  createdAt?: string | null;
}

export interface ProfileCertificate {
  id: string;
  courseTitle?: string | null;
  issuedAt?: string | null;
  certificateNumber?: string | null;
  [key: string]: unknown;
}

/**
 * A channel this person belongs to.
 *
 * `personal` matters for linking: a personal channel has no page of its own, so its catalog is
 * rendered inline on this profile rather than behind a link. `handle` is null when an
 * organization channel has not claimed one — build a link only when it is present.
 */
export interface ProfileChannel {
  id: string;
  name: string;
  handle?: string | null;
  iconUrl?: string | null;
  tagline?: string | null;
  personal: boolean;
  role: string;
  badges: ProfileBadge[];
}

export interface ProfileStats {
  publishedCourses: number;
  publishedWorkshops: number;
  certificates: number;
}

/**
 * A person's public profile.
 *
 * One shape for everyone, because every account is the same kind of thing: a learner, some of
 * whom also teach. Sections appear according to what the account has (`instructor`, `channels`,
 * `courses`) and what its owner chose to show (`learnerActivityVisible`) — never according to a
 * "profile type" that would have to be kept in sync with reality.
 */
export interface UserProfile {
  handle?: string | null;
  /** Legacy alias for `handle`, kept by the backend for older clients. */
  username?: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl?: string | null;
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  socialLinks: string[];
  createdAt: string;

  badges: ProfileBadge[];

  instructor: boolean;
  workingAt?: string | null;
  channels: ProfileChannel[];
  courses: ProfileCourse[];
  workshops: ProfileWorkshop[];

  /**
   * False when this account has hidden its learner side. The learner arrays are then empty
   * because the backend left them out of the payload — not because the client filtered them.
   */
  learnerActivityVisible: boolean;
  certificates: ProfileCertificate[];

  stats: ProfileStats;
}

// ---------------------------------------------------------------------------
// Channel profile
// ---------------------------------------------------------------------------

export interface ChannelMember {
  userId: string;
  name: string;
  handle?: string | null;
  avatarUrl?: string | null;
  headline?: string | null;
  role: string;
  owner: boolean;
  badges: ProfileBadge[];
}

export interface ChannelContentItem {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  status: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  channelId?: string | null;
  channelName?: string | null;
  authorId?: string | null;
  authorName?: string | null;
  authorUsername?: string | null;
}

/** An organization channel's standalone page. Personal channels never have one. */
export interface ChannelProfile {
  id: string;
  handle?: string | null;
  name: string;
  tagline?: string | null;
  description?: string | null;
  iconUrl?: string | null;
  bannerUrl?: string | null;
  location?: string | null;
  websiteUrl?: string | null;
  socialLinks: string[];
  createdAt: string;
  badges: ProfileBadge[];
  owner: ChannelMember;
  members: ChannelMember[];
  content: ChannelContentItem[];
  stats: {
    publishedContent: number;
    members: number;
  };
}

// ---------------------------------------------------------------------------
// Handle appeals
// ---------------------------------------------------------------------------

export type HandleAppealStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface HandleAppeal {
  id: string;
  requestedHandle: string;
  claimantType: 'USER' | 'CHANNEL';
  claimantId: string;
  claimantName: string;
  claimantAvatarUrl?: string | null;
  claimantCurrentHandle?: string | null;
  /** Who holds the name right now, re-read at view time rather than captured at filing. */
  currentHolderName?: string | null;
  currentHolderType?: HandleSubjectType | null;
  status: HandleAppealStatus;
  justification: string;
  evidenceUrl?: string | null;
  decisionNote?: string | null;
  decidedByName?: string | null;
  decidedAt?: string | null;
  createdAt: string;
  /** Other open claims on the same name, so a reviewer decides them together. */
  competingClaimCount: number;
}

export interface FileAppealInput {
  handle: string;
  claimantType?: 'USER' | 'CHANNEL';
  /** Required when `claimantType` is CHANNEL; ignored otherwise. */
  claimantId?: string;
  justification: string;
  evidenceUrl?: string;
}

export interface PagedHandleAppeals {
  content: HandleAppeal[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
