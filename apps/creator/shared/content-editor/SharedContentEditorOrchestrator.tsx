"use client";

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Creator
 * Type: Orchestrator
 *
 * Purpose:
 * Composes Courses, Learning, and Publishing domains into the rich text editor.
 *
 * Rules:
 * - The supreme authority for the course authoring state.
 * - Handles complex cross-domain interactions.
 * - Keep domain UI pure.
"use client";

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Creator
 * Type: Orchestrator
 *
 * Purpose:
 * Composes Courses, Learning, and Publishing domains into the rich text editor.
 *
 * Rules:
 * - The supreme authority for the course authoring state.
 * - Handles complex cross-domain interactions.
 * - Keep domain UI pure.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

// features/content/course/components/CourseEditorShell.tsx

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import type * as Y from "yjs";
import { toast } from "sonner";
import { ArcadeEditor } from "@/apps/creator/editor";
import type { ArcadeEditorHandle } from "@/apps/creator/editor";
import { VersionHistoryOrchestrator } from "@/apps/creator/orchestrators/VersionHistoryOrchestrator";
import { encodeSnapshotBase64 } from "@/apps/creator/editor";
import { SessionSettingsDialog } from "./SessionSettingsDialog";
import { ContentStatusHistoryModal } from "@/domains/publishing/components/ContentStatusHistoryModal";
import { LessonFeedbackOrchestrator } from "@/apps/creator/orchestrators/LessonFeedbackOrchestrator";
import { DebouncedTitleInput } from "@/apps/creator/components/DebouncedTitleInput";

import {
  createYDoc,
  applyBase64Update,
  encodeStateBase64,
} from "@/apps/creator/editor";
import { QuizEditor, QuestionBankPanel } from "@/domains/assessments";
import { TiptapContentView } from "@/domains/learning";
import { CourseSubmitDialog } from "../../components/CourseSubmitDialog";
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
  Eye,
} from "lucide-react";

/** How long (of edit activity) between automatic version snapshots. */
const SNAPSHOT_INTERVAL_MS = 5 * 60 * 1000;

/** Run work when the browser is next idle, falling back to a macrotask. */
function scheduleIdle(fn: () => void) {
  const ric = (globalThis as { requestIdleCallback?: (cb: () => void) => number })
    .requestIdleCallback;
  if (ric) ric(fn);
  else setTimeout(fn, 0);
}

import { CourseAdapter } from "./adapters/CourseAdapter";
import { WorkshopAdapter } from "./adapters/WorkshopAdapter";
import { RoadmapAdapter } from "./adapters/RoadmapAdapter";
import { RoadmapCanvas } from "@/domains/roadmaps";
import { roadmapService } from "@/domains/roadmaps/services/roadmap";

interface SharedContentEditorOrchestratorProps {
  contentType: "course" | "workshop" | "roadmap";
  contentId?: string;
}

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
        className="absolute inset-0 bg-[#14142b]/45 backdrop-blur-md"
        onClick={() => !busy && onClose()}
      />
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_24px_64px_rgba(20,20,43,0.22)]">
        <div className="flex gap-3">
          <div
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${danger ? "bg-rose-50" : "bg-slate-100"
              }`}
          >
            <AlertTriangle
              size={20}
              className={danger ? "text-rose-500" : "text-[#14142b]"}
            />
          </div>
          <div className="flex-1 pt-0.5">
            <h3 className="text-[15px] font-bold tracking-tight text-[#14142b]">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#14142b] disabled:opacity-50"
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
            className={`rounded-full px-5 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${danger
              ? "bg-rose-600 hover:bg-rose-700"
              : "bg-[#14142b] hover:bg-[#232735]"
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

function ContentSettingsPanel({ terminology,
  contentId,
  title,
  description,
  status,
  pricingModel,
  createdAt,
  updatedAt,
  onDeleted,
  onDescriptionChange,
}: {
  contentId?: string;
  title: string;
  description: string;
  status: string;
  pricingModel: string;
  createdAt: string | null;
  updatedAt: string | null;
  onDeleted: () => void;
  onDescriptionChange: (desc: string) => void; terminology: { root: string; container: string; leafDocument: string; leafQuiz: string };
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

  const canDelete = confirmText === title && !deleting && !!contentId;
  const fmt = (d: string | null) => (d ? new Date(d).toLocaleString() : "—");

  async function handleDelete() {
    if (!canDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await api.delete(`/api/courses/${contentId}`, { confirmTitle: confirmText });
      onDeleted();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setDeleting(false);
    }
  }

  function copyId() {
    if (!contentId) return;
    navigator.clipboard?.writeText(contentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-6 lg:px-10">
      <h2 className="mb-1 text-lg font-bold text-gray-900">{terminology.root} Settings</h2>
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
        <InfoRow label="{terminology.root} ID">
          <button
            type="button"
            onClick={copyId}
            title="Copy ID"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-600 hover:text-indigo-600"
          >
            {contentId}
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
              Delete this {terminology.root.toLowerCase()}
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

export function SharedContentEditorOrchestrator({ contentType, contentId: initialContentId }: SharedContentEditorOrchestratorProps) {
  const router = useRouter();
  const [contentId] = useState<string | undefined>(initialContentId);
  const adapter = useMemo(() => {
    return contentType === "course"
      ? new CourseAdapter()
      : contentType === "roadmap"
      ? new RoadmapAdapter()
      : new WorkshopAdapter(contentId || "");
  }, [contentType, contentId]);

  const [title, setTitle] = useState("Untitled Course");
  const [description, setDescription] = useState("");
  const [pricingModel, setPricingModel] = useState<"FREE" | "PAID">("FREE");
  const [status, setStatus] = useState<string>("DRAFT");
  const [hasDraftChanges, setHasDraftChanges] = useState<boolean>(false);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<any>(null);
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  const [modules, setModules] = useState<ModuleNode[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeLessonTitle, setActiveLessonTitle] = useState(adapter.terminology.leafDocument);
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
  // Fingerprint of the last body we persisted, so an autosave triggered by a
  // transaction that didn't actually change the document is dropped before it costs
  // a CRDT encode and a network round-trip. Reset whenever the open lesson changes.
  const lastSavedBodyRef = useRef<string | null>(null);
  const [copiedQuizId, setCopiedQuizId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [statusHistoryOpen, setStatusHistoryOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const [qbOpen, setQbOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [navigatingBack, setNavigatingBack] = useState(false);

  // Workshop Day Settings dialog — keyed on the session (container) ID, not the lesson.
  const [sessionSettingsSessionId, setSessionSettingsSessionId] = useState<string | null>(null);
  // Track which module (Day) currently contains the active lesson for the Settings button.
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

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

      const flushPending = editorRef.current
        ? Promise.resolve(editorRef.current.flush()).catch(() => {
          // best-effort — proceed with the switch regardless
        })
        : Promise.resolve();

      const documentPending = adapter
        .getLeafDocument(lesson.id)
        .catch(() => null);

      const ydoc = createYDoc();
      let seed: TiptapDocument | undefined;

      try {
        const [, doc] = await Promise.all([flushPending, documentPending]);
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
      lastSavedBodyRef.current = null;

      setActiveQuizId(null);
      setActiveYDoc(ydoc);
      setActiveSeedContent(seed);
      setActiveLessonTitle(lesson.title);
      setActiveLessonId(lesson.id);
    },
    [adapter, resolveLegacyContent]
  );

  // ── Bootstrap: create or load content on mount ───────────────────────────

  useEffect(() => {
    if (!initialContentId) {
      router.replace("/");
      return;
    }
    async function bootstrap() {
      try {
        const { meta, containers } = await adapter.loadContent(initialContentId!);
        setTitle(meta.title);
        setDescription(meta.description ?? "");
        setPricingModel(meta.pricingModel as "FREE" | "PAID");
        setStatus(meta.status);
        setHasDraftChanges(meta.raw?.hasDraftChanges === true);
        setCreatedAt(meta.createdAt);
        setUpdatedAt(meta.updatedAt);
        if (contentType === "course") {
          setCourseData(meta.raw);
        } else if (contentType === "roadmap") {
          setRoadmapData(meta.raw);
        }
        setModules(
          containers.map((m) => ({
            id: m.id,
            title: m.title,
            position: m.position,
            expanded: true,
            lessons: ((m as any).leaves || []).filter((l: any) => l.type === "document"),
            quizzes: ((m as any).leaves || []).filter((l: any) => l.type === "quiz"),
          }))
        );
        const firstLeaf = containers[0]?.leaves?.[0];
        if (firstLeaf && firstLeaf.type === "document" && contentType !== "roadmap") {
          await openLesson(firstLeaf as any);
        }
      } catch (e) {
        console.error("Failed to load content", e);
      }
      setIsInitializing(false);
    }
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      if (jsonStr === lastSavedBodyRef.current) return; // nothing changed

      // localStorage mirror keeps a resilient JSON fallback if the backend is down.
      // Writing it is synchronous and O(document size), so it is deferred out of the
      // save path — it must not sit between the user's keystroke and the next frame.
      scheduleIdle(() => {
        try {
          localStorage.setItem(`arcade-draft-${activeLessonId}`, jsonStr);
        } catch {
          // quota exceeded or storage disabled — the backend save below is the real path
        }
      });

      try {
        await adapter.saveLeafDocument(activeLessonId, {
          ydocState: encodeStateBase64(ydoc),
          body: jsonStr,
        });
        lastSavedBodyRef.current = jsonStr;
        setHasDraftChanges(true);
      } catch (e) {
        console.warn("Document save failed, localStorage preserved.", e);
        return; // don't snapshot if the head save didn't land
      }

      // Auto-periodic snapshot: once the interval has elapsed since the last one,
      // capture a Yjs snapshot as a new version (the Google-Docs-style timeline).
      // Deliberately not awaited — the head save is already durable, and the caller
      // is the autosave path, which shouldn't stay pending on timeline bookkeeping.
      const now = Date.now();
      if (now - lastSnapshotAtRef.current > SNAPSHOT_INTERVAL_MS) {
        lastSnapshotAtRef.current = now;
        void adapter
          .saveLeafVersion(activeLessonId, {
            snapshot: encodeSnapshotBase64(ydoc),
            body: jsonStr,
            kind: "AUTO",
          })
          .then(() => setHistoryRefreshKey((k) => k + 1))
          .catch((e) => console.warn("Auto-snapshot failed", e));
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
        await adapter.saveLeafVersion(activeLessonId, {
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
    if (!contentId) return;
    try {
      const title = `${adapter.terminology.container} ${modules.length + 1}`;
      const m = await adapter.addContainer(contentId, title);
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
  }, [contentId, modules.length, adapter]);

  // ── Tree mutation: Add Day (container) — workshop only ───────────────────

  const addWorkshopDay = useCallback(
    async () => {
      if (!contentId) return;
      try {
        const nextIndex = modules.length + 1;
        const newContainer = await adapter.addContainer(
          contentId,
          `${adapter.terminology.container} ${nextIndex}`
        );
        setModules((prev) => [
          ...prev,
          {
            id: newContainer.id,
            title: newContainer.title,
            position: newContainer.position,
            expanded: true,
            lessons: [],
            quizzes: [],
          },
        ]);
        // Auto-open Day Settings dialog so the creator can set schedule details.
        setSessionSettingsSessionId(newContainer.id);
        setHasDraftChanges(true);
      } catch (e) {
        console.error("Failed to add day", e);
      }
    },
    [contentId, modules.length, adapter]
  );

  // ── Tree mutation: Add Lesson (directly under a module/Day) ──────────────

  const addLesson = useCallback(
    async (moduleId: string) => {
      if (!contentId) return;
      try {
        const mod = modules.find((m) => m.id === moduleId);
        const nextIndex = (mod?.lessons.length ?? 0) + 1;
        const newLesson = await adapter.addLeaf(
          moduleId,
          `${adapter.terminology.leafDocument} ${nextIndex}`,
          "document"
        );
        setModules((prev) =>
          prev.map((m) =>
            m.id === moduleId
              ? { ...m, expanded: true, lessons: [...m.lessons, newLesson as any] }
              : m
          )
        );
        setActiveModuleId(moduleId);
        await openLesson(newLesson as any);
        setHasDraftChanges(true);
      } catch (e) {
        console.error("Failed to add lesson", e);
      }
    },
    [contentId, modules, openLesson, adapter]
  );

  // ── Tree mutation: Add Quiz (sibling of a lesson under a module) ────────────

  const addQuiz = useCallback(
    async (moduleId: string) => {
      if (!contentId) return;
      try {
        const mod = modules.find((m) => m.id === moduleId);
        const nextIndex = (mod?.quizzes.length ?? 0) + 1;
        const newQuiz = await adapter.addLeaf(
          moduleId,
          `${adapter.terminology.leafQuiz} ${nextIndex}`,
          "quiz"
        );
        setModules((prev) =>
          prev.map((m) =>
            m.id === moduleId
              ? { ...m, expanded: true, quizzes: [...m.quizzes, newQuiz as any] }
              : m
          )
        );
        await openQuiz(newQuiz as any);
        setHasDraftChanges(true);
      } catch (e) {
        console.error("Failed to add quiz", e);
      }
    },
    [contentId, modules, openQuiz, adapter]
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
        await adapter.renameContainer(id, value);
        setHasDraftChanges(true);
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
        await adapter.renameLeaf(id, value, "quiz");
        setHasDraftChanges(true);
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
        await adapter.renameLeaf(id, value, "document");
        setHasDraftChanges(true);
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
      await adapter.deleteContainer(mod.id);
      setHasDraftChanges(true);
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
      await adapter.deleteLeaf(lessonId, "document");
      setHasDraftChanges(true);
    } catch (e) {
      console.error("Failed to delete lesson", e);
    }
  };

  const askDeleteModule = (mod: ModuleNode) =>
    setConfirm({
      title: `Delete ${adapter.terminology.container}?`,
      message: `"${mod.title}" and all of its lessons will be permanently deleted. This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
      onConfirm: () => deleteModuleNow(mod),
    });

  const askDeleteLesson = (lesson: LessonNode) =>
    setConfirm({
      title: `Delete ${adapter.terminology.leafDocument}?`,
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
      await adapter.deleteLeaf(quizId, "quiz");
      setHasDraftChanges(true);
    } catch (e) {
      console.error("Failed to delete quiz", e);
    }
  };

  const askDeleteQuiz = (quiz: QuizNode) =>
    setConfirm({
      title: `Delete ${adapter.terminology.leafQuiz}?`,
      message: `"${quiz.title}" and all of its questions will be permanently deleted. This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
      onConfirm: () => deleteQuizNow(quiz.id),
    });

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
        await adapter.renameLeaf(activeQuizId, value, "quiz");
        setHasDraftChanges(true);
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
      if (!contentId) return;
      if (metaSaveTimeout.current) clearTimeout(metaSaveTimeout.current);
      metaSaveTimeout.current = setTimeout(async () => {
        try {
          await adapter.updateMeta(contentId, patch);
          setHasDraftChanges(true);
        } catch (e) {
          console.warn("Course metadata save failed", e);
        }
      }, 1500);
    },
    [contentId]
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

    if (contentId) {
      tasks.push(
        adapter.updateMeta(contentId, { title, description, pricingModel: pricingModel as any })
          .catch((e) => console.warn("Content metadata flush failed", e))
      );
    }

    if (activeLessonId) {
      // Persist the lesson title, then flush the editor body (bypasses its debounce).
      tasks.push(
        api
          .patch(`/api/lessons/${activeLessonId}`, {
            title: activeLessonTitle.trim() || adapter.terminology.leafDocument,
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

    router.push("/studio");
  }, [
    navigatingBack,
    contentId,
    title,
    description,
    pricingModel,
    activeLessonId,
    activeLessonTitle,
    router,
    adapter,
  ]);

  // ── Submit for review ─────────────────────────────────────────────────────

  const askSubmit = () => {
    if (contentType === "course" || contentType === "roadmap" || contentType === "workshop") {
      setSubmitDialogOpen(true);
      return;
    }
    setConfirm({
      title: "Proceed to next steps?",
      message: "You will now need to complete the remaining necessary details for your workshop such as pricing, venue, and registration before it can be published.",
      confirmLabel: "Proceed..",
      onConfirm: async () => {
        router.push(`/studio/workshop/${contentId}`);
      },
    });
  };

  const handleSubmit = async (data: { coverImageUrl?: string; pricingModel: 'FREE' | 'PAID'; priceAmount?: number; message?: string }) => {
    if (!contentId) return;
    if (editorRef.current) {
      try {
        await editorRef.current.flush();
      } catch {
        // best-effort
      }
    }
    try {
      if (contentType === "course") {
        if (data.coverImageUrl !== undefined || data.pricingModel !== undefined || data.priceAmount !== undefined) {
           await api.patch(`/api/courses/${contentId}`, data);
        }
        const updated = await api.post<any>(`/api/courses/${contentId}/submit`, { message: data.message });
        setStatus(updated.status);
        setUpdatedAt(updated.updatedAt);
        setPricingModel(updated.pricingModel as "FREE" | "PAID");
      } else if (contentType === "roadmap") {
        const updated = await api.post<any>(`/api/roadmaps/${contentId}/submit`, { message: data.message });
        setStatus(updated.status);
        setUpdatedAt(updated.updatedAt);
      } else if (contentType === "workshop") {
        const { submitWorkshop } = await import(
          "@/app/(authenticated)/studio/workshop/api/publish"
        );
        const updated = await submitWorkshop(contentId, { message: data.message });
        setStatus(updated.status);
        if (updated.updatedAt) setUpdatedAt(updated.updatedAt);
      }
      setHistoryRefreshKey((k) => k + 1);
      setSubmitDialogOpen(false);
      setHasDraftChanges(false);
    } catch (e) {
      console.error("Failed to submit content", e);
      throw e;
    }
  };

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
    <div className="relative flex flex-1 min-h-[calc(100vh-64px)] flex-col overflow-hidden bg-white">
      {contentType === "course" && contentId ? (
        <QuestionBankPanel open={qbOpen} courseId={contentId} onClose={() => setQbOpen(false)} />
      ) : (
        <QuestionBankDialog open={qbOpen} onClose={() => setQbOpen(false)} />
      )}
      {submitDialogOpen && (
        <CourseSubmitDialog
          course={courseData}
          roadmap={roadmapData}
          contentType={contentType}
          open={submitDialogOpen}
          onClose={() => setSubmitDialogOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
      <ConfirmDialog options={confirm} onClose={() => setConfirm(null)} />
      <SessionSettingsDialog
        open={!!sessionSettingsSessionId}
        onClose={() => setSessionSettingsSessionId(null)}
        workshopId={contentId!}
        sessionId={sessionSettingsSessionId}
        onSaved={(updatedSession) => {
          // Sync the new Day title into the sidebar module (container) row.
          if (updatedSession.title && sessionSettingsSessionId) {
            const newTitle = updatedSession.title;
            setModules((prev) =>
              prev.map((m) =>
                m.id === sessionSettingsSessionId ? { ...m, title: newTitle } : m
              )
            );
            setHasDraftChanges(true);
          }
          // Dialog closes itself via its own onClose prop after calling onSaved.
        }}
      />
      {activeLessonId && (
        <VersionHistoryOrchestrator
          lessonId={activeLessonId}
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          refreshKey={historyRefreshKey}
          onRestore={handleRestore}
          // Version previews are read-only, so they go through the JSON -> React
          // renderer instead of a second full Tiptap instance. Mounting ArcadeEditor
          // here spun up the entire extension set and bubble layer just to display a
          // snapshot, and it pulled the heavy editor chunk into the history panel.
          renderEditor={(previewDoc, selectedId) => (
            <div key={selectedId} className="bg-white">
              <TiptapContentView body={JSON.stringify(previewDoc)} />
            </div>
          )}
        />
      )}

      {/* ── Editor top bar — uniform across course / workshop / roadmap ───── */}
      <header className="absolute inset-x-0 top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto grid max-w-[1200px] grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-2 sm:px-6">
          {/* Left: Back → Content Studio */}
          <div className="justify-self-start">
            <button
              type="button"
              onClick={handleBack}
              disabled={navigatingBack}
              title="Save and return to Content Studio"
              className="flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#14142b] disabled:opacity-60"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">{navigatingBack ? "Saving…" : "Studio"}</span>
            </button>
          </div>

          {/* Center title */}
          <div className="min-w-0 justify-self-center">
            <span className="block max-w-[60vw] truncate px-1.5 py-1 text-center text-sm font-bold tracking-tight text-[#14142b] sm:max-w-md">
              {view === "settings"
                ? `${adapter.terminology.root} Settings`
                : activeLessonId
                  ? activeLessonTitle
                  : activeQuizId
                    ? activeQuizTitle
                    : title || adapter.terminology.root}
            </span>
          </div>

          {/* Right actions */}
          <div className="flex flex-shrink-0 items-center justify-self-end gap-1.5">
            <StatusPill status={status} />

            <button
              type="button"
              onClick={() => {
                if (activeLessonId) setHistoryOpen(true);
                else setStatusHistoryOpen(true);
              }}
              title={activeLessonId ? "Version history" : "Status history"}
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
            >
              <History size={15} />
              <span className="hidden md:inline">History</span>
            </button>

            <button
              type="button"
              onClick={() => setView((v) => (v === "settings" ? "tree" : "settings"))}
              title={`${adapter.terminology.root} Settings`}
              className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-semibold transition-colors ${
                view === "settings"
                  ? "bg-[#14142b] text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-[#14142b]"
              }`}
            >
              <Settings size={15} />
              <span className="hidden md:inline">Settings</span>
            </button>

            {activeLessonId && contentType === "workshop" && activeModuleId && (
              <button
                type="button"
                onClick={() => setSessionSettingsSessionId(activeModuleId)}
                title="Day Schedule & Settings"
                className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
              >
                <Settings size={15} />
                <span className="hidden lg:inline">Day</span>
              </button>
            )}

            {status !== "SUBMITTED" && (
              <button
                type="button"
                onClick={askSubmit}
                disabled={
                  contentType !== "workshop" &&
                  !hasDraftChanges &&
                  (status === "PUBLISHED" || status === "APPROVED" || status === "DRAFT")
                }
                title={
                  contentType !== "workshop" && !hasDraftChanges && status !== "REJECTED"
                    ? "No new changes to submit"
                    : ""
                }
                className="inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#14142b] px-3.5 py-2 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(20,20,43,0.18)] transition-colors hover:bg-[#232735] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={14} />
                <span className="hidden sm:inline">
                  {status === "PUBLISHED" || status === "APPROVED"
                    ? "Submit Updates"
                    : status === "REJECTED"
                      ? "Resubmit"
                      : "Submit"}
                </span>
              </button>
            )}

            {contentType === "workshop" && contentId && (
              <button
                type="button"
                onClick={() => router.push(`/studio/workshop/${contentId}`)}
                className="inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <span className="hidden sm:inline">Manage</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Canvas + floating overlays ────────────────────────────────────── */}
      <div className="relative min-h-0 flex-1">
        {/* ── Floating collapsible sidebar: course tree (hidden for roadmaps) ─────────── */}
        {contentType !== "roadmap" && (
          <aside className="absolute left-3 top-16 z-20 flex sm:left-4">
            {!sidebarOpen ? (
              <button
                type="button"
                title="Expand sidebar"
                onClick={() => setSidebarOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/95 text-slate-400 shadow-[0_6px_18px_rgba(20,20,43,0.08)] transition-colors hover:text-[#14142b]"
              >
                <PanelLeftOpen size={18} />
              </button>
            ) : (
              <div className="flex max-h-[calc(100vh-6.5rem)] w-[268px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_16px_40px_rgba(20,20,43,0.1)] backdrop-blur-xl">
                {/* ── Sidebar header ───────────────── */}
                <div className="flex flex-shrink-0 items-center border-b border-slate-100 px-3 py-2.5">
                  <span className="min-w-0 flex-1 truncate px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    {adapter.terminology.root} structure
                  </span>
                  <button
                    type="button"
                    title="Collapse sidebar"
                    onClick={() => setSidebarOpen(false)}
                    className="flex flex-shrink-0 items-center justify-center rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
                  >
                    <PanelLeftClose size={16} />
                  </button>
                </div>

                {/* ── Body ──────────────────────────────── */}
                <div className="flex min-h-0 flex-1 flex-col">
                  {/* Tree scroll area */}
                  <div className="flex-1 overflow-y-auto p-2">
                    {modules.length === 0 && (
                      <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
                        <Layers size={28} className="text-gray-300" />
                        <p className="text-xs text-gray-400">
                          {contentType === "workshop"
                            ? "Create your first workshop day and start building the agenda, notes, resources, and instructions."
                            : "No modules yet. Add a module to get started."}
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

                          {status !== "SUBMITTED" && (
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
                          )}
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
                                    className={`group flex items-center gap-1 rounded-lg pl-2 pr-1.5 ${isActive ? "bg-[#14142b] shadow-sm" : "hover:bg-slate-50"
                                      }`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (item.kind === "lesson") {
                                          setActiveModuleId(mod.id);
                                          openLesson(item.node);
                                        } else {
                                          openQuiz(item.node);
                                        }
                                      }}
                                      className={`flex min-w-0 flex-1 items-center gap-1.5 py-1.5 text-left text-xs ${isActive
                                        ? "font-semibold text-white"
                                        : "text-slate-500"
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
                                    {status !== "SUBMITTED" && (
                                      <div className="flex flex-shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                                        {item.kind === "quiz" && (
                                          <IconBtn
                                            title="Copy quiz ID — paste into an inline Quiz block"
                                            onClick={() => {
                                              navigator.clipboard.writeText(item.node.id);
                                              setCopiedQuizId(item.node.id);
                                              setTimeout(() => setCopiedQuizId(null), 1500);
                                            }}
                                          >
                                            {copiedQuizId === item.node.id ? (
                                              <Check size={12} className="text-emerald-500" />
                                            ) : (
                                              <Copy size={12} />
                                            )}
                                          </IconBtn>
                                        )}
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
                                    )}
                                  </div>
                                );
                              })}

                            {/* Add lesson / quiz to this Day/module */}
                            {status !== "SUBMITTED" && (
                              <div className="mt-0.5 flex items-center gap-3 pl-2">
                                <button
                                  type="button"
                                  onClick={() => addLesson(mod.id)}
                                  className="flex items-center gap-1 py-1 text-[11px] font-semibold text-slate-400 hover:text-[#14142b]"
                                >
                                  <Plus size={11} />
                                  Add {adapter.terminology.leafDocument}
                                </button>
                                {contentType !== "workshop" && (
                                  <button
                                    type="button"
                                    onClick={() => addQuiz(mod.id)}
                                    className="flex items-center gap-1 py-1 text-[11px] font-semibold text-slate-400 hover:text-[#14142b]"
                                  >
                                    <Plus size={11} />
                                    Add quiz
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Sidebar footer — settings also in top bar; keep quick access here */}
                  <div className="space-y-0.5 border-t border-slate-100 bg-slate-50/60 p-2">
                    {status !== "SUBMITTED" && contentType === "workshop" && (
                      <button
                        type="button"
                        onClick={addWorkshopDay}
                        className="mb-1 flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-[#14142b] transition-colors hover:bg-white"
                      >
                        <Plus size={14} />
                        Add Day
                      </button>
                    )}
                    {status !== "SUBMITTED" && contentType !== "workshop" && (
                      <button
                        type="button"
                        onClick={addModule}
                        className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-[#14142b] transition-colors hover:bg-white"
                      >
                        <Plus size={14} />
                        Add {adapter.terminology.container}
                      </button>
                    )}
                    {status !== "SUBMITTED" && contentType !== "workshop" && (
                      <button
                        type="button"
                        onClick={() => setQbOpen(true)}
                        className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-white hover:text-[#14142b]"
                      >
                        <FileText size={13} />
                        Question Bank
                      </button>
                    )}
                    {status !== "SUBMITTED" && contentType === "workshop" && (
                      <button
                        type="button"
                        className="flex w-full cursor-not-allowed items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-400 opacity-60"
                        title="Resources (Coming soon)"
                      >
                        <FileText size={13} />
                        Resources
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setView((v) => (v === "settings" ? "tree" : "settings"))}
                      className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold transition-colors ${view === "settings"
                        ? "bg-[#14142b] text-white"
                        : "text-slate-500 hover:bg-white hover:text-[#14142b]"
                        }`}
                    >
                      <Settings size={13} />
                      {adapter.terminology.root} Settings
                    </button>
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* ── Canvas: wide, centered, scrolls under the floating chrome ── */}
        <main className="absolute inset-0 z-0 overflow-y-auto">
          {status === "SUBMITTED" && (
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-800 flex items-center justify-center gap-2 font-medium sticky top-12 z-20 shadow-sm">
              <span>🔒 This content has been submitted for review and is currently locked for editing until a decision is made.</span>
            </div>
          )}
          {view === "settings" ? (
            <div className="mx-auto max-w-[860px] px-6 pb-40 pt-24 sm:px-12">
              <div className="overflow-hidden rounded-2xl border border-gray-100">
                <div className={status === "SUBMITTED" ? "pointer-events-none opacity-75" : ""}>
                  <ContentSettingsPanel terminology={adapter.terminology}
                    contentId={contentId}
                    title={title}
                    description={description}
                    status={status}
                    pricingModel={pricingModel}
                    createdAt={createdAt}
                    updatedAt={updatedAt}
                    onDeleted={() => router.push("/studio")}
                    onDescriptionChange={(desc) => {
                      setDescription(desc);
                      scheduleCourseMetaSave({ description: desc });
                    }}
                  />
                </div>
              </div>
            </div>
          ) : contentType === "roadmap" && roadmapData ? (
            <div className="absolute inset-0 z-0 pt-[49px]">
               <RoadmapCanvas 
                 roadmap={roadmapData}
                 readOnly={status === "SUBMITTED"}
                 onGraphChange={async (graphJson) => {
                   await roadmapService.updateRoadmap(contentId!, { graphJson });
                   setHasDraftChanges(true);
                 }}
               />
            </div>
          ) : activeLessonId ? (
            <div
              className="mx-auto max-w-[860px] px-6 pb-44 pt-[49px] sm:px-12"
              // Height of the top bar above — the editor toolbar sticks flush beneath it.
              style={{ "--arcade-toolbar-top": "49px" } as CSSProperties}
            >
              {/* The lesson name lives in the top bar; renaming happens from the
                  sidebar's pencil action. No second title on the canvas. */}
              <div>
                {activeYDoc && (
                  <ArcadeEditor
                    key={activeLessonId}
                    ref={editorRef}
                    ydoc={activeYDoc}
                    seedContent={activeSeedContent}
                    placeholder="Start writing your lesson content…"
                    onSave={handleSave}
                    chromeless
                    readOnly={status === "SUBMITTED"}
                  />
                )}
              </div>
            </div>
          ) : activeQuizId ? (
            <div className="mx-auto max-w-[860px] px-6 pb-40 pt-24 sm:px-12 relative">
              {status === "SUBMITTED" && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
                  <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-lg border border-gray-100 font-medium text-amber-600">
                    <Lock size={16} /> Locked for Review
                  </div>
                </div>
              )}
              <div className={status === "SUBMITTED" ? "pointer-events-none opacity-75" : ""}>
                <div className="mb-5 flex items-center gap-3">
                  <ListChecks size={22} className="flex-shrink-0 text-amber-500" />
                  <DebouncedTitleInput
                    value={activeQuizTitle}
                    onCommit={saveQuizTitle}
                    className="min-w-0 flex-1 border-0 bg-transparent text-2xl font-bold text-gray-900 outline-none placeholder:text-gray-300"
                    placeholder="Quiz title"
                    disabled={status === "SUBMITTED"}
                  />
                </div>
                <QuizEditor key={activeQuizId} quizId={activeQuizId} />
              </div>
            </div>
          ) : (
            <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-4 pt-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
                <FileText size={28} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-700">
                  {contentType === "workshop"
                    ? "Select a workshop day or create a new day to start editing."
                    : "Select a lesson or quiz to start editing."}
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  {contentType === "workshop"
                    ? "Create your first workshop day and start building the agenda, notes, resources, and instructions."
                    : "Open the sidebar, add a module, then a lesson or quiz to begin."}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
      <ContentStatusHistoryModal
        contentId={contentId!}
        contentType={
          contentType === "roadmap"
            ? "roadmap"
            : contentType === "workshop"
              ? "workshop"
              : "course"
        }
        open={statusHistoryOpen}
        onClose={() => setStatusHistoryOpen(false)}
      />
    </div>
  );
}
