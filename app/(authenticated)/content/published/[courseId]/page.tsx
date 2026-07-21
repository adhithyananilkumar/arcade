// app/(authenticated)/content/published/[courseId]/page.tsx
import type { Metadata } from "next";
import { CoursePlayerOrchestrator } from "@/apps/learner/orchestrators/CoursePlayerOrchestrator";

export const metadata: Metadata = {
  title: "Course — Arcade",
};

export default async function PublishedCourseViewPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  
  if (!courseId) {
    return <div className="p-8 text-gray-500">Course ID is missing</div>;
  }
  
  return <CoursePlayerOrchestrator courseId={courseId} />;
}
