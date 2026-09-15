"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createExam } from "@/domains/assessments";

export default function NewExamPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Give the exam a title first");
      return;
    }
    setCreating(true);
    try {
      const exam = await createExam({ title: title.trim(), purpose: purpose.trim() || undefined });
      toast.success("Exam created");
      router.push(`/studio/exam/${exam.id}/config`);
    } catch {
      toast.error("Failed to create exam");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-[#14142b]/[0.06] text-[#14142b]">
            <GraduationCap size={20} />
          </span>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[#14142b]">Create a new exam</h1>
            <p className="text-xs text-slate-500">
              Starts standalone. Attach it to a course or event later, or leave it standalone.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="exam-title" className="mb-1.5 block text-sm font-semibold text-[#14142b]">
              Title
            </label>
            <input
              id="exam-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Logical Reasoning Assessment"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div>
            <label htmlFor="exam-purpose" className="mb-1.5 block text-sm font-semibold text-[#14142b]">
              Purpose <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="exam-purpose"
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Entrance test, Practice quiz, Final assessment"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              A label for your own reference — describe it however fits.
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 rounded-xl bg-[#14142b] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-60"
          >
            {creating && <Loader2 size={14} className="animate-spin" />}
            Create exam
          </button>
        </div>
      </div>
    </div>
  );
}
