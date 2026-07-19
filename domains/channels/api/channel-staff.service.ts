import { api } from '@/infrastructure/http/api';

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
    const data = await api.get<ChannelStaff[]>(`/api/v1/channels/${channelId}/staff`);
    return data;
  }

  static async removeStaff(channelId: string, userId: string): Promise<void> {
    await api.delete(`/api/v1/channels/${channelId}/staff/${userId}`);
  }

  static async getInvitations(channelId: string): Promise<ChannelInvitation[]> {
    const data = await api.get<ChannelInvitation[]>(`/api/v1/channels/${channelId}/staff/invitations`);
    return data;
  }

  static async inviteStaff(channelId: string, email: string, roleId: string): Promise<ChannelInvitation> {
    const data = await api.post<ChannelInvitation>(`/api/v1/channels/${channelId}/staff/invitations`, {
      email,
      roleId
    });
    return data;
  }

  static async deleteInvitation(channelId: string, invitationId: string): Promise<void> {
    await api.delete(`/api/v1/channels/${channelId}/staff/invitations/${invitationId}`);
  }

  static async getMyInvitations(): Promise<ChannelInvitation[]> {
    const data = await api.get<ChannelInvitation[]>('/api/v1/users/me/invitations');
    return data;
  }

  static async acceptInvitation(invitationId: string): Promise<void> {
    await api.post(`/api/v1/users/me/invitations/${invitationId}/accept`);
  }

  static async rejectInvitation(invitationId: string): Promise<void> {
    await api.post(`/api/v1/users/me/invitations/${invitationId}/reject`);
  }
}
