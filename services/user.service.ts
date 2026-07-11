import { apiClient } from '@/lib/apiClient';
import { User } from '@/store/auth.store';

export class UserService {
  static async getMe(): Promise<User> {
    const { data } = await apiClient.get<User>('/users/me');
    return data;
  }

  static async updateProfile(firstName: string, lastName: string): Promise<User> {
    const { data } = await apiClient.put<User>('/users/me', { firstName, lastName });
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
