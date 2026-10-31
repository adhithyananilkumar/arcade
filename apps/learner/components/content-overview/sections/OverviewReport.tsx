'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/infrastructure/http/api';
import { ReportModal } from '@/shared/design-system/ui/ReportModal';
import type { OverviewContentType } from '../contentOverview.types';

const NOUN: Record<OverviewContentType, string> = { COURSE: 'course', EVENT: 'event' };

/** Report lives here — the enrolled learner's hub — rather than on the public enroll page. */
export function OverviewReport({
  contentType,
  contentId,
}: {
  contentType: OverviewContentType;
  contentId: string;
}) {
  const [open, setOpen] = useState(false);
  const noun = NOUN[contentType];

  const submit = async (note: string) => {
    await api.post('/api/v1/reports', { contentId, contentType, note });
    toast.success(`${noun.charAt(0).toUpperCase()}${noun.slice(1)} reported. Our moderation team will review it shortly.`);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface/70 px-4 py-2.5 text-[13px] font-semibold text-subtle transition-colors hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
      >
        <Flag size={14} />
        Report this {noun}
      </button>
      <ReportModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSubmit={submit}
        title={`Report ${noun.charAt(0).toUpperCase()}${noun.slice(1)}`}
        description={`Help us understand what is wrong with this ${noun}.`}
        contentType={contentType}
      />
    </>
  );
}
