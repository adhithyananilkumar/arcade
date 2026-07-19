import { api } from '@/infrastructure/http/api';

export class CreatorService {
  /**
   * Invites an independent content creator by email.
   */
  static async inviteCreator(email: string): Promise<void> {
    await api.post('/api/v1/content-creators/invite-email', { email });
  }

  /**
   * Accepts an independent content creator invitation using the provided token.
   */
  static async acceptInvitation(token: string): Promise<void> {
    await api.post(`/api/v1/content-creators/accept-token?token=${encodeURIComponent(token)}`);
  }
}
