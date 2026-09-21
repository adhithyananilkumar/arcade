'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/shared/design-system/ui/dialog";
import { Button, buttonVariants } from "@/shared/design-system/ui/button";
import { CourseResponse } from "@/shared/types/api.types";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/infrastructure/http/api";

export interface ContentSubmitDialogProps {
  course?: CourseResponse | null;
  contentType?: 'course' | 'event' | 'workshop' | 'question-bank';
  open: boolean;
  onClose: () => void;
  /**
   * Pricing and cover image are no longer set here — they live on the course's own page, so
   * there is one place to set them. This only carries the reviewer message.
   */
  onSubmit: (data: { message?: string }) => Promise<void>;
}

interface ReadinessItem {
  label: string;
  done: boolean;
  hint: string;
}

/**
 * Pre-submission checklist, computed from the course as it actually stands.
 *
 * Every item reflects a real field, so an unticked row tells the author something they can go
 * and fix. A checklist that is always green tells them nothing and quietly trains them to
 * ignore it.
 */
function readinessFor(course: CourseResponse): ReadinessItem[] {
  const hasPricing =
    course.pricingModel === 'FREE' ||
    (course.pricingModel === 'PAID' && (course.priceAmount ?? 0) > 0);
  const hasOverview = Boolean(course.description?.trim());
  const hasOutcomes = Boolean(course.learningOutcomes?.trim());
  const hasContent = (course.modules?.length ?? 0) > 0;

  return [
    { label: 'Pricing is set', done: hasPricing, hint: 'Set Free, or Paid with a price above zero.' },
    { label: 'Course overview written', done: hasOverview, hint: 'Learners read this before enrolling.' },
    { label: 'Learning outcomes listed', done: hasOutcomes, hint: 'One outcome per line on the course page.' },
    { label: 'At least one module', done: hasContent, hint: 'A course with no modules has nothing to deliver.' },
  ];
}

export function ContentSubmitDialog({ course, contentType = 'course', open, onClose, onSubmit }: ContentSubmitDialogProps) {
  const isEvent = contentType === 'event' || contentType === 'workshop';
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // The `course` prop can be a stale snapshot from when the workspace loaded, so the checklist
  // re-reads the course each time the dialog opens — otherwise it could show "pricing missing"
  // to someone who set the price a minute ago.
  // `null` means the re-read is still in flight; it is only ever set from the async callback,
  // so nothing here sets state synchronously during a render or an effect.
  const [latest, setLatest] = useState<CourseResponse | null>(null);

  useEffect(() => {
    if (!open || contentType !== 'course' || !course?.id) return;
    let cancelled = false;
    api
      .get<CourseResponse>(`/api/courses/${course.id}`)
      .then((data) => {
        if (!cancelled) setLatest(data);
      })
      .catch(() => {
        // Fall back to the snapshot we were handed rather than blocking submission.
        if (!cancelled) setLatest(course ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [open, contentType, course]);

  const isChecking = contentType === 'course' && latest === null;
  const checklist = contentType === 'course' && latest ? readinessFor(latest) : [];
  const unmet = checklist.filter((item) => !item.done);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Please provide a submission message.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ message });
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit for review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Submit for review</DialogTitle>
          <DialogDescription>
            {isEvent
              ? "Your event will be sent to a reviewer."
              : "Your course will be sent to a reviewer before it goes live."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {contentType === 'course' && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-800">Before you submit</h3>

              {isChecking ? (
                <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
                  <Loader2 size={16} className="animate-spin" /> Checking your course…
                </div>
              ) : (
                <>
                  <ul className="space-y-3">
                    {checklist.map((item) => (
                      <li key={item.label} className="flex items-start gap-2 text-sm">
                        {item.done ? (
                          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                        ) : (
                          <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-500" />
                        )}
                        <span className="flex flex-col">
                          <span className={item.done ? 'text-slate-600' : 'font-medium text-slate-800'}>
                            {item.label}
                          </span>
                          {!item.done && (
                            <span className="text-xs text-slate-500">{item.hint}</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* A warning, not a block: a reviewer may still be the right person to
                      decide, and the backend owns what is actually publishable. */}
                  {unmet.length > 0 && (
                    <p className="rounded-md border border-amber-200 bg-amber-50 p-2.5 text-xs font-medium text-amber-900">
                      {unmet.length === 1
                        ? "1 item isn't ready yet."
                        : `${unmet.length} items aren't ready yet.`}{" "}
                      You can still submit, but reviewers usually send these back.
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="submit-message" className="text-sm font-semibold text-slate-800">
              Message for the reviewer
            </label>
            <textarea
              id="submit-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Anything the reviewer should know about this submission…"
              className="min-h-[90px] w-full resize-y rounded-md border border-slate-200 p-3 text-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
            />
          </div>
        </div>

        <DialogFooter className="pt-2 sm:justify-between">
          {contentType === 'course' && course?.id ? (
            <Link
              href={`/studio/content/course/${course.id}`}
              className={buttonVariants({ variant: 'outline' })}
              onClick={onClose}
            >
              Go to course page
            </Link>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Confirm & Submit"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
