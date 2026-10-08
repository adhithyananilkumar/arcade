// app/(authenticated)/studio/course/[courseId]/edit/page.tsx
import type { Metadata } from "next";
import { CourseWorkspace } from "@/apps/creator/studio/workspaces/course/CourseWorkspace";

export const metadata: Metadata = {
  title: "Edit Course — Arcade",
};

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function EditCoursePage({ params }: Props) {
  const { courseId } = await params;

  return (
    // No background here: the editor frame inside is `fixed inset-0` and paints its own ground.
    // Under the glass theme every `bg-surface` gets a backdrop-filter, which makes this wrapper the
    // containing block for that fixed frame — so the editor shrinks to this wrapper's height, and
    // at zero height (BUG-1061) the page shows only the wallpaper.
    <div className="flex flex-col flex-1">
      <CourseWorkspace courseId={courseId} />
    </div>
  );
}
