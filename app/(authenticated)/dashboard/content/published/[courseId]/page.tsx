// app/(authenticated)/dashboard/content/published/[courseId]/page.tsx
import type { Metadata } from "next";
import { CourseRenderer } from "@/features/learning/delivery/components/CourseRenderer";

export const metadata: Metadata = {
  title: "Course — Arcade",
};

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function PublishedCoursePage({ params }: Props) {
  const { courseId } = await params;

  return <CourseRenderer courseId={courseId} />;
}
