"use client";

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Creator
 * Type: Shared workspace runtime
 *
 * Purpose:
 * The lesson/module/badge editing engine shared by CourseWorkspace and EventWorkspace.
 * ------------------------------------------------------------------
 */

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";
import type * as Y from "yjs";
import type { CollabStatus, ActiveCollaborator } from "@/apps/creator/editor/hooks/useArcadeEditor";
import { api } from "@/infrastructure/http/api";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { ArcadeEditor } from "@/apps/creator/editor";
import type { ArcadeEditorHandle } from "@/apps/creator/editor";
import { VersionHistoryOrchestrator } from "@/apps/creator/orchestrators/VersionHistoryOrchestrator";
import { encodeSnapshotBase64, createYDoc, applyBase64Update, encodeStateBase64 } from "@/apps/creator/editor";
import { StudioRightPanel } from "@/apps/creator/studio/core/StudioRightPanel";
import { useStudioPanel } from "@/apps/creator/studio/core/useStudioPanel";
import { useUnsavedChangesGuard } from "@/apps/creator/studio/core/useUnsavedChangesGuard";
import {
  StudioPresenceStack,
  StudioShareControl,
  StudioPanelToggle,
  StudioActionButton,
} from "@/apps/creator/studio/core/StudioHeader";
import {
  StudioEditorFrame,
  StudioEditorTopBar,
  StudioEditorBody,
  TREE_SIDEBAR_ACTIONS_CLASS,
  TREE_CONTAINER_ROW_CLASS,
  TREE_EMPTY_STATE_CLASS,
  CANVAS_WRAPPER_CLASS,
  CANVAS_CARD_CLASS,
} from "@/apps/creator/studio/core/StudioShell";
import type { ExamResponse } from "@/domains/assessments";
import { TiptapContentView } from "@/domains/learning";
import { useBadgeEditor, BadgeEditorWorkspace, BadgeEditorContextPanel } from "@/domains/badges";
import { CourseSubmitDialog } from "@/apps/creator/components/CourseSubmitDialog";
import { ContentCollaboratorsModal } from "@/apps/creator/shared/components/ContentCollaboratorsModal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/design-system/ui/dropdown-menu";
import type { TiptapDocument } from "@/shared/types/editor.types";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  FileText,
  Layers,
  AlertTriangle,
  Settings,
  GraduationCap,
  Pencil,
  Trash2,
  Send,
  Award,
  Users,
  Loader2,
  GripVertical,
} from "lucide-react";
import type { ContentDataAdapter, ExamSummary } from "./types";

/**
 * The lesson/module/badge editing engine Course and Event share: tree state and CRUD, Y.Doc
 * lesson bootstrap and autosave, version history, collaboration, the submit dialog, and attached
 * exams.
 *
 * <p>This is not "the shared shell" — that's `StudioEditorFrame`/`TopBar`/`Body` in Studio Core,
 * which this component itself is a *consumer* of, exactly like `ExamWorkspace` is. This is one
 * layer above that: the specific editing engine that happens to be identical for two content
 * types because they both decompose into the same shape (a root item containing containers of
 * document leaves, plus optional root-level badges).
 *
 * <p>Everything that genuinely differs between Course and Event is a named prop here — never a
 * `contentType` check. `CourseWorkspace` and `EventWorkspace` are the only two places that know
 * their own content type; this component only knows the {@link ContentDataAdapter} it was handed
 * and the handful of slots below.
 */
/**
 * Imperative escape hatch for the rare case a workspace's own dialog needs to update the
 * runtime's internal tree cache after a save that happened through a different API than the
 * runtime's own `renameContainer` (Event's day-schedule dialog saves a whole session's schedule,
 * not just its title, through its own endpoint) — without the runtime knowing anything about
 * that dialog.
 */
export interface ContentEditorRuntimeHandle {
  /** Updates a container's cached title in the sidebar without calling the backend again. */
  renameContainerLocally: (containerId: string, title: string) => void;
}

export interface ContentEditorRuntimeProps {
  /** Which adapter this render is wired to — the one seam that says "which content type". */
  adapter: ContentDataAdapter;
  contentId?: string;
  /** Route to return to on back-navigation. Computed by the workspace, not derived here. */
  backHref: string;
  /**
   * Executes the actual submit-for-review API call and returns the new status. The confirmation
   * dialog (CourseSubmitDialog) is shared; only what happens when its form is confirmed differs.
   */
  onSubmit: (data: {
    coverImageUrl?: string;
    pricingModel: "FREE" | "PAID";
    priceAmount?: number;
    message?: string;
  }) => Promise<{ status: string; updatedAt?: string | null }>;
  /**
   * Extra header actions rendered between the panel toggle and the Submit button, given the
   * runtime's own active-lesson state (Event's Day Settings icon needs to know which module is
   * open). Course renders nothing here.
   */
  headerExtras?: (state: { activeLessonId: string | null; activeModuleId: string | null }) => {
    beforeSubmit?: ReactNode;
    afterSubmit?: ReactNode;
  };
  /** Extra controls pinned in the sidebar below the primary Add button. Course's category picker. */
  sidebarExtras?: ReactNode;
  /**
   * Fired after a container is created, so a workspace can react (Event auto-opens its day
   * schedule dialog; Course does nothing). Unifies what used to be two near-identical
   * `addModule`/`addEventDay` functions into one.
   */
  onContainerCreated?: (container: { id: string; title: string }) => void;
  /** Rendered alongside the runtime's own dialogs — Event's day-schedule editor. */
  extraDialogs?: ReactNode;
  /** Copy for the sidebar's zero-containers state and the canvas's nothing-open state. */
  copy: {
    noContainers: string;
    canvasTitle: string;
    canvasDescription: string;
  };
  /**
   * Fired once with the freshly-loaded content metadata, so a workspace can seed state it owns
   * itself from the initial load (Course's category selector reads its starting value from here).
   */
  onLoaded?: (meta: { categoryId?: string | null; raw?: unknown }) => void;
}

interface LessonNode {
  id: string;
  title: string;
  body?: string;
  position: number;
}

interface BadgeNode {
  id: string;
  title: string;
  position: number;
}

interface ModuleNode {
  id: string;
  title: string;
  position: number;
  lessons: LessonNode[];
  expanded: boolean;
}

type EditKind = "module" | "lesson" | "badge";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
}

/** How long (of edit activity) between automatic version snapshots. */
const SNAPSHOT_INTERVAL_MS = 5 * 60 * 1000;

/** Run work when the browser is next idle, falling back to a macrotask. */
function scheduleIdle(fn: () => void) {
  const ric = (globalThis as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
  if (ric) ric(fn);
  else setTimeout(fn, 0);
}

function SortableRow({
  id,
  children,
  className,
}: {
  id: string;
  children: (dragHandleProps: Record<string, unknown>) => ReactNode;
  className?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className={className}>
      {children({ ...attributes, ...listeners })}
    </div>
  );
}

function ConfirmDialog({ options, onClose }: { options: ConfirmOptions | null; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setBusy(false);
  }, [options]);

  if (!options) return null;
  const { title, message, confirmLabel, danger } = options;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#14142b]/45 backdrop-blur-md" onClick={() => !busy && onClose()} />
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_24px_64px_rgba(20,20,43,0.22)]">
        <div className="flex gap-3">
          <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${danger ? "bg-rose-50" : "bg-slate-100"}`}>
            <AlertTriangle size={20} className={danger ? "text-rose-500" : "text-[#14142b]"} />
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
            className={`rounded-full px-5 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${danger ? "bg-rose-600 hover:bg-rose-700" : "bg-[#14142b] hover:bg-[#232735]"}`}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function IconBtn({
  title,
  onClick,
  danger,
  children,
}: {
  title: string;
  onClick: () => void;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`rounded p-1 text-gray-400 transition-colors ${danger ? "hover:bg-red-50 hover:text-red-600" : "hover:bg-gray-200 hover:text-gray-700"}`}
    >
      {children}
    </button>
  );
}

export const ContentEditorRuntime = forwardRef<ContentEditorRuntimeHandle, ContentEditorRuntimeProps>(function ContentEditorRuntime(
  {
    adapter,
    contentId,
    backHref,
    onSubmit,
    headerExtras,
    sidebarExtras,
    onContainerCreated,
    extraDialogs,
    copy,
    onLoaded,
  },
  ref
) {
  const router = useRouter();

  const [title, setTitle] = useState("Untitled");
  const [description, setDescription] = useState("");
  const [pricingModel, setPricingModel] = useState<"FREE" | "PAID">("FREE");
  const [status, setStatus] = useState<string>("DRAFT");
  const [hasDraftChanges, setHasDraftChanges] = useState<boolean>(false);
  // Raw content-type-specific payload (CourseResponse for Course, the Event object for Event);
  // CourseSubmitDialog's own `course` prop is already typed loosely for the same reason.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [courseData, setCourseData] = useState<any>(null);
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [addingExam, setAddingExam] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [collaboratorsModalOpen, setCollaboratorsModalOpen] = useState(false);
  const [collabState, setCollabState] = useState<{ status: CollabStatus; collaborators: ActiveCollaborator[] }>({
    status: "disabled",
    collaborators: [],
  });

  const handleCollabStateChange = useCallback((state: { status: CollabStatus; collaborators: ActiveCollaborator[] }) => {
    setCollabState(state);
  }, []);

  const [modules, setModules] = useState<ModuleNode[]>([]);
  const [badges, setBadges] = useState<BadgeNode[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeLessonTitle, setActiveLessonTitle] = useState(adapter.terminology.leafDocument);
  const [activeBadgeId, setActiveBadgeId] = useState<string | null>(null);
  const badgeEditor = useBadgeEditor(activeBadgeId, status === "SUBMITTED");
  const [activeSeedContent, setActiveSeedContent] = useState<TiptapDocument | undefined>(undefined);

  const [activeYDoc, setActiveYDoc] = useState<Y.Doc | null>(null);
  const activeYDocRef = useRef<Y.Doc | null>(null);
  const lastSnapshotAtRef = useRef(0);
  const lastSavedBodyRef = useRef<string | null>(null);
  // Ref rather than a bootstrap-effect dependency: the effect below intentionally runs once on
  // mount, and a workspace's inline `onLoaded` callback is a new function identity every render.
  // Updated in its own effect, never written during render, so this stays a pure render.
  const onLoadedRef = useRef(onLoaded);
  useEffect(() => {
    onLoadedRef.current = onLoaded;
  }, [onLoaded]);

  useImperativeHandle(
    ref,
    () => ({
      renameContainerLocally: (containerId: string, title: string) => {
        setModules((prev) => prev.map((m) => (m.id === containerId ? { ...m, title } : m)));
        setHasDraftChanges(true);
      },
    }),
    []
  );

  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);
  const [navigatingBack, setNavigatingBack] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const editorRef = useRef<ArcadeEditorHandle>(null);
  const [editing, setEditing] = useState<{ kind: EditKind; id: string } | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [confirm, setConfirm] = useState<ConfirmOptions | null>(null);

  // The Studio right-hand panel (status history, collaborators, invite/remove) — the same hook
  // Exam uses. Null the path while there's no contentId yet (content still being created) so the
  // hook's own `!path` guard matches the previous `&& contentId` guard exactly.
  const panel = useStudioPanel({
    collaboratorsPath: contentId ? `/api/v1/${adapter.terminology.root === "Course" ? "courses" : "events"}/${contentId}/collaborators` : null,
    statusHistoryPath: contentId
      ? adapter.terminology.root === "Course"
        ? `/api/courses/${contentId}/status-history`
        : `/api/v1/events/${contentId}/status-history`
      : null,
  });

  const BADGE_PANEL_IDS = useMemo(() => ["design", "properties", "layers"], []);
  useEffect(() => {
    if (activeBadgeId) {
      panel.setTab((prev) => (BADGE_PANEL_IDS.includes(prev) ? prev : "design"));
    } else {
      panel.setTab((prev) => (BADGE_PANEL_IDS.includes(prev) ? "status" : prev));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBadgeId]);

  // Warn on tab close / refresh with unsaved changes — the dirty flag was previously tracked
  // (set in every mutation handler below) but never acted on, so a learner could lose in-flight
  // edits to a refresh or an accidental tab close with no warning at all.
  useUnsavedChangesGuard(hasDraftChanges && status !== "SUBMITTED");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (moduleId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId) return m;
        const items = [...m.lessons.map((l) => ({ id: l.id, node: l }))].sort((a, b) => a.node.position - b.node.position);
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return m;
        const newItems = arrayMove(items, oldIndex, newIndex);
        const nextLessons = [...m.lessons];
        const itemIds: string[] = [];
        newItems.forEach((item, index) => {
          itemIds.push(item.id);
          const lIndex = nextLessons.findIndex((l) => l.id === item.id);
          if (lIndex !== -1) nextLessons[lIndex] = { ...nextLessons[lIndex], position: index };
        });
        api.patch(`/api/modules/${moduleId}/reorder`, { itemIds }).catch((e) => {
          console.error("Failed to reorder items", e);
          toast.error("Failed to save new order");
        });
        return { ...m, lessons: nextLessons };
      })
    );
  };

  /** Best-effort legacy content for a lesson without persisted CRDT state. */
  const resolveLegacyContent = useCallback((lesson: LessonNode, docBody: string | null): TiptapDocument | undefined => {
    const sources = [docBody, localStorage.getItem(`arcade-draft-${lesson.id}`), lesson.body ?? null];
    for (const src of sources) {
      if (!src) continue;
      try {
        return JSON.parse(src) as TiptapDocument;
      } catch {
        // try the next source
      }
    }
    return undefined;
  }, []);

  const openLesson = useCallback(
    async (lesson: LessonNode) => {
      panel.setOpen((prev) => (panel.tab === "history" ? false : prev));

      const flushPending = editorRef.current
        ? Promise.resolve(editorRef.current.flush()).catch(() => {})
        : Promise.resolve();
      const documentPending = adapter.getLeafDocument(lesson.id).catch(() => null);

      const ydoc = createYDoc();
      let seed: TiptapDocument | undefined;
      try {
        const [, doc] = await Promise.all([flushPending, documentPending]);
        if (doc?.ydocState) {
          applyBase64Update(ydoc, doc.ydocState);
        } else {
          seed = resolveLegacyContent(lesson, doc?.body ?? null);
        }
      } catch {
        seed = resolveLegacyContent(lesson, null);
      }

      activeYDocRef.current = ydoc;
      lastSnapshotAtRef.current = 0;
      lastSavedBodyRef.current = null;

      setActiveYDoc(ydoc);
      setActiveSeedContent(seed);
      setActiveLessonTitle(lesson.title);
      setActiveLessonId(lesson.id);
      setActiveBadgeId(null);
    },
    [adapter, resolveLegacyContent, panel.tab]
  );

  const openBadge = useCallback(
    (badge: { id: string; title: string }) => {
      panel.setOpen((prev) => (panel.tab === "history" ? false : prev));
      setActiveYDoc(null);
      setActiveLessonId(null);
      setActiveLessonTitle(badge.title);
      setActiveBadgeId(badge.id);
    },
    [panel.tab]
  );

  // ── Bootstrap: load content on mount ──────────────────────────────────────
  useEffect(() => {
    if (!contentId) {
      router.replace("/");
      return;
    }
    async function bootstrap() {
      try {
        const { meta, containers, badges: loadedBadges } = await adapter.loadContent(contentId!);
        setTitle(meta.title);
        setDescription(meta.description ?? "");
        setPricingModel(meta.pricingModel as "FREE" | "PAID");
        setStatus(meta.status);
        setHasDraftChanges(meta.raw?.hasDraftChanges === true);
        setCourseData(meta.raw);
        onLoadedRef.current?.({ categoryId: meta.categoryId, raw: meta.raw });
        adapter
          .listExams(contentId!)
          .then(setExams)
          .catch(() => {
            // Best-effort — same pattern as the rest of this sidebar's supplementary data.
          });
        setModules(
          containers.map((m) => ({
            id: m.id,
            title: m.title,
            position: m.position,
            expanded: false,
            lessons: (m.leaves || []).filter(
              (l: { type?: string }) => l.type === "document" || l.type === "lesson" || l.type === "quiz" || !l.type
            ) as LessonNode[],
          }))
        );
        setBadges(loadedBadges ?? []);
        const firstLeaf = containers[0]?.leaves?.[0];
        if (firstLeaf && firstLeaf.type === "document") {
          await openLesson(firstLeaf);
        }
      } catch (e) {
        console.error("Failed to load content", e);
      }
      setIsInitializing(false);
    }
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-save handler ─────────────────────────────────────────────────────
  const handleSave = useCallback(
    async (doc: TiptapDocument) => {
      if (!activeLessonId) return;
      const ydoc = activeYDocRef.current;
      if (!ydoc) return;

      const jsonStr = JSON.stringify(doc);
      if (jsonStr === lastSavedBodyRef.current) return;

      scheduleIdle(() => {
        try {
          localStorage.setItem(`arcade-draft-${activeLessonId}`, jsonStr);
        } catch {
          // quota exceeded or storage disabled
        }
      });

      if (collabState.status === "connected") {
        lastSavedBodyRef.current = jsonStr;
        setHasDraftChanges(true);
        return;
      }

      try {
        await adapter.saveLeafDocument(activeLessonId, { ydocState: encodeStateBase64(ydoc), body: jsonStr });
        lastSavedBodyRef.current = jsonStr;
        setHasDraftChanges(true);
      } catch (e) {
        console.warn("Document save failed, localStorage preserved.", e);
        return;
      }

      const now = Date.now();
      if (now - lastSnapshotAtRef.current > SNAPSHOT_INTERVAL_MS) {
        lastSnapshotAtRef.current = now;
        void adapter
          .saveLeafVersion(activeLessonId, { snapshot: encodeSnapshotBase64(ydoc), body: jsonStr, kind: "AUTO" })
          .then(() => setHistoryRefreshKey((k) => k + 1))
          .catch((e) => console.warn("Auto-snapshot failed", e));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeLessonId, collabState.status]
  );

  const handleRestore = useCallback(
    async (body: TiptapDocument, source: { createdAt: string }) => {
      if (!editorRef.current || !activeLessonId) return;
      editorRef.current.setContent(body);
      await editorRef.current.flush();
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
    [activeLessonId, adapter]
  );

  useEffect(() => {
    return () => {
      activeYDoc?.destroy();
    };
  }, [activeYDoc]);

  // ── Exams attached to this content ────────────────────────────────────────

  /**
   * Opens the exam's own Studio workspace — the same Studio this editor is running in, with the
   * exam's questions/pools/plans inside it. Going to the exam's overview instead (as this used to)
   * dropped the author out of authoring and into a summary page, which is the long way round to
   * the thing they just clicked.
   */
  const openExamConfig = useCallback((examId: string) => {
    router.push(`/studio/exam/${examId}/edit`);
  }, [router]);

  const addExam = useCallback(async () => {
    if (!contentId) return;
    setAddingExam(true);
    try {
      const nextIndex = exams.length + 1;
      const exam = await adapter.createAndAttachExam(contentId, `Assessment ${nextIndex}`);
      setExams((prev) => [...prev, exam]);
      openExamConfig(exam.id);
    } catch {
      toast.error("Failed to create exam");
    } finally {
      setAddingExam(false);
    }
  }, [contentId, exams.length, adapter, openExamConfig]);

  const removeExam = useCallback(
    async (examId: string) => {
      if (!contentId) return;
      const previous = exams;
      setExams((prev) => prev.filter((e) => e.id !== examId));
      try {
        await adapter.detachExam(contentId, examId);
        toast.success("Exam removed");
      } catch {
        setExams(previous);
        toast.error("Failed to remove exam");
      }
    },
    [contentId, exams, adapter]
  );

  // ── Tree mutation: Add container (Module / Day) ───────────────────────────

  const addContainer = useCallback(async () => {
    if (!contentId) return;
    try {
      const title = `${adapter.terminology.container} ${modules.length + 1}`;
      const m = await adapter.addContainer(contentId, title);
      setModules((prev) => [...prev, { id: m.id, title: m.title, position: m.position, lessons: [], expanded: true }]);
      setHasDraftChanges(true);
      onContainerCreated?.({ id: m.id, title: m.title });
    } catch (e) {
      console.error("Failed to add container", e);
    }
  }, [contentId, modules.length, adapter, onContainerCreated]);

  const addLesson = useCallback(
    async (moduleId: string) => {
      if (!contentId) return;
      try {
        const mod = modules.find((m) => m.id === moduleId);
        const nextIndex = (mod?.lessons.length ?? 0) + 1;
        const newLesson = await adapter.addLeaf(moduleId, `${adapter.terminology.leafDocument} ${nextIndex}`, "document");
        setModules((prev) =>
          prev.map((m) => (m.id === moduleId ? { ...m, expanded: true, lessons: [...m.lessons, newLesson as LessonNode] } : m))
        );
        setActiveModuleId(moduleId);
        await openLesson(newLesson as LessonNode);
        setHasDraftChanges(true);
      } catch (e) {
        console.error("Failed to add lesson", e);
      }
    },
    [contentId, modules, openLesson, adapter]
  );

  const addBadge = useCallback(async () => {
    if (!contentId || !adapter.addBadge) return;
    try {
      const nextIndex = badges.length + 1;
      const newBadge = await adapter.addBadge(contentId, `${adapter.terminology.leafBadge ?? "Badge"} ${nextIndex}`);
      setBadges((prev) => [...prev, newBadge]);
      openBadge(newBadge);
      setHasDraftChanges(true);
    } catch (e) {
      console.error("Failed to add badge", e);
    }
  }, [contentId, badges.length, openBadge, adapter]);

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
    } else if (kind === "badge") {
      setBadges((prev) => prev.map((b) => (b.id === id ? { ...b, title: value } : b)));
      if (activeBadgeId === id) setActiveLessonTitle(value);
      try {
        await adapter.renameBadge?.(id, value);
        setHasDraftChanges(true);
      } catch (e) {
        console.warn("Badge rename failed", e);
      }
    } else {
      setModules((prev) => prev.map((m) => ({ ...m, lessons: m.lessons.map((l) => (l.id === id ? { ...l, title: value } : l)) })));
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
    setModules((prev) => prev.filter((m) => m.id !== mod.id));
    if (hadActive) {
      setActiveLessonId(null);
      activeYDocRef.current = null;
      setActiveYDoc(null);
      setActiveSeedContent(undefined);
      panel.setOpen((prev) => (panel.tab === "history" ? false : prev));
    }
    try {
      await adapter.deleteContainer(mod.id);
      setHasDraftChanges(true);
    } catch (e) {
      console.error("Failed to delete module", e);
    }
  };

  const deleteLessonNow = async (lessonId: string) => {
    setModules((prev) => prev.map((m) => ({ ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) })));
    if (activeLessonId === lessonId) {
      setActiveLessonId(null);
      activeYDocRef.current = null;
      setActiveYDoc(null);
      setActiveSeedContent(undefined);
      panel.setOpen((prev) => (panel.tab === "history" ? false : prev));
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

  const deleteBadgeNow = async (badgeId: string) => {
    setBadges((prev) => prev.filter((b) => b.id !== badgeId));
    if (activeBadgeId === badgeId) {
      setActiveBadgeId(null);
      panel.setOpen((prev) => (panel.tab === "history" ? false : prev));
    }
    try {
      await adapter.deleteBadge?.(badgeId);
      setHasDraftChanges(true);
    } catch (e) {
      console.error("Failed to delete badge", e);
    }
  };

  const askDeleteBadge = (badge: BadgeNode) =>
    setConfirm({
      title: `Delete ${adapter.terminology.leafBadge ?? "Badge"}?`,
      message: `"${badge.title}" and its saved design will be permanently deleted. This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
      onConfirm: () => deleteBadgeNow(badge.id),
    });

  const askRemoveExam = (exam: ExamSummary) =>
    setConfirm({
      title: "Remove this exam?",
      message: `"${exam.title}" will no longer be attached here. It becomes a standalone exam — nothing about the exam itself (questions, attempts, results) is deleted.`,
      confirmLabel: "Remove",
      danger: true,
      onConfirm: () => removeExam(exam.id),
    });

  // ── Back to dashboard (flush every pending save first) ────────────────────

  const handleBack = useCallback(async () => {
    if (navigatingBack) return;
    setNavigatingBack(true);

    const tasks: Promise<unknown>[] = [];
    if (contentId) {
      tasks.push(
        adapter.updateMeta(contentId, { title, description, pricingModel }).catch((e) => console.warn("Content metadata flush failed", e))
      );
    }
    if (activeLessonId) {
      tasks.push(
        api
          .patch(`/api/lessons/${activeLessonId}`, { title: activeLessonTitle.trim() || adapter.terminology.leafDocument })
          .catch((e) => console.warn("Lesson title flush failed", e))
      );
      if (editorRef.current) {
        tasks.push(Promise.resolve(editorRef.current.flush()).catch((e) => console.warn("Lesson body flush failed", e)));
      }
    }
    await Promise.all(tasks);

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

    router.push(backHref);
  }, [navigatingBack, contentId, title, description, pricingModel, activeLessonId, activeLessonTitle, router, adapter, backHref]);

  // ── Submit for review ─────────────────────────────────────────────────────

  const askSubmit = () => setSubmitDialogOpen(true);

  const handleSubmit = async (data: { coverImageUrl?: string; pricingModel: "FREE" | "PAID"; priceAmount?: number; message?: string }) => {
    if (!contentId) return;
    if (editorRef.current) {
      try {
        await editorRef.current.flush();
      } catch {
        // best-effort
      }
    }
    try {
      const updated = await onSubmit(data);
      setStatus(updated.status);
      if (updated.updatedAt !== undefined) {
        // Consumed by nothing today beyond the settings panel that no longer renders here —
        // kept for parity with the previous behaviour rather than silently dropped.
      }
      setHistoryRefreshKey((k) => k + 1);
      setSubmitDialogOpen(false);
      setHasDraftChanges(false);
    } catch (e) {
      console.error("Failed to submit content", e);
      throw e;
    }
  };

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
      className={`min-w-0 flex-1 rounded border border-indigo-300 bg-transparent px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-indigo-300 ${className}`}
    />
  );

  const isEditing = (kind: EditKind, id: string) => editing?.kind === kind && editing.id === id;

  // ── Render ────────────────────────────────────────────────────────────────

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-gray-500">Setting up your {adapter.terminology.root.toLowerCase()}…</p>
        </div>
      </div>
    );
  }

  return (
    <StudioEditorFrame>
      {submitDialogOpen && (
        <CourseSubmitDialog
          course={courseData}
          contentType={adapter.terminology.root === "Course" ? "course" : "workshop"}
          open={submitDialogOpen}
          onClose={() => setSubmitDialogOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
      {collaboratorsModalOpen && contentId && (
        <ContentCollaboratorsModal
          isOpen={collaboratorsModalOpen}
          onClose={() => setCollaboratorsModalOpen(false)}
          contentId={contentId}
          contentType={adapter.terminology.root === "Course" ? "course" : "workshop"}
        />
      )}
      <ConfirmDialog options={confirm} onClose={() => setConfirm(null)} />
      {extraDialogs}

      <StudioEditorTopBar
        onBack={handleBack}
        backDisabled={navigatingBack}
        breadcrumb={
          activeLessonId || activeBadgeId ? (
            <div className="flex items-center gap-1.5 text-gray-500">
              {activeLessonId && modules.find((m) => m.lessons.some((l) => l.id === activeLessonId))?.title && (
                <>
                  <span className="block max-w-[15vw] truncate font-medium">
                    {modules.find((m) => m.lessons.some((l) => l.id === activeLessonId))?.title}
                  </span>
                  <span className="text-gray-400">/</span>
                </>
              )}
              <span className="block max-w-[20vw] truncate text-[#14142b]">{activeLessonTitle}</span>
            </div>
          ) : (
            <span className="block max-w-[40vw] truncate text-[#14142b]">{title || adapter.terminology.root}</span>
          )
        }
        actions={
          <>
            <StudioPresenceStack collaborators={collabState.collaborators} />
            {contentId && <StudioShareControl onOpenCollaborators={() => setCollaboratorsModalOpen(true)} />}
            <StudioPanelToggle open={panel.open} onToggle={() => panel.setOpen((prev: boolean) => !prev)} />
            {headerExtras?.({ activeLessonId, activeModuleId }).beforeSubmit}
            {status !== "SUBMITTED" && (
              <StudioActionButton
                onClick={askSubmit}
                icon={<Send size={14} />}
                label={status === "PUBLISHED" || status === "APPROVED" ? "Submit Updates" : status === "REJECTED" ? "Resubmit" : "Submit"}
              />
            )}
            {headerExtras?.({ activeLessonId, activeModuleId }).afterSubmit}
          </>
        }
      />

      <StudioRightPanel
        {...panel.sidebarProps}
        mode={panel.open ? "workflow" : activeBadgeId ? "editor" : "closed"}
        activeLessonId={activeLessonId}
        collabState={collabState}
        editorContextNode={activeBadgeId ? <BadgeEditorContextPanel editor={badgeEditor} /> : undefined}
        footerOverride={activeBadgeId ? { label: "Badge ID", value: activeBadgeId } : null}
        historyContent={
          activeLessonId ? (
            <VersionHistoryOrchestrator
              lessonId={activeLessonId}
              open={panel.open && panel.tab === "history"}
              onClose={() => panel.setOpen(false)}
              refreshKey={historyRefreshKey}
              onRestore={handleRestore}
              embedded
              renderEditor={(previewDoc, selectedId) => (
                <div key={selectedId} className="bg-white">
                  <TiptapContentView body={JSON.stringify(previewDoc)} />
                </div>
              )}
            />
          ) : null
        }
      />

      <StudioEditorBody
        sidebarTitle={`${adapter.terminology.root} structure`}
        toolbarClearance={Boolean(activeLessonId || activeBadgeId)}
        sidebarTree={
          <>
            {modules.length === 0 && badges.length === 0 && (
              <div className={TREE_EMPTY_STATE_CLASS}>
                <Layers size={24} className="text-[#14142b]/40" />
                <p className="text-xs font-medium text-[#14142b]/60">{copy.noContainers}</p>
              </div>
            )}

            {modules.map((mod) => {
              const isModuleActive = mod.lessons.some((l) => l.id === activeLessonId);
              const isExpanded = mod.expanded || isModuleActive;
              return (
                <div key={mod.id} className="mb-2 flex flex-col gap-1">
                  <div className={TREE_CONTAINER_ROW_CLASS}>
                    <button
                      type="button"
                      onClick={() => setModules((prev) => prev.map((m) => (m.id === mod.id ? { ...m, expanded: !m.expanded } : m)))}
                      className="flex-shrink-0 text-[#14142b]/50 hover:text-[#14142b]"
                    >
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    {isEditing("module", mod.id) ? (
                      renameInput("text-xs font-bold text-[#14142b]")
                    ) : (
                      <span
                        onDoubleClick={() => startEdit("module", mod.id, mod.title)}
                        className="flex-1 truncate text-xs font-bold text-[#14142b]"
                        title={mod.title}
                      >
                        {mod.title}
                      </span>
                    )}

                    {status !== "SUBMITTED" && (
                      <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <DropdownMenu>
                          <DropdownMenuTrigger title="Add lesson" className="rounded-full p-1 text-[#14142b]/50 hover:bg-[#14142b]/10 hover:text-[#14142b]">
                            <Plus size={12} />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" sideOffset={4}>
                            <DropdownMenuItem onClick={() => addLesson(mod.id)}>
                              <FileText size={13} />
                              Lesson
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

                  {isExpanded && (
                    <div className="ml-5 flex flex-col gap-1 border-l border-[#14142b]/10 pl-3 pt-1">
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => handleDragEnd(mod.id, event)}>
                        <SortableContext items={mod.lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                          {mod.lessons
                            .slice()
                            .sort((a, b) => a.position - b.position)
                            .map((lesson) => {
                              const isActive = activeLessonId === lesson.id;
                              return (
                                <SortableRow
                                  key={lesson.id}
                                  id={lesson.id}
                                  className={`group flex items-center gap-2 rounded-full px-3 transition-all ${isActive ? "bg-[#14142b] shadow-md" : "hover:bg-white/40"}`}
                                >
                                  {(dragHandleProps) => (
                                    <>
                                      <div
                                        {...dragHandleProps}
                                        className="-ml-1 cursor-grab py-1 text-gray-400 opacity-0 transition-opacity hover:text-gray-900 group-hover:opacity-100"
                                      >
                                        <GripVertical size={13} />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveModuleId(mod.id);
                                          openLesson(lesson);
                                        }}
                                        className={`flex min-w-0 flex-1 items-center gap-1.5 py-1.5 text-left text-xs ${isActive ? "font-semibold text-white" : "text-slate-500"}`}
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
                                      {status !== "SUBMITTED" && (
                                        <div className="flex flex-shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                                          <IconBtn title="Rename lesson" onClick={() => startEdit("lesson", lesson.id, lesson.title)}>
                                            <Pencil size={12} />
                                          </IconBtn>
                                          <IconBtn title="Delete lesson" danger onClick={() => askDeleteLesson(lesson)}>
                                            <Trash2 size={12} />
                                          </IconBtn>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </SortableRow>
                              );
                            })}
                        </SortableContext>
                      </DndContext>

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
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* ── Exams: a sibling of Modules — placement, not a lesson. Any number of
                 exams may be attached; each is independently configured, versioned, published. ── */}
            {exams.length > 0 && (
              <div className="mb-2 flex flex-col gap-1">
                {exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="group flex items-center gap-2 rounded-2xl border border-dashed border-[#14142b]/15 bg-[#14142b]/[0.03] px-3 py-2 shadow-sm transition-all hover:border-[#14142b]/25 hover:bg-[#14142b]/[0.06]"
                  >
                    <button
                      type="button"
                      onClick={() => openExamConfig(exam.id)}
                      title="Open this exam in Studio — questions, pools, plans and settings"
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      <GraduationCap size={14} className="flex-shrink-0 text-[#14142b]/50" />
                      <span className="flex-1 truncate text-xs font-bold text-[#14142b]/70" title={exam.title}>
                        {exam.title}
                      </span>
                      <span className="flex-shrink-0 rounded-full bg-[#14142b]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#14142b]/50">
                        {exam.wasPublished ? "Published" : "Draft"}
                      </span>
                    </button>
                    {status !== "SUBMITTED" && (
                      <IconBtn title="Remove" danger onClick={() => askRemoveExam(exam)}>
                        <Trash2 size={12} />
                      </IconBtn>
                    )}
                  </div>
                ))}
                <p className="pl-3 text-[10px] leading-relaxed text-slate-400">
                  Shown to students on the {adapter.terminology.root.toLowerCase()} page&apos;s Assessments tab. Open an exam to edit its
                  questions and plans.
                </p>
              </div>
            )}

            {/* ── Badges: root-level tree items, a sibling of Modules — never nested inside one. ── */}
            {badges.length > 0 && (
              <div className="mt-2 flex flex-col gap-1">
                {badges
                  .slice()
                  .sort((a, b) => a.position - b.position)
                  .map((badge) => {
                    const isActive = activeBadgeId === badge.id;
                    return (
                      <div
                        key={badge.id}
                        className={`group flex items-center gap-2 rounded-2xl border border-white/40 px-3 py-2 backdrop-blur-md shadow-sm transition-all ${isActive ? "bg-[#14142b] shadow-md" : "bg-white/60 hover:bg-white/80"}`}
                      >
                        <button
                          type="button"
                          onClick={() => openBadge(badge)}
                          className={`flex min-w-0 flex-1 items-center gap-1.5 text-left text-xs ${isActive ? "font-semibold text-white" : "font-bold text-[#14142b]"}`}
                        >
                          <Award size={13} className="flex-shrink-0" />
                          {isEditing("badge", badge.id) ? (
                            renameInput("text-xs")
                          ) : (
                            <span className="truncate" title={badge.title}>
                              {badge.title}
                            </span>
                          )}
                        </button>
                        {status !== "SUBMITTED" && (
                          <div className="flex flex-shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                            <IconBtn title="Rename badge" onClick={() => startEdit("badge", badge.id, badge.title)}>
                              <Pencil size={12} />
                            </IconBtn>
                            <IconBtn title="Delete badge" danger onClick={() => askDeleteBadge(badge)}>
                              <Trash2 size={12} />
                            </IconBtn>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </>
        }
        sidebarActions={
          status !== "SUBMITTED" ? (
            <div className={TREE_SIDEBAR_ACTIONS_CLASS}>
              {/* One primary action plus a menu, rather than a column of equally-weighted buttons
                  that grows by one every time the content model gains a capability. Adding a
                  container is what an author does constantly; adding a badge or an exam is
                  occasional, so those sit one click away instead of competing for the same
                  visual weight. */}
              <div className="flex items-stretch gap-1.5">
                <button
                  type="button"
                  onClick={addContainer}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/40 bg-white/70 px-4 py-2.5 text-xs font-bold text-[#14142b] shadow-sm backdrop-blur-md transition-all hover:bg-white/90 hover:shadow"
                >
                  <Plus size={14} />
                  Add {adapter.terminology.container}
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    title="Add something else to this content"
                    className="flex w-10 shrink-0 items-center justify-center rounded-2xl border border-white/40 bg-white/70 text-[#14142b] shadow-sm backdrop-blur-md transition-all hover:bg-white/90 hover:shadow"
                  >
                    <ChevronDown size={14} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="z-50 w-56 rounded-xl border border-slate-100 bg-white p-1.5 shadow-lg">
                    {typeof adapter.addBadge === "function" && (
                      <DropdownMenuItem onClick={addBadge} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                        <Award size={14} className="text-amber-500" />
                        Add {adapter.terminology.leafBadge ?? "Badge"}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={addExam} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                      {addingExam ? <Loader2 size={14} className="animate-spin text-indigo-500" /> : <GraduationCap size={14} className="text-indigo-500" />}
                      Add Exam
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {sidebarExtras}
            </div>
          ) : undefined
        }
      >
        {status === "SUBMITTED" && (
          <div className="pointer-events-none fixed inset-x-0 top-20 z-[70] flex justify-center">
            <div className="pointer-events-auto flex max-w-[calc(100vw-2rem)] items-center rounded-full border border-slate-200 bg-white px-5 py-2 shadow-md">
              <span className="flex items-center gap-2 text-sm font-medium text-amber-600">
                <span>🔒</span> This content has been submitted for review and is currently locked for editing until a decision is made.
              </span>
            </div>
          </div>
        )}
        {activeBadgeId ? (
          <div className="flex h-full w-full max-w-[1400px] flex-1 min-h-0 transition-all duration-300">
            <BadgeEditorWorkspace key={activeBadgeId} editor={badgeEditor} />
          </div>
        ) : activeLessonId ? (
          <div className={CANVAS_WRAPPER_CLASS} style={{ "--arcade-toolbar-top": "64px" } as CSSProperties}>
            <div className={CANVAS_CARD_CLASS}>
              {activeYDoc && (
                <ArcadeEditor
                  key={activeLessonId}
                  ref={editorRef}
                  ydoc={activeYDoc}
                  documentId={activeLessonId}
                  seedContent={activeSeedContent}
                  placeholder="Start writing your lesson content…"
                  onSave={handleSave}
                  onCollabStateChange={handleCollabStateChange}
                  chromeless
                  readOnly={status === "SUBMITTED"}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
              <FileText size={28} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-700">{copy.canvasTitle}</h3>
              <p className="mt-1 text-sm text-gray-400">{copy.canvasDescription}</p>
            </div>
          </div>
        )}
      </StudioEditorBody>
    </StudioEditorFrame>
  );
});
