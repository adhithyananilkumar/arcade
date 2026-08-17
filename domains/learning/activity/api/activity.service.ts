import { api } from '@/infrastructure/http/api';

export interface ActivitySummary {
  currentStreak: number;
  longestStreak: number;
  activeToday: boolean;
  lastActiveDate: string | null;
}

export interface DailyActivity {
  date: string;
  activityCount: number;
  intensity: number;
}

export class ActivityService {
  static getSummary(): Promise<ActivitySummary> {
    return api.get<ActivitySummary>('/api/v1/me/activity/summary');
  }

  static getDailyActivity(from: string, to: string): Promise<DailyActivity[]> {
    return api.get<DailyActivity[]>(`/api/v1/me/activity?from=${from}&to=${to}`);
  }
}
