export function ExamRender({ node }: { node: any }) {
  // Student-facing proctoring/delivery logic is handled in a separate project
  // This is a minimal placeholder for the renderer
  return (
    <div className="my-8 rounded-xl border border-indigo-200 bg-indigo-50 p-6 text-center shadow-sm">
      <h3 className="text-lg font-bold text-indigo-900">
        {node.attrs.examType === "CERTIFICATION" ? "Certification Exam" : "Badge Exam"}
      </h3>
      <p className="mt-2 text-sm text-indigo-700">
        Click below to start your exam.
      </p>
      <button className="mt-4 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">
        Start Exam
      </button>
    </div>
  );
}
