// features/content/course/components/CourseEditorShell.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArcadeEditor } from "@/features/content/editor/components/ArcadeEditor";
import type { ArcadeEditorHandle } from "@/features/content/editor/components/ArcadeEditor";
import { api } from "@/lib/api";
import type { CourseResponse, ModuleResponse, LessonResponse } from "@/types/api";
import type { TiptapDocument } from "@/types/editor";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  FileText,
  Layers,
  X,
  GraduationCap,
  Pencil,
  Trash2,
  Send,
  AlertTriangle,
  Settings,
  Copy,
  Check,
  ArrowLeft,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface CourseEditorShellProps {
  courseId?: string; // required in practice — new courses are created via the dashboard modal
}

// ── Local types for tree state (Course → Module → Lesson) ─────────────────────

interface LessonNode {
  id: string;
  title: string;
  body?: string;
  position: number;
}

interface ModuleNode {
  id: string;
  title: string;
  position: number;
  lessons: LessonNode[];
  expanded: boolean;
}

type EditKind = "module" | "lesson";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
}

// ── Reusable confirmation dialog ─────────────────────────────────────────────

function ConfirmDialog({
  options,
  onClose,
}: {
  options: ConfirmOptions | null;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setBusy(false);
  }, [options]);

  if (!options) return null;
  const { title, message, confirmLabel, danger } = options;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !busy && onClose()}
      />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex gap-3">
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${danger ? "bg-red-50" : "bg-indigo-50"
              }`}
          >
            <AlertTriangle
              size={20}
              className={danger ? "text-red-500" : "text-indigo-500"}
            />
          </div>
          <div className="flex-1 pt-0.5">
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">{message}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await options.onConfirm();
                onClose();
              } finally {
                setBusy(false);
              }
            }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${danger
              ? "bg-red-600 hover:bg-red-700"
              : "bg-indigo-600 hover:bg-indigo-700"
              }`}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Question Bank placeholder dialog ─────────────────────────────────────────

function QuestionBankDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
            <FileText size={22} className="text-indigo-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Question Bank</h3>
          <p className="text-sm leading-relaxed text-gray-500">
            The Question Bank editor is coming in the next phase. You&apos;ll be able to
            create MCQ, short answer, and coding questions linked to this course.
          </p>
          <button
            onClick={onClose}
            className="mt-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Small icon button used in the tree rows ──────────────────────────────────

function IconBtn({
  title,
  onClick,
  danger,
  children,
}: {
  title: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`rounded p-1 text-gray-400 transition-colors ${danger ? "hover:bg-red-50 hover:text-red-600" : "hover:bg-gray-200 hover:text-gray-700"
        }`}
    >
      {children}
    </button>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, { badge: string; dot: string }> = {
    DRAFT: { badge: "bg-yellow-50 text-yellow-700 border-yellow-200", dot: "bg-yellow-400" },
    SUBMITTED: { badge: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-400" },
    APPROVED: { badge: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-400" },
    PUBLISHED: { badge: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-400" },
    ARCHIVED: { badge: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400" },
  };
  const s = styles[status] ?? styles.ARCHIVED;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${s.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

// ── Course settings panel (with GitHub-style Danger Zone) ────────────────────

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 py-2.5 last:border-b-0">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className="min-w-0 text-right text-sm text-gray-800">{children}</span>
    </div>
  );
}

function CourseSettingsPanel({
  courseId,
  title,
  description,
  status,
  pricingModel,
  createdAt,
  updatedAt,
  onDeleted,
  onDescriptionChange,
}: {
  courseId?: string;
  title: string;
  description: string;
  status: string;
  pricingModel: string;
  createdAt: string | null;
  updatedAt: string | null;
  onDeleted: () => void;
  onDescriptionChange: (desc: string) => void;
}) {
  const [dangerOpen, setDangerOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [localDesc, setLocalDesc] = useState(description);

  // Keep local state in sync when the parent description changes (e.g. initial load)
  useEffect(() => {
    setLocalDesc(description);
  }, [description]);

  const canDelete = confirmText === title && !deleting && !!courseId;
  const fmt = (d: string | null) => (d ? new Date(d).toLocaleString() : "—");

  async function handleDelete() {
    if (!canDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await api.delete(`/api/courses/${courseId}`, { confirmTitle: confirmText });
      onDeleted();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setDeleting(false);
    }
  }

  function copyId() {
    if (!courseId) return;
    navigator.clipboard?.writeText(courseId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-6 lg:px-10">
      <h2 className="mb-1 text-lg font-bold text-gray-900">Course Settings</h2>
      <p className="mb-6 text-sm text-gray-500">
        Manage your course details and other configuration options.
      </p>

      {/* Course info */}
      <div className="rounded-xl border border-gray-200 bg-white px-5 py-2 shadow-sm">
        <InfoRow label="Title">{title || "Untitled Course"}</InfoRow>
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 py-2.5">
          <span className="flex-shrink-0 text-sm font-medium text-gray-500">Description</span>
          <textarea
            value={localDesc}
            onChange={(e) => setLocalDesc(e.target.value)}
            onBlur={() => onDescriptionChange(localDesc)}
            rows={3}
            placeholder="Add a course description…"
            className="min-w-0 flex-1 resize-none rounded-lg border border-gray-200 px-2.5 py-1.5 text-left text-sm text-gray-800 outline-none placeholder:text-gray-300 focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200"
          />
        </div>
        <InfoRow label="Course ID">
          <button
            type="button"
            onClick={copyId}
            title="Copy ID"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-600 hover:text-indigo-600"
          >
            {courseId}
            {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
          </button>
        </InfoRow>
        <InfoRow label="Status">
          <StatusPill status={status} />
        </InfoRow>
        <InfoRow label="Pricing">{pricingModel === "PAID" ? "Paid" : "Free"}</InfoRow>
        <InfoRow label="Created">{fmt(createdAt)}</InfoRow>
        <InfoRow label="Last updated">{fmt(updatedAt)}</InfoRow>
      </div>

      {/* Danger Zone */}
      <div className="mt-8 rounded-xl border border-red-200 bg-white shadow-sm">
        <div className="border-b border-red-100 px-5 py-3">
          <h3 className="text-sm font-semibold text-red-700">Danger Zone</h3>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-gray-600">
            Deleting this course moves it to your <span className="font-medium">Trash</span>. You
            can restore it later, or permanently delete it from there.
          </p>

          {!dangerOpen ? (
            <button
              type="button"
              onClick={() => setDangerOpen(true)}
              className="mt-3 rounded-lg border border-red-300 px-3.5 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              Delete this course
            </button>
          ) : (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50/50 p-4">
              <label className="block text-sm text-gray-700">
                To confirm, type <span className="font-semibold">{title}</span> below:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                autoFocus
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-300"
                placeholder={title}
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDangerOpen(false);
                    setConfirmText("");
                    setError(null);
                  }}
                  className="rounded-lg px-3.5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!canDelete}
                  onClick={handleDelete}
                  className="rounded-lg bg-red-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting ? "Moving to Trash…" : "Move to Trash"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Shell ────────────────────────────────────────────────────────────────

export function CourseEditorShell({ courseId: initialCourseId }: CourseEditorShellProps) {
  const router = useRouter();
  const [courseId] = useState<string | undefined>(initialCourseId);
  const [title, setTitle] = useState("Untitled Course");
  const [description, setDescription] = useState("");
  const [pricingModel, setPricingModel] = useState<"FREE" | "PAID">("FREE");
  const [status, setStatus] = useState("DRAFT");
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const [modules, setModules] = useState<ModuleNode[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeLessonTitle, setActiveLessonTitle] = useState("Untitled Lesson");
  const [activeLessonInitialContent, setActiveLessonInitialContent] = useState<
    TiptapDocument | undefined
  >(undefined);

  const [qbOpen, setQbOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [navigatingBack, setNavigatingBack] = useState(false);

  // Imperative handle to force-save the open lesson before navigating away.
  const editorRef = useRef<ArcadeEditorHandle>(null);

  // Main-panel view: the lesson editor ("tree") or the course Settings screen.
  const [view, setView] = useState<"tree" | "settings">("tree");

  // Sidebar collapse state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Inline rename + confirm dialog state
  const [editing, setEditing] = useState<{ kind: EditKind; id: string } | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [confirm, setConfirm] = useState<ConfirmOptions | null>(null);

  // ── Bootstrap: create or load course on mount ─────────────────────────────

  useEffect(() => {
    // Courses are created via the dashboard modal; the editor only ever loads an
    // existing course. A missing id means we arrived here without one — go home.
    if (!initialCourseId) {
      router.replace("/dashboard");
      return;
    }
    async function bootstrap() {
      try {
        const course = await api.get<CourseResponse>(`/api/courses/${initialCourseId}`);
        setTitle(course.title);
        setDescription(course.description ?? "");
        setPricingModel(course.pricingModel as "FREE" | "PAID");
        setStatus(course.status);
        setCreatedAt(course.createdAt);
        setUpdatedAt(course.updatedAt);
        setModules(
          course.modules.map((m) => ({
            id: m.id,
            title: m.title,
            position: m.position,
            lessons: m.lessons,
            expanded: true,
          }))
        );
      } catch (e) {
        console.error("Failed to load course", e);
      }
      setIsInitializing(false);
    }
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Draft-aware lesson selection ──────────────────────────────────────────

  const openLesson = useCallback(async (lesson: LessonNode) => {
    setView("tree");

    // Flush any pending edits in the currently-open lesson before switching away.
    // Unmounting the editor cancels its debounced auto-save, so without this the
    // last few seconds of typing would be lost on a lesson switch.
    if (editorRef.current) {
      try {
        await editorRef.current.flush();
      } catch {
        // best-effort — proceed with the switch regardless
      }
    }

    // Resolve this lesson's content BEFORE switching the editor to it. The editor
    // is keyed on activeLessonId and Tiptap only reads `content` at mount, so the
    // content must be known at the moment the key changes. Setting the id first
    // and fetching afterwards mounts the editor empty and drops the fetched draft.
    let content: TiptapDocument | undefined;

    try {
      const draft = await api.get<{ body: string; savedAt: string } | null>(
        `/api/lessons/${lesson.id}/draft`
      );
      if (draft?.body) {
        content = JSON.parse(draft.body) as TiptapDocument;
      }
    } catch {
      // Fall back to localStorage if the backend is unreachable
    }

    if (!content) {
      const localDraft = localStorage.getItem(`arcade-draft-${lesson.id}`);
      if (localDraft) {
        try {
          content = JSON.parse(localDraft) as TiptapDocument;
        } catch {
          // ignore corrupt data
        }
      }
    }

    if (!content && lesson.body) {
      try {
        content = JSON.parse(lesson.body) as TiptapDocument;
      } catch {
        // ignore
      }
    }

    // Commit all three together: React batches these so the editor remounts once,
    // with the correct initialContent already in place.
    setActiveLessonTitle(lesson.title);
    setActiveLessonInitialContent(content);
    setActiveLessonId(lesson.id);
  }, []);

  // ── Auto-save handler ─────────────────────────────────────────────────────

  const handleSave = useCallback(
    async (doc: TiptapDocument) => {
      if (!activeLessonId) return;
      const jsonStr = JSON.stringify(doc);
      localStorage.setItem(`arcade-draft-${activeLessonId}`, jsonStr);
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
        { id: m.id, title: m.title, position: m.position, lessons: [], expanded: true },
      ]);
    } catch (e) {
      console.error("Failed to add module", e);
    }
  }, [courseId, modules.length]);

  // ── Tree mutation: Add Lesson (directly under a module) ────────────────────

  const addLesson = useCallback(
    async (moduleId: string) => {
      if (!courseId) return;
      try {
        const mod = modules.find((m) => m.id === moduleId);
        const nextIndex = (mod?.lessons.length ?? 0) + 1;
        const newLesson = await api.post<LessonResponse>(
          `/api/modules/${moduleId}/lessons`,
          { title: `Lesson ${nextIndex}` }
        );
        setModules((prev) =>
          prev.map((m) =>
            m.id === moduleId
              ? { ...m, expanded: true, lessons: [...m.lessons, newLesson] }
              : m
          )
        );
        await openLesson(newLesson);
      } catch (e) {
        console.error("Failed to add lesson", e);
      }
    },
    [courseId, modules, openLesson]
  );

  // ── Inline rename ─────────────────────────────────────────────────────────

  const startEdit = (kind: EditKind, id: string, current: string) => {
    setEditing({ kind, id });
    setEditingValue(current);
  };

  const commitEdit = async () => {
    if (!editing) return;
    const { kind, id } = editing;
    const value = editingValue.trim();
    setEditing(null);
    if (!value) return;

    if (kind === "module") {
      setModules((prev) => prev.map((m) => (m.id === id ? { ...m, title: value } : m)));
      try {
        await api.patch(`/api/modules/${id}`, { title: value });
      } catch (e) {
        console.warn("Module rename failed", e);
      }
    } else {
      setModules((prev) =>
        prev.map((m) => ({
          ...m,
          lessons: m.lessons.map((l) => (l.id === id ? { ...l, title: value } : l)),
        }))
      );
      if (activeLessonId === id) setActiveLessonTitle(value);
      try {
        await api.patch(`/api/lessons/${id}`, { title: value });
      } catch (e) {
        console.warn("Lesson rename failed", e);
      }
    }
  };

  // ── Deletion ──────────────────────────────────────────────────────────────

  const deleteModuleNow = async (mod: ModuleNode) => {
    const hadActive = mod.lessons.some((l) => l.id === activeLessonId);
    setModules((prev) => prev.filter((m) => m.id !== mod.id));
    if (hadActive) {
      setActiveLessonId(null);
      setActiveLessonInitialContent(undefined);
    }
    try {
      await api.delete(`/api/modules/${mod.id}`);
    } catch (e) {
      console.error("Failed to delete module", e);
    }
  };

  const deleteLessonNow = async (lessonId: string) => {
    setModules((prev) =>
      prev.map((m) => ({ ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }))
    );
    if (activeLessonId === lessonId) {
      setActiveLessonId(null);
      setActiveLessonInitialContent(undefined);
    }
    try {
      await api.delete(`/api/lessons/${lessonId}`);
    } catch (e) {
      console.error("Failed to delete lesson", e);
    }
  };

  const askDeleteModule = (mod: ModuleNode) =>
    setConfirm({
      title: "Delete module?",
      message: `"${mod.title}" and all of its lessons will be permanently deleted. This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
      onConfirm: () => deleteModuleNow(mod),
    });

  const askDeleteLesson = (lesson: LessonNode) =>
    setConfirm({
      title: "Delete lesson?",
      message: `"${lesson.title}" and its saved draft will be permanently deleted. This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
      onConfirm: () => deleteLessonNow(lesson.id),
    });

  // ── Lesson title save (from main editor input) ────────────────────────────

  const saveLessonTitle = useCallback(
    async (newTitle: string) => {
      if (!activeLessonId) return;
      const value = newTitle.trim() || "Untitled Lesson";
      setActiveLessonTitle(value);
      setModules((prev) =>
        prev.map((m) => ({
          ...m,
          lessons: m.lessons.map((l) =>
            l.id === activeLessonId ? { ...l, title: value } : l
          ),
        }))
      );
      try {
        await api.patch(`/api/lessons/${activeLessonId}`, { title: value });
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

  // ── Back to dashboard (flush every pending save first) ────────────────────

  const handleBack = useCallback(async () => {
    if (navigatingBack) return;
    setNavigatingBack(true);

    // Cancel any queued debounced course-metadata save; we save synchronously below.
    if (metaSaveTimeout.current) {
      clearTimeout(metaSaveTimeout.current);
      metaSaveTimeout.current = null;
    }

    const tasks: Promise<unknown>[] = [];

    if (courseId) {
      tasks.push(
        api
          .patch(`/api/courses/${courseId}`, { title, description, pricingModel })
          .catch((e) => console.warn("Course metadata flush failed", e))
      );
    }

    if (activeLessonId) {
      // Persist the lesson title, then flush the editor body (bypasses its debounce).
      tasks.push(
        api
          .patch(`/api/lessons/${activeLessonId}`, {
            title: activeLessonTitle.trim() || "Untitled Lesson",
          })
          .catch((e) => console.warn("Lesson title flush failed", e))
      );
      if (editorRef.current) {
        tasks.push(
          Promise.resolve(editorRef.current.flush()).catch((e) =>
            console.warn("Lesson body flush failed", e)
          )
        );
      }
    }

    await Promise.all(tasks);
    router.push("/dashboard");
  }, [
    navigatingBack,
    courseId,
    title,
    description,
    pricingModel,
    activeLessonId,
    activeLessonTitle,
    router,
  ]);

  // ── Submit for review ─────────────────────────────────────────────────────

  const askSubmit = () =>
    setConfirm({
      title: "Submit for review?",
      message:
        "This course will be sent to an admin for review. You can keep editing while it is under review.",
      confirmLabel: "Submit",
      onConfirm: async () => {
        if (!courseId) return;
        try {
          const updated = await api.post<CourseResponse>(
            `/api/courses/${courseId}/submit`,
            {}
          );
          setStatus(updated.status);
        } catch (e) {
          console.error("Failed to submit course", e);
        }
      },
    });

  // ── Inline rename input (shared) ──────────────────────────────────────────

  const renameInput = (className: string) => (
    <input
      autoFocus
      value={editingValue}
      onChange={(e) => setEditingValue(e.target.value)}
      onBlur={commitEdit}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commitEdit();
        } else if (e.key === "Escape") {
          setEditing(null);
        }
      }}
      className={`min-w-0 flex-1 rounded border border-indigo-300 bg-white px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-indigo-300 ${className}`}
    />
  );

  const isEditing = (kind: EditKind, id: string) =>
    editing?.kind === kind && editing.id === id;

  // ── Render ────────────────────────────────────────────────────────────────

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-gray-500">Setting up your course…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <QuestionBankDialog open={qbOpen} onClose={() => setQbOpen(false)} />
      <ConfirmDialog options={confirm} onClose={() => setConfirm(null)} />

      {/* ── Top metadata bar ─────────────────────────────────────────────── */}
      <header className="flex-shrink-0 border-b border-gray-200 bg-white px-5 py-2.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={navigatingBack}
            title="Save and return to dashboard"
            className="flex flex-shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-60"
          >
            <ArrowLeft size={16} />
            {navigatingBack ? "Saving…" : "Back"}
          </button>
          <div className="h-5 w-px flex-shrink-0 bg-gray-200" />
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              scheduleCourseMetaSave({ title: e.target.value });
            }}
            placeholder="Course title"
            className="min-w-0 flex-1 rounded-lg border-0 px-1.5 py-1 text-base font-semibold text-gray-900 outline-none placeholder:text-gray-300 focus:ring-1 focus:ring-indigo-200"
          />

          <StatusPill status={status} />

          {status === "DRAFT" && (
            <button
              type="button"
              onClick={askSubmit}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              <Send size={14} />
              Submit for Review
            </button>
          )}
        </div>
      </header>

      {/* ── Main two-panel layout ─────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1">
        {/* ── Left sidebar: course tree ─────────────────────────────── */}
        <aside
          className={`relative flex flex-shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-gray-50 transition-[width] duration-300 ease-in-out ${sidebarOpen ? "w-64" : "w-10"
            }`}
        >
          {/* ── Sidebar header (always visible) ───────────────── */}
          <div className={`flex flex-shrink-0 items-center bg-gray-50 ${sidebarOpen ? "border-b border-gray-200" : ""}`}>
            {sidebarOpen && (
              <div className="flex min-w-0 flex-1 items-center gap-2 px-4 py-2.5">
                <GraduationCap size={15} className="flex-shrink-0 text-indigo-500" />
                <span className="truncate text-sm font-semibold text-gray-700">Course Structure</span>
              </div>
            )}
            <button
              type="button"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              onClick={() => setSidebarOpen((o) => !o)}
              className={`flex flex-shrink-0 items-center justify-center rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 ${sidebarOpen ? "mr-1" : "mx-auto"
                }`}
            >
              {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
          </div>

          {/* ── Collapsible body ──────────────────────────────── */}
          <div
            className={`flex min-h-0 flex-1 flex-col transition-opacity duration-200 ${sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
          >
            {/* Tree scroll area */}
            <div className="flex-1 overflow-y-auto p-2">
              {modules.length === 0 && (
                <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
                  <Layers size={28} className="text-gray-300" />
                  <p className="text-xs text-gray-400">
                    No modules yet. Add a module to get started.
                  </p>
                </div>
              )}

              {modules.map((mod) => (
                <div key={mod.id} className="mb-0.5">
                  {/* Module row */}
                  <div className="group flex items-center gap-1 rounded-md px-1.5 py-1 hover:bg-gray-100">
                    <button
                      type="button"
                      onClick={() =>
                        setModules((prev) =>
                          prev.map((m) =>
                            m.id === mod.id ? { ...m, expanded: !m.expanded } : m
                          )
                        )
                      }
                      className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                    >
                      {mod.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    {isEditing("module", mod.id) ? (
                      renameInput("text-xs font-semibold text-gray-700")
                    ) : (
                      <span
                        onDoubleClick={() => startEdit("module", mod.id, mod.title)}
                        className="flex-1 truncate text-xs font-semibold text-gray-700"
                        title={mod.title}
                      >
                        {mod.title}
                      </span>
                    )}

                    <div className="flex flex-shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <IconBtn title="Add lesson" onClick={() => addLesson(mod.id)}>
                        <Plus size={12} />
                      </IconBtn>
                      <IconBtn title="Rename module" onClick={() => startEdit("module", mod.id, mod.title)}>
                        <Pencil size={12} />
                      </IconBtn>
                      <IconBtn title="Delete module" danger onClick={() => askDeleteModule(mod)}>
                        <Trash2 size={12} />
                      </IconBtn>
                    </div>
                  </div>

                  {/* Lessons directly under the module */}
                  {mod.expanded && (
                    <div className="ml-3 border-l border-gray-200 pl-1.5">
                      {mod.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className={`group flex items-center gap-1 rounded-md pl-2 pr-1.5 ${activeLessonId === lesson.id ? "bg-indigo-50" : "hover:bg-gray-100"
                            }`}
                        >
                          <button
                            type="button"
                            onClick={() => openLesson(lesson)}
                            className={`flex min-w-0 flex-1 items-center gap-1.5 py-1.5 text-left text-xs ${activeLessonId === lesson.id
                              ? "font-medium text-indigo-700"
                              : "text-gray-500"
                              }`}
                          >
                            <FileText size={11} className="flex-shrink-0" />
                            {isEditing("lesson", lesson.id) ? (
                              renameInput("text-xs")
                            ) : (
                              <span className="truncate" title={lesson.title}>
                                {lesson.title}
                              </span>
                            )}
                          </button>
                          <div className="flex flex-shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                            <IconBtn
                              title="Rename lesson"
                              onClick={() => startEdit("lesson", lesson.id, lesson.title)}
                            >
                              <Pencil size={12} />
                            </IconBtn>
                            <IconBtn title="Delete lesson" danger onClick={() => askDeleteLesson(lesson)}>
                              <Trash2 size={12} />
                            </IconBtn>
                          </div>
                        </div>
                      ))}

                      {/* Add lesson to this module */}
                      <button
                        type="button"
                        onClick={() => addLesson(mod.id)}
                        className="mt-0.5 flex items-center gap-1 py-1 pl-2 text-[11px] font-medium text-gray-400 hover:text-indigo-600"
                      >
                        <Plus size={11} />
                        Add lesson
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Sidebar footer */}
            <div className="space-y-2 border-t border-gray-200 p-3">
              <button
                type="button"
                onClick={addModule}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                <Plus size={14} />
                Add Module
              </button>
              <button
                type="button"
                onClick={() => setQbOpen(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gray-100 py-2 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
              >
                <FileText size={13} />
                Create Question Bank
              </button>
              <button
                type="button"
                onClick={() => setView((v) => (v === "settings" ? "tree" : "settings"))}
                className={`flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors ${view === "settings"
                  ? "bg-indigo-50 text-indigo-700"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                  }`}
              >
                <Settings size={13} />
                Course Settings
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main editor panel ─────────────────────────────────────── */}
        <main className="flex min-h-0 flex-1 flex-col bg-gray-50">
          {view === "settings" ? (
            <div className="min-h-0 flex-1 overflow-y-auto">
              <CourseSettingsPanel
                courseId={courseId}
                title={title}
                description={description}
                status={status}
                pricingModel={pricingModel}
                createdAt={createdAt}
                updatedAt={updatedAt}
                onDeleted={() => router.push("/dashboard")}
                onDescriptionChange={(desc) => {
                  setDescription(desc);
                  scheduleCourseMetaSave({ description: desc });
                }}
              />
            </div>
          ) : activeLessonId ? (
            <div className="flex min-h-0 flex-1 flex-col px-6 py-4 lg:px-10 lg:py-6">
              <input
                type="text"
                value={activeLessonTitle}
                onBlur={(e) => saveLessonTitle(e.target.value)}
                onChange={(e) => setActiveLessonTitle(e.target.value)}
                className="mb-3 w-full border-0 bg-transparent text-2xl font-bold text-gray-900 outline-none placeholder:text-gray-300"
                placeholder="Lesson title"
              />
              <ArcadeEditor
                key={activeLessonId}
                ref={editorRef}
                initialContent={activeLessonInitialContent}
                placeholder="Start writing your lesson content…"
                onSave={handleSave}
                className="min-h-0 flex-1 shadow-sm"
              />
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                <FileText size={28} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-700">
                  Select a lesson to start editing
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  Add a module, then a lesson from the sidebar to begin.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
