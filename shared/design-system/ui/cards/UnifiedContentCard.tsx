'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Map,
  FileText,
  User,
  ArrowUpRight,
  LucideIcon,
} from 'lucide-react';
import { DoodleCardArt } from './DoodleCardArt';
import { cn } from '@/shared/utils/utils';

export type UnifiedContentType =
  | 'COURSE'
  | 'EXAM'
  | 'ASSESSMENT'
  | 'WORKSHOP'
  | 'EVENT'
  | 'WEBINAR'
  | 'ROADMAP'
  | string;

export interface UnifiedContentCardProps {
  id: string;
  title: string;
  description?: string | null;
  type?: UnifiedContentType;
  typeLabel?: string;
  typeIcon?: LucideIcon;
  status?: string;
  statusNode?: React.ReactNode;
  coverImageUrl?: string | null;
  authorName?: string | null;
  authorUsername?: string | null;
  authorSubtitle?: string | null;
  authorAvatarUrl?: string | null;
  dateText?: string | null;
  metaTags?: Array<string | React.ReactNode>;
  metadataBadges?: React.ReactNode;
  progressPercent?: number | null;
  actionHref?: string;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onActionClick?: () => void;
  disabledAction?: boolean;
  disabledActionLabel?: string;
  customActionNode?: React.ReactNode;
  className?: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: LucideIcon }> = {
  COURSE: { label: 'Course', icon: BookOpen },
  EXAM: { label: 'Exam', icon: GraduationCap },
  ASSESSMENT: { label: 'Assessment', icon: GraduationCap },
  WORKSHOP: { label: 'Workshop', icon: Calendar },
  EVENT: { label: 'Event', icon: Calendar },
  WEBINAR: { label: 'Webinar', icon: Calendar },
  ROADMAP: { label: 'Roadmap', icon: Map },
};

export function UnifiedContentCard({
  id,
  title,
  description,
  type = 'COURSE',
  typeLabel,
  typeIcon,
  status,
  statusNode,
  coverImageUrl,
  authorName,
  authorUsername,
  authorSubtitle,
  authorAvatarUrl,
  dateText,
  metaTags,
  metadataBadges,
  progressPercent,
  actionHref,
  actionLabel = 'View',
  actionIcon: ActionIcon = ArrowUpRight,
  onActionClick,
  disabledAction = false,
  disabledActionLabel = 'Unavailable',
  customActionNode,
  className,
}: UnifiedContentCardProps) {
  const normType = type?.toUpperCase() || 'COURSE';
  const resolvedLabel = typeLabel || TYPE_CONFIG[normType]?.label || type;
  const ResolvedTypeIcon = typeIcon || TYPE_CONFIG[normType]?.icon || FileText;

  return (
    <div
      className={cn(
        'group relative flex h-full flex-col justify-between overflow-hidden rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-white/95 p-4 sm:p-5 shadow-[0_8px_30px_rgba(20,20,43,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(20,20,43,0.08)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95',
        className
      )}
    >
      {/* Decorative ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -bottom-12 h-44 w-44 rounded-full bg-gradient-to-br from-[#4C6FFF]/10 via-[#1DB876]/8 to-transparent blur-2xl"
      />

      <div className="relative z-10 flex flex-1 flex-col justify-between gap-3 sm:gap-4">
        {/* Vector Letter Banner or Cover Image */}
        <div className="relative h-40 sm:h-44 w-full shrink-0 overflow-hidden rounded-tl-[1.75rem] rounded-br-[1.75rem] rounded-tr-md rounded-bl-md border border-slate-200/70 shadow-xs transition-transform duration-500 group-hover:scale-[1.02] dark:border-slate-800">
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt={title || 'Content thumbnail'}
              className="h-full w-full object-cover"
            />
          ) : (
            <DoodleCardArt
              id={id || title || 'default'}
              title={title}
              type={type}
              description={description}
            />
          )}
        </div>

        {/* Title, Description & Details */}
        <div className="space-y-2 flex-1">
          <h4 className="line-clamp-2 text-base font-bold tracking-tight text-[#14142b] transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 leading-snug">
            {title || 'Untitled'}
          </h4>

          {description && (
            <p className="line-clamp-2 text-xs sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              {description}
            </p>
          )}

          {authorName && (
            <div className="flex items-center gap-2 pt-0.5">
              {authorAvatarUrl ? (
                <img
                  src={authorAvatarUrl}
                  alt={authorName}
                  className="size-5 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <User size={12} className="text-slate-400 shrink-0" />
              )}
              <p className="truncate text-[11.5px] font-medium text-slate-500 dark:text-slate-400">
                <span>{authorName}</span>
                {authorUsername && <span className="text-slate-400"> (@{authorUsername})</span>}
                {authorSubtitle && <span className="text-slate-400"> • {authorSubtitle}</span>}
              </p>
            </div>
          )}

          {dateText && (
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {dateText}
            </p>
          )}

          {metaTags && metaTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11.5px] font-medium text-slate-500 dark:text-slate-400">
              {metaTags.map((tag, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span>·</span>}
                  <span>{tag}</span>
                </React.Fragment>
              ))}
            </div>
          )}

          {metadataBadges && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {metadataBadges}
            </div>
          )}

          {/* Optional Progress Bar */}
          {typeof progressPercent === 'number' && (
            <div className="space-y-1 pt-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <span>Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action CTA */}
        <div className="pt-2">
          {customActionNode ? (
            customActionNode
          ) : disabledAction ? (
            <span
              className="inline-flex w-full items-center justify-center gap-2 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-slate-100 px-4 py-2.5 text-[13px] font-semibold text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500"
              aria-disabled="true"
            >
              {disabledActionLabel}
            </span>
          ) : actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex w-full items-center justify-center gap-2 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-[#12141C] hover:bg-[#232735] text-white px-4 py-2.5 text-[13px] font-semibold transition-all shadow-sm hover:shadow-md dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              <span>{actionLabel}</span>
              <ActionIcon size={14} />
            </Link>
          ) : onActionClick ? (
            <button
              type="button"
              onClick={onActionClick}
              className="inline-flex w-full items-center justify-center gap-2 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-[#12141C] hover:bg-[#232735] text-white px-4 py-2.5 text-[13px] font-semibold transition-all shadow-sm hover:shadow-md dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 cursor-pointer"
            >
              <span>{actionLabel}</span>
              <ActionIcon size={14} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
