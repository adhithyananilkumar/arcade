// app/(authenticated)/studio/page.tsx
// Post-login dashboard home — Create Content + unified content grid (courses + roadmaps).
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/infrastructure/http/api";
import { roadmapService } from "@/domains/roadmaps";
import { useEligibleChannels, ChannelPicker } from "@/domains/channels";
import { EventType } from "@/app/(authenticated)/studio/events/types";
import { contentOverviewHref } from "@/app/(authenticated)/studio/content/[contentType]/[contentId]/lib/contentTypeRouting";
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
  HelpCircle,
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
}

// ── Content type menu items ─────────────────────────────────────────────────────

const CONTENT_TYPES = [
  {
    id: "course",
    icon: BookOpen,
    label: "Course",
    desc: "Structured learning path with modules & lessons",
    href: "/studio/course/new",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    id: "roadmap",
    icon: Map,
    label: "Roadmap",
    desc: "Visual learning path with nodes & connections",
    href: "",
    color: "text-[#14142b]",
    bg: "bg-fuchsia-50",
  },
  {
    id: "event",
    icon: Calendar,
    label: "Event",
    desc: "Events, webinars, bootcamps & live sessions",
    href: "/studio/events/new",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    id: "article",
    icon: FileText,
    label: "Article",
    desc: "Standalone rich document authored with the editor",
    href: "/studio/article/new",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    id: "quiz",
    icon: HelpCircle,
    label: "Quiz",
    desc: "Standalone question bank with automated grading",
    href: "/studio/quiz/new",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    id: "exam",
    icon: ClipboardCheck,
    label: "Exam",
    desc: "Standalone exam or quiz",
    href: "/studio/exam/new",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
] as const;

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "bg-amber-50 text-amber-700 border-amber-200",
    SUBMITTED: "bg-orange-50 text-orange-700 border-orange-200",
    PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ARCHIVED: "bg-slate-100 text-slate-500 border-slate-200",
  };
  const key = status.toUpperCase();
  return (
    <span
      className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${map[key] ?? "bg-slate-100 text-slate-500 border-slate-200"
        }`}
    >
      {key}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  if (type === "ROADMAP") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200">
        <Map size={10} /> Roadmap
      </span>
    );
  }
  if (type === "WORKSHOP" || type === "EVENT") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-violet-50 text-violet-700 border-violet-200">
        <Calendar size={10} /> Event
      </span>
    );
  }
  if (type === "QUIZ") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
        <FileQuestion size={10} /> Quiz
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-700 border-slate-200">
      <BookOpen size={10} /> Course
    </span>
  );
}

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
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
        >
          <X size={18} />
        </button>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
            <BookOpen size={20} className="text-[#14142b]" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold tracking-tight text-[#14142b]">New Course</h3>
            <p className="text-[12px] font-medium text-slate-500">Give it a name to get started.</p>
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
              Course name <span className="text-rose-500">*</span>
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
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !channelId || creating}
              className="rounded-full bg-[#14142b] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(20,20,43,0.18)] transition-colors hover:bg-[#232735] disabled:opacity-60"
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
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
        >
          <X size={18} />
        </button>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
            <HelpCircle size={20} className="text-[#14142b]" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold tracking-tight text-[#14142b]">New Quiz</h3>
            <p className="text-[12px] font-medium text-slate-500">Give it a name to get started.</p>
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
              Quiz name <span className="text-rose-500">*</span>
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
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !channelId || creating}
              className="rounded-full bg-[#14142b] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(20,20,43,0.18)] transition-colors hover:bg-[#232735] disabled:opacity-60"
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
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
        >
          <X size={18} />
        </button>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
            <Map size={20} className="text-[#14142b]" />
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
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-full bg-[#14142b] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#232735] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create roadmap"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateEventModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
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
      // Event type and the rest of the details default here and stay editable
      // afterwards from the Event editor/overview — the create modal only asks for a name.
      const event = await api.post<{ id: string }>("/api/v1/events", {
        title: title.trim(),
        eventType: "WORKSHOP",
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
      router.push(`/studio/events/${event.id}/edit`);
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
        <button type="button" onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14142b]">
          <X size={18} />
        </button>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100">
            <Calendar size={20} className="text-violet-600" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold tracking-tight text-[#14142b]">New Event</h3>
            <p className="text-[12px] font-medium text-slate-500">Give it a name to get started.</p>
          </div>
        </div>
        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
        )}
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#14142b]">
              Title <span className="text-red-500">*</span>
            </label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Full-Stack Event" maxLength={120} autoFocus
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#14142b]">
              Channel <span className="text-red-500">*</span>
            </label>
            <ChannelPicker channels={channels} value={channelId} onChange={setChannelId} />
          </div>
          <button type="submit" disabled={!title.trim() || !channelId || creating}
            className="w-full rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white transition-colors hover:bg-violet-700 disabled:opacity-50">
            {creating ? "Creating..." : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
}


// ── Rename roadmap modal (title/description only — ported from the old /roadmaps list) ─

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

// ── Content card ─────────────────────────────────────────────────────────────

function ContentCard({
  item,
  onRename,
  onDelete,
  onDuplicate,
}: {
  item: ContentSummary;
  onRename: (item: ContentSummary) => void;
  onDelete: (item: ContentSummary) => void;
  onDuplicate: (item: ContentSummary) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isRoadmap = item.type === "ROADMAP";
  const isQuiz = item.type === "QUIZ";
  // Quiz has no split overview/editor yet — its "editor" is the detail page itself.
  // Every other type opens the Content Overview, not a direct editor route.
  const openHref = isQuiz
    ? `/studio/quiz/${item.id}`
    : contentOverviewHref(item.type, item.id) ?? `/studio/course/${item.id}/edit`;
  const channelSuspended = item.channelStatus === "SUSPENDED";
  const unlistDate =
    channelSuspended && !item.channelForcedSuspension && item.channelSuspendedAt
      ? new Date(new Date(item.channelSuspendedAt).setMonth(new Date(item.channelSuspendedAt).getMonth() + 6))
      : null;

  return (
    <div className="group relative flex flex-col gap-3 rounded-lg border border-slate-200/80 bg-white/95 p-5 shadow-[0_4px_16px_rgba(20,20,43,0.04)] transition-all hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(20,20,43,0.08)]">
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-[#14142b]">
          {item.title}
        </h3>
        {isRoadmap && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-1 w-36 rounded-lg border border-slate-100 bg-white py-1 shadow-lg">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onRename(item);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil size={14} /> Rename
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDuplicate(item);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Copy size={14} /> Duplicate
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(item);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {item.description && (
        <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">{item.description}</p>
      )}
      {item.authorName && (
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <User size={11} className="text-slate-400" />
          <span className="truncate">{item.authorName}</span>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <TypeBadge type={item.type} />
        <StatusBadge status={item.status} />
        {channelSuspended && (
          <span
            className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700"
            title={
              item.channelForcedSuspension
                ? "Channel suspended — already unlisted from public discovery"
                : unlistDate
                  ? `Channel suspended — will be unlisted on ${unlistDate.toLocaleDateString()}`
                  : "Channel suspended"
            }
          >
            <Lock size={10} /> Channel Suspended
          </span>
        )}
      </div>
      <div className="mt-auto flex items-center gap-1.5 text-xs text-slate-400">
        <Clock size={11} />
        Last edited:{" "}
        {new Date(item.updatedAt).toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}
      </div>
      {channelSuspended ? (
        <span
          className="cursor-not-allowed rounded-lg bg-slate-50 py-2 text-center text-xs font-semibold text-slate-400"
          title="This channel is suspended — editing is disabled until it's reactivated"
        >
          Editing Disabled
        </span>
      ) : (
        <Link
          href={openHref}
          className="rounded-lg bg-[#14142b] py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-[#232735]"
        >
          {!isQuiz && !isRoadmap && item.status === "SUBMITTED" ? "View (Under Review)" : "Open"}
        </Link>
      )}
    </div>
  );
}

// ── Dashboard page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState<"course" | "roadmap" | "event" | "quiz" | null>(null);
  const [items, setItems] = useState<ContentSummary[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "DRAFT" | "SUBMITTED" | "PUBLISHED" | "ARCHIVED">("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "COURSE" | "ROADMAP" | "EVENT">("ALL");
  const [channelFilter, setChannelFilter] = useState<string>("ALL");

  const { channels } = useEligibleChannels();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const create = params.get("create");
    if (create === "webinar" || create === "workshop" || create === "event") {
      setCreateOpen("event");
    } else if (create === "course" || create === "roadmap" || create === "quiz") {
      setCreateOpen(create);
    }
  }, []);

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
    return items.filter((item) => {
      // Content Studio strictly displays content owned/authored by channels the user has authority over
      if (channels.length > 0 && item.channelId && !eligibleChannelIds.has(item.channelId)) {
        return false;
      }
      const statusOk =
        statusFilter === "ALL" || item.status?.toUpperCase() === statusFilter;
      const typeOk =
        typeFilter === "ALL" ||
        item.type?.toUpperCase() === typeFilter;
      const channelOk = channelFilter === "ALL" || item.channelId === channelFilter;
      return statusOk && typeOk && channelOk;
    });
  }, [items, statusFilter, typeFilter, channelFilter, channels, eligibleChannelIds]);

  const CHANNEL_CHIPS = useMemo(() => {
    const base = [{ id: "ALL", label: "All channels" }];
    return base.concat(
      channels.map(c => ({
        id: c.id,
        label: c.isPersonal ? "Personal" : c.name
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

  return (
    <div
      className="relative flex min-h-screen flex-1 flex-col"
      style={{
        background: "linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 35%, #FFFFFF 70%)",
      }}
    >
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

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-12 pt-28 sm:px-8 sm:pt-32">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[1.75rem] font-bold tracking-tight text-[#14142b] md:text-[2rem]">
              Content Studio
            </h1>
            <p className="mt-1 text-[14px] font-medium text-slate-500">
              Create and manage your educational content
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {channels.length > 0 && (
              <div className="relative">
                <select
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                  className="appearance-none inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 pl-3.5 pr-8 py-2 text-[12px] font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-[#14142b] outline-none cursor-pointer focus:ring-2 focus:ring-slate-200"
                >
                  {CHANNEL_CHIPS.map((chip) => (
                    <option key={chip.id} value={chip.id}>
                      {chip.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronDown size={14} className="text-slate-400" />
                </div>
              </div>
            )}
            <Link
              href="/studio/review"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-3.5 py-2 text-[12px] font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-[#14142b]"
            >
              <ClipboardCheck size={14} />
              Review
            </Link>
            <Link
              href="/trash"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-3.5 py-2 text-[12px] font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-[#14142b]"
            >
              <Trash2 size={14} />
              Trash
            </Link>

            <div className="relative">
              <button
                id="create-content-btn"
                onClick={() => setDropdownOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full bg-[#14142b] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(20,20,43,0.18)] transition-colors hover:bg-[#232735]"
              >
                <Plus size={16} />
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
                    className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl"
                    role="menu"
                  >
                    <div className="border-b border-slate-100 px-4 py-2.5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Select content type
                      </p>
                    </div>
                    {CONTENT_TYPES.map((type) => {
                      const inner = (
                        <>
                          <div
                            className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${type.bg}`}
                          >
                            <type.icon size={17} className={type.color} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#14142b]">{type.label}</p>
                            <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                              {type.desc}
                            </p>
                          </div>
                        </>
                      );
                      const cls =
                        "flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50";
                      return type.id === "course" || type.id === "roadmap" || type.id === "event" || type.id === "quiz" ? (
                        <button
                          key={type.id}
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setDropdownOpen(false);
                            setCreateOpen(type.id);
                          }}
                          className={cls}
                        >
                          {inner}
                        </button>
                      ) : (
                        <Link
                          key={type.id}
                          href={type.href}
                          role="menuitem"
                          onClick={() => setDropdownOpen(false)}
                          className={cls}
                        >
                          {inner}
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status segments */}
        <div className="mb-4 flex flex-wrap gap-1.5 rounded-full border border-slate-200/80 bg-white/90 p-1 shadow-[0_4px_14px_rgba(20,20,43,0.04)]">
          {STATUS_TABS.map((tab) => {
            const count = statusCounts[tab.id];
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all ${active
                    ? "bg-[#14142b] text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-[#14142b]"
                  }`}
              >
                {tab.label}
                <span
                  className={`tabular-nums ${active ? "text-white/70" : "text-slate-400"
                    }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Type chips */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {TYPE_CHIPS.map((chip) => {
            const active = typeFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setTypeFilter(chip.id)}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${active
                    ? "border-[#FF6B4A]/35 bg-[#FF6B4A]/10 text-[#D94F32]"
                    : "border-slate-200 bg-white/80 text-slate-500 hover:border-slate-300 hover:text-[#14142b]"
                  }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Content grid */}
        {loadingItems ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg border border-slate-200 bg-white p-5">
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
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-slate-200 bg-white/70 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <BookOpen size={24} className="text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#14142b]">No content yet</p>
              <p className="mt-1 text-xs text-slate-400">
                Click &quot;Create Content&quot; to build your first course or roadmap.
              </p>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-slate-200/80 bg-white/80 py-16 text-center">
            <GraduationCap size={28} className="text-slate-300" />
            <p className="text-sm font-semibold text-[#14142b]">Nothing in this segment</p>
            <p className="text-xs text-slate-400">Try another filter.</p>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("ALL");
                setTypeFilter("ALL");
                setChannelFilter("ALL");
              }}
              className="mt-1 text-[12px] font-semibold text-[#FF6B4A] hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <ContentCard
                key={item.id}
                item={item}
                onRename={setRenameTarget}
                onDelete={setDeleteTarget}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
