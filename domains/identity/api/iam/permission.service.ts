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
  /** Returns only permissions valid for the given scope; the backend performs the filtering. */
  getAllPermissions: async (scope?: 'PLATFORM' | 'CHANNEL'): Promise<Permission[]> => {
    const query = scope ? `?scope=${scope}` : '';
    const response = await api.get<Permission[]>(`/api/v1/permissions${query}`);
    return response;
  },
};
