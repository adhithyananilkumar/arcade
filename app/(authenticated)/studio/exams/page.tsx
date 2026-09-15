"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Loader2, Plus } from "lucide-react";
import { listMyExams } from "@/domains/assessments";

interface ExamSummary {
  id: string;
  type: string;
  title: string;
  status: string;
  updatedAt: string | null;
}

const TABS = ["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"] as const;
type Tab = (typeof TABS)[number];

export default function StudioExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("ALL");

  useEffect(() => {
    listMyExams()
      .then(setExams)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (tab === "ALL") return exams;
    return exams.filter((e) => e.status?.toUpperCase() === tab);
  }, [exams, tab]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#14142b]">Exams</h1>
            <p className="mt-1 text-sm text-slate-500">
              Standalone or attached to a course/event — manage every exam you own here.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/studio/exam/new")}
            className="flex items-center gap-1.5 rounded-xl bg-[#14142b] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black"
          >
            <Plus size={15} />
            Add Exam
          </button>
        </div>

        <div className="mb-4 flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                tab === t ? "bg-[#14142b] text-white" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {t.toLowerCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-slate-400" size={22} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
            <GraduationCap className="mx-auto mb-3 text-slate-300" size={28} />
            <p className="text-sm font-semibold text-[#14142b]">No exams yet</p>
            <p className="mt-1 text-xs text-slate-500">
              Create a standalone exam, or add one from a course or event editor.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {filtered.map((exam, i) => (
              <Link
                key={exam.id}
                href={`/studio/exam/${exam.id}/config`}
                className={`flex items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50 ${
                  i > 0 ? "border-t border-slate-100" : ""
                }`}
              >
                <span className="grid size-9 flex-shrink-0 place-items-center rounded-xl bg-[#14142b]/[0.06] text-[#14142b]">
                  <GraduationCap size={16} />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#14142b]">
                  {exam.title}
                </span>
                <span className="flex-shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  {exam.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
