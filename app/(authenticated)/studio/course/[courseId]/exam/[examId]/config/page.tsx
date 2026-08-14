"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, ArrowLeft, Loader2 } from "lucide-react";
import { api } from "@/infrastructure/http/api";
import { toast } from "sonner";

interface ExamResponse {
  id: string;
  title: string;
  questionCount: number;
  easyPercent: number;
  mediumPercent: number;
  hardPercent: number;
}

export default function ExamConfigPage({
  params,
}: {
  params: Promise<{ courseId: string; examId: string }>;
}) {
  const { examId } = use(params);
  const router = useRouter();

  const [exam, setExam] = useState<ExamResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questionCount, setQuestionCount] = useState(25);
  const [rules, setRules] = useState({ EASY: 30, MEDIUM: 50, HARD: 20 });

  useEffect(() => {
    let active = true;
    api
      .get<ExamResponse>(`/api/exams/${examId}`)
      .then((data) => {
        if (!active) return;
        setExam(data);
        setQuestionCount(data.questionCount);
        setRules({ EASY: data.easyPercent, MEDIUM: data.mediumPercent, HARD: data.hardPercent });
      })
      .catch(() => {
        if (active) toast.error("Failed to load exam");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [examId]);

  const total = rules.EASY + rules.MEDIUM + rules.HARD;
  const splitValid = total === 100;

  const handleSave = async () => {
    if (!splitValid) {
      toast.error(`Difficulty split must sum to 100 (currently ${total})`);
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/api/exams/${examId}`, {
        questionCount,
        easyPercent: rules.EASY,
        mediumPercent: rules.MEDIUM,
        hardPercent: rules.HARD,
      });
      toast.success("Exam configuration saved");
      router.back();
    } catch {
      toast.error("Failed to save exam configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-indigo-400" size={24} />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Exam not found.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 flex flex-col items-center py-10 px-4 h-full min-h-screen">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="border-b border-gray-100 px-8 py-6 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="text-indigo-600" />
              Configure &ldquo;{exam.title}&rdquo;
            </h1>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <p className="text-sm text-gray-500">
            Each student gets a fixed paper sampled from this course&apos;s question bank, drawn at
            the difficulty split below.
          </p>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Number of questions
            </label>
            <input
              type="number"
              min={1}
              value={questionCount}
              onChange={(e) => setQuestionCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-32 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-center outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-800">
                Difficulty split (%)
              </label>
              <span className={`text-xs font-semibold ${splitValid ? "text-emerald-600" : "text-rose-600"}`}>
                Total: {total}%{!splitValid && " — must equal 100"}
              </span>
            </div>
            <div className="flex gap-4">
              {(["EASY", "MEDIUM", "HARD"] as const).map((diff) => (
                <div key={diff} className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <label className="block text-xs font-medium text-gray-600 mb-2 capitalize">
                    {diff.toLowerCase()}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={rules[diff]}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      setRules({ ...rules, [diff]: val });
                    }}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-center outline-none focus:border-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 p-6 bg-gray-50 flex justify-end gap-4 rounded-b-2xl">
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !splitValid}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {saving ? "Saving…" : "Save Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
}
