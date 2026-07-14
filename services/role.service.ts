import { apiClient } from '@/lib/apiClient';

export interface Role {
  id: string;
  name: string;
  description: string;
  scopeType: string;
  isSystem: boolean;
  permissions?: { id: string, name: string }[];
}

export interface RoleRequest {
  name: string;
  description: string;
  permissionIds: string[];
}

export const roleService = {
  getAllRoles: async (): Promise<Role[]> => {
    const response = await apiClient.get<Role[]>('/roles');
    return response.data;
  },

  createRole: async (request: RoleRequest): Promise<Role> => {
    const response = await apiClient.post<Role>('/roles', request);
    return response.data;
  },

  updateRole: async (id: string, request: RoleRequest): Promise<Role> => {
    const response = await apiClient.put<Role>(`/roles/${id}`, request);
    return response.data;
  },
};
