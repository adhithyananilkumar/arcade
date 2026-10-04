import { api } from '@/infrastructure/http/api';

/** One signed-in device, as the backend describes it. */
export interface Session {
  familyId: string;
  /** "Chrome on Windows"; "Unknown device" when the browser sent nothing. */
  device: string;
  browser?: string | null;
  os?: string | null;
  deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET' | 'UNKNOWN';
  ipAddress?: string | null;
  /** "Kochi, KL, IN" — approximate, from the network; absent when unknown. */
  location?: string | null;
  signedInAt?: string | null;
  lastActiveAt?: string | null;
  expiresAt?: string | null;
  /** The device making this request. */
  current: boolean;
}

export class SessionService {
  /** Live sessions, this device first. */
  static async getSessions(): Promise<Session[]> {
    return api.get<Session[]>('/api/v1/sessions');
  }

  /** Signs one device out immediately. */
  static async revokeSession(familyId: string): Promise<void> {
    await api.delete(`/api/v1/sessions/${familyId}`);
  }

  /** Signs out every device except this one; resolves to how many were signed out. */
  static async revokeOtherSessions(): Promise<number> {
    const result = await api.delete<{ revoked: number }>('/api/v1/sessions/others');
    return result?.revoked ?? 0;
  }
}
