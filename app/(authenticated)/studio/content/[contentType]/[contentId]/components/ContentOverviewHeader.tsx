import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import type { ContentTypeSegment } from "../lib/contentTypeRouting";
import { CONTENT_TYPE_LABEL, editorHref } from "../lib/contentTypeRouting";

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-amber-50 text-amber-700 border-amber-200",
  SUBMITTED: "bg-orange-50 text-orange-700 border-orange-200",
  PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ARCHIVED: "bg-slate-100 text-slate-500 border-slate-200",
};

function StatusPill({ status }: { status: string }) {
  const key = status?.toUpperCase() ?? "";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
        STATUS_STYLE[key] ?? "bg-slate-100 text-slate-500 border-slate-200"
      }`}
    >
      {key || "UNKNOWN"}
    </span>
  );
}

export function ContentOverviewHeader({
  segment,
  title,
  status,
  channelName,
  authorName,
  contentId,
  channelSuspended,
}: {
  segment: ContentTypeSegment;
  title: string;
  status: string;
  channelName?: string | null;
  authorName?: string | null;
  contentId: string;
  channelSuspended?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/studio"
        className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-[#14142b]"
      >
        <ArrowLeft size={14} /> Content Studio
      </Link>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#14142b] sm:text-2xl">{title}</h1>
            <StatusPill status={status} />
          </div>
          <p className="text-xs font-medium text-slate-500">
            {CONTENT_TYPE_LABEL[segment]}
            {channelName ? ` · ${channelName}` : ""}
            {authorName ? ` · ${authorName}` : ""}
          </p>
        </div>

        {channelSuspended ? (
          <span
            className="inline-flex w-fit cursor-not-allowed items-center gap-2 rounded-lg bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-400"
            title="This channel is suspended — editing is disabled until it's reactivated"
          >
            Editing Disabled
          </span>
        ) : (
          <Link
            href={editorHref(segment, contentId)}
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#14142b] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#232735]"
          >
            <Pencil size={14} /> Edit Content
          </Link>
        )}
      </div>
    </div>
  );
}
