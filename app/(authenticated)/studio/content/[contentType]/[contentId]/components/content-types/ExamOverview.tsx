"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { History, Link2, Loader2 } from "lucide-react";
import { listExamVersions } from "@/domains/assessments";
import type { OverviewData } from "../../lib/fetchOverviewData";
import type { OverviewTab } from "../ContentOverviewNav";
import { PublishingWorkflow } from "../sections/PublishingWorkflow";
import { editorHref } from "../../lib/contentTypeRouting";

interface ExamVersion {
  id: string;
  versionNumber: number;
  label: string | null;
  publishedAt: string;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * An exam's Publishing tab.
 *
 * <p>A standalone exam goes through Platform Review like a course or event, so it reuses the same
 * PublishingWorkflow. A tied exam has no review of its own: it is frozen and published when its
 * course or event is, and this tab says so and links there. Either way, learners are only ever
 * served a published version — later edits reach them after the next approval.
 */
export function ExamOverviewTab({
  tab,
  contentId,
  data,
  onSubmit,
  submitting,
}: {
  tab: OverviewTab;
  contentId: string;
  data: OverviewData;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const [versions, setVersions] = useState<ExamVersion[] | null>(null);

  const load = useCallback(() => {
    listExamVersions(contentId)
      .then(setVersions)
      .catch(() => setVersions([]));
  }, [contentId]);

  useEffect(() => {
    if (tab === "publishing") load();
  }, [tab, load]);

  if (tab !== "publishing") return null;

  const parentCourse = data.content?.courseId ?? null;
  const parentEvent = data.content?.eventId ?? null;
  const tied = !!(parentCourse || parentEvent);

  return (
    <div className="flex flex-col gap-4">
      {tied ? (
        <div className="flex flex-col gap-3 rounded-[24px] border-[1.5px] border-blue-400/80 bg-gradient-to-b from-blue-50/30 via-white to-white p-6 shadow-[4px_-4px_0px_0px_#BFDBFE]">
          <h3 className="text-base font-black tracking-tight text-slate-900">Publishing</h3>
          <p className="text-xs leading-relaxed text-slate-500">
            This exam is tied to a {parentCourse ? "course" : "event"}. It is submitted, reviewed and
            published together with it, and the platform&apos;s locked exam standards apply to every
            plan. Submit the {parentCourse ? "course" : "event"} to publish changes.
          </p>
          <Link
            href={parentCourse ? `/studio/content/course/${parentCourse}` : `/studio/content/event/${parentEvent}`}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-[#14142b] transition-colors hover:bg-slate-50"
          >
            <Link2 size={14} /> Open the {parentCourse ? "course" : "event"}
          </Link>
        </div>
      ) : (
        <PublishingWorkflow
          status={data.content?.status ?? "DRAFT"}
          review={data.review.status === "ok" ? data.review.data : null}
          editHref={editorHref("exam", contentId)}
          onSubmit={onSubmit}
          submitting={submitting}
          reviewPath={data.reviewPath.status === "ok" ? data.reviewPath.data : null}
          reviewPathError={
            data.reviewPath.status === "error" ? "Could not determine the review path for this exam." : null
          }
        />
      )}

      <div className="rounded-[24px] border border-slate-200 bg-white p-6">
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-500">
          <History size={13} /> Published versions
        </h4>
        <p className="mb-3 text-xs leading-relaxed text-slate-500">
          Each approval freezes the plans, their settings and the exact question versions every rule
          can draw. Attempts are generated only from the live version, so editing a question never
          changes a paper learners are given until the next approval.
        </p>
        {versions === null ? (
          <div className="flex justify-center py-6">
            <Loader2 size={16} className="animate-spin text-slate-400" />
          </div>
        ) : versions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-xs font-semibold text-slate-500">
            Not published yet.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {versions.map((version, i) => (
              <li key={version.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="text-xs font-bold text-[#14142b]">
                  v{version.versionNumber}
                  {version.label ? ` · ${version.label}` : ""}
                  {i === 0 && (
                    <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      Live
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">{formatDate(version.publishedAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
