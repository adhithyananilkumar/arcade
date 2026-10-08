'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/shared/design-system/ui/dialog";
import { Button, buttonVariants } from "@/shared/design-system/ui/button";
import { CourseResponse } from "@/shared/types/api.types";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { api, ApiError } from "@/infrastructure/http/api";
import {
  CategoryField,
  DescriptionField,
  OutcomesField,
  PriceField,
  toMinor,
  type PriceValue,
} from "@/apps/creator/studio/core/ContentBasicsFields";

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
  /**
   * Persists basics the author filled in from this dialog (description, and category for events)
   * before submitting, so a missing field can be fixed here instead of on another page.
   */
  onSaveBasics?: (patch: SubmitBasicsPatch) => Promise<void>;
}

/** The fixable basics this dialog can write. `paid` and `priceAmount` (minor units) travel together. */
export interface SubmitBasicsPatch {
  description?: string;
  category?: string;
  learningOutcomes?: string;
  paid?: boolean;
  priceAmount?: number;
}

/** One problem the backend's own readiness check reported for an event. */
interface EventIssue {
  section: string;
  message: string;
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

export function ContentSubmitDialog({ course, contentType = 'course', open, onClose, onSubmit, onSaveBasics }: ContentSubmitDialogProps) {
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

  // Events: the same re-read, so "missing" reflects what is actually saved.
  const [latestEvent, setLatestEvent] = useState<{ description?: string | null; category?: string | null } | null>(null);
  const eventId = isEvent ? (course?.id as string | undefined) : undefined;
  useEffect(() => {
    if (!open || !eventId) return;
    let cancelled = false;
    api
      .get<{ description?: string | null; category?: string | null }>(`/api/v1/events/${eventId}`)
      .then((data) => {
        if (!cancelled) setLatestEvent(data);
      })
      .catch(() => {
        if (!cancelled) setLatestEvent((course as any) ?? {});
      });
    return () => {
      cancelled = true;
    };
  }, [open, eventId, course]);

  // The backend's own readiness evaluation (schedule, pricing, settings, ...). Shown as-is: the
  // server decides what "ready" means, this only displays it beside the fields fixable here.
  const [eventIssues, setEventIssues] = useState<EventIssue[]>([]);
  useEffect(() => {
    if (!open || !eventId) return;
    let cancelled = false;
    api
      .get<{ issues: EventIssue[] }>(`/api/v1/events/${eventId}/review`)
      .then((r) => {
        if (!cancelled) setEventIssues(r.issues ?? []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open, eventId]);
  // Basics that can be fixed right here are filtered out so nothing appears twice.
  const otherIssues = eventIssues.filter((i) => i.section !== 'Basic Information');

  // What the author types here for fields that are missing. Only fields that were blank when the
  // dialog opened are offered, so saved values are never silently rewritten from this form.
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [categoryDraft, setCategoryDraft] = useState("");
  const source = contentType === 'course' ? latest : latestEvent;
  const needsDescription = Boolean(onSaveBasics) && source !== null && !String(source?.description ?? '').trim();
  const [outcomesDraft, setOutcomesDraft] = useState("");
  const [priceDraft, setPriceDraft] = useState<PriceValue>({ paid: true, amount: "" });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const needsOutcomes =
    contentType === 'course' && Boolean(onSaveBasics) && latest !== null && !String(latest.learningOutcomes ?? '').trim();
  const needsPrice =
    contentType === 'course' &&
    Boolean(onSaveBasics) &&
    latest !== null &&
    latest.pricingModel === 'PAID' &&
    !((latest.priceAmount ?? 0) > 0);
  const needsCategory =
    isEvent && Boolean(onSaveBasics) && latestEvent !== null && !String(latestEvent.category ?? '').trim();

  const isChecking = contentType === 'course' ? latest === null : isEvent && eventId !== undefined && latestEvent === null;
  const checklist = contentType === 'course' && latest ? readinessFor(latest) : [];
  const unmet = checklist.filter((item) => !item.done);

  // Everything the server's submit check would reject, asked up front: an assessment plan with no
  // questions only surfaced as a failed submit before (BUG-1020). Only the problems the checklist
  // above does not already cover are listed.
  const [serverProblems, setServerProblems] = useState<string[]>([]);
  useEffect(() => {
    if (!open || contentType !== 'course' || !course?.id) return;
    let cancelled = false;
    api
      .get<string[]>(`/api/platform/content/COURSE/${course.id}/submission-problems`)
      .then((p) => {
        if (!cancelled) setServerProblems(Array.from(new Set(p ?? [])));
      })
      .catch(() => {
        if (!cancelled) setServerProblems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open, contentType, course?.id]);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Please provide a submission message.");
      return;
    }

    if (
      (needsDescription && !descriptionDraft.trim()) ||
      (needsCategory && !categoryDraft.trim()) ||
      (needsPrice && priceDraft.paid && !(Number(priceDraft.amount) > 0))
    ) {
      toast.error("Please fill in the missing details above.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (needsDescription || needsCategory || needsOutcomes || needsPrice) {
        await onSaveBasics?.({
          ...(needsDescription ? { description: descriptionDraft.trim() } : {}),
          ...(needsCategory ? { category: categoryDraft.trim() } : {}),
          // Outcomes are optional on the backend: saved only if the author wrote something.
          ...(needsOutcomes && outcomesDraft.trim() ? { learningOutcomes: outcomesDraft.trim() } : {}),
          // A paid course with no price is fixed by setting one, or by switching it to free.
          ...(needsPrice ? { paid: priceDraft.paid, priceAmount: toMinor(priceDraft) } : {}),
        });
      }
      await onSubmit({ message });
      onClose();
    } catch (error) {
      console.error(error);
      const message = error instanceof ApiError ? error.message : "Failed to submit for review.";
      // Kept in the dialog, not only in a toast that disappears, so the author can read what the
      // server said while fixing it.
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[560px]">
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
                    <p className="rounded-md border border-amber-200 bg-amber-50 p-2.5 text-xs font-medium text-amber-900 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
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

          {(needsDescription || needsCategory || needsOutcomes || needsPrice) && (
            <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-500/25 dark:bg-amber-500/10">
              <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
                Reviewers need these before they can look at this {isEvent ? 'event' : 'course'}. Fill them in here.
              </p>
              {needsDescription && (
                <DescriptionField id="submit-description" value={descriptionDraft} onChange={setDescriptionDraft} />
              )}
              {needsCategory && (
                <CategoryField id="submit-category" value={categoryDraft} onChange={setCategoryDraft} type="EVENTS" />
              )}
              {needsPrice && (
                <div className="space-y-1">
                  <PriceField id="submit-price" value={priceDraft} onChange={setPriceDraft} />
                  <p className="text-xs text-slate-500">This course is marked paid but has no price. Set one, or choose Free.</p>
                </div>
              )}
              {needsOutcomes && <OutcomesField id="submit-outcomes" value={outcomesDraft} onChange={setOutcomesDraft} />}
            </div>
          )}

          {isEvent && otherIssues.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-800">Still to do in the editor</h3>
              <ul className="space-y-2">
                {otherIssues.map((i) => (
                  <li key={i.message} className="flex items-start gap-2 text-sm text-slate-700">
                    <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-500" />
                    <span>
                      <span className="font-medium">{i.section}:</span> {i.message}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {contentType === 'course' && serverProblems.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-800">Fix before submitting</h3>
              <ul className="space-y-2">
                {serverProblems.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-slate-700">
                    <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-500" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              {course?.id && (
                <Link
                  href={`/studio/content/course/${course.id}?tab=exams`}
                  className="inline-block text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
                >
                  Open Assessment &amp; Exams →
                </Link>
              )}
            </div>
          )}

          {contentType === 'course' && !isChecking && (latest?.modules?.length ?? 0) === 0 && (
            <p className="rounded-md border border-amber-200 bg-amber-50 p-2.5 text-xs font-medium text-amber-900 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
              A course needs at least one module with a lesson before it can be submitted. Close this and add one from the
              sidebar.
            </p>
          )}

          {submitError && (
            <p role="alert" className="rounded-md border border-rose-200 bg-rose-50 p-2.5 text-xs font-medium text-rose-800 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-200">
              {submitError}
            </p>
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
