import { apiClient } from '@/lib/apiClient';

export interface Session {
  id: string;
  familyId: string;
  ipAddress: string;
  createdAt: string;
}

export class SessionService {
  /**
   * Retrieves all active sessions for the current user.
   */
  static async getSessions(): Promise<Session[]> {
    const { data } = await apiClient.get<Session[]>('/sessions');
    return data;
  }

  /**
   * Revokes a specific session family.
   */
  static async revokeSession(familyId: string): Promise<void> {
    await apiClient.delete(`/sessions/${familyId}`);
  }
}
