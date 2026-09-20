"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, UploadCloud, History, Pencil } from "lucide-react";
import { toast } from "sonner";
import { listExamVersions, publishExam } from "@/domains/assessments";
import type { OverviewTab } from "../ContentOverviewNav";
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
 * Exams are not review-gated: publishing cuts an immutable ExamVersion directly (see
 * ExamPublishService). This deliberately does NOT reuse PublishingWorkflow, which is built
 * around the Platform Review round an exam never enters.
 */
export function ExamOverviewTab({ tab, contentId }: { tab: OverviewTab; contentId: string }) {
  const [versions, setVersions] = useState<ExamVersion[] | null>(null);
  const [publishing, setPublishing] = useState(false);

  const load = useCallback(() => {
    listExamVersions(contentId)
      .then(setVersions)
      .catch(() => setVersions([]));
  }, [contentId]);

  useEffect(() => {
    if (tab === "publishing") load();
  }, [tab, load]);

  if (tab !== "publishing") return null;

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await publishExam(contentId);
      toast.success("Exam published");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not publish this exam");
    } finally {
      setPublishing(false);
    }
  };

  const current = versions?.[0] ?? null;

  return (
    <div className="flex flex-col gap-4 rounded-[24px] border-[1.5px] border-blue-400/80 bg-gradient-to-b from-blue-50/30 via-white to-white p-6 shadow-[4px_-4px_0px_0px_#BFDBFE]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black tracking-tight text-slate-900">Publishing</h3>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {current
              ? `Live version v${current.versionNumber}, published ${formatDate(current.publishedAt)}.`
              : "Not published yet. Learners can't start this exam until it has a published version."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={editorHref("exam", contentId)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-[#14142b] transition-colors hover:bg-slate-50"
          >
            <Pencil size={14} /> Edit questions
          </Link>
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-extrabold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
          >
            {publishing ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
            Publish
          </button>
        </div>
      </div>

      <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
        Publishing snapshots this exam and its plans into a new version. Learners
        already sitting the exam stay pinned to the version they started — editing afterwards never
        changes a paper someone has already been given.
      </p>

      <div>
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-500">
          <History size={13} /> Published versions
        </h4>
        {versions === null ? (
          <div className="flex justify-center py-6">
            <Loader2 size={16} className="animate-spin text-slate-400" />
          </div>
        ) : versions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-xs font-semibold text-slate-500">
            No versions yet.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {versions.map((version) => (
              <li key={version.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="text-xs font-bold text-[#14142b]">
                  v{version.versionNumber}
                  {version.label ? ` · ${version.label}` : ""}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {formatDate(version.publishedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
