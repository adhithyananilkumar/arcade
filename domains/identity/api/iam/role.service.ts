import { api } from '@/infrastructure/http/api';

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
    const response = await api.get<Role[]>(`/api/v1/roles${query}`);
    return response;
  },

  createRole: async (request: RoleRequest, scope?: string): Promise<Role> => {
    const query = scope ? `?scope=${scope}` : '';
    const response = await api.post<Role>(`/api/v1/roles${query}`, request);
    return response;
  },

  updateRole: async (id: string, request: RoleRequest): Promise<Role> => {
    const response = await api.put<Role>(`/api/v1/roles/${id}`, request);
    return response;
  },

  deleteRole: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/roles/${id}`);
  },

  // Channel-specific role endpoints
  getChannelRoles: async (channelId: string): Promise<Role[]> => {
    const response = await api.get<Role[]>(`/api/v1/channels/${channelId}/roles`);
    return response;
  },

  createChannelRole: async (channelId: string, request: RoleRequest): Promise<Role> => {
    const response = await api.post<Role>(`/api/v1/channels/${channelId}/roles`, request);
    return response;
  },

  updateChannelRole: async (channelId: string, roleId: string, request: RoleRequest): Promise<Role> => {
    const response = await api.put<Role>(`/api/v1/channels/${channelId}/roles/${roleId}`, request);
    return response;
  },

  deleteChannelRole: async (channelId: string, roleId: string): Promise<void> => {
    await api.delete(`/api/v1/channels/${channelId}/roles/${roleId}`);
  },
};
