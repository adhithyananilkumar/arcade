import { api } from '@/infrastructure/http/api';

export interface ActivitySummary {
  currentStreak: number;
  longestStreak: number;
  activeToday: boolean;
  lastActiveDate: string | null;
  /** Distinct qualifying learning days, backend-owned (D3). */
  totalLearningDays: number;
}

export interface DailyActivity {
  date: string;
  /** Discrete learning ACTIONS completed that day (lesson/quiz/course completions). */
  activityCount: number;
  intensity: number;
  /**
   * Verified engaged learning TIME that day, in whole minutes, computed entirely by the backend
   * from clamped, de-overlapped engagement segments.
   *
   * `null` means no duration was ever recorded for that day — which is NOT the same as `0`
   * ("recorded, but under a minute"). Callers must preserve that distinction rather than
   * coalescing to zero, so the UI can say "not tracked" instead of asserting a confident zero.
   */
  learningMinutes: number | null;
}

/**
 * One measured stretch of engaged learning, as submitted by the lesson player.
 *
 * Note what is NOT here: any timestamp. The client never states WHEN learning happened, only how
 * much it measured and how long ago the measurement ended — the server anchors the interval to its
 * own clock. This is why a wrong client clock cannot mis-attribute a calendar day, and why the
 * frontend is structurally incapable of computing learning duration itself.
 */
export interface LearningSegment {
  /** Stable across retries — this is the server-side idempotency key. */
  segmentId: string;
  lessonId: string;
  courseId: string;
  /** Engaged seconds measured with a monotonic clock. Server-clamped regardless of what is sent. */
  durationSeconds: number;
  /** How long before the request the segment ended; 0 for a live heartbeat. */
  endedSecondsAgo: number;
}

export interface LearningSegmentIngestResult {
  accepted: number;
  duplicate: number;
  rejected: number;
  rejectedSegmentIds: string[];
}

export class ActivityService {
  static getSummary(): Promise<ActivitySummary> {
    return api.get<ActivitySummary>('/api/v1/me/activity/summary');
  }

  static getDailyActivity(from: string, to: string): Promise<DailyActivity[]> {
    return api.get<DailyActivity[]>(`/api/v1/me/activity?from=${from}&to=${to}`);
  }

  /**
   * Submits measured engagement segments. Batched so a page-unload flush sends one request rather
   * than a burst. The response reports which segments were taken, never what they aggregated to —
   * the client must not re-derive learning state from it.
   */
  static submitLearningSegments(
    segments: LearningSegment[]
  ): Promise<LearningSegmentIngestResult> {
    return api.post<LearningSegmentIngestResult>('/api/v1/me/activity/learning-segments', {
      segments,
    });
  }
}
