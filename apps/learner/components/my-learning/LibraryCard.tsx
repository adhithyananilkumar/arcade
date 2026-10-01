'use client';

/**
 * One row of `GET /api/v1/me/enrollments`, rendered.
 *
 * Pure presentation: every field comes from the backend read model. There is no progress
 * fallback, no category inference, no instructor field (the DTO has none) and no stock image.
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, AlertTriangle, BookOpen } from 'lucide-react';
import type { LearnerEnrollmentSummary } from '@/domains/enrollment';
import {
  STATUS_TONE_CLASSES,
  isOpenable,
  primaryActionLabelFor,
  progressDisplayFor,
  resourceHrefFor,
  statusBadgeFor,
  formatDate,
} from './enrollmentPresentation';

import { LetterVectorArt } from './LetterVectorArt';

import { UnifiedContentCard } from '@/shared/design-system/ui/cards';

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
    <UnifiedContentCard
      id={item.resourceId || item.enrollmentId}
      title={item.title ?? 'Untitled'}
      type="COURSE"
      statusNode={
        item.accessState !== 'ACCESSIBLE' ? (
          <span
            title={badge.hint ?? undefined}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${STATUS_TONE_CLASSES[badge.tone]}`}
          >
            {badge.tone === 'amber' && <Lock size={11} />}
            {badge.tone === 'rose' && <AlertTriangle size={11} />}
            {badge.label}
          </span>
        ) : null
      }
      dateText={enrolledOn ? `Enrolled ${enrolledOn}` : null}
      progressPercent={pct}
      actionHref={openable && href ? href : undefined}
      actionLabel={primaryActionLabelFor(item)}
      actionIcon={BookOpen}
      disabledAction={!openable || !href}
      disabledActionLabel="Unavailable"
    />
  );
}
