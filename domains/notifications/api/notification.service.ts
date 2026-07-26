import { api } from '@/infrastructure/http/api';

export interface NotificationDto {
  id: string;
  type: string;
  title: string;
  message: string;
  actorId?: string;
  actorName?: string;
  linkUrl?: string;
  metadata?: string;
  read: boolean;
  createdAt: string;
}

interface Page<T> {
  content: T[];
}

export class NotificationService {
  static async list(page = 0, size = 30): Promise<NotificationDto[]> {
    const data = await api.get<Page<NotificationDto>>(
      `/api/v1/notifications?page=${page}&size=${size}`
    );
    return data.content;
  }

  static async getUnreadCount(): Promise<number> {
    const data = await api.get<{ count: number }>('/api/v1/notifications/unread-count');
    return data.count;
  }

  static async markAllRead(): Promise<void> {
    await api.post('/api/v1/notifications/mark-all-read');
  }

  static async markRead(id: string): Promise<void> {
    await api.post(`/api/v1/notifications/${id}/read`);
  }
}
