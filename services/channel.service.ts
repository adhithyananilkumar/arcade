import { apiClient } from '@/lib/apiClient';

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
    
    const response = await apiClient.post<Channel>('/channels', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
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
    
    const response = await apiClient.patch<Channel>(`/channels/${channelId}/settings`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getPendingRequests: async (): Promise<Channel[]> => {
    const response = await apiClient.get<Channel[]>('/channels/requests');
    return response.data;
  },

  getAllChannels: async (): Promise<Channel[]> => {
    const response = await apiClient.get<Channel[]>('/channels');
    return response.data;
  },

  getMyChannels: async (): Promise<Channel[]> => {
    const response = await apiClient.get<Channel[]>('/channels/me');
    return response.data;
  },

  getMyWorkspaces: async (): Promise<Channel[]> => {
    const response = await apiClient.get<Channel[]>('/channels/workspaces');
    return response.data;
  },

  getMyChannelPermissions: async (channelId: string): Promise<string[]> => {
    const response = await apiClient.get<string[]>(`/channels/${channelId}/permissions`);
    return response.data;
  },

  getChannel: async (channelId: string): Promise<Channel> => {
    const response = await apiClient.get<Channel>(`/channels/${channelId}`);
    return response.data;
  },

  acceptChannelRequest: async (channelId: string): Promise<void> => {
    await apiClient.post(`/channels/${channelId}/accept`);
  },

  deleteChannelRequest: async (channelId: string): Promise<void> => {
    await apiClient.delete(`/channels/${channelId}`);
  },

  submitDeletionRequest: async (
    channelId: string,
    reason: string,
    phoneNumber: string,
    email: string
  ): Promise<void> => {
    await apiClient.post(`/channels/${channelId}/delete-request`, null, {
      params: { reason, phoneNumber, email }
    });
  },

  getPendingDeletionRequests: async (): Promise<ChannelDeletionRequestDto[]> => {
    const response = await apiClient.get<ChannelDeletionRequestDto[]>('/channels/delete-requests');
    return response.data;
  },

  getMyDeletionRequests: async (): Promise<ChannelDeletionRequestDto[]> => {
    const response = await apiClient.get<ChannelDeletionRequestDto[]>('/channels/my-delete-requests');
    return response.data;
  },

  reviewDeletionRequest: async (requestId: string, action: 'APPROVE' | 'REJECT'): Promise<void> => {
    await apiClient.post(`/channels/delete-requests/${requestId}/review`, null, {
      params: { action }
    });
  }
};
