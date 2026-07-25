// app/(authenticated)/studio/page.tsx
// Post-login dashboard home — Framer Motion Animated Flow Content Studio (Courses, Roadmaps, Workshops, Webinars, Articles).
"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  ExternalLink,
  FolderOpen,
  Filter,
  Sparkles,
  Check,
  ChevronRight,
} from "lucide-react";

// ── Unified content summary contract ─────────────────────────────────────────

interface ContentSummary {
  id: string;
  type: "COURSE" | "ROADMAP" | "WORKSHOP" | "WEBINAR" | "ARTICLE" | string;
  title: string;
  description?: string | null;
  status: "DRAFT" | "SUBMITTED" | "PUBLISHED" | "ARCHIVED" | string;
  updatedAt?: string | null;
  authorName?: string | null;
}

// ── Content type metadata ───────────────────────────────────────────────────

const CONTENT_TYPES = [
  {
    id: "course",
    icon: BookOpen,
    label: "Course",
    desc: "Structured learning path with modules, lessons & quizzes",
    href: "/studio/course/new",
    color: "text-[#0284c7] dark:text-[#38bdf8]",
    bg: "bg-gradient-to-br from-[#e0f2fe] to-[#bae6fd] dark:from-[#0c4a6e]/80 dark:to-[#0369a1]/80",
    borderColor: "border-[#0284c7]/30 dark:border-[#38bdf8]/30",
  },
  {
    id: "roadmap",
    icon: Map,
    label: "Roadmap",
    desc: "Visual learning path with interactive nodes & connections",
    href: "",
    color: "text-[#a142f4] dark:text-[#c084fc]",
    bg: "bg-gradient-to-br from-[#f3e8ff] to-[#e9d5ff] dark:from-[#341d4a]/80 dark:to-[#581c87]/80",
    borderColor: "border-[#a142f4]/30 dark:border-[#c084fc]/30",
  },
  {
    id: "workshop",
    icon: Wrench,
    label: "Workshop / Bootcamp",
    desc: "Flexible live sessions with activities & project cohorts",
    href: "/studio/workshop/new",
    color: "text-[#10b981] dark:text-[#34d399]",
    bg: "bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0] dark:from-[#065f46]/80 dark:to-[#047857]/80",
    borderColor: "border-[#10b981]/30 dark:border-[#34d399]/30",
  },
  {
    id: "webinar",
    icon: Radio,
    label: "Webinar",
    desc: "Live interactive broadcast session with Q&A integration",
    href: "/studio/webinar/new",
    color: "text-[#d97706] dark:text-[#fbbf24]",
    bg: "bg-gradient-to-br from-[#fef3c7] to-[#fde68a] dark:from-[#78350f]/80 dark:to-[#92400e]/80",
    borderColor: "border-[#d97706]/30 dark:border-[#fbbf24]/30",
  },
  {
    id: "article",
    icon: FileText,
    label: "Article",
    desc: "Standalone rich media documentation & comprehensive guide",
    href: "/studio/article/new",
    color: "text-[#0891b2] dark:text-[#22d3ee]",
    bg: "bg-gradient-to-br from-[#cffafe] to-[#a5f3fc] dark:from-[#164e63]/80 dark:to-[#155e75]/80",
    borderColor: "border-[#0891b2]/30 dark:border-[#22d3ee]/30",
  },
] as const;



function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string; dot: string }> = {
    DRAFT: {
      cls: "bg-[#fef7e0] text-[#b06000] border-[#fde293] dark:bg-[#3c2a05] dark:text-[#fdd663] dark:border-[#5f440a]",
      dot: "bg-[#f2990a]",
      label: "Draft",
    },
    SUBMITTED: {
      cls: "bg-[#e8f0fe] text-[#1a73e8] border-[#aecbfa] dark:bg-[#172b4d] dark:text-[#8ab4f8] dark:border-[#28436c]",
      dot: "bg-[#1a73e8]",
      label: "In Review",
    },
    PUBLISHED: {
      cls: "bg-[#e6f4ea] text-[#137333] border-[#a8dab5] dark:bg-[#0f381e] dark:text-[#81c995] dark:border-[#1d5731]",
      dot: "bg-[#137333]",
      label: "Published",
    },
    ARCHIVED: {
      cls: "bg-[#f1f3f4] text-[#5f6368] border-[#dadce0] dark:bg-[#303134] dark:text-[#9aa0a6] dark:border-[#4f5358]",
      dot: "bg-[#5f6368]",
      label: "Archived",
    },
  };
  const key = status.toUpperCase();
  const info = map[key] ?? map.ARCHIVED;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shadow-2xs transition-colors ${info.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${info.dot}`} />
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

// ── Modals: Create Course ───────────────────────────────────────────────────

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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="relative w-full max-w-lg rounded-[32px] bg-white dark:bg-[#202124] p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-[#dadce0] dark:border-[#3c4043] overflow-hidden"
        >
          {/* Top Gradient Accent Bar */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#0284c7] via-[#06b6d4] to-[#a142f4]" />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-6 top-6 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-[#f1f5f9] dark:hover:bg-[#303134] transition-colors"
          >
            <X size={18} />
          </button>

          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e0f2fe] to-[#bae6fd] dark:from-[#0c4a6e]/80 dark:to-[#0369a1]/80 text-[#0284c7] dark:text-[#38bdf8] border border-[#0284c7]/30 shadow-md shadow-[#0284c7]/10">
              <BookOpen size={22} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#0f172a] dark:text-[#e8eaed]">Create New Course</h3>
              <p className="text-xs text-[#64748b] dark:text-[#9aa0a6] mt-0.5">Build a structured course with lessons, modules & quizzes</p>
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label htmlFor="course-name" className="mb-2 block text-xs font-semibold text-[#334155] dark:text-[#bdc1c6]">
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
                className="w-full rounded-2xl border border-[#cbd5e1] dark:border-[#5f6368] bg-white dark:bg-[#2d2d2d] px-4 py-3 text-sm text-[#0f172a] dark:text-[#e8eaed] outline-none focus:border-[#0284c7] focus:ring-4 focus:ring-[#0284c7]/15 transition-all shadow-2xs"
              />
            </div>

            <div>
              <label htmlFor="course-desc" className="mb-2 block text-xs font-semibold text-[#334155] dark:text-[#bdc1c6]">
                Description <span className="text-[#64748b] font-normal">(optional)</span>
              </label>
              <textarea
                id="course-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Summary of what students will learn..."
                className="w-full resize-none rounded-2xl border border-[#cbd5e1] dark:border-[#5f6368] bg-white dark:bg-[#2d2d2d] px-4 py-3 text-sm text-[#0f172a] dark:text-[#e8eaed] outline-none focus:border-[#0284c7] focus:ring-4 focus:ring-[#0284c7]/15 transition-all shadow-2xs"
              />
            </div>

            <div className="flex justify-end items-center gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-5 py-2.5 text-xs font-semibold text-[#0284c7] dark:text-[#38bdf8] hover:bg-[#e0f2fe] dark:hover:bg-[#0c4a6e]/40 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || creating}
                className="rounded-full bg-gradient-to-r from-[#0284c7] to-[#06b6d4] hover:from-[#0369a1] hover:to-[#0891b2] text-white px-7 py-2.5 text-xs font-semibold shadow-md hover:shadow-cyan-500/25 transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {creating ? "Creating..." : "Create Course"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ── Modals: Create Roadmap ──────────────────────────────────────────────────

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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="relative w-full max-w-lg rounded-[32px] bg-white dark:bg-[#202124] p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-[#dadce0] dark:border-[#3c4043] overflow-hidden"
        >
          {/* Top Gradient Accent Bar */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#a142f4] via-[#c084fc] to-[#06b6d4]" />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-6 top-6 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-[#f1f5f9] dark:hover:bg-[#303134] transition-colors"
          >
            <X size={18} />
          </button>

          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f3e8ff] to-[#e9d5ff] dark:from-[#341d4a]/80 dark:to-[#581c87]/80 text-[#a142f4] dark:text-[#c084fc] border border-[#a142f4]/30 shadow-md shadow-[#a142f4]/10">
              <Map size={22} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#0f172a] dark:text-[#e8eaed]">Create Visual Roadmap</h3>
              <p className="text-xs text-[#64748b] dark:text-[#9aa0a6] mt-0.5">Design interactive nodes and step-by-step learning paths</p>
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label htmlFor="roadmap-title" className="mb-2 block text-xs font-semibold text-[#334155] dark:text-[#bdc1c6]">
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
                className="w-full rounded-2xl border border-[#cbd5e1] dark:border-[#5f6368] bg-white dark:bg-[#2d2d2d] px-4 py-3 text-sm text-[#0f172a] dark:text-[#e8eaed] outline-none focus:border-[#a142f4] focus:ring-4 focus:ring-[#a142f4]/15 transition-all shadow-2xs"
              />
            </div>

            <div>
              <label htmlFor="roadmap-desc" className="mb-2 block text-xs font-semibold text-[#334155] dark:text-[#bdc1c6]">
                Description <span className="text-[#64748b] font-normal">(optional)</span>
              </label>
              <textarea
                id="roadmap-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Goal of this roadmap..."
                className="w-full resize-none rounded-2xl border border-[#cbd5e1] dark:border-[#5f6368] bg-white dark:bg-[#2d2d2d] px-4 py-3 text-sm text-[#0f172a] dark:text-[#e8eaed] outline-none focus:border-[#a142f4] focus:ring-4 focus:ring-[#a142f4]/15 transition-all shadow-2xs"
              />
            </div>

            <div className="flex justify-end items-center gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-5 py-2.5 text-xs font-semibold text-[#a142f4] dark:text-[#c084fc] hover:bg-[#f3e8ff] dark:hover:bg-[#341d4a]/40 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || creating}
                className="rounded-full bg-gradient-to-r from-[#a142f4] to-[#c084fc] hover:from-[#8b2fc9] hover:to-[#a855f7] text-white px-7 py-2.5 text-xs font-semibold shadow-md hover:shadow-purple-500/25 transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {creating ? "Creating..." : "Create Roadmap"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ── Modals: Create Workshop ──────────────────────────────────────────────────

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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="relative w-full max-w-lg rounded-[32px] bg-white dark:bg-[#202124] p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-[#dadce0] dark:border-[#3c4043] overflow-hidden"
        >
          {/* Top Gradient Accent Bar */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#10b981] via-[#059669] to-[#06b6d4]" />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-6 top-6 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-[#f1f5f9] dark:hover:bg-[#303134] transition-colors"
          >
            <X size={18} />
          </button>

          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0] dark:from-[#065f46]/80 dark:to-[#047857]/80 text-[#10b981] dark:text-[#34d399] border border-[#10b981]/30 shadow-md shadow-[#10b981]/10">
              <Wrench size={22} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#0f172a] dark:text-[#e8eaed]">Create Workshop / Bootcamp</h3>
              <p className="text-xs text-[#64748b] dark:text-[#9aa0a6] mt-0.5">Schedule interactive live sessions and project cohorts</p>
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label htmlFor="workshop-type" className="mb-2 block text-xs font-semibold text-[#334155] dark:text-[#bdc1c6]">
                Workshop Format <span className="text-red-500">*</span>
              </label>
              <select
                id="workshop-type"
                required
                value={workshopType}
                onChange={(e) => setWorkshopType(e.target.value)}
                className="w-full rounded-2xl border border-[#cbd5e1] dark:border-[#5f6368] bg-white dark:bg-[#2d2d2d] px-4 py-3 text-sm text-[#0f172a] dark:text-[#e8eaed] outline-none focus:border-[#10b981] focus:ring-4 focus:ring-[#10b981]/15 transition-all cursor-pointer shadow-2xs"
              >
                <option value={WorkshopType.WORKSHOP}>Hands-on Workshop</option>
                <option value={WorkshopType.BOOTCAMP}>Multi-Week Bootcamp</option>
                <option value={WorkshopType.MASTERCLASS}>Expert Masterclass</option>
                <option value={WorkshopType.WEBINAR}>Live Webinar</option>
                <option value={WorkshopType.AMA}>Interactive AMA</option>
              </select>
            </div>

            <div>
              <label htmlFor="workshop-title" className="mb-2 block text-xs font-semibold text-[#334155] dark:text-[#bdc1c6]">
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
                className="w-full rounded-2xl border border-[#cbd5e1] dark:border-[#5f6368] bg-white dark:bg-[#2d2d2d] px-4 py-3 text-sm text-[#0f172a] dark:text-[#e8eaed] outline-none focus:border-[#10b981] focus:ring-4 focus:ring-[#10b981]/15 transition-all shadow-2xs"
              />
            </div>

            <div>
              <label htmlFor="workshop-desc" className="mb-2 block text-xs font-semibold text-[#334155] dark:text-[#bdc1c6]">
                Description <span className="text-[#64748b] font-normal">(optional)</span>
              </label>
              <textarea
                id="workshop-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will attendees build during this session?"
                className="w-full resize-none rounded-2xl border border-[#cbd5e1] dark:border-[#5f6368] bg-white dark:bg-[#2d2d2d] px-4 py-3 text-sm text-[#0f172a] dark:text-[#e8eaed] outline-none focus:border-[#10b981] focus:ring-4 focus:ring-[#10b981]/15 transition-all shadow-2xs"
              />
            </div>

            <div className="flex justify-end items-center gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-5 py-2.5 text-xs font-semibold text-[#10b981] dark:text-[#34d399] hover:bg-[#d1fae5] dark:hover:bg-[#065f46]/40 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || creating}
                className="rounded-full bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white px-7 py-2.5 text-xs font-semibold shadow-md hover:shadow-emerald-500/25 transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {creating ? "Creating..." : "Create Workshop"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="relative w-full max-w-md rounded-[32px] bg-white dark:bg-[#202124] p-7 shadow-2xl border border-[#dadce0] dark:border-[#3c4043]"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-[#f1f5f9] dark:hover:bg-[#303134] transition-colors"
          >
            <X size={18} />
          </button>
          <div className="mb-5 flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3e8ff] dark:bg-[#341d4a] text-[#a142f4]">
              <Pencil size={20} />
            </div>
            <h3 className="text-base font-semibold text-[#0f172a] dark:text-white">Rename Roadmap</h3>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label htmlFor="rename-title" className="mb-1.5 block text-xs font-semibold text-[#334155] dark:text-gray-300">
                Roadmap Title <span className="text-red-500">*</span>
              </label>
              <input
                id="rename-title"
                type="text"
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-[#cbd5e1] dark:border-[#5f6368] bg-white dark:bg-[#2d2d2d] px-4 py-2.5 text-sm text-[#0f172a] dark:text-white outline-none focus:border-[#a142f4] focus:ring-4 focus:ring-[#a142f4]/15"
              />
            </div>
            <div>
              <label htmlFor="rename-desc" className="mb-1.5 block text-xs font-semibold text-[#334155] dark:text-gray-300">
                Description <span className="text-[#64748b] font-normal">(optional)</span>
              </label>
              <textarea
                id="rename-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none rounded-2xl border border-[#cbd5e1] dark:border-[#5f6368] bg-white dark:bg-[#2d2d2d] px-4 py-2.5 text-sm text-[#0f172a] dark:text-white outline-none focus:border-[#a142f4] focus:ring-4 focus:ring-[#a142f4]/15"
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-5 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#303134]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || updating}
                className="rounded-full bg-[#a142f4] hover:bg-[#8b2fc9] text-white px-5 py-2 text-xs font-semibold shadow-xs disabled:opacity-60"
              >
                {updating ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="relative w-full max-w-sm rounded-[32px] bg-white dark:bg-[#202124] p-7 shadow-2xl border border-[#dadce0] dark:border-[#3c4043]"
        >
          <div className="mb-4 flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200">
              <Trash2 size={20} />
            </div>
            <h3 className="text-base font-semibold text-[#0f172a] dark:text-white">Delete Item</h3>
          </div>
          <p className="text-xs text-[#64748b] dark:text-gray-300 mb-6 leading-relaxed">
            Are you sure you want to delete <strong>{item.title}</strong>? This action will remove it from your studio workspace.
          </p>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="rounded-full px-5 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#303134]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-full bg-red-600 hover:bg-red-700 text-white px-5 py-2 text-xs font-semibold shadow-xs disabled:opacity-60"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ── Interactive Content Cards (Grid View & List View) ───────────────────────

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
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.99 }}
      className="group bg-white dark:bg-[#202124] rounded-[24px] border border-[#dadce0] dark:border-[#3c4043] hover:border-[#0b57d0]/50 dark:hover:border-[#8ab4f8]/50 hover:shadow-lg transition-all duration-300 p-5 flex flex-col justify-between relative overflow-hidden h-full"
    >
      {/* Dynamic Top Gradient Accent Line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-[#0b57d0] via-[#a142f4] to-[#1e8e3e] opacity-70 group-hover:opacity-100 transition-opacity" />

      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <h3 className="text-sm font-bold text-[#0f172a] dark:text-[#e8eaed] leading-snug line-clamp-2 group-hover:text-[#0284c7] dark:group-hover:text-[#38bdf8] transition-colors">
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
                <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#2d2d2d] rounded-2xl shadow-xl border border-[#dadce0] dark:border-[#444746] py-1.5 z-30">
                  {isRoadmap && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onRename(item);
                      }}
                      className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] text-left transition-colors"
                    >
                      <Pencil size={14} className="text-gray-500" /> Rename
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDuplicate(item);
                    }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] text-left transition-colors"
                  >
                    <Copy size={14} className="text-gray-500" /> Duplicate
                  </button>
                  <Link
                    href={editHref}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] text-left transition-colors"
                  >
                    <ExternalLink size={14} className="text-gray-500" /> Edit Content
                  </Link>
                  <div className="my-1 border-t border-[#dadce0] dark:border-[#444746]" />
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(item);
                    }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left transition-colors"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {item.description && (
          <p className="text-xs text-[#64748b] dark:text-[#9aa0a6] line-clamp-2 leading-relaxed mb-4">
            {item.description}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap mb-4">
          <TypeBadge type={item.type} />
          <StatusBadge status={item.status} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-[11px] text-[#64748b] dark:text-[#9aa0a6] pt-3 border-t border-[#f1f3f4] dark:border-[#303134] mb-3">
          <span className="flex items-center gap-1.5">
            <Clock size={12} className="text-gray-400" />
            Updated {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recently"}
          </span>
          <span className="text-gray-400 font-mono text-[10px] uppercase">ID: {item.id.slice(0, 7)}</span>
        </div>

        <Link
          href={editHref}
          className="flex items-center justify-center gap-1.5 w-full rounded-full bg-[#e0f2fe] hover:bg-[#bae6fd] dark:bg-[#0c4a6e]/60 dark:hover:bg-[#0c4a6e] text-[#0284c7] dark:text-[#38bdf8] text-xs font-semibold py-2 transition-all active:scale-[0.98]"
        >
          {isRoadmap ? "Open Roadmap Editor" : "Continue Editing"}
        </Link>
      </div>
    </motion.div>
  );
}

function ContentRowList({
  item,
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
          <div className="h-9 w-9 rounded-lg bg-[#e8f0fe] dark:bg-[#1c2b46] text-[#0b57d0] dark:text-[#8ab4f8] flex items-center justify-center shrink-0 shadow-2xs">
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
        {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently"}
      </td>
      <td className="py-3.5 px-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={editHref}
            className="text-xs font-semibold text-[#0b57d0] dark:text-[#8ab4f8] hover:underline px-2.5 py-1 rounded-md hover:bg-[#e8f0fe] dark:hover:bg-[#1c2b46] transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={() => onDuplicate(item)}
            title="Duplicate"
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-[#303134] transition-colors"
          >
            <Copy size={15} />
          </button>
          <button
            onClick={() => onDelete(item)}
            title="Delete"
            className="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Content Studio Dashboard ────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState<"course" | "roadmap" | "workshop" | null>(null);
  const [items, setItems] = useState<ContentSummary[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const STATUS_OPTIONS = [
    { id: "ALL", label: "All Statuses", dot: "bg-[#0284c7]" },
    { id: "DRAFT", label: "Draft", dot: "bg-[#f2990a]" },
    { id: "SUBMITTED", label: "In Review", dot: "bg-[#0284c7]" },
    { id: "PUBLISHED", label: "Published", dot: "bg-[#1e8e3e]" },
    { id: "ARCHIVED", label: "Archived", dot: "bg-[#5f6368]" },
  ];

  const [renameTarget, setRenameTarget] = useState<ContentSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContentSummary | null>(null);

  const fetchContent = () => {
    setLoadingItems(true);
    api
      .get<ContentSummary[]>("/api/content")
      .then((data) => {
        if (data && Array.isArray(data)) {
          setItems(data);
        } else {
          setItems([]);
        }
      })
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
      const newItem: ContentSummary = {
        ...item,
        id: `${item.id}-copy-${Date.now().toString(36)}`,
        title: `${item.title} (Copy)`,
        updatedAt: new Date().toISOString(),
      };
      setItems((prev) => [newItem, ...prev]);
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

  // Compute category counts interactively
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: items.length,
      COURSE: 0,
      ROADMAP: 0,
      WORKSHOP: 0,
      WEBINAR: 0,
      ARTICLE: 0,
    };
    items.forEach((item) => {
      const typeKey = item.type.toUpperCase();
      if (counts[typeKey] !== undefined) {
        counts[typeKey]++;
      }
    });
    return counts;
  }, [items]);

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#121212] min-h-screen text-[#202124] dark:text-[#e8eaed] pt-20 md:pt-24">
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

      {/* ── Sticky Fixed Top Header & Controls (Static Header) ──────────────────── */}
      <div className="sticky top-16 z-30 bg-white dark:bg-[#121212]">
        <header className="bg-white dark:bg-[#202124]">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-4">
            {/* Unique Brand Title & Interactive Pulse Counter */}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight bg-linear-to-r from-[#0f172a] via-[#0284c7] to-[#06b6d4] dark:from-[#e2e8f0] dark:via-[#38bdf8] dark:to-[#22d3ee] bg-clip-text text-transparent">
                  Content Studio
                </h1>
                <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#e0f2fe]/90 dark:bg-[#0c4a6e]/80 text-[#0369a1] dark:text-[#38bdf8] border border-[#0284c7]/20 text-[11px] font-bold shadow-2xs backdrop-blur-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0284c7] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0284c7]"></span>
                  </span>
                  <span>
                    {items.length} {items.length === 1 ? "Active Item" : "Active Items"}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-1 flex items-center gap-1.5 flex-wrap">
                <span>Author, manage & publish</span>
                <span className="inline-block w-1 h-1 rounded-full bg-[#dadce0] dark:bg-[#5f6368]" />
                <span className="font-medium text-[#0284c7] dark:text-[#38bdf8]">Courses</span>
                <span className="inline-block w-1 h-1 rounded-full bg-[#dadce0] dark:bg-[#5f6368]" />
                <span className="font-medium text-[#a142f4] dark:text-[#c084fc]">Roadmaps</span>
                <span className="inline-block w-1 h-1 rounded-full bg-[#dadce0] dark:bg-[#5f6368]" />
                <span className="font-medium text-[#1e8e3e] dark:text-[#81c995]">Workshops</span>
                <span className="inline-block w-1 h-1 rounded-full bg-[#dadce0] dark:bg-[#5f6368]" />
                <span className="font-medium text-[#f2990a] dark:text-[#fdd663]">Webinars</span>
              </p>
            </div>

            {/* Google Search Bar */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative flex items-center">
                <Search size={16} className="absolute left-3.5 text-[#5f6368] dark:text-[#9aa0a6]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search studio content..."
                  className="w-full pl-10 pr-9 py-2 rounded-full bg-[#f1f3f4] dark:bg-[#2d2d2d] border border-transparent focus:border-[#0284c7] focus:bg-white dark:focus:bg-[#202124] text-xs text-[#202124] dark:text-[#e8eaed] outline-none transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Top Quick Actions & Extended Primary FAB "+ Create Content" Button */}
            <div className="flex items-center gap-2.5">
              <label className="flex items-center gap-1.5 rounded-full border border-[#dadce0] dark:border-[#5f6368] bg-white dark:bg-[#2d2d2d] px-3.5 py-2 text-xs font-semibold text-[#3c4043] dark:text-[#e8eaed] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] transition-all cursor-pointer shadow-2xs active:scale-[0.98]">
                <Upload size={15} className="text-[#0284c7]" />
                Import Roadmap
                <input type="file" accept=".json" className="hidden" onChange={handleImport} />
              </label>

              <Link
                href="/studio/roadmap/templates"
                className="flex items-center gap-1.5 rounded-full border border-[#dadce0] dark:border-[#5f6368] bg-white dark:bg-[#2d2d2d] px-3.5 py-2 text-xs font-semibold text-[#3c4043] dark:text-[#e8eaed] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] transition-all shadow-2xs active:scale-[0.98]"
              >
                <Library size={15} className="text-[#a142f4]" />
                Templates
              </Link>

              <Link
                href="/studio/review"
                className="flex items-center gap-1.5 rounded-full border border-[#dadce0] dark:border-[#5f6368] bg-white dark:bg-[#2d2d2d] px-3.5 py-2 text-xs font-semibold text-[#3c4043] dark:text-[#e8eaed] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] transition-all shadow-2xs active:scale-[0.98]"
              >
                <ClipboardCheck size={15} className="text-[#1e8e3e]" />
                Review Queue
              </Link>

              {/* Extended FAB Dropdown Button */}
              <div className="relative">
                <button
                  id="create-content-btn"
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  Create Content
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.95 }}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                        className="absolute right-0 mt-2.5 w-84 bg-white/95 dark:bg-[#202124]/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.22)] border border-[#dadce0]/80 dark:border-[#3c4043] z-40 p-2.5 overflow-hidden"
                        role="menu"
                      >
                        <div className="px-3 py-2 mb-1 flex items-center justify-between border-b border-[#f1f3f4] dark:border-[#303134]">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0284c7] dark:text-[#38bdf8]">
                            Select Content Format
                          </span>
                        </div>

                        <div className="space-y-1">
                          {CONTENT_TYPES.map((type) => {
                            const inner = (
                              <>
                                <div
                                  className={`shrink-0 w-10 h-10 rounded-2xl ${type.bg} flex items-center justify-center border ${type.borderColor} shadow-2xs group-hover:scale-105 transition-transform`}
                                >
                                  <type.icon size={19} className={type.color} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-[#0f172a] dark:text-[#e8eaed] group-hover:text-[#0284c7] dark:group-hover:text-[#38bdf8] transition-colors">
                                      {type.label}
                                    </p>
                                    <ChevronRight
                                      size={14}
                                      className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#0284c7] dark:text-[#38bdf8]"
                                    />
                                  </div>
                                  <p className="text-[11px] text-[#64748b] dark:text-[#9aa0a6] mt-0.5 leading-relaxed line-clamp-2">
                                    {type.desc}
                                  </p>
                                </div>
                              </>
                            );
                            const cls =
                              "group flex items-start gap-3.5 p-3 rounded-2xl transition-all duration-200 cursor-pointer text-left hover:bg-slate-50 dark:hover:bg-[#2d2d2d] border border-transparent hover:border-slate-200 dark:hover:border-slate-700 w-full";

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
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Controls Bar: Framer Motion Liquid Flow Filter Tabs + Status Dropdown + View Switcher */}
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Interactive Framer Motion Tabs with Liquid Flow Pill */}
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
                const count = categoryCounts[tab.id] ?? 0;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedType(tab.id)}
                    className={`relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors whitespace-nowrap active:scale-[0.97] ${
                      active
                        ? "text-white"
                        : "text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#202124] dark:hover:text-[#e8eaed]"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="activeStudioTab"
                        className="absolute inset-0 bg-gradient-to-r from-[#0284c7] to-[#06b6d4] rounded-full shadow-xs"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                    {count > 0 && (
                      <span
                        className={`relative z-10 text-[10px] font-bold px-1.5 py-0.2 rounded-full transition-colors ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-[#e0f2fe] text-[#0284c7] dark:bg-[#0c4a6e] dark:text-[#38bdf8]"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Controls: Status Filter & View Switcher */}
            <div className="flex items-center gap-3">
              {/* Custom Animated Status Filter Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setStatusDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-[#dadce0] dark:border-[#5f6368] bg-white dark:bg-[#202124] px-4 py-2 text-xs font-semibold text-[#3c4043] dark:text-[#e8eaed] hover:bg-[#f8f9fa] dark:hover:bg-[#2d2d2d] shadow-2xs transition-all active:scale-[0.98]"
                >
                  <Filter size={14} className="text-[#0284c7]" />
                  <span>
                    {STATUS_OPTIONS.find((s) => s.id === selectedStatus)?.label ?? "All Statuses"}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 text-gray-400 ${
                      statusDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {statusDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setStatusDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#202124] rounded-2xl shadow-xl border border-[#dadce0] dark:border-[#3c4043] p-1.5 z-40 overflow-hidden"
                      >
                        {STATUS_OPTIONS.map((status) => {
                          const isSelected = selectedStatus === status.id;
                          return (
                            <button
                              key={status.id}
                              type="button"
                              onClick={() => {
                                setSelectedStatus(status.id);
                                setStatusDropdownOpen(false);
                              }}
                              className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                                isSelected
                                  ? "bg-[#e0f2fe] dark:bg-[#0c4a6e]/50 text-[#0284c7] dark:text-[#38bdf8]"
                                  : "text-[#3c4043] dark:text-[#e8eaed] hover:bg-[#f1f3f4] dark:hover:bg-[#2d2d2d]"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                                <span>{status.label}</span>
                              </div>
                              {isSelected && <Check size={14} className="text-[#0284c7] dark:text-[#38bdf8]" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Grid vs List View Toggle */}
              <div className="flex items-center bg-white dark:bg-[#202124] border border-[#dadce0] dark:border-[#5f6368] rounded-lg p-0.5 shadow-2xs">
                <button
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-[#e0f2fe] text-[#0284c7] dark:bg-[#0c4a6e]/50 dark:text-[#38bdf8]"
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
                      ? "bg-[#e0f2fe] text-[#0284c7] dark:bg-[#0c4a6e]/50 dark:text-[#38bdf8]"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <ListIcon size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scrollable Main Content Area ────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        <AnimatePresence mode="wait">
          {loadingItems ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#202124] rounded-[24px] border border-[#dadce0] dark:border-[#3c4043] p-5 animate-pulse"
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
            </motion.div>
          ) : filteredItems.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="flex flex-col items-center justify-center py-20 px-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#e0f2fe] dark:bg-[#0c4a6e]/60 text-[#0284c7] dark:text-[#38bdf8] flex items-center justify-center mb-4 ring-8 ring-[#e0f2fe]/40 dark:ring-[#0c4a6e]/40">
                <FolderOpen size={28} />
              </div>
              <h3 className="text-base font-semibold text-[#202124] dark:text-[#e8eaed]">
                No content found
              </h3>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-1.5 max-w-md leading-relaxed">
                No items match your filter criteria. Click &quot;Create Content&quot; above to create a new course, roadmap or workshop.
              </p>

              {/* Interactive Quick Actions in Empty State */}
              <div className="mt-6 flex items-center gap-3 flex-wrap justify-center">
                <button
                  onClick={() => setDropdownOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold px-5 py-2.5 shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <Plus size={16} /> Create Content
                </button>

                {(searchQuery || selectedType !== "ALL" || selectedStatus !== "ALL") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedType("ALL");
                      setSelectedStatus("ALL");
                    }}
                    className="rounded-full bg-white dark:bg-[#2d2d2d] text-[#5f6368] dark:text-[#9aa0a6] text-xs font-medium px-4 py-2.5 border border-[#dadce0] dark:border-[#5f6368] hover:bg-[#f1f3f4] transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </motion.div>
          ) : viewMode === "grid" ? (
            <motion.div
              key={`grid-${selectedType}-${selectedStatus}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                >
                  <ContentCardGrid
                    item={item}
                    onRename={setRenameTarget}
                    onDelete={setDeleteTarget}
                    onDuplicate={handleDuplicate}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={`list-${selectedType}-${selectedStatus}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="bg-white dark:bg-[#202124] rounded-[24px] border border-[#dadce0] dark:border-[#3c4043] overflow-hidden shadow-2xs"
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
