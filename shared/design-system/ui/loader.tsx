/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Shared
 * Subsystem: Design System
 *
 * Purpose:
 * Arcade's one loading indicator — the bouncing "pebble" dots — and the full-area page loader
 * built from it. Every "something is on its way" surface (route loading files, auth transitions,
 * workspace bootstraps, the navigation pill) uses these, so waiting looks the same everywhere.
 *
 * Rules:
 * - Pure UI: no data fetching, no routing.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

'use client';

import { motion, useReducedMotion } from 'framer-motion';

export interface LoaderProps {
  label?: string;
  tone?: 'ink' | 'light';
  size?: 'sm' | 'md';
}

/** Soft bouncing pebble dots. */
export function Loader({ label, tone = 'ink', size = 'md' }: LoaderProps) {
  const reduce = useReducedMotion();
  const color = tone === 'light' ? 'bg-surface' : 'bg-ink';
  const dot = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2.5 w-2.5';
  const bounce = size === 'sm' ? -6 : -10;

  return (
    <div
      className={`flex flex-col items-center ${size === 'sm' ? 'gap-0' : 'gap-4'}`}
      role="status"
      aria-live="polite"
    >
      <div className={`flex items-end ${size === 'sm' ? 'gap-1.5' : 'gap-2'}`}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className={`block rounded-full ${dot} ${color}`}
            animate={
              reduce
                ? { opacity: [0.35, 1, 0.35] }
                : { y: [0, bounce, 0], opacity: [0.35, 1, 0.35], scale: [0.92, 1.05, 0.92] }
            }
            transition={{
              duration: 0.95,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.14,
            }}
          />
        ))}
      </div>
      {label && (
        <p className={`text-sm font-medium ${tone === 'light' ? 'text-white/80' : 'text-slate-500'}`}>
          {label}
        </p>
      )}
      <span className="sr-only">{label || 'Loading'}</span>
    </div>
  );
}

/**
 * The loader centred in the space a page would occupy. `fullScreen` takes the whole viewport —
 * for immersive routes (editors) that draw no navbar, where a loader in a corner reads as a blank
 * page.
 */
export function PageLoader({ label, fullScreen = false }: { label?: string; fullScreen?: boolean }) {
  return (
    <div
      className={`flex w-full flex-1 items-center justify-center ${fullScreen ? 'h-screen' : 'min-h-[60vh]'}`}
    >
      <Loader label={label} />
    </div>
  );
}
