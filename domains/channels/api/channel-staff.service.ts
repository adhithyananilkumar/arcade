import { api } from '@/infrastructure/http/api';

export interface ChannelRoleSummary {
  id: string;
  displayName: string;
}

export interface ChannelStaff {
  id: string;
  userId: string;
  userName: string;
  username: string;
  email: string;
  roles: ChannelRoleSummary[];
  joinedAt: string;
}

export interface ChannelInvitation {
  id: string;
  email: string;
  roleNames: string[];
  status: string;
  channelName: string;
  invitedByName: string;
  createdAt: string;
}

interface Page<T> {
  content: T[];
}

export class ChannelStaffService {
  static async getStaff(channelId: string): Promise<ChannelStaff[]> {
    // Backend paginates this endpoint (see ChannelStaffController#getStaff); request a page
    // large enough to cover typical channel rosters until the UI grows real page controls.
    const data = await api.get<Page<ChannelStaff>>(
      `/api/v1/channels/${channelId}/staff?size=100`
    );
    return data.content;
  }

  static async removeStaff(channelId: string, userId: string): Promise<void> {
    await api.delete(`/api/v1/channels/${channelId}/staff/${userId}`);
  }

  static async updateStaffRoles(channelId: string, userId: string, roleIds: string[]): Promise<ChannelStaff> {
    const data = await api.patch<ChannelStaff>(`/api/v1/channels/${channelId}/staff/${userId}/roles`, {
      roleIds
    });
    return data;
  }

  static async getInvitations(channelId: string): Promise<ChannelInvitation[]> {
    const data = await api.get<Page<ChannelInvitation>>(
      `/api/v1/channels/${channelId}/staff/invitations?size=100`
    );
    return data.content;
  }

  static async inviteStaff(
    channelId: string,
    identifier: { email: string } | { username: string },
    roleIds: string[]
  ): Promise<ChannelInvitation> {
    const data = await api.post<ChannelInvitation>(`/api/v1/channels/${channelId}/staff/invitations`, {
      ...identifier,
      roleIds
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
