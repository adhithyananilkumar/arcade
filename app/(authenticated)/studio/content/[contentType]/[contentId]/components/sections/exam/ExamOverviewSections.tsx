"use client";

import { BookOpen, Boxes, ClipboardList, Eye, PenLine, Send, Settings, Users } from "lucide-react";
import type { ExamResponse } from "@/domains/assessments";
import type { WorkspaceTab } from "@/apps/creator/studio/core/StudioWorkspaceKit";
import { ExamManagementSections } from "@/apps/creator/studio/workspaces/exam/management/ExamManagementSections";
import { ExamAboutWorkspace, ExamSettingsWorkspace } from "@/apps/creator/studio/workspaces/exam/management/ExamSettingsWorkspace";

export type ExamTab = "overview" | "plans" | "pools" | "preview" | "settings" | "attempts" | "marking" | "publishing";

/**
 * The exam dashboard's tabs, in the same bar and order logic as a course's: describe it, configure
 * how it is offered, see it, operate it, publish it.
 */
export const EXAM_TABS: WorkspaceTab<ExamTab>[] = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "plans", label: "Exam plans", icon: ClipboardList },
  { id: "pools", label: "Question pools", icon: Boxes },
  { id: "preview", label: "Preview", icon: Eye },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "attempts", label: "Attempts & results", icon: Users },
  { id: "marking", label: "Marking", icon: PenLine },
  { id: "publishing", label: "Publishing", icon: Send },
];

/**
 * The exam's Content Overview body for every tab except Publishing (which needs the page's review
 * data and lives in ExamOverviewTab).
 *
 * <p>Everything about how this exam is configured, offered, previewed and monitored lives here.
 * Writing the questions themselves happens in Studio, the same way a course's lessons do: an
 * editor authors content, and the workspace around it configures and operates that content.
 */
export function ExamOverviewSections({
  exam,
  tab,
  onExamChange,
  onSelectTab,
}: {
  exam: ExamResponse;
  tab: Exclude<ExamTab, "publishing">;
  onExamChange: (exam: ExamResponse) => void;
  onSelectTab: (tab: ExamTab) => void;
}) {
  const readOnly = exam.status === "SUBMITTED";

  if (tab === "overview") return <ExamAboutWorkspace key={exam.id} exam={exam} onChange={onExamChange} readOnly={readOnly} />;
  if (tab === "settings") {
    return <ExamSettingsWorkspace key={exam.id} exam={exam} onChange={onExamChange} readOnly={readOnly} onOpenPlans={() => onSelectTab("plans")} />;
  }
  return <ExamManagementSections exam={exam} tab={tab} />;
}
