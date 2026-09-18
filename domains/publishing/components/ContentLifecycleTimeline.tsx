"use client";

import type { LifecycleEvent } from "../api/platformReview";

interface ContentLifecycleTimelineProps {
  events: LifecycleEvent[];
  loading?: boolean;
  resolveActorName?: (actorId: string | null | undefined) => string;
}

/** Human labels for the canonical lifecycle vocabulary. */
const EVENT_LABEL: Record<string, string> = {
  VERSION_CREATED: "Version created",
  SUBMITTED: "Submitted for review",
  ORG_REVIEW_STARTED: "Organization review started",
  ORG_APPROVED: "Approved by organization",
  ORG_REVIEW_BYPASSED: "Organization review bypassed",
  PLATFORM_REVIEW_STARTED: "Platform review started",
  PLATFORM_APPROVED: "Approved by platform",
  PLATFORM_REVIEW_BYPASSED: "Platform review bypassed",
  CHANGES_REQUESTED: "Changes requested",
  REJECTED: "Rejected",
  APPROVED: "Approved",
  PUBLISHED: "Published",
  UNPUBLISHED: "Unpublished",
  ROLLED_BACK: "Rolled back",
  SUPERSEDED: "Superseded",
  CANCELLED: "Cancelled",
  REVIEW_ASSIGNED: "Review assigned",
  REVIEW_UNASSIGNED: "Review unassigned",
};

const ACTOR_LABEL: Record<string, string> = {
  AUTHOR: "author",
  ORG_REVIEWER: "organization reviewer",
  PLATFORM_REVIEWER: "platform reviewer",
  CHANNEL_ADMIN: "channel administrator",
  PLATFORM_ADMIN: "platform administrator",
  SYSTEM: "system",
};

function dotColor(eventType: string): string {
  if (eventType === "PUBLISHED") return "bg-emerald-500";
  if (eventType === "REJECTED" || eventType === "CHANGES_REQUESTED") return "bg-rose-500";
  if (eventType.endsWith("BYPASSED")) return "bg-amber-500";
  if (eventType.endsWith("APPROVED")) return "bg-emerald-400";
  return "bg-slate-300";
}

/**
 * The content's lifecycle, in plain language.
 *
 * Every entry names the version it concerns. The table this replaces had no version column, so
 * "Published" told a reader that something went live but never what — which made the status
 * history and the version history two unrelated stories about the same content.
 */
export function ContentLifecycleTimeline({
  events,
  loading = false,
  resolveActorName,
}: ContentLifecycleTimelineProps) {
  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return <p className="py-8 text-center text-[13px] text-slate-400">No lifecycle activity yet.</p>;
  }

  return (
    <ol className="relative space-y-0 border-l border-slate-200 pl-5">
      {events.map((e) => (
        <li key={e.id} className="relative pb-5 last:pb-0">
          <span
            className={`absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${dotColor(e.eventType)}`}
          />
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-[13px] font-semibold text-[#14142b]">
              {EVENT_LABEL[e.eventType] ?? e.eventType}
            </span>
            {e.versionNumber != null ? (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                v{e.versionNumber}
              </span>
            ) : null}
          </div>

          <p className="mt-0.5 text-[11px] text-slate-500">
            {resolveActorName ? resolveActorName(e.actorId) : "Someone"}
            {e.actorType && ACTOR_LABEL[e.actorType] ? ` (${ACTOR_LABEL[e.actorType]})` : ""}
            {" · "}
            {new Date(e.createdAt).toLocaleString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          {e.note ? (
            <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-[12px] leading-relaxed text-slate-700">
              {e.note}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
