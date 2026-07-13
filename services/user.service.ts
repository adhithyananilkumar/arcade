import { apiClient } from '@/lib/apiClient';
import { User } from '@/store/auth.store';

export class UserService {
  static async getMe(): Promise<User> {
    const { data } = await apiClient.get<User>('/users/me');
    return data;
  }

  static async updateProfile(firstName: string, lastName: string, bio?: string, linkedinUrl?: string, username?: string, mobileNumber?: string, gender?: string, address?: string): Promise<User> {
    const { data } = await apiClient.put<User>('/users/me', { firstName, lastName, bio, linkedinUrl, username, mobileNumber, gender, address });
    return data;
  }

  static async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<User>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }
}
