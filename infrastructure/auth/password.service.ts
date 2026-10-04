import { api } from '@/infrastructure/http/api';

export interface PasswordStatus {
  /** False for an account that has only ever signed in with Google. */
  hasPassword: boolean;
  signsInWithGoogle: boolean;
  /** Masked, e.g. "ad•••@bca.ajce.in" — where the code will be sent. */
  email: string;
}

export interface PasswordChallenge {
  challengeId: string;
  expiresAt: string;
  sentTo: string;
}

/**
 * Settings → Security → password. Two steps, both checked by the backend:
 * the current password (skipped when the account has none), then a code emailed to the account.
 */
export class PasswordService {
  static async status(): Promise<PasswordStatus> {
    return api.get<PasswordStatus>('/api/v1/users/me/password');
  }

  /** Checks the current password and emails a six-digit code. */
  static async start(currentPassword: string | null): Promise<PasswordChallenge> {
    return api.post<PasswordChallenge>('/api/v1/users/me/password/change/start', { currentPassword });
  }

  /** Sets the new password; every other device is signed out. */
  static async confirm(challengeId: string, code: string, newPassword: string): Promise<number> {
    const result = await api.post<{ signedOutDevices: number }>('/api/v1/users/me/password/change/confirm', {
      challengeId,
      code,
      newPassword,
    });
    return result?.signedOutDevices ?? 0;
  }
}
