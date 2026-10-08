'use client';

import { useCallback, useMemo } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { contentOverviewRoute } from '@/shared/routes/content.routes';
import { useMyEnrollmentsQuery } from '../api/myEnrollments.queries';
import type { LearnerEnrollmentSummary, ResourceType } from '../types/enrollment.types';

/** Where the learner stands with one resource, as far as a listing card needs to know. */
export type CardEnrollmentState = 'ENROLLED' | 'WAITLISTED' | 'AWAITING_PAYMENT' | 'PENDING' | null;

/** The button a listing card shows for a resource, given the learner's standing. */
export interface CardCta {
  label: string;
  /** Where the button goes; null to keep the card's own link. */
  href: string | null;
  state: CardEnrollmentState;
  /** Button styling: `success` once it's yours, `waiting` while held or queued. */
  tone: 'default' | 'success' | 'waiting';
}

const KIND: Record<string, string> = { COURSE: 'course', EVENT: 'event', EXAM: 'exam' };

function stateOf(row: LearnerEnrollmentSummary): CardEnrollmentState {
  if (row.accessState === 'ACCESSIBLE') return 'ENROLLED';
  if (row.accessState !== 'PENDING_REQUIREMENTS') return null;
  if (row.waitlisted) return 'WAITLISTED';
  if (row.requiresPayment) return 'AWAITING_PAYMENT';
  return 'PENDING';
}

/**
 * The signed-in learner's enrollments, indexed for listing cards (Explore, search, profiles, home):
 * an enrolled resource must offer "Go to course", never "Enroll", and a waitlisted one must say so
 * on its button.
 *
 * One request (the learner's active library, up to 100 rows) shared by every card on the page via
 * React Query; it refreshes with every enrollment change because it lives under
 * `myEnrollmentKeys.all`.
 */
export function useMyEnrollmentStates() {
  const signedIn = useAuthStore((s) => s.status === 'authenticated');
  const { data } = useMyEnrollmentsQuery({ size: 100 }, signedIn);

  const index = useMemo(() => {
    const map = new Map<string, LearnerEnrollmentSummary>();
    for (const row of data?.content ?? []) map.set(`${row.resourceType}:${row.resourceId}`, row);
    return map;
  }, [data]);

  /**
   * The card's call to action. `fallbackLabel` is what a card says to someone with no enrollment
   * ("Enroll Now", "View Details"…).
   */
  const ctaFor = useCallback(
    (resourceType: ResourceType, resourceId: string | undefined, fallbackLabel: string): CardCta => {
      const row = resourceId ? index.get(`${resourceType}:${resourceId}`) : undefined;
      const state = row ? stateOf(row) : null;
      const kind = KIND[resourceType] ?? 'content';
      switch (state) {
        case 'ENROLLED':
          return {
            label: `Go to ${kind}`,
            href: contentOverviewRoute(resourceType, resourceType === 'EVENT' ? row!.slug || row!.resourceId : row!.resourceId),
            state,
            tone: 'success',
          };
        case 'WAITLISTED':
          return { label: 'On waitlist', href: null, state, tone: 'waiting' };
        case 'AWAITING_PAYMENT':
          return { label: 'Complete payment', href: null, state, tone: 'waiting' };
        case 'PENDING':
          return { label: 'Request pending', href: null, state, tone: 'waiting' };
        default:
          return { label: fallbackLabel, href: null, state: null, tone: 'default' };
      }
    },
    [index],
  );

  return { ctaFor };
}
