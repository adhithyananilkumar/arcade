import { apiClient } from '@/lib/apiClient';

export interface ChannelStaff {
  id: string;
  userId: string;
  userName: string;
  email: string;
  roleName: string;
  joinedAt: string;
}

export interface ChannelInvitation {
  id: string;
  email: string;
  roleName: string;
  status: string;
  channelName: string;
  invitedByName: string;
  createdAt: string;
}

export class ChannelStaffService {
  static async getStaff(channelId: string): Promise<ChannelStaff[]> {
    const { data } = await apiClient.get<ChannelStaff[]>(`/channels/${channelId}/staff`);
    return data;
  }

  static async removeStaff(channelId: string, userId: string): Promise<void> {
    await apiClient.delete(`/channels/${channelId}/staff/${userId}`);
  }

  static async getInvitations(channelId: string): Promise<ChannelInvitation[]> {
    const { data } = await apiClient.get<ChannelInvitation[]>(`/channels/${channelId}/staff/invitations`);
    return data;
  }

  static async inviteStaff(channelId: string, email: string, roleId: string): Promise<ChannelInvitation> {
    const { data } = await apiClient.post<ChannelInvitation>(`/channels/${channelId}/staff/invitations`, {
      email,
      roleId
    });
    return data;
  }

  static async deleteInvitation(channelId: string, invitationId: string): Promise<void> {
    await apiClient.delete(`/channels/${channelId}/staff/invitations/${invitationId}`);
  }

  static async getMyInvitations(): Promise<ChannelInvitation[]> {
    const { data } = await apiClient.get<ChannelInvitation[]>('/users/me/invitations');
    return data;
  }

  static async acceptInvitation(invitationId: string): Promise<void> {
    await apiClient.post(`/users/me/invitations/${invitationId}/accept`);
  }

  static async rejectInvitation(invitationId: string): Promise<void> {
    await apiClient.post(`/users/me/invitations/${invitationId}/reject`);
  }
}
