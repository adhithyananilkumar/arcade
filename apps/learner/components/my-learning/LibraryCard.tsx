'use client';

/**
 * One row of `GET /api/v1/me/enrollments`, rendered.
 *
 * Pure presentation: every field comes from the backend read model. There is no progress
 * fallback, no category inference, no instructor field (the DTO has none) and no stock image.
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Lock, AlertTriangle, BookOpen } from 'lucide-react';
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

import { LetterVectorArt } from './LetterVectorArt';

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
  const pct = progress.kind === 'bar' ? progress.percent : null;

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.04, 0.2) }}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 sm:p-5 shadow-[0_8px_30px_rgba(20,20,43,0.05)] transition-all hover:shadow-[0_12px_36px_rgba(20,20,43,0.08)] hover:-translate-y-1 backdrop-blur-sm"
    >
      {/* Decorative ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -bottom-12 h-44 w-44 rounded-full bg-gradient-to-br from-[#4C6FFF]/10 via-[#1DB876]/8 to-transparent blur-2xl"
      />

      <div className="relative z-10 flex flex-1 flex-col justify-between gap-4">
        {/* Vector Letter Banner */}
        <div className="relative h-44 sm:h-48 w-full shrink-0 overflow-hidden rounded-tl-[1.75rem] rounded-br-[1.75rem] rounded-tr-md rounded-bl-md border border-slate-200/70 dark:border-slate-800 shadow-sm transition-transform duration-500 group-hover:scale-[1.02]">
          <LetterVectorArt
            title={item.title}
            id={item.resourceId || item.enrollmentId}
          />
        </div>

        {/* Title and Status details */}
        <div className="space-y-1.5">
          <h3 className="line-clamp-1 text-base sm:text-lg font-bold tracking-tight text-[#14142b] dark:text-white">
            {item.title ?? 'Untitled (resource no longer available)'}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <span
              title={badge.hint ?? undefined}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${STATUS_TONE_CLASSES[badge.tone]}`}
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

        {/* Progress Bar Section */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500 dark:text-slate-400">Course Progress</span>
            {progress.kind === 'bar' ? (
              <span className="font-bold text-[#14142b] dark:text-white">{progress.percent}%</span>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 font-medium">{progress.label}</span>
            )}
          </div>
          {pct !== null && (
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 p-0.5"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Course progress"
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#4C6FFF] via-[#0EA5E9] to-[#1DB876]"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          )}
        </div>

        {/* Bottom Full-Width CTA Action Button */}
        <div className="pt-1">
          {openable && href ? (
            <Link
              href={href}
              className="inline-flex w-full items-center justify-center gap-2 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-[#12141C] hover:bg-[#232735] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 px-5 py-3 text-[13px] font-semibold transition-all shadow-sm hover:shadow-md"
            >
              <BookOpen size={15} className="fill-current" /> {primaryActionLabelFor(item)}
            </Link>
          ) : (
            <span
              className="inline-flex w-full items-center justify-center gap-2 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-slate-100 dark:bg-slate-800 px-5 py-3 text-[13px] font-semibold text-slate-400 dark:text-slate-500 cursor-not-allowed"
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
