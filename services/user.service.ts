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

  static async assignRolesToUser(userId: string, roleIds: string[]): Promise<User> {
    const { data } = await apiClient.put<User>(`/users/${userId}/roles`, roleIds);
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

  static async acceptContentCreatorInvite(): Promise<void> {
    await apiClient.post('/content-creators/accept');
  }

  static async declineContentCreatorInvite(): Promise<void> {
    await apiClient.post('/content-creators/decline');
  }
}
