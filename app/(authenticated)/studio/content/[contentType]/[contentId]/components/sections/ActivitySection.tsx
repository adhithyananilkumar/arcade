"use client";

import {
  AlertTriangle,
  BookOpen,
  UserPlus,
  Video,
  Rocket,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { EmptyState } from "./EmptyState";

export interface TimelineEntry {
  id: string;
  title: string;
  actorName: string;
  createdAt: string;
  type?: string;
}

export function cleanActivityTitle(title: string): string {
  let cleaned = title;
  const prefixes = [
    "DRAFT: ",
    "SUBMITTED: ",
    "IN_REVIEW: ",
    "REJECTED: ",
    "PUBLISHED: ",
    "ARCHIVED: ",
  ];
  for (const p of prefixes) {
    if (cleaned.startsWith(p)) {
      cleaned = cleaned.slice(p.length);
    }
  }
  return cleaned.trim() || title;
}

export function getActivityTheme(type?: string, title?: string) {
  const text = `${type || ""} ${title || ""}`.toUpperCase();

  if (text.includes("PUBLISH") || text.includes("APPROV") || text.includes("COURSE")) {
    return {
      nodeBg: "bg-[#205ca8] text-white dark:bg-blue-600",
      label: "Published",
      Icon: BookOpen,
    };
  }
  if (text.includes("STAFF") || text.includes("JOINED") || text.includes("MEMBER") || text.includes("INVITE")) {
    return {
      nodeBg: "bg-indigo-600 text-white dark:bg-indigo-500",
      label: "Team",
      Icon: UserPlus,
    };
  }
  if (text.includes("WEBINAR") || text.includes("VIDEO")) {
    return {
      nodeBg: "bg-sky-600 text-white dark:bg-sky-500",
      label: "Webinar",
      Icon: Video,
    };
  }
  if (text.includes("BOOTCAMP") || text.includes("START")) {
    return {
      nodeBg: "bg-[#0B132B] text-white dark:bg-slate-700",
      label: "Cohort",
      Icon: Rocket,
    };
  }
  return {
    nodeBg: "bg-blue-600 text-white dark:bg-blue-500",
    label: "Update",
    Icon: CheckCircle2,
  };
}

export function ActivitySection({
  entries,
  unavailable,
  emptyTitle = "No activity yet",
  emptyDescription = "Changes and publishing events will appear here.",
}: {
  entries?: TimelineEntry[];
  unavailable?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  hideBadges?: boolean;
}) {
  if (unavailable) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20 px-4 py-3 text-xs font-medium text-amber-700 dark:text-amber-300">
        <AlertTriangle size={14} /> Temporarily unavailable — try again shortly.
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="relative w-full pl-10 sm:pl-12 space-y-4 my-2">
      {/* Dashed Vertical Connecting Line */}
      <div className="absolute left-[19px] sm:left-[23px] top-4 bottom-4 w-0 border-l-2 border-dashed border-slate-300 dark:border-slate-700 pointer-events-none" />

      {entries.map((entry) => {
        const theme = getActivityTheme(entry.type, entry.title);
        const IconComponent = theme.Icon;
        const titleText = cleanActivityTitle(entry.title);

        return (
          <div key={entry.id} className="relative group">
            {/* Left Circular Icon Node outside the card */}
            <div className={`absolute -left-[40px] sm:-left-[48px] top-4 flex size-9 shrink-0 items-center justify-center rounded-full ${theme.nodeBg} shadow-xs z-10 transition-transform duration-200 group-hover:scale-110`}>
              <IconComponent size={15} />
            </div>

            {/* Clean Timeline Card */}
            <div className="relative flex flex-col justify-between gap-2.5 p-4 sm:p-5 rounded-[20px] border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-md transition-all duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
              {/* Single Top Row: Title + Badge + Action By + Timestamp */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                  <h4 className="text-xs sm:text-sm font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                    {titleText}
                  </h4>
                  <span className="inline-flex items-center rounded-full border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 shrink-0">
                    {theme.label}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                    <div className="grid size-5 place-items-center rounded-full bg-[#0B132B] dark:bg-white text-white dark:text-slate-900 font-extrabold text-[9px]">
                      {entry.actorName ? entry.actorName.charAt(0).toUpperCase() : "A"}
                    </div>
                    <span className="text-[11px]">
                      Action by: <strong className="text-slate-900 dark:text-white font-bold">{entry.actorName}</strong>
                    </span>
                  </div>
                </div>

                {/* Timestamp */}
                <span className="flex items-center gap-1 text-[11px] font-mono font-semibold text-slate-400 dark:text-slate-500 shrink-0">
                  <Clock size={12} />
                  {new Date(entry.createdAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                &ldquo;{titleText}&rdquo; was updated by <span className="font-bold text-slate-800 dark:text-slate-200">{entry.actorName}</span>.
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
