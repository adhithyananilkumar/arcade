// app/(authenticated)/studio/page.tsx
// Post-login dashboard home — Google Content Studio Theme (Courses, Roadmaps, Workshops, Webinars, Articles).
"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/infrastructure/http/api";
import { roadmapService } from "@/domains/roadmaps";
import { WorkshopType } from "@/app/(authenticated)/studio/workshop/types";
import {
  BookOpen,
  Wrench,
  Radio,
  FileText,
  Plus,
  ChevronDown,
  Clock,
  Trash2,
  X,
  Map,
  ClipboardCheck,
  Library,
  Upload,
  MoreVertical,
  Pencil,
  Copy,
  Search,
  LayoutGrid,
  List as ListIcon,
  SlidersHorizontal,
  Sparkles,
  ExternalLink,
  Layers,
  CheckCircle2,
  FileCode,
  FolderOpen,
  Filter,
} from "lucide-react";

// ── Unified content summary contract ─────────────────────────────────────────

interface ContentSummary {
  id: string;
  type: "COURSE" | "ROADMAP" | "WORKSHOP" | "WEBINAR" | "ARTICLE" | string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ── Content type metadata ───────────────────────────────────────────────────

const CONTENT_TYPES = [
  {
    id: "course",
    icon: BookOpen,
    label: "Course",
    desc: "Structured learning path with modules & lessons",
    href: "/studio/course/new",
    color: "text-[#0b57d0]",
    bg: "bg-[#e8f0fe] dark:bg-[#1c2b46]",
    borderColor: "border-[#0b57d0]/20",
  },
  {
    id: "roadmap",
    icon: Map,
    label: "Roadmap",
    desc: "Visual learning path with interactive nodes & connections",
    href: "",
    color: "text-[#a142f4]",
    bg: "bg-[#f3e8ff] dark:bg-[#341d4a]",
    borderColor: "border-[#a142f4]/20",
  },
  {
    id: "workshop",
    icon: Wrench,
    label: "Workshop / Bootcamp",
    desc: "Flexible sessions with videos, activities & resources",
    href: "/studio/workshop/new",
    color: "text-[#1e8e3e]",
    bg: "bg-[#e6f4ea] dark:bg-[#193c25]",
    borderColor: "border-[#1e8e3e]/20",
  },
  {
    id: "webinar",
    icon: Radio,
    label: "Webinar",
    desc: "Live interactive session with Zoom integration",
    href: "/studio/webinar/new",
    color: "text-[#f2990a]",
    bg: "bg-[#fef7e0] dark:bg-[#433010]",
    borderColor: "border-[#f2990a]/20",
  },
  {
    id: "article",
    icon: FileText,
    label: "Article",
    desc: "Standalone rich media document & guide",
    href: "/studio/article/new",
    color: "text-[#129eaf]",
    bg: "bg-[#e0f7fa] dark:bg-[#103a42]",
    borderColor: "border-[#129eaf]/20",
  },
] as const;

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    DRAFT: {
      cls: "bg-[#fef7e0] text-[#b06000] border-[#fde293] dark:bg-[#3c2a05] dark:text-[#fdd663] dark:border-[#5f440a]",
      label: "Draft",
    },
    SUBMITTED: {
      cls: "bg-[#e8f0fe] text-[#1a73e8] border-[#aecbfa] dark:bg-[#172b4d] dark:text-[#8ab4f8] dark:border-[#28436c]",
      label: "In Review",
    },
    PUBLISHED: {
      cls: "bg-[#e6f4ea] text-[#137333] border-[#a8dab5] dark:bg-[#0f381e] dark:text-[#81c995] dark:border-[#1d5731]",
      label: "Published",
    },
    ARCHIVED: {
      cls: "bg-[#f1f3f4] text-[#5f6368] border-[#dadce0] dark:bg-[#303134] dark:text-[#9aa0a6] dark:border-[#4f5358]",
      label: "Archived",
    },
  };
  const key = status.toUpperCase();
  const info = map[key] ?? map.ARCHIVED;
  return (
    <span
      className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shadow-2xs transition-colors ${info.cls}`}
    >
      {info.label}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const upper = type.toUpperCase();
  if (upper === "ROADMAP") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-[#f3e8ff] text-[#9333ea] border border-[#e9d5ff] dark:bg-[#3b0764]/50 dark:text-[#c084fc] dark:border-[#581c87]">
        <Map size={11} /> Roadmap
      </span>
    );
  }
  if (upper === "WORKSHOP" || upper === "BOOTCAMP") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-[#e6f4ea] text-[#16a34a] border border-[#bbf7d0] dark:bg-[#14532d]/50 dark:text-[#4ade80] dark:border-[#166534]">
        <Wrench size={11} /> Workshop
      </span>
    );
  }
  if (upper === "WEBINAR") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-[#fef7e0] text-[#d97706] border border-[#fde68a] dark:bg-[#78350f]/50 dark:text-[#fbbf24] dark:border-[#92400e]">
        <Radio size={11} /> Webinar
      </span>
    );
  }
  if (upper === "ARTICLE") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-[#e0f7fa] text-[#0891b2] border border-[#a5f3fc] dark:bg-[#164e63]/50 dark:text-[#22d3ee] dark:border-[#155e75]">
        <FileText size={11} /> Article
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-[#e8f0fe] text-[#2563eb] border border-[#bfdbfe] dark:bg-[#1e3a8a]/50 dark:text-[#60a5fa] dark:border-[#1e40af]">
      <BookOpen size={11} /> Course
    </span>
  );
}

// ── Google Material Modal: Create Course ────────────────────────────────────

function CreateCourseModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const course = await api.post<{ id: string }>("/api/courses", {
        title: name.trim(),
        description: description.trim() || undefined,
      });
      router.push(`/studio/course/${course.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create course");
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-[28px] bg-white dark:bg-[#202124] p-7 shadow-2xl border border-[#dadce0] dark:border-[#3c4043] transition-all">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-gray-500 hover:bg-[#f1f3f4] dark:hover:bg-[#303134] transition-colors"
        >
          <X size={18} />
        </button>
        <div className="mb-6 flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f0fe] dark:bg-[#172b4d] text-[#0b57d0] dark:text-[#8ab4f8]">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-[#202124] dark:text-[#e8eaed]">Create New Course</h3>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">Build a structured course with lessons & quizzes</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label htmlFor="course-name" className="mb-1.5 block text-xs font-semibold text-[#3c4043] dark:text-[#bdc1c6]">
              Course Title <span className="text-red-500">*</span>
            </label>
            <input
              id="course-name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Modern Full-Stack Development"
              className="w-full rounded-xl border border-[#dadce0] dark:border-[#5f6368] bg-white dark:bg-[#2d2d2d] px-4 py-2.5 text-sm text-[#202124] dark:text-[#e8eaed] outline-none focus:border-[#0b57d0] focus:ring-2 focus:ring-[#0b57d0]/20 transition-all"
            />
          </div>
          <div>
            <label htmlFor="course-desc" className="mb-1.5 block text-xs font-semibold text-[#3c4043] dark:text-[#bdc1c6]">
              Description <span className="text-[#5f6368] font-normal">(optional)</span>
            </label>
            <textarea
              id="course-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of what students will learn..."
              className="w-full resize-none rounded-xl border border-[#dadce0] dark:border-[#5f6368] bg-white dark:bg-[#2d2d2d] px-4 py-2.5 text-sm text-[#202124] dark:text-[#e8eaed] outline-none focus:border-[#0b57d0] focus:ring-2 focus:ring-[#0b57d0]/20 transition-all"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2 text-sm font-medium text-[#0b57d0] hover:bg-[#e8f0fe] dark:hover:bg-[#172b4d] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || creating}
              className="rounded-full bg-[#0b57d0] hover:bg-[#0842a0] text-white px-6 py-2 text-sm font-medium shadow-xs transition-colors disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Google Material Modal: Create Roadmap ───────────────────────────────────

function CreateRoadmapModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const roadmap = await roadmapService.createRoadmap({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      router.push(`/studio/roadmap/${roadmap.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create roadmap");
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-[28px] bg-white dark:bg-[#202124] p-7 shadow-2xl border border-[#dadce0] dark:border-[#3c4043]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-gray-500 hover:bg-[#f1f3f4] dark:hover:bg-[#303134] transition-colors"
        >
          <X size={18} />
        </button>
        <div className="mb-6 flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3e8ff] dark:bg-[#341d4a] text-[#a142f4] dark:text-[#c084fc]">
            <Map size={24} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-[#202124] dark:text-[#e8eaed]">Create Visual Roadmap</h3>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">Design interactive nodes and step-by-step paths</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label htmlFor="roadmap-title" className="mb-1.5 block text-xs font-semibold text-[#3c4043] dark:text-[#bdc1c6]">
              Roadmap Title <span className="text-red-500">*</span>
            </label>
            <input
              id="roadmap-title"
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior DevOps & Cloud Architect Path"
              className="w-full rounded-xl border border-[#dadce0] dark:border-[#5f6368] bg-white dark:bg-[#2d2d2d] px-4 py-2.5 text-sm text-[#202124] dark:text-[#e8eaed] outline-none focus:border-[#a142f4] focus:ring-2 focus:ring-[#a142f4]/20 transition-all"
            />
          </div>
          <div>
            <label htmlFor="roadmap-desc" className="mb-1.5 block text-xs font-semibold text-[#3c4043] dark:text-[#bdc1c6]">
              Description <span className="text-[#5f6368] font-normal">(optional)</span>
            </label>
            <textarea
              id="roadmap-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Goal of this roadmap..."
              className="w-full resize-none rounded-xl border border-[#dadce0] dark:border-[#5f6368] bg-white dark:bg-[#2d2d2d] px-4 py-2.5 text-sm text-[#202124] dark:text-[#e8eaed] outline-none focus:border-[#a142f4] focus:ring-2 focus:ring-[#a142f4]/20 transition-all"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2 text-sm font-medium text-[#a142f4] hover:bg-[#f3e8ff] dark:hover:bg-[#341d4a] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || creating}
              className="rounded-full bg-[#a142f4] hover:bg-[#8b2fc9] text-white px-6 py-2 text-sm font-medium shadow-xs transition-colors disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create Roadmap"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Google Material Modal: Create Workshop ──────────────────────────────────

function CreateWorkshopModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [workshopType, setWorkshopType] = useState<string>(WorkshopType.WORKSHOP);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    setError(null);

    try {
      const workshop = await api.post<{ id: string }>("/api/workshops", {
        title: title.trim(),
        description: description.trim() || undefined,
        workshopType: workshopType,
        category: "uncategorized",
        tags: [],
        deliveryMode: "ONLINE",
        difficulty: "BEGINNER",
        language: "en",
        price: 0,
        currency: "USD",
        visibility: "PRIVATE",
      });
      router.push(`/studio/workshop/${workshop.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create workshop");
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-[28px] bg-white dark:bg-[#202124] p-7 shadow-2xl border border-[#dadce0] dark:border-[#3c4043]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-gray-500 hover:bg-[#f1f3f4] dark:hover:bg-[#303134] transition-colors"
        >
          <X size={18} />
        </button>
        <div className="mb-6 flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e6f4ea] dark:bg-[#193c25] text-[#1e8e3e] dark:text-[#81c995]">
            <Wrench size={24} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-[#202124] dark:text-[#e8eaed]">Create Workshop / Bootcamp</h3>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">Schedule interactive live sessions and project cohorts</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label htmlFor="workshop-type" className="mb-1.5 block text-xs font-semibold text-[#3c4043] dark:text-[#bdc1c6]">
              Workshop Format <span className="text-red-500">*</span>
            </label>
            <select
              id="workshop-type"
              required
              value={workshopType}
              onChange={(e) => setWorkshopType(e.target.value)}
              className="w-full rounded-xl border border-[#dadce0] dark:border-[#5f6368] bg-white dark:bg-[#2d2d2d] px-4 py-2.5 text-sm text-[#202124] dark:text-[#e8eaed] outline-none focus:border-[#1e8e3e] focus:ring-2 focus:ring-[#1e8e3e]/20 transition-all"
            >
              <option value={WorkshopType.WORKSHOP}>Hands-on Workshop</option>
              <option value={WorkshopType.BOOTCAMP}>Multi-Week Bootcamp</option>
              <option value={WorkshopType.MASTERCLASS}>Expert Masterclass</option>
              <option value={WorkshopType.WEBINAR}>Live Webinar</option>
              <option value={WorkshopType.AMA}>Interactive AMA</option>
            </select>
          </div>
          <div>
            <label htmlFor="workshop-title" className="mb-1.5 block text-xs font-semibold text-[#3c4043] dark:text-[#bdc1c6]">
              Workshop Title <span className="text-red-500">*</span>
            </label>
            <input
              id="workshop-title"
              type="text"
              required
              autoFocus
              minLength={5}
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Building High-Performance Microservices"
              className="w-full rounded-xl border border-[#dadce0] dark:border-[#5f6368] bg-white dark:bg-[#2d2d2d] px-4 py-2.5 text-sm text-[#202124] dark:text-[#e8eaed] outline-none focus:border-[#1e8e3e] focus:ring-2 focus:ring-[#1e8e3e]/20 transition-all"
            />
          </div>
          <div>
            <label htmlFor="workshop-desc" className="mb-1.5 block text-xs font-semibold text-[#3c4043] dark:text-[#bdc1c6]">
              Description <span className="text-[#5f6368] font-normal">(optional)</span>
            </label>
            <textarea
              id="workshop-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will attendees build during this session?"
              className="w-full resize-none rounded-xl border border-[#dadce0] dark:border-[#5f6368] bg-white dark:bg-[#2d2d2d] px-4 py-2.5 text-sm text-[#202124] dark:text-[#e8eaed] outline-none focus:border-[#1e8e3e] focus:ring-2 focus:ring-[#1e8e3e]/20 transition-all"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2 text-sm font-medium text-[#1e8e3e] hover:bg-[#e6f4ea] dark:hover:bg-[#193c25] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || creating}
              className="rounded-full bg-[#1e8e3e] hover:bg-[#157230] text-white px-6 py-2 text-sm font-medium shadow-xs transition-colors disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create Workshop"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Modals: Rename & Delete Roadmap ──────────────────────────────────────────

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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-[28px] bg-white dark:bg-[#202124] p-7 shadow-2xl border border-[#dadce0] dark:border-[#3c4043]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3e8ff] text-[#a142f4]">
            <Pencil size={20} />
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Rename Roadmap</h3>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label htmlFor="rename-title" className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Roadmap Title <span className="text-red-500">*</span>
            </label>
            <input
              id="rename-title"
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-[#dadce0] dark:border-[#5f6368] bg-white dark:bg-[#2d2d2d] px-3.5 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-[#a142f4]"
            />
          </div>
          <div>
            <label htmlFor="rename-desc" className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              id="rename-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-xl border border-[#dadce0] dark:border-[#5f6368] bg-white dark:bg-[#2d2d2d] px-3.5 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-[#a142f4]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#303134]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || updating}
              className="rounded-full bg-[#a142f4] hover:bg-[#8b2fc9] text-white px-5 py-2 text-xs font-semibold disabled:opacity-60"
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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-[28px] bg-white dark:bg-[#202124] p-6 shadow-2xl border border-[#dadce0] dark:border-[#3c4043]">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <Trash2 size={20} />
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Delete Item</h3>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          Are you sure you want to delete <strong>{item.title}</strong>? This action will remove it from your studio workspace.
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-full px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#303134]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-full bg-red-600 hover:bg-red-700 text-white px-5 py-2 text-xs font-semibold disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Google Material Cards (Grid View & List View) ───────────────────────────

function ContentCardGrid({
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
  const isWorkshop = item.type === "WORKSHOP";
  const editHref = isRoadmap
    ? `/studio/roadmap/${item.id}/edit`
    : isWorkshop
      ? `/studio/workshop/${item.id}`
      : `/studio/course/${item.id}/edit`;

  return (
    <div className="group bg-white dark:bg-[#202124] rounded-2xl border border-[#dadce0] dark:border-[#3c4043] hover:border-[#0b57d0]/40 dark:hover:border-[#8ab4f8]/40 hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between relative overflow-hidden">
      {/* Visual Accent Top Bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-[#0b57d0] via-[#a142f4] to-[#1e8e3e] opacity-80 group-hover:opacity-100 transition-opacity" />

      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <h3 className="text-sm font-semibold text-[#202124] dark:text-[#e8eaed] leading-snug line-clamp-2 group-hover:text-[#0b57d0] dark:group-hover:text-[#8ab4f8] transition-colors">
            {item.title}
          </h3>
          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-[#f1f3f4] dark:hover:bg-[#303134] transition-colors"
              title="More options"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-[#2d2d2d] rounded-xl shadow-xl border border-[#dadce0] dark:border-[#444746] py-1.5 z-30">
                  {isRoadmap && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onRename(item);
                      }}
                      className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] text-left"
                    >
                      <Pencil size={14} className="text-gray-500" /> Rename
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDuplicate(item);
                    }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] text-left"
                  >
                    <Copy size={14} className="text-gray-500" /> Duplicate
                  </button>
                  <Link
                    href={editHref}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] text-left"
                  >
                    <ExternalLink size={14} className="text-gray-500" /> Edit Content
                  </Link>
                  <div className="my-1 border-t border-[#dadce0] dark:border-[#444746]" />
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(item);
                    }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {item.description && (
          <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] line-clamp-2 leading-relaxed mb-4">
            {item.description}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap mb-4">
          <TypeBadge type={item.type} />
          <StatusBadge status={item.status} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-[11px] text-[#5f6368] dark:text-[#9aa0a6] pt-3 border-t border-[#f1f3f4] dark:border-[#303134] mb-3">
          <span className="flex items-center gap-1.5">
            <Clock size={12} className="text-gray-400" />
            Updated {new Date(item.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
          <span className="text-gray-400 font-mono text-[10px] uppercase">ID: {item.id.slice(0, 7)}</span>
        </div>

        <Link
          href={editHref}
          className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-[#e8f0fe] hover:bg-[#d2e3fc] dark:bg-[#1c2b46] dark:hover:bg-[#263c63] text-[#0b57d0] dark:text-[#8ab4f8] text-xs font-semibold py-2 transition-colors"
        >
          {isRoadmap ? "Open Roadmap Editor" : "Continue Editing"}
        </Link>
      </div>
    </div>
  );
}

function ContentRowList({
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
  const isRoadmap = item.type === "ROADMAP";
  const isWorkshop = item.type === "WORKSHOP";
  const editHref = isRoadmap
    ? `/studio/roadmap/${item.id}/edit`
    : isWorkshop
      ? `/studio/workshop/${item.id}`
      : `/studio/course/${item.id}/edit`;

  return (
    <tr className="border-b border-[#f1f3f4] dark:border-[#303134] hover:bg-[#f8f9fa] dark:hover:bg-[#2d2d2d] transition-colors group">
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-[#e8f0fe] dark:bg-[#1c2b46] text-[#0b57d0] dark:text-[#8ab4f8] flex items-center justify-center shrink-0">
            {item.type === "ROADMAP" ? <Map size={18} /> : item.type === "WORKSHOP" ? <Wrench size={18} /> : <BookOpen size={18} />}
          </div>
          <div>
            <Link href={editHref} className="text-sm font-semibold text-[#202124] dark:text-[#e8eaed] hover:text-[#0b57d0] dark:hover:text-[#8ab4f8] transition-colors line-clamp-1">
              {item.title}
            </Link>
            {item.description && (
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] line-clamp-1">{item.description}</p>
            )}
          </div>
        </div>
      </td>
      <td className="py-3.5 px-4 whitespace-nowrap">
        <TypeBadge type={item.type} />
      </td>
      <td className="py-3.5 px-4 whitespace-nowrap">
        <StatusBadge status={item.status} />
      </td>
      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-[#5f6368] dark:text-[#9aa0a6]">
        {new Date(item.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </td>
      <td className="py-3.5 px-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={editHref}
            className="text-xs font-semibold text-[#0b57d0] dark:text-[#8ab4f8] hover:underline px-2 py-1 rounded-md"
          >
            Edit
          </Link>
          <button
            onClick={() => onDuplicate(item)}
            title="Duplicate"
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <Copy size={15} />
          </button>
          <button
            onClick={() => onDelete(item)}
            title="Delete"
            className="p-1 text-gray-400 hover:text-red-600"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Google Content Studio Dashboard ──────────────────────────────────────────

export default function DashboardPage() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState<"course" | "roadmap" | "workshop" | null>(null);
  const [items, setItems] = useState<ContentSummary[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
      if (item.type === "ROADMAP") {
        await roadmapService.duplicateRoadmap(item.id);
      } else {
        await api.post("/api/courses", {
          title: item.title + " (Copy)",
          description: item.description,
        });
      }
      fetchContent();
    } catch {
      alert("Failed to duplicate item");
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.title || !json.graphJson) {
          alert("Invalid roadmap JSON format.");
          return;
        }
        await roadmapService.createRoadmap({
          title: json.title + " (Imported)",
          description: json.description,
          graphJson: json.graphJson,
        });
        fetchContent();
      } catch {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Filter items based on tab & search query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedType !== "ALL" && item.type.toUpperCase() !== selectedType.toUpperCase()) {
        return false;
      }
      if (selectedStatus !== "ALL" && item.status.toUpperCase() !== selectedStatus.toUpperCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        return matchTitle || matchDesc;
      }
      return true;
    });
  }, [items, selectedType, selectedStatus, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: items.length,
      published: items.filter((i) => i.status.toUpperCase() === "PUBLISHED").length,
      drafts: items.filter((i) => i.status.toUpperCase() === "DRAFT").length,
      courses: items.filter((i) => i.type.toUpperCase() === "COURSE").length,
      roadmaps: items.filter((i) => i.type.toUpperCase() === "ROADMAP").length,
      workshops: items.filter((i) => i.type.toUpperCase() === "WORKSHOP").length,
    };
  }, [items]);

  return (
    <div className="flex-1 flex flex-col bg-[#f8f9fa] dark:bg-[#121212] min-h-screen text-[#202124] dark:text-[#e8eaed] pt-20 md:pt-24">
      {/* Creation & Action Modals */}
      {createOpen === "course" && <CreateCourseModal onClose={() => setCreateOpen(null)} />}
      {createOpen === "roadmap" && <CreateRoadmapModal onClose={() => setCreateOpen(null)} />}
      {createOpen === "workshop" && <CreateWorkshopModal onClose={() => setCreateOpen(null)} />}
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

      {/* ── Google Studio Top Bar & Navigation Header ────────────────────────── */}
      <header className="bg-white dark:bg-[#202124] border-b border-[#dadce0] dark:border-[#3c4043] sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-4">
          {/* Brand Title with Google Accent Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-linear-to-br from-[#0b57d0] via-[#a142f4] to-[#1e8e3e] flex items-center justify-center text-white shadow-xs">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-medium tracking-tight text-[#202124] dark:text-[#e8eaed]">
                  Content Studio
                </h1>
                <span className="bg-[#e8f0fe] dark:bg-[#1c2b46] text-[#0b57d0] dark:text-[#8ab4f8] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Google Theme
                </span>
              </div>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                Author, manage and publish courses, roadmaps & live sessions
              </p>
            </div>
          </div>

          {/* Google Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative flex items-center">
              <Search size={17} className="absolute left-3.5 text-[#5f6368] dark:text-[#9aa0a6]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search studio content..."
                className="w-full pl-10 pr-9 py-2 rounded-full bg-[#f1f3f4] dark:bg-[#2d2d2d] border border-transparent focus:border-[#0b57d0] focus:bg-white dark:focus:bg-[#202124] text-xs text-[#202124] dark:text-[#e8eaed] outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-gray-400 hover:text-gray-600"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Top Quick Actions & Google FAB "+ Create Content" Button */}
          <div className="flex items-center gap-2.5">
            <label className="flex items-center gap-1.5 rounded-full border border-[#dadce0] dark:border-[#5f6368] bg-white dark:bg-[#2d2d2d] px-3.5 py-2 text-xs font-medium text-[#3c4043] dark:text-[#e8eaed] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] transition-colors cursor-pointer shadow-2xs">
              <Upload size={15} className="text-[#0b57d0]" />
              Import Roadmap
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>

            <Link
              href="/studio/roadmap/templates"
              className="flex items-center gap-1.5 rounded-full border border-[#dadce0] dark:border-[#5f6368] bg-white dark:bg-[#2d2d2d] px-3.5 py-2 text-xs font-medium text-[#3c4043] dark:text-[#e8eaed] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] transition-colors shadow-2xs"
            >
              <Library size={15} className="text-[#a142f4]" />
              Templates
            </Link>

            <Link
              href="/studio/review"
              className="flex items-center gap-1.5 rounded-full border border-[#dadce0] dark:border-[#5f6368] bg-white dark:bg-[#2d2d2d] px-3.5 py-2 text-xs font-medium text-[#3c4043] dark:text-[#e8eaed] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] transition-colors shadow-2xs"
            >
              <ClipboardCheck size={15} className="text-[#1e8e3e]" />
              Review Queue
            </Link>

            {/* Google Pill Extended FAB Button */}
            <div className="relative">
              <button
                id="create-content-btn"
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <Plus size={18} strokeWidth={2.5} />
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
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#202124] rounded-2xl shadow-2xl border border-[#dadce0] dark:border-[#3c4043] z-40 overflow-hidden"
                    role="menu"
                  >
                    <div className="px-4 py-3 border-b border-[#f1f3f4] dark:border-[#303134]">
                      <p className="text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider">
                        Select Content Format
                      </p>
                    </div>
                    {CONTENT_TYPES.map((type) => {
                      const inner = (
                        <>
                          <div
                            className={`shrink-0 w-9 h-9 rounded-xl ${type.bg} flex items-center justify-center border ${type.borderColor}`}
                          >
                            <type.icon size={18} className={type.color} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[#202124] dark:text-[#e8eaed]">{type.label}</p>
                            <p className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] mt-0.5 leading-relaxed">
                              {type.desc}
                            </p>
                          </div>
                        </>
                      );
                      const cls =
                        "flex items-start gap-3 px-4 py-3 hover:bg-[#f8f9fa] dark:hover:bg-[#2d2d2d] transition-colors w-full text-left border-b border-[#f1f3f4] dark:border-[#303134] last:border-0";
                      return type.id === "course" || type.id === "roadmap" || type.id === "workshop" ? (
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
      </header>

      {/* ── Main Content Area ────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">

        {/* Google Studio Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <div className="bg-white dark:bg-[#202124] p-4 rounded-2xl border border-[#dadce0] dark:border-[#3c4043] shadow-2xs">
            <p className="text-[11px] font-medium text-[#5f6368] dark:text-[#9aa0a6]">Total Content</p>
            <p className="text-xl font-bold text-[#202124] dark:text-[#e8eaed] mt-1">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-[#202124] p-4 rounded-2xl border border-[#dadce0] dark:border-[#3c4043] shadow-2xs">
            <p className="text-[11px] font-medium text-[#137333] dark:text-[#81c995]">Published</p>
            <p className="text-xl font-bold text-[#137333] dark:text-[#81c995] mt-1">{stats.published}</p>
          </div>
          <div className="bg-white dark:bg-[#202124] p-4 rounded-2xl border border-[#dadce0] dark:border-[#3c4043] shadow-2xs">
            <p className="text-[11px] font-medium text-[#b06000] dark:text-[#fdd663]">In Draft</p>
            <p className="text-xl font-bold text-[#b06000] dark:text-[#fdd663] mt-1">{stats.drafts}</p>
          </div>
          <div className="bg-white dark:bg-[#202124] p-4 rounded-2xl border border-[#dadce0] dark:border-[#3c4043] shadow-2xs">
            <p className="text-[11px] font-medium text-[#0b57d0] dark:text-[#8ab4f8]">Courses</p>
            <p className="text-xl font-bold text-[#0b57d0] dark:text-[#8ab4f8] mt-1">{stats.courses}</p>
          </div>
          <div className="bg-white dark:bg-[#202124] p-4 rounded-2xl border border-[#dadce0] dark:border-[#3c4043] shadow-2xs">
            <p className="text-[11px] font-medium text-[#a142f4] dark:text-[#c084fc]">Roadmaps</p>
            <p className="text-xl font-bold text-[#a142f4] dark:text-[#c084fc] mt-1">{stats.roadmaps}</p>
          </div>
          <div className="bg-white dark:bg-[#202124] p-4 rounded-2xl border border-[#dadce0] dark:border-[#3c4043] shadow-2xs">
            <p className="text-[11px] font-medium text-[#1e8e3e] dark:text-[#81c995]">Workshops</p>
            <p className="text-xl font-bold text-[#1e8e3e] dark:text-[#81c995] mt-1">{stats.workshops}</p>
          </div>
        </div>

        {/* Controls Bar: Material Filter Tabs + Status Dropdown + Grid/List View Toggle */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-[#dadce0] dark:border-[#3c4043] mb-6">
          {/* Material 3 Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-1 no-scrollbar">
            {[
              { id: "ALL", label: "All Content" },
              { id: "COURSE", label: "Courses" },
              { id: "ROADMAP", label: "Roadmaps" },
              { id: "WORKSHOP", label: "Workshops" },
              { id: "WEBINAR", label: "Webinars" },
              { id: "ARTICLE", label: "Articles" },
            ].map((tab) => {
              const active = selectedType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedType(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    active
                      ? "bg-[#0b57d0] text-white shadow-2xs"
                      : "text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#e8f0fe] dark:hover:bg-[#2d2d2d] hover:text-[#0b57d0]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Right Controls: Status Filter & View Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-[#5f6368] dark:text-[#9aa0a6]">
              <Filter size={14} />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-white dark:bg-[#202124] border border-[#dadce0] dark:border-[#5f6368] rounded-lg px-3 py-1.5 text-xs text-[#202124] dark:text-[#e8eaed] outline-none focus:border-[#0b57d0]"
              >
                <option value="ALL">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">In Review</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {/* Grid vs List View Toggle */}
            <div className="flex items-center bg-white dark:bg-[#202124] border border-[#dadce0] dark:border-[#5f6368] rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                title="Grid View"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-[#e8f0fe] text-[#0b57d0] dark:bg-[#1c2b46] dark:text-[#8ab4f8]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                title="List View"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-[#e8f0fe] text-[#0b57d0] dark:bg-[#1c2b46] dark:text-[#8ab4f8]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <ListIcon size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Display Area */}
        {loadingItems ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#202124] rounded-2xl border border-[#dadce0] dark:border-[#3c4043] p-5 animate-pulse"
              >
                <div className="h-4 bg-[#f1f3f4] dark:bg-[#303134] rounded-md mb-3 w-3/4" />
                <div className="h-3 bg-[#f1f3f4] dark:bg-[#303134] rounded-md mb-2 w-full" />
                <div className="h-3 bg-[#f1f3f4] dark:bg-[#303134] rounded-md mb-5 w-2/3" />
                <div className="flex justify-between items-center pt-3 border-t border-[#f1f3f4] dark:border-[#303134]">
                  <div className="h-5 w-16 bg-[#f1f3f4] dark:bg-[#303134] rounded-full" />
                  <div className="h-8 w-24 bg-[#f1f3f4] dark:bg-[#303134] rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center bg-white dark:bg-[#202124] rounded-2xl border border-[#dadce0] dark:border-[#3c4043] p-8">
            <div className="w-16 h-16 rounded-full bg-[#e8f0fe] dark:bg-[#1c2b46] text-[#0b57d0] dark:text-[#8ab4f8] flex items-center justify-center">
              <FolderOpen size={28} />
            </div>
            <div>
              <p className="text-base font-semibold text-[#202124] dark:text-[#e8eaed]">No content found</p>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-1 max-w-sm">
                No items match your filter criteria. Click &quot;Create Content&quot; above to create a new course, roadmap or workshop.
              </p>
            </div>
            {(searchQuery || selectedType !== "ALL" || selectedStatus !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("ALL");
                  setSelectedStatus("ALL");
                }}
                className="mt-2 text-xs font-semibold text-[#0b57d0] hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => (
              <ContentCardGrid
                key={item.id}
                item={item}
                onRename={setRenameTarget}
                onDelete={setDeleteTarget}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#202124] rounded-2xl border border-[#dadce0] dark:border-[#3c4043] overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] dark:bg-[#2d2d2d] border-b border-[#dadce0] dark:border-[#3c4043] text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider">
                  <th className="py-3 px-4">Content Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <ContentRowList
                    key={item.id}
                    item={item}
                    onRename={setRenameTarget}
                    onDelete={setDeleteTarget}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
