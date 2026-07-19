import { api } from '@/infrastructure/http/api';
import { User } from '@/infrastructure/auth/auth.store';

export class UserService {
  static async getMe(): Promise<User> {
    const data = await api.get<User>('/api/v1/users/me');
    return data;
  }

  static async getAllUsers(): Promise<User[]> {
    const data = await api.get<User[]>('/api/v1/users');
    return data;
  }

  static async getUsersByRole(roleId: string): Promise<User[]> {
    const data = await api.get<User[]>(`/api/v1/users/by-role/${roleId}`);
    return data;
  }

  static async assignRolesToUser(userId: string, roleIds: string[]): Promise<User> {
    const data = await api.put<User>(`/api/v1/users/${userId}/roles`, roleIds);
    return data;
  }

  static async getPublicProfile(username: string): Promise<any> {
    const data = await api.get(`/api/v1/public/profiles/${username}`);
    return data;
  }

  static async getUserActivity(username: string): Promise<{date: string, secondsSpent: number}[]> {
    const data = await api.get<{date: string, secondsSpent: number}[]>(`/api/v1/public/profiles/${username}/activity`);
    return data;
  }

  static async updateProfile(
    firstName: string,
    lastName: string,
    bio?: string,
    linkedinUrl?: string,
    username?: string,
    mobileNumber?: string,
    gender?: string,
    address?: string,
    githubUrl?: string
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
    });
    return data;
  }

  static async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('file', file);
    const data = await api.post<User>('/api/v1/users/me/avatar', formData);
    return data;
  }

  static  async enrollInCourse(courseId: string): Promise<User> {
    await api.post(`/api/v1/learning/enrollments/${courseId}`);
    return this.getMe();
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
