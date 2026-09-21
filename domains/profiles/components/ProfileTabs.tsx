'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Profiles
 *
 * Purpose:
 * The tab bar shared by user and channel profiles.
 *
 * Rules:
 * - Pure. Which tabs exist is decided by whoever renders it, from what the
 *   profile payload actually contains — an instructor with no published
 *   courses gets no Courses tab rather than an empty one.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface ProfileTab {
  id: string;
  label: string;
  /** Rendered as a pill beside the label. Omit rather than pass 0. */
  count?: number;
}

export interface ProfileTabsProps {
  tabs: ProfileTab[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function ProfileTabs({
  tabs,
  activeId,
  onChange,
  className,
}: ProfileTabsProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(
    null,
  );

  // The sliding underline is measured from the live DOM rather than computed from index and a
  // fixed tab width: labels have different lengths, and the counts change the width again.
  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector<HTMLElement>('[data-active="true"]');
    if (!active) {
      setIndicator(null);
      return;
    }
    setIndicator({ left: active.offsetLeft, width: active.offsetWidth });
  }, []);

  useEffect(() => {
    measure();
  }, [measure, activeId, tabs]);

  // Fonts landing after first paint shift every label, so a single measurement on mount is wrong
  // often enough to be visible. Re-measuring on resize covers both that and orientation changes.
  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const index = tabs.findIndex((t) => t.id === activeId);
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      onChange(tabs[(index + 1) % tabs.length].id);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onChange(tabs[(index - 1 + tabs.length) % tabs.length].id);
    }
  };

  return (
    <div
      className={`relative border-b border-slate-100 dark:border-neutral-900 ${className ?? ''}`}
    >
      <div
        ref={listRef}
        role="tablist"
        onKeyDown={onKeyDown}
        className="relative flex items-center gap-1 overflow-x-auto pb-px [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((tab) => {
          const active = tab.id === activeId;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={active}
              data-active={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(tab.id)}
              className={`group relative shrink-0 rounded-t-lg px-4 py-3 text-[13px] font-bold tracking-tight transition-colors ${
                active
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-400 hover:text-slate-600 dark:text-neutral-500 dark:hover:text-neutral-300'
              }`}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums transition-colors ${
                      active
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-black'
                        : 'bg-slate-100 text-slate-500 dark:bg-neutral-900 dark:text-neutral-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {indicator && (
        <span
          aria-hidden
          className="absolute -bottom-px h-[2px] rounded-full bg-slate-900 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] dark:bg-white"
          style={{ left: indicator.left, width: indicator.width }}
        />
      )}
    </div>
  );
}
