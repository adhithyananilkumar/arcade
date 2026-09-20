"use client";

import { use } from "react";
import { ExamWorkspace } from "@/apps/creator/studio/workspaces/exam/ExamWorkspace";

export default function ExamEditorPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = use(params);
  return <ExamWorkspace examId={examId} />;
}
