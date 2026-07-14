import { apiClient } from '@/lib/apiClient';
import { User } from '@/store/auth.store';

export class UserService {
  static async getMe(): Promise<User> {
    const { data } = await apiClient.get<User>('/users/me');
    return data;
  }

  static async getPublicProfile(username: string): Promise<any> {
    const { data } = await apiClient.get(`/public/profiles/${username}`);
    return data;
  }

  static async updateProfile(firstName: string, lastName: string, bio?: string, linkedinUrl?: string, username?: string, mobileNumber?: string, gender?: string, address?: string, githubUrl?: string): Promise<User> {
    const { data } = await apiClient.put<User>('/users/me', { firstName, lastName, bio, linkedinUrl, username, mobileNumber, gender, address, githubUrl });
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

  static async checkUsername(username: string): Promise<{ available: boolean; suggestions: string[] }> {
    const { data } = await apiClient.get<{ available: boolean; suggestions: string[] }>(`/users/check-username?username=${encodeURIComponent(username)}`);
    return data;
  }
}
