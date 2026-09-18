import { api } from "@/infrastructure/http/api";

/**
 * Review governance API.
 *
 * Mirrors the backend's split exactly: platform-governed settings and channel-governed settings are
 * separate request shapes hitting separate endpoints. That is not just tidiness — the org request
 * type has no field capable of expressing a platform waiver, so a channel administration screen
 * literally cannot construct one, even by mistake.
 */

export type ChannelReviewPolicyView = {
  channelId: string;
  channelName: string;
  personalChannel: boolean;

  /** Platform-governed. Null means "inherit the platform default" (review required). */
  platformReviewRequired?: boolean | null;
  platformReviewRequiredFirstPublication?: boolean | null;
  platformExemptionReason?: string | null;
  platformPolicyUpdatedBy?: string | null;
  platformPolicyUpdatedByName?: string | null;
  platformPolicyUpdatedAt?: string | null;

  /** Channel-governed. Null means "inherit the default" (required for org channels). */
  orgReviewRequired?: boolean | null;
  orgReviewRequiredFirstPublication?: boolean | null;
  orgPolicyNote?: string | null;
  orgPolicyUpdatedBy?: string | null;
  orgPolicyUpdatedByName?: string | null;
  orgPolicyUpdatedAt?: string | null;

  /** What the resolver will actually do, with defaults applied. */
  effectivePlatformReviewRequired: boolean;
  effectiveOrgReviewRequired: boolean;

  activeExemptionCount: number;
};

export type AuthorExemptionView = {
  id: string;
  channelId: string;
  authorId: string;
  authorName: string;
  authorUsername?: string | null;
  scope: "ORG_REVIEW";
  reason?: string | null;
  grantedBy: string;
  grantedByName?: string | null;
  grantedAt: string;
  revokedBy?: string | null;
  revokedAt?: string | null;
  active: boolean;
};

export type GovernanceAuditView = {
  id: string;
  channelId: string;
  eventType:
    | "PLATFORM_POLICY_CHANGED"
    | "ORG_POLICY_CHANGED"
    | "AUTHOR_EXEMPTION_GRANTED"
    | "AUTHOR_EXEMPTION_REVOKED";
  actorScope: "PLATFORM" | "CHANNEL" | "SYSTEM";
  actorId?: string | null;
  actorName?: string | null;
  subjectId?: string | null;
  subjectName?: string | null;
  previousValue?: string | null;
  newValue?: string | null;
  reason?: string | null;
  createdAt: string;
};

const BASE = "/api/platform/reviews/governance";

export const reviewGovernanceApi = {
  /** Channels the caller may govern. Platform governors see all; channel admins see their own. */
  listChannels: (search?: string) =>
    api.get<ChannelReviewPolicyView[]>(
      `${BASE}/channels${search ? `?search=${encodeURIComponent(search)}` : ""}`
    ),

  getChannel: (channelId: string) =>
    api.get<ChannelReviewPolicyView>(`${BASE}/channels/${channelId}`),

  /**
   * PLATFORM-GOVERNED. Requires `platform.content.governance`.
   * A reason is mandatory when waiving review — the backend rejects the request without one.
   */
  updatePlatformPolicy: (
    channelId: string,
    body: {
      platformReviewRequired: boolean | null;
      platformReviewRequiredFirstPublication?: boolean | null;
      reason?: string;
    }
  ) =>
    api.put<ChannelReviewPolicyView>(`${BASE}/channels/${channelId}/platform-policy`, body),

  /** CHANNEL-GOVERNED. Cannot express a platform change. */
  updateOrgPolicy: (
    channelId: string,
    body: {
      orgReviewRequired: boolean | null;
      orgReviewRequiredFirstPublication?: boolean | null;
      note?: string;
    }
  ) => api.put<ChannelReviewPolicyView>(`${BASE}/channels/${channelId}/org-policy`, body),

  listExemptions: (channelId: string, includeRevoked = false) =>
    api.get<AuthorExemptionView[]>(
      `${BASE}/channels/${channelId}/exemptions?includeRevoked=${includeRevoked}`
    ),

  grantExemption: (channelId: string, body: { authorId: string; reason?: string }) =>
    api.post<AuthorExemptionView>(`${BASE}/channels/${channelId}/exemptions`, body),

  revokeExemption: (channelId: string, exemptionId: string) =>
    api.delete<void>(`${BASE}/channels/${channelId}/exemptions/${exemptionId}`),

  audit: (channelId: string, page = 0, size = 50) =>
    api.get<GovernanceAuditView[]>(
      `${BASE}/channels/${channelId}/audit?page=${page}&size=${size}`
    ),
};
