/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect, @typescript-eslint/no-unused-vars */
// app/(authenticated)/studio/page.tsx
// Arcade Studio — Creator dashboard for authoring, managing, and publishing educational content.
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/infrastructure/http/api";
import { useEligibleChannels, ChannelPicker } from "@/domains/channels";

const roadmapService = {
  createRoadmap: (data: { title: string; description?: string; channelId: string }) =>
    api.post<{ id: string }>(`/api/roadmaps`, {
      ...data,
      ownerType: "USER",
      ownerId: "00000000-0000-0000-0000-000000000000",
    }),
  updateRoadmap: (id: string, data: { title?: string; description?: string }) =>
    api.put(`/api/roadmaps/${id}`, data),
  deleteRoadmap: (id: string) => api.delete(`/api/roadmaps/${id}`),
  duplicateRoadmap: (id: string) => api.post(`/api/roadmaps/${id}/duplicate`, {}),
};
import {
  contentOverviewHref,
  toContentTypeSegment,
  editorHref,
  previewHref,
} from "@/app/(authenticated)/studio/content/[contentType]/[contentId]/lib/contentTypeRouting";
import {
  DUPLICATE_ACTION,
  archiveContent,
  deleteContent,
  SUPPORTS_TITLE_CONFIRM_DELETE,
} from "@/app/(authenticated)/studio/content/[contentType]/[contentId]/lib/contentActions";
import { ConfirmActionModal } from "@/app/(authenticated)/studio/content/[contentType]/[contentId]/components/ConfirmActionModal";
import SpotlightCard from "@/components/ui/SpotlightCard";
import ShinyText from "@/components/ui/ShinyText";
import Magnet from "@/components/ui/Magnet";
import {
  BookOpen,
  Calendar,
  Plus,
  ChevronDown,
  Clock,
  GraduationCap,
  Trash2,
  X,
  Map,
  ClipboardCheck,
  MoreVertical,
  Pencil,
  Copy,
  Lock,
  User,
  FileQuestion,
  Eye,
  Archive,
  Loader2,
  HelpCircle,
  Check,
  Search,
  LayoutGrid,
  List,
  ArrowUpDown,
  ExternalLink,
  ArrowRight,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  Info,
} from "lucide-react";

// ── Unified content summary (backing GET /api/content) ─────────────────────────

interface ContentSummary {
  id: string;
  type: "COURSE" | "ROADMAP" | string;
  title: string;
  description?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  channelId: string;
  channelName: string;
  channelStatus: string;
  channelSuspendedAt?: string | null;
  channelForcedSuspension: boolean;
  authorId?: string | null;
  authorName?: string | null;
  collaborationStatus?: string | null;
  collaborationRole?: string | null;
}

/**
 * The collaborators API for a card. The backend's owner types are COURSE / EVENT / EXAM, while the
 * dashboard calls events "WORKSHOP". This used to be `/api/v1/courses/{id}/collaborators`, an
 * endpoint that no longer exists — so Accept and Decline always failed.
 */
function collaboratorsBase(item: ContentSummary): string {
  const type = item.type?.toUpperCase();
  const ownerType = type === "WORKSHOP" || type === "EVENT" ? "EVENT" : type;
  return `/api/v1/content/${ownerType}/${item.id}/collaborators`;
}

// ── Content type menu items ─────────────────────────────────────────────────────

const CONTENT_TYPES = [
  {
    id: "course",
    icon: BookOpen,
    label: "Course",
    href: "/studio/course/new",
  },
  {
    id: "event",
    icon: Calendar,
    label: "Event",
    href: "/studio/events/new",
  },
  {
    id: "exam",
    icon: ClipboardCheck,
    label: "Exam",
    href: "/studio/exam/new",
  },
  {
    id: "roadmap",
    icon: Map,
    label: "Roadmap",
    href: undefined,
  },
];

function StatusBadge({ status }: { status: string }) {
  const key = status?.toUpperCase() || "DRAFT";
  const config: Record<string, { bg: string; dot: string; label: string }> = {
    DRAFT: {
      bg: "bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-200",
      dot: "bg-amber-500",
      label: "Draft",
    },
    SUBMITTED: {
      bg: "bg-blue-500/10 border-blue-500/20 text-blue-800 dark:text-blue-200",
      dot: "bg-blue-500 animate-pulse",
      label: "In Review",
    },
    PUBLISHED: {
      bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-200",
      dot: "bg-emerald-500 animate-pulse",
      label: "Published",
    },
    ARCHIVED: {
      bg: "bg-slate-500/10 border-slate-500/20 text-slate-600",
      dot: "bg-slate-400",
      label: "Archived",
    },
  };
  const item = config[key] ?? config.DRAFT;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full border ${item.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
      {item.label}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const t = type?.toUpperCase();
  if (t === "ROADMAP") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border border-amber-200/90 bg-amber-50/90 text-amber-900 dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-300 shrink-0 shadow-3xs">
        <Map size={13} strokeWidth={2.2} className="text-amber-600 dark:text-amber-400" />
        <span>Roadmap</span>
      </span>
    );
  }
  if (t === "WORKSHOP" || t === "EVENT") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200/90 bg-emerald-50/90 text-emerald-900 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-300 shrink-0 shadow-3xs">
        <Calendar size={13} strokeWidth={2.2} className="text-emerald-600 dark:text-emerald-400" />
        <span>Event</span>
      </span>
    );
  }
  if (t === "QUIZ" || t === "EXAM") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border border-purple-200/90 bg-purple-50/90 text-purple-900 dark:bg-purple-500/15 dark:border-purple-500/30 dark:text-purple-300 shrink-0 shadow-3xs">
        <ClipboardCheck size={13} strokeWidth={2.2} className="text-purple-600 dark:text-purple-400" />
        <span>Exam</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200/90 bg-indigo-50/90 text-indigo-900 dark:bg-indigo-500/15 dark:border-indigo-500/30 dark:text-indigo-300 shrink-0 shadow-3xs">
      <BookOpen size={13} strokeWidth={2.2} className="text-indigo-600 dark:text-indigo-400" />
      <span>Course</span>
    </span>
  );
}

const TYPE_CONFIG: Record<
  string,
  {
    label: string;
    icon: any;
    color: string;
    bgGradient: string;
    border: string;
    badgeBg: string;
  }
> = {
  ROADMAP: {
    label: "Roadmap",
    icon: Map,
    color: "text-fuchsia-700 dark:text-fuchsia-300",
    bgGradient: "from-fuchsia-500/15 to-purple-500/10",
    border: "border-fuchsia-500/20",
    badgeBg: "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-500/10 dark:text-fuchsia-200 dark:border-fuchsia-500/25",
  },
  COURSE: {
    label: "Course",
    icon: BookOpen,
    color: "text-indigo-700 dark:text-indigo-300",
    bgGradient: "from-indigo-500/15 to-blue-500/10",
    border: "border-indigo-500/20",
    badgeBg: "bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-200 dark:border-indigo-500/25",
  },
  EVENT: {
    label: "Event",
    icon: Calendar,
    color: "text-violet-700 dark:text-violet-300",
    bgGradient: "from-violet-500/15 to-purple-500/10",
    border: "border-violet-500/20",
    badgeBg: "bg-violet-50 text-violet-800 border-violet-200 dark:bg-violet-500/10 dark:text-violet-200 dark:border-violet-500/25",
  },
  WORKSHOP: {
    label: "Workshop",
    icon: Calendar,
    color: "text-violet-700 dark:text-violet-300",
    bgGradient: "from-violet-500/15 to-purple-500/10",
    border: "border-violet-500/20",
    badgeBg: "bg-violet-50 text-violet-800 border-violet-200 dark:bg-violet-500/10 dark:text-violet-200 dark:border-violet-500/25",
  },
  QUIZ: {
    label: "Quiz",
    icon: FileQuestion,
    color: "text-rose-700 dark:text-rose-300",
    bgGradient: "from-rose-500/15 to-orange-500/10",
    border: "border-rose-500/20",
    badgeBg: "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-500/25",
  },
  EXAM: {
    label: "Exam",
    icon: ClipboardCheck,
    color: "text-orange-700 dark:text-orange-300",
    bgGradient: "from-orange-500/15 to-amber-500/10",
    border: "border-orange-500/20",
    badgeBg: "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-500/10 dark:text-orange-200 dark:border-orange-500/25",
  },
};

// ── New Course creation modal ───────────────────────────────────────────────────

function CreateCourseModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { channels, loading: channelsLoading } = useEligibleChannels();
  const [channelId, setChannelId] = useState("");

  useEffect(() => {
    if (channels.length === 1 && !channelId) setChannelId(channels[0].id);
  }, [channels, channelId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !channelId) return;
    setCreating(true);
    setError(null);
    try {
      const course = await api.post<{ id: string }>("/api/courses", {
        title: name.trim(),
        channelId,
      });
      toast.success(`"${name.trim()}" created`);
      router.push(`/studio/course/${course.id}/edit`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create course";
      setError(message);
      toast.error(message);
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/45 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-surface p-6 shadow-[0_24px_64px_rgba(20,20,43,0.22)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-ink cursor-pointer"
        >
          <X size={18} />
        </button>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <BookOpen size={20} strokeWidth={2.4} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold tracking-tight text-ink">New Course</h3>
            <p className="text-[12px] font-medium text-slate-500">Give it a title to get started.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="course-name" className="mb-1.5 block text-[13px] font-semibold text-ink">
              Course title <span className="text-rose-500">*</span>
            </label>
            <input
              id="course-name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Intro to Spring Boot"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-ink/30 focus:bg-surface focus:ring-4 focus:ring-slate-200/60"
            />
          </div>
          {!channelsLoading && channels.length > 0 && (
            <ChannelPicker channels={channels} value={channelId} onChange={setChannelId} />
          )}
          {!channelsLoading && channels.length === 0 && (
            <p className="text-sm text-rose-600 dark:text-rose-400">
              You need a channel with content-authoring rights before you can create a course.
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !channelId || creating}
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-on-ink shadow-[0_8px_20px_rgba(20,20,43,0.18)] transition-colors hover:bg-ink-hover disabled:opacity-60 cursor-pointer"
            >
              {creating ? "Creating…" : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// ── New Roadmap creation modal ──────────────────────────────────────────────────

function CreateRoadmapModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { channels, loading: channelsLoading } = useEligibleChannels();
  const [channelId, setChannelId] = useState("");

  useEffect(() => {
    if (channels.length === 1 && !channelId) setChannelId(channels[0].id);
  }, [channels, channelId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !channelId) return;
    setCreating(true);
    setError(null);
    try {
      const roadmap = await roadmapService.createRoadmap({
        title: title.trim(),
        channelId,
      });
      toast.success(`"${title.trim()}" created`);
      router.push(`/studio/roadmap/${roadmap.id}/edit`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create roadmap";
      setError(message);
      toast.error(message);
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/45 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-surface p-6 shadow-[0_24px_64px_rgba(20,20,43,0.22)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-ink cursor-pointer"
        >
          <X size={18} />
        </button>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:text-fuchsia-400">
            <Map size={20} strokeWidth={2.4} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold tracking-tight text-ink">New Roadmap</h3>
            <p className="text-[12px] font-medium text-slate-500">Give it a title to get started.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="roadmap-title" className="mb-1.5 block text-[13px] font-semibold text-ink">
              Roadmap Title <span className="text-red-500">*</span>
            </label>
            <input
              id="roadmap-title"
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Java Backend Path"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-ink/30 focus:bg-surface focus:ring-4 focus:ring-slate-200/60"
            />
          </div>
          {!channelsLoading && channels.length > 0 && (
            <ChannelPicker channels={channels} value={channelId} onChange={setChannelId} />
          )}
          {!channelsLoading && channels.length === 0 && (
            <p className="text-sm text-rose-600 dark:text-rose-400">
              You need a channel with content-authoring rights before you can create a roadmap.
            </p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-on-ink shadow-sm transition-all hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {creating ? "Creating..." : "Create Roadmap"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── New Event creation modal ────────────────────────────────────────────────────

function CreateEventModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState<"WORKSHOP" | "WEBINAR">("WORKSHOP");
  const [creating, setCreating] = useState(false);
  const { channels, loading: channelsLoading } = useEligibleChannels();
  const [channelId, setChannelId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (channels.length === 1 && !channelId) setChannelId(channels[0].id);
  }, [channels, channelId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !channelId) return;
    setCreating(true);
    setError(null);

    try {
      const event = await api.post<{ id: string }>("/api/v1/events", {
        title: title.trim(),
        eventType,
        category: "uncategorized",
        tags: [],
        deliveryMode: "ONLINE",
        difficulty: "BEGINNER",
        language: "en",
        priceAmount: 0,
        currency: "INR",
        visibility: "PRIVATE",
        channelId,
      });
      toast.success(`"${title.trim()}" created`);
      router.push(`/studio/content/event/${event.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create event";
      setError(message);
      toast.error(message);
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/45 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-surface p-6 shadow-[0_24px_64px_rgba(20,20,43,0.22)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-ink cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
            <Calendar size={20} strokeWidth={2.4} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold tracking-tight text-ink">New Event</h3>
            <p className="text-[12px] font-medium text-slate-500">Choose event type and give it a title.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-ink">
              Event Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEventType("WORKSHOP")}
                className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all cursor-pointer ${
                  eventType === "WORKSHOP"
                    ? "border-violet-600 bg-violet-50/50 ring-2 ring-violet-600/20 dark:bg-violet-500/10"
                    : "border-slate-200 bg-slate-50/60 hover:bg-slate-100/60"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-xs font-bold text-ink">Workshop</span>
                  {eventType === "WORKSHOP" && <Check size={14} className="text-violet-600 dark:text-violet-400" />}
                </div>
                <p className="mt-1 text-[11px] leading-tight text-slate-500">
                  Interactive sessions with agenda & modules
                </p>
              </button>

              <button
                type="button"
                onClick={() => setEventType("WEBINAR")}
                className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all cursor-pointer ${
                  eventType === "WEBINAR"
                    ? "border-violet-600 bg-violet-50/50 ring-2 ring-violet-600/20 dark:bg-violet-500/10"
                    : "border-slate-200 bg-slate-50/60 hover:bg-slate-100/60"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-xs font-bold text-ink">Webinar</span>
                  {eventType === "WEBINAR" && <Check size={14} className="text-violet-600 dark:text-violet-400" />}
                </div>
                <p className="mt-1 text-[11px] leading-tight text-slate-500">
                  Live presentation or Q&A stream session
                </p>
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-ink">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={eventType === "WORKSHOP" ? "e.g. Full-Stack Web Development Workshop" : "e.g. Intro to AI Webinar"}
              maxLength={120}
              autoFocus
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-violet-600 focus:bg-surface focus:ring-2 focus:ring-violet-600/20"
            />
          </div>

          <ChannelPicker channels={channels} value={channelId} onChange={setChannelId} />

          <button
            type="submit"
            disabled={!title.trim() || !channelId || creating}
            className="w-full rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white transition-colors hover:bg-violet-700 disabled:opacity-50 cursor-pointer"
          >
            {creating ? "Creating..." : `Create ${eventType === "WORKSHOP" ? "Workshop" : "Webinar"}`}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Rename roadmap modal ────────────────────────────────────────────────────────

function RenameRoadmapModal({
  item,
  onClose,
  onUpdated,
}: {
  item: ContentSummary;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description || "");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setUpdating(true);
    setError(null);
    try {
      await roadmapService.updateRoadmap(item.id, {
        title: title.trim(),
        description: description.trim() || undefined,
      });
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update roadmap");
      setUpdating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/45 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-surface p-6 shadow-[0_24px_64px_rgba(20,20,43,0.22)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-ink"
        >
          <X size={18} />
        </button>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
            <Pencil size={20} className="text-ink" />
          </div>
          <h3 className="text-[15px] font-bold tracking-tight text-ink">Rename Roadmap</h3>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label htmlFor="rename-title" className="mb-1.5 block text-[13px] font-semibold text-ink">
              Roadmap Title <span className="text-red-500">*</span>
            </label>
            <input
              id="rename-title"
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-ink/30 focus:bg-surface focus:ring-4 focus:ring-slate-200/60"
            />
          </div>
          <div>
            <label htmlFor="rename-desc" className="mb-1.5 block text-[13px] font-semibold text-ink">
              Description <span className="font-medium text-slate-400">(optional)</span>
            </label>
            <textarea
              id="rename-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-ink/30 focus:bg-surface focus:ring-4 focus:ring-slate-200/60"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || updating}
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-on-ink shadow-[0_8px_20px_rgba(20,20,43,0.18)] transition-colors hover:bg-ink-hover disabled:opacity-60"
            >
              {updating ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteRoadmapModal({
  item,
  onClose,
  onDeleted,
}: {
  item: ContentSummary;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await roadmapService.deleteRoadmap(item.id);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete roadmap");
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/45 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-surface p-6 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
            <Trash2 size={20} className="text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-[15px] font-bold tracking-tight text-ink">Delete Roadmap</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete <strong>{item.title}</strong>? This action cannot be
          undone.
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Enhanced Content Card (Grid View with SpotlightCard) ───────────────────────

function ContentCard({
  item,
  onRename,
  onDelete,
  onDuplicate,
  onChanged,
}: {
  item: ContentSummary;
  onRename: (item: ContentSummary) => void;
  onDelete: (item: ContentSummary) => void;
  onDuplicate: (item: ContentSummary) => void;
  onChanged: () => void;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"archive" | "delete" | null>(null);
  const isRoadmap = item.type === "ROADMAP";
  const isExam = item.type === "EXAM";
  const segment = toContentTypeSegment(item.type);
  const openHref =
    contentOverviewHref(item.type, item.id) ??
    (item.type === "COURSE" ? `/studio/course/${item.id}/edit` : `/studio`);
  const channelSuspended = item.channelStatus === "SUSPENDED";
  const unlistDate =
    channelSuspended && !item.channelForcedSuspension && item.channelSuspendedAt
      ? new Date(new Date(item.channelSuspendedAt).setMonth(new Date(item.channelSuspendedAt).getMonth() + 6))
      : null;

  const preview = segment && !isExam ? previewHref(segment, item.id) : null;
  const duplicate = segment ? DUPLICATE_ACTION[segment] : undefined;
  const canArchive = segment === "event" && item.status?.toUpperCase() !== "ARCHIVED";
  const isPendingInvitation = item.collaborationStatus === "PENDING";
  const hasSecondaryMenu = (isRoadmap || (!isExam && segment != null)) && !isPendingInvitation;

  const typeKey = item.type?.toUpperCase() || "COURSE";
  const typeInfo = TYPE_CONFIG[typeKey] ?? TYPE_CONFIG.COURSE;
  const TypeIcon = typeInfo.icon;

  async function handleDuplicateSegmentAware() {
    setMenuOpen(false);
    if (isRoadmap) {
      onDuplicate(item);
      return;
    }
    if (!segment || !duplicate) return;
    try {
      const created = await duplicate.run(item.id);
      toast.success("Duplicated");
      router.push(`/studio/content/${segment}/${created.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not duplicate");
    }
  }

  async function handleConfirmed() {
    if (!segment) return;
    if (confirmAction === "archive") {
      const result = archiveContent(segment, item.id);
      if (result) await result;
      toast.success("Archived");
    } else if (confirmAction === "delete") {
      // A null request means this type has no delete — never report one that did not happen.
      const request = deleteContent(segment, item.id, item.title);
      if (!request) {
        toast.error("This content can't be deleted here.");
        setConfirmAction(null);
        return;
      }
      try {
        await request;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not delete");
        return;
      }
      toast.success("Deleted");
    }
    setConfirmAction(null);
    onChanged();
  }

  function handleCardActivate(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("[data-card-interactive]")) return;
    router.push(openHref);
  }

  return (
    <SpotlightCard
      spotlightColor="rgba(217, 119, 6, 0.06)"
      spotlightSize={360}
      onClick={channelSuspended || isPendingInvitation ? undefined : handleCardActivate}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-xl rounded-bl-xl border border-amber-900/12 bg-surface/90 hover:bg-surface p-5 shadow-[0_4px_20px_rgba(78,41,17,0.03)] hover:shadow-[0_8px_30px_rgba(78,41,17,0.06)] hover:border-amber-900/25 transition-all duration-200 ${
        channelSuspended || isPendingInvitation ? "" : "cursor-pointer"
      }`}
    >
      <div className="relative z-10 flex flex-1 flex-col justify-between gap-4">
        {/* ── Content Body: Channel, Type Badge, Title, & Description ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 truncate max-w-[180px]"
              title={item.channelName}
            >
              {item.channelName || "Personal Channel"}
            </span>
            <TypeBadge type={item.type} />
          </div>

          <h3 className="line-clamp-1 text-base sm:text-[17px] font-bold tracking-tight text-ink group-hover:text-slate-950 transition-colors leading-snug">
            {item.title}
          </h3>

          <p className="line-clamp-2 text-xs leading-relaxed text-slate-600 font-medium min-h-[32px]">
            {item.description ||
              (isRoadmap
                ? "Visual learning path with nodes & checkpoints"
                : "Comprehensive modules · Self-paced learning")}
          </p>
        </div>

        {/* ── Standard Clean Footer: Date on Left, Compact Button on Right ── */}
        <div
          className="pt-1 flex items-center justify-between gap-2"
          data-card-interactive
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <Clock size={12} className="text-slate-400" />
            <span>
              {new Date(item.updatedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {segment && !channelSuspended && !isPendingInvitation && (
              <button
                type="button"
                onClick={() => router.push(editorHref(segment, item.id))}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-900/15 bg-surface/80 text-slate-600 hover:bg-surface hover:text-ink transition-colors cursor-pointer"
                title="Direct Edit"
              >
                <Pencil size={12} />
              </button>
            )}

            {channelSuspended ? (
              <span className="inline-flex items-center rounded-lg bg-amber-900/5 px-3 py-1 text-xs font-semibold text-slate-400 cursor-not-allowed">
                Disabled
              </span>
            ) : item.collaborationStatus === "PENDING" ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await api.post(`${collaboratorsBase(item)}/accept`);
                      toast.success("Accepted invitation!");
                      onChanged();
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Failed to accept");
                    }
                  }}
                  className="rounded-lg bg-ink px-3 py-1 text-xs font-bold text-on-ink hover:bg-ink-hover transition-colors cursor-pointer"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await api.post(`${collaboratorsBase(item)}/decline`);
                      toast.info("Declined invitation");
                      onChanged();
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Failed to decline");
                    }
                  }}
                  className="rounded-lg border border-amber-900/15 bg-surface px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-amber-50 transition-colors cursor-pointer dark:hover:bg-amber-500/10"
                >
                  Decline
                </button>
              </div>
            ) : (
              <Link
                href={openHref}
                className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3.5 py-1.5 text-xs font-bold text-on-ink transition-all shadow-3xs hover:bg-ink-hover hover:shadow-2xs cursor-pointer"
              >
                <TypeIcon size={12} className="text-on-ink/80" />
                <span>
                  {!isExam && !isRoadmap && item.status === "SUBMITTED"
                    ? "Review"
                    : isRoadmap
                    ? "Open"
                    : isExam
                    ? "Open Exam"
                    : "Open"}
                </span>
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5 text-on-ink/80" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {confirmAction === "archive" && (
        <div data-card-interactive>
          <ConfirmActionModal
            title="Archive this content?"
            description={`"${item.title}" will be archived and no longer visible to learners.`}
            confirmLabel="Archive"
            onClose={() => setConfirmAction(null)}
            onConfirm={handleConfirmed}
          />
        </div>
      )}
      {confirmAction === "delete" && segment && (
        <div data-card-interactive>
          <ConfirmActionModal
            title="Delete this content?"
            description={
              SUPPORTS_TITLE_CONFIRM_DELETE[segment]
                ? `Type the title to confirm. This moves "${item.title}" to Trash.`
                : `This permanently deletes "${item.title}". This action cannot be undone.`
            }
            confirmLabel="Delete"
            danger
            requireTitleMatch={SUPPORTS_TITLE_CONFIRM_DELETE[segment] ? item.title : undefined}
            onClose={() => setConfirmAction(null)}
            onConfirm={handleConfirmed}
          />
        </div>
      )}
    </SpotlightCard>
  );
}

// ── Standard Studio Table View (List Mode) ─────────────────────────────────────

function ContentTable({
  items,
  onRename,
  onDelete,
  onDuplicate,
  onChanged,
}: {
  items: ContentSummary[];
  onRename: (item: ContentSummary) => void;
  onDelete: (item: ContentSummary) => void;
  onDuplicate: (item: ContentSummary) => void;
  onChanged: () => void;
}) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-2xl border border-amber-900/12 bg-surface/90 backdrop-blur-md shadow-[0_4px_24px_rgba(78,41,17,0.03)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-amber-900/10 bg-amber-900/[0.03] text-[11px] font-extrabold uppercase tracking-wider text-amber-900/60 dark:text-amber-200">
            <tr>
              <th className="px-5 py-3.5">Creation</th>
              <th className="px-4 py-3.5">Type</th>
              <th className="px-4 py-3.5">Channel</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Last Updated</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-900/[0.07]">
            {items.map((item) => {
              const segment = toContentTypeSegment(item.type);
              const openHref =
                contentOverviewHref(item.type, item.id) ??
                (item.type === "COURSE" ? `/studio/course/${item.id}/edit` : `/studio`);

              return (
                <tr
                  key={item.id}
                  onClick={() => router.push(openHref)}
                  className="group hover:bg-amber-900/[0.03] transition-colors cursor-pointer"
                >
                  {/* Title & Author */}
                  <td className="px-5 py-3.5 max-w-xs">
                    <div className="font-bold text-ink group-hover:text-amber-950 transition-colors truncate text-[13px] dark:group-hover:text-amber-200">
                      {item.title}
                    </div>
                    {item.authorName && (
                      <div className="text-[10.5px] font-semibold text-amber-900/60 uppercase tracking-wider flex items-center gap-1.5 mt-0.5 dark:text-amber-200">
                        <User size={10} />
                        <span className="truncate">{item.authorName}</span>
                      </div>
                    )}
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <TypeBadge type={item.type} />
                  </td>

                  {/* Channel */}
                  <td className="px-4 py-3.5 font-semibold text-slate-700 whitespace-nowrap text-[12px]">
                    {item.channelName || "Personal Channel"}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <StatusBadge status={item.status} />
                  </td>

                  {/* Last Updated */}
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap font-medium text-[12px]">
                    {new Date(item.updatedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  {/* Actions */}
                  <td
                    className="px-5 py-3.5 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="inline-flex items-center gap-1.5">
                      {segment && (
                        <button
                          type="button"
                          onClick={() => router.push(editorHref(segment, item.id))}
                          className="rounded-lg border border-amber-900/12 bg-surface/90 p-1.5 text-slate-600 hover:bg-ink hover:text-on-ink hover:border-ink transition-all cursor-pointer shadow-3xs"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                      )}
                      <Link
                        href={openHref}
                        className="inline-flex items-center gap-1 rounded-lg bg-ink px-3.5 py-1.5 text-xs font-bold text-on-ink hover:bg-ink-hover transition-all shadow-3xs cursor-pointer"
                      >
                        <span>Open</span>
                        <ArrowRight size={11} className="text-on-ink/80" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Feature Locked Modal ────────────────────────────────────────────────────────

function ChannelRequiredModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-surface p-6 shadow-[0_24px_64px_rgba(20,20,43,0.2)] transition-all">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            <Lock size={24} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-bold tracking-tight text-ink">
            Feature Locked
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Content creation is not currently available for your account. Contact your administrator to unlock this feature.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-ink px-5 py-2 text-xs font-semibold text-on-ink shadow-md transition-colors hover:bg-ink-hover cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Arcade Studio Dashboard Page ───────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [channelDropdownOpen, setChannelDropdownOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState<"course" | "roadmap" | "event" | null>(null);
  const [items, setItems] = useState<ContentSummary[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "DRAFT" | "SUBMITTED" | "PUBLISHED" | "ARCHIVED">("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "COURSE" | "ROADMAP" | "EVENT">("ALL");
  const [channelFilter, setChannelFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"UPDATED_DESC" | "CREATED_DESC" | "TITLE_ASC">("UPDATED_DESC");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const { channels, loading: channelsLoading } = useEligibleChannels();
  const [channelRequiredModalOpen, setChannelRequiredModalOpen] = useState(false);

  const handleCreateContentClick = () => {
    if (channelsLoading) return;
    if (channels.length === 0) {
      setChannelRequiredModalOpen(true);
      setDropdownOpen(false);
    } else {
      setDropdownOpen((v) => !v);
    }
  };

  const handleSelectContentType = (typeId: string, href?: string) => {
    setDropdownOpen(false);
    if (channels.length === 0) {
      setChannelRequiredModalOpen(true);
      return;
    }
    if (typeId === "course" || typeId === "roadmap" || typeId === "event") {
      setCreateOpen(typeId as any);
    } else if (href) {
      router.push(href);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || channelsLoading) return;
    const params = new URLSearchParams(window.location.search);
    const create = params.get("create");
    if (create) {
      if (channels.length === 0) {
        setChannelRequiredModalOpen(true);
      } else if (create === "webinar" || create === "workshop" || create === "event") {
        setCreateOpen("event");
      } else if (create === "exam" || create === "quiz") {
        router.replace("/studio/exam/new");
      } else if (create === "course" || create === "roadmap") {
        setCreateOpen(create as any);
      }
    }
  }, [channelsLoading, channels.length]);

  const [renameTarget, setRenameTarget] = useState<ContentSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContentSummary | null>(null);

  const fetchContent = () => {
    setLoadingItems(true);
    api
      .get<ContentSummary[]>("/api/content")
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoadingItems(false));
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleDuplicate = async (item: ContentSummary) => {
    try {
      await roadmapService.duplicateRoadmap(item.id);
      fetchContent();
    } catch {
      alert("Failed to duplicate roadmap");
    }
  };

  const statusCounts = useMemo(() => {
    const counts = { ALL: items.length, DRAFT: 0, SUBMITTED: 0, PUBLISHED: 0, ARCHIVED: 0 };
    for (const item of items) {
      const key = item.status?.toUpperCase();
      if (key === "DRAFT") counts.DRAFT += 1;
      else if (key === "SUBMITTED") counts.SUBMITTED += 1;
      else if (key === "PUBLISHED") counts.PUBLISHED += 1;
      else if (key === "ARCHIVED") counts.ARCHIVED += 1;
    }
    return counts;
  }, [items]);

  const eligibleChannelIds = useMemo(() => new Set(channels.map((c) => c.id)), [channels]);

  const filteredItems = useMemo(() => {
    const result = items.filter((item) => {
      if (
        channels.length > 0 &&
        item.channelId &&
        !eligibleChannelIds.has(item.channelId) &&
        !item.collaborationStatus
      ) {
        return false;
      }
      const statusOk = statusFilter === "ALL" || item.status?.toUpperCase() === statusFilter;
      const typeOk = typeFilter === "ALL" || item.type?.toUpperCase() === typeFilter;
      const channelOk =
        channelFilter === "ALL" || item.channelId === channelFilter || !!item.collaborationStatus;

      const query = searchQuery.trim().toLowerCase();
      const searchOk =
        !query ||
        item.title.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.authorName && item.authorName.toLowerCase().includes(query)) ||
        (item.channelName && item.channelName.toLowerCase().includes(query));

      return statusOk && typeOk && channelOk && searchOk;
    });

    if (sortBy === "UPDATED_DESC") {
      result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else if (sortBy === "CREATED_DESC") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "TITLE_ASC") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [
    items,
    statusFilter,
    typeFilter,
    channelFilter,
    searchQuery,
    sortBy,
    channels,
    eligibleChannelIds,
  ]);

  const CHANNEL_CHIPS = useMemo(() => {
    const base = [{ id: "ALL", label: "All channels" }];
    return base.concat(
      channels.map((c) => ({
        id: c.id,
        label: c.isPersonal ? "Personal" : c.name,
      }))
    );
  }, [channels]);

  const STATUS_TABS = [
    { id: "ALL" as const, label: "All" },
    { id: "DRAFT" as const, label: "Drafts" },
    { id: "SUBMITTED" as const, label: "In review" },
    { id: "PUBLISHED" as const, label: "Published" },
    { id: "ARCHIVED" as const, label: "Archived" },
  ];

  const TYPE_CHIPS = [
    { id: "ALL" as const, label: "All types" },
    { id: "COURSE" as const, label: "Courses" },
    { id: "ROADMAP" as const, label: "Roadmaps" },
    { id: "EVENT" as const, label: "Events" },
  ];

  const SORT_OPTIONS = [
    { id: "UPDATED_DESC" as const, label: "Recently updated" },
    { id: "CREATED_DESC" as const, label: "Newest first" },
    { id: "TITLE_ASC" as const, label: "Title A–Z" },
  ];

  return (
    <div
      className="relative flex min-h-screen flex-1 flex-col"
      style={{
        background: "var(--theme-wash, linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 35%, #FFFFFF 70%))",
      }}
    >
      <ChannelRequiredModal
        isOpen={channelRequiredModalOpen}
        onClose={() => setChannelRequiredModalOpen(false)}
      />
      {createOpen === "course" && <CreateCourseModal onClose={() => setCreateOpen(null)} />}
      {createOpen === "roadmap" && <CreateRoadmapModal onClose={() => setCreateOpen(null)} />}
      {createOpen === "event" && <CreateEventModal onClose={() => setCreateOpen(null)} />}
      {renameTarget && (
        <RenameRoadmapModal
          item={renameTarget}
          onClose={() => setRenameTarget(null)}
          onUpdated={() => {
            setRenameTarget(null);
            fetchContent();
          }}
        />
      )}
      {deleteTarget && (
        <DeleteRoadmapModal
          item={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            setDeleteTarget(null);
            fetchContent();
          }}
        />
      )}

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-28 pt-20 sm:px-8 sm:pt-24">
        {/* ── Header: Centered Studio Hero Header ── */}
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2.5 justify-center select-none">
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold text-ink leading-[1.15] tracking-normal"
              style={{ fontFamily: "'Dancing Script', 'Caveat', cursive" }}
            >
              <ShinyText text="Arcade Studio" speed={4.5} />
            </h1>
            <div
              className="relative group inline-flex items-center font-sans translate-y-2.5 sm:translate-y-3.5"
              style={{ fontFamily: "var(--font-sans), system-ui, -apple-system, sans-serif" }}
            >
              <span
                className="inline-flex items-center justify-center text-slate-950 hover:text-slate-700 transition-transform hover:scale-110 cursor-pointer"
              >
                <Info size={22} className="stroke-[2.2]" />
              </span>

              {/* Hover Tooltip Pill */}
              <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 scale-95 group-hover:scale-100 z-50">
                <div
                  className="flex items-center gap-2 rounded-full border border-slate-200/90 bg-surface/95 px-4 py-2 text-xs font-semibold text-slate-800 shadow-lg backdrop-blur-md"
                  style={{ fontFamily: "var(--font-sans), system-ui, -apple-system, sans-serif" }}
                >
                  <span>Author, manage, and publish educational content across your channels.</span>
                </div>
              </div>
            </div>
          </div>


          {/* Centered Controls & Action Buttons (Only when Organization Channels exist) */}
          {channels.length > 1 && (
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setChannelDropdownOpen(!channelDropdownOpen);
                    setTypeDropdownOpen(false);
                    setSortDropdownOpen(false);
                    setDropdownOpen(false);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-900/10 bg-surface/95 px-4 py-2 text-[12px] font-bold text-slate-700 transition-colors hover:border-amber-900/25 hover:text-ink outline-none cursor-pointer shadow-3xs"
                >
                  <span>{CHANNEL_CHIPS.find((c) => c.id === channelFilter)?.label ?? "All channels"}</span>
                  <ChevronDown
                    size={13}
                    className={`text-slate-400 transition-transform duration-150 ${channelDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {channelDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setChannelDropdownOpen(false)} />
                    <div className="absolute left-1/2 -translate-x-1/2 z-40 mt-1.5 min-w-[170px] rounded-2xl border border-amber-900/10 bg-surface p-1.5 shadow-xl">
                      {CHANNEL_CHIPS.map((chip) => {
                        const isSelected = channelFilter === chip.id;
                        return (
                          <button
                            key={chip.id}
                            type="button"
                            onClick={() => {
                              setChannelFilter(chip.id);
                              setChannelDropdownOpen(false);
                            }}
                            className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors cursor-pointer ${
                              isSelected ? "bg-amber-50 text-amber-950 font-bold dark:bg-amber-500/10 dark:text-amber-200" : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span>{chip.label}</span>
                            {isSelected && <Check size={13} className="text-amber-700 dark:text-amber-300" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <div className="relative shrink-0">
                <button
                  id="create-content-btn"
                  onClick={handleCreateContentClick}
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 text-[13px] font-bold text-on-ink shadow-sm transition-all hover:bg-ink-hover active:scale-[0.98] disabled:opacity-75 cursor-pointer"
                >
                  {channelsLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} strokeWidth={2.5} />
                  )}
                  Create Content
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div
                      className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 z-50 mt-2 min-w-[170px] w-52 overflow-hidden rounded-2xl border border-slate-200/80 bg-surface/98 p-1.5 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                      role="menu"
                    >
                      <div className="space-y-0.5">
                        {CONTENT_TYPES.map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            role="menuitem"
                            onClick={() => handleSelectContentType(type.id, type.href)}
                            className="group flex w-full items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold text-slate-800 transition-colors hover:bg-slate-100/80 hover:text-ink cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <type.icon size={15} className="text-slate-500 group-hover:text-ink transition-colors" />
                              <span>{type.label}</span>
                            </div>
                            <ArrowRight size={13} className="text-slate-400 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Studio Standard Docked Filter Bar (Clean Single Row, Visible Dropdowns, No Scrollbars) ── */}
        <div className="relative z-20 mb-8 flex flex-wrap md:flex-nowrap items-center justify-between gap-2.5 rounded-2xl sm:rounded-full border border-slate-200/80 bg-surface/80 p-1.5 shadow-xs backdrop-blur-md">
          {/* Left: Status Pill Tabs */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
            {STATUS_TABS.map((tab) => {
              const count = statusCounts[tab.id];
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold tracking-tight transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? "bg-slate-950 text-on-ink shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums ${
                      active
                        ? "bg-slate-800 text-on-ink"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Format Dropdown, Search Input, View Toggle & Create Content */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Format Filter Custom Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setTypeDropdownOpen(!typeDropdownOpen);
                  setSortDropdownOpen(false);
                  setChannelDropdownOpen(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-surface px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:border-slate-900 outline-none cursor-pointer whitespace-nowrap"
              >
                <SlidersHorizontal size={13} className="text-slate-400" />
                <span>{TYPE_CHIPS.find((c) => c.id === typeFilter)?.label ?? "All Types"}</span>
                <ChevronDown
                  size={12}
                  className={`text-slate-400 transition-transform duration-150 ${typeDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {typeDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setTypeDropdownOpen(false)} />
                  <div className="absolute right-0 z-50 mt-1.5 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-surface p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-100">
                    {TYPE_CHIPS.map((chip) => {
                      const isSelected = typeFilter === chip.id;
                      return (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => {
                            setTypeFilter(chip.id as any);
                            setTypeDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors cursor-pointer ${
                            isSelected ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span>{chip.label}</span>
                          {isSelected && <Check size={13} className="text-slate-900" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Search Input */}
            <div className="relative w-36 sm:w-48">
              <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-surface py-1.5 pl-8 pr-7 text-xs font-semibold text-slate-900 outline-none transition-colors focus:border-slate-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                >
                  <X size={11} />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="inline-flex items-center gap-0.5 rounded-full border border-slate-200 bg-surface p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`rounded-full p-1.5 transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-slate-950 text-on-ink"
                    : "text-slate-400 hover:text-slate-700"
                }`}
                title="Grid View"
              >
                <LayoutGrid size={13} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`rounded-full p-1.5 transition-colors cursor-pointer ${
                  viewMode === "table"
                    ? "bg-slate-950 text-on-ink"
                    : "text-slate-400 hover:text-slate-700"
                }`}
                title="Table View"
              >
                <List size={13} />
              </button>
            </div>

            {/* Create Content button placed right next to View Mode Toggle */}
            {channels.length <= 1 && (
              <div className="relative shrink-0">
                <button
                  id="create-content-btn"
                  onClick={handleCreateContentClick}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-xs font-bold text-on-ink shadow-sm transition-all hover:bg-ink-hover active:scale-[0.98] disabled:opacity-75 cursor-pointer"
                >
                  {channelsLoading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Plus size={13} strokeWidth={2.5} />
                  )}
                  <span>Create Content</span>
                  <ChevronDown
                    size={12}
                    className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div
                      className="absolute right-0 z-50 mt-2 min-w-[170px] w-52 overflow-hidden rounded-2xl border border-slate-200/80 bg-surface/98 p-1.5 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                      role="menu"
                    >
                      <div className="space-y-0.5">
                        {CONTENT_TYPES.map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            role="menuitem"
                            onClick={() => handleSelectContentType(type.id, type.href)}
                            className="group flex w-full items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold text-slate-800 transition-colors hover:bg-slate-100/80 hover:text-ink cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <type.icon size={15} className="text-slate-500 group-hover:text-ink transition-colors" />
                              <span>{type.label}</span>
                            </div>
                            <ArrowRight size={13} className="text-slate-400 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Content Grid or Table View ── */}
        {loadingItems ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-surface p-5">
                <div className="mb-3 h-4 w-2/3 rounded bg-slate-100" />
                <div className="mb-2 h-3 w-full rounded bg-slate-50" />
                <div className="mb-4 h-3 w-3/4 rounded bg-slate-50" />
                <div className="flex items-center justify-between">
                  <div className="h-5 w-14 rounded-full bg-slate-100" />
                  <div className="h-7 w-24 rounded-lg bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 px-6 text-center">
            <div className="flex flex-col items-center justify-center gap-2.5 max-w-sm mx-auto">
              <div className="mb-2 flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <BookOpen size={26} className="stroke-[1.8]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                No creations yet
              </h3>
              <p className="text-xs font-medium leading-relaxed text-slate-500">
                Click &quot;Create Content&quot; to build your first course, event or exam.
              </p>
              <button
                type="button"
                onClick={handleCreateContentClick}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2 text-xs font-bold text-on-ink shadow-xs transition-transform hover:scale-[1.02] active:scale-[0.98] hover:bg-slate-800 cursor-pointer"
              >
                <Plus size={14} />
                <span>Create Content</span>
              </button>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 px-6 text-center">
            <div className="flex flex-col items-center justify-center gap-2.5 max-w-sm mx-auto">
              <div className="mb-2 flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <GraduationCap size={26} className="stroke-[1.8]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                No creations found
              </h3>
              <p className="text-xs font-medium leading-relaxed text-slate-500">
                Try changing your search query or filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("ALL");
                  setTypeFilter("ALL");
                  setChannelFilter("ALL");
                  setSearchQuery("");
                }}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-on-ink shadow-xs transition-transform hover:scale-[1.02] active:scale-[0.98] hover:bg-slate-800 cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Reset filters</span>
              </button>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <ContentCard
                key={item.id}
                item={item}
                onRename={setRenameTarget}
                onDelete={setDeleteTarget}
                onDuplicate={handleDuplicate}
                onChanged={fetchContent}
              />
            ))}
          </div>
        ) : (
          <ContentTable
            items={filteredItems}
            onRename={setRenameTarget}
            onDelete={setDeleteTarget}
            onDuplicate={handleDuplicate}
            onChanged={fetchContent}
          />
        )}
      </div>
    </div>
  );
}
