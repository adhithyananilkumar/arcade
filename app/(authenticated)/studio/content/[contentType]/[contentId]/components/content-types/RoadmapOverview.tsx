import type { OverviewData } from "../../lib/fetchOverviewData";
import type { OverviewTab } from "../ContentOverviewNav";
import type { Metric } from "../sections/MetricsGrid";
import { MetricsGrid } from "../sections/MetricsGrid";
import { CollaboratorsSection } from "../sections/CollaboratorsSection";
import { ActivitySection } from "../sections/ActivitySection";
import { PublishingWorkflow } from "../sections/PublishingWorkflow";
import { EmptyState } from "../sections/EmptyState";
import { editorHref } from "../../lib/contentTypeRouting";
import { AlertTriangle } from "lucide-react";

export function getRoadmapMetrics(data: OverviewData): Metric[] {
  if (data.roadmapAnalytics?.status !== "ok") return [];
  const analytics = data.roadmapAnalytics.data;
  return [
    { label: "Total learners", value: analytics.totalLearners },
    { label: "Active learners", value: analytics.activeLearners },
    { label: "Completed", value: analytics.completedLearners },
    { label: "Completion rate", value: `${Math.round(analytics.completionRate)}%` },
  ];
}

export function RoadmapOverviewTab({
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
    if (data.roadmapAnalytics?.status === "error") {
      return (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
          <AlertTriangle size={14} /> Analytics temporarily unavailable — try again shortly.
        </div>
      );
    }
    const metrics = getRoadmapMetrics(data);
    if (metrics.length === 0) {
      return (
        <EmptyState
          title="No learner activity yet"
          description="Analytics will appear once learners interact with this roadmap."
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
      <CollaboratorsSection
        segment="roadmap"
        contentId={contentId}
        collaborators={collaborators}
        unavailable={data.collaborators.status === "error"}
        canManage={canManage}
        onChanged={onChanged}
      />
    );
  }

  if (tab === "more") {
    return (
      <ActivitySection
        unavailable={data.roadmapActivity?.status === "error"}
        entries={
          data.roadmapActivity?.status === "ok"
            ? data.roadmapActivity.data.map((entry) => ({
                id: entry.id,
                title: entry.description,
                actorName: entry.userName,
                createdAt: entry.createdAt,
              }))
            : undefined
        }
      />
    );
  }

  if (tab === "publishing") {
    return (
      <PublishingWorkflow
        status={data.content?.status ?? "DRAFT"}
        review={data.review.status === "ok" ? data.review.data : null}
        editHref={editorHref("roadmap", contentId)}
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
