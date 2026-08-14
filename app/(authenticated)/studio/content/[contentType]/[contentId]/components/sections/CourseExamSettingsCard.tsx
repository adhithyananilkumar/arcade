import { useState } from "react";
import { GraduationCap, Settings, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/infrastructure/http/api";

export function CourseExamSettingsCard({
  contentId,
  initialHasExam,
  onUpdate,
}: {
  contentId: string;
  initialHasExam?: boolean;
  onUpdate: () => void;
}) {
  const router = useRouter();
  const [hasExam, setHasExam] = useState(initialHasExam ?? false);
  const [loading, setLoading] = useState(false);
  const [configuring, setConfiguring] = useState(false);

  const handleConfigureExam = async () => {
    setConfiguring(true);
    try {
      const exam = await api.get<{ id: string }>(`/api/courses/${contentId}/exam`);
      router.push(`/studio/course/${contentId}/exam/${exam.id}/config`);
    } catch {
      toast.error("Failed to open exam configuration");
    } finally {
      setConfiguring(false);
    }
  };

  const toggleExam = async () => {
    setLoading(true);
    const newValue = !hasExam;
    setHasExam(newValue);
    try {
      await api.patch(`/api/courses/${contentId}`, { hasExam: newValue });
      toast.success(newValue ? "Final Exam enabled" : "Final Exam disabled");
      onUpdate();
    } catch (err) {
      toast.error("Failed to update exam settings");
      setHasExam(!newValue); // revert
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group rounded-2xl border border-white/40 bg-white/40 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-white/60 hover:bg-white/60 hover:shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-bold text-[#14142b]">
          <GraduationCap size={16} /> Exam Settings
        </h2>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={hasExam}
            onChange={toggleExam}
            disabled={loading}
          />
          <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#5263ff] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5263ff]/30 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-[#5263ff]/30"></div>
        </label>
      </div>
      <p className="mb-4 text-xs text-slate-500">
        Require learners to pass a final exam before they can complete this course.
      </p>
      
      {hasExam && (
        <div className="mt-4 space-y-2 border-t border-slate-200/50 pt-4">
          <Link
            href={`/studio/course/${contentId}/question-bank`}
            className="inline-flex w-full items-center justify-center rounded-lg bg-[#14142b] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Manage Question Bank
          </Link>
          <button
            type="button"
            onClick={handleConfigureExam}
            disabled={configuring}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#14142b] transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            {configuring ? <Loader2 size={14} className="animate-spin" /> : <Settings size={14} />}
            Configure Exam
          </button>
        </div>
      )}
    </div>
  );
}
