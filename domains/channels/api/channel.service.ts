import { api } from '@/infrastructure/http/api';

export interface Channel {
  id: string;
  name: string;
  iconUrl?: string;
  bannerUrl?: string;
  description?: string;
  isPersonal: boolean;
  status: string;
  suspensionReason?: string;
  suspendedAt?: string;
  forcedSuspension?: boolean;
  /** When public listings will be unlisted, if suspended (non-forced). Null once already past. */
  contentUnlistDate?: string;
  ownerId: string;
  ownerName: string;
  ownerEmail?: string;
  ownerPhone?: string;
  createdAt: string;
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

export const channelService = {
  createChannelRequest: async (
    name: string,
    description: string,
    isPersonal: boolean,
    iconFile?: File
  ): Promise<Channel> => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('isPersonal', String(isPersonal));
    
    if (iconFile) {
      formData.append('icon', iconFile);
    }
    
    const response = await api.post<Channel>('/api/v1/channels', formData);
    return response;
  },

  updateChannelSettings: async (
    channelId: string,
    description: string,
    iconFile?: File,
    bannerFile?: File
  ): Promise<Channel> => {
    const formData = new FormData();
    formData.append('description', description);
    
    if (iconFile) {
      formData.append('icon', iconFile);
    }
    if (bannerFile) {
      formData.append('banner', bannerFile);
    }
    
    const response = await api.post<Channel>(`/api/v1/channels/${channelId}/settings`, formData);
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
  }
};
