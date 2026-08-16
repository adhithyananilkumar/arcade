import type { OverviewData } from "../../lib/fetchOverviewData";
import type { OverviewTab } from "../ContentOverviewNav";
import type { Metric } from "../sections/MetricsGrid";
import { CollaboratorsSection } from "../sections/CollaboratorsSection";
import { PublishingWorkflow } from "../sections/PublishingWorkflow";
import { editorHref } from "../../lib/contentTypeRouting";

export function getArticleMetrics(_data: OverviewData): Metric[] {
  return [];
}

export function ArticleOverviewTab({
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
  if (tab === "people") {
    const collaborators = data.collaborators.status === "ok" ? data.collaborators.data : undefined;
    const canManage =
      data.content?.authorId === currentUserId ||
      !!collaborators?.some((c) => c.userId === currentUserId && (c.role === "OWNER" || c.role === "MANAGER"));
    return (
      <CollaboratorsSection
        segment="article"
        contentId={contentId}
        collaborators={collaborators}
        unavailable={data.collaborators.status === "error"}
        canManage={canManage}
        onChanged={onChanged}
      />
    );
  }
  if (tab === "publishing") {
    return (
      <PublishingWorkflow
        status={data.content?.status ?? "DRAFT"}
        review={data.review.status === "ok" ? data.review.data : null}
        editHref={editorHref("article", contentId)}
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
