// app/(authenticated)/dashboard/content/course/[courseId]/preview/page.tsx
// Author preview: renders the learner-facing CourseRenderer against the live working copy
// (mode="preview") rather than a published snapshot. Composed here at the app layer so the
// content-domain editor never imports the learning-domain renderer directly.
import type { Metadata } from "next";
import { CourseRenderer } from "@/features/learning/delivery/components/CourseRenderer";

export const metadata: Metadata = {
  title: "Preview — Arcade",
};

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function CoursePreviewPage({ params }: Props) {
  const { courseId } = await params;

  return <CourseRenderer courseId={courseId} mode="preview" />;
}
