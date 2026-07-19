import { api } from '@/infrastructure/http/api';

export interface Channel {
  id: string;
  name: string;
  iconUrl?: string;
  bannerUrl?: string;
  description?: string;
  isPersonal: boolean;
  status: string;
  ownerId: string;
  ownerName: string;
  ownerEmail?: string;
  ownerPhone?: string;
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

  reviewDeletionRequest: async (requestId: string, action: 'APPROVE' | 'REJECT'): Promise<void> => {
    const query = new URLSearchParams({ action }).toString();
    await api.post(`/api/v1/channels/delete-requests/${requestId}/review?${query}`);
  }
};
