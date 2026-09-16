import { api } from '@/infrastructure/http/api';

/** The real Arcade Console navigation surface this permission's capability belongs to. */
export type ConsoleSurface =
  | 'CHANNELS'
  | 'REVIEWS'
  | 'CONTENT_MANAGE'
  | 'EXAMS'
  | 'PAYMENTS'
  | 'INBOX'
  | 'IAM'
  | 'SYSTEM';

export interface Permission {
  id: string;
  code: string;
  module: string;
  /** Null for CHANNEL-scope permissions — Channel IAM has no Console-surface picker. */
  surface: ConsoleSurface | null;
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
