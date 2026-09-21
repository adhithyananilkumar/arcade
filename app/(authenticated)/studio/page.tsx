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
  FileText,
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
} from "lucide-react";

// ── Unified content summary (backing GET /api/content) ─────────────────────────

interface ContentSummary {
  id: string;
  type: "COURSE" | "ROADMAP" | string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
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

// ── Content type menu items ─────────────────────────────────────────────────────

const CONTENT_TYPES = [
  {
    id: "course",
    icon: BookOpen,
    label: "Course",
    desc: "Structured learning path with modules & lessons",
    href: "/studio/course/new",
  },
  {
    id: "roadmap",
    icon: Map,
    label: "Roadmap",
    desc: "Visual interactive learning path with nodes",
    href: "",
  },
  {
    id: "event",
    icon: Calendar,
    label: "Event",
    desc: "Live sessions, webinars & workshops",
    href: "/studio/events/new",
  },
  {
    id: "article",
    icon: FileText,
    label: "Article",
    desc: "Rich publication document with the editor",
    href: "/studio/article/new",
  },
  {
    id: "quiz",
    icon: HelpCircle,
    label: "Quiz",
    desc: "Question bank with automated grading",
    href: "/studio/quiz/new",
  },
  {
    id: "exam",
    icon: ClipboardCheck,
    label: "Exam",
    desc: "Comprehensive timed evaluation & grading",
    href: "/studio/exam/new",
  },
] as const;

function StatusBadge({ status }: { status: string }) {
  const key = status?.toUpperCase() || "DRAFT";
  const config: Record<string, { bg: string; dot: string; label: string }> = {
    DRAFT: {
      bg: "bg-amber-500/10 border-amber-500/20 text-amber-800",
      dot: "bg-amber-500",
      label: "Draft",
    },
    SUBMITTED: {
      bg: "bg-blue-500/10 border-blue-500/20 text-blue-800",
      dot: "bg-blue-500 animate-pulse",
      label: "In Review",
    },
    PUBLISHED: {
      bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-800",
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
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-md border bg-amber-900/[0.04] text-amber-950 border-amber-900/12">
        <Map size={11} strokeWidth={2.4} className="text-amber-800" /> Roadmap
      </span>
    );
  }
  if (t === "WORKSHOP" || t === "EVENT") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-md border bg-amber-900/[0.04] text-amber-950 border-amber-900/12">
        <Calendar size={11} strokeWidth={2.4} className="text-amber-800" /> Event
      </span>
    );
  }
  if (t === "QUIZ" || t === "EXAM") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-md border bg-amber-900/[0.04] text-amber-950 border-amber-900/12">
        <FileQuestion size={11} strokeWidth={2.4} className="text-amber-800" /> {t === "EXAM" ? "Exam" : "Quiz"}
      </span>
    );
  }
  if (t === "ARTICLE") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-md border bg-amber-900/[0.04] text-amber-950 border-amber-900/12">
        <FileText size={11} strokeWidth={2.4} className="text-amber-800" /> Article
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-md border bg-amber-900/[0.04] text-amber-950 border-amber-900/12">
      <BookOpen size={11} strokeWidth={2.4} className="text-amber-800" /> Course
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
    color: "text-fuchsia-700",
    bgGradient: "from-fuchsia-500/15 to-purple-500/10",
    border: "border-fuchsia-500/20",
    badgeBg: "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200",
  },
  COURSE: {
    label: "Course",
    icon: BookOpen,
    color: "text-indigo-700",
    bgGradient: "from-indigo-500/15 to-blue-500/10",
    border: "border-indigo-500/20",
    badgeBg: "bg-indigo-50 text-indigo-800 border-indigo-200",
  },
  EVENT: {
    label: "Event",
    icon: Calendar,
    color: "text-violet-700",
    bgGradient: "from-violet-500/15 to-purple-500/10",
    border: "border-violet-500/20",
    badgeBg: "bg-violet-50 text-violet-800 border-violet-200",
  },
  WORKSHOP: {
    label: "Workshop",
    icon: Calendar,
    color: "text-violet-700",
    bgGradient: "from-violet-500/15 to-purple-500/10",
    border: "border-violet-500/20",
    badgeBg: "bg-violet-50 text-violet-800 border-violet-200",
  },
  QUIZ: {
    label: "Quiz",
    icon: FileQuestion,
    color: "text-rose-700",
    bgGradient: "from-rose-500/15 to-orange-500/10",
    border: "border-rose-500/20",
    badgeBg: "bg-rose-50 text-rose-800 border-rose-200",
  },
  EXAM: {
    label: "Exam",
    icon: ClipboardCheck,
    color: "text-orange-700",
    bgGradient: "from-orange-500/15 to-amber-500/10",
    border: "border-orange-500/20",
    badgeBg: "bg-orange-50 text-orange-800 border-orange-200",
  },
  ARTICLE: {
    label: "Article",
    icon: FileText,
    color: "text-emerald-700",
    bgGradient: "from-emerald-500/15 to-teal-500/10",
    border: "border-emerald-500/20",
    badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
};

const TYPE_DEFAULT_COVERS: Record<string, string> = {
  COURSE: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
  ROADMAP: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
  EVENT: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
  WORKSHOP: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
  QUIZ: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&auto=format&fit=crop&q=80",
  EXAM: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&auto=format&fit=crop&q=80",
  ARTICLE: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80",
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
      <div className="absolute inset-0 bg-[#14142b]/45 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_24px_64px_rgba(20,20,43,0.22)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14142b] cursor-pointer"
        >
          <X size={18} />
        </button>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <BookOpen size={20} strokeWidth={2.4} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold tracking-tight text-[#14142b]">New Course</h3>
            <p className="text-[12px] font-medium text-slate-500">Give it a title to get started.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="course-name" className="mb-1.5 block text-[13px] font-semibold text-[#14142b]">
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-[#14142b] outline-none transition-colors placeholder:text-slate-400 focus:border-[#14142b]/30 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
            />
          </div>
          {!channelsLoading && channels.length > 0 && (
            <ChannelPicker channels={channels} value={channelId} onChange={setChannelId} />
          )}
          {!channelsLoading && channels.length === 0 && (
            <p className="text-sm text-rose-600">
              You need a channel with content-authoring rights before you can create a course.
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#14142b] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !channelId || creating}
              className="rounded-full bg-[#14142b] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(20,20,43,0.18)] transition-colors hover:bg-[#232735] disabled:opacity-60 cursor-pointer"
            >
              {creating ? "Creating…" : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── New Quiz creation modal ──────────────────────────────────────────────────

function CreateQuizModal({ onClose }: { onClose: () => void }) {
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
      const quiz = await api.post<{ id: string }>("/api/quizzes", {
        title: name.trim(),
        channelId,
      });
      toast.success(`"${name.trim()}" created`);
      router.push(`/studio/quiz/${quiz.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create quiz";
      setError(message);
      toast.error(message);
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#14142b]/45 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_24px_64px_rgba(20,20,43,0.22)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14142b] cursor-pointer"
        >
          <X size={18} />
        </button>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <HelpCircle size={20} strokeWidth={2.4} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold tracking-tight text-[#14142b]">New Quiz</h3>
            <p className="text-[12px] font-medium text-slate-500">Give it a title to get started.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="quiz-name" className="mb-1.5 block text-[13px] font-semibold text-[#14142b]">
              Quiz title <span className="text-rose-500">*</span>
            </label>
            <input
              id="quiz-name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chapter 1 Quiz"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-[#14142b] outline-none transition-colors placeholder:text-slate-400 focus:border-[#14142b]/30 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
            />
          </div>
          {!channelsLoading && channels.length > 0 && (
            <ChannelPicker channels={channels} value={channelId} onChange={setChannelId} />
          )}
          {!channelsLoading && channels.length === 0 && (
            <p className="text-sm text-rose-600">
              You need a channel with content-authoring rights before you can create a quiz.
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#14142b] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !channelId || creating}
              className="rounded-full bg-[#14142b] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(20,20,43,0.18)] transition-colors hover:bg-[#232735] disabled:opacity-60 cursor-pointer"
            >
              {creating ? "Creating…" : "Create Quiz"}
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
      <div className="absolute inset-0 bg-[#14142b]/45 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_24px_64px_rgba(20,20,43,0.22)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14142b] cursor-pointer"
        >
          <X size={18} />
        </button>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-600">
            <Map size={20} strokeWidth={2.4} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold tracking-tight text-[#14142b]">New Roadmap</h3>
            <p className="text-[12px] font-medium text-slate-500">Give it a title to get started.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="roadmap-title" className="mb-1.5 block text-[13px] font-semibold text-[#14142b]">
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-[#14142b] outline-none transition-colors placeholder:text-slate-400 focus:border-[#14142b]/30 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
            />
          </div>
          {!channelsLoading && channels.length > 0 && (
            <ChannelPicker channels={channels} value={channelId} onChange={setChannelId} />
          )}
          {!channelsLoading && channels.length === 0 && (
            <p className="text-sm text-rose-600">
              You need a channel with content-authoring rights before you can create a roadmap.
            </p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#14142b] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-full bg-[#14142b] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#232735] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
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
      <div className="absolute inset-0 bg-[#14142b]/45 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_24px_64px_rgba(20,20,43,0.22)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14142b] cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Calendar size={20} strokeWidth={2.4} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold tracking-tight text-[#14142b]">New Event</h3>
            <p className="text-[12px] font-medium text-slate-500">Choose event type and give it a title.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#14142b]">
              Event Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEventType("WORKSHOP")}
                className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all cursor-pointer ${
                  eventType === "WORKSHOP"
                    ? "border-violet-600 bg-violet-50/50 ring-2 ring-violet-600/20"
                    : "border-slate-200 bg-slate-50/60 hover:bg-slate-100/60"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-xs font-bold text-[#14142b]">Workshop</span>
                  {eventType === "WORKSHOP" && <Check size={14} className="text-violet-600" />}
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
                    ? "border-violet-600 bg-violet-50/50 ring-2 ring-violet-600/20"
                    : "border-slate-200 bg-slate-50/60 hover:bg-slate-100/60"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-xs font-bold text-[#14142b]">Webinar</span>
                  {eventType === "WEBINAR" && <Check size={14} className="text-violet-600" />}
                </div>
                <p className="mt-1 text-[11px] leading-tight text-slate-500">
                  Live presentation or Q&A stream session
                </p>
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#14142b]">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={eventType === "WORKSHOP" ? "e.g. Full-Stack Web Development Workshop" : "e.g. Intro to AI Webinar"}
              maxLength={120}
              autoFocus
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-violet-600 focus:bg-white focus:ring-2 focus:ring-violet-600/20"
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
      <div className="absolute inset-0 bg-[#14142b]/45 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_24px_64px_rgba(20,20,43,0.22)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
        >
          <X size={18} />
        </button>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
            <Pencil size={20} className="text-[#14142b]" />
          </div>
          <h3 className="text-[15px] font-bold tracking-tight text-[#14142b]">Rename Roadmap</h3>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label htmlFor="rename-title" className="mb-1.5 block text-[13px] font-semibold text-[#14142b]">
              Roadmap Title <span className="text-red-500">*</span>
            </label>
            <input
              id="rename-title"
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-[#14142b] outline-none transition-colors placeholder:text-slate-400 focus:border-[#14142b]/30 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
            />
          </div>
          <div>
            <label htmlFor="rename-desc" className="mb-1.5 block text-[13px] font-semibold text-[#14142b]">
              Description <span className="font-medium text-slate-400">(optional)</span>
            </label>
            <textarea
              id="rename-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-[#14142b] outline-none transition-colors placeholder:text-slate-400 focus:border-[#14142b]/30 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || updating}
              className="rounded-full bg-[#14142b] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(20,20,43,0.18)] transition-colors hover:bg-[#232735] disabled:opacity-60"
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
      <div className="absolute inset-0 bg-[#14142b]/45 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
            <Trash2 size={20} className="text-red-600" />
          </div>
          <h3 className="text-[15px] font-bold tracking-tight text-[#14142b]">Delete Roadmap</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete <strong>{item.title}</strong>? This action cannot be
          undone.
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
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
  const isQuiz = item.type === "QUIZ" || item.type === "EXAM";
  const segment = toContentTypeSegment(item.type);
  const openHref = isQuiz
    ? `/studio/quiz/${item.id}`
    : contentOverviewHref(item.type, item.id) ??
      (item.type === "COURSE" ? `/studio/course/${item.id}/edit` : `/studio`);
  const channelSuspended = item.channelStatus === "SUSPENDED";
  const unlistDate =
    channelSuspended && !item.channelForcedSuspension && item.channelSuspendedAt
      ? new Date(new Date(item.channelSuspendedAt).setMonth(new Date(item.channelSuspendedAt).getMonth() + 6))
      : null;

  const preview = segment && !isQuiz ? previewHref(segment, item.id) : null;
  const duplicate = segment ? DUPLICATE_ACTION[segment] : undefined;
  const canArchive = segment === "event" && item.status?.toUpperCase() !== "ARCHIVED";
  const isPendingInvitation = item.collaborationStatus === "PENDING";
  const hasSecondaryMenu = (isRoadmap || (!isQuiz && segment != null)) && !isPendingInvitation;

  const typeKey = item.type?.toUpperCase() || "COURSE";
  const typeInfo = TYPE_CONFIG[typeKey] ?? TYPE_CONFIG.COURSE;
  const TypeIcon = typeInfo.icon;
  const coverImage = item.coverImageUrl || TYPE_DEFAULT_COVERS[typeKey] || TYPE_DEFAULT_COVERS.COURSE;

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
      await deleteContent(segment, item.id, item.title);
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
      className={`group relative flex flex-col justify-between overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-xl rounded-bl-xl border border-amber-900/12 bg-[#FFFDF7]/90 hover:bg-[#FFFDF7] p-5 shadow-[0_4px_20px_rgba(78,41,17,0.03)] hover:shadow-[0_8px_30px_rgba(78,41,17,0.06)] hover:border-amber-900/25 transition-all duration-200 ${
        channelSuspended || isPendingInvitation ? "" : "cursor-pointer"
      }`}
    >
      <div className="relative z-10 flex flex-1 flex-col justify-between gap-4">
        {/* ── Content Body: Channel, Title, & Description ── */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span
              className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900/70 truncate max-w-[260px]"
              title={item.channelName}
            >
              {item.channelName || "Personal Channel"}
            </span>
          </div>

          <h3 className="line-clamp-1 text-base sm:text-[17px] font-bold tracking-tight text-[#14142b] group-hover:text-amber-950 transition-colors leading-snug">
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
          className="pt-3 border-t border-amber-900/10 flex items-center justify-between gap-2"
          data-card-interactive
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <Clock size={12} className="text-amber-800/60" />
            <span>
              {new Date(item.updatedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {segment && !channelSuspended && (
              <button
                type="button"
                onClick={() => router.push(editorHref(segment, item.id))}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-900/15 bg-white/80 text-slate-600 hover:bg-white hover:text-[#14142b] transition-colors cursor-pointer"
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
                      await api.post(`/api/v1/courses/${item.id}/collaborators/accept`);
                      toast.success("Accepted invitation!");
                      onChanged();
                    } catch {
                      toast.error("Failed to accept");
                    }
                  }}
                  className="rounded-lg bg-[#14142b] px-3 py-1 text-xs font-bold text-white hover:bg-[#232735] transition-colors cursor-pointer"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await api.post(`/api/v1/courses/${item.id}/collaborators/decline`);
                      toast.info("Declined invitation");
                      onChanged();
                    } catch {
                      toast.error("Failed to decline");
                    }
                  }}
                  className="rounded-lg border border-amber-900/15 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-amber-50 transition-colors cursor-pointer"
                >
                  Decline
                </button>
              </div>
            ) : (
              <Link
                href={openHref}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#14142b] px-3.5 py-1.5 text-xs font-bold text-white transition-all shadow-3xs hover:bg-[#232735] hover:shadow-2xs cursor-pointer"
              >
                <TypeIcon size={12} className="text-amber-400/90" />
                <span>
                  {!isQuiz && !isRoadmap && item.status === "SUBMITTED"
                    ? "Review"
                    : isRoadmap
                    ? "Open"
                    : isQuiz
                    ? "Open Quiz"
                    : "Open"}
                </span>
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5 text-amber-200/80" />
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
    <div className="overflow-hidden rounded-2xl border border-amber-900/12 bg-[#FFFDF7]/90 backdrop-blur-md shadow-[0_4px_24px_rgba(78,41,17,0.03)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-amber-900/10 bg-amber-900/[0.03] text-[11px] font-extrabold uppercase tracking-wider text-amber-900/60">
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
              const isQuiz = item.type === "QUIZ" || item.type === "EXAM";
              const segment = toContentTypeSegment(item.type);
              const openHref = isQuiz
                ? `/studio/quiz/${item.id}`
                : contentOverviewHref(item.type, item.id) ??
                  (item.type === "COURSE" ? `/studio/course/${item.id}/edit` : `/studio`);

              return (
                <tr
                  key={item.id}
                  onClick={() => router.push(openHref)}
                  className="group hover:bg-amber-900/[0.03] transition-colors cursor-pointer"
                >
                  {/* Title & Author */}
                  <td className="px-5 py-3.5 max-w-xs">
                    <div className="font-bold text-[#14142b] group-hover:text-amber-950 transition-colors truncate text-[13px]">
                      {item.title}
                    </div>
                    {item.authorName && (
                      <div className="text-[10.5px] font-semibold text-amber-900/60 uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
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
                          className="rounded-lg border border-amber-900/12 bg-white/90 p-1.5 text-slate-600 hover:bg-[#14142b] hover:text-white hover:border-[#14142b] transition-all cursor-pointer shadow-3xs"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                      )}
                      <Link
                        href={openHref}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#14142b] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#232735] transition-all shadow-3xs cursor-pointer"
                      >
                        <span>Open</span>
                        <ArrowRight size={11} className="text-amber-300" />
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
        className="absolute inset-0 bg-[#14142b]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_24px_64px_rgba(20,20,43,0.2)] transition-all">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
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
          <h3 className="text-lg font-bold tracking-tight text-[#14142b]">
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
            className="rounded-full bg-[#14142b] px-5 py-2 text-xs font-semibold text-white shadow-md transition-colors hover:bg-[#232735] cursor-pointer"
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
  const [createOpen, setCreateOpen] = useState<"course" | "roadmap" | "event" | "quiz" | null>(null);
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
    if (typeId === "course" || typeId === "roadmap" || typeId === "event" || typeId === "quiz") {
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
      } else if (create === "course" || create === "roadmap" || create === "quiz") {
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
        background: "linear-gradient(160deg, #FDFAF0 0%, #FAF3D8 35%, #FDFDF5 70%, #F3EDD0 100%)",
      }}
    >
      <ChannelRequiredModal
        isOpen={channelRequiredModalOpen}
        onClose={() => setChannelRequiredModalOpen(false)}
      />
      {createOpen === "course" && <CreateCourseModal onClose={() => setCreateOpen(null)} />}
      {createOpen === "roadmap" && <CreateRoadmapModal onClose={() => setCreateOpen(null)} />}
      {createOpen === "quiz" && <CreateQuizModal onClose={() => setCreateOpen(null)} />}
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

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-28 pt-28 sm:px-8 sm:pt-32">
        {/* ── Header: Standard Studio Header (Brand Title & Actions) ── */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold text-[#14142b] leading-[1.15] tracking-normal select-none"
              style={{ fontFamily: "'Dancing Script', 'Caveat', cursive" }}
            >
              <ShinyText text="Arcade Studio" speed={4.5} />
            </h1>
          </div>

          {/* Right: Channel Switcher, Utility Links, and Create Action */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
            {channels.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setChannelDropdownOpen(!channelDropdownOpen);
                    setTypeDropdownOpen(false);
                    setSortDropdownOpen(false);
                    setDropdownOpen(false);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-900/10 bg-white/95 px-3.5 py-2 text-[12px] font-bold text-slate-700 transition-colors hover:border-amber-900/25 hover:text-[#14142b] outline-none cursor-pointer shadow-3xs"
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
                    <div className="absolute right-0 z-40 mt-1.5 min-w-[170px] rounded-2xl border border-amber-900/10 bg-white p-1.5 shadow-xl">
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
                              isSelected ? "bg-amber-50 text-amber-950 font-bold" : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span>{chip.label}</span>
                            {isSelected && <Check size={13} className="text-amber-700" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            <Link
              href="/studio/review"
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-900/10 bg-white/90 px-3.5 py-2 text-[12px] font-bold text-slate-700 transition-colors hover:border-amber-900/25 hover:text-[#14142b] shadow-3xs"
            >
              <ClipboardCheck size={14} />
              <span>Review</span>
              {statusCounts.SUBMITTED > 0 ? (
                <span className="rounded-full bg-amber-100 text-amber-800 px-1.5 py-0.5 text-[10px] font-extrabold">
                  {statusCounts.SUBMITTED}
                </span>
              ) : (
                <span className="text-slate-400 font-medium text-[11px]">(0)</span>
              )}
            </Link>

            <Link
              href="/trash"
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-900/10 bg-white/90 px-3.5 py-2 text-[12px] font-bold text-slate-700 transition-colors hover:border-amber-900/25 hover:text-[#14142b] shadow-3xs"
            >
              <Trash2 size={14} />
              <span>Trash</span>
            </Link>

            <div className="hidden h-5 w-px bg-amber-900/15 sm:block mx-0.5" />

            <div className="relative shrink-0">
              <button
                id="create-content-btn"
                onClick={handleCreateContentClick}
                className="inline-flex items-center gap-2 rounded-full bg-[#14142b] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#232735] active:scale-[0.98] disabled:opacity-75 cursor-pointer"
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
                  <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                  <div
                    className="absolute right-0 z-40 mt-2 w-72 sm:w-80 overflow-hidden rounded-2xl border border-amber-900/12 bg-[#FFFDF7]/98 backdrop-blur-xl p-1.5 shadow-[0_16px_40px_rgba(20,20,43,0.14),0_2px_8px_rgba(78,41,17,0.04)] animate-in fade-in zoom-in-95 duration-150"
                    role="menu"
                  >
                    <div className="px-3 py-2 mb-1 border-b border-amber-900/10 flex items-center justify-between">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900/70">
                        Create New
                      </p>
                      <span className="text-[10px] font-semibold text-slate-400">Select format</span>
                    </div>
                    <div className="space-y-0.5">
                      {CONTENT_TYPES.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          role="menuitem"
                          onClick={() => handleSelectContentType(type.id, type.href)}
                          className="group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition-all hover:bg-amber-900/8 active:bg-amber-900/12 cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-900/10 bg-white/90 text-amber-900 shadow-3xs group-hover:border-amber-900/20 group-hover:bg-[#14142b] group-hover:text-amber-300 transition-colors">
                              <type.icon size={15} strokeWidth={2.2} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#14142b] group-hover:text-amber-950 transition-colors">
                                {type.label}
                              </p>
                              <p className="text-[11px] font-medium text-slate-500 truncate leading-tight">
                                {type.desc}
                              </p>
                            </div>
                          </div>
                          <ArrowRight
                            size={13}
                            className="shrink-0 text-slate-300 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-amber-900 opacity-40 group-hover:opacity-100"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Studio Standard Tabs (SaaS Underline Navigation) ── */}
        <div className="mb-6 flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
          {STATUS_TABS.map((tab) => {
            const count = statusCounts[tab.id];
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`relative pb-3 text-[13px] sm:text-sm font-bold transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
                  active
                    ? "text-[#14142b]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
                    active
                      ? "bg-[#14142b] text-white shadow-3xs"
                      : "bg-white/80 border border-slate-200/80 text-slate-500"
                  }`}
                >
                  {count}
                </span>
                {active && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#14142b] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Studio Standard Toolbar (Single Streamlined Row) ── */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search creations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-amber-900/10 bg-white/95 pl-9 pr-8 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-[#14142b] focus:ring-2 focus:ring-amber-200 shadow-3xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Right: Format Dropdown, Sort Dropdown & View Mode Switcher */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0 flex-wrap sm:flex-nowrap">
            {/* Format Filter Custom Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setTypeDropdownOpen(!typeDropdownOpen);
                  setSortDropdownOpen(false);
                  setChannelDropdownOpen(false);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-900/10 bg-white/95 px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-amber-900/25 hover:text-[#14142b] transition-all cursor-pointer shadow-3xs"
              >
                <span>{TYPE_CHIPS.find((c) => c.id === typeFilter)?.label ?? "All types"}</span>
                <ChevronDown
                  size={13}
                  className={`text-slate-400 transition-transform duration-150 ${typeDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {typeDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setTypeDropdownOpen(false)} />
                  <div className="absolute left-0 sm:left-auto sm:right-0 z-40 mt-1.5 w-44 rounded-2xl border border-amber-900/10 bg-white p-1.5 shadow-xl">
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
                            isSelected ? "bg-amber-50 text-amber-950 font-bold" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span>{chip.label}</span>
                          {isSelected && <Check size={13} className="text-amber-700" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Sort Custom Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setSortDropdownOpen(!sortDropdownOpen);
                  setTypeDropdownOpen(false);
                  setChannelDropdownOpen(false);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-900/10 bg-white/95 px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-amber-900/25 hover:text-[#14142b] transition-all cursor-pointer shadow-3xs"
              >
                <ArrowUpDown size={12} className="text-slate-400" />
                <span>{SORT_OPTIONS.find((s) => s.id === sortBy)?.label ?? "Recently updated"}</span>
                <ChevronDown
                  size={13}
                  className={`text-slate-400 transition-transform duration-150 ${sortDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {sortDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setSortDropdownOpen(false)} />
                  <div className="absolute right-0 z-40 mt-1.5 w-48 rounded-2xl border border-amber-900/10 bg-white p-1.5 shadow-xl">
                    {SORT_OPTIONS.map((opt) => {
                      const isSelected = sortBy === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSortBy(opt.id as any);
                            setSortDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors cursor-pointer ${
                            isSelected ? "bg-amber-50 text-amber-950 font-bold" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <Check size={13} className="text-amber-700" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-amber-900/10 bg-white/95 p-0.5 shadow-3xs">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`rounded-lg p-1.5 text-xs transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#14142b] text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-700"
                }`}
                title="Grid View"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`rounded-lg p-1.5 text-xs transition-colors cursor-pointer ${
                  viewMode === "table"
                    ? "bg-[#14142b] text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-700"
                }`}
                title="Table View"
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Content Grid or Table View ── */}
        {loadingItems ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
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
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white/70 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#14142b]">No creations yet</p>
              <p className="mt-1 text-xs text-slate-400">
                Click &quot;Create Content&quot; to build your first course, roadmap, quiz, or event.
              </p>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 py-16 text-center">
            <GraduationCap size={28} className="text-slate-300" />
            <p className="text-sm font-bold text-[#14142b]">No creations found</p>
            <p className="text-xs text-slate-400">Try changing your search query or filters.</p>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("ALL");
                setTypeFilter("ALL");
                setChannelFilter("ALL");
                setSearchQuery("");
              }}
              className="mt-1 text-[12px] font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              Reset filters
            </button>
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
