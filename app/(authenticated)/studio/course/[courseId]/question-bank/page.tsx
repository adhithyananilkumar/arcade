import { QuestionBankSectionView } from "@/domains/assessments/components/QuestionBankSectionView";

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function QuestionBankPage({ params }: Props) {
  const { courseId } = await params;

  return (
    <div className="flex flex-col flex-1 bg-white h-screen overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full pt-12 pb-24 px-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Question Bank</h1>
        <QuestionBankSectionView courseId={courseId} />
      </div>
    </div>
  );
}
