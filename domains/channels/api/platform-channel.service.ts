import { api } from '@/infrastructure/http/api';
import { Channel } from './channel.service';
import { ChannelStaff } from './channel-staff.service';

export interface ChannelStatisticsResponse {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalRoadmaps: number;
  totalMedia: number;
  totalStaff: number;
  totalStudents: number;
}

export interface ChannelActivityResponse {
  id: string;
  actorId: string | null;
  actorName: string;
  actionType: string;
  description: string;
  createdAt: string;
}

export const platformChannelService = {
  getChannelDetails: async (channelId: string): Promise<Channel> => {
    return api.get<Channel>(`/api/v1/platform/channels/${channelId}`);
  },

  getChannelStatistics: async (channelId: string): Promise<ChannelStatisticsResponse> => {
    return api.get<ChannelStatisticsResponse>(`/api/v1/platform/channels/${channelId}/statistics`);
  },

  getChannelStaff: async (channelId: string): Promise<ChannelStaff[]> => {
    return api.get<ChannelStaff[]>(`/api/v1/platform/channels/${channelId}/staff`);
  },

  getChannelCourses: async (channelId: string): Promise<any[]> => {
    return api.get<any[]>(`/api/v1/platform/channels/${channelId}/courses`);
  },

  getChannelRoadmaps: async (channelId: string): Promise<any[]> => {
    return api.get<any[]>(`/api/v1/platform/channels/${channelId}/roadmaps`);
  },

  getChannelMedia: async (channelId: string): Promise<any[]> => {
    return api.get<any[]>(`/api/v1/platform/channels/${channelId}/media`);
  },

  getChannelActivity: async (channelId: string): Promise<ChannelActivityResponse[]> => {
    return api.get<ChannelActivityResponse[]>(`/api/v1/platform/channels/${channelId}/activity`);
  },

  approveChannel: async (channelId: string): Promise<void> => {
    await api.post(`/api/v1/platform/channels/${channelId}/approve`);
  },

  rejectChannel: async (channelId: string): Promise<void> => {
    await api.post(`/api/v1/platform/channels/${channelId}/reject`);
  },

  suspendChannel: async (channelId: string): Promise<void> => {
    await api.post(`/api/v1/platform/channels/${channelId}/suspend`);
  },

  restoreChannel: async (channelId: string): Promise<void> => {
    await api.post(`/api/v1/platform/channels/${channelId}/restore`);
  },

  verifyChannel: async (channelId: string): Promise<void> => {
    await api.post(`/api/v1/platform/channels/${channelId}/verify`);
  }
};
