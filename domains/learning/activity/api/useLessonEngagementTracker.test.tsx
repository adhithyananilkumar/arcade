import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useLessonEngagementTracker,
  HEARTBEAT_SECONDS,
  TICK_MS,
  IDLE_TIMEOUT_MS,
} from './useLessonEngagementTracker';
import { ActivityService } from './activity.service';

vi.mock('./activity.service', () => ({
  ActivityService: { submitLearningSegments: vi.fn() },
}));

const COURSE = 'course-1';
const LESSON = 'lesson-1';

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

/**
 * Drives the tracker's polling loop by `seconds` of engaged wall time, then drains microtasks so
 * the submission promise settles. `waitFor` is deliberately not used anywhere in this file: it
 * polls on real timers and would deadlock against the fake clock these tests require.
 */
async function advance(seconds: number) {
  await act(async () => {
    vi.advanceTimersByTime(seconds * 1000);
  });
  await act(async () => {
    await Promise.resolve();
  });
}

/**
 * Advances `seconds` of engaged time WITH periodic interaction, so the idle gate never trips.
 * Without any interaction the tracker deliberately stops accruing at IDLE_TIMEOUT_MS — which is
 * exactly what the "stops accruing once the learner has been idle" test asserts, and why silent
 * wall-clock time alone can never produce a segment.
 */
async function engageFor(seconds: number) {
  let remaining = seconds;
  while (remaining > 0) {
    await act(async () => {
      window.dispatchEvent(new Event('pointerdown'));
    });
    const step = Math.min(10, remaining);
    await advance(step);
    remaining -= step;
  }
}

function setVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('useLessonEngagementTracker', () => {
  let hasFocus: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // performance.now() must advance with the fake timers for the monotonic accounting to move.
    vi.spyOn(performance, 'now').mockImplementation(() => Date.now());
    hasFocus = vi.spyOn(document, 'hasFocus').mockReturnValue(true);
    setVisibility('visible');
    vi.mocked(ActivityService.submitLearningSegments).mockResolvedValue({
      accepted: 1,
      duplicate: 0,
      rejected: 0,
      rejectedSegmentIds: [],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('emits a segment after a full heartbeat of engaged time', async () => {
    renderHook(() => useLessonEngagementTracker({ courseId: COURSE, lessonId: LESSON, enabled: true }), {
      wrapper,
    });

    await engageFor(HEARTBEAT_SECONDS + TICK_MS / 1000);

    expect(ActivityService.submitLearningSegments).toHaveBeenCalled();
    const [segments] = vi.mocked(ActivityService.submitLearningSegments).mock.calls[0];
    expect(segments).toHaveLength(1);
    expect(segments[0]).toMatchObject({ courseId: COURSE, lessonId: LESSON });
    expect(segments[0].durationSeconds).toBeGreaterThanOrEqual(HEARTBEAT_SECONDS);
  });

  it('sends no timestamp at all — the client cannot state when learning happened', async () => {
    renderHook(() => useLessonEngagementTracker({ courseId: COURSE, lessonId: LESSON, enabled: true }), {
      wrapper,
    });
    await engageFor(HEARTBEAT_SECONDS + TICK_MS / 1000);
    expect(ActivityService.submitLearningSegments).toHaveBeenCalled();

    const [segments] = vi.mocked(ActivityService.submitLearningSegments).mock.calls[0];
    expect(Object.keys(segments[0]).sort()).toEqual(
      ['courseId', 'durationSeconds', 'endedSecondsAgo', 'lessonId', 'segmentId'].sort()
    );
    expect(segments[0].endedSecondsAgo).toBeGreaterThanOrEqual(0);
  });

  it('accrues nothing while the tab is in the background', async () => {
    renderHook(() => useLessonEngagementTracker({ courseId: COURSE, lessonId: LESSON, enabled: true }), {
      wrapper,
    });

    setVisibility('hidden');
    await advance(HEARTBEAT_SECONDS * 5);

    // The visibilitychange flush may fire, but there is nothing to send: no engaged time accrued.
    const calls = vi.mocked(ActivityService.submitLearningSegments).mock.calls;
    expect(calls).toHaveLength(0);
  });

  it('accrues nothing while the window is not focused', async () => {
    renderHook(() => useLessonEngagementTracker({ courseId: COURSE, lessonId: LESSON, enabled: true }), {
      wrapper,
    });

    hasFocus.mockReturnValue(false);
    await advance(HEARTBEAT_SECONDS * 5);

    expect(ActivityService.submitLearningSegments).not.toHaveBeenCalled();
  });

  it('stops accruing once the learner has been idle past the timeout', async () => {
    renderHook(() => useLessonEngagementTracker({ courseId: COURSE, lessonId: LESSON, enabled: true }), {
      wrapper,
    });

    // Idle for well past the timeout with no interaction: far more than a heartbeat of wall time
    // elapses, but engaged time stops at the idle threshold, so at most one segment is emitted.
    await advance(IDLE_TIMEOUT_MS / 1000 + HEARTBEAT_SECONDS * 5);

    const calls = vi.mocked(ActivityService.submitLearningSegments).mock.calls;
    expect(calls.length).toBeLessThanOrEqual(1);
  });

  it('keeps accruing while the learner keeps interacting', async () => {
    renderHook(() => useLessonEngagementTracker({ courseId: COURSE, lessonId: LESSON, enabled: true }), {
      wrapper,
    });

    // Two heartbeats' worth of wall time, with interaction every 10s so the idle gate never trips.
    for (let i = 0; i < (HEARTBEAT_SECONDS * 2) / 10; i += 1) {
      await act(async () => {
        window.dispatchEvent(new Event('pointerdown'));
      });
      await advance(10);
    }

    expect(vi.mocked(ActivityService.submitLearningSegments).mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('does nothing at all when disabled', async () => {
    renderHook(() => useLessonEngagementTracker({ courseId: COURSE, lessonId: LESSON, enabled: false }), {
      wrapper,
    });
    await advance(HEARTBEAT_SECONDS * 3);
    expect(ActivityService.submitLearningSegments).not.toHaveBeenCalled();
  });

  it('does nothing when there is no lesson on screen', async () => {
    renderHook(() => useLessonEngagementTracker({ courseId: COURSE, lessonId: null, enabled: true }), {
      wrapper,
    });
    await advance(HEARTBEAT_SECONDS * 3);
    expect(ActivityService.submitLearningSegments).not.toHaveBeenCalled();
  });

  it('banks the partial segment against the lesson that earned it when the lesson changes', async () => {
    const { rerender } = renderHook(
      ({ lessonId }: { lessonId: string }) =>
        useLessonEngagementTracker({ courseId: COURSE, lessonId, enabled: true }),
      { wrapper, initialProps: { lessonId: LESSON } }
    );

    await advance(30); // half a heartbeat — not enough to emit on its own

    await act(async () => {
      rerender({ lessonId: 'lesson-2' });
    });

    expect(ActivityService.submitLearningSegments).toHaveBeenCalled();
    const [segments] = vi.mocked(ActivityService.submitLearningSegments).mock.calls[0];
    // Attributed to the lesson being left, not the one being opened.
    expect(segments[0].lessonId).toBe(LESSON);
  });

  it('gives every segment a distinct id, so the server can dedupe retries without merging segments', async () => {
    renderHook(() => useLessonEngagementTracker({ courseId: COURSE, lessonId: LESSON, enabled: true }), {
      wrapper,
    });

    for (let i = 0; i < (HEARTBEAT_SECONDS * 2) / 10; i += 1) {
      await act(async () => {
        window.dispatchEvent(new Event('pointerdown'));
      });
      await advance(10);
    }

    expect(vi.mocked(ActivityService.submitLearningSegments).mock.calls.length).toBeGreaterThanOrEqual(2);
    const ids = vi
      .mocked(ActivityService.submitLearningSegments)
      .mock.calls.flatMap(([segments]) => segments.map((s) => s.segmentId));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('retries a failed submission with the SAME segment id rather than measuring it again', async () => {
    vi.mocked(ActivityService.submitLearningSegments)
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValue({ accepted: 1, duplicate: 0, rejected: 0, rejectedSegmentIds: [] });

    const { unmount } = renderHook(
      () => useLessonEngagementTracker({ courseId: COURSE, lessonId: LESSON, enabled: true }),
      { wrapper }
    );

    await engageFor(HEARTBEAT_SECONDS + TICK_MS / 1000);
    expect(ActivityService.submitLearningSegments).toHaveBeenCalledTimes(1);
    const firstId = vi.mocked(ActivityService.submitLearningSegments).mock.calls[0][0][0].segmentId;

    // Unmount triggers a flush, which retries the still-queued segment.
    await act(async () => {
      unmount();
    });

    expect(vi.mocked(ActivityService.submitLearningSegments).mock.calls.length).toBeGreaterThanOrEqual(2);
    const retried = vi
      .mocked(ActivityService.submitLearningSegments)
      .mock.calls[1][0].map((s) => s.segmentId);
    expect(retried).toContain(firstId);
  });
});
