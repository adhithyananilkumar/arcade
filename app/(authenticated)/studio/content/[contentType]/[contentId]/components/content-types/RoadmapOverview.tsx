import type { OverviewData } from "../../lib/fetchOverviewData";
import type { OverviewTab } from "../ContentOverviewNav";
import type { Metric } from "../sections/MetricsGrid";
import { MetricsGrid } from "../sections/MetricsGrid";
import { CollaboratorsSection } from "../sections/CollaboratorsSection";
import { ActivitySection } from "../sections/ActivitySection";

export function getRoadmapMetrics(data: OverviewData): Metric[] {
  const analytics = data.roadmapAnalytics;
  if (!analytics) return [];
  return [
    { label: "Total learners", value: analytics.totalLearners },
    { label: "Active learners", value: analytics.activeLearners },
    { label: "Completed", value: analytics.completedLearners },
    { label: "Completion rate", value: `${Math.round(analytics.completionRate)}%` },
  ];
}

export function RoadmapOverviewTab({ tab, data }: { tab: OverviewTab; data: OverviewData }) {
  if (tab === "ANALYTICS") {
    const metrics = getRoadmapMetrics(data);
    if (metrics.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 p-8 text-center text-sm text-slate-500">
          No analytics available yet.
        </div>
      );
    }
    return <MetricsGrid metrics={metrics} />;
  }

  if (tab === "COLLABORATORS") {
    return <CollaboratorsSection collaborators={data.collaborators} />;
  }

  if (tab === "ACTIVITY") {
    return (
      <ActivitySection
        emptyLabel="No activity yet."
        entries={data.roadmapActivity?.map((entry) => ({
          id: entry.id,
          title: entry.description,
          actorName: entry.userName,
          createdAt: entry.createdAt,
        }))}
      />
    );
  }

  if (tab === "PUBLISHING") {
    return (
      <ActivitySection
        emptyLabel="No publishing history yet."
        entries={data.statusHistory?.map((entry, i) => ({
          id: `${entry.createdAt}-${i}`,
          title: entry.label,
          actorName: entry.actorName,
          createdAt: entry.createdAt,
        }))}
      />
    );
  }

  return null;
}
