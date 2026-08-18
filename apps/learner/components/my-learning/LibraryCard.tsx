'use client';

/**
 * One row of `GET /api/v1/me/enrollments`, rendered.
 *
 * Pure presentation: every field comes from the backend read model. There is no progress
 * fallback, no category inference, no instructor field (the DTO has none) and no stock image.
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Lock, AlertTriangle, Calendar, BookOpen } from 'lucide-react';
import type { LearnerEnrollmentSummary } from '@/domains/enrollment';
import {
  STATUS_TONE_CLASSES,
  initialFor,
  isOpenable,
  placeholderTintFor,
  primaryActionLabelFor,
  progressDisplayFor,
  resourceHrefFor,
  statusBadgeFor,
  formatDate,
} from './enrollmentPresentation';

export function LibraryCard({
  item,
  index,
}: {
  item: LearnerEnrollmentSummary;
  index: number;
}) {
  const badge = statusBadgeFor(item);
  const progress = progressDisplayFor(item);
  const href = resourceHrefFor(item);
  const openable = isOpenable(item);
  const enrolledOn = formatDate(item.enrolledAt);
  const TypeIcon = item.resourceType === 'EVENT' ? Calendar : BookOpen;

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.35, ease: 'easeOut', delay: Math.min(index * 0.04, 0.2) }}
      className="group relative flex flex-col overflow-hidden rounded-tl-none rounded-br-none rounded-tr-3xl rounded-bl-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4.5 sm:p-5 shadow-xs hover:shadow-lg transition-all duration-300"
    >
      {/* Cover — the real image, or a neutral tinted initial. Never a stock photo. */}
      <div className="relative h-36 w-full rounded-tl-none rounded-tr-2xl rounded-br-2xl rounded-bl-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            aria-hidden
            className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${placeholderTintFor(item.resourceId)}`}
          >
            <span className="text-4xl font-black text-slate-400/70 dark:text-slate-500/70 select-none">
              {initialFor(item.title)}
            </span>
          </div>
        )}
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/90 dark:bg-slate-900/90 text-[10px] font-bold text-slate-600 dark:text-slate-300 backdrop-blur-sm">
          <TypeIcon size={11} />
          {item.resourceType === 'EVENT' ? 'Event' : 'Course'}
        </span>
      </div>

      <div className="mt-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
            {item.title ?? 'Untitled (resource no longer available)'}
          </h4>
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              title={badge.hint ?? undefined}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border inline-flex items-center gap-1 ${STATUS_TONE_CLASSES[badge.tone]}`}
            >
              {badge.tone === 'emerald' && badge.label === 'Completed' && <CheckCircle2 size={11} />}
              {badge.tone === 'amber' && <Lock size={11} />}
              {badge.tone === 'rose' && <AlertTriangle size={11} />}
              {badge.label}
            </span>
            {enrolledOn && (
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                Enrolled {enrolledOn}
              </span>
            )}
          </div>
          {badge.hint && (
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-snug">
              {badge.hint}
            </p>
          )}
        </div>

        <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0 max-w-[60%] space-y-1">
            {progress.kind === 'bar' ? (
              <>
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>Progress</span>
                  <span>{progress.percent}%</span>
                </div>
                <div
                  className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={progress.percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Course progress"
                >
                  <div
                    style={{ width: `${progress.percent}%` }}
                    className="h-full bg-slate-900 dark:bg-slate-200 rounded-full"
                  />
                </div>
              </>
            ) : (
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                {progress.label}
              </span>
            )}
          </div>

          {openable && href ? (
            <Link
              href={href}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-xs shrink-0"
            >
              {primaryActionLabelFor(item)}
            </Link>
          ) : (
            <span
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs font-bold shrink-0 cursor-not-allowed"
              aria-disabled="true"
            >
              Unavailable
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
