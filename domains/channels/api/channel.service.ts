import { api } from '@/infrastructure/http/api';

/**
 * Applicant KYC-style profile captured on channel creation (both Personal and Organization
 * requests). Organization sub-fields are only populated when the channel is not personal.
 * Mirrors `ChannelApplicantProfile` / the `applicantProfile` field on the backend's
 * `ChannelResponse` DTO — see the "Invitation -> Channel Creation Flow" plan, Backend §2/§6.
 */
export interface ChannelApplicantProfile {
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  personalIdProofType: string;
  personalIdProofNumber: string;
  personalIdProofDocumentUrl?: string;
  organizationName?: string;
  organizationType?: string;
  organizationDescription?: string;
  organizationWebsite?: string;
  organizationEmail?: string;
  organizationAddress?: string;
  organizationRegistrationNumber?: string;
  roleInOrganization?: string;
  organizationProofNumber?: string;
  organizationProofDocumentUrl?: string;
}

export interface Channel {
  id: string;
  name: string;
  iconUrl?: string;
  bannerUrl?: string;
  description?: string;
  /** Free-text reason the requester wants this channel, distinct from `description`. */
  purpose?: string;
  socialLinks?: string[];
  isPersonal: boolean;
  status: string;
  suspensionReason?: string;
  suspendedAt?: string;
  forcedSuspension?: boolean;
  /** When public listings will be unlisted, if suspended (non-forced). Null once already past. */
  contentUnlistDate?: string;
  ownerId: string;
  ownerName: string;
  ownerUsername?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  createdAt: string;
  /** Present when this channel originated from the invite-gated creation flow. */
  applicantProfile?: ChannelApplicantProfile;
}

/** Applicant-side fields collected on the invite-gated channel creation form. */
export interface ChannelApplicantInput {
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  personalIdProofType: string;
  personalIdProofNumber: string;
  personalIdProofDocument?: File;
}

/** Organization-side fields, required only when submitting a non-personal channel request. */
export interface ChannelOrganizationInput {
  organizationName: string;
  organizationType: string;
  organizationDescription: string;
  organizationWebsite?: string;
  organizationEmail: string;
  organizationAddress: string;
  organizationRegistrationNumber: string;
  roleInOrganization: string;
  organizationProofNumber: string;
  organizationProofDocument?: File;
}

/**
 * Extra fields for a channel creation request submitted through the invite-gated flow.
 * All optional so the two pre-existing `createChannelRequest` call sites (the quick
 * CreateChannelModal, and /channels/new) keep working unchanged.
 */
export interface CreateChannelRequestOptions {
  invitationToken?: string;
  purpose?: string;
  applicant?: ChannelApplicantInput;
  organization?: ChannelOrganizationInput;
}

export interface ValidateCreationInvitationResponse {
  valid: boolean;
  email?: string;
  invitedByName?: string;
  expired?: boolean;
  accountExists?: boolean;
}

export interface ChannelContentItem {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  authorId?: string | null;
  authorName?: string | null;
  authorUsername?: string | null;
}

export interface ChannelAuditLogEntry {
  id: string;
  channelId: string;
  channelName: string;
  action: string;
  actorId?: string;
  actorName?: string;
  details?: string;
  createdAt: string;
}

export interface ChannelDeletionRequestDto {
  id: string;
  channelId: string;
  channelName: string;
  channelIconUrl?: string;
  requestedBy: string;
  requestedByName: string;
  reason: string;
  phoneNumber: string;
  email: string;
  status: string;
  createdAt: string;
  isPersonal: boolean;
}

export interface OwnershipTransferResponse {
  id: string;
  channelId: string;
  channelName: string;
  currentOwnerId: string;
  currentOwnerName: string;
  proposedOwnerId: string;
  proposedOwnerName: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'EXPIRED';
  createdAt: string;
  expiresAt: string;
  respondedAt?: string | null;
}

export interface ChannelSettingsUpdate {
  /** Omit to leave the name unchanged. */
  name?: string;
  /** Omit to leave the description unchanged. */
  description?: string;
  iconFile?: File;
  bannerFile?: File;
  removeIcon?: boolean;
  removeBanner?: boolean;
  /** Omit to leave social links unchanged; pass [] to clear them. */
  socialLinks?: string[];
}

export const channelService = {
  createChannelRequest: async (
    name: string,
    description: string,
    isPersonal: boolean,
    iconFile?: File,
    options?: CreateChannelRequestOptions
  ): Promise<Channel> => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('isPersonal', String(isPersonal));

    if (iconFile) {
      formData.append('icon', iconFile);
    }

    if (options?.invitationToken) {
      formData.append('invitationToken', options.invitationToken);
    }
    if (options?.purpose !== undefined) {
      formData.append('purpose', options.purpose);
    }

    if (options?.applicant) {
      const { personalIdProofDocument, ...applicantFields } = options.applicant;
      formData.append('fullName', applicantFields.fullName);
      formData.append('phoneNumber', applicantFields.phoneNumber);
      formData.append('applicantEmail', applicantFields.email);
      formData.append('dateOfBirth', applicantFields.dateOfBirth);
      formData.append('gender', applicantFields.gender);
      formData.append('nationality', applicantFields.nationality);
      formData.append('address', applicantFields.address);
      formData.append('city', applicantFields.city);
      formData.append('state', applicantFields.state);
      formData.append('country', applicantFields.country);
      formData.append('pinCode', applicantFields.pinCode);
      formData.append('personalIdProofType', applicantFields.personalIdProofType);
      formData.append('personalIdProofNumber', applicantFields.personalIdProofNumber);
      if (personalIdProofDocument) {
        formData.append('personalIdProofDocument', personalIdProofDocument);
      }
    }

    if (options?.organization) {
      const { organizationProofDocument, ...orgFields } = options.organization;
      formData.append('organizationName', orgFields.organizationName);
      formData.append('organizationType', orgFields.organizationType);
      formData.append('organizationDescription', orgFields.organizationDescription);
      if (orgFields.organizationWebsite) {
        formData.append('organizationWebsite', orgFields.organizationWebsite);
      }
      formData.append('organizationEmail', orgFields.organizationEmail);
      formData.append('organizationAddress', orgFields.organizationAddress);
      formData.append('organizationRegistrationNumber', orgFields.organizationRegistrationNumber);
      formData.append('roleInOrganization', orgFields.roleInOrganization);
      formData.append('organizationProofNumber', orgFields.organizationProofNumber);
      if (organizationProofDocument) {
        formData.append('organizationProofDocument', organizationProofDocument);
      }
    }

    const response = await api.post<Channel>('/api/v1/channels', formData);
    return response;
  },

  /** Admin-only: invite a user (by email or username) to go through the channel creation flow. */
  sendCreationInvitation: async (identifier: string): Promise<void> => {
    await api.post('/api/v1/channels/creation-invitations', { identifier });
  },

  /** Public, unauthenticated check of an invite token — no mutation. */
  validateCreationInvitation: async (token: string): Promise<ValidateCreationInvitationResponse> => {
    const query = new URLSearchParams({ token }).toString();
    const response = await api.get<ValidateCreationInvitationResponse>(
      `/api/v1/channels/creation-invitations/validate?${query}`
    );
    return response;
  },

  /**
   * Partial update: every field left undefined is untouched by the backend, so callers that only
   * own one piece of the profile (e.g. the social-links card) can't accidentally wipe the rest.
   */
  updateChannelProfile: async (
    channelId: string,
    update: ChannelSettingsUpdate
  ): Promise<Channel> => {
    const formData = new FormData();
    if (update.name !== undefined) {
      formData.append('name', update.name);
    }
    if (update.description !== undefined) {
      formData.append('description', update.description);
    }
    if (update.iconFile) {
      formData.append('icon', update.iconFile);
    }
    if (update.bannerFile) {
      formData.append('banner', update.bannerFile);
    }
    formData.append('removeIcon', String(!!update.removeIcon));
    formData.append('removeBanner', String(!!update.removeBanner));
    if (update.socialLinks) {
      // An empty list must still reach the backend as "clear", which multipart can't express with
      // zero entries — send one empty value that the backend trims away.
      if (update.socialLinks.length === 0) {
        formData.append('socialLinks', '');
      }
      update.socialLinks.forEach((link) => {
        formData.append('socialLinks', link);
      });
    }

    const response = await api.post<Channel>(`/api/v1/channels/${channelId}/settings`, formData);
    return response;
  },

  updateChannelSettings: async (
    channelId: string,
    description: string,
    iconFile?: File,
    bannerFile?: File,
    removeIcon: boolean = false,
    removeBanner: boolean = false,
    socialLinks?: string[]
  ): Promise<Channel> =>
    channelService.updateChannelProfile(channelId, {
      description,
      iconFile,
      bannerFile,
      removeIcon,
      removeBanner,
      socialLinks,
    }),

  /** The caller's own channel requests still awaiting platform review. */
  getMyChannelRequests: async (): Promise<Channel[]> => {
    const response = await api.get<Channel[]>('/api/v1/channels/requests/me');
    return response;
  },

  getPendingRequests: async (): Promise<Channel[]> => {
    const response = await api.get<Channel[]>('/api/v1/channels/requests');
    return response;
  },

  getAllChannels: async (): Promise<Channel[]> => {
    const response = await api.get<Channel[]>('/api/v1/channels');
    return response;
  },

  getMyChannels: async (): Promise<Channel[]> => {
    const response = await api.get<Channel[]>('/api/v1/channels/me');
    return response;
  },

  getMyWorkspaces: async (): Promise<Channel[]> => {
    const response = await api.get<Channel[]>('/api/v1/channels/workspaces');
    return response;
  },

  getChannelContent: async (channelId: string): Promise<ChannelContentItem[]> => {
    const response = await api.get<ChannelContentItem[]>(`/api/v1/channels/${channelId}/content`);
    return response;
  },

  /** The channel home page's content grid — published content only, visible to any user. */
  getPublishedChannelContent: async (channelId: string): Promise<ChannelContentItem[]> => {
    const response = await api.get<ChannelContentItem[]>(
      `/api/v1/channels/${channelId}/published-content`
    );
    return response;
  },

  /**
   * Permanent, non-recoverable deletion — removes the channel and ALL of its content
   * immediately, no grace period. `confirmName` must exactly match the channel's current name
   * (type-to-confirm safety check enforced by the backend).
   */
  hardDeleteChannel: async (channelId: string, reason: string, confirmName: string): Promise<void> => {
    const query = new URLSearchParams({ reason, confirmName }).toString();
    await api.delete(`/api/v1/channels/${channelId}/hard-delete?${query}`);
  },

  getMyChannelPermissions: async (channelId: string): Promise<string[]> => {
    const response = await api.get<string[]>(`/api/v1/channels/${channelId}/permissions`);
    return response;
  },

  getChannel: async (channelId: string): Promise<Channel> => {
    const response = await api.get<Channel>(`/api/v1/channels/${channelId}`);
    return response;
  },

  acceptChannelRequest: async (channelId: string): Promise<void> => {
    await api.post(`/api/v1/channels/${channelId}/accept`);
  },

  deleteChannelRequest: async (channelId: string): Promise<void> => {
    await api.delete(`/api/v1/channels/${channelId}`);
  },

  submitDeletionRequest: async (
    channelId: string,
    reason: string,
    phoneNumber: string,
    email: string
  ): Promise<void> => {
    const query = new URLSearchParams({ reason, phoneNumber, email }).toString();
    await api.post(`/api/v1/channels/${channelId}/delete-request?${query}`);
  },

  getPendingDeletionRequests: async (): Promise<ChannelDeletionRequestDto[]> => {
    const response = await api.get<ChannelDeletionRequestDto[]>('/api/v1/channels/delete-requests');
    return response;
  },

  getMyDeletionRequests: async (): Promise<ChannelDeletionRequestDto[]> => {
    const response = await api.get<ChannelDeletionRequestDto[]>('/api/v1/channels/my-delete-requests');
    return response;
  },

  reviewDeletionRequest: async (requestId: string, action: 'APPROVE' | 'REJECT', force: boolean = false): Promise<void> => {
    const query = new URLSearchParams({ action, force: String(force) }).toString();
    await api.post(`/api/v1/channels/delete-requests/${requestId}/review?${query}`);
  },

  suspendChannel: async (channelId: string, reason: string, force: boolean = false): Promise<Channel> => {
    const query = new URLSearchParams({ reason, force: String(force) }).toString();
    const response = await api.post<Channel>(`/api/v1/channels/${channelId}/suspend?${query}`);
    return response;
  },

  reactivateChannel: async (channelId: string): Promise<Channel> => {
    const response = await api.post<Channel>(`/api/v1/channels/${channelId}/reactivate`);
    return response;
  },

  getAuditLog: async (): Promise<ChannelAuditLogEntry[]> => {
    const response = await api.get<{ content: ChannelAuditLogEntry[] }>('/api/v1/channels/audit-log?size=100');
    return response.content;
  },

  getChannelAuditLog: async (channelId: string, category: string = 'ALL'): Promise<ChannelAuditLogEntry[]> => {
    const response = await api.get<{ content: ChannelAuditLogEntry[] }>(`/api/v1/channels/${channelId}/audit-log?size=100&category=${category}`);
    return response.content;
  },

  sendOwnershipTransferOtp: async (channelId: string, email: string): Promise<void> => {
    await api.post(`/api/v1/channels/${channelId}/ownership-transfer/send-otp`, { email });
  },

  verifyOwnershipTransferOtp: async (channelId: string, email: string, otp: string): Promise<void> => {
    await api.post(`/api/v1/channels/${channelId}/ownership-transfer/verify-otp`, { email, otp });
  },

  requestOwnershipTransfer: async (
    channelId: string,
    proposedOwnerId: string,
    channelName?: string,
    currentOwnerEmail?: string,
    otp?: string
  ): Promise<OwnershipTransferResponse> => {
    const response = await api.post<OwnershipTransferResponse>(`/api/v1/channels/${channelId}/ownership-transfer`, {
      proposedOwnerId,
      channelName,
      currentOwnerEmail,
      otp
    });
    return response;
  },

  getOwnershipTransferStatus: async (channelId: string): Promise<OwnershipTransferResponse | null> => {
    const response = await api.get<OwnershipTransferResponse | null>(`/api/v1/channels/${channelId}/ownership-transfer`);
    return response;
  },

  acceptOwnershipTransfer: async (requestId: string): Promise<OwnershipTransferResponse> => {
    const response = await api.post<OwnershipTransferResponse>(`/api/v1/ownership-transfer/${requestId}/accept`);
    return response;
  },

  declineOwnershipTransfer: async (requestId: string): Promise<OwnershipTransferResponse> => {
    const response = await api.post<OwnershipTransferResponse>(`/api/v1/ownership-transfer/${requestId}/decline`);
    return response;
  },

  cancelOwnershipTransfer: async (requestId: string): Promise<OwnershipTransferResponse> => {
    const response = await api.delete<OwnershipTransferResponse>(`/api/v1/ownership-transfer/${requestId}`);
    return response;
  }
};
