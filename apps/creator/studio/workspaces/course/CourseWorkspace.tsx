"use client";

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Creator
 * Type: Workspace
 *
 * Purpose:
 * The Course content workspace — Course's own adapter and submit/back
 * behaviour, running the shared lesson/module/badge editing engine.
 * ------------------------------------------------------------------
 */

import { useCallback, useMemo } from "react";
import { api } from "@/infrastructure/http/api";
import { ContentEditorRuntime } from "@/apps/creator/studio/workspaces/content/ContentEditorRuntime";
import { CourseAdapter } from "@/apps/creator/studio/workspaces/content/adapters/CourseAdapter";

/**
 * CourseWorkspace owns exactly what is Course-specific: which adapter to hand the shared runtime,
 * and where "Submit"/"Back" go. Everything else — the tree, the lesson editor, history,
 * collaboration, exams, badges — is the runtime's job.
 *
 * <p>This is deliberately thin. If a change needs the runtime's internal state (the sidebar tree,
 * the open lesson), it belongs in `ContentEditorRuntime`, not here — that's the boundary that
 * keeps this file from regrowing into the 2,000-line orchestrator it replaced.
 */
export function CourseWorkspace({ courseId }: { courseId: string }) {
  const adapter = useMemo(() => new CourseAdapter(), []);

  const onSubmit = useCallback(
    async (data: { message?: string }) => {
      const updated = await api.post<{ status: string; updatedAt: string; pricingModel: string }>(
        `/api/courses/${courseId}/submit`,
        { message: data.message }
      );
      return { status: updated.status, updatedAt: updated.updatedAt };
    },
    [courseId]
  );

  return (
    <ContentEditorRuntime
      adapter={adapter}
      contentId={courseId}
      backHref={`/studio/content/course/${courseId}`}
      onSubmit={onSubmit}
      copy={{
        noContainers: "No modules yet. Add a module to get started.",
        canvasTitle: "Select a lesson or badge to start editing.",
        canvasDescription: "Open the sidebar, add a module, then a lesson or badge to begin.",
      }}
    />
  );
}

