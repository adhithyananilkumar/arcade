import { SharedContentEditorOrchestrator } from "@/apps/creator/shared/content-editor/SharedContentEditorOrchestrator";

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function QuestionBankPage({ params }: Props) {
  const { courseId } = await params;

  return (
    <div className="flex flex-col flex-1 bg-white h-screen">
      <SharedContentEditorOrchestrator contentId={courseId} contentType="question-bank" />
    </div>
  );
}
