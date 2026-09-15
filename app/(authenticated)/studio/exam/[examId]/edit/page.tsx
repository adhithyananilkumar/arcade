"use client";

import { use } from "react";
import { ExamStudioOrchestrator } from "@/apps/creator/exam-studio/ExamStudioOrchestrator";

export default function ExamEditorPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = use(params);
  return <ExamStudioOrchestrator examId={examId} />;
}
