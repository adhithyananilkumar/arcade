"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Link2 } from "lucide-react";
import { listExamVersions } from "@/domains/assessments";
import {
  WorkspaceLoading,
  WorkspaceRow,
  WorkspaceRows,
  workspaceSecondaryButton,
} from "@/apps/creator/studio/core/StudioWorkspaceKit";
import type { OverviewData } from "../../lib/fetchOverviewData";
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
  contentId,
  data,
  onSubmit,
  submitting,
}: {
  contentId: string;
  data: OverviewData;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const [versions, setVersions] = useState<ExamVersion[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    listExamVersions(contentId)
      .then((list) => !cancelled && setVersions(list))
      .catch(() => !cancelled && setVersions([]));
    return () => {
      cancelled = true;
    };
  }, [contentId]);

  const parentCourse = data.content?.courseId ?? null;
  const parentEvent = data.content?.eventId ?? null;
  const tied = !!(parentCourse || parentEvent);
  const parentNoun = parentCourse ? "course" : "event";

  return (
    <div className="flex flex-col gap-10">
      {tied ? (
        <WorkspaceRows>
          <WorkspaceRow
            step={1}
            title="Published with its parent"
            description={`This exam is tied to a ${parentNoun}. It is submitted, reviewed and published together with it, and the platform's locked exam standards apply to every plan. Submit the ${parentNoun} to publish changes.`}
          >
            <div>
              <Link href={parentCourse ? `/studio/content/course/${parentCourse}?tab=publishing` : `/studio/content/event/${parentEvent}?tab=publishing`} className={workspaceSecondaryButton}>
                <Link2 size={14} /> Open the {parentNoun}&apos;s publishing
              </Link>
            </div>
          </WorkspaceRow>
        </WorkspaceRows>
      ) : (
        <PublishingWorkflow
          status={data.content?.status ?? "DRAFT"}
          review={data.review.status === "ok" ? data.review.data : null}
          editHref={editorHref("exam", contentId)}
          onSubmit={onSubmit}
          submitting={submitting}
          reviewPath={data.reviewPath.status === "ok" ? data.reviewPath.data : null}
          reviewPathError={data.reviewPath.status === "error" ? "Could not determine the review path for this exam." : null}
        />
      )}

      <WorkspaceRows>
        <WorkspaceRow
          step={tied ? 2 : 4 /* after the workflow's three rows */}
          title="Published versions"
          description="Each approval freezes the plans, their settings and the exact question versions every rule can draw. Attempts come only from the live version, so editing a question never changes a paper learners are given until the next approval."
        >
          {versions === null ? (
            <WorkspaceLoading />
          ) : versions.length === 0 ? (
            <p className="text-sm font-bold text-slate-500">Not published yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {versions.map((version, i) => (
                <li key={version.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                  <span className="text-sm font-bold text-ink">
                    v{version.versionNumber}
                    {version.label ? ` · ${version.label}` : ""}
                    {i === 0 && (
                      <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                        Live
                      </span>
                    )}
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-slate-400">{formatDate(version.publishedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </WorkspaceRow>
      </WorkspaceRows>
    </div>
  );
}
