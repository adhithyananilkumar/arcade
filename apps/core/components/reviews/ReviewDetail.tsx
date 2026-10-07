"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  platformReviewApi,
  ReviewPolicySummary,
  ContentVersionHistory,
  ContentLifecycleTimeline,
  RollbackDialog,
  type ReviewCommentResponse,
  type ReviewEventResponse,
  type ReviewResponse,
  type CourseExamReviewDetail,
  type ContentVersionSummary,
  type LifecycleEvent,
} from "@/domains/publishing";
import {
  ChevronLeft,
  Loader2,
  X,
  Award,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  FileQuestion,
  Eye,
  Layers,
  Send,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { AssessmentReviewQuestions } from "@/domains/learning";
import { BadgeLevelSummary, credentialsApi, type BadgeAssignment } from "@/domains/credentials";

export interface ReviewDetailProps {
  reviewId: string;
  /** Where "back" goes: the Console queue, or the channel dashboard's Reviews tab. */
  backHref: string;
  backLabel?: string;
}

/**
 * One review, read and decided. Shared by the platform queue (Console → Reviews) and each
 * channel's own organization queue, so both stages review the same way. What the viewer may do is
 * the server's `actions`, never recomputed here.
 */
/**
 * Where a reviewer previews the submitted content. Only a course has a learner player route;
 * sending an exam or event there showed "Course not found" (BUG-1025). An exam previews per plan
 * from its overview's Preview tab, an event from its overview.
 */
function reviewPreviewHref(contentType: string, contentId: string): string {
  if (contentType === "EXAM") return `/studio/content/exam/${contentId}?tab=preview`;
  if (contentType === "EVENT") return `/studio/content/event/${contentId}`;
  return `/studio/published/${contentId}`;
}

export function ReviewDetail({ reviewId, backHref, backLabel = "Back to reviews" }: ReviewDetailProps) {
  const router = useRouter();

  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [timeline, setTimeline] = useState<ReviewEventResponse[]>([]);
  const [versions, setVersions] = useState<ContentVersionSummary[]>([]);
  const [lifecycle, setLifecycle] = useState<LifecycleEvent[]>([]);
  const [historyTab, setHistoryTab] = useState<"versions" | "lifecycle" | "events">("versions");
  const [rollbackTarget, setRollbackTarget] = useState<ContentVersionSummary | null>(null);
  const [rollingBack, setRollingBack] = useState(false);
  const [exams, setExams] = useState<CourseExamReviewDetail[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [inspectingExam, setInspectingExam] = useState<CourseExamReviewDetail | null>(null);
  const [examTab, setExamTab] = useState<
    "overview" | "questions" | "plans" | "placements" | "comments"
  >("overview");
  const [examComments, setExamComments] = useState<ReviewCommentResponse[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newCommentBody, setNewCommentBody] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  // The badge level the content awards — part of what is being approved.
  const [badge, setBadge] = useState<BadgeAssignment | null>(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<"approve" | "changes" | "reject" | null>(null);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!reviewId) return;
    Promise.all([
      platformReviewApi.get(reviewId),
      platformReviewApi.timeline(reviewId),
      platformReviewApi.versions(reviewId),
      platformReviewApi.lifecycle(reviewId),
    ])
      .then(([r, t, v, l]) => {
        setReview(r);
        setTimeline(t);
        setVersions(v);
        setLifecycle(l);
        if (r.contentType === "COURSE" || r.contentType === "EVENT" || r.contentType === "EXAM") {
          credentialsApi
            .getAssignment(r.contentType, r.contentId)
            .then(setBadge)
            .catch(() => setBadge(null));
          setLoadingExams(true);
          platformReviewApi
            .getExams(reviewId)
            .then((examList) => setExams(examList))
            .catch(() => setExams([]))
            .finally(() => setLoadingExams(false));
        }
      })
      .catch(() => setError("Could not load review"))
      .finally(() => setLoading(false));
  }, [reviewId, router]);

  useEffect(() => {
    if (!inspectingExam || !reviewId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingComments(true);
    platformReviewApi
      .listComments(reviewId, { targetType: "EXAM", targetId: inspectingExam.examId })
      .then((c) => setExamComments(c))
      .catch(() => setExamComments([]))
      .finally(() => setLoadingComments(false));
  }, [inspectingExam, reviewId]);

  const handlePostExamComment = async () => {
    if (!reviewId || !inspectingExam || !newCommentBody.trim()) return;
    setPostingComment(true);
    try {
      const created = await platformReviewApi.addComment(reviewId, {
        targetType: "EXAM",
        targetId: inspectingExam.examId,
        body: newCommentBody.trim(),
      });
      setExamComments((prev) => [...prev, created]);
      setNewCommentBody("");
      toast.success("Feedback posted for this assessment.");
    } catch {
      toast.error("Failed to post comment.");
    } finally {
      setPostingComment(false);
    }
  };

  const closeDialog = () => {
    if (busy) return;
    setDialog(null);
    setNote("");
    setReason("");
  };

  const submitDecision = async () => {
    if (!review || !dialog) return;
    if (dialog !== "approve" && !reason.trim()) {
      toast.error("Please provide a reason.");
      return;
    }
    if (dialog === "approve" && !note.trim()) {
      toast.error("Please provide an approval note.");
      return;
    }

    setBusy(true);
    try {
      const updated = await platformReviewApi.decide(review.id, {
        decision:
          dialog === "approve" ? "APPROVE" : dialog === "reject" ? "REJECT" : "REQUEST_CHANGES",
        note: dialog === "approve" ? note.trim() : undefined,
        reason: dialog === "approve" ? undefined : reason.trim(),
        // The version this page rendered. If the author resubmitted while the reviewer was
        // reading, the backend refuses rather than letting them approve bytes they never saw.
        expectedContentVersionId: review.contentVersionId ?? null,
      });
      setReview(updated);
      const [t, v, l] = await Promise.all([
        platformReviewApi.timeline(review.id),
        platformReviewApi.versions(review.id),
        platformReviewApi.lifecycle(review.id),
      ]);
      setTimeline(t);
      setVersions(v);
      setLifecycle(l);
      if (review.contentType === "COURSE" || review.contentType === "EVENT" || review.contentType === "EXAM") {
        setExams(await platformReviewApi.getExams(review.id));
      }
      toast.success(
        dialog === "approve"
          ? updated.policy && review.actions.approvalPublishes
            ? "Approved and published."
            : "Approved. Sent to the next review stage."
          : dialog === "reject"
            ? "Rejected."
            : "Changes requested."
      );
      closeDialog();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Decision failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-2 border-ink border-t-transparent" />
      </div>
    );
  }

  if (error || !review) {
    return <p className="text-rose-600 dark:text-rose-400">{error ?? "Not found"}</p>;
  }

  const examStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/25";
      case "SUBMITTED":
        return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/25";
      case "REJECTED":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/25";
      case "APPROVED":
        return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/25";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-[13px] font-semibold text-slate-500 hover:text-ink"
      >
        <ChevronLeft size={16} /> {backLabel}
      </Link>

      <header className="rounded-2xl border border-slate-200/80 bg-surface p-6 shadow-[0_8px_24px_rgba(20,20,43,0.05)]">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {review.contentType}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-[1.35rem] font-bold tracking-tight text-ink">
            Review &middot; Round {review.currentRound}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                review.stage === "ORG_REVIEW"
                  ? "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-200"
                  : "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-200"
              }`}
            >
              {review.stage === "ORG_REVIEW" ? "Organization review" : "Platform review"}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                review.status === "OPEN"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200"
                  : review.status === "COMPLETED"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200"
                    : review.status === "REJECTED"
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200"
                      : review.status === "CHANGES_REQUESTED"
                        ? "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-200"
                        : "bg-slate-100 text-slate-700"
              }`}
            >
              {review.status.replaceAll("_", " ")}
            </span>
          </div>
        </div>

        {/*
          The version banner. A reviewer must never have to infer which artifact they are judging —
          the old page showed only a content id, so "approve" meant "approve whatever this course
          currently is", which is exactly the ambiguity the versioned pipeline removes.
        */}
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <FileCheck size={15} className="text-slate-500" />
          <span className="text-[13px] font-bold text-ink">
            {review.versionNumber != null
              ? `Reviewing version ${review.versionNumber}`
              : "No resolvable version"}
          </span>
          <span className="font-mono text-[11px] text-slate-400">{review.contentId}</span>
        </div>

        <div className="mt-4">
          <Link
            href={reviewPreviewHref(review.contentType, review.contentId)}
            target="_blank"
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
          >
            Preview {review.contentType.toLowerCase()} content <ExternalLink size={13} />
          </Link>
        </div>

        {/*
          Actions come from the backend's ReviewActionsView. The page no longer re-derives authority
          from permission codes: that rule lived in two places and drifted, so channel reviewers saw
          an approve button on escalated reviews the API would reject.
        */}
        {review.actions.blockedReason ? (
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-[13px] font-medium text-blue-800 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-200">
            {review.actions.blockedReason}
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap gap-2">
            {review.actions.canApprove && (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setNote("");
                  setDialog("approve");
                }}
                className="rounded-full bg-ink px-4 py-2.5 text-[12px] font-semibold text-on-ink shadow-[0_6px_14px_rgba(20,20,43,0.16)] hover:bg-ink-hover disabled:opacity-50"
              >
                {review.actions.approvalPublishes ? "Approve & publish" : "Approve & send onward"}
              </button>
            )}
            {review.actions.canRequestChanges && (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setReason("");
                  setDialog("changes");
                }}
                className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2.5 text-[12px] font-semibold text-orange-700 hover:bg-orange-100 disabled:opacity-50 dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-orange-300 dark:hover:bg-orange-500/15"
              >
                Request changes
              </button>
            )}
            {review.actions.canReject && (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setReason("");
                  setDialog("reject");
                }}
                className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-[12px] font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-50 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/15"
              >
                Reject
              </button>
            )}
          </div>
        )}
      </header>

      <ReviewPolicySummary
        policy={review.policy}
        currentStage={review.stage}
        approvalPublishes={review.actions.approvalPublishes}
      />

      {badge && (
        <div className="max-w-md">
          <BadgeLevelSummary assignment={badge} />
        </div>
      )}

      {/* Associated Assessments & Exams Section */}
      {(review.contentType === "COURSE" || review.contentType === "EVENT" || review.contentType === "EXAM") && (
        <section className="rounded-2xl border border-slate-200/80 bg-surface p-6 shadow-[0_8px_24px_rgba(20,20,43,0.05)]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-[14px] font-bold text-ink flex items-center gap-2">
                <Award size={17} className="text-amber-600 dark:text-amber-400" />
                Associated Assessments & Exams
              </h2>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Exams, certifications, and graded assessments attached to this course are reviewed and locked concurrently.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
              {loadingExams ? "Loading…" : `${exams.length} attached`}
            </span>
          </div>

          {loadingExams ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-slate-400" />
            </div>
          ) : exams.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-slate-400">
              No standalone assessments or external exams associated with this course.
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-1">
              {exams.map((ex) => (
                <div
                  key={ex.examId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-colors hover:border-slate-300 hover:bg-surface"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-semibold text-ink truncate">
                        {ex.title}
                      </span>
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${examStatusBadge(
                          ex.status
                        )}`}
                      >
                        {ex.status}
                      </span>
                      {ex.plans.some((pl) => pl.proctoringRequired) && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:border-indigo-500/25 dark:bg-indigo-500/10 dark:text-indigo-300">
                          <Shield size={11} /> Proctored
                        </span>
                      )}
                      {Array.from(new Set(ex.plans.map((pl) => pl.planType))).map((t) => (
                        <span key={t} className="rounded-full border border-slate-200 bg-surface px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[12px] text-slate-500">
                      <span>{ex.bankQuestionCount} Questions in bank</span>
                      <span>
                        {ex.placements.length} Placement{ex.placements.length !== 1 ? "s" : ""}
                      </span>
                      <span>
                        {ex.plans.length} Plan{ex.plans.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <Link
                      href={`/studio/exam/${ex.examId}/edit`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-surface px-3 py-1.5 text-[12px] font-semibold text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-colors"
                    >
                      <ExternalLink size={13} />
                      Question Bank ↗
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setInspectingExam(ex);
                        setExamTab("overview");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-[12px] font-semibold text-on-ink shadow-sm hover:bg-ink-hover transition-colors"
                    >
                      <Eye size={14} />
                      Inspect Exam
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/*
        Three histories, deliberately labelled and kept apart:
          Versions  -> the immutable artifacts the pipeline governs
          Lifecycle -> what happened to the content, in plain language, version by version
          Events    -> the review case's own gapless internal sequence
        The old page showed only the third and called it "Timeline", which is why nobody could
        answer "which version was published" from the console.
      */}
      <section className="rounded-2xl border border-slate-200/80 bg-surface p-6 shadow-[0_8px_24px_rgba(20,20,43,0.05)]">
        <nav className="mb-4 flex gap-1 border-b border-slate-100" aria-label="History views">
          {(
            [
              { id: "versions", label: `Versions (${versions.length})` },
              { id: "lifecycle", label: "Status history" },
              { id: "events", label: "Review activity" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setHistoryTab(tab.id)}
              aria-current={historyTab === tab.id ? "true" : undefined}
              className={`border-b-2 px-3 pb-2 text-[12px] font-semibold transition-colors ${
                historyTab === tab.id
                  ? "border-ink text-ink"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {historyTab === "versions" && (
          <ContentVersionHistory
            versions={versions}
            selectedVersionId={review.contentVersionId ?? undefined}
            onRollback={review.actions.canApprove ? setRollbackTarget : undefined}
            rollbackDisabledReason={
              review.status === "OPEN"
                ? "Resolve the review in progress before rolling back."
                : null
            }
          />
        )}

        {historyTab === "lifecycle" && <ContentLifecycleTimeline events={lifecycle} />}

        {historyTab === "events" && (
          <ol className="space-y-3">
            {[...timeline].reverse().map((e) => (
              <li key={e.id} className="flex gap-3 text-[13px]">
                <span className="w-8 shrink-0 font-mono text-[11px] text-slate-400">
                  #{e.sequenceNumber}
                </span>
                <div>
                  <div className="font-semibold text-ink">{e.eventType}</div>
                  {e.note && <div className="text-slate-500">{e.note}</div>}
                  <div className="text-[11px] text-slate-400">
                    {new Date(e.createdAt).toLocaleString()}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {rollbackTarget ? (
        <RollbackDialog
          target={rollbackTarget}
          currentLiveVersionNumber={versions.find((v) => v.status === "PUBLISHED")?.versionNumber}
          publishesImmediately={
            !review.policy.organizationReviewRequired && !review.policy.platformReviewRequired
          }
          busy={rollingBack}
          onCancel={() => setRollbackTarget(null)}
          onConfirm={async (reason) => {
            setRollingBack(true);
            try {
              const result = await platformReviewApi.rollback(
                review.contentType,
                review.contentId,
                {
                  targetVersionId: rollbackTarget.id,
                  reason,
                  // Lets a timed-out rollback be retried without minting a second version.
                  idempotencyKey: `rollback-${review.contentId}-${rollbackTarget.id}`,
                }
              );
              toast.success(
                result.publishedDirectly
                  ? `Rolled back and published version ${result.newVersionNumber}.`
                  : `Version ${result.newVersionNumber} created and sent for review.`
              );
              setRollbackTarget(null);
              setVersions(await platformReviewApi.versions(review.id));
              setLifecycle(await platformReviewApi.lifecycle(review.id));
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Rollback failed.");
            } finally {
              setRollingBack(false);
            }
          }}
        />
      ) : null}

      {/* Decision Dialog */}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-surface shadow-[0_24px_60px_rgba(20,20,43,0.22)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-[16px] font-bold tracking-tight text-ink">
                  {dialog === "approve"
                    ? review.actions.approvalPublishes
                      ? "Approve & publish"
                      : "Approve & send onward"
                    : dialog === "reject"
                      ? "Reject submission"
                      : "Request changes"}
                </h2>
                <p className="mt-0.5 text-[12px] font-medium text-slate-500">
                  {dialog === "approve"
                    ? review.actions.approvalPublishes
                      ? `Version ${review.versionNumber ?? "?"} will be published exactly as reviewed.`
                      : `Version ${review.versionNumber ?? "?"} passes unchanged to the next review stage.`
                    : dialog === "reject"
                      ? "The submission is refused. The author must start a new submission to try again."
                      : "The author can revise and submit a new version."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                disabled={busy}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5">
              {dialog === "approve" ? (
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  placeholder="Approval notes (required)…"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-[13px] text-ink outline-none placeholder:text-slate-400 focus:border-ink/25 focus:bg-surface focus:ring-4 focus:ring-slate-200/70"
                />
              ) : (
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="Reason for requesting changes…"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-[13px] text-ink outline-none placeholder:text-slate-400 focus:border-ink/25 focus:bg-surface focus:ring-4 focus:ring-slate-200/70"
                />
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
              <button
                type="button"
                onClick={closeDialog}
                disabled={busy}
                className="rounded-full px-4 py-2 text-[12px] font-semibold text-slate-600 hover:bg-slate-200/70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitDecision}
                disabled={busy || (dialog === "changes" && !reason.trim())}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-40 ${
                  dialog === "approve"
                    ? "bg-ink hover:bg-ink-hover"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {busy && <Loader2 size={14} className="animate-spin" />}
                {dialog === "approve" ? "Publish Course & Exams" : "Request changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Exam Modal Dialog */}
      {inspectingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm">
          <div className="flex h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-surface shadow-[0_24px_60px_rgba(20,20,43,0.25)]">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-[17px] font-bold text-ink truncate">
                    {inspectingExam.title}
                  </h2>
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${examStatusBadge(
                      inspectingExam.status
                    )}`}
                  >
                    {inspectingExam.status}
                  </span>
                </div>
                <p className="mt-0.5 font-mono text-[11px] text-slate-400 truncate">
                  Exam ID: {inspectingExam.examId} · Author: {inspectingExam.authorName || "Author"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/studio/exam/${inspectingExam.examId}/edit`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-surface px-3 py-1.5 text-[12px] font-semibold text-ink hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <ExternalLink size={13} />
                  Question Bank ↗
                </Link>
                <button
                  type="button"
                  onClick={() => setInspectingExam(null)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Nav Tabs */}
            <div className="flex border-b border-slate-100 px-6 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setExamTab("overview")}
                className={`border-b-2 px-3 py-2.5 text-[13px] font-semibold transition-colors ${
                  examTab === "overview"
                    ? "border-ink text-ink"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Overview & Integrity
              </button>
              <button
                type="button"
                onClick={() => setExamTab("questions")}
                className={`border-b-2 px-3 py-2.5 text-[13px] font-semibold transition-colors flex items-center gap-1.5 ${
                  examTab === "questions"
                    ? "border-ink text-ink"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <FileQuestion size={13} />
                Questions ({inspectingExam.bankQuestionCount})
              </button>
              <button
                type="button"
                onClick={() => setExamTab("plans")}
                className={`border-b-2 px-3 py-2.5 text-[13px] font-semibold transition-colors ${
                  examTab === "plans"
                    ? "border-ink text-ink"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Delivery Plans ({inspectingExam.plans.length})
              </button>
              <button
                type="button"
                onClick={() => setExamTab("placements")}
                className={`border-b-2 px-3 py-2.5 text-[13px] font-semibold transition-colors ${
                  examTab === "placements"
                    ? "border-ink text-ink"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Placements ({inspectingExam.placements.length})
              </button>
              <button
                type="button"
                onClick={() => setExamTab("comments")}
                className={`border-b-2 px-3 py-2.5 text-[13px] font-semibold transition-colors flex items-center gap-1.5 ${
                  examTab === "comments"
                    ? "border-ink text-ink"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <MessageSquare size={13} />
                Feedback ({examComments.length})
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {examTab === "overview" && (
                <div className="space-y-6">
                  {/* One card per plan: the exam has no settings of its own, each sitting carries them. */}
                  <div>
                    <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Sittings ({inspectingExam.plans.length}) · {inspectingExam.bankQuestionCount} questions in bank
                    </h3>
                    {inspectingExam.plans.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-[13px] text-slate-400">
                        This exam has no plans yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {inspectingExam.plans.map((pl) => (
                          <div key={pl.planId} className="rounded-xl border border-slate-200/80 bg-surface p-4 shadow-sm">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[14px] font-bold text-ink">{pl.name}</span>
                              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                                {pl.planType}
                              </span>
                              {pl.planType === "ASSESSMENT" && (
                                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                                  {pl.graded ? "Graded" : "Ungraded"}
                                </span>
                              )}
                            </div>
                            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px] text-slate-600">
                              <span>Duration <b>{pl.durationMinutes} min</b></span>
                              <span>Pass <b>{pl.passPercentage}%</b></span>
                              <span>Attempts <b>{pl.maxAttempts}</b></span>
                              <span>Questions <b>{pl.totalQuestionsAsked}</b></span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-3 text-[11px]">
                              <span className="inline-flex items-center gap-1">
                                <Shield size={12} className={pl.proctoringRequired ? "text-indigo-600 dark:text-indigo-400" : "text-slate-300"} />
                                Proctoring {pl.proctoringRequired ? "on" : "off"}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <FileCheck size={12} className={pl.identityVerificationRequired ? "text-indigo-600 dark:text-indigo-400" : "text-slate-300"} />
                                Identity check {pl.identityVerificationRequired ? "on" : "off"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {examTab === "questions" && (
                <div className="space-y-4">
                  <AssessmentReviewQuestions
                    examId={inspectingExam.examId}
                    examTitle={inspectingExam.title}
                  />
                </div>
              )}

              {examTab === "plans" && (
                <div className="space-y-4">
                  {inspectingExam.plans.length === 0 ? (
                    <div className="py-8 text-center text-[13px] text-slate-400">
                      No delivery plans defined for this exam.
                    </div>
                  ) : (
                    inspectingExam.plans.map((pl) => (
                      <div
                        key={pl.planId}
                        className="rounded-xl border border-slate-200/80 bg-surface p-4 shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-bold text-ink">{pl.name}</span>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                              {pl.planType}
                            </span>
                            {pl.valid ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
                                <CheckCircle2 size={11} /> Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300">
                                <AlertCircle size={11} /> Invalid Plan
                              </span>
                            )}
                          </div>
                          <span className="text-[12px] font-semibold text-slate-500">
                            {pl.durationMinutes} mins · Pass: {pl.passPercentage}%
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-[12px] text-slate-500 border-t border-slate-100 pt-2.5">
                          <span>Questions Asked: <b>{pl.totalQuestionsAsked}</b></span>
                          <span>Sections: <b>{pl.sectionsCount}</b></span>
                          <span>Max Attempts: <b>{pl.maxAttempts}</b></span>
                          <span>Proctoring: <b>{pl.proctoringRequired ? "Required" : "None"}</b></span>
                        </div>

                        {!pl.valid && pl.validationErrors.length > 0 && (
                          <div className="rounded-lg border border-rose-200 bg-rose-50/70 p-3 text-[12px] text-rose-800 space-y-1 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-200">
                            <div className="font-semibold">Plan Validation Issues:</div>
                            <ul className="list-disc pl-4 space-y-0.5">
                              {pl.validationErrors.map((err, i) => (
                                <li key={i}>{err}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {examTab === "placements" && (
                <div className="space-y-3">
                  {inspectingExam.placements.length === 0 ? (
                    <div className="py-8 text-center text-[13px] text-slate-400">
                      No host placements assigned for this assessment.
                    </div>
                  ) : (
                    inspectingExam.placements.map((plc) => (
                      <div
                        key={plc.placementId}
                        className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-surface p-4 shadow-sm"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-ink">
                              {plc.title || "Assessment Placement"}
                            </span>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                              Host: {plc.hostType}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Location: {plc.hostTitle} (Position {plc.position})
                          </div>
                        </div>

                        <div>
                          {inspectingExam.plans.find((pl) => pl.planId === plc.planId)?.planType === "COMPLETION" ? (
                            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
                              Completes the content
                            </span>
                          ) : (
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                              Assessment
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {examTab === "comments" && (
                <div className="space-y-5">
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-3">
                    <div className="text-[12px] font-bold text-ink">
                      Add Assessment Review Feedback
                    </div>
                    <textarea
                      value={newCommentBody}
                      onChange={(e) => setNewCommentBody(e.target.value)}
                      placeholder="Comment on assessment question quality, pass marks, or proctoring settings…"
                      rows={3}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-surface p-3 text-[13px] text-ink outline-none placeholder:text-slate-400 focus:border-ink/25 focus:ring-2 focus:ring-slate-200"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={postingComment || !newCommentBody.trim()}
                        onClick={handlePostExamComment}
                        className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-[12px] font-semibold text-on-ink hover:bg-ink-hover disabled:opacity-40"
                      >
                        {postingComment ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Send size={13} />
                        )}
                        Post Comment
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Review Feedback Thread
                    </h4>
                    {loadingComments ? (
                      <div className="flex justify-center py-6">
                        <Loader2 size={18} className="animate-spin text-slate-400" />
                      </div>
                    ) : examComments.length === 0 ? (
                      <div className="py-6 text-center text-[12px] text-slate-400">
                        No feedback posted for this exam yet.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {examComments.map((cm) => (
                          <div
                            key={cm.id}
                            className="rounded-xl border border-slate-200/80 bg-surface p-3.5 space-y-1 shadow-sm"
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-ink">{cm.authorName}</span>
                              <span className="text-slate-400">
                                {new Date(cm.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-[13px] text-slate-700 whitespace-pre-wrap">
                              {cm.body}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex shrink-0 justify-end border-t border-slate-100 bg-slate-50/80 px-6 py-3">
              <button
                type="button"
                onClick={() => setInspectingExam(null)}
                className="rounded-full bg-ink px-4 py-1.5 text-[12px] font-semibold text-on-ink hover:bg-ink-hover"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

