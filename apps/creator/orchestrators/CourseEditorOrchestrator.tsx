// features/content/course/components/CourseEditorShell.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type * as Y from "yjs";
import { ArcadeEditor } from "@/apps/creator/editor";
import type { ArcadeEditorHandle } from "@/apps/creator/editor";
import { VersionHistoryOrchestrator } from "./VersionHistoryOrchestrator";
import { LessonFeedbackOrchestrator } from "./LessonFeedbackOrchestrator";

import {
  createYDoc,
  applyBase64Update,
  encodeStateBase64,
  encodeSnapshotBase64,
} from "@/apps/creator/editor";
import { QuizEditor } from "@/domains/assessments";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/design-system/ui/dropdown-menu";
import { api } from "@/infrastructure/http/api";
import type {
  CourseResponse,
  ModuleResponse,
  LessonResponse,
  QuizResponse,
} from "@/shared/types/api.types";
import type { TiptapDocument } from "@/shared/types/editor.types";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  FileText,
  ListChecks,
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
  History,
  MessageSquare,
  Lock,
} from "lucide-react";

/** How long (of edit activity) between automatic version snapshots. */
const SNAPSHOT_INTERVAL_MS = 5 * 60 * 1000;

interface CourseEditorOrchestratorProps {
  courseId?: string; // required in practice — new courses are created via the dashboard modal
}

// ── Local types for tree state (Course → Module → Lesson) ─────────────────────

interface LessonNode {
  id: string;
  title: string;
  body?: string;
  position: number;
}

interface QuizNode {
  id: string;
  title: string;
  position: number;
}

interface ModuleNode {
  id: string;
  title: string;
  position: number;
  lessons: LessonNode[];
  quizzes: QuizNode[];
  expanded: boolean;
}

type EditKind = "module" | "lesson" | "quiz";

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

export function CourseEditorOrchestrator({ courseId: initialCourseId }: CourseEditorOrchestratorProps) {
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
  // A quiz item is open in the main panel (mutually exclusive with a lesson).
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [activeQuizTitle, setActiveQuizTitle] = useState("Untitled Quiz");
  // Legacy JSON to seed into a fresh Y.Doc for lessons that predate version history.
  const [activeSeedContent, setActiveSeedContent] = useState<TiptapDocument | undefined>(
    undefined
  );

  // ── Yjs version-history state ─────────────────────────────────────────────
  // The editor binds to a per-lesson Y.Doc (the CRDT source of truth). We keep a
  // ref to encode its state on save without re-binding, plus the timestamp of the
  // last auto-snapshot to pace the periodic timeline.
  const [activeYDoc, setActiveYDoc] = useState<Y.Doc | null>(null);
  const activeYDocRef = useRef<Y.Doc | null>(null);
  const lastSnapshotAtRef = useRef(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

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
            quizzes: m.quizzes ?? [],
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

  /** Best-effort legacy content for a lesson without persisted CRDT state. */
  const resolveLegacyContent = useCallback(
    (lesson: LessonNode, docBody: string | null): TiptapDocument | undefined => {
      const sources = [
        docBody,
        localStorage.getItem(`arcade-draft-${lesson.id}`),
        lesson.body ?? null,
      ];
      for (const src of sources) {
        if (!src) continue;
        try {
          return JSON.parse(src) as TiptapDocument;
        } catch {
          // try the next source
        }
      }
      return undefined;
    },
    []
  );

  const openLesson = useCallback(
    async (lesson: LessonNode) => {
      setView("tree");
      setHistoryOpen(false);

      // Flush pending edits in the currently-open lesson before switching away.
      // Unmounting the editor cancels its debounced auto-save, so without this the
      // last few seconds of typing would be lost on a lesson switch.
      if (editorRef.current) {
        try {
          await editorRef.current.flush();
        } catch {
          // best-effort — proceed with the switch regardless
        }
      }

      // The previous lesson's Y.Doc is torn down by the activeYDoc effect cleanup
      // below, which runs only after its editor has unmounted (safe unbind).

      // Build a fresh Y.Doc and hydrate it BEFORE the editor mounts. The editor is
      // keyed on activeLessonId; Collaboration reads the Y.Doc at mount, so the
      // CRDT state must be in place at the moment the key changes.
      const ydoc = createYDoc();
      let seed: TiptapDocument | undefined;

      try {
        const doc = await api.get<{
          ydocState: string | null;
          body: string | null;
        } | null>(`/api/lessons/${lesson.id}/document`);
        if (doc?.ydocState) {
          applyBase64Update(ydoc, doc.ydocState);
        } else {
          // No CRDT state yet — migrate legacy JSON into the fresh Y.Doc.
          seed = resolveLegacyContent(lesson, doc?.body ?? null);
        }
      } catch {
        // Backend unreachable — fall back to local/legacy content.
        seed = resolveLegacyContent(lesson, null);
      }

      activeYDocRef.current = ydoc;
      lastSnapshotAtRef.current = 0; // snapshot early in a fresh editing session

      // Commit together: React batches these so the editor remounts once, bound to
      // the hydrated Y.Doc with any legacy seed ready.
      setActiveQuizId(null);
      setActiveYDoc(ydoc);
      setActiveSeedContent(seed);
      setActiveLessonTitle(lesson.title);
      setActiveLessonId(lesson.id);
    },
    [resolveLegacyContent]
  );

  // ── Open a quiz item (mutually exclusive with a lesson) ────────────────────
  const openQuiz = useCallback(async (quiz: QuizNode) => {
    setView("tree");
    setHistoryOpen(false);

    // Flush and tear down any open lesson editor before switching to the quiz.
    if (editorRef.current) {
      try {
        await editorRef.current.flush();
      } catch {
        // best-effort
      }
    }
    activeYDocRef.current = null;
    setActiveYDoc(null);
    setActiveSeedContent(undefined);
    setActiveLessonId(null);

    setActiveQuizTitle(quiz.title);
    setActiveQuizId(quiz.id);
  }, []);

  // ── Auto-save handler ─────────────────────────────────────────────────────

  const handleSave = useCallback(
    async (doc: TiptapDocument) => {
      if (!activeLessonId) return;
      const ydoc = activeYDocRef.current;
      if (!ydoc) return;

      const jsonStr = JSON.stringify(doc);
      // localStorage mirror keeps a resilient JSON fallback if the backend is down.
      localStorage.setItem(`arcade-draft-${activeLessonId}`, jsonStr);

      try {
        await api.put(`/api/lessons/${activeLessonId}/document`, {
          ydocState: encodeStateBase64(ydoc),
          body: jsonStr,
        });
      } catch (e) {
        console.warn("Document save failed, localStorage preserved.", e);
        return; // don't snapshot if the head save didn't land
      }

      // Auto-periodic snapshot: once the interval has elapsed since the last one,
      // capture a Yjs snapshot as a new version (the Google-Docs-style timeline).
      const now = Date.now();
      if (now - lastSnapshotAtRef.current > SNAPSHOT_INTERVAL_MS) {
        lastSnapshotAtRef.current = now;
        try {
          await api.post(`/api/lessons/${activeLessonId}/document/versions`, {
            snapshot: encodeSnapshotBase64(ydoc),
            body: jsonStr,
            kind: "AUTO",
          });
          setHistoryRefreshKey((k) => k + 1);
        } catch (e) {
          console.warn("Auto-snapshot failed", e);
        }
      }
    },
    [activeLessonId]
  );

  // ── Restore a past version (client-driven, non-destructive) ────────────────
  const handleRestore = useCallback(
    async (body: TiptapDocument, source: { createdAt: string }) => {
      if (!editorRef.current || !activeLessonId) return;

      // Writing into the editor mutates the bound Y.Doc, so the restore is recorded
      // as a forward edit in history. Flushing persists the new head immediately.
      editorRef.current.setContent(body);
      await editorRef.current.flush();

      // Record the restore itself as a named version so the timeline stays honest.
      try {
        const ydoc = activeYDocRef.current;
        await api.post(`/api/lessons/${activeLessonId}/document/versions`, {
          snapshot: ydoc ? encodeSnapshotBase64(ydoc) : undefined,
          body: JSON.stringify(body),
          kind: "MANUAL",
          label: `Restored from ${new Date(source.createdAt).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}`,
        });
        lastSnapshotAtRef.current = Date.now();
        setHistoryRefreshKey((k) => k + 1);
      } catch (e) {
        console.warn("Failed to record restore point", e);
      }
    },
    [activeLessonId]
  );

  // Destroy each Y.Doc once the editor bound to it has gone. This cleanup runs
  // after the next render commits (i.e. after the keyed ArcadeEditor unmounts and
  // unbinds), so we never destroy a doc that a live editor still references.
  useEffect(() => {
    return () => {
      activeYDoc?.destroy();
    };
  }, [activeYDoc]);

  // ── Tree mutation: Add Module ──────────────────────────────────────────────

  const addModule = useCallback(async () => {
    if (!courseId) return;
    try {
      const m = await api.post<ModuleResponse>(`/api/courses/${courseId}/modules`, {
        title: `Module ${modules.length + 1}`,
      });
      setModules((prev) => [
        ...prev,
        {
          id: m.id,
          title: m.title,
          position: m.position,
          lessons: [],
          quizzes: [],
          expanded: true,
        },
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

  // ── Tree mutation: Add Quiz (sibling of a lesson under a module) ────────────

  const addQuiz = useCallback(
    async (moduleId: string) => {
      if (!courseId) return;
      try {
        const mod = modules.find((m) => m.id === moduleId);
        const nextIndex = (mod?.quizzes.length ?? 0) + 1;
        const newQuiz = await api.post<QuizResponse>(
          `/api/modules/${moduleId}/quizzes`,
          { title: `Quiz ${nextIndex}` }
        );
        setModules((prev) =>
          prev.map((m) =>
            m.id === moduleId
              ? { ...m, expanded: true, quizzes: [...m.quizzes, newQuiz] }
              : m
          )
        );
        await openQuiz(newQuiz);
      } catch (e) {
        console.error("Failed to add quiz", e);
      }
    },
    [courseId, modules, openQuiz]
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
    } else if (kind === "quiz") {
      setModules((prev) =>
        prev.map((m) => ({
          ...m,
          quizzes: m.quizzes.map((q) => (q.id === id ? { ...q, title: value } : q)),
        }))
      );
      if (activeQuizId === id) setActiveQuizTitle(value);
      try {
        await api.patch(`/api/quizzes/${id}`, { title: value });
      } catch (e) {
        console.warn("Quiz rename failed", e);
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
    const hadActiveQuiz = mod.quizzes.some((q) => q.id === activeQuizId);
    setModules((prev) => prev.filter((m) => m.id !== mod.id));
    if (hadActiveQuiz) setActiveQuizId(null);
    if (hadActive) {
      setActiveLessonId(null);
      // The effect cleanup destroys the doc after the editor unmounts.
      activeYDocRef.current = null;
      setActiveYDoc(null);
      setActiveSeedContent(undefined);
      setHistoryOpen(false);
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
      // The effect cleanup destroys the doc after the editor unmounts.
      activeYDocRef.current = null;
      setActiveYDoc(null);
      setActiveSeedContent(undefined);
      setHistoryOpen(false);
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

  const deleteQuizNow = async (quizId: string) => {
    setModules((prev) =>
      prev.map((m) => ({ ...m, quizzes: m.quizzes.filter((q) => q.id !== quizId) }))
    );
    if (activeQuizId === quizId) {
      setActiveQuizId(null);
    }
    try {
      await api.delete(`/api/quizzes/${quizId}`);
    } catch (e) {
      console.error("Failed to delete quiz", e);
    }
  };

  const askDeleteQuiz = (quiz: QuizNode) =>
    setConfirm({
      title: "Delete quiz?",
      message: `"${quiz.title}" and all of its questions will be permanently deleted. This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
      onConfirm: () => deleteQuizNow(quiz.id),
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

  // ── Quiz title save (from main panel input) ───────────────────────────────

  const saveQuizTitle = useCallback(
    async (newTitle: string) => {
      if (!activeQuizId) return;
      const value = newTitle.trim() || "Untitled Quiz";
      setActiveQuizTitle(value);
      setModules((prev) =>
        prev.map((m) => ({
          ...m,
          quizzes: m.quizzes.map((q) =>
            q.id === activeQuizId ? { ...q, title: value } : q
          ),
        }))
      );
      try {
        await api.patch(`/api/quizzes/${activeQuizId}`, { title: value });
      } catch (e) {
        console.warn("Quiz title save failed", e);
      }
    },
    [activeQuizId]
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

    // Save a version snapshot of the open lesson on exit, so leaving the editor
    // always leaves a restorable point in history. Runs after the flush above so it
    // references the just-persisted document state.
    if (activeLessonId && activeYDocRef.current && editorRef.current) {
      const json = editorRef.current.getJSON();
      if (json) {
        try {
          await api.post(`/api/lessons/${activeLessonId}/document/versions`, {
            snapshot: encodeSnapshotBase64(activeYDocRef.current),
            body: JSON.stringify(json),
            kind: "AUTO",
          });
        } catch (e) {
          console.warn("Exit snapshot failed", e);
        }
      }
    }

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
        "This course will be sent to an admin for review, and a version checkpoint is saved for each lesson. You can keep editing while it is under review.",
      confirmLabel: "Submit",
      onConfirm: async () => {
        if (!courseId) return;
        // Flush the open lesson first so its latest edits are persisted before the
        // backend snapshots the whole course into WORKFLOW versions.
        if (editorRef.current) {
          try {
            await editorRef.current.flush();
          } catch {
            // best-effort — proceed with submit regardless
          }
        }
        try {
          const updated = await api.post<CourseResponse>(
            `/api/courses/${courseId}/submit`,
            {}
          );
          setStatus(updated.status);
          // Surface the new "Submitted for review" checkpoint if the panel is open.
          setHistoryRefreshKey((k) => k + 1);
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
      {activeLessonId && (
        <VersionHistoryOrchestrator
          lessonId={activeLessonId}
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          refreshKey={historyRefreshKey}
          onRestore={handleRestore}
          renderEditor={(previewDoc, selectedId) => (
            <ArcadeEditor
              key={selectedId}
              readOnly
              initialContent={previewDoc}
              className="bg-white"
            />
          )}
        />
      )}

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
            disabled={status !== "DRAFT"}
            onChange={(e) => {
              setTitle(e.target.value);
              scheduleCourseMetaSave({ title: e.target.value });
            }}
            placeholder="Course title"
            className="min-w-0 flex-1 rounded-lg border-0 px-1.5 py-1 text-base font-semibold text-gray-900 outline-none placeholder:text-gray-300 focus:ring-1 focus:ring-indigo-200 disabled:opacity-75 disabled:bg-transparent"
          />

          <StatusPill status={status} />

          {status === "DRAFT" && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-400">All changes saved</span>
              <button
                type="button"
                onClick={askSubmit}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                <Send size={14} />
                Submit for Review
              </button>
            </div>
          )}

          {status === "SUBMITTED" && (
            <div className="flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-yellow-800 border border-yellow-200">
              <Lock size={14} className="text-yellow-600" />
              Under Review
            </div>
          )}

          {(status === "APPROVED" || status === "PUBLISHED") && (
            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await api.post(`/api/courses/${courseId}/edit`, {});
                  setStatus("DRAFT");
                  // Refresh other state if necessary, but changing status to DRAFT unlocks it immediately.
                } catch (e) {
                  alert("Failed to revert course to draft mode.");
                }
              }}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 shadow-sm"
            >
              <Pencil size={14} />
              Edit Contents
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
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          title="Add lesson or quiz"
                          className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
                        >
                          <Plus size={12} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" sideOffset={4}>
                          <DropdownMenuItem onClick={() => addLesson(mod.id)}>
                            <FileText size={13} />
                            Lesson
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => addQuiz(mod.id)}>
                            <ListChecks size={13} />
                            Quiz
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <IconBtn title="Rename module" onClick={() => startEdit("module", mod.id, mod.title)}>
                        <Pencil size={12} />
                      </IconBtn>
                      <IconBtn title="Delete module" danger onClick={() => askDeleteModule(mod)}>
                        <Trash2 size={12} />
                      </IconBtn>
                    </div>
                  </div>

                  {/* Lessons and quizzes, interleaved by position */}
                  {mod.expanded && (
                    <div className="ml-3 border-l border-gray-200 pl-1.5">
                      {[
                        ...mod.lessons.map((l) => ({ kind: "lesson" as const, node: l })),
                        ...mod.quizzes.map((q) => ({ kind: "quiz" as const, node: q })),
                      ]
                        .sort((a, b) => a.node.position - b.node.position)
                        .map((item) => {
                          const isActive =
                            item.kind === "lesson"
                              ? activeLessonId === item.node.id
                              : activeQuizId === item.node.id;
                          return (
                            <div
                              key={item.node.id}
                              className={`group flex items-center gap-1 rounded-md pl-2 pr-1.5 ${isActive ? "bg-indigo-50" : "hover:bg-gray-100"
                                }`}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  item.kind === "lesson"
                                    ? openLesson(item.node)
                                    : openQuiz(item.node)
                                }
                                className={`flex min-w-0 flex-1 items-center gap-1.5 py-1.5 text-left text-xs ${isActive
                                  ? "font-medium text-indigo-700"
                                  : "text-gray-500"
                                  }`}
                              >
                                {item.kind === "lesson" ? (
                                  <FileText size={11} className="flex-shrink-0" />
                                ) : (
                                  <ListChecks size={11} className="flex-shrink-0 text-amber-500" />
                                )}
                                {isEditing(item.kind, item.node.id) ? (
                                  renameInput("text-xs")
                                ) : (
                                  <span className="truncate" title={item.node.title}>
                                    {item.node.title}
                                  </span>
                                )}
                              </button>
                              <div className="flex flex-shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                                <IconBtn
                                  title={item.kind === "lesson" ? "Rename lesson" : "Rename quiz"}
                                  onClick={() =>
                                    startEdit(item.kind, item.node.id, item.node.title)
                                  }
                                >
                                  <Pencil size={12} />
                                </IconBtn>
                                <IconBtn
                                  title={item.kind === "lesson" ? "Delete lesson" : "Delete quiz"}
                                  danger
                                  onClick={() =>
                                    item.kind === "lesson"
                                      ? askDeleteLesson(item.node)
                                      : askDeleteQuiz(item.node)
                                  }
                                >
                                  <Trash2 size={12} />
                                </IconBtn>
                              </div>
                            </div>
                          );
                        })}

                      {/* Add lesson / quiz to this module */}
                      <div className="mt-0.5 flex items-center gap-3 pl-2">
                        <button
                          type="button"
                          onClick={() => addLesson(mod.id)}
                          className="flex items-center gap-1 py-1 text-[11px] font-medium text-gray-400 hover:text-indigo-600"
                        >
                          <Plus size={11} />
                          Add lesson
                        </button>
                        <button
                          type="button"
                          onClick={() => addQuiz(mod.id)}
                          className="flex items-center gap-1 py-1 text-[11px] font-medium text-gray-400 hover:text-indigo-600"
                        >
                          <Plus size={11} />
                          Add quiz
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Sidebar footer */}
            {status === "DRAFT" && (
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
            )}
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
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="mb-3 flex items-center gap-3 px-6 pt-4 lg:px-10 lg:pt-6">
                <input
                  type="text"
                  value={activeLessonTitle}
                  disabled={status !== "DRAFT"}
                  onBlur={(e) => saveLessonTitle(e.target.value)}
                  onChange={(e) => setActiveLessonTitle(e.target.value)}
                  className="min-w-0 flex-1 border-0 bg-transparent text-2xl font-bold text-gray-900 outline-none placeholder:text-gray-300 disabled:opacity-75 disabled:bg-transparent"
                  placeholder="Lesson title"
                />
                <button
                  type="button"
                  onClick={() => setHistoryOpen(true)}
                  title="Version history"
                  className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <History size={15} />
                  History
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackOpen(!feedbackOpen)}
                  title="Reviewer Feedback"
                  className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    feedbackOpen
                      ? "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                      : "border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <MessageSquare size={15} />
                  Feedback
                </button>
              </div>
              {activeYDoc && (
                <div className="flex flex-1 min-h-0 relative bg-white">
                  <div className={`flex flex-col flex-1 min-h-0 overflow-y-auto pb-20 px-6 lg:px-10 py-4 lg:py-6 ${status !== "DRAFT" ? "pointer-events-none opacity-80" : ""}`}>
                      <ArcadeEditor
                        key={activeLessonId}
                        ref={editorRef}
                        ydoc={activeYDoc}
                        seedContent={activeSeedContent}
                        placeholder="Start writing your lesson content…"
                        onSave={handleSave}
                        className="shadow-sm min-h-full"
                      />
                    </div>
                  {feedbackOpen && (
                    <div className="w-80 lg:w-96 flex-shrink-0 border-l border-gray-200 bg-white shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10 flex flex-col h-full absolute right-0 top-0 lg:relative lg:shadow-none">
                      <LessonFeedbackOrchestrator lessonId={activeLessonId} className="h-full" />
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : activeQuizId ? (
            <div className="flex min-h-0 flex-1 flex-col px-6 py-4 lg:px-10 lg:py-6">
              <div className="mb-3 flex items-center gap-3">
                <ListChecks size={22} className="flex-shrink-0 text-amber-500" />
                <input
                  type="text"
                  value={activeQuizTitle}
                  onBlur={(e) => saveQuizTitle(e.target.value)}
                  onChange={(e) => setActiveQuizTitle(e.target.value)}
                  className="min-w-0 flex-1 border-0 bg-transparent text-2xl font-bold text-gray-900 outline-none placeholder:text-gray-300"
                  placeholder="Quiz title"
                />
              </div>
              <QuizEditor key={activeQuizId} quizId={activeQuizId} className="min-h-0 flex-1" />
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                <FileText size={28} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-700">
                  Select a lesson or quiz to start editing
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  Add a module, then a lesson or quiz from the sidebar to begin.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
