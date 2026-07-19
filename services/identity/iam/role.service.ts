import { apiClient } from '@/lib/apiClient';

export interface Role {
  id: string;
  name: string;
  description: string;
  scopeType: string;
  isSystem: boolean;
  memberCount: number;
  level: number;
  permissions?: { id: string, name: string }[];
}

export interface RoleRequest {
  name: string;
  description: string;
  permissionIds: string[];
}

export const roleService = {
  getAllRoles: async (scope?: string): Promise<Role[]> => {
    const query = scope ? `?scope=${scope}` : '';
    const response = await apiClient.get<Role[]>(`/roles${query}`);
    return response.data;
  },

  createRole: async (request: RoleRequest, scope?: string): Promise<Role> => {
    const query = scope ? `?scope=${scope}` : '';
    const response = await apiClient.post<Role>(`/roles${query}`, request);
    return response.data;
  },

  updateRole: async (id: string, request: RoleRequest): Promise<Role> => {
    const response = await apiClient.put<Role>(`/roles/${id}`, request);
    return response.data;
  },

  deleteRole: async (id: string): Promise<void> => {
    await apiClient.delete(`/roles/${id}`);
  },

  // Channel-specific role endpoints
  getChannelRoles: async (channelId: string): Promise<Role[]> => {
    const response = await apiClient.get<Role[]>(`/channels/${channelId}/roles`);
    return response.data;
  },

  createChannelRole: async (channelId: string, request: RoleRequest): Promise<Role> => {
    const response = await apiClient.post<Role>(`/channels/${channelId}/roles`, request);
    return response.data;
  },

  updateChannelRole: async (channelId: string, roleId: string, request: RoleRequest): Promise<Role> => {
    const response = await apiClient.put<Role>(`/channels/${channelId}/roles/${roleId}`, request);
    return response.data;
  },

  deleteChannelRole: async (channelId: string, roleId: string): Promise<void> => {
    await apiClient.delete(`/channels/${channelId}/roles/${roleId}`);
  },
};
