import { Check, X } from "lucide-react";
export interface SnapshotOptionDto {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface SnapshotQuestionDto {
  id: string;
  prompt: string;
  points: number;
  position: number;
  options: SnapshotOptionDto[];
}

export interface QuizSnapshotDto {
  id: string;
  title: string;
  position: number;
  questions?: SnapshotQuestionDto[];
}

interface SnapshotQuizViewerProps {
  quiz: QuizSnapshotDto;
  className?: string;
}

export function SnapshotQuizViewer({ quiz, className = "" }: SnapshotQuizViewerProps) {
  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">{quiz.title}</h3>
        <span className="text-xs font-semibold uppercase text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
          Review Mode
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-8">
        {quiz.questions && quiz.questions.length > 0 ? (
          quiz.questions.map((q, qi) => (
            <div key={q.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-600">
                  {qi + 1}
                </span>
                <span className="text-xs font-medium text-gray-400">
                  {q.points} {q.points === 1 ? 'Point' : 'Points'}
                </span>
              </div>

              <p className="mb-3 text-sm text-gray-800">{q.prompt}</p>

              <div className="space-y-1.5">
                {q.options.map((o) => {
                  return (
                    <div
                      key={o.id}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left border ${
                        o.isCorrect ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-white"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
                          o.isCorrect ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-300 text-transparent"
                        }`}
                      >
                        <Check size={12} />
                      </span>
                      <span className={`flex-1 text-sm ${o.isCorrect ? "text-emerald-900 font-medium" : "text-gray-700"}`}>
                        {o.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">No questions found in this snapshot.</p>
        )}
      </div>
    </div>
  );
}
