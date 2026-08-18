import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActivityService } from './activity.service';
import { api } from '@/infrastructure/http/api';

vi.mock('@/infrastructure/http/api', () => ({
  api: { get: vi.fn() },
}));

describe('ActivityService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getSummary() hits the self-service summary endpoint (no username/id in the path)', async () => {
    const summary = { currentStreak: 3, longestStreak: 9, activeToday: true, lastActiveDate: '2026-08-16' };
    (api.get as any).mockResolvedValue(summary);

    const result = await ActivityService.getSummary();

    expect(api.get).toHaveBeenCalledWith('/api/v1/me/activity/summary');
    expect(result).toEqual(summary);
  });

  it('getDailyActivity() passes the bounded from/to range as query params', async () => {
    (api.get as any).mockResolvedValue([]);
    await ActivityService.getDailyActivity('2026-01-01', '2026-12-31');
    expect(api.get).toHaveBeenCalledWith('/api/v1/me/activity?from=2026-01-01&to=2026-12-31');
  });
});
