"use client";

import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  DollarSign,
  FileText,
  LayoutGrid,
  Send,
  Settings,
  Tag,
  UserCog,
  Users,
} from "lucide-react";
import { ContentArt } from "@/shared/design-system/art";
import { SchedulePanel } from "@/domains/publishing";
import { BadgeTierPanel } from "@/apps/creator/studio/credentials/BadgeTierPanel";
import {
  WorkspaceMessage,
  WorkspaceRow,
  WorkspaceRows,
  WorkspaceStat,
  type WorkspaceTab,
} from "@/apps/creator/studio/core/StudioWorkspaceKit";
import type { OverviewData } from "../../lib/fetchOverviewData";
import type { OverviewTab } from "../ContentOverviewNav";
import type { Metric } from "../sections/MetricsGrid";
import { MetricsGrid } from "../sections/MetricsGrid";
import { EventPricingSection } from "../sections/EventPricingSection";
import { EventSettingsSection } from "../sections/EventSettingsSection";
import { RegisteredMembersSection } from "../sections/RegisteredMembersSection";
import { ContentAssessmentsSection } from "../sections/ContentAssessmentsSection";
import { EventCollaboratorsManager } from "@/app/(authenticated)/studio/events/components/wizard/review/EventCollaboratorsManager";
import { PublishingWorkflow } from "../sections/PublishingWorkflow";
import { editorHref } from "../../lib/contentTypeRouting";

export const EVENT_TABS: WorkspaceTab<OverviewTab>[] = [
  { id: "OVERVIEW", label: "Overview", icon: LayoutGrid },
  { id: "exams", label: "Assessment & Exams", icon: FileText },
  { id: "pricing", label: "Pricing", icon: Tag },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "participants", label: "Manage Members", icon: Users, secondary: true },
  { id: "collaborators", label: "Collaborators", icon: UserCog, secondary: true },
  { id: "analytics", label: "Analytics", icon: BarChart3, secondary: true },
  { id: "publishing", label: "Publishing", icon: Send, secondary: true },
];

function humanizeKey(key: string): string {
  const spaced = key.replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Analytics keys that carry money, in minor units. */
const MONEY_KEYS = new Set(["totalRevenue", "pendingRevenue", "refundedRevenue", "netRevenue", "platformCommission", "organizerEarnings"]);

function analyticsToMetrics(analytics?: Record<string, unknown>): Metric[] {
  if (!analytics) return [];
  const currency = (analytics.currency as string) || "INR";
  return Object.entries(analytics)
    .filter(([, value]) => typeof value === "number" || typeof value === "string")
    .map(([key, value]) => ({
      label: humanizeKey(key),
      value:
        MONEY_KEYS.has(key) && typeof value === "number"
          ? new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(value / 100)
          : (value as string | number),
    }));
}

export function getEventMetrics(data: OverviewData): Metric[] {
  const count = data.eventParticipants?.status === "ok" ? data.eventParticipants.data.length : 0;
  return [
    { label: "Registrations", value: count, sublabel: "Confirmed attendees" },
    {
      label: "Capacity Limit",
      value: data.eventDetails?.status === "ok" && data.eventDetails.data.capacity ? String(data.eventDetails.data.capacity) : "Unlimited",
      sublabel: "Max seats",
    },
    { label: "Delivery", value: data.eventDetails?.status === "ok" ? data.eventDetails.data.deliveryMode || "Online" : "Online", sublabel: "Format" },
    { label: "Status", value: data.content?.status || "DRAFT", sublabel: "Lifecycle" },
  ];
}

const LANGUAGE_CODE: Record<string, string> = { english: "EN", spanish: "ES", french: "FR", german: "DE", hindi: "HI", japanese: "JA" };
const formatLanguage = (lang?: string | null) => {
  if (!lang) return "EN";
  const l = lang.trim().toLowerCase();
  return LANGUAGE_CODE[l] ?? l.substring(0, 2).toUpperCase();
};
const titleCase = (v?: string | null) => (v ? v.charAt(0) + v.slice(1).toLowerCase().replace(/_/g, " ") : "—");

function DetailChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <span className="text-sm font-bold text-ink">{value}</span>
    </div>
  );
}

const when = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso));

export function EventOverviewTab({
  tab,
  data,
  contentId,
  onChanged,
  onSubmit,
  submitting,
  onSelectTab,
}: {
  tab: OverviewTab;
  data: OverviewData;
  contentId: string;
  currentUserId?: string | null;
  onChanged: () => void;
  onSubmit: () => void;
  submitting: boolean;
  onSelectTab?: (tab: OverviewTab) => void;
}) {
  const eventSummary = data.eventSummary?.status === "ok" ? data.eventSummary.data : null;
  const eventDetails = data.eventDetails?.status === "ok" ? data.eventDetails.data : null;
  const content = data.content;
  const participantCount = data.eventParticipants?.status === "ok" ? data.eventParticipants.data.length : 0;

  if (tab === "exams") return <ContentAssessmentsSection segment="event" contentId={contentId} />;

  if (tab === "pricing") {
    return <EventPricingSection eventId={contentId} eventDetails={data.eventDetails} participantCount={participantCount} onChanged={onChanged} />;
  }

  if (tab === "settings") {
    return (
      <div className="flex flex-col gap-10">
        <EventSettingsSection eventId={contentId} initialEvent={eventDetails} onChanged={onChanged} />
        <WorkspaceRows>
          <WorkspaceRow step={8} title="Schedule" description="When learners can register for this event, and when registered learners can access it." wide>
            <SchedulePanel contentType="EVENT" contentId={contentId} enrollmentNoun="Registration" bare />
          </WorkspaceRow>
          <WorkspaceRow step={9} title="Completion badge" description="The recognition participants receive after completing this event." wide>
            <BadgeTierPanel contentType="EVENT" contentId={contentId} bare />
          </WorkspaceRow>
        </WorkspaceRows>
      </div>
    );
  }

  if (tab === "participants" || tab === "people") {
    return <RegisteredMembersSection eventId={contentId} participantsResult={data.eventParticipants} onChanged={onChanged} />;
  }

  if (tab === "collaborators") return <EventCollaboratorsManager eventId={contentId} layout="rows" />;

  if (tab === "publishing") {
    return (
      <PublishingWorkflow
        status={content?.status ?? "DRAFT"}
        review={data.review.status === "ok" ? data.review.data : null}
        editHref={editorHref("event", contentId)}
        onSubmit={onSubmit}
        submitting={submitting}
        reviewPath={data.reviewPath.status === "ok" ? data.reviewPath.data : null}
        reviewPathError={data.reviewPath.status === "error" ? "Could not determine the review path for this content." : null}
        historyEntries={
          data.statusHistory.status === "ok"
            ? data.statusHistory.data.map((entry, i) => ({
                id: `${entry.createdAt}-${i}`,
                title: entry.label,
                actorName: entry.actorName,
                createdAt: entry.createdAt,
              }))
            : undefined
        }
      />
    );
  }

  if (tab === "analytics") {
    if (data.eventAnalytics?.status === "error") {
      return (
        <WorkspaceMessage icon={AlertTriangle} tone="warning" title="Analytics temporarily unavailable">
          Try again shortly.
        </WorkspaceMessage>
      );
    }
    const metrics = data.eventAnalytics?.status === "ok" ? analyticsToMetrics(data.eventAnalytics.data) : [];
    if (metrics.length === 0) {
      return (
        <WorkspaceMessage icon={BarChart3} title="No learner activity yet">
          Analytics will appear once learners interact with this event.
        </WorkspaceMessage>
      );
    }
    return <MetricsGrid metrics={metrics} />;
  }

  // ── Overview ──────────────────────────────────────────────────────────────
  const sessionsCount = eventSummary?.sessionsCount ?? 0;
  const resourcesCount = eventSummary?.resourcesCount ?? 0;
  // Analytics amounts are minor units (paise).
  const analytics = data.eventAnalytics?.status === "ok" ? data.eventAnalytics.data : null;
  const revenue = ((analytics?.totalRevenue as number) || 0) / 100;
  const earnings = analytics?.organizerEarnings == null ? null : (analytics.organizerEarnings as number) / 100;
  const commission = ((analytics?.platformCommission as number) || 0) / 100;
  const currency = (analytics?.currency as string) || eventDetails?.currency || "INR";
  const money = (major: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(major);

  const readiness = data.eventReadiness?.status === "ok" ? data.eventReadiness.data : null;
  const completionPct = eventSummary?.completionPercentage ?? readiness?.completionPercentage ?? 0;
  const editor = editorHref("event", contentId);

  const checklist: { name: string; complete: boolean; href?: string; tab?: OverviewTab }[] = [
    { name: "Schedule & sessions", complete: eventSummary?.scheduleComplete ?? sessionsCount > 0, href: editor },
    { name: "Pricing & capacity", complete: eventSummary?.pricingComplete ?? true, tab: "pricing" },
    { name: "Resources & folders", complete: eventSummary?.resourcesComplete ?? true, href: editor },
    { name: "Event settings", complete: eventSummary?.settingsComplete ?? true, tab: "settings" },
    { name: "Review & publish", complete: content?.status === "PUBLISHED", tab: "publishing" },
  ];

  const activity =
    eventSummary?.recentActivity && eventSummary.recentActivity.length > 0
      ? eventSummary.recentActivity.slice(0, 5).map((log) => ({ title: log.action, sub: log.description, at: log.timestamp }))
      : data.statusHistory?.status === "ok"
        ? data.statusHistory.data.slice(0, 5).map((e) => ({ title: e.label, sub: e.actorName ? `by ${e.actorName}` : null, at: e.createdAt }))
        : [];

  return (
    <div className="flex flex-col gap-10">
      {/* Generated, category-themed artwork — uploaded covers were removed platform-wide */}
      <div className="relative h-48 w-full overflow-hidden rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgba(20,20,43,0.06)] sm:h-64">
        <ContentArt seed={contentId} kind="EVENT" category={eventDetails?.category} title={content?.title} />
      </div>

      <WorkspaceRows>
        <WorkspaceRow step={1} title="At a glance" description="Live figures for this event." wide>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <WorkspaceStat icon={Calendar} label="Sessions" value={sessionsCount} />
            <WorkspaceStat icon={FileText} label="Resources" value={resourcesCount} />
            <WorkspaceStat icon={Users} label="Registrations" value={participantCount} />
            <WorkspaceStat
              icon={DollarSign}
              label="Revenue"
              value={money(revenue)}
              hint={
                earnings != null && revenue > 0
                  ? `You earn ${money(earnings)} after refunds${commission > 0 ? ` and ${money(commission)} commission` : ""}`
                  : "Gross ticket sales"
              }
            />
          </div>
        </WorkspaceRow>

        <WorkspaceRow
          step={2}
          title="Event details"
          description="How the event is listed."
          aside={
            <button type="button" onClick={() => onSelectTab?.("settings")} className="cursor-pointer text-xs font-bold text-[#205ca8] hover:underline dark:text-blue-400">
              Edit in Settings →
            </button>
          }
        >
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            <DetailChip label="Visibility" value={titleCase(eventDetails?.visibility ?? "PUBLIC")} />
            <DetailChip label="Delivery" value={titleCase(eventDetails?.deliveryMode ?? "ONLINE")} />
            <DetailChip label="Language" value={formatLanguage(eventDetails?.language)} />
            <DetailChip label="Type" value={titleCase(eventDetails?.eventType ?? "WORKSHOP")} />
          </div>
        </WorkspaceRow>

        <WorkspaceRow
          step={3}
          title="Setup"
          description="What is left before this event can go out for review."
          aside={<span className="text-sm font-extrabold text-[#205ca8] dark:text-blue-400">{completionPct}% ready</span>}
        >
          <div className="flex flex-col gap-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-blue-600 transition-all duration-700" style={{ width: `${completionPct}%` }} />
            </div>
            {readiness && readiness.issues.length > 0 && (
              <ul className="flex flex-col gap-2">
                {readiness.issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <AlertCircle size={14} className="mt-0.5 shrink-0 text-amber-500" />
                    <span>
                      <strong className="font-bold text-slate-800">{issue.section}:</strong> {issue.issue}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <ul className="divide-y divide-slate-100">
              {checklist.map((item) => {
                const inner = (
                  <>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-[#205ca8] dark:group-hover:text-blue-400">{item.name}</span>
                    {item.complete ? (
                      <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
                    ) : (
                      <ArrowRight size={14} className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-1" />
                    )}
                  </>
                );
                const cls = "group flex w-full cursor-pointer items-center justify-between py-3 text-left";
                return (
                  <li key={item.name}>
                    {item.tab ? (
                      <button type="button" onClick={() => onSelectTab?.(item.tab!)} className={cls}>
                        {inner}
                      </button>
                    ) : (
                      <Link href={item.href!} className={cls}>
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </WorkspaceRow>

        <WorkspaceRow step={4} title="Recent activity" description="The latest changes to this event.">
          {activity.length === 0 ? (
            <p className="text-xs font-medium text-slate-400">No activity recorded yet.</p>
          ) : (
            <ol className="relative ml-1.5 space-y-5 border-l-2 border-slate-100">
              {activity.map((item, idx) => (
                <li key={idx} className="relative pl-5">
                  <span className="absolute -left-[5px] mt-1 size-2 rounded-full bg-blue-600 ring-4 ring-surface" />
                  <p className="text-xs font-bold leading-snug text-slate-900">{item.title}</p>
                  {item.sub && <p className="mt-0.5 text-[11px] text-slate-500">{item.sub}</p>}
                  <p className="mt-1 text-[10px] font-semibold text-slate-400">{when(item.at)}</p>
                </li>
              ))}
            </ol>
          )}
        </WorkspaceRow>
      </WorkspaceRows>
    </div>
  );
}
