import type { OverviewData } from "../../lib/fetchOverviewData";
import type { OverviewTab } from "../ContentOverviewNav";
import type { Metric } from "../sections/MetricsGrid";
import { CollaboratorsSection } from "../sections/CollaboratorsSection";
import { ActivitySection } from "../sections/ActivitySection";

// Course has no analytics/registrations endpoint today (see capabilities.ts) —
// getMetrics intentionally returns [] rather than fabricating numbers.
export function getCourseMetrics(_data: OverviewData): Metric[] {
  return [];
}

export function CourseOverviewTab({ tab, data }: { tab: OverviewTab; data: OverviewData }) {
  if (tab === "COLLABORATORS") {
    return <CollaboratorsSection collaborators={data.collaborators} />;
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
