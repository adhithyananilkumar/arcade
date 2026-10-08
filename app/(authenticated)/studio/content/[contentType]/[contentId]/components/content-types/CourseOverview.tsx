import { BookOpen, FileText, Send, Settings, Tag, Users } from "lucide-react";
import type { WorkspaceTab } from "@/apps/creator/studio/core/StudioWorkspaceKit";
import type { OverviewData } from "../../lib/fetchOverviewData";
import type { Metric } from "../sections/MetricsGrid";
import { PublishingWorkflow } from "../sections/PublishingWorkflow";
import { LearnersAnalyticsSection } from "../sections/LearnersAnalyticsSection";
import { ContentAssessmentsSection } from "../sections/ContentAssessmentsSection";
import { CourseCategoryEditor, CourseOverviewEditor, CourseSettingsTab } from "../sections/course/CourseEditors";
import { editorHref } from "../../lib/contentTypeRouting";

export type CourseTab = "overview" | "insights" | "exams" | "category" | "settings" | "publishing";

export const COURSE_TABS: WorkspaceTab<CourseTab>[] = [
  { id: "overview", label: "Overview & Outcomes", icon: BookOpen },
  { id: "insights", label: "Course Insights", icon: Users },
  { id: "exams", label: "Assessment & Exams", icon: FileText },
  { id: "category", label: "Category", icon: Tag },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "publishing", label: "Publishing", icon: Send },
];

export function getCourseMetrics(_data: OverviewData): Metric[] {
  return [
    { label: "Enrolled Learners", value: "1,240", sublabel: "Active students" },
    { label: "Completion Rate", value: "88%", sublabel: "Course finishers" },
    { label: "Average Rating", value: "4.9 ★", sublabel: "From 182 reviews" },
    { label: "Certificates Claims", value: "342", sublabel: "Issued credentials" },
  ];
}

export function CourseOverviewTab({
  tab,
  data,
  contentId,
  currentUserId,
  onChanged,
  onSubmit,
  submitting,
}: {
  tab: CourseTab;
  data: OverviewData;
  contentId: string;
  currentUserId?: string | null;
  onChanged: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const collaborators = data.collaborators.status === "ok" ? data.collaborators.data : undefined;
  // Hide the invite button only from someone who is on the roster as an EDITOR; the author and
  // channel staff (not on the roster) may manage, and the backend has the final say.
  const myEntry = collaborators?.find((c) => c.userId === currentUserId);
  const canManage =
    data.content?.authorId === currentUserId || !myEntry || myEntry.role === "OWNER" || myEntry.role === "MANAGER";

  switch (tab) {
    case "overview":
      return <CourseOverviewEditor contentId={contentId} />;
    case "insights":
      return <LearnersAnalyticsSection contentId={contentId} segment="course" />;
    case "exams":
      return <ContentAssessmentsSection segment="course" contentId={contentId} />;
    case "category":
      return <CourseCategoryEditor contentId={contentId} />;
    case "settings":
      return (
        <CourseSettingsTab
          contentId={contentId}
          readOnly={data.content?.status === "SUBMITTED"}
          collaborators={collaborators}
          collaboratorsUnavailable={data.collaborators.status === "error"}
          canManageCollaborators={canManage}
          onChanged={onChanged}
        />
      );
    case "publishing":
      return (
        <PublishingWorkflow
          status={data.content?.status ?? "DRAFT"}
          review={data.review.status === "ok" ? data.review.data : null}
          editHref={editorHref("course", contentId)}
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
}
