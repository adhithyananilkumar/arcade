"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/infrastructure/http/api";
import { Calendar, Play, ClipboardList } from "lucide-react";

interface ExamDto {
  id: string;
  title: string;
  coverImageUrl?: string;
  examSchedule?: string;
}

const pageBg = {
  background: "linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 32%, #FFFFFF 70%)",
};

export default function ExamDashboard() {
  const router = useRouter();
  const [exams, setExams] = useState<ExamDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await api.get<ExamDto[]>("/api/v1/learning/enrollments/exams/today");
        setExams(data);
      } catch (err: any) {
        setError(err.message || "Failed to load exams.");
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={pageBg}>
        <div className="size-8 animate-spin rounded-full border-2 border-[#14142b] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4" style={pageBg}>
        <p className="text-[15px] font-semibold text-rose-600">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full bg-[#14142b] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#232735]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-28" style={pageBg}>
      <div className="mx-auto w-full max-w-6xl px-4 pt-28 sm:px-6 md:px-8 md:pt-32">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              <ClipboardList size={12} />
              Exams
            </div>
            <h1 className="text-[1.75rem] font-bold tracking-tight text-[#14142b] sm:text-[2rem]">
              Today&apos;s exams
            </h1>
            <p className="mt-1.5 text-[13px] font-medium text-slate-500">
              Scheduled assessments from your enrolled courses.
            </p>
          </div>
          <span className="hidden rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[12px] font-bold tabular-nums text-[#14142b] sm:inline-flex">
            {exams.length} available
          </span>
        </div>

        {exams.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/80 py-20 text-center shadow-[0_4px_16px_rgba(20,20,43,0.03)]">
            <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-slate-50">
              <Calendar size={26} className="text-slate-300" />
            </span>
            <h2 className="text-[15px] font-bold text-[#14142b]">No exams today</h2>
            <p className="mt-1.5 max-w-sm text-[13px] font-medium text-slate-500">
              You don&apos;t have any exams scheduled for today in your enrolled courses.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => (
              <article
                key={exam.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_6px_20px_rgba(20,20,43,0.05)] transition-shadow hover:shadow-[0_10px_28px_rgba(20,20,43,0.08)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  {exam.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={exam.coverImageUrl}
                      alt={exam.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center"
                      style={{
                        background: "linear-gradient(160deg, #EEF1F8 0%, #DDE3F0 100%)",
                      }}
                    >
                      <span className="text-4xl font-bold text-[#14142b]/25">
                        {exam.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="line-clamp-2 text-[15px] font-bold tracking-tight text-[#14142b]">
                    {exam.title}
                  </h2>
                  <p className="mt-1.5 text-[12px] font-semibold text-slate-400">
                    Available today · single sitting
                  </p>
                  <p className="mt-3 flex-1 text-[12px] leading-relaxed text-slate-500">
                    Once started, you must complete this exam without leaving the secure environment.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push(`/learn/exam/${exam.id}`)}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#14142b] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_16px_rgba(20,20,43,0.16)] transition-colors hover:bg-[#232735]"
                  >
                    <Play size={14} />
                    Start exam
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
