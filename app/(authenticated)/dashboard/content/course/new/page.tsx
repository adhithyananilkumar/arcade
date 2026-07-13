// app/(authenticated)/dashboard/content/course/new/page.tsx
import type { Metadata } from "next";
import { CourseEditorShell } from "@/features/content/course/components/CourseEditorShell";

export const metadata: Metadata = {
  title: "New Course — Arcade",
  description: "Create a new course with the Arcade Content Editor.",
};

export default function NewCoursePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <CourseEditorShell />
    </div>
  );
}
