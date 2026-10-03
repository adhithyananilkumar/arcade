/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Shared
 * Subsystem: Design System
 *
 * Purpose:
 * The one sidebar navigation used by every settings-style surface
 * (Settings, Console, Channel dashboard): a vertical list on desktop,
 * a horizontal pill strip on mobile. Before this each surface carried
 * its own copy of the same markup and they had started to drift.
 *
 * Rules:
 * - Never mention business models (e.g. "Course", "Channel").
 * - Callers decide which items exist and which one is active; this
 *   component only renders them.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import type { ComponentType } from 'react';
import Link from 'next/link';
import { cn } from '@/shared/utils/utils';

type NavIcon = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;

export interface SideNavItem {
  /** Stable identity, compared against `activeKey`. */
  key: string;
  label: string;
  href: string;
  icon: NavIcon;
  /** Tailwind classes for the round icon chip, e.g. `bg-[#bae6fd] text-[#0c4a6e]`. */
  iconClassName: string;
  /** Destructive destinations (delete, transfer) render in the danger tone. */
  danger?: boolean;
  /** Small trailing count, e.g. items waiting for action. Hidden when 0 or absent. */
  count?: number;
}

export interface SideNavSection {
  /** Optional small caps heading above the group. */
  title?: string;
  items: SideNavItem[];
}

interface SideNavProps {
  sections: SideNavSection[];
  activeKey: string | null;
  ariaLabel: string;
  className?: string;
}

/** Vertical sidebar list — the desktop form. */
export function SideNav({ sections, activeKey, ariaLabel, className }: SideNavProps) {
  return (
    <nav aria-label={ariaLabel} className={cn('flex flex-col gap-5', className)}>
      {sections
        .filter((section) => section.items.length > 0)
        .map((section, idx) => (
          <div key={section.title ?? idx} className="flex flex-col gap-1.5">
            {section.title && (
              <p className="theme-nav-title px-4 pb-0.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-slate-400">
                {section.title}
              </p>
            )}
            {section.items.map((item) => (
              <SideNavLink key={item.key} item={item} active={item.key === activeKey} />
            ))}
          </div>
        ))}
    </nav>
  );
}

function SideNavLink({ item, active }: { item: SideNavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'theme-nav-item flex items-center gap-3.5 rounded-full px-4 py-3 text-sm font-semibold transition-all duration-200',
        active
          ? item.danger
            ? 'border border-rose-200 bg-rose-50 font-bold text-rose-900 shadow-xs dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-200'
            : 'border border-sky-200 bg-sky-100/90 font-bold text-sky-950 shadow-xs dark:border-sky-800/60 dark:bg-sky-950/70 dark:text-sky-200'
          : item.danger
            ? 'text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40'
            : 'text-slate-700 hover:bg-slate-100',
      )}
    >
      <span
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-2xs',
          item.iconClassName,
        )}
      >
        <Icon size={16} strokeWidth={2} />
      </span>
      <span className="truncate text-xs font-semibold">{item.label}</span>
      {!!item.count && (
        <span className="ml-auto rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-on-ink">
          {item.count}
        </span>
      )}
    </Link>
  );
}

interface SideNavTabsProps {
  items: SideNavItem[];
  activeKey: string | null;
  ariaLabel: string;
  className?: string;
}

/** Horizontal scrolling pill strip — the mobile form of the same navigation. */
export function SideNavTabs({ items, activeKey, ariaLabel, className }: SideNavTabsProps) {
  return (
    <nav aria-label={ariaLabel} className={cn('flex shrink-0 gap-1.5 overflow-x-auto pb-1', className)}>
      {items.map((item) => {
        const active = item.key === activeKey;
        const Icon = item.icon;
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-full py-1.5 pl-2 pr-4 text-[12px] font-semibold transition-colors',
              active
                ? item.danger
                  ? 'border border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-200'
                  : 'border border-sky-200 bg-sky-100/90 text-sky-950 dark:border-sky-800/60 dark:bg-sky-950/70 dark:text-sky-200'
                : 'border border-slate-200 bg-surface/90 text-slate-600',
            )}
          >
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full shadow-2xs',
                item.iconClassName,
              )}
            >
              <Icon size={12} strokeWidth={2} />
            </span>
            {item.label}
            {!!item.count && (
              <span className="rounded-full bg-slate-900 px-1.5 text-[10px] font-bold text-on-ink">
                {item.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
