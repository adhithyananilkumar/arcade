// features/content/course/components/CourseEditorShell.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArcadeEditor } from "@/features/content/editor/components/ArcadeEditor";
import { api } from "@/lib/api";
import type {
  CourseResponse,
  ModuleResponse,
  ChapterResponse,
  LessonResponse,
} from "@/types/api";
import type { TiptapDocument } from "@/types/editor";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  BookOpen,
  FileText,
  Layers,
  X,
  GraduationCap,
  ImageIcon,
  DollarSign,
} from "lucide-react";

// ── Temporary: hardcoded author ID until JWT auth is wired ───────────────────
// Replace this with the authenticated user's ID from session/cookie when
// the backend auth module is complete.
const TEMP_AUTHOR_ID = "00000000-0000-0000-0000-000000000001";

interface CourseEditorShellProps {
  courseId?: string; // undefined = new course; string = edit existing
}

// ── Local types for tree state ────────────────────────────────────────────────

interface LessonNode {
  id: string;
  title: string;
  body?: string;
  position: number;
}

interface ChapterNode {
  id: string;
  title: string;
  position: number;
  lessons: LessonNode[];
  expanded: boolean;
}

interface ModuleNode {
  id: string;
  title: string;
  position: number;
  chapters: ChapterNode[];
  expanded: boolean;
}

// ── Question Bank placeholder dialog ─────────────────────────────────────────

function QuestionBankDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
            <FileText size={22} className="text-indigo-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Question Bank</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            The Question Bank editor is coming in the next phase. You&apos;ll be able to
            create MCQ, short answer, and coding questions linked to this course.
          </p>
          <button
            onClick={onClose}
            className="mt-2 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Shell ────────────────────────────────────────────────────────────────

export function CourseEditorShell({ courseId: initialCourseId }: CourseEditorShellProps) {
  const [courseId, setCourseId] = useState<string | undefined>(initialCourseId);
  const [title, setTitle] = useState("Untitled Course");
  const [description, setDescription] = useState("");
  const [pricingModel, setPricingModel] = useState<"FREE" | "PAID" | "SUBSCRIPTION">("FREE");
  const [status, setStatus] = useState("DRAFT");

  const [modules, setModules] = useState<ModuleNode[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeLessonTitle, setActiveLessonTitle] = useState("Untitled Lesson");
  const [activeLessonInitialContent, setActiveLessonInitialContent] = useState<
    TiptapDocument | undefined
  >(undefined);

  const [qbOpen, setQbOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // ── Bootstrap: create or load course on mount ─────────────────────────────

  useEffect(() => {
    async function bootstrap() {
      if (initialCourseId) {
        // Load existing course
        try {
          const course = await api.get<CourseResponse>(`/api/courses/${initialCourseId}`);
          setTitle(course.title);
          setDescription(course.description ?? "");
          setPricingModel(course.pricingModel as "FREE" | "PAID" | "SUBSCRIPTION");
          setStatus(course.status);
          setModules(
            course.modules.map((m) => ({
              ...m,
              expanded: true,
              chapters: m.chapters.map((c) => ({
                ...c,
                expanded: true,
                lessons: c.lessons,
              })),
            }))
          );
        } catch (e) {
          console.error("Failed to load course", e);
        }
      } else {
        // Create new course immediately to get a real ID
        try {
          const course = await api.post<CourseResponse>("/api/courses", {
            authorId: TEMP_AUTHOR_ID,
            title: "Untitled Course",
          });
          setCourseId(course.id);
          setTitle(course.title);
          setStatus(course.status);
          // Optionally: history.replaceState to update URL without navigation
          if (typeof window !== "undefined") {
            window.history.replaceState(
              null,
              "",
              `/dashboard/content/course/${course.id}/edit`
            );
          }
        } catch (e) {
          console.error("Failed to create course", e);
        }
      }
      setIsInitializing(false);
    }
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Draft-aware lesson selection ──────────────────────────────────────────

  const openLesson = useCallback(
    async (lesson: LessonNode) => {
      setActiveLessonId(lesson.id);
      setActiveLessonTitle(lesson.title);

      // Try to restore from backend draft first
      try {
        const draft = await api.get<{ body: string; savedAt: string } | null>(
          `/api/lessons/${lesson.id}/draft`
        );
        if (draft?.body) {
          setActiveLessonInitialContent(JSON.parse(draft.body) as TiptapDocument);
          return;
        }
      } catch {
        // Fallback to localStorage if backend is unreachable
      }

      // Fallback: localStorage
      const localDraft = localStorage.getItem(`arcade-draft-${lesson.id}`);
      if (localDraft) {
        try {
          setActiveLessonInitialContent(JSON.parse(localDraft) as TiptapDocument);
          return;
        } catch {
          // ignore corrupt data
        }
      }

      // Fallback: lesson body saved in DB
      if (lesson.body) {
        try {
          setActiveLessonInitialContent(JSON.parse(lesson.body) as TiptapDocument);
          return;
        } catch {
          // ignore
        }
      }

      setActiveLessonInitialContent(undefined);
    },
    []
  );

  // ── Auto-save handler ─────────────────────────────────────────────────────

  const handleSave = useCallback(
    async (doc: TiptapDocument) => {
      if (!activeLessonId) return;
      const jsonStr = JSON.stringify(doc);

      // 1. Immediate local fallback
      localStorage.setItem(`arcade-draft-${activeLessonId}`, jsonStr);

      // 2. Durable backend save
      try {
        await api.put(`/api/lessons/${activeLessonId}/draft`, { body: jsonStr });
      } catch (e) {
        console.warn("Draft save to backend failed, localStorage preserved.", e);
      }
    },
    [activeLessonId]
  );

  // ── Tree mutation: Add Module ──────────────────────────────────────────────

  const addModule = useCallback(async () => {
    if (!courseId) return;
    try {
      const m = await api.post<ModuleResponse>(`/api/courses/${courseId}/modules`, {
        title: `Module ${modules.length + 1}`,
      });
      setModules((prev) => [
        ...prev,
        { id: m.id, title: m.title, position: m.position, chapters: [], expanded: true },
      ]);
    } catch (e) {
      console.error("Failed to add module", e);
    }
  }, [courseId, modules.length]);

  // ── Tree mutation: Add Lesson (auto-creates a chapter if none exist) ───────

  const addLesson = useCallback(
    async (moduleId: string) => {
      if (!courseId) return;
      try {
        const mod = modules.find((m) => m.id === moduleId);
        if (!mod) return;

        let targetChapter: ChapterNode | undefined = mod.chapters[0];

        if (!targetChapter) {
          // Create the first chapter for this module
          const newChapter = await api.post<ChapterResponse>(
            `/api/modules/${moduleId}/chapters`,
            { title: "Chapter 1" }
          );
          targetChapter = {
            id: newChapter.id,
            title: newChapter.title,
            position: newChapter.position,
            lessons: [],
            expanded: true,
          };
          setModules((prev) =>
            prev.map((m) =>
              m.id === moduleId
                ? { ...m, chapters: [...m.chapters, targetChapter!] }
                : m
            )
          );
        }

        const newLesson = await api.post<LessonResponse>(
          `/api/chapters/${targetChapter.id}/lessons`,
          { title: `Lesson ${targetChapter.lessons.length + 1}` }
        );

        setModules((prev) =>
          prev.map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  chapters: m.chapters.map((c) =>
                    c.id === targetChapter!.id
                      ? { ...c, lessons: [...c.lessons, newLesson] }
                      : c
                  ),
                }
              : m
          )
        );

        // Open the new lesson
        await openLesson(newLesson);
      } catch (e) {
        console.error("Failed to add lesson", e);
      }
    },
    [courseId, modules, openLesson]
  );

  // ── Lesson title save ─────────────────────────────────────────────────────

  const saveLessonTitle = useCallback(
    async (newTitle: string) => {
      if (!activeLessonId) return;
      setActiveLessonTitle(newTitle);
      try {
        await api.patch(`/api/lessons/${activeLessonId}`, { title: newTitle });
      } catch (e) {
        console.warn("Lesson title save failed", e);
      }
    },
    [activeLessonId]
  );

  // ── Course metadata debounced save ────────────────────────────────────────

  const metaSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleCourseMetaSave = useCallback(
    (patch: Partial<{ title: string; description: string; pricingModel: string }>) => {
      if (!courseId) return;
      if (metaSaveTimeout.current) clearTimeout(metaSaveTimeout.current);
      metaSaveTimeout.current = setTimeout(async () => {
        try {
          await api.patch(`/api/courses/${courseId}`, patch);
        } catch (e) {
          console.warn("Course metadata save failed", e);
        }
      }, 1500);
    },
    [courseId]
  );

  // ── Render ────────────────────────────────────────────────────────────────

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Setting up your course…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <QuestionBankDialog open={qbOpen} onClose={() => setQbOpen(false)} />

      {/* ── Top metadata bar ─────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center gap-4">
          {/* Course title */}
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              scheduleCourseMetaSave({ title: e.target.value });
            }}
            placeholder="Course title"
            className="flex-1 min-w-[200px] text-lg font-semibold text-gray-900 border-0 outline-none focus:ring-1 focus:ring-indigo-200 rounded-lg px-2 py-1 placeholder:text-gray-300"
          />

          {/* Pricing */}
          <select
            value={pricingModel}
            onChange={(e) => {
              const val = e.target.value as "FREE" | "PAID" | "SUBSCRIPTION";
              setPricingModel(val);
              scheduleCourseMetaSave({ pricingModel: val });
            }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-300"
          >
            <option value="FREE">Free</option>
            <option value="PAID">Paid</option>
            <option value="SUBSCRIPTION">Subscription</option>
          </select>

          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
              status === "DRAFT"
                ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                : status === "PUBLISHED"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-gray-100 text-gray-600 border border-gray-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                status === "DRAFT"
                  ? "bg-yellow-400"
                  : status === "PUBLISHED"
                  ? "bg-green-400"
                  : "bg-gray-400"
              }`}
            />
            {status}
          </span>
        </div>

        {/* Description */}
        <div className="mx-auto max-w-7xl mt-2">
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              scheduleCourseMetaSave({ description: e.target.value });
            }}
            placeholder="Add a course description…"
            rows={2}
            className="w-full text-sm text-gray-600 border-0 outline-none focus:ring-1 focus:ring-indigo-200 rounded-lg px-2 py-1 placeholder:text-gray-300 resize-none"
          />
        </div>
      </div>

      {/* ── Main two-panel layout ─────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 120px)" }}>
        {/* ── Left sidebar: course tree ─────────────────────────────── */}
        <aside className="w-72 flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <GraduationCap size={15} className="text-indigo-500" />
              Course Structure
            </div>
          </div>

          {/* Tree scroll area */}
          <div className="flex-1 overflow-y-auto py-2">
            {modules.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-4">
                <Layers size={28} className="text-gray-300" />
                <p className="text-xs text-gray-400">
                  No modules yet. Add a module to get started.
                </p>
              </div>
            )}

            {modules.map((mod) => (
              <div key={mod.id} className="mb-1">
                {/* Module row */}
                <div className="flex items-center gap-1 px-3 py-1.5 group">
                  <button
                    onClick={() =>
                      setModules((prev) =>
                        prev.map((m) =>
                          m.id === mod.id ? { ...m, expanded: !m.expanded } : m
                        )
                      )
                    }
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                  >
                    {mod.expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  </button>
                  <span className="flex-1 text-xs font-semibold text-gray-600 truncate">
                    {mod.title}
                  </span>
                  <button
                    onClick={() => addLesson(mod.id)}
                    title="Add Lesson"
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-indigo-600 transition-opacity"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Chapters + Lessons */}
                {mod.expanded &&
                  mod.chapters.map((chapter) => (
                    <div key={chapter.id} className="ml-4">
                      {/* Chapter title */}
                      <div className="flex items-center gap-1 px-3 py-1 text-xs text-gray-500 font-medium">
                        <BookOpen size={11} className="flex-shrink-0 text-gray-400" />
                        <span className="truncate">{chapter.title}</span>
                      </div>
                      {/* Lessons */}
                      {chapter.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => openLesson(lesson)}
                          className={`w-full flex items-center gap-2 px-5 py-1.5 text-left text-xs transition-colors ${
                            activeLessonId === lesson.id
                              ? "bg-indigo-50 text-indigo-700 font-medium"
                              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                          }`}
                        >
                          <FileText size={11} className="flex-shrink-0" />
                          <span className="truncate">{lesson.title}</span>
                        </button>
                      ))}
                    </div>
                  ))}
              </div>
            ))}
          </div>

          {/* Sidebar footer */}
          <div className="p-3 border-t border-gray-200 space-y-2">
            <button
              onClick={addModule}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg py-2 transition-colors"
            >
              <Plus size={13} />
              Add Module
            </button>
            <button
              onClick={() => setQbOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg py-2 transition-colors"
            >
              <FileText size={13} />
              Create Question Bank
            </button>
          </div>
        </aside>

        {/* ── Main editor panel ─────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {activeLessonId ? (
            <div className="mx-auto max-w-3xl px-4 py-6">
              {/* Lesson title */}
              <input
                type="text"
                value={activeLessonTitle}
                onBlur={(e) => saveLessonTitle(e.target.value)}
                onChange={(e) => setActiveLessonTitle(e.target.value)}
                className="w-full text-2xl font-bold text-gray-900 bg-transparent border-0 outline-none mb-4 placeholder:text-gray-300"
                placeholder="Lesson title"
              />
              {/* Tiptap editor */}
              <ArcadeEditor
                key={activeLessonId} // re-mount on lesson change
                initialContent={activeLessonInitialContent}
                placeholder="Start writing your lesson content…"
                onSave={handleSave}
                className="shadow-sm"
              />
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <FileText size={28} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-700">
                  Select a lesson to start editing
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Or add a module and lesson from the sidebar.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
