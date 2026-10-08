'use client';

/**
 * One row of `GET /api/v1/me/enrollments`, rendered.
 *
 * Pure presentation: every field comes from the backend read model. There is no progress
 * fallback, no category inference, no instructor field (the DTO has none) and no stock image.
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import type { LearnerEnrollmentSummary } from '@/domains/enrollment';
import {
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
      channelName={item.channelName}
      channelIconUrl={item.channelIconUrl}
      dateText={enrolledOn ? `Enrolled ${enrolledOn}` : null}
      progressPercent={pct}
      actionHref={openable && href ? href : undefined}
      actionLabel={primaryActionLabelFor(item)}
      actionIcon={BookOpen}
      disabledAction={!openable || !href}
      disabledActionLabel={badge.label}
    />
  );
}
