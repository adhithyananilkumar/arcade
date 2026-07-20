import { api } from '@/infrastructure/http/api';

export interface Permission {
  id: string;
  code: string;
  module: string;
  description: string;
  context: string;
  deprecated?: boolean;
}

export const permissionService = {
  getAllPermissions: async (): Promise<Permission[]> => {
    const response = await api.get<Permission[]>('/api/v1/permissions');
    return response;
  },
};
