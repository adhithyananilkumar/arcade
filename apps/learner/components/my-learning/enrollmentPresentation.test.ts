import { describe, it, expect } from 'vitest';
import type {
  LearnerEnrollmentSummary,
  LearnerEventRegistration,
} from '@/domains/enrollment';
import {
  eventScheduleLabel,
  eventStatusBadgeFor,
  humanizeCode,
  initialFor,
  isOpenable,
  primaryActionLabelFor,
  progressDisplayFor,
  resourceHrefFor,
  statusBadgeFor,
} from './enrollmentPresentation';

function course(over: Partial<LearnerEnrollmentSummary> = {}): LearnerEnrollmentSummary {
  return {
    enrollmentId: 'enr-1',
    resourceType: 'COURSE',
    resourceId: 'course-1',
    title: 'Intro to Systems',
    slug: null,
    imageUrl: null,
    resourceStatus: 'PUBLISHED',
    enrollmentStatus: 'GRANTED',
    accessState: 'ACCESSIBLE',
    requiresPayment: false,
    denialReasonCode: null,
    progressState: 'IN_PROGRESS',
    progressPercent: 25,
    enrolledAt: '2026-08-01T10:00:00Z',
    grantedAt: '2026-08-01T10:00:00Z',
    startedAt: '2026-08-02T10:00:00Z',
    completedAt: null,
    ...over,
  };
}

function registration(
  over: Partial<LearnerEventRegistration> = {}
): LearnerEventRegistration {
  return {
    enrollmentId: 'enr-e1',
    eventId: 'event-1',
    title: 'React Deep Dive',
    slug: 'react-deep-dive',
    imageUrl: null,
    eventType: 'WORKSHOP',
    eventStatus: 'PUBLISHED',
    deliveryMode: 'ONLINE',
    enrollmentStatus: 'GRANTED',
    registrationStatus: 'APPROVED',
    attendanceStatus: null,
    registeredAt: '2026-08-01T10:00:00Z',
    firstSessionStartsAt: '2026-09-01T09:00:00Z',
    lastSessionEndsAt: '2026-09-01T12:00:00Z',
    upcoming: true,
    ...over,
  };
}

describe('progressDisplayFor — null is not zero', () => {
  it('renders NO bar when progressPercent is null, because null means "no percentage exists"', () => {
    const result = progressDisplayFor(course({ progressPercent: null }));
    expect(result.kind).toBe('none');
  });

  it('renders a REAL 0% bar when progressPercent is 0, because 0 is a genuine measurement', () => {
    const result = progressDisplayFor(
      course({ progressPercent: 0, progressState: 'NOT_STARTED' })
    );
    expect(result).toEqual({ kind: 'bar', percent: 0 });
  });

  it('never coerces null into a fabricated number (the old `progress || 40` bug)', () => {
    const result = progressDisplayFor(course({ progressPercent: null }));
    expect(JSON.stringify(result)).not.toContain('40');
    expect(result).not.toHaveProperty('percent');
  });

  it('labels an event\'s absent percentage as untracked rather than unrecorded', () => {
    const result = progressDisplayFor(
      course({ resourceType: 'EVENT', progressState: 'NOT_APPLICABLE', progressPercent: null })
    );
    expect(result).toEqual({ kind: 'none', label: 'Progress not tracked' });
  });

  it('clamps an out-of-range percentage rather than rendering an overflowing bar', () => {
    expect(progressDisplayFor(course({ progressPercent: 140 }))).toEqual({
      kind: 'bar',
      percent: 100,
    });
  });
});

describe('statusBadgeFor — access state wins over progress state', () => {
  it('reports Completed for a finished, accessible course', () => {
    const badge = statusBadgeFor(course({ progressState: 'COMPLETED', progressPercent: 100 }));
    expect(badge.label).toBe('Completed');
    expect(badge.tone).toBe('emerald');
  });

  it('reports Not started, not 0% progress, for an untouched course', () => {
    expect(statusBadgeFor(course({ progressState: 'NOT_STARTED' })).label).toBe('Not started');
  });

  it('reports payment pending — never "In progress" — for an unpaid enrollment', () => {
    const badge = statusBadgeFor(
      course({
        accessState: 'PENDING_REQUIREMENTS',
        enrollmentStatus: 'PENDING',
        requiresPayment: true,
        progressState: 'IN_PROGRESS',
      })
    );
    expect(badge.label).toBe('Payment pending');
    expect(badge.tone).toBe('amber');
  });

  it('distinguishes pending approval from pending payment', () => {
    expect(
      statusBadgeFor(
        course({ accessState: 'PENDING_REQUIREMENTS', requiresPayment: false }),
      ).label,
    ).toBe('Pending approval');
  });

  it('reports revoked access even when prior lesson progress exists', () => {
    const badge = statusBadgeFor(
      course({
        accessState: 'REVOKED',
        enrollmentStatus: 'REVOKED',
        progressState: 'IN_PROGRESS',
        progressPercent: 60,
      })
    );
    expect(badge.label).toBe('Access revoked');
  });

  it('surfaces the backend denial reason code rather than inventing an explanation', () => {
    const badge = statusBadgeFor(
      course({
        accessState: 'DENIED',
        enrollmentStatus: 'DENIED',
        denialReasonCode: 'PREREQUISITE_NOT_MET',
      })
    );
    expect(badge.hint).toBe('Denied: Prerequisite not met');
  });

  it('reports an unresolvable resource as Unavailable', () => {
    expect(statusBadgeFor(course({ accessState: 'RESOURCE_UNAVAILABLE' })).label).toBe(
      'Unavailable'
    );
  });
});

describe('isOpenable / resourceHrefFor — inaccessible enrollments must not be openable', () => {
  it.each(['PENDING_REQUIREMENTS', 'REVOKED', 'DENIED', 'RESOURCE_UNAVAILABLE'] as const)(
    'refuses to produce a link for accessState=%s',
    (accessState) => {
      const item = course({ accessState });
      expect(isOpenable(item)).toBe(false);
      expect(resourceHrefFor(item)).toBeNull();
    }
  );

  it('links an accessible course by id', () => {
    expect(resourceHrefFor(course())).toBe('/learn/course-1');
  });

  it('links an accessible event by slug, falling back to its id', () => {
    expect(
      resourceHrefFor(course({ resourceType: 'EVENT', slug: 'my-event', resourceId: 'e1' }))
    ).toBe('/events/my-event');
    expect(
      resourceHrefFor(course({ resourceType: 'EVENT', slug: null, resourceId: 'e1' }))
    ).toBe('/events/e1');
  });
});

describe('primaryActionLabelFor', () => {
  it('says Start for a not-started course, Continue for in-progress, Review for completed', () => {
    expect(primaryActionLabelFor(course({ progressState: 'NOT_STARTED' }))).toBe('Start');
    expect(primaryActionLabelFor(course({ progressState: 'IN_PROGRESS' }))).toBe('Continue');
    expect(primaryActionLabelFor(course({ progressState: 'COMPLETED' }))).toBe('Review');
  });
});

describe('event presentation', () => {
  it('shows a registered upcoming event as Registered', () => {
    expect(eventStatusBadgeFor(registration()).label).toBe('Registered');
  });

  it('prefers real attendance status over an assumed one when the backend has it', () => {
    expect(eventStatusBadgeFor(registration({ attendanceStatus: 'ATTENDED' })).label).toBe(
      'Attended'
    );
  });

  it('reports a pending event registration as pending, not registered', () => {
    expect(eventStatusBadgeFor(registration({ enrollmentStatus: 'PENDING' })).label).toBe(
      'Registration pending'
    );
  });

  it('says the schedule is unannounced rather than substituting the registration date', () => {
    expect(eventScheduleLabel(registration({ firstSessionStartsAt: null }))).toBe(
      'Schedule to be announced'
    );
  });
});

describe('small helpers', () => {
  it('humanizes a backend code without inventing wording', () => {
    expect(humanizeCode('CAPACITY_EXHAUSTED')).toBe('Capacity exhausted');
  });

  it('falls back to ? rather than a blank placeholder for a missing title', () => {
    expect(initialFor(null)).toBe('?');
    expect(initialFor('  ')).toBe('?');
    expect(initialFor('systems')).toBe('S');
  });
});
