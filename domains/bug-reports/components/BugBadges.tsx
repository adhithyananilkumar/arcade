'use client';

import {
  TriangleAlert,
  Bell,
  Bug,
  CreditCard,
  Database,
  Eye,
  Gauge,
  CircleHelp,
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
  IMPACT_SHORT,
  IMPACT_TONE,
  PRIORITY_TONE,
  REPORTER_STATUS_LABEL,
  STATUS_DOT,
  STATUS_LABEL,
  STATUS_TONE,
} from '../utils/labels';

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

export function BugStatusBadge({ status, audience = 'staff' }: { status: BugStatus; audience?: 'staff' | 'reporter' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${STATUS_TONE[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {(audience === 'reporter' ? REPORTER_STATUS_LABEL : STATUS_LABEL)[status]}
    </span>
  );
}

export function BugImpactBadge({ impact }: { impact: BugImpact }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${IMPACT_TONE[impact]}`}>
      {IMPACT_SHORT[impact]}
    </span>
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
