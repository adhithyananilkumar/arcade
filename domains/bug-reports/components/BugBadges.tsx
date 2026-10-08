'use client';

import {
  Archive,
  Check,
  CheckCheck,
  CircleCheckBig,
  CircleDot,
  Hammer,
  MessageCircleQuestion,
  TriangleAlert,
  Bell,
  Bug,
  CreditCard,
  Database,
  Eye,
  Gauge,
  CircleHelp,
  Inbox,
  LayoutTemplate,
  Lightbulb,
  Link2,
  Lock,
  MousePointerClick,
  Search,
  Smartphone,
  Type,
  Upload,
  Video,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { BugImpact, BugPriority, BugStatus } from '../types/bug-report.types';
import {
  IMPACT_LABEL,
  IMPACT_SHORT,
  PRIORITY_TONE,
  REPORTER_STATUS_LABEL,
  STATUS_LABEL,
  type ReceiptState,
} from '../utils/labels';

const STATUS_ICON: Record<BugStatus, LucideIcon> = {
  NEW: Inbox,
  TRIAGED: CircleDot,
  IN_PROGRESS: Hammer,
  NEEDS_INFO: MessageCircleQuestion,
  RESOLVED: CircleCheckBig,
  CLOSED: Archive,
};

const STATUS_ICON_TONE: Record<BugStatus, string> = {
  NEW: 'text-sky-600 dark:text-sky-400',
  TRIAGED: 'text-indigo-600 dark:text-indigo-400',
  IN_PROGRESS: 'text-amber-600 dark:text-amber-400',
  NEEDS_INFO: 'text-fuchsia-600 dark:text-fuchsia-400',
  RESOLVED: 'text-emerald-600 dark:text-emerald-400',
  CLOSED: 'text-slate-400',
};

const IMPACT_LEVEL: Record<BugImpact, number> = { MINOR: 1, MAJOR: 2, BLOCKER: 3 };

const IMPACT_BAR: Record<BugImpact, string> = {
  MINOR: 'bg-slate-500',
  MAJOR: 'bg-amber-500',
  BLOCKER: 'bg-rose-500',
};

/** The fixed icon set a category may use. Keys match BugIntakeService.ICONS on the backend. */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  bug: Bug,
  layout: LayoutTemplate,
  wrench: Wrench,
  alert: TriangleAlert,
  gauge: Gauge,
  text: Type,
  database: Database,
  lock: Lock,
  card: CreditCard,
  phone: Smartphone,
  lightbulb: Lightbulb,
  help: CircleHelp,
  eye: Eye,
  link: Link2,
  bell: Bell,
  video: Video,
  upload: Upload,
  search: Search,
  pointer: MousePointerClick,
};

export function CategoryIcon({ icon, size = 16, className }: { icon: string; size?: number; className?: string }) {
  const Icon = CATEGORY_ICONS[icon] ?? Bug;
  return <Icon size={size} className={className} aria-hidden />;
}

/** Status in words with its icon — no coloured pill, so a list of them stays calm. */
export function BugStatusBadge({ status, audience = 'staff' }: { status: BugStatus; audience?: 'staff' | 'reporter' }) {
  const Icon = STATUS_ICON[status];
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap text-[11.5px] font-semibold text-slate-600">
      <Icon size={13} className={STATUS_ICON_TONE[status]} aria-hidden />
      {(audience === 'reporter' ? REPORTER_STATUS_LABEL : STATUS_LABEL)[status]}
    </span>
  );
}

/**
 * How much the bug gets in the way, as a three-bar meter (one bar minor, three a blocker).
 * `label` adds the word next to it; the full sentence is always in the tooltip.
 */
export function BugImpactBadge({ impact, label = true }: { impact: BugImpact; label?: boolean }) {
  const filled = IMPACT_LEVEL[impact];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[11.5px] font-semibold text-slate-600" title={`Impact: ${IMPACT_LABEL[impact]}`}>
      <span className="flex h-3 items-end gap-[2px]" aria-hidden>
        {[1, 2, 3].map((bar) => (
          <span
            key={bar}
            className={`w-[3px] rounded-full ${bar <= filled ? IMPACT_BAR[impact] : 'bg-slate-200'}`}
            style={{ height: `${bar * 4}px` }}
          />
        ))}
      </span>
      {label ? IMPACT_SHORT[impact] : <span className="sr-only">{IMPACT_SHORT[impact]}</span>}
    </span>
  );
}

/**
 * WhatsApp-style delivery ticks on a message the viewer sent: one grey tick once saved, two grey
 * ticks once the other side's app has received it, two blue ticks once they opened it.
 */
export function MessageTicks({ state, className = '' }: { state: ReceiptState; className?: string }) {
  const title = state === 'read' ? 'Read' : state === 'delivered' ? 'Delivered' : 'Sent';
  const Icon = state === 'sent' ? Check : CheckCheck;
  return (
    <Icon
      size={15}
      strokeWidth={2.25}
      aria-label={title}
      className={`shrink-0 ${state === 'read' ? 'text-[#53bdeb]' : 'text-slate-400'} ${className}`}
    >
      <title>{title}</title>
    </Icon>
  );
}

export function BugPriorityBadge({ priority }: { priority: BugPriority | null }) {
  if (!priority) return <span className="text-[11px] font-medium text-slate-300">—</span>;
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-md px-1.5 py-0.5 font-mono text-[11px] font-bold ring-1 ring-inset ${PRIORITY_TONE[priority]}`}>
      {priority}
    </span>
  );
}

export function PersonAvatar({ name, avatarUrl, size = 22 }: { name: string; avatarUrl?: string | null; size?: number }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- avatars come from several hosts
    return <img src={avatarUrl} alt="" width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {initials || '?'}
    </span>
  );
}
