"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/infrastructure/auth/auth.store";
import { AuthorizationService } from "@/infrastructure/auth/authorization.service";
import {
  platformReviewApi,
  type ReviewEventResponse,
  type ReviewResponse,
} from "@/domains/publishing";
import { ChevronLeft, Loader2, X } from "lucide-react";
import { toast } from "sonner";

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reviewId = params?.id as string;
  const { user } = useAuthStore();

  // We removed the early notFound() check because channel-level permissions
  // aren't in the global user token. The backend will enforce access via 403.

  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [timeline, setTimeline] = useState<ReviewEventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<"approve" | "changes" | null>(null);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!reviewId) return;
    Promise.all([platformReviewApi.get(reviewId), platformReviewApi.timeline(reviewId)])
      .then(([r, t]) => {
        setReview(r);
        setTimeline(t);
        if (r.contentType === "COURSE") {
          // Do not redirect so the user can see the review page and buttons.
          // They can preview the course using a 'Preview' link instead.
        }
      })
      .catch(() => setError("Could not load review"))
      .finally(() => setLoading(false));
  }, [reviewId, router]);

  const closeDialog = () => {
    if (busy) return;
    setDialog(null);
    setNote("");
    setReason("");
  };

  const submitDecision = async () => {
    if (!review || !dialog) return;
    if (dialog === "changes" && !reason.trim()) {
      toast.error("Please provide a reason for requesting changes.");
      return;
    }
    if (dialog === "approve" && !note.trim()) {
      toast.error("Please provide an approval note.");
      return;
    }

    setBusy(true);
    try {
      const updated = await platformReviewApi.decide(review.id, {
        decision: dialog === "approve" ? "APPROVE" : "REQUEST_CHANGES",
        note: dialog === "approve" ? note.trim() : undefined,
        reason: dialog === "changes" ? reason.trim() : undefined,
      });
      setReview(updated);
      setTimeline(await platformReviewApi.timeline(review.id));
      toast.success(dialog === "approve" ? "Approved" : "Changes requested");
      closeDialog();
    } catch {
      toast.error("Decision failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-2 border-[#14142b] border-t-transparent" />
      </div>
    );
  }

  if (error || !review) {
    return <p className="text-rose-600">{error ?? "Not found"}</p>;
  }

  // Removed check that returned null for COURSE so we render the review page

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/console/reviews"
        className="inline-flex items-center gap-1 text-[13px] font-semibold text-slate-500 hover:text-[#14142b]"
      >
        <ChevronLeft size={16} /> Back to reviews
      </Link>

      <header className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_24px_rgba(20,20,43,0.05)]">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {review.contentType}
        </div>
        {(() => {
          const role = review.tier === 'GLOBAL' ? 'Superuser' : 'Org Head';
          let text: string = review.status;
          let colorClass = 'bg-slate-100 text-slate-800';
          if ((review.status as string) === 'OPEN') {
            text = `Pending by ${role}`;
            colorClass = 'bg-amber-100 text-amber-800';
          } else if ((review.status as string) === 'APPROVED') {
            text = `Approved by ${role}`;
            colorClass = 'bg-emerald-100 text-emerald-800';
          } else if ((review.status as string) === 'CHANGES_REQUESTED') {
            text = `Rejected by ${role}`;
            colorClass = 'bg-rose-100 text-rose-800';
          }

          return (
            <div className="flex items-center justify-between">
              <h1 className="text-[1.35rem] font-bold tracking-tight text-[#14142b]">
                Review · Round {review.currentRound}
              </h1>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${colorClass}`}>
                {text}
              </span>
            </div>
          );
        })()}
        <p className="mt-1 font-mono text-[11px] text-slate-400">{review.contentId}</p>

        <div className="mt-4">
          <Link
            href={`/studio/published/${review.contentId}`}
            target="_blank"
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Preview {review.contentType.toLowerCase()} content ↗
          </Link>
        </div>

        {review.status === "OPEN" && (
          review.tier === 'GLOBAL' && (!user || !AuthorizationService.hasPermission(user, 'platform.review.manage')) ? (
            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-[13px] font-medium text-blue-800">
              Course approved at Org level and sent for Superuser review.
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setNote("");
                  setDialog("approve");
                }}
                className="rounded-full bg-[#14142b] px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_6px_14px_rgba(20,20,43,0.16)] hover:bg-[#232735] disabled:opacity-50"
              >
                {review.tier === 'ORG' ? 'Approve' : 'Approve & Publish'}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setReason("");
                  setDialog("changes");
                }}
                className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-[12px] font-semibold text-rose-600 hover:bg-rose-100 disabled:opacity-50"
              >
                {review.tier === 'ORG' ? 'Reject' : 'Request Changes'}
              </button>
            </div>
          )
        )}
      </header>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_24px_rgba(20,20,43,0.05)]">
        <h2 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Timeline
        </h2>
        <ol className="space-y-3">
          {[...timeline].reverse().map((e) => (
            <li key={e.id} className="flex gap-3 text-[13px]">
              <span className="w-8 shrink-0 font-mono text-[11px] text-slate-400">
                #{e.sequenceNumber}
              </span>
              <div>
                <div className="font-semibold text-[#14142b]">{e.eventType}</div>
                {e.note && <div className="text-slate-500">{e.note}</div>}
                <div className="text-[11px] text-slate-400">
                  {new Date(e.createdAt).toLocaleString()}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#14142b]/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_24px_60px_rgba(20,20,43,0.22)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-[16px] font-bold tracking-tight text-[#14142b]">
                  {dialog === "approve" ? "Approve & publish" : "Request changes"}
                </h2>
                <p className="mt-0.5 text-[12px] font-medium text-slate-500">
                  {dialog === "approve"
                    ? "Required note for the audit log."
                    : "Tell the author what needs to change."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                disabled={busy}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#14142b]"
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
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-[13px] text-[#14142b] outline-none placeholder:text-slate-400 focus:border-[#14142b]/25 focus:bg-white focus:ring-4 focus:ring-slate-200/70"
                />
              ) : (
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="Reason for requesting changes…"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-[13px] text-[#14142b] outline-none placeholder:text-slate-400 focus:border-[#14142b]/25 focus:bg-white focus:ring-4 focus:ring-slate-200/70"
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
                    ? "bg-[#14142b] hover:bg-[#232735]"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {busy && <Loader2 size={14} className="animate-spin" />}
                {dialog === "approve" ? "Publish" : "Request changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
