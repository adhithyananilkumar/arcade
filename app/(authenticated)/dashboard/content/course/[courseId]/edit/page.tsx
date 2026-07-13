// app/(authenticated)/dashboard/content/course/[courseId]/edit/page.tsx
import type { Metadata } from "next";
import { CourseEditorShell } from "@/features/content/course/components/CourseEditorShell";

export const metadata: Metadata = {
  title: "Edit Course — Arcade",
};

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function EditCoursePage({ params }: Props) {
  const { courseId } = await params;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <CourseEditorShell courseId={courseId} />
    </div>
  );
}
