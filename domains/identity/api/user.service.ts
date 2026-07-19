import { apiClient } from '@/lib/apiClient';
import { User } from '@/store/auth.store';

export class UserService {
  static async getMe(): Promise<User> {
    const { data } = await apiClient.get<User>('/users/me');
    return data;
  }

  static async getAllUsers(): Promise<User[]> {
    const { data } = await apiClient.get<User[]>('/users');
    return data;
  }

  static async getUsersByRole(roleId: string): Promise<User[]> {
    const { data } = await apiClient.get<User[]>(`/users/by-role/${roleId}`);
    return data;
  }

  static async assignRolesToUser(userId: string, roleIds: string[]): Promise<User> {
    const { data } = await apiClient.put<User>(`/users/${userId}/roles`, roleIds);
    return data;
  }

  static async getPublicProfile(username: string): Promise<any> {
    const { data } = await apiClient.get(`/public/profiles/${username}`);
    return data;
  }

  static async getUserActivity(username: string): Promise<{date: string, secondsSpent: number}[]> {
    const { data } = await apiClient.get<{date: string, secondsSpent: number}[]>(`/public/profiles/${username}/activity`);
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
    const { data } = await apiClient.put<User>('/users/me', {
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
    const { data } = await apiClient.post<User>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': undefined,
      },
    });
    return data;
  }

  static  async enrollInCourse(courseId: string): Promise<User> {
    await apiClient.post(`/learning/enrollments/${courseId}`);
    return this.getMe();
  }

  static async acceptContentCreatorInvite(): Promise<void> {
    await apiClient.post('/content-creators/accept');
  }

  static async declineContentCreatorInvite(): Promise<void> {
    await apiClient.post('/content-creators/decline');
  }

  static async checkUsername(username: string): Promise<{ available: boolean; suggestions: string[] }> {
    const { data } = await apiClient.get<{ available: boolean; suggestions: string[] }>(`/users/check-username?username=${encodeURIComponent(username)}`);
    return data;
  }

  static async checkEmail(email: string): Promise<User | null> {
    try {
      const { data } = await apiClient.get<User>(`/users/check-email?email=${encodeURIComponent(email)}`);
      return data;
    } catch (e) {
      return null;
    }
  }
}
