'use client';

/**
 * Lesson engagement tracker — the instrumentation that finally makes "time spent learning" real.
 *
 * WHAT THIS MEASURES, AND WHAT IT REFUSES TO MEASURE
 * It accumulates time only while ALL of the following hold:
 *   1. the document is visible (not a background tab),
 *   2. the window has focus (not a different app in front),
 *   3. the learner has interacted with the page within the last IDLE_TIMEOUT_MS.
 * A tab left open on a lesson overnight accumulates nothing, which is precisely the failure mode
 * of the TimeLog/WebSocket-presence signal this replaces. This is engagement, not presence.
 *
 * WHAT IT DOES NOT DO
 * It does not compute learning duration. It measures raw elapsed engaged time with a MONOTONIC
 * clock (`performance.now()`, immune to wall-clock changes and NTP jumps) and reports it as a raw
 * signal. The backend anchors the interval to its own clock, clamps it, de-overlaps it against
 * everything else that day, and decides what it is worth. Nothing here is authoritative — the
 * client-side ceiling below is a sanity bound to avoid sending obvious nonsense, not a rule.
 *
 * DELIVERY
 * Segments carry a stable client-generated `segmentId`, so a retried request cannot double-count.
 * A failed submission stays queued and is retried on the next flush with its `endedSecondsAgo`
 * recomputed, so the segment lands on the right day even if it is delivered minutes late.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ActivityService, type LearningSegment } from './activity.service';
import { activityKeys } from './activity.queries';

/** How often the tracker samples engagement state. */
export const TICK_MS = 5_000;

/** Engaged time accumulated before a segment is emitted. */
export const HEARTBEAT_SECONDS = 60;

/** No interaction for this long ⇒ the learner is idle and time stops accruing. */
export const IDLE_TIMEOUT_MS = 60_000;

/** Client-side sanity ceiling per segment. The server clamps independently and authoritatively. */
export const MAX_SEGMENT_SECONDS = 900;

/** Segments shorter than this are noise and are never sent. Mirrors the server's floor. */
export const MIN_SEGMENT_SECONDS = 5;

/** Never send more than this in one request — matches the server's batch bound. */
const MAX_BATCH = 20;

const INTERACTION_EVENTS = [
  'pointerdown',
  'keydown',
  'wheel',
  'scroll',
  'touchstart',
] as const;

type QueuedSegment = {
  segment: Omit<LearningSegment, 'endedSecondsAgo'>;
  /** Wall-clock ms at which the measured window ended, used to recompute `endedSecondsAgo`. */
  endedAtMs: number;
};

function newSegmentId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID (older Safari, some jsdom setups).
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

export interface LessonEngagementTrackerOptions {
  courseId: string | null | undefined;
  lessonId: string | null | undefined;
  /** Gate on an authenticated, entitled learner actually viewing lesson content. */
  enabled: boolean;
}

export function useLessonEngagementTracker({
  courseId,
  lessonId,
  enabled,
}: LessonEngagementTrackerOptions): void {
  const queryClient = useQueryClient();

  const engagedMsRef = useRef(0);
  const lastTickRef = useRef(0);
  const lastInteractionRef = useRef(0);
  const queueRef = useRef<QueuedSegment[]>([]);
  const sendingRef = useRef(false);

  const send = useCallback(async () => {
    if (sendingRef.current || queueRef.current.length === 0) return;
    sendingRef.current = true;

    const batch = queueRef.current.slice(0, MAX_BATCH);
    const now = Date.now();
    const payload: LearningSegment[] = batch.map((q) => ({
      ...q.segment,
      // Recomputed at send time, not at measure time: a segment queued through a failed request
      // still lands on the day it was actually earned.
      endedSecondsAgo: Math.max(0, Math.floor((now - q.endedAtMs) / 1000)),
    }));

    try {
      await ActivityService.submitLearningSegments(payload);
      const sent = new Set(batch.map((q) => q.segment.segmentId));
      queueRef.current = queueRef.current.filter((q) => !sent.has(q.segment.segmentId));
      // Mark activity reads stale so My Learning / the profile heatmap show this session's time
      // the next time they mount. Not a refetch here — nothing on the player renders it.
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
    } catch {
      // Keep the queue intact and retry on the next flush. The stable segmentId means a request
      // that actually succeeded but appeared to fail cannot be counted twice.
    } finally {
      sendingRef.current = false;
    }
  }, [queryClient]);

  const enqueue = useCallback((seconds: number, forCourseId: string, forLessonId: string) => {
    const clamped = Math.min(Math.floor(seconds), MAX_SEGMENT_SECONDS);
    if (clamped < MIN_SEGMENT_SECONDS) return;

    queueRef.current.push({
      segment: {
        segmentId: newSegmentId(),
        lessonId: forLessonId,
        courseId: forCourseId,
        durationSeconds: clamped,
      },
      endedAtMs: Date.now(),
    });
  }, []);

  /**
   * Emit whatever has accumulated so far and reset the accumulator.
   *
   * The lesson is passed in explicitly rather than read from a ref. On a lesson switch React has
   * already re-rendered with the NEW lesson id by the time the previous effect's cleanup runs, so
   * a ref would attribute the outgoing lesson's minutes to the incoming one. Closing over the
   * effect's own values is what keeps the attribution honest.
   */
  const flush = useCallback(
    (forCourseId: string, forLessonId: string) => {
      const seconds = engagedMsRef.current / 1000;
      engagedMsRef.current = 0;
      enqueue(seconds, forCourseId, forLessonId);
      void send();
    },
    [enqueue, send]
  );

  useEffect(() => {
    if (!enabled || !courseId || !lessonId) return;
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    engagedMsRef.current = 0;
    lastTickRef.current = performance.now();
    // Opening a lesson is itself an interaction; without this the first minute would never accrue.
    lastInteractionRef.current = performance.now();

    const markInteraction = () => {
      lastInteractionRef.current = performance.now();
    };
    INTERACTION_EVENTS.forEach((evt) =>
      window.addEventListener(evt, markInteraction, { passive: true })
    );

    const isEngaged = () =>
      document.visibilityState === 'visible' &&
      document.hasFocus() &&
      performance.now() - lastInteractionRef.current < IDLE_TIMEOUT_MS;

    const interval = window.setInterval(() => {
      const now = performance.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      if (isEngaged()) {
        // Cap the credited delta at one tick's worth: if the machine slept or the event loop
        // stalled for an hour, that hour was not learning.
        engagedMsRef.current += Math.min(delta, TICK_MS);
      }

      if (engagedMsRef.current >= HEARTBEAT_SECONDS * 1000) {
        flush(courseId, lessonId);
      }
    }, TICK_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Best-effort flush while the page can still make a request. If it does not complete, the
        // segment stays queued and is retried; it is never counted twice.
        flush(courseId, lessonId);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      INTERACTION_EVENTS.forEach((evt) => window.removeEventListener(evt, markInteraction));
      // Lesson change or navigation away: bank the partial segment against the lesson that earned
      // it — courseId/lessonId here are this effect run's values, not the incoming lesson's.
      flush(courseId, lessonId);
    };
    // Re-keyed per lesson so a lesson switch closes the previous lesson's segment.
  }, [enabled, courseId, lessonId, flush]);
}
