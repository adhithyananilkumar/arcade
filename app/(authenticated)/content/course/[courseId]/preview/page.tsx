// app/(authenticated)/dashboard/content/course/[courseId]/preview/page.tsx
// Author preview: renders the learner-facing CourseRenderer against the live working copy
// (mode="preview") rather than a published snapshot. Composed here at the app layer so the
// content-domain editor never imports the learning-domain renderer directly.
import type { Metadata } from "next";
import { CoursePlayerOrchestrator } from "@/apps/learner/orchestrators/CoursePlayerOrchestrator";

export const metadata: Metadata = {
  title: "Preview — Arcade",
};

export default async function CoursePreviewPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;

  if (!courseId) {
    return <div className="p-8 text-gray-500">Course ID is missing</div>;
  }

  // Uses "preview" mode to bypass published gate checks (if any)
  return <CoursePlayerOrchestrator courseId={courseId} mode="preview" />;
}
