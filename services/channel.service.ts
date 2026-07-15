import { apiClient } from '@/lib/apiClient';

export interface Channel {
  id: string;
  name: string;
  iconUrl?: string;
  description?: string;
  isPersonal: boolean;
  status: string;
  ownerId: string;
  ownerName: string;
  ownerEmail?: string;
  ownerPhone?: string;
  createdAt: string;
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

  getChannel: async (channelId: string): Promise<Channel> => {
    const response = await apiClient.get<Channel>(`/channels/${channelId}`);
    return response.data;
  },

  acceptChannelRequest: async (channelId: string): Promise<void> => {
    await apiClient.post(`/channels/${channelId}/accept`);
  },

  deleteChannelRequest: async (channelId: string): Promise<void> => {
    await apiClient.delete(`/channels/${channelId}`);
  }
};
