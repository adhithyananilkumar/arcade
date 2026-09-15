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
      className="group relative flex flex-col overflow-hidden rounded-2xl sm:rounded-[20px] border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 sm:p-5 shadow-xs hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)] hover:-translate-y-1 transition-all duration-300"
    >
      {/* Cover image banner */}
      <div className="relative h-40 w-full rounded-xl sm:rounded-[14px] overflow-hidden bg-slate-100 dark:bg-slate-800">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
        <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-900/90 text-[10px] font-bold text-slate-700 dark:text-slate-200 backdrop-blur-md shadow-xs">
          <TypeIcon size={12} className="text-indigo-600 dark:text-indigo-400" />
          {item.resourceType === 'EVENT' ? 'Event' : 'Course'}
        </span>
      </div>

      <div className="mt-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-2">
          <h4 className="text-[15px] font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {item.title ?? 'Untitled (resource no longer available)'}
          </h4>
          <div className="flex flex-wrap items-center gap-2">
            <span
              title={badge.hint ?? undefined}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border inline-flex items-center gap-1 ${STATUS_TONE_CLASSES[badge.tone]}`}
            >
              {badge.tone === 'emerald' && badge.label === 'Completed' && <CheckCircle2 size={11} />}
              {badge.tone === 'amber' && <Lock size={11} />}
              {badge.tone === 'rose' && <AlertTriangle size={11} />}
              {badge.label}
            </span>
            {enrolledOn && (
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
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

        <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0 max-w-[58%] space-y-1.5">
            {progress.kind === 'bar' ? (
              <>
                <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <span>Progress</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{progress.percent}%</span>
                </div>
                <div
                  className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={progress.percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Course progress"
                >
                  <div
                    style={{ width: `${progress.percent}%` }}
                    className="h-full bg-gradient-to-r from-[#2962D6] to-[#27C5D8] rounded-full transition-all duration-500"
                  />
                </div>
              </>
            ) : (
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                {progress.label}
              </span>
            )}
          </div>

          {openable && href ? (
            <Link
              href={href}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white hover:bg-indigo-600 dark:hover:bg-indigo-50 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-xs shrink-0"
            >
              {primaryActionLabelFor(item)}
            </Link>
          ) : (
            <span
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs font-bold shrink-0 cursor-not-allowed"
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
