"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, ArrowLeft, Loader2, UploadCloud, History, Check, ChevronUp, ChevronDown } from "lucide-react";
import { api } from "@/infrastructure/http/api";
import { toast } from "sonner";
import { ExamBlueprintEditor } from "./ExamBlueprintEditor";

interface ExamResponse {
  id: string;
  title: string;
  questionCount: number;
  easyPercent: number;
  mediumPercent: number;
  hardPercent: number;
  examType: "BADGED" | "CERTIFIED";
  proctoringRequired: boolean;
  identityVerificationRequired: boolean;
  fullscreenRequired: boolean;
  sameQuestionsForAllStudents: boolean;
}

const CustomCheckbox = ({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) => (
  <div className="relative flex h-5 w-5 items-center justify-center flex-shrink-0">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-300 bg-white transition-all checked:border-[#14142b] checked:bg-[#14142b] hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14142b]/20 focus:ring-offset-1"
    />
    <Check size={13} strokeWidth={4} className="pointer-events-none absolute text-white opacity-0 scale-50 peer-checked:scale-100 peer-checked:opacity-100 transition-all duration-200" />
  </div>
);

const CustomNumberInput = ({ value, onChange, min = 0, max, className = "w-24" }: { value: number, onChange: (val: number) => void, min?: number, max?: number, className?: string }) => {
  return (
    <div className={`relative flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 transition-all ${className}`}>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const val = parseInt(e.target.value, 10);
          if (!isNaN(val)) onChange(val);
        }}
        className="flex-1 appearance-none border-none bg-transparent px-3 py-2 text-center text-sm font-semibold text-[#14142b] outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
      />
      <div className="flex flex-col border-l border-slate-200 bg-slate-50">
        <button
          type="button"
          onClick={() => {
            const next = value + 1;
            if (max === undefined || next <= max) onChange(next);
          }}
          className="flex h-[18px] w-7 items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-[#14142b] transition-colors"
        >
          <ChevronUp size={14} strokeWidth={3} />
        </button>
        <button
          type="button"
          onClick={() => {
            const next = value - 1;
            if (min === undefined || next >= min) onChange(next);
          }}
          className="flex h-[18px] w-7 items-center justify-center border-t border-slate-200 text-slate-400 hover:bg-slate-200 hover:text-[#14142b] transition-colors"
        >
          <ChevronDown size={14} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default function ExamConfigPage({
  params,
}: {
  params: Promise<{ courseId: string; examId: string }>;
}) {
  const { examId, courseId } = use(params);
  const router = useRouter();

  const [exam, setExam] = useState<ExamResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questionCount, setQuestionCount] = useState(25);
  const [rules, setRules] = useState({ EASY: 30, MEDIUM: 50, HARD: 20 });
  const [examType, setExamType] = useState<"BADGED" | "CERTIFIED">("BADGED");
  const [proctoringRequired, setProctoringRequired] = useState(false);
  const [identityVerificationRequired, setIdentityVerificationRequired] = useState(false);
  const [fullscreenRequired, setFullscreenRequired] = useState(false);
  const [sameQuestionsForAllStudents, setSameQuestionsForAllStudents] = useState(false);
  const [versions, setVersions] = useState<
    { id: string; versionNumber: number; label: string | null; publishedAt: string }[]
  >([]);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .get<ExamResponse>(`/api/exams/${examId}`)
      .then((data) => {
        if (!active) return;
        setExam(data);
        setQuestionCount(data.questionCount);
        setRules({ EASY: data.easyPercent, MEDIUM: data.mediumPercent, HARD: data.hardPercent });
        setExamType(data.examType);
        setProctoringRequired(data.proctoringRequired);
        setIdentityVerificationRequired(data.identityVerificationRequired);
        setFullscreenRequired(data.fullscreenRequired);
        setSameQuestionsForAllStudents(data.sameQuestionsForAllStudents);
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

  const loadVersions = useCallback(() => {
    api
      .get<typeof versions>(`/api/exams/${examId}/versions`)
      .then(setVersions)
      .catch(() => {});
  }, [examId]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await api.post(`/api/exams/${examId}/publish`, {});
      toast.success("Exam published");
      loadVersions();
    } catch {
      toast.error("Failed to publish exam");
    } finally {
      setPublishing(false);
    }
  };

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
        examType,
        proctoringRequired,
        identityVerificationRequired,
        fullscreenRequired,
        sameQuestionsForAllStudents,
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
    <div className="relative h-screen overflow-hidden bg-[#F7F9FC]">
      {/* ── Floating header ── */}
      <header className="absolute inset-x-0 top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto grid max-w-[1200px] grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-2 sm:px-6">
          <div className="justify-self-start">
            <button
              type="button"
              onClick={() => router.back()}
              title="Back"
              className="flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>

          <div className="min-w-0 justify-self-center flex items-center gap-2">
            <Settings size={16} className="text-slate-400" />
            <span className="block max-w-[60vw] truncate px-1.5 py-1 text-center text-sm font-bold tracking-tight text-[#14142b] sm:max-w-md">
              Configure &ldquo;{exam.title}&rdquo;
            </span>
          </div>

          <div className="justify-self-end flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <History size={13} />
              <span className="hidden sm:inline">
                {versions.length > 0 ? `Published v${versions[0].versionNumber}` : "Never published"}
              </span>
            </span>
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="flex items-center gap-1.5 rounded-lg bg-[#14142b] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-black disabled:opacity-50"
            >
              {publishing ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
              Publish
            </button>
          </div>
        </div>
      </header>

      {/* ── Main scrollable area ── */}
      <main className="absolute inset-0 overflow-y-auto pt-[53px]">
        <div className="mx-auto max-w-3xl px-4 py-8 pb-24">
          <div className="space-y-8 rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
            <p className="text-sm leading-relaxed text-slate-500">
              Each student gets a fixed paper sampled from this course&apos;s question bank, drawn at
              the difficulty split below. Publishing cuts an immutable version of the current
              blueprint/config — editing after publishing doesn&apos;t change what students who
              already have a paper see; publish again to cut a new version.
            </p>

            {/* Exam Type */}
            <div>
              <label className="block text-sm font-semibold text-[#14142b] mb-2">Exam type</label>
              <div className="flex gap-3">
                {(["BADGED", "CERTIFIED"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setExamType(type)}
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                      examType === type
                        ? "border-slate-800 bg-slate-900 text-white shadow-sm"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {type === "BADGED" ? "Badged" : "Certified"}
                  </button>
                ))}
              </div>
            </div>


            {/* Same Questions Toggle */}
            <div>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50/50 hover:shadow-sm">
                <div className="flex h-5 items-center mt-0.5">
                  <CustomCheckbox checked={sameQuestionsForAllStudents} onChange={setSameQuestionsForAllStudents} />
                </div>
                <span>
                  <span className="block font-semibold text-[#14142b] select-none">
                    Give every student the same paper
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                    Off by default — each student normally gets an independently sampled paper.
                    When on, whichever paper is generated first for this exam is reused for
                    everyone else instead of resampling.
                  </span>
                </span>
              </label>
            </div>

            <hr className="border-slate-100" />

            {/* Blueprint */}
            <div>
              <label className="block text-sm font-semibold text-[#14142b] mb-4">Blueprint</label>
              <ExamBlueprintEditor examId={examId} courseId={courseId} />
            </div>

            {/* Legacy Fallback */}
            <details className="group rounded-xl border border-slate-200 bg-white overflow-hidden">
              <summary className="cursor-pointer select-none bg-slate-50/50 px-5 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                Legacy fallback (flat question count / difficulty split)
              </summary>
              <div className="space-y-6 border-t border-slate-200 p-5 bg-white">
                <p className="text-xs text-slate-500">
                  Only used when this exam has no blueprint sections above.
                </p>
                <div>
                  <label className="block text-sm font-semibold text-[#14142b] mb-2">
                    Number of questions
                  </label>
                  <CustomNumberInput
                    min={1}
                    value={questionCount}
                    onChange={(val) => setQuestionCount(Math.max(1, val))}
                  />
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="block text-sm font-semibold text-[#14142b]">
                      Difficulty split (%)
                    </label>
                    <span className={`text-xs font-semibold ${splitValid ? "text-emerald-600" : "text-rose-600"}`}>
                      Total: {total}%{!splitValid && " — must equal 100"}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    {(["EASY", "MEDIUM", "HARD"] as const).map((diff) => (
                      <div key={diff} className="flex-1 bg-white rounded-xl p-3 border border-slate-200">
                        <label className="block text-xs font-bold tracking-wide text-slate-500 mb-2 capitalize">
                          {diff.toLowerCase()}
                        </label>
                        <CustomNumberInput
                          min={0}
                          max={100}
                          value={rules[diff]}
                          onChange={(val) => setRules({ ...rules, [diff]: val })}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </details>

            {/* Actions */}
            <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => router.back()}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-[#14142b] hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !splitValid}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-[#14142b] hover:bg-black rounded-xl shadow-sm transition-all disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Saving…
                  </span>
                ) : (
                  "Save Configuration"
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
