"use client";

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Creator
 * Type: Workspace
 *
 * Purpose:
 * The Course content workspace — Course's own adapter, category selector, and submit/back
 * behaviour, running the shared lesson/module/badge editing engine.
 * ------------------------------------------------------------------
 */

import { useCallback, useMemo, useState } from "react";
import { api } from "@/infrastructure/http/api";
import { usePublicCategories } from "@/shared/hooks/usePublicCategories";
import { ContentEditorRuntime } from "@/apps/creator/studio/workspaces/content/ContentEditorRuntime";
import { CourseAdapter } from "@/apps/creator/studio/workspaces/content/adapters/CourseAdapter";

/**
 * CourseWorkspace owns exactly what is Course-specific: which adapter to hand the shared runtime,
 * the course category selector, and where "Submit"/"Back" go. Everything else — the tree, the
 * lesson editor, history, collaboration, exams, badges — is the runtime's job.
 *
 * <p>This is deliberately thin. If a change needs the runtime's internal state (the sidebar tree,
 * the open lesson), it belongs in `ContentEditorRuntime`, not here — that's the boundary that
 * keeps this file from regrowing into the 2,000-line orchestrator it replaced.
 */
export function CourseWorkspace({ courseId }: { courseId: string }) {
  const adapter = useMemo(() => new CourseAdapter(), []);

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);
  // Categories created via Console -> Content Manage -> Categories (super-user only), scoped to
  // COURSES-type categories only — this is the Course editor, not events/articles.
  const publicCategories = usePublicCategories();
  const courseCategories = useMemo(() => publicCategories.filter((c) => c.type === "COURSES"), [publicCategories]);

  const updateCourseCategory = useCallback(
    async (newCategoryId: string | null) => {
      const previous = categoryId;
      setCategoryId(newCategoryId);
      setSavingCategory(true);
      try {
        await adapter.updateMeta(courseId, { categoryId: newCategoryId });
      } catch (e) {
        console.error("Failed to update course category", e);
        setCategoryId(previous);
      } finally {
        setSavingCategory(false);
      }
    },
    [adapter, courseId, categoryId]
  );

  const onSubmit = useCallback(
    async (data: { coverImageUrl?: string; pricingModel?: "FREE" | "PAID"; priceAmount?: number; message?: string }) => {
      if (data.coverImageUrl !== undefined || data.pricingModel !== undefined || data.priceAmount !== undefined) {
        await api.patch(`/api/courses/${courseId}`, data);
      }
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
      onLoaded={(meta) => setCategoryId(meta.categoryId ?? null)}
      copy={{
        noContainers: "No modules yet. Add a module to get started.",
        canvasTitle: "Select a lesson or badge to start editing.",
        canvasDescription: "Open the sidebar, add a module, then a lesson or badge to begin.",
      }}
      sidebarExtras={
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1 rounded-2xl border border-white/40 bg-white/70 px-3 py-2 shadow-sm backdrop-blur-md">
            <label htmlFor="course-category-select" className="text-[10px] font-bold uppercase tracking-wide text-[#14142b]/50">
              Category
            </label>
            <select
              id="course-category-select"
              value={categoryId ?? "OTHER"}
              disabled={savingCategory}
              onChange={(e) => updateCourseCategory(e.target.value === "OTHER" ? null : e.target.value)}
              className="w-full rounded-lg border border-[#14142b]/10 bg-white px-2 py-1.5 text-xs font-semibold text-[#14142b] outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 disabled:opacity-60"
            >
              {courseCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-white/40 bg-white/70 px-3 py-2 shadow-sm backdrop-blur-md mt-2">
             <label className="text-[10px] font-bold uppercase tracking-wide text-[#14142b]/50">
               Pricing
             </label>
             <button
               onClick={() => {
                 // Trigger pricing configuration logic here. For now it triggers an alert or opens a local modal
                 // In a complete implementation we would open a dialog and patch the API using adapter.updateMeta
                 alert("Pricing configuration will be available here");
               }}
               className="w-full rounded-lg bg-[#14142b] py-1.5 text-xs font-semibold text-white transition hover:bg-[#232735]"
             >
               Configure Pricing
             </button>
          </div>
        </div>
      }
    />
  );
}
