import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { GraduationCap, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export function ExamNodeView({ node, deleteNode }: NodeViewProps) {
  const router = useRouter();
  const params = useParams();

  const handleConfigure = () => {
    // Generate a temporary mock ID if one doesn't exist, or use a static one
    const examId = node.attrs.examId || "new-exam";
    const courseId = params?.courseId || "default-course";
    router.push(`/studio/course/${courseId}/exam/${examId}/config`);
  };

  return (
    <NodeViewWrapper className="my-6">
      {/* Placeholder Button in Editor */}
      <div 
        className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 shadow-sm hover:border-indigo-300 hover:bg-indigo-100 transition-colors cursor-pointer"
        onClick={handleConfigure}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600">
            <GraduationCap className="text-white" size={20} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-indigo-900">Exam Component</h4>
            <p className="text-xs text-indigo-700">
              {node.attrs.examType === "CERTIFIED" ? "Certified Exam" : "Badged Exam"} - Click to configure
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); deleteNode(); }}
            className="rounded p-2 text-indigo-400 hover:bg-indigo-200 hover:text-indigo-700"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

    </NodeViewWrapper>
  );
}
