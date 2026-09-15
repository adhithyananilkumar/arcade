"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, ArrowLeft, Loader2, UploadCloud, History, Link2 } from "lucide-react";
import { api } from "@/infrastructure/http/api";
import { toast } from "sonner";
import { getExam, updateExam, attachExamToCourse, detachExamFromCourse, type ExamResponse } from "@/domains/assessments";
import { ExamBlueprintEditor } from "../../../course/[courseId]/exam/[examId]/config/ExamBlueprintEditor";

interface ContentSummary {
  id: string;
  type: string;
  title: string;
}

/** Config for a standalone exam (no course/event placement) — see the course-scoped sibling page
 * for the attached case. Placement doesn't change how an exam is configured, only whether a
 * question bank is available yet (see ExamBlueprintEditor). */
export default function StandaloneExamConfigPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = use(params);
  const router = useRouter();

  const [exam, setExam] = useState<ExamResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState<
    { id: string; versionNumber: number; label: string | null; publishedAt: string }[]
  >([]);
  const [publishing, setPublishing] = useState(false);
  const [myCourses, setMyCourses] = useState<ContentSummary[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [attaching, setAttaching] = useState(false);

  useEffect(() => {
    let active = true;
    getExam(examId)
      .then((data) => {
        if (active) setExam(data);
      })
      .catch(() => toast.error("Failed to load exam"))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [examId]);

  useEffect(() => {
    api
      .get<ContentSummary[]>(`/api/content?type=COURSE`)
      .then(setMyCourses)
      .catch(() => {});
  }, []);

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

  const handleAttach = async () => {
    if (!selectedCourseId) return;
    setAttaching(true);
    try {
      const updated = await attachExamToCourse(selectedCourseId, examId);
      setExam(updated);
      toast.success("Exam attached to course");
    } catch {
      toast.error("Failed to attach exam");
    } finally {
      setAttaching(false);
    }
  };

  const handleDetach = async () => {
    if (!exam?.courseId) return;
    setAttaching(true);
    try {
      const updated = await detachExamFromCourse(exam.courseId, examId);
      setExam(updated);
      toast.success("Exam is now standalone");
    } catch {
      toast.error("Failed to detach exam");
    } finally {
      setAttaching(false);
    }
  };

  const handleRename = async (title: string) => {
    setExam((prev) => (prev ? { ...prev, title } : prev));
    try {
      await updateExam(examId, { title });
    } catch {
      toast.error("Failed to rename exam");
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
      <header className="absolute inset-x-0 top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto grid max-w-[1200px] grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-2 sm:px-6">
          <div className="justify-self-start">
            <button
              type="button"
              onClick={() => router.push("/studio/exams")}
              title="Back to Exams"
              className="flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Exams</span>
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

      <main className="absolute inset-0 overflow-y-auto pt-[53px]">
        <div className="mx-auto max-w-3xl px-4 py-8 pb-24">
          <div className="space-y-8 rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
            <div>
              <label htmlFor="standalone-exam-title" className="mb-1.5 block text-sm font-semibold text-[#14142b]">
                Title
              </label>
              <input
                id="standalone-exam-title"
                value={exam.title}
                onChange={(e) => handleRename(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
              <label htmlFor="attach-course-select" className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#14142b]">
                <Link2 size={14} /> {exam.courseId ? "Attached to a course" : "Attach to a course"}
              </label>
              {exam.courseId ? (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">
                    This exam draws from that course&apos;s question bank. Detach to make it
                    standalone again.
                  </p>
                  <button
                    type="button"
                    onClick={handleDetach}
                    disabled={attaching}
                    className="flex-shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
                  >
                    Detach
                  </button>
                </div>
              ) : (
                <>
                  <p className="mb-3 text-xs text-slate-500">
                    Standalone exams have no question bank until placed under a course. This exam
                    stays standalone until you attach it here — nothing is required.
                  </p>
                  <div className="flex gap-2">
                    <select
                      id="attach-course-select"
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-300"
                    >
                      <option value="">Select a course…</option>
                      {myCourses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAttach}
                      disabled={!selectedCourseId || attaching}
                      className="flex items-center gap-1.5 rounded-lg bg-[#14142b] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-black disabled:opacity-50"
                    >
                      {attaching ? <Loader2 size={13} className="animate-spin" /> : null}
                      Attach
                    </button>
                  </div>
                </>
              )}
            </div>

            <hr className="border-slate-100" />

            <div>
              <label className="block text-sm font-semibold text-[#14142b] mb-4">Blueprint</label>
              <ExamBlueprintEditor examId={examId} courseId={exam.courseId ?? undefined} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
