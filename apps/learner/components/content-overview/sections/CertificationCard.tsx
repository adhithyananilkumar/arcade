'use client';

// The certification a course or event leads to. The certification exam itself lives in the Exams
// hub — registration, fee and sitting happen there — so this card only says it exists and links to
// it. Renders nothing when the content has no published certification.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, ChevronRight } from 'lucide-react';
import { getContentCertification, type ContentCertificationView } from '@/domains/assessments';
import { examRoutes } from '@/shared/routes/content.routes';
import { formatMoney } from '@/shared/utils/money';

export function CertificationCard({
  contentType,
  contentId,
  completed,
}: {
  contentType: 'COURSE' | 'EVENT';
  contentId: string;
  /** Whether the learner has completed the content — the certification's prerequisite. */
  completed: boolean;
}) {
  const [cert, setCert] = useState<ContentCertificationView | null>(null);

  useEffect(() => {
    let cancelled = false;
    getContentCertification(contentType, contentId)
      .then((c) => {
        if (!cancelled) setCert(c && c.published ? c : null);
      })
      .catch(() => {
        // Supplementary: the page is complete without it.
      });
    return () => {
      cancelled = true;
    };
  }, [contentType, contentId]);

  if (!cert) return null;

  const noun = contentType === 'COURSE' ? 'course' : 'event';
  return (
    <section className="overflow-hidden rounded-2xl border border-violet-200/80 bg-gradient-to-b from-violet-50/70 to-surface p-5 dark:border-violet-500/25 dark:from-violet-500/10">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
        <Award size={14} /> Certification
      </div>
      <p className="text-[14px] font-bold leading-snug text-ink">{cert.title}</p>
      <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-500">
        {completed
          ? `You've completed this ${noun}, so you can register for the certification exam.`
          : `Complete this ${noun} to become eligible for the certification exam.`}
        {cert.feeMinor > 0 && ` Registration fee ${formatMoney(cert.feeMinor, cert.currency ?? 'INR')}.`}
      </p>
      <Link
        href={examRoutes.landing(cert.examId)}
        className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-violet-700 hover:text-violet-900 dark:text-violet-300 dark:hover:text-violet-200"
      >
        View certification <ChevronRight size={14} />
      </Link>
    </section>
  );
}
