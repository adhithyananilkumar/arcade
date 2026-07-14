import { apiClient } from '@/lib/apiClient';

export interface Permission {
  id: string;
  key: string;
  name: string;
  module: string;
  description: string;
  scopeType: string;
}

export const permissionService = {
  getAllPermissions: async (): Promise<Permission[]> => {
    const response = await apiClient.get<Permission[]>('/permissions');
    return response.data;
  },
};
