import { api } from '@/infrastructure/http/api';
import { User, useAuthStore } from '@/infrastructure/auth/auth.store';
import type { Page } from './iam/pipeline.service';

function buildQuery(params: Record<string, string | number | undefined>): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') usp.set(key, String(value));
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

export class UserService {
  static async getMe(): Promise<User> {
    const data = await api.get<User>('/api/v1/users/me');
    return data;
  }

  /** Users who currently hold platform governance access (any policy, including custom ones). */
  static async getPlatformAccessUsers(
    search?: string,
    page = 0,
    size = 20
  ): Promise<Page<User>> {
    return api.get<Page<User>>(`/api/v1/users/admins${buildQuery({ search, page, size })}`);
  }

  /** Users with no platform access yet — the search pool for granting someone new access. */
  static async searchGrantCandidates(
    search: string,
    page = 0,
    size = 20
  ): Promise<Page<User>> {
    return api.get<Page<User>>(
      `/api/v1/users/eligible-admins${buildQuery({ search, page, size })}`
    );
  }

  static async assignRolesToUser(userId: string, roleIds: string[]): Promise<User> {
    const data = await api.put<User>(`/api/v1/users/${userId}/roles`, roleIds);
    return data;
  }

  static async getPublicProfile(username: string): Promise<any> {
    const data = await api.get(`/api/v1/public/profiles/${username}`);
    return data;
  }

  // REMOVED (D3): getMyTimeActivity() / GET /api/v1/users/me/time-activity.
  //
  // It returned TimeLog rows — seconds between a WebSocket connect and disconnect, i.e. how long a
  // tab was open — which My Learning rendered as "Learning Time … Hours/Day". D2.5 cut the last
  // consumer; D3 removed the backend endpoint and replaced the capability properly: real learning
  // duration is `learningMinutes` on `GET /api/v1/me/activity`, aggregated by the backend from
  // interaction-gated lesson-engagement segments. Read it via `useDailyActivityQuery` from
  // `@/domains/learning`. Do not re-add a session-presence time source to the identity domain.

  static async updateProfile(
    firstName: string,
    lastName: string,
    bio?: string,
    linkedinUrl?: string,
    username?: string,
    mobileNumber?: string,
    gender?: string,
    address?: string,
    githubUrl?: string,
    avatarUrl?: string,
    onboardingCompleted?: boolean
  ): Promise<User> {
    const data = await api.put<User>('/api/v1/users/me', {
      firstName,
      lastName,
      bio,
      linkedinUrl,
      username,
      mobileNumber,
      gender,
      address,
      githubUrl,
      avatarUrl,
      onboardingCompleted,
    });
    return data;
  }

  static async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('file', file);
    const data = await api.post<User>('/api/v1/users/me/avatar', formData);
    return data;
  }

  static async removeAvatar(): Promise<User> {
    const data = await api.delete<User>('/api/v1/users/me/avatar');
    return data;
  }

  static async acceptContentCreatorInvite(): Promise<void> {
    await api.post('/api/v1/content-creators/accept');
  }

  static async declineContentCreatorInvite(): Promise<void> {
    await api.post('/api/v1/content-creators/decline');
  }

  static async checkUsername(username: string): Promise<{ available: boolean; suggestions: string[] }> {
    const data = await api.get<{ available: boolean; suggestions: string[] }>(`/api/v1/users/check-username?username=${encodeURIComponent(username)}`);
    return data;
  }

  static async checkEmail(email: string): Promise<User | null> {
    try {
      const data = await api.get<User>(`/api/v1/users/check-email?email=${encodeURIComponent(email)}`);
      return data;
    } catch (e) {
      return null;
    }
  }
}
