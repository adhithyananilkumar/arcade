import type {
  BugActivity,
  BugImpact,
  BugIntakeMode,
  BugPriority,
  BugResolution,
  BugSeverity,
  BugStatus,
} from '../types/bug-report.types';

/** Status as staff see it in the tracker. */
export const STATUS_LABEL: Record<BugStatus, string> = {
  NEW: 'New',
  TRIAGED: 'Triaged',
  IN_PROGRESS: 'In progress',
  NEEDS_INFO: 'Needs info',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

/** The same status in the reporter's words — what it means for them. */
export const REPORTER_STATUS_LABEL: Record<BugStatus, string> = {
  NEW: 'Received',
  TRIAGED: 'Confirmed',
  IN_PROGRESS: 'Being fixed',
  NEEDS_INFO: 'Needs your reply',
  RESOLVED: 'Please check',
  CLOSED: 'Closed',
};

export const STATUS_TONE: Record<BugStatus, string> = {
  NEW: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/25',
  TRIAGED: 'bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/25',
  IN_PROGRESS: 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/25',
  NEEDS_INFO: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200 dark:bg-fuchsia-500/10 dark:text-fuchsia-300 dark:ring-fuchsia-500/25',
  RESOLVED: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25',
  CLOSED: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export const STATUS_DOT: Record<BugStatus, string> = {
  NEW: 'bg-sky-500',
  TRIAGED: 'bg-indigo-500',
  IN_PROGRESS: 'bg-amber-500',
  NEEDS_INFO: 'bg-fuchsia-500',
  RESOLVED: 'bg-emerald-500',
  CLOSED: 'bg-slate-400',
};

export const STATUS_ORDER: BugStatus[] = ['NEW', 'TRIAGED', 'IN_PROGRESS', 'NEEDS_INFO', 'RESOLVED', 'CLOSED'];

export const RESOLUTION_LABEL: Record<BugResolution, string> = {
  FIXED: 'Fixed',
  DUPLICATE: 'Duplicate',
  WONT_FIX: "Won't fix",
  CANNOT_REPRODUCE: "Can't reproduce",
  NOT_A_BUG: 'Not a bug',
};

export const IMPACT_LABEL: Record<BugImpact, string> = {
  BLOCKER: "I can't continue",
  MAJOR: 'Hard to work around',
  MINOR: 'Minor annoyance',
};

export const IMPACT_SHORT: Record<BugImpact, string> = {
  BLOCKER: 'Blocker',
  MAJOR: 'Major',
  MINOR: 'Minor',
};

export const IMPACT_TONE: Record<BugImpact, string> = {
  BLOCKER: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/25',
  MAJOR: 'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/25',
  MINOR: 'bg-slate-50 text-slate-600 ring-slate-200',
};

export const SEVERITY_LABEL: Record<BugSeverity, string> = {
  S1: 'S1 · Critical',
  S2: 'S2 · Major',
  S3: 'S3 · Moderate',
  S4: 'S4 · Trivial',
};

export const PRIORITY_LABEL: Record<BugPriority, string> = {
  P0: 'P0 · Now',
  P1: 'P1 · Next',
  P2: 'P2 · Soon',
  P3: 'P3 · Backlog',
};

export const PRIORITY_TONE: Record<BugPriority, string> = {
  P0: 'bg-rose-600 text-white ring-rose-600',
  P1: 'bg-orange-100 text-orange-800 ring-orange-200 dark:bg-orange-500/15 dark:text-orange-200 dark:ring-orange-500/25',
  P2: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/25',
  P3: 'bg-slate-50 text-slate-500 ring-slate-200',
};

export const INTAKE_MODE_LABEL: Record<BugIntakeMode, string> = {
  OFF: 'Off',
  TESTERS: 'Testers only',
  EVERYONE: 'Everyone signed in',
};

export const INTAKE_MODE_HINT: Record<BugIntakeMode, string> = {
  OFF: 'The bug button is hidden for everyone except the triage team.',
  TESTERS: 'Only accounts holding the Tester policy (platform.bugs.report) see the bug button.',
  EVERYONE: 'Every signed-in account sees the bug button.',
};

/** "RESOLVED:FIXED" → "Resolved · Fixed". */
function statusValue(value: string | null, reporter: boolean): string {
  if (!value) return '—';
  const [status, resolution] = value.split(':') as [BugStatus, BugResolution | undefined];
  const base = (reporter ? REPORTER_STATUS_LABEL : STATUS_LABEL)[status] ?? status;
  return resolution ? `${base} · ${RESOLUTION_LABEL[resolution] ?? resolution}` : base;
}

/** "set severity to S1" / "changed severity S2 → S1" / "cleared severity (was S2)". */
function changeSentence(field: string, entry: BugActivity): string {
  if (!entry.fromValue) return entry.toValue ? `set ${field} to ${entry.toValue}` : `cleared ${field}`;
  if (!entry.toValue) return `cleared ${field} (was ${entry.fromValue})`;
  return `changed ${field} ${entry.fromValue} → ${entry.toValue}`;
}

/**
 * One timeline entry as a sentence. `names` resolves user ids (assignee changes) and category ids;
 * unknown ids fall back to "someone".
 */
export function describeActivity(
  entry: BugActivity,
  opts: { reporter: boolean; names?: Record<string, string> },
): string {
  const n = (id: string | null) => (id ? opts.names?.[id] ?? 'someone' : 'nobody');
  switch (entry.kind) {
    case 'CREATED':
      return 'reported this';
    case 'COMMENT':
      return entry.visibility === 'INTERNAL' ? 'left an internal note' : 'replied';
    case 'STATUS_CHANGED':
      return `moved it to ${statusValue(entry.toValue, opts.reporter)}`;
    case 'REOPENED':
      return opts.reporter && !entry.staff ? 'said it still happens — reopened' : 'reopened it';
    case 'CONFIRMED_FIXED':
      return 'confirmed the fix — closed';
    case 'ASSIGNED':
      return entry.toValue ? `assigned it to ${n(entry.toValue)}` : 'unassigned it';
    case 'SEVERITY_CHANGED':
      return changeSentence('severity', entry);
    case 'PRIORITY_CHANGED':
      return changeSentence('priority', entry);
    case 'CATEGORY_CHANGED':
      return `changed the category to ${n(entry.toValue)}`;
    case 'ATTACHMENT_ADDED':
      return 'added a screenshot';
    default:
      // A kind added on the backend before the UI knows it.
      return String(entry.kind).toLowerCase();
  }
}

export function relativeTime(value: string): string {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function absoluteTime(value: string | null | undefined): string {
  return value
    ? new Date(value).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '—';
}

/** Day heading for a timeline: "Today", "Yesterday", or "5 Oct 2026". */
export function dayLabel(value: string): string {
  const d = new Date(value);
  const today = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(today) - startOf(d)) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Clock time only, for entries already grouped under a day heading. */
export function clockTime(value: string): string {
  return new Date(value).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}
