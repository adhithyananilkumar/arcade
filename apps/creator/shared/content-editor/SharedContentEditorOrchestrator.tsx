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
import Link from "next/link";
import Image from "next/image";
import type * as Y from "yjs";
import type { CollabStatus, ActiveCollaborator } from "../../editor/hooks/useArcadeEditor";
import {
  getCollaborators,
  inviteCollaborator,
  removeCollaborator,
  type Collaborator,
} from "@/app/(authenticated)/studio/events/api/collaboration";
import { api } from "@/infrastructure/http/api";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
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
import { QuizEditor } from "@/domains/assessments";
import { TiptapContentView } from "@/domains/learning";
import { CourseSubmitDialog } from "../../components/CourseSubmitDialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/design-system/ui/dropdown-menu";
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
  GripVertical,
  FileQuestion,
  Users,
  UserPlus,
} from "lucide-react";

function SortableRow({ id, children, className }: { id: string, children: (dragHandleProps: any) => React.ReactNode, className?: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={className}
    >
      {children({ ...attributes, ...listeners })}
    </div>
  );
}

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
import { EventAdapter } from "./adapters/EventAdapter";
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
        : new EventAdapter(contentId || "");
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
  const [contentChannelId, setContentChannelId] = useState<string | null>(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);


  const [modules, setModules] = useState<ModuleNode[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeLessonTitle, setActiveLessonTitle] = useState(adapter.terminology.leafDocument);
  // A quiz item is open in the main panel (mutually exclusive with a lesson).
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

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [statusHistoryOpen, setStatusHistoryOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const [collabState, setCollabState] = useState<{ status: CollabStatus; collaborators: ActiveCollaborator[] }>({
    status: "disabled",
    collaborators: [],
  });
  const [collabPopoverOpen, setCollabPopoverOpen] = useState(false);

  const handleCollabStateChange = useCallback((state: { status: CollabStatus; collaborators: ActiveCollaborator[] }) => {
    setCollabState(state);
  }, []);

  const [eventCollaborators, setEventCollaborators] = useState<Collaborator[]>([]);
  const [loadingCollaborators, setLoadingCollaborators] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"EDITOR" | "MANAGER" | "VIEWER">("EDITOR");
  const [userSearchResults, setUserSearchResults] = useState<Array<{ id: string; label: string; avatarUrl: string | null }>>([]);
  const [inviting, setInviting] = useState(false);

  const collabApiBasePath = useMemo(() => {
    if (contentType === "course") return `/api/v1/courses/${contentId}/collaborators`;
    if (contentType === "roadmap") return `/api/roadmaps/${contentId}/collaborators`;
    return `/api/v1/events/${contentId}/collaborators`;
  }, [contentType, contentId]);

  const loadCollaborators = useCallback(async () => {
    if (!contentId) return;
    setLoadingCollaborators(true);
    try {
      const data = await api.get<Collaborator[]>(collabApiBasePath);
      setEventCollaborators(data || []);
    } catch (e) {
      console.error("Failed to load collaborators", e);
    } finally {
      setLoadingCollaborators(false);
    }
  }, [contentId, collabApiBasePath]);

  useEffect(() => {
    if (collabPopoverOpen && contentId) {
      loadCollaborators();
    }
  }, [collabPopoverOpen, contentId, loadCollaborators]);

  useEffect(() => {
    if (!inviteEmail || inviteEmail.length < 2) {
      setUserSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get<Array<{ id: string; label: string; avatarUrl: string | null }>>(
          `/api/v1/users/search?q=${encodeURIComponent(inviteEmail)}`
        );
        setUserSearchResults(res || []);
      } catch {
        setUserSearchResults([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [inviteEmail]);

  const handleAddCollaborator = async (emailToAdd?: string) => {
    const email = emailToAdd || inviteEmail.trim();
    if (!email || !contentId) return;
    setInviting(true);
    try {
      await api.post<Collaborator>(collabApiBasePath, { email, role: inviteRole });
      toast.success(`Added ${email} as collaborator`);
      setInviteEmail("");
      setUserSearchResults([]);
      setShowAddForm(false);
      await loadCollaborators();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to add collaborator";
      toast.error(msg);
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveCollaborator = async (targetUserId: string, targetName: string) => {
    if (!contentId) return;
    try {
      await api.delete<void>(`${collabApiBasePath}/${targetUserId}`);
      toast.success(`Removed ${targetName}`);
      await loadCollaborators();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to remove collaborator";
      toast.error(msg);
    }
  };

  const [qbOpen, setQbOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [navigatingBack, setNavigatingBack] = useState(false);

  // Event Day Settings dialog — keyed on the session (container) ID, not the lesson.
  const [sessionSettingsSessionId, setSessionSettingsSessionId] = useState<string | null>(null);
  // Track which module (Day) currently contains the active lesson for the Settings button.
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  // Imperative handle to force-save the open lesson before navigating away.
  const editorRef = useRef<ArcadeEditorHandle>(null);

  // Main-panel view: the lesson editor ("tree").
  const [view, setView] = useState<"tree">("tree");

  // Sidebar collapse state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Inline rename + confirm dialog state
  const [editing, setEditing] = useState<{ kind: EditKind; id: string } | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [confirm, setConfirm] = useState<ConfirmOptions | null>(null);

  // ── Drag and Drop Handlers ────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (moduleId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId) return m;

        // Flatten items to get their current order
        const items = [...m.lessons.map(l => ({ id: l.id, type: 'lesson' as const, node: l }))]
          .sort((a, b) => a.node.position - b.node.position);

        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return m;

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update positions
        const nextLessons = [...m.lessons];

        const itemIds: string[] = [];

        newItems.forEach((item, index) => {
          itemIds.push(item.id);
          if (item.type === 'lesson') {
            const lIndex = nextLessons.findIndex(l => l.id === item.id);
            if (lIndex !== -1) nextLessons[lIndex] = { ...nextLessons[lIndex], position: index };
          }
        });

        // Fire API call in background
        api.patch(`/api/modules/${moduleId}/reorder`, { itemIds }).catch((e) => {
          console.error("Failed to reorder items", e);
          toast.error("Failed to save new order");
        });

        return { ...m, lessons: nextLessons };
      })
    );
  };

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
        setContentChannelId(meta.raw?.channelId || null);
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
            expanded: false,
            lessons: ((m as any).leaves || []).filter((l: any) => l.type === "lesson" || !l.type),
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
          // quota exceeded or storage disabled
        }
      });

      // When actively connected to Hocuspocus collaboration server, Hocuspocus handles
      // real-time CRDT updates and periodic server-side persistence to PostgreSQL.
      // Skipping client REST save avoids race conditions and duplicate DB writes.
      if (collabState.status === "connected") {
        lastSavedBodyRef.current = jsonStr;
        setHasDraftChanges(true);
        return;
      }

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
          expanded: true,
        },
      ]);
    } catch (e) {
      console.error("Failed to add module", e);
    }
  }, [contentId, modules.length, adapter]);

  // ── Tree mutation: Add Day (container) — workshop only ───────────────────

  const addEventDay = useCallback(
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
    setModules((prev) => prev.filter((m) => m.id !== mod.id));
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
        const { submitEvent } = await import(
          "@/app/(authenticated)/studio/events/api/publish"
        );
        const updated = await submitEvent(contentId, { message: data.message });
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
      className={`min-w-0 flex-1 rounded border border-indigo-300 bg-transparent px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-indigo-300 ${className}`}
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
    // `fixed inset-0` rather than `h-screen` — a height utility still lets this box
    // contribute to the document's scrollable area if any ancestor's height
    // resolution is off (e.g. the immersive-route check in LearnerShell misses this
    // path), which is what produced the page-wide scrollbar on top of the canvas's
    // own. Taking it out of flow entirely removes that possibility outright: the
    // canvas's `overflow-y-auto` below is the only scroll container left.
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#fafafa]">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[20%] h-[70%] w-[50%] animate-pulse rounded-full bg-indigo-500/15 blur-[120px] duration-10000" />
        <div className="absolute -right-[10%] top-[10%] h-[60%] w-[45%] animate-pulse rounded-full bg-rose-500/15 blur-[120px] duration-7000" />
        <div className="absolute -bottom-[20%] left-[20%] h-[60%] w-[60%] animate-pulse rounded-full bg-emerald-500/15 blur-[120px] duration-10000" />
      </div>
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
        eventId={contentId!}
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

      {/* ── Floating Editor Top Bar (Invisible Wrapper) ───── */}
      <div className="absolute inset-x-0 top-4 z-30 pointer-events-none flex justify-center px-4 sm:px-6">
        <div className="relative flex w-full items-center justify-between">
          {/* Left: Logo & Back Button */}
          <div className="pointer-events-auto flex items-center gap-2">
            {/* Logo Island */}
            <div className="flex h-10 shrink-0 items-center rounded-full px-5 bg-white/60 shadow-sm border border-white/40 backdrop-blur-md">
              <Link href="/" className="group flex cursor-pointer items-center">
                <Image
                  src="/arcade.svg"
                  alt="Arcade"
                  width={85}
                  height={24}
                  className="h-5 w-auto transition-transform duration-200 group-hover:scale-[1.02]"
                />
              </Link>
            </div>
            
            {/* Back Button */}
            <button
              type="button"
              onClick={handleBack}
              disabled={navigatingBack}
              title="Save and return to Content Studio"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/60 text-[#14142b] shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md disabled:opacity-60 backdrop-blur-md"
            >
              <ArrowLeft size={16} />
            </button>
          </div>

          {/* Center: Title */}
          <div className="pointer-events-auto absolute left-1/2 flex -translate-x-1/2 items-center mt-3">
            <div className="flex h-10 items-center justify-center rounded-full border border-white/40 bg-white/60 px-5 py-2 text-sm font-bold tracking-tight text-[#14142b] shadow-sm backdrop-blur-md">
              <span className="block max-w-[40vw] truncate">
                  {activeLessonId
                  ? activeLessonTitle
                  : title || adapter.terminology.root}
              </span>
            </div>
          </div>

          {/* Right actions */}
          <div className="pointer-events-auto flex flex-shrink-0 items-center justify-end gap-2">
            {activeLessonId && (
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                title="History"
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/60 text-slate-600 shadow-sm border border-white/40 transition-colors hover:bg-white hover:text-[#14142b]"
              >
                <History size={16} />
              </button>
            )}

            <button
              type="button"
              onClick={() => setStatusHistoryOpen(true)}
              title="Status"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/60 text-slate-600 shadow-sm border border-white/40 transition-colors hover:bg-white hover:text-[#14142b]"
            >
              <MessageSquare size={16} />
            </button>

            {activeLessonId && contentType === "workshop" && activeModuleId && (
              <button
                type="button"
                onClick={() => setSessionSettingsSessionId(activeModuleId)}
                title="Day Schedule & Settings"
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/60 text-slate-600 shadow-sm border border-white/40 transition-colors hover:bg-white hover:text-[#14142b]"
              >
                <Settings size={16} />
              </button>
            )}

            {status !== "SUBMITTED" && (
              <button
                type="button"
                onClick={askSubmit}
                className="flex h-10 flex-shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[#14142b] px-5 py-2 text-sm font-bold text-white shadow-[0_6px_16px_rgba(20,20,43,0.18)] transition-all hover:scale-105 hover:bg-[#232735] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
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
                onClick={() => router.push(`/studio/events/${contentId}`)}
                className="inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <span className="hidden sm:inline">Manage</span>
              </button>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setCollabPopoverOpen((prev) => !prev)}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/60 text-slate-600 shadow-sm border border-white/40 transition-colors hover:bg-white hover:text-[#14142b]"
                title="Share"
              >
                <span className="absolute top-0 right-0 flex h-2.5 w-2.5">
                  {collabState.status === "connected" ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white"></span>
                    </>
                  ) : collabState.status === "connecting" ? (
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 border border-white animate-pulse"></span>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-300 border border-white"></span>
                  )}
                </span>
                <Users size={16} />
              </button>

              {collabPopoverOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-[#14142b]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#14142b]">
                        Real-Time Collaboration
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        collabState.status === "connected"
                          ? "bg-emerald-50 text-emerald-600"
                          : collabState.status === "connecting"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {collabState.status}
                    </span>
                  </div>

                  {/* Section 1: ACTIVE EDITORS (Hocuspocus Real-time Awareness) */}
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Active Editors ({collabState.collaborators.length})
                      </span>
                    </div>
                    {collabState.collaborators.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-0.5">No other active editors</p>
                    ) : (
                      <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                        {collabState.collaborators.map((c) => (
                          <div
                            key={c.clientId}
                            className="flex items-center justify-between rounded-lg bg-emerald-50/60 border border-emerald-100 p-2 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm"
                                style={{ backgroundColor: c.user?.color || "#10b981" }}
                              >
                                {(c.user?.name || "A")[0].toUpperCase()}
                              </div>
                              <span className="font-semibold text-slate-800">
                                {c.user?.name || `User ${c.clientId}`}
                              </span>
                            </div>
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Editing now" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section 2: COLLABORATORS (Access Control) */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Collaborators ({eventCollaborators.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddForm((prev) => !prev)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        <UserPlus size={13} />
                        <span>Add</span>
                      </button>
                    </div>

                    {/* Inline Add Collaborator Form */}
                    {showAddForm && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs animate-in fade-in duration-150">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="User email or name..."
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                          />
                          {userSearchResults.length > 0 && (
                            <div className="absolute left-0 right-0 top-full mt-1 max-h-36 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg z-50">
                              {userSearchResults.map((u) => (
                                <button
                                  key={u.id}
                                  type="button"
                                  onClick={() => {
                                    setInviteEmail(u.label);
                                    setUserSearchResults([]);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-indigo-50 flex items-center justify-between"
                                >
                                  <span className="font-medium text-slate-800">{u.label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value as any)}
                            className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 bg-white font-medium focus:outline-none"
                          >
                            <option value="EDITOR">Editor</option>
                            <option value="MANAGER">Manager</option>
                            <option value="VIEWER">Viewer</option>
                          </select>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddForm(false);
                                setInviteEmail("");
                                setUserSearchResults([]);
                              }}
                              className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={inviting || !inviteEmail.trim()}
                              onClick={() => handleAddCollaborator()}
                              className="rounded-lg bg-[#14142b] px-3 py-1 text-xs font-semibold text-white hover:bg-[#232735] disabled:opacity-50 transition-colors"
                            >
                              {inviting ? "Adding..." : "Add"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Collaborators List */}
                    {loadingCollaborators ? (
                      <p className="text-xs text-slate-400 py-1">Loading collaborators...</p>
                    ) : eventCollaborators.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-1">No collaborators added</p>
                    ) : (
                      <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                        {eventCollaborators.map((member) => (
                          <div
                            key={member.userId}
                            className="flex items-center justify-between rounded-lg bg-slate-50 p-2 text-xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-600">
                                {(member.name || member.email || "U")[0].toUpperCase()}
                              </div>
                              <div className="truncate">
                                <p className="font-medium text-slate-800 truncate">{member.name || member.email}</p>
                                <p className="text-[10px] text-slate-400 truncate">{member.email}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  member.role === "OWNER"
                                    ? "bg-purple-100 text-purple-700"
                                    : member.role === "MANAGER"
                                    ? "bg-blue-100 text-blue-700"
                                    : member.role === "EDITOR"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {member.role}
                              </span>

                              {member.role !== "OWNER" && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCollaborator(member.userId, member.name || member.email)}
                                  className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors"
                                  title="Remove collaborator"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Document ID:</span>
                    <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[140px]">
                      {activeLessonId ? `lesson:${activeLessonId}` : "None"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    {/* Floating Status & Save State (Bottom Right) */}
    <div className="absolute bottom-6 right-6 z-30 pointer-events-none flex flex-col items-end gap-2">
      {status !== "SUBMITTED" && (
        <div className="pointer-events-auto flex h-8 items-center justify-center rounded-full border border-white/40 bg-white/60 px-3 text-xs font-bold text-slate-500 shadow-sm backdrop-blur-md transition-colors hover:bg-white">
          {hasDraftChanges ? "Unsaved changes" : "Saved"}
        </div>
      )}
      <div className="pointer-events-auto rounded-full shadow-lg bg-white/60 backdrop-blur-md p-1 border border-white/40 transition-colors hover:bg-white">
        <StatusPill status={status} />
      </div>
    </div>

      {/* ── Canvas + floating overlays ────────────────────────────────────── */}
      <div className="relative min-h-0 flex-1 flex flex-col pt-36">
        {/* ── Floating collapsible sidebar: course tree (hidden for roadmaps) ─────────── */}
        {contentType !== "roadmap" && (
          <aside className="absolute left-4 top-36 z-20 flex flex-col h-[calc(100vh-10rem)] w-[268px] pointer-events-none">
            <div className="pointer-events-auto flex flex-col w-full h-full">
              {!sidebarOpen ? (
                <button
                  type="button"
                  title="Expand sidebar"
                  onClick={() => setSidebarOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/40 text-[#14142b] shadow-lg backdrop-blur-xl transition-all hover:bg-white/60 hover:shadow-xl"
                >
                  <PanelLeftOpen size={18} />
                </button>
              ) : (
                <div className="flex w-full flex-col h-full overflow-hidden">
                  {/* ── Sidebar header ───────────────── */}
                  <div className="flex flex-shrink-0 items-center justify-between mb-2">
                    <span className="min-w-0 flex-1 truncate px-1 text-[11px] font-bold uppercase tracking-[0.15em] text-[#14142b]/60">
                      {adapter.terminology.root} structure
                    </span>
                    <button
                      type="button"
                      title="Collapse sidebar"
                      onClick={() => setSidebarOpen(false)}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/40 text-[#14142b] shadow-sm backdrop-blur-xl transition-all hover:bg-white/60"
                    >
                      <PanelLeftClose size={14} />
                    </button>
                  </div>

                  {/* ── Body ──────────────────────────────── */}
                  <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-4 pr-1 scrollbar-hide">
                    {modules.length === 0 && (
                      <div className="flex flex-col items-center gap-3 px-4 py-8 text-center rounded-3xl border border-white/40 bg-white/30 backdrop-blur-md shadow-sm">
                        <Layers size={24} className="text-[#14142b]/40" />
                        <p className="text-xs font-medium text-[#14142b]/60">
                          {contentType === "workshop"
                            ? "Create your first workshop day."
                            : "No modules yet. Add a module to get started."}
                        </p>
                      </div>
                    )}

                    {modules.map((mod) => (
                      <div key={mod.id} className="mb-2 flex flex-col gap-1">
                        {/* Module pill row */}
                        <div className="group flex items-center gap-2 rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md px-3 py-2 shadow-sm transition-all hover:border-white/60 hover:bg-white/80">
                            <button
                              type="button"
                              onClick={() =>
                                setModules((prev) =>
                                  prev.map((m) =>
                                    m.id === mod.id ? { ...m, expanded: !m.expanded } : m
                                  )
                                )
                              }
                              className="flex-shrink-0 text-[#14142b]/50 hover:text-[#14142b]"
                            >
                              {mod.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
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
                                  <DropdownMenuTrigger
                                    title="Add lesson or quiz"
                                    className="rounded-full p-1 text-[#14142b]/50 hover:bg-[#14142b]/10 hover:text-[#14142b]"
                                  >
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

                        {/* Lessons and quizzes, interleaved by position */}
                        {mod.expanded && (
                          <div className="ml-5 flex flex-col gap-1 border-l border-[#14142b]/10 pl-3 pt-1">
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={(event) => handleDragEnd(mod.id, event)}
                            >
                              <SortableContext
                                items={mod.lessons.map((l) => l.id)}
                                strategy={verticalListSortingStrategy}
                              >
                                {mod.lessons.map((l) => ({ kind: "lesson" as const, node: l }))
                                  .sort((a, b) => a.node.position - b.node.position)
                                  .map((item) => {
                                    const isActive = activeLessonId === item.node.id;
                                    return (
                                      <SortableRow
                                        key={item.node.id}
                                        id={item.node.id}
                                        className={`group flex items-center gap-2 rounded-full px-3 transition-all ${isActive ? "bg-[#14142b] shadow-md" : "hover:bg-white/40"
                                          }`}
                                      >
                                        {(dragHandleProps) => (
                                          <>
                                            <div
                                              {...dragHandleProps}
                                              className="cursor-grab hover:text-gray-900 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity -ml-1 py-1"
                                            >
                                              <GripVertical size={13} />
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setActiveModuleId(mod.id);
                                                openLesson(item.node);
                                              }}
                                              className={`flex min-w-0 flex-1 items-center gap-1.5 py-1.5 text-left text-xs ${isActive
                                                ? "font-semibold text-white"
                                                : "text-slate-500"
                                                }`}
                                            >
                                              <FileText size={11} className="flex-shrink-0" />
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
                                                <IconBtn
                                                  title="Rename lesson"
                                                  onClick={() =>
                                                    startEdit(item.kind, item.node.id, item.node.title)
                                                  }
                                                >
                                                  <Pencil size={12} />
                                                </IconBtn>
                                                <IconBtn
                                                  title="Delete lesson"
                                                  danger
                                                  onClick={() => askDeleteLesson(item.node)}
                                                >
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

                            {/* Add lesson to this Day/module */}
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
                    ))}
                  </div>

                  {/* Sidebar footer — settings also in top bar; keep quick access here */}
                  <div className="space-y-0.5 border-t border-slate-100 bg-slate-50/60 p-2">
                    {status !== "SUBMITTED" && contentType === "workshop" && (
                      <button
                        type="button"
                        onClick={addEventDay}
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
                    {contentType === "course" && (
                      <button
                        type="button"
                        onClick={() => router.push(`/studio/course/${contentId}/question-bank`)}
                        className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-white hover:text-[#14142b]"
                      >
                        <FileQuestion size={13} />
                        Question Bank
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* ── Canvas: wide, centered pane. Fixed in place — only its own inner
             content scrolls, so the panel itself never shifts and the scrollbar
             sits at the panel's own edge instead of the browser window's. ── */}
        <main className="z-0 flex flex-col min-h-0 absolute inset-0 items-center">
          {status === "SUBMITTED" && (
            <div className="flex justify-center pointer-events-none fixed top-20 inset-x-0 z-[70]">
              <div className="pointer-events-auto flex items-center max-w-[calc(100vw-2rem)] px-5 py-2 rounded-full bg-white border border-slate-200 shadow-md">
                <span className="text-sm font-medium text-amber-600 flex items-center gap-2">
                  <span>🔒</span> This content has been submitted for review and is currently locked for editing until a decision is made.
                </span>
              </div>
            </div>
          )}
          {contentType === "roadmap" && roadmapData ? (
            <div className="absolute inset-0 z-0 pt-[49px]">
              <RoadmapCanvas
                roadmap={roadmapData}
                readOnly={status === "SUBMITTED"}
                onGraphChange={async (graphJson) => {
                  try {
                    await roadmapService.updateRoadmap(contentId!, { graphJson });
                    setHasDraftChanges(true);
                  } catch (err: any) {
                    // If it's a 409 Conflict (optimistic locking), we might ignore or just log it
                    // as a subsequent save will likely catch up if it's rapid typing.
                    if (err?.status === 409 || err?.response?.status === 409) {
                      console.warn("Optimistic locking failure during roadmap autosave. Ignoring.");
                    } else {
                      console.error("Failed to save roadmap graph", err);
                    }
                  }
                }}
              />
            </div>
          ) : activeLessonId ? (
            // This outer wrapper is NOT scrollable — it just reserves a fixed box
            // (flex-1 inside the `main` column) below the floating toolbar. The
            // toolbar is fixed at top-[70px] and ~50px tall (bottom edge ~120px), so
            // pt-36 (144px) clears it with a real gap. The panel inside is what
            // actually scrolls, so its own border never moves — only the document
            // content inside it does, and the scrollbar that produces sits at the
            // panel's own right edge, not the window's.
            <div
              className="w-full max-w-[860px] flex-1 min-h-0 px-6 pb-6 pt-36 sm:px-12"
              style={{ "--arcade-toolbar-top": "64px" } as CSSProperties}
            >
              {/* No border/shadow — reads as the page itself, not a boxed panel
                  floating on top of it. Plain translucent white (no backdrop-blur):
                  blur + rounded corners over the page's own blurred background blobs
                  was producing a doubled/seamed edge at the corners. */}
              <div className="h-full overflow-y-auto rounded-2xl bg-white/70 p-8 arcade-editor-scrollbar">
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
