import { api } from '@/infrastructure/http/api';

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
    const response = await api.get<Permission[]>('/api/v1/permissions');
    return response;
  },
};
