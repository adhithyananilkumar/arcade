// app/(authenticated)/dashboard/content/course/[courseId]/edit/page.tsx
import type { Metadata } from "next";
import { CourseEditorOrchestrator } from "@/apps/creator/orchestrators/CourseEditorOrchestrator";

export const metadata: Metadata = {
  title: "Edit Course — Arcade",
};

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function EditCoursePage({ params }: Props) {
  const { courseId } = await params;

  return (
    // Removes negative margins since the global layout doesn't use padding anymore.
    // Ensure height works within the new flex layout.
    <div className="flex flex-col flex-1 bg-white">
      <CourseEditorOrchestrator courseId={courseId} />
    </div>
  );
}
