// app/(authenticated)/studio/page.tsx
// Studio dashboard matching reference design exactly.
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/infrastructure/http/api";
import { roadmapService } from "@/domains/roadmaps";
import { useEligibleChannels, ChannelPicker } from "@/domains/channels";
import { useAuthStore } from "@/infrastructure/auth/auth.store";
import {
  BookOpen,
  Calendar,
  FileText,
  Plus,
  ChevronDown,
  Clock,
  CheckCircle2,
  Trash2,
  X,
  Map,
  ClipboardCheck,
  MoreVertical,
  Pencil,
  Copy,
  User,
  HelpCircle,
  Search,
  Bell,
  FileQuestion,
  Lock,
} from "lucide-react";

// ── Content Summary Type ───────────────────────────────────────────────────────

interface ContentSummary {
  id: string;
  type: "COURSE" | "ROADMAP" | "WORKSHOP" | "EVENT" | "QUIZ" | "ARTICLE" | string;
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

// ── Content Creation Menu Items ────────────────────────────────────────────────

const CONTENT_TYPES = [
  {
    id: "course",
    icon: BookOpen,
    label: "Course",
    desc: "Structured learning path with modules & lessons",
    href: "/studio/course/new",
    accentColor: "text-[#2563EB]",
  },
  {
    id: "roadmap",
    icon: Map,
    label: "Roadmap",
    desc: "Visual learning path with nodes & connections",
    href: "",
    accentColor: "text-[#059669]",
  },
  {
    id: "event",
    icon: Calendar,
    label: "Event",
    desc: "Events, webinars, bootcamps & live sessions",
    href: "/studio/events/new",
    accentColor: "text-[#D97706]",
  },
  {
    id: "article",
    icon: FileText,
    label: "Article",
    desc: "Standalone rich document authored with the editor",
    href: "/studio/article/new",
    accentColor: "text-[#9333EA]",
  },
  {
    id: "quiz",
    icon: HelpCircle,
    label: "Quiz",
    desc: "Standalone question bank with automated grading",
    href: "/studio/quiz/new",
    accentColor: "text-[#0D9488]",
  },
  {
    id: "exam",
    icon: ClipboardCheck,
    label: "Exam",
    desc: "Standalone exam or quiz",
    href: "/studio/exam/new",
    accentColor: "text-[#E11D48]",
  },
] as const;

// ── Modals ────────────────────────────────────────────────────────────────────

function CreateCourseModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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
        description: description.trim() || undefined,
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
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
        >
          <X size={18} />
        </button>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
            <BookOpen size={20} className="text-[#183B73]" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold tracking-tight text-[#183B73]">New Course</h3>
            <p className="text-[12px] font-medium text-[#52627A]">Give it a name to get started.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="course-name" className="mb-1.5 block text-[13px] font-semibold text-[#111827]">
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-[#111827] outline-none transition-colors placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label htmlFor="course-desc" className="mb-1.5 block text-[13px] font-semibold text-[#111827]">
              Description <span className="font-medium text-slate-400">(optional)</span>
            </label>
            <textarea
              id="course-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will learners get out of this course?"
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-[#111827] outline-none transition-colors placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-blue-100"
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
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#111827]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !channelId || creating}
              className="rounded-full bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {creating ? "Creating…" : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
        >
          <X size={18} />
        </button>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
            <HelpCircle size={20} className="text-[#183B73]" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold tracking-tight text-[#183B73]">New Quiz</h3>
            <p className="text-[12px] font-medium text-[#52627A]">Give it a name to get started.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="quiz-name" className="mb-1.5 block text-[13px] font-semibold text-[#111827]">
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-[#111827] outline-none transition-colors placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-blue-100"
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
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#111827]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !channelId || creating}
              className="rounded-full bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {creating ? "Creating…" : "Create Quiz"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateRoadmapModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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
        description: description.trim() || undefined,
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
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
        >
          <X size={18} />
        </button>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
            <Map size={20} className="text-[#183B73]" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold tracking-tight text-[#183B73]">New Roadmap</h3>
            <p className="text-[12px] font-medium text-[#52627A]">Give it a title to get started.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="roadmap-title" className="mb-1.5 block text-[13px] font-semibold text-[#111827]">
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-[#111827] outline-none transition-colors placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label htmlFor="roadmap-desc" className="mb-1.5 block text-[13px] font-semibold text-[#111827]">
              Description <span className="font-medium text-slate-400">(optional)</span>
            </label>
            <textarea
              id="roadmap-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will learners achieve?"
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-[#111827] outline-none transition-colors placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-blue-100"
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
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#111827]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create roadmap"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateEventModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState<"SELECT_TYPE" | "DETAILS">("SELECT_TYPE");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<string>("WORKSHOP");
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
        description: description.trim() || undefined,
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
      router.push(`/studio/events/${event.id}/edit`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create event";
      setError(message);
      toast.error(message);
      setCreating(false);
    }
  }

  const EVENT_TYPES = [
    {
      id: "WORKSHOP",
      label: "Workshop",
      desc: "Flexible interactive sessions, activities and resources.",
    },
    {
      id: "WEBINAR",
      label: "Webinar",
      desc: "Live online event with scheduled date/time and meeting details.",
    },
    {
      id: "BOOTCAMP",
      label: "Bootcamp",
      desc: "Structured multi-session intensive learning event.",
    },
  ];

  if (step === "SELECT_TYPE") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[#14142b]/45 backdrop-blur-md" onClick={onClose} />
        <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
          >
            <X size={18} />
          </button>

          <div className="mb-8 text-center">
            <h3 className="text-xl font-bold tracking-tight text-[#183B73] uppercase">Select Event Type</h3>
            <p className="mt-2 text-sm text-[#52627A]">Choose the format that best fits your content delivery.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {EVENT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setEventType(type.id);
                  setStep("DETAILS");
                }}
                className="flex flex-col items-start p-5 text-left border-2 border-slate-100 rounded-xl hover:border-[#2563EB] hover:bg-blue-50/50 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-[#2563EB] group-hover:bg-blue-200">
                    <Calendar size={18} />
                  </div>
                  <span className="font-bold text-[#183B73]">{type.label}</span>
                </div>
                <p className="text-sm text-[#52627A] leading-relaxed">{type.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const typeLabel = EVENT_TYPES.find((t) => t.id === eventType)?.label || "Event";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#14142b]/45 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
        >
          <X size={18} />
        </button>
        <button
          type="button"
          onClick={() => setStep("SELECT_TYPE")}
          className="absolute left-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
        >
          <span className="text-xs font-semibold uppercase">Back</span>
        </button>
        <div className="mb-6 mt-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
            <Calendar size={20} className="text-[#2563EB]" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold tracking-tight text-[#183B73]">New {typeLabel}</h3>
            <p className="text-[12px] font-medium text-[#52627A]">Give it a name to get started.</p>
          </div>
        </div>
        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#111827]">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Full-Stack Event"
              maxLength={120}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#111827]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[#111827]">
              Channel <span className="text-red-500">*</span>
            </label>
            <ChannelPicker channels={channels} value={channelId} onChange={setChannelId} />
          </div>
          <button
            type="submit"
            disabled={!title.trim() || !channelId || creating}
            className="w-full rounded-xl bg-[#2563EB] py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
}

function RenameContentModal({
  item,
  onClose,
  onUpdated,
}: {
  item: ContentSummary;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setUpdating(true);
    setError(null);
    try {
      if (item.type === "ROADMAP") {
        await roadmapService.updateRoadmap(item.id, { title: title.trim() });
      } else if (["WORKSHOP", "EVENT", "WEBINAR", "BOOTCAMP"].includes(item.type)) {
        await api.patch(`/api/v1/events/${item.id}`, { title: title.trim() });
      } else if (item.type === "QUIZ") {
        await api.patch(`/api/quizzes/${item.id}`, { title: title.trim() });
      } else {
        await api.patch(`/api/courses/${item.id}`, { title: title.trim() });
      }
      toast.success("Content renamed successfully");
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not rename content");
      setUpdating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#14142b]/45 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
        >
          <X size={18} />
        </button>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
            <Pencil size={20} className="text-[#183B73]" />
          </div>
          <h3 className="text-[15px] font-bold tracking-tight text-[#183B73]">Rename Content</h3>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label htmlFor="rename-title" className="mb-1.5 block text-[13px] font-semibold text-[#111827]">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="rename-title"
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-[#111827] outline-none transition-colors placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#111827]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || updating}
              className="rounded-full bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {updating ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteContentModal({
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
      if (item.type === "ROADMAP") {
        await roadmapService.deleteRoadmap(item.id);
      } else if (["WORKSHOP", "EVENT", "WEBINAR", "BOOTCAMP"].includes(item.type)) {
        await api.delete(`/api/v1/events/${item.id}`);
      } else if (item.type === "QUIZ") {
        await api.delete(`/api/quizzes/${item.id}`);
      } else {
        await api.delete(`/api/courses/${item.id}`);
      }
      toast.success(`"${item.title}" deleted`);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete content");
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
          <h3 className="text-[15px] font-bold tracking-tight text-[#183B73]">Delete content?</h3>
        </div>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Are you sure you want to delete <strong>{item.title}</strong>? This action cannot be undone.
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
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#111827]"
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

// ── Educational Thumbnail Component ──────────────────────────────────────────

function EducationalThumbnail({ item, index }: { item: ContentSummary; index: number }) {
  if (item.coverImageUrl) {
    return (
      <img
        src={item.coverImageUrl}
        alt={item.title}
        className="w-full h-full object-cover rounded-lg"
      />
    );
  }

  const titleLower = item.title.toLowerCase();

  // Style 1: C Programming / Navy
  if (titleLower.includes("c ") || titleLower.includes("c programming")) {
    return (
      <div className="w-full h-full bg-[#0F172A] rounded-lg p-2.5 flex flex-col justify-between relative overflow-hidden select-none">
        <div className="absolute -right-1 -bottom-3 text-[56px] font-black text-white/5 leading-none pointer-events-none">
          C
        </div>
        <div className="flex items-center justify-between z-10">
          <span className="text-[18px] font-black text-white leading-none">C</span>
        </div>
        <div className="z-10 mt-auto">
          <p className="text-[10px] font-black tracking-wider text-blue-400 uppercase leading-tight">
            C PROGRAMMING
          </p>
          <p className="text-[8px] font-extrabold tracking-widest text-slate-300 uppercase leading-tight">
            FUNDAMENTALS
          </p>
        </div>
      </div>
    );
  }

  // Style 2: Frontend / Roadmap / Green
  if (titleLower.includes("frontend") || titleLower.includes("roadmap")) {
    return (
      <div className="w-full h-full bg-[#064E3B] rounded-lg p-2.5 flex flex-col justify-between relative overflow-hidden select-none">
        <svg className="absolute inset-0 w-full h-full text-emerald-400/20 pointer-events-none" viewBox="0 0 160 80">
          <path d="M 10 70 Q 40 10, 80 40 T 150 20" stroke="currentColor" strokeWidth="3" fill="none" />
          <circle cx="10" cy="70" r="4" fill="currentColor" />
          <circle cx="80" cy="40" r="4" fill="currentColor" />
          <circle cx="150" cy="20" r="4" fill="currentColor" />
        </svg>
        <div className="z-10">
          <span className="text-[8px] font-black tracking-widest text-emerald-300 uppercase">
            ROADMAP
          </span>
        </div>
        <div className="z-10 mt-auto">
          <p className="text-[10px] font-black tracking-wide text-white uppercase leading-snug">
            {item.title}
          </p>
        </div>
      </div>
    );
  }

  // Style 3: Design / Event / Workshop / Cream
  if (
    titleLower.includes("design") ||
    titleLower.includes("workshop") ||
    item.type === "WORKSHOP" ||
    item.type === "EVENT"
  ) {
    return (
      <div className="w-full h-full bg-[#FEF3C7] rounded-lg p-2.5 flex flex-col justify-between relative overflow-hidden select-none">
        <div className="flex items-center justify-between z-10">
          <div className="bg-[#78350F] text-amber-100 text-[8px] font-extrabold px-1.5 py-0.5 rounded leading-none">
            AUG 22
          </div>
        </div>
        <div className="z-10 mt-auto">
          <p className="text-[10px] font-black text-[#78350F] uppercase leading-tight line-clamp-2">
            {item.title}
          </p>
        </div>
      </div>
    );
  }

  // Style 4: Python / Blue
  if (titleLower.includes("python")) {
    return (
      <div className="w-full h-full bg-[#1D4ED8] rounded-lg p-2.5 flex flex-col justify-between relative overflow-hidden select-none">
        <div className="z-10">
          <span className="text-[8px] font-black tracking-widest text-blue-200 uppercase bg-blue-900/40 px-1.5 py-0.5 rounded">
            PYTHON
          </span>
        </div>
        <div className="z-10 mt-auto">
          <p className="text-[10px] font-black text-white uppercase leading-tight line-clamp-2">
            {item.title}
          </p>
        </div>
      </div>
    );
  }

  // Fallback themes based on index
  const themes = [
    { bg: "bg-[#0F172A]", text: "text-white", tag: "text-blue-300" },
    { bg: "bg-[#1E1B4B]", text: "text-white", tag: "text-indigo-300" },
    { bg: "bg-[#064E3B]", text: "text-white", tag: "text-emerald-300" },
    { bg: "bg-[#701A75]", text: "text-white", tag: "text-fuchsia-300" },
  ];
  const t = themes[index % themes.length];

  return (
    <div className={`w-full h-full ${t.bg} rounded-lg p-2.5 flex flex-col justify-between relative overflow-hidden select-none`}>
      <div className="z-10">
        <span className={`text-[8px] font-black tracking-widest ${t.tag} uppercase`}>
          {item.type}
        </span>
      </div>
      <div className="z-10 mt-auto">
        <p className={`text-[10px] font-extrabold ${t.text} uppercase leading-tight line-clamp-2`}>
          {item.title}
        </p>
      </div>
    </div>
  );
}

// ── Main Dashboard Page ───────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState<"course" | "roadmap" | "event" | "quiz" | null>(null);
  const [items, setItems] = useState<ContentSummary[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "title">("latest");
  const [activeRowMenu, setActiveRowMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);

  const [renameTarget, setRenameTarget] = useState<ContentSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContentSummary | null>(null);

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
      toast.success(`"${item.title}" duplicated`);
    } catch {
      toast.error("Failed to duplicate roadmap");
    }
  };

  const filteredItems = useMemo(() => {
    let result = items.filter((item) => {
      // Type Filter
      if (typeFilter !== "All") {
        const tf = typeFilter.toLowerCase();
        const it = item.type.toLowerCase();
        if (tf === "courses" && it !== "course") return false;
        if (tf === "roadmaps" && it !== "roadmap") return false;
        if (tf === "events" && !["workshop", "event", "webinar", "bootcamp"].includes(it)) return false;
        if (tf === "quizzes" && it !== "quiz") return false;
        if (tf === "articles" && it !== "article") return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(q);
        const descMatch = item.description?.toLowerCase().includes(q);
        if (!titleMatch && !descMatch) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === "latest") {
      result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [items, typeFilter, searchQuery, sortBy]);

  const FILTER_TABS = [
    { id: "All", label: "All" },
    { id: "Courses", label: "Courses" },
    { id: "Roadmaps", label: "Roadmaps" },
    { id: "Events", label: "Events" },
    { id: "Quizzes", label: "Quizzes" },
    { id: "Articles", label: "Articles" },
  ];

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getActionLink = (item: ContentSummary) => {
    const isRoadmap = item.type === "ROADMAP";
    const isEvent = ["WORKSHOP", "EVENT", "WEBINAR", "BOOTCAMP"].includes(item.type);
    const isQuiz = item.type === "QUIZ";
    const editHref = isRoadmap
      ? `/studio/roadmap/${item.id}/edit`
      : isEvent
      ? `/studio/events/${item.id}/edit`
      : isQuiz
      ? `/studio/quiz/${item.id}`
      : `/studio/course/${item.id}/edit`;

    return { href: editHref, text: "Continue editing" };
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex flex-col font-sans text-[#111827]">
      {/* ── Modals ── */}
      {createOpen === "course" && <CreateCourseModal onClose={() => setCreateOpen(null)} />}
      {createOpen === "roadmap" && <CreateRoadmapModal onClose={() => setCreateOpen(null)} />}
      {createOpen === "quiz" && <CreateQuizModal onClose={() => setCreateOpen(null)} />}
      {createOpen === "event" && <CreateEventModal onClose={() => setCreateOpen(null)} />}
      {renameTarget && (
        <RenameContentModal
          item={renameTarget}
          onClose={() => setRenameTarget(null)}
          onUpdated={() => {
            setRenameTarget(null);
            fetchContent();
          }}
        />
      )}
      {deleteTarget && (
        <DeleteContentModal
          item={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            setDeleteTarget(null);
            fetchContent();
          }}
        />
      )}



      {/* ── MAIN CONTENT AREA ── */}
      <main className="w-full max-w-7xl mx-auto px-6 sm:px-10 pt-16 sm:pt-20 pb-6 flex-1">
        {/* ── 3. STUDIO HEADER ── */}
        <div className="relative z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="relative inline-flex items-center">
              <h1 className="text-3xl sm:text-[34px] font-bold text-[#183B73] tracking-tight">
                Studio
              </h1>
              {/* 3-blue-stroke decorative graphic asset */}
              <img
                src="/assets/studio-decorative-mark.png"
                alt=""
                className="absolute -top-2 -right-3 w-5.5 h-5.5 object-contain mix-blend-multiply pointer-events-none"
              />
            </div>
            <p
              className="mt-1.5 text-[19px] font-normal text-[#52627A] leading-snug"
              style={{ fontFamily: "'Caveat', 'Marck Script', 'Satisfy', cursive" }}
            >
              Create, structure, and publish your learning experiences.
            </p>
          </div>

          {/* ── 4. CREATE CONTENT BUTTON ── */}
          <div className="relative z-40 flex items-center mr-10 sm:mr-12">
            <div className="relative -translate-x-[40px]">
              <button
                id="create-content-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="group inline-flex items-center gap-2 rounded-full bg-[#2563EB] hover:bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 shadow-sm transition-colors duration-150 ease-out motion-reduce:transform-none motion-reduce:transition-none cursor-pointer"
              >
                <Plus size={16} className="transition-transform duration-300 ease-out group-hover:rotate-90 motion-reduce:transform-none" />
                <span>Create Content</span>
                <ChevronDown
                  size={14}
                  className={`text-white/80 transition-transform duration-200 ease-out ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-50" onClick={() => setDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute right-0 top-full z-50 mt-2 w-[380px] overflow-hidden rounded-2xl border border-[#E5EAF2] bg-white shadow-2xl"
                    >
                      <div className="border-b border-[#E5EAF2] px-5 py-3 bg-slate-50/50">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8492A6]">
                          SELECT CONTENT TYPE
                        </p>
                      </div>
                      <div className="p-2 space-y-1">
                        {CONTENT_TYPES.map((type) => {
                          const inner = (
                            <>
                              <type.icon size={20} className={`mt-0.5 shrink-0 ${type.accentColor}`} />
                              <div>
                                <p className={`text-[15px] font-semibold ${type.accentColor} group-hover:text-[#111827] transition-colors duration-150`}>
                                  {type.label}
                                </p>
                                <p className="mt-0.5 text-[13px] leading-[1.4] text-[#52627A] group-hover:text-[#111827] transition-colors duration-150">
                                  {type.desc}
                                </p>
                              </div>
                            </>
                          );
                          const cls = "group flex w-full items-start gap-3.5 px-3.5 py-3 text-left rounded-[10px] transition-colors duration-150 ease-out hover:bg-slate-50/80 cursor-pointer select-none";
                          return type.id === "course" || type.id === "roadmap" || type.id === "event" || type.id === "quiz" ? (
                            <button
                              key={type.id}
                              type="button"
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
                              onClick={() => setDropdownOpen(false)}
                              className={cls}
                            >
                              {inner}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── 6. CONTENT FILTER BAR & 7. SEARCH + SORT ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E5EAF2] pb-0 mb-6 gap-4">
          {/* Options: All, Courses, Roadmaps, Events, Quizzes, Articles */}
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            {FILTER_TABS.map((tab) => {
              const isActive = typeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTypeFilter(tab.id)}
                  className={`pb-3 pt-1 text-sm font-semibold transition-colors duration-200 relative whitespace-nowrap px-1 rounded-sm hover:text-[#2563EB] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2563EB] ${
                    isActive ? "text-[#2563EB]" : "text-[#52627A]"
                  }`}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="studio-active-tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2563EB] rounded-t"
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Search + Sort */}
          <div className="flex items-center gap-3 self-end md:self-auto mb-3 md:mb-0">
            {/* Search content... with small smooth width expansion (+20px) on hover/focus */}
            <div className="relative group">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8492A6] group-focus-within:text-[#2563EB] transition-colors duration-200 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#E5EAF2] bg-white text-[#111827] placeholder:text-[#8492A6] transition-[width,border-color,box-shadow] duration-200 ease-out hover:border-slate-300 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100/80 motion-reduce:transform-none motion-reduce:transition-none w-[192px] hover:w-[212px] focus:w-[212px] sm:w-[224px] sm:hover:w-[244px] sm:focus:w-[244px]"
              />
            </div>

            {/* Custom Animated Sort Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSortOpen(!sortOpen)}
                className="inline-flex items-center gap-2 pl-3 pr-8 py-1.5 text-xs font-medium rounded-lg border border-[#E5EAF2] bg-white hover:border-slate-300 hover:bg-slate-50/80 text-[#111827] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100/80 transition-all duration-150 ease-out cursor-pointer relative"
              >
                <span>Sort: {sortBy === "latest" ? "Latest updated" : "Title"}</span>
                <ChevronDown
                  size={14}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8492A6] transition-transform duration-200 ease-out ${
                    sortOpen ? "rotate-180 text-[#2563EB]" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {sortOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute right-0 z-40 mt-1.5 w-44 overflow-hidden rounded-xl border border-[#E5EAF2] bg-white py-1 shadow-lg"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSortBy("latest");
                          setSortOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-3 py-2 text-xs transition-colors duration-150 hover:bg-slate-50 cursor-pointer ${
                          sortBy === "latest" ? "font-semibold text-[#2563EB] bg-blue-50/50" : "text-[#111827]"
                        }`}
                      >
                        <span>Latest updated</span>
                        {sortBy === "latest" && <CheckCircle2 size={13} className="text-[#2563EB]" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSortBy("title");
                          setSortOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-3 py-2 text-xs transition-colors duration-150 hover:bg-slate-50 cursor-pointer ${
                          sortBy === "title" ? "font-semibold text-[#2563EB] bg-blue-50/50" : "text-[#111827]"
                        }`}
                      >
                        <span>Title</span>
                        {sortBy === "title" && <CheckCircle2 size={13} className="text-[#2563EB]" />}
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── 9. CONTENT TABLE ── */}
        <div className="w-full bg-white rounded-xl border border-[#E5EAF2] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[840px]">
              <thead>
                <tr className="border-b border-[#E5EAF2] bg-white">
                  <th className="py-3 px-5 text-[11px] font-bold uppercase tracking-wider text-[#8492A6] w-[43%]">
                    CONTENT
                  </th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-[#8492A6] w-[11%]">
                    TYPE
                  </th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-[#8492A6] w-[11%]">
                    STATUS
                  </th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-[#8492A6] w-[11%]">
                    AUTHOR
                  </th>
                  <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-[#8492A6] w-[10%]">
                    UPDATED
                  </th>
                  <th className="py-3 px-5 text-[11px] font-bold uppercase tracking-wider text-[#8492A6] w-[14%] text-right">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAF2]">
                {loadingItems ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse h-[92px]">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-4">
                          <div className="w-[160px] h-[80px] rounded-lg bg-slate-100 shrink-0" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-slate-100 rounded w-1/2" />
                            <div className="h-3 bg-slate-50 rounded w-3/4" />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4"><div className="h-4 w-16 bg-slate-100 rounded" /></td>
                      <td className="py-3.5 px-4"><div className="h-4 w-20 bg-slate-100 rounded" /></td>
                      <td className="py-3.5 px-4"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                      <td className="py-3.5 px-4"><div className="h-4 w-20 bg-slate-100 rounded" /></td>
                      <td className="py-3.5 px-5 text-right"><div className="h-4 w-24 bg-slate-100 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400 text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <BookOpen size={28} className="text-slate-300" />
                        <p className="font-semibold text-[#111827]">No content found</p>
                        <p className="text-xs text-[#52627A]">
                          {searchQuery || typeFilter !== "All"
                            ? "Try adjusting your filters or search terms."
                            : "Click '+ Create Content' to build your first learning experience."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, idx) => {
                    const action = getActionLink(item);
                    const isRoadmap = item.type === "ROADMAP";
                    const isChannelSuspended = item.channelStatus === "SUSPENDED";

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-[#F8FAFC] transition-colors duration-150 group h-[92px]"
                      >
                        {/* ── 10. CONTENT COLUMN ── */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-4">
                            {/* Landscape Thumbnail */}
                            <div className="w-[160px] h-[80px] rounded-lg overflow-hidden shrink-0 transition-transform duration-150 group-hover:scale-[1.01]">
                              <EducationalThumbnail item={item} index={idx} />
                            </div>
                            {/* Title & Description */}
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-bold text-[#111827] line-clamp-1 group-hover:text-[#2563EB] transition-colors">
                                {item.title}
                              </h3>
                              {item.description && (
                                <p className="text-xs text-[#52627A] line-clamp-2 mt-0.5 leading-relaxed">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* ── 16. TYPE COLUMN ── */}
                        <td className="py-3.5 px-4 text-xs font-medium text-[#183B73]">
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            {item.type === "ROADMAP" ? (
                              <>
                                <Map size={14} className="text-[#183B73]" />
                                <span>Roadmap</span>
                              </>
                            ) : ["WORKSHOP", "EVENT", "WEBINAR", "BOOTCAMP"].includes(item.type) ? (
                              <>
                                <Calendar size={14} className="text-[#183B73]" />
                                <span>Event</span>
                              </>
                            ) : item.type === "QUIZ" ? (
                              <>
                                <HelpCircle size={14} className="text-[#183B73]" />
                                <span>Quiz</span>
                              </>
                            ) : item.type === "ARTICLE" ? (
                              <>
                                <FileText size={14} className="text-[#183B73]" />
                                <span>Article</span>
                              </>
                            ) : (
                              <>
                                <BookOpen size={14} className="text-[#183B73]" />
                                <span>Course</span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* ── 17. STATUS COLUMN ── */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {item.status?.toUpperCase() === "PUBLISHED" ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#168A5B]">
                              <CheckCircle2 size={14} className="text-[#168A5B]" />
                              Published
                            </span>
                          ) : item.status?.toUpperCase() === "SUBMITTED" || item.status?.toUpperCase() === "IN_REVIEW" ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D97706]">
                              <Clock size={14} className="text-[#D97706]" />
                              In Review
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B]">
                              <Clock size={14} className="text-[#64748B]" />
                              Draft
                            </span>
                          )}
                        </td>

                        {/* ── 18. AUTHOR COLUMN ── */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-xs font-medium text-[#111827]">
                            <div className="w-6 h-6 rounded-full bg-[#183B73] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                              {item.authorName ? item.authorName.charAt(0).toUpperCase() : "N"}
                            </div>
                            <span className="truncate max-w-[100px]">
                              {item.authorName || user?.fullName || "Neeraj V V"}
                            </span>
                          </div>
                        </td>

                        {/* ── 19. UPDATED COLUMN ── */}
                        <td className="py-3.5 px-4 text-xs text-[#8492A6] font-medium whitespace-nowrap">
                          {formatDate(item.updatedAt)}
                        </td>

                        {/* ── 20. ACTIONS COLUMN ── */}
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-3 pr-1">
                            {isChannelSuspended ? (
                              <span className="text-xs font-semibold text-slate-400 cursor-not-allowed">
                                Suspended
                              </span>
                            ) : (
                              <Link
                                href={action.href}
                                className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1 group/btn"
                              >
                                <span>{action.text}</span>
                                <span className="transition-transform duration-150 group-hover/btn:translate-x-0.5">
                                  →
                                </span>
                              </Link>
                            )}

                            {/* 3-dot dropdown menu */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (activeRowMenu === item.id) {
                                    setActiveRowMenu(null);
                                    setMenuPosition(null);
                                  } else {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const spaceBelow = window.innerHeight - rect.bottom;
                                    const showAbove = spaceBelow < 100;
                                    setMenuPosition({
                                      top: showAbove ? rect.top - 84 : rect.bottom + 4,
                                      right: window.innerWidth - rect.right,
                                    });
                                    setActiveRowMenu(item.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-[#52627A] hover:bg-slate-100 hover:text-[#111827] transition-colors duration-150 cursor-pointer"
                              >
                                <MoreVertical size={16} />
                              </button>
                              <AnimatePresence>
                                {activeRowMenu === item.id && menuPosition && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-[90]"
                                      onClick={() => {
                                        setActiveRowMenu(null);
                                        setMenuPosition(null);
                                      }}
                                    />
                                    <motion.div
                                      initial={{ opacity: 0, y: -4, scale: 0.98 }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                                      transition={{ duration: 0.15, ease: "easeOut" }}
                                      style={{
                                        position: "fixed",
                                        top: menuPosition.top,
                                        right: menuPosition.right,
                                      }}
                                      className="z-[100] w-32 rounded-xl border border-[#E5EAF2] bg-white py-1 shadow-xl text-left overflow-hidden"
                                    >
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveRowMenu(null);
                                          setMenuPosition(null);
                                          setRenameTarget(item);
                                        }}
                                        className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#111827] hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                                      >
                                        <Pencil size={13} className="text-[#52627A]" />
                                        <span>Rename</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveRowMenu(null);
                                          setMenuPosition(null);
                                          setDeleteTarget(item);
                                        }}
                                        className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors duration-150 cursor-pointer"
                                      >
                                        <Trash2 size={13} className="text-rose-600" />
                                        <span>Delete</span>
                                      </button>
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
