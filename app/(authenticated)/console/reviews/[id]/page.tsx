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
import { ChevronLeft } from "lucide-react";

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reviewId = params?.id as string;
  const { user } = useAuthStore();

  if (!AuthorizationService.canReviewContent(user)) {
    notFound();
  }

  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [timeline, setTimeline] = useState<ReviewEventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reviewId) return;
    Promise.all([platformReviewApi.get(reviewId), platformReviewApi.timeline(reviewId)])
      .then(([r, t]) => {
        setReview(r);
        setTimeline(t);
        if (r.contentType === "COURSE") {
          router.replace(`/studio/published/${r.contentId}`);
        }
      })
      .catch(() => setError("Could not load review"))
      .finally(() => setLoading(false));
  }, [reviewId, router]);

  const decide = async (decision: "APPROVE" | "REQUEST_CHANGES") => {
    if (!review) return;
    let note: string | undefined;
    let reason: string | undefined;
    if (decision === "APPROVE") {
      const n = window.prompt("Approval note (optional)");
      if (n === null) return;
      note = n;
    } else {
      const r = window.prompt("Reason for requesting changes");
      if (r === null || !r.trim()) return;
      reason = r.trim();
    }
    setBusy(true);
    try {
      const updated = await platformReviewApi.decide(review.id, { decision, note, reason });
      setReview(updated);
      setTimeline(await platformReviewApi.timeline(review.id));
    } catch {
      alert("Decision failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !review) {
    return <p className="text-red-600">{error ?? "Not found"}</p>;
  }

  if (review.contentType === "COURSE") {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/console/reviews"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
      >
        <ChevronLeft size={16} /> Back to Platform Reviews
      </Link>

      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
          {review.contentType}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Review · Round {review.currentRound}</h1>
        <p className="mt-1 text-sm text-gray-500">Status: {review.status}</p>
        <p className="mt-1 text-xs text-gray-400 font-mono">{review.contentId}</p>

        {review.status === "OPEN" && (
          <div className="mt-6 flex gap-3">
            <button
              disabled={busy}
              onClick={() => decide("APPROVE")}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Approve & Publish
            </button>
            <button
              disabled={busy}
              onClick={() => decide("REQUEST_CHANGES")}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              Request Changes
            </button>
          </div>
        )}
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">Timeline</h2>
        <ol className="space-y-3">
          {timeline.map((e) => (
            <li key={e.id} className="flex gap-3 text-sm">
              <span className="w-8 shrink-0 font-mono text-xs text-gray-400">#{e.sequenceNumber}</span>
              <div>
                <div className="font-semibold text-gray-800">{e.eventType}</div>
                {e.note && <div className="text-gray-500">{e.note}</div>}
                <div className="text-[11px] text-gray-400">
                  {new Date(e.createdAt).toLocaleString()}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
