'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

export const REPORT_REASONS = [
  'Incorrect or misleading content',
  'Missing content',
  'Broken or inaccessible content',
  'Outdated information',
  'Inappropriate content',
  'Other',
] as const;

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (note: string) => Promise<void>;
  title?: string;
  description?: string;
  contentType?: 'COURSE' | 'LESSON' | 'EVENT';
}

export function ReportModal({
  isOpen,
  onClose,
  onSubmit,
  title = 'Report Course',
  description = 'Help us understand what is wrong with this course.',
  contentType = 'COURSE',
}: ReportModalProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [details, setDetails] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleReason = (reason: string) => {
    setValidationError('');
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  };

  const handleClose = () => {
    setSelectedReasons([]);
    setDetails('');
    setValidationError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (selectedReasons.length === 0) {
      setValidationError('Please select at least one reason for reporting.');
      return;
    }

    if (selectedReasons.includes('Other') && !details.trim()) {
      setValidationError('Please provide details for selecting "Other".');
      return;
    }

    setValidationError('');
    setIsSubmitting(true);

    try {
      let combinedNote = `Reasons:\n${selectedReasons.map((r) => `• ${r}`).join('\n')}`;
      if (details.trim()) {
        combinedNote += `\n\nDetails:\n${details.trim()}`;
      }

      await onSubmit(combinedNote);
      handleClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectionHeading = contentType === 'LESSON' ? 'What is wrong with this lesson?' : 'What is wrong with this course?';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[480px] p-6 border border-slate-200/80 dark:border-slate-800 bg-surface/98 backdrop-blur-2xl shadow-2xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Section 1: Report Reasons */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">
              {sectionHeading}
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((reason) => {
                const isSelected = selectedReasons.includes(reason);
                return (
                  <button
                    type="button"
                    key={reason}
                    onClick={() => toggleReason(reason)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-xs'
                        : 'border-slate-200/90 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid size-4 shrink-0 place-items-center rounded-md border transition-all ${
                          isSelected
                            ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-600 dark:bg-indigo-500 text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-surface'
                        }`}
                      >
                        {isSelected && <Check size={11} strokeWidth={3} />}
                      </div>
                      <span>{reason}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            {validationError && (
              <p className="mt-2 text-xs font-semibold text-red-600 flex items-center gap-1 dark:text-red-400">
                <span>⚠️</span> {validationError}
              </p>
            )}
          </div>

          {/* Section 2: Additional Details */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Additional details
            </label>
            <textarea
              className="min-h-[95px] w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/50 p-3 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all resize-y"
              placeholder="Tell us more about the issue..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-4 flex items-center justify-end gap-2 border-t border-slate-200/70 dark:border-slate-800/70 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-xl bg-ink px-5 py-2 text-xs font-semibold text-on-ink shadow-sm hover:bg-ink-hover active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
