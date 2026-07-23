// app/(authenticated)/studio/page.tsx
// Post-login dashboard home — Create Content + unified content grid (courses + roadmaps).
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/infrastructure/http/api";
import { roadmapService } from "@/domains/roadmaps";
import {
  BookOpen,
  Wrench,
  Radio,
  FileText,
  Plus,
  ChevronDown,
  Clock,
  GraduationCap,
  Trash2,
  X,
  Map,
  ClipboardCheck,
  Library,
  Upload,
  MoreVertical,
  Pencil,
  Copy,
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
    color: "text-fuchsia-600",
    bg: "bg-fuchsia-50",
  },
  {
    id: "workshop",
    icon: Wrench,
    label: "Workshop / Bootcamp",
    desc: "Flexible sessions with videos, activities & resources",
    href: "/studio/workshop/new",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    id: "webinar",
    icon: Radio,
    label: "Webinar",
    desc: "Live session with Zoom link, date & time",
    href: "/studio/webinar/new",
    color: "text-blue-600",
    bg: "bg-blue-50",
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
] as const;

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "bg-yellow-50 text-yellow-700 border-yellow-200",
    SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200",
    PUBLISHED: "bg-green-50 text-green-700 border-green-200",
    ARCHIVED: "bg-gray-100 text-gray-500 border-gray-200",
  };
  const key = status.toUpperCase();
  return (
    <span
      className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${map[key] ?? "bg-gray-100 text-gray-500 border-gray-200"
        }`}
    >
      {key}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const isRoadmap = type === "ROADMAP";
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isRoadmap
          ? "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200"
          : "bg-indigo-50 text-indigo-700 border-indigo-200"
        }`}
    >
      {isRoadmap ? <Map size={10} /> : <BookOpen size={10} />}
      {isRoadmap ? "Roadmap" : "Course"}
    </span>
  );
}

// ── New Course creation modal ───────────────────────────────────────────────────

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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
            <BookOpen size={20} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">New Course</h3>
            <p className="text-xs text-gray-500">Give it a name to get started.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="course-name" className="mb-1 block text-sm font-medium text-gray-700">
              Course name <span className="text-red-500">*</span>
            </label>
            <input
              id="course-name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Intro to Spring Boot"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label htmlFor="course-desc" className="mb-1 block text-sm font-medium text-gray-700">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              id="course-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will learners get out of this course?"
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || creating}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fuchsia-50">
            <Map size={20} className="text-fuchsia-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">New Roadmap</h3>
            <p className="text-xs text-gray-500">Give it a title to get started.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="roadmap-title" className="mb-1 block text-sm font-medium text-gray-700">
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-300"
            />
          </div>
          <div>
            <label htmlFor="roadmap-desc" className="mb-1 block text-sm font-medium text-gray-700">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              id="roadmap-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will learners achieve?"
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-300"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || creating}
              className="rounded-lg bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fuchsia-700 disabled:opacity-60"
            >
              {creating ? "Creating…" : "Create Roadmap"}
            </button>
          </div>
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fuchsia-50">
            <Pencil size={20} className="text-fuchsia-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">Rename Roadmap</h3>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label htmlFor="rename-title" className="mb-1 block text-sm font-medium text-gray-700">
              Roadmap Title <span className="text-red-500">*</span>
            </label>
            <input
              id="rename-title"
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-300"
            />
          </div>
          <div>
            <label htmlFor="rename-desc" className="mb-1 block text-sm font-medium text-gray-700">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              id="rename-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-300"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || updating}
              className="rounded-lg bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fuchsia-700 disabled:opacity-60"
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
            <Trash2 size={20} className="text-red-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">Delete Roadmap</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete <strong>{item.title}</strong>? This action cannot be
          undone.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
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
  const editHref = isRoadmap ? `/studio/roadmap/${item.id}/edit` : `/studio/course/${item.id}/edit`;

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all p-5 flex flex-col gap-3 relative">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
          {item.title}
        </h3>
        {isRoadmap && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onRename(item);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                  >
                    <Pencil size={14} /> Rename
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDuplicate(item);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                  >
                    <Copy size={14} /> Duplicate
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(item);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
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
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>
      )}
      <div className="flex items-center gap-2">
        <TypeBadge type={item.type} />
        <StatusBadge status={item.status} />
      </div>
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-auto">
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
      <Link
        href={editHref}
        className="text-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg py-1.5 transition-colors"
      >
        {isRoadmap ? "Open Studio" : "Continue Editing"}
      </Link>
    </div>
  );
}

// ── Dashboard page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState<"course" | "roadmap" | null>(null);
  const [items, setItems] = useState<ContentSummary[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

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

  return (
    <div className="flex-1 flex flex-col">
      {createOpen === "course" && <CreateCourseModal onClose={() => setCreateOpen(null)} />}
      {createOpen === "roadmap" && <CreateRoadmapModal onClose={() => setCreateOpen(null)} />}
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

      {/* ── Header bar ──────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Content Studio</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Create and manage your educational content
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800 cursor-pointer">
              <Upload size={16} />
              Import Roadmap
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
            <Link
              href="/studio/roadmap/templates"
              title="Roadmap Templates"
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
            >
              <Library size={16} />
              Templates
            </Link>
            <Link
              href="/studio/review"
              title="Review Courses"
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
            >
              <ClipboardCheck size={16} />
              Review Courses
            </Link>
            <Link
              href="/trash"
              title="Trash"
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
            >
              <Trash2 size={16} />
              Trash
            </Link>

            {/* Create Content button + Canva-style dropdown */}
            <div className="relative">
              <button
                id="create-content-btn"
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors"
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
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                  {/* Dropdown panel */}
                  <div
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-40 overflow-hidden"
                    role="menu"
                  >
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Select content type
                      </p>
                    </div>
                    {CONTENT_TYPES.map((type) => {
                      const inner = (
                        <>
                          <div
                            className={`flex-shrink-0 w-9 h-9 rounded-lg ${type.bg} flex items-center justify-center mt-0.5`}
                          >
                            <type.icon size={17} className={type.color} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{type.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                              {type.desc}
                            </p>
                          </div>
                        </>
                      );
                      const cls =
                        "flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors w-full text-left";
                      // "Course" and "Roadmap" open creation modals; other types navigate (stubs for now).
                      return type.id === "course" || type.id === "roadmap" ? (
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

      {/* ── My Content section ─────────────────────────────────────────────── */}
      <main className="flex-1 px-8 py-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2 mb-5">
          <GraduationCap size={17} className="text-indigo-500" />
          <h2 className="text-base font-semibold text-gray-800">My Content</h2>
        </div>

        {loadingItems ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
                <div className="h-4 bg-gray-100 rounded mb-3 w-2/3" />
                <div className="h-3 bg-gray-50 rounded mb-2 w-full" />
                <div className="h-3 bg-gray-50 rounded mb-4 w-3/4" />
                <div className="flex justify-between items-center">
                  <div className="h-5 w-14 bg-gray-100 rounded-full" />
                  <div className="h-7 w-24 bg-gray-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <BookOpen size={24} className="text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">No content yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Click &quot;Create Content&quot; to build your first course or roadmap.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
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
      </main>
    </div>
  );
}
