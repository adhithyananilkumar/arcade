import { api } from '@/infrastructure/http/api';

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
    const data = await api.get<Session[]>('/api/v1/sessions');
    return data;
  }

  /**
   * Revokes a specific session family.
   */
  static async revokeSession(familyId: string): Promise<void> {
    await api.delete(`/api/v1/sessions/${familyId}`);
  }
}
