import { useQuery } from '@tanstack/react-query';
import { ActivityService } from './activity.service';

export const activityKeys = {
  summary: () => ['activity', 'summary'] as const,
  daily: (from: string, to: string) => ['activity', 'daily', from, to] as const,
};

export function useActivitySummaryQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: activityKeys.summary(),
    queryFn: () => ActivityService.getSummary(),
    enabled,
  });
}

/**
 * Bounded range only — callers must pass the exact window the UI needs (e.g. the last 365 days
 * for a rolling heatmap), never an unbounded range. The backend itself also enforces a max range,
 * this is just the frontend not inviting a caller to ask for more than it should.
 */
export function useDailyActivityQuery(from: string, to: string, enabled: boolean = true) {
  return useQuery({
    queryKey: activityKeys.daily(from, to),
    queryFn: () => ActivityService.getDailyActivity(from, to),
    enabled,
  });
}
