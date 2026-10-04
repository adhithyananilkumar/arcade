/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Shared
 * Subsystem: Design System
 *
 * Purpose:
 * The bordered white surface that settings-style pages group their
 * content in. One radius, one border, one padding scale.
 *
 * Rules:
 * - Never mention business models (e.g. "Course", "Channel").
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import type { ComponentProps } from 'react';
import { cn } from '@/shared/utils/utils';

export function Panel({
  className,
  tone = 'default',
  padded = true,
  ...props
}: ComponentProps<'section'> & { tone?: 'default' | 'danger'; padded?: boolean }) {
  return (
    <section
      className={cn(
        'rounded-[20px] border',
        tone === 'danger'
          ? 'border-rose-200 bg-rose-50/40 dark:border-rose-900/60 dark:bg-rose-950/20'
          : 'border-slate-200/80 bg-surface',
        padded && 'p-5 sm:p-6',
        className,
      )}
      {...props}
    />
  );
}
