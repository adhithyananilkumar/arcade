/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps (learner)
 *
 * Pure presentation mapping for the learner enrollment read model.
 *
 * Every function here is a *rendering* decision over data the backend already owns
 * (`enrollmentStatus`, `accessState`, `progressState`, `progressPercent`). Nothing here derives
 * business state, invents a percentage, or infers a category — the previous My Learning page did
 * all three, and that is exactly what this module exists to make impossible.
 * ------------------------------------------------------------------
 */

import type {
  LearnerEnrollmentSummary,
  LearnerEventRegistration,
} from '@/domains/enrollment';

export type StatusTone = 'emerald' | 'indigo' | 'amber' | 'rose' | 'slate';

export interface StatusBadge {
  label: string;
  tone: StatusTone;
  /** Short explanation shown as a title/tooltip; null when the label speaks for itself. */
  hint: string | null;
}

export const STATUS_TONE_CLASSES: Record<StatusTone, string> = {
  emerald:
    'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60',
  indigo:
    'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60',
  amber:
    'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60',
  rose: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60',
  slate:
    'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/60',
};

/**
 * The single badge that describes what this enrollment *is* right now.
 *
 * Access state wins over progress state: a revoked or unpaid enrollment must never render as
 * "In progress" just because lesson rows exist from before it was revoked.
 */
export function statusBadgeFor(item: LearnerEnrollmentSummary): StatusBadge {
  switch (item.accessState) {
    case 'PENDING_REQUIREMENTS':
      return {
        label: item.requiresPayment ? 'Payment pending' : 'Pending approval',
        tone: 'amber',
        hint: item.requiresPayment
          ? 'Complete payment to unlock this enrollment.'
          : 'Your enrollment request is awaiting approval.',
      };
    case 'REVOKED':
      return {
        label: 'Access revoked',
        tone: 'rose',
        hint: 'Your access to this resource was revoked.',
      };
    case 'DENIED':
      return {
        label: 'Enrollment denied',
        tone: 'rose',
        hint: item.denialReasonCode
          ? `Denied: ${humanizeCode(item.denialReasonCode)}`
          : 'This enrollment request was denied.',
      };
    case 'RESOURCE_UNAVAILABLE':
      return {
        label: 'Unavailable',
        tone: 'slate',
        hint: 'This resource is no longer published or has been removed.',
      };
    case 'ACCESSIBLE':
    default:
      break;
  }

  switch (item.progressState) {
    case 'COMPLETED':
      return { label: 'Completed', tone: 'emerald', hint: null };
    case 'IN_PROGRESS':
      return { label: 'In progress', tone: 'indigo', hint: null };
    case 'NOT_STARTED':
      return { label: 'Not started', tone: 'slate', hint: null };
    case 'NOT_APPLICABLE':
    default:
      return { label: 'Enrolled', tone: 'emerald', hint: null };
  }
}

/** Only an ACCESSIBLE enrollment may be opened. Pending/revoked/denied must not look clickable. */
export function isOpenable(item: LearnerEnrollmentSummary): boolean {
  return item.accessState === 'ACCESSIBLE';
}

/**
 * How the progress bar should render.
 *
 * `progressPercent === null` is NOT zero — it means the backend has no percentage to report
 * (event, unpublished course, course with no lessons). Rendering it as a 0% bar would state
 * "you have completed none of it", which is a different and unverified claim. So null renders no
 * bar at all.
 */
export function progressDisplayFor(
  item: LearnerEnrollmentSummary
): { kind: 'bar'; percent: number } | { kind: 'none'; label: string } {
  if (item.progressPercent === null || item.progressPercent === undefined) {
    if (item.progressState === 'NOT_APPLICABLE') {
      return { kind: 'none', label: 'Progress not tracked' };
    }
    return { kind: 'none', label: 'No progress recorded' };
  }
  const clamped = Math.max(0, Math.min(100, item.progressPercent));
  return { kind: 'bar', percent: clamped };
}

/** Where the "open" action goes. Null when the item must not be opened. */
export function resourceHrefFor(item: LearnerEnrollmentSummary): string | null {
  if (!isOpenable(item)) return null;
  if (item.resourceType === 'COURSE') return `/learn/${item.resourceId}`;
  return `/events/${item.slug || item.resourceId}`;
}

/** Label for the primary action, driven by progress rather than guessed from a percentage. */
export function primaryActionLabelFor(item: LearnerEnrollmentSummary): string {
  if (item.resourceType === 'EVENT') return 'View event';
  if (item.progressState === 'COMPLETED') return 'Completed';
  if (item.progressState === 'IN_PROGRESS') return 'Continue';
  return 'Start';
}

/**
 * Deterministic neutral placeholder tint for a resource with no image.
 *
 * This replaces the previous hardcoded Unsplash photo, which presented a stock image of an
 * unrelated classroom as if it were the course's own cover. A tinted initial is visibly a
 * placeholder and claims nothing.
 */
export function placeholderTintFor(id: string): string {
  const tints = [
    'from-indigo-100 to-sky-100 dark:from-indigo-950/60 dark:to-sky-950/60',
    'from-emerald-100 to-teal-100 dark:from-emerald-950/60 dark:to-teal-950/60',
    'from-amber-100 to-orange-100 dark:from-amber-950/60 dark:to-orange-950/60',
    'from-violet-100 to-fuchsia-100 dark:from-violet-950/60 dark:to-fuchsia-950/60',
    'from-sky-100 to-blue-100 dark:from-sky-950/60 dark:to-blue-950/60',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return tints[hash % tints.length];
}

export function initialFor(title: string | null): string {
  const trimmed = (title ?? '').trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}

/** `PREREQUISITE_NOT_MET` -> `Prerequisite not met`. No invented copy, just formatting. */
export function humanizeCode(code: string): string {
  const words = code.replace(/_/g, ' ').toLowerCase().trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Events (`GET /api/v1/me/events`)
// ─────────────────────────────────────────────────────────────────────────────

export function eventStatusBadgeFor(reg: LearnerEventRegistration): StatusBadge {
  if (reg.enrollmentStatus === 'REVOKED') {
    return { label: 'Registration revoked', tone: 'rose', hint: null };
  }
  if (reg.enrollmentStatus === 'DENIED') {
    return { label: 'Registration denied', tone: 'rose', hint: null };
  }
  if (reg.enrollmentStatus === 'PENDING' || reg.enrollmentStatus === 'REQUESTED') {
    return { label: 'Registration pending', tone: 'amber', hint: null };
  }
  if (reg.attendanceStatus) {
    return { label: humanizeCode(reg.attendanceStatus), tone: 'indigo', hint: 'Attendance' };
  }
  return reg.upcoming
    ? { label: 'Registered', tone: 'emerald', hint: null }
    : { label: 'Attended · past', tone: 'slate', hint: null };
}

/**
 * Human schedule line built only from what `/me/events` actually sends. An event with no
 * scheduled sessions says so rather than borrowing the registration date as a fake start time.
 */
export function eventScheduleLabel(reg: LearnerEventRegistration): string {
  if (!reg.firstSessionStartsAt) return 'Schedule to be announced';
  const start = new Date(reg.firstSessionStartsAt);
  if (Number.isNaN(start.getTime())) return 'Schedule to be announced';
  return start.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function eventHrefFor(reg: LearnerEventRegistration): string {
  return `/events/${reg.slug || reg.eventId}`;
}

export function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
