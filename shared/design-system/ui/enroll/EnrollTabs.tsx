'use client';

import { useId, useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface EnrollTabsProps {
  /** Tab labels, in display order. */
  tabs: readonly string[];
  /** The selected label. The page owns it so it can deep-link or reset it. */
  active: string;
  onChange: (tab: string) => void;
  /** The active tab's content. */
  children: ReactNode;
  className?: string;
}

/**
 * The tab bar and panel shared by every enroll page (course, event, exam): one asymmetric
 * container with a sliding pill, so the three pages cannot drift apart again. The page decides
 * which tabs exist and what each one shows.
 */
export function EnrollTabs({ tabs, active, onChange, children, className }: EnrollTabsProps) {
  const topRef = useRef<HTMLDivElement>(null);
  const pillId = useId();

  const select = (tab: string) => {
    onChange(tab);
    // Bring the bar to the top of the viewport (below the floating navbar) so the new tab's
    // content is in view instead of staying wherever the page was scrolled.
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <div ref={topRef} className={`pt-4 sm:pt-6 scroll-mt-24 ${className ?? ''}`}>
      <div className="flex justify-center">
        <div
          role="tablist"
          className="inline-flex flex-wrap items-center justify-center gap-1.5 rounded-tl-[1.85rem] rounded-br-[1.85rem] rounded-tr-xl rounded-bl-xl border border-line bg-surface/80 backdrop-blur-md p-1.5 shadow-sm"
        >
          {tabs.map((label) => {
            const isActive = label === active;
            return (
              <button
                key={label}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => select(label)}
                className={`relative px-4 sm:px-5 py-2 rounded-tl-[1.25rem] rounded-br-[1.25rem] rounded-tr-md rounded-bl-md text-[13px] sm:text-sm font-semibold transition-colors duration-200 select-none cursor-pointer text-center ${
                  isActive ? 'text-on-ink' : 'text-subtle hover:text-ink'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId={pillId}
                    className="absolute inset-0 rounded-tl-[1.25rem] rounded-br-[1.25rem] rounded-tr-md rounded-bl-md bg-ink shadow-xs"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div key={active} role="tabpanel" className="mt-8 arcade-fade min-h-[70vh]">
        {children}
      </div>
    </div>
  );
}
