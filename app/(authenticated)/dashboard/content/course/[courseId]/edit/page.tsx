// app/(authenticated)/dashboard/content/course/[courseId]/edit/page.tsx
import type { Metadata } from "next";
import { CourseEditorShell } from "@/features/content/course";

export const metadata: Metadata = {
  title: "Edit Course — Arcade",
};

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function EditCoursePage({ params }: Props) {
  const { courseId } = await params;

  return (
    // Cancels the dashboard shell's <main> padding (p-6 md:p-8) so the editor's own
    // chrome sits flush under the global navbar instead of leaving a padded gap.
    <div className="-m-6 flex h-[calc(100vh-4rem)] flex-col bg-white md:-m-8">
      <CourseEditorShell courseId={courseId} />
    </div>
  );
}
