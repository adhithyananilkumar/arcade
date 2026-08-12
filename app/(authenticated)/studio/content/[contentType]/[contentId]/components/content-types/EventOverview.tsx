import type { OverviewData } from "../../lib/fetchOverviewData";
import type { OverviewTab } from "../ContentOverviewNav";
import type { Metric } from "../sections/MetricsGrid";
import { MetricsGrid } from "../sections/MetricsGrid";
import { CollaboratorsSection } from "../sections/CollaboratorsSection";
import { PublishingWorkflow } from "../sections/PublishingWorkflow";
import { EmptyState } from "../sections/EmptyState";
import { editorHref } from "../../lib/contentTypeRouting";
import { AlertTriangle } from "lucide-react";

function humanizeKey(key: string): string {
  const spaced = key.replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// Analytics comes back as a loosely-typed Map<String,Object> from the backend
// (see EventParticipantController#getAnalytics) — only surface primitive
// values so we never render a raw object/array as a "metric".
function analyticsToMetrics(analytics?: Record<string, unknown>): Metric[] {
  if (!analytics) return [];
  return Object.entries(analytics)
    .filter(([, value]) => typeof value === "number" || typeof value === "string")
    .map(([key, value]) => ({ label: humanizeKey(key), value: value as string | number }));
}

export function getEventMetrics(data: OverviewData): Metric[] {
  const metrics: Metric[] = [];
  if (data.eventParticipants?.status === "ok") {
    metrics.push({ label: "Registrations", value: data.eventParticipants.data.length });
  }
  return metrics;
}

export function EventOverviewTab({
  tab,
  data,
  contentId,
  currentUserId,
  onChanged,
  onSubmit,
  submitting,
}: {
  tab: OverviewTab;
  data: OverviewData;
  contentId: string;
  currentUserId?: string | null;
  onChanged: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  if (tab === "analytics") {
    if (data.eventAnalytics?.status === "error") {
      return (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
          <AlertTriangle size={14} /> Analytics temporarily unavailable — try again shortly.
        </div>
      );
    }
    const metrics = data.eventAnalytics?.status === "ok" ? analyticsToMetrics(data.eventAnalytics.data) : [];
    if (metrics.length === 0) {
      return (
        <EmptyState
          title="No learner activity yet"
          description="Analytics will appear once learners interact with this event."
        />
      );
    }
    return <MetricsGrid metrics={metrics} />;
  }

  if (tab === "people") {
    const collaborators = data.collaborators.status === "ok" ? data.collaborators.data : undefined;
    const canManage =
      data.content?.authorId === currentUserId ||
      !!collaborators?.some((c) => c.userId === currentUserId && (c.role === "OWNER" || c.role === "MANAGER"));

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Registrations</h3>
          {data.eventParticipants?.status === "error" ? (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
              <AlertTriangle size={14} /> Registrations temporarily unavailable — try again shortly.
            </div>
          ) : !data.eventParticipants || data.eventParticipants.status === "empty" ? (
            <EmptyState title="No registrations yet" description="Registered participants will show up here once people sign up." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white/95 shadow-[0_4px_16px_rgba(20,20,43,0.04)]">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {data.eventParticipants.data.map((p) => (
                    <tr key={p.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-3 font-medium text-[#14142b]">{p.name}</td>
                      <td className="px-4 py-3 text-slate-500">{p.email}</td>
                      <td className="px-4 py-3 text-slate-500">{p.status}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {p.registrationDate ? new Date(p.registrationDate).toLocaleDateString("en-IN") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Collaborators</h3>
          <CollaboratorsSection
            segment="event"
            contentId={contentId}
            collaborators={collaborators}
            unavailable={data.collaborators.status === "error"}
            canManage={canManage}
            onChanged={onChanged}
          />
        </div>
      </div>
    );
  }

  if (tab === "publishing") {
    return (
      <PublishingWorkflow
        status={data.content?.status ?? "DRAFT"}
        review={data.review.status === "ok" ? data.review.data : null}
        editHref={editorHref("event", contentId)}
        onSubmit={onSubmit}
        submitting={submitting}
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

  return null;
}
