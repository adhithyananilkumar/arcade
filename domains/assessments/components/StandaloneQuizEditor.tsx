"use client";

interface StandaloneQuizEditorProps {
  quizId: string;
  className?: string;
}

export function StandaloneQuizEditor({ quizId, className = "" }: StandaloneQuizEditorProps) {
  return (
    <div className={`flex items-center justify-center p-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 ${className}`}>
      Standalone Quiz Editor is temporarily disabled while migrating to Native Tiptap Extension.
    </div>
  );
}
