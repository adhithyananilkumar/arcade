/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Shared
 * Subsystem: Design System
 *
 * Purpose:
 * Title block for a settings-style page: title, one-line description,
 * and right-aligned actions. `SectionHeader` is the smaller variant for
 * a block inside a page. Using these instead of hand-rolled headings is
 * what keeps every section the same size and weight.
 *
 * Rules:
 * - Never mention business models (e.g. "Course", "Channel").
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/utils';

interface HeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: HeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-3 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-[1.375rem] font-bold tracking-tight text-ink">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-[13px] font-medium text-slate-500">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function SectionHeader({ title, description, actions, className }: HeaderProps) {
  return (
    <div className={cn('flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        <h2 className="text-[15px] font-bold tracking-tight text-ink">{title}</h2>
        {description && (
          <p className="mt-0.5 text-[12.5px] font-medium text-slate-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
