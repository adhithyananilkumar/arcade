'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Map,
  FileText,
  ArrowUpRight,
  LucideIcon,
} from 'lucide-react';
import { ContentArt } from '@/shared/design-system/art';
import { cn } from '@/shared/utils/utils';
import { ChannelAvatar } from './ChannelAvatar';

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
  /** Category name; picks the artwork's theme. Falls back to words in the title. */
  category?: string | null;
  /** Console category id, when the name isn't to hand. */
  categoryId?: string | null;
  /** The publishing channel. A card credits its channel only — never a person or a role. */
  channelName?: string | null;
  /** The channel's picture; for a personal channel the backend sends its owner's. */
  channelIconUrl?: string | null;
  dateText?: string | null;
  metaTags?: Array<string | React.ReactNode>;
  metadataBadges?: React.ReactNode;
  progressPercent?: number | null;
  actionHref?: string;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  /** `success` for "go to" actions on something already yours, `waiting` for a held/queued state. */
  actionTone?: 'default' | 'success' | 'waiting';
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

const ACTION_TONES = {
  default: 'bg-ink hover:bg-ink-hover text-on-ink',
  success: 'bg-ink hover:bg-ink-hover text-on-ink',
  waiting:
    'bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 border border-amber-500/25 dark:text-amber-200',
} as const;

export function UnifiedContentCard({
  id,
  title,
  description,
  type = 'COURSE',
  typeLabel,
  typeIcon,
  status,
  statusNode,
  category,
  categoryId,
  channelName,
  channelIconUrl,
  dateText,
  metaTags,
  metadataBadges,
  progressPercent,
  actionHref,
  actionLabel = 'View',
  actionIcon: ActionIcon = ArrowUpRight,
  actionTone = 'default',
  onActionClick,
  disabledAction = false,
  disabledActionLabel = 'Unavailable',
  customActionNode,
  className,
}: UnifiedContentCardProps) {
  const normType = type?.toUpperCase() || 'COURSE';
  const resolvedLabel = typeLabel || TYPE_CONFIG[normType]?.label || type;
  const ResolvedTypeIcon = typeIcon || TYPE_CONFIG[normType]?.icon || FileText;
  const toneClass = ACTION_TONES[actionTone];

  return (
    <div
      className={cn(
        'group relative flex h-full flex-col justify-between overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface p-4 shadow-[0_8px_30px_rgba(20,20,43,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(20,20,43,0.08)]',
        className
      )}
    >
      <div className="relative z-10 flex flex-1 flex-col justify-between gap-3">
        {/* Generated, category-themed artwork */}
        <div className="relative h-36 sm:h-38 w-full shrink-0 overflow-hidden rounded-tl-[1.5rem] rounded-br-[1.5rem] rounded-tr-md rounded-bl-md border border-slate-200/70 shadow-xs transition-transform duration-500 group-hover:scale-[1.02]">
          <ContentArt seed={id || title || 'default'} kind={type} category={category} categoryId={categoryId} title={title} />
          {statusNode && (
            <div className="absolute top-2.5 right-2.5 z-10">
              {statusNode}
            </div>
          )}
        </div>

        {/* Card Content: Title, Description, Channel, Meta, Badges, Progress */}
        <div className="flex flex-1 flex-col gap-2.5">
          <div className="space-y-1">
            <h4 className="line-clamp-2 text-[15px] font-bold tracking-tight text-ink transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-snug">
              {title || 'Untitled'}
            </h4>

            {description ? (
              <p className="line-clamp-2 text-xs font-medium text-slate-500 leading-relaxed">
                {description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 pt-0.5">
            {/* The publishing channel */}
            {channelName ? (
              <div className="flex items-center gap-2">
                <ChannelAvatar name={channelName} iconUrl={channelIconUrl} size={19} />
                <p className="truncate text-[11.5px] font-semibold text-slate-600">
                  {channelName}
                </p>
              </div>
            ) : null}

            {/* Date and Meta Tags */}
            {(dateText || (metaTags && metaTags.length > 0)) ? (
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-500">
                {dateText && <span>{dateText}</span>}
                {metaTags?.map((tag, idx) => (
                  <React.Fragment key={idx}>
                    {(idx > 0 || dateText) && <span>·</span>}
                    <span>{tag}</span>
                  </React.Fragment>
                ))}
              </div>
            ) : null}

            {/* Metadata Badges */}
            {metadataBadges ? (
              <div className="flex flex-wrap items-center gap-1.5">
                {metadataBadges}
              </div>
            ) : null}

            {/* Progress Bar */}
            {typeof progressPercent === 'number' && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Progress</span>
                  <span className="font-bold text-slate-700">{progressPercent}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action CTA anchored to bottom */}
        <div className="mt-auto pt-2">
          {customActionNode ? (
            customActionNode
          ) : disabledAction ? (
            <span
              className="inline-flex w-full items-center justify-center gap-2 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-slate-100 px-4 py-2.5 text-[13px] font-semibold text-slate-400 cursor-not-allowed"
              aria-disabled="true"
            >
              {disabledActionLabel}
            </span>
          ) : actionHref ? (
            <Link
              href={actionHref}
              className={cn(
                'inline-flex w-full items-center justify-center gap-2 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md px-4 py-2.5 text-[13px] font-semibold transition-all shadow-sm hover:shadow-md',
                toneClass,
              )}
            >
              <span>{actionLabel}</span>
              <ActionIcon size={14} />
            </Link>
          ) : onActionClick ? (
            <button
              type="button"
              onClick={onActionClick}
              className={cn(
                'inline-flex w-full items-center justify-center gap-2 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md px-4 py-2.5 text-[13px] font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer',
                toneClass,
              )}
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
