// app/(authenticated)/studio/course/[courseId]/preview/page.tsx
// Author preview: renders the exact learner-facing CoursePlayer against the course in ephemeral preview mode.
// In this mode, creators can experience the course exactly as an enrolled student does (including lesson
// progression and assessment landing/result states), but progress and marks are temporary and are never stored in the database.
import type { Metadata } from "next";
import { CoursePlayer } from "@/app/(authenticated)/courses/[id]/learn/[lessonId]/CoursePlayer";

export const metadata: Metadata = {
  title: "Preview — Arcade",
};

export default async function CoursePreviewPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;

  if (!courseId) {
    return <div className="p-8 text-gray-500">Course ID is missing</div>;
  }

  return <CoursePlayer courseId={courseId} isPreview={true} />;
}
