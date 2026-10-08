// app/(authenticated)/trash/page.tsx
// Personal Trash — restore soft-deleted courses or permanently delete them.
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/infrastructure/http/api";
import type { CourseResponse } from "@/shared/types/api.types";
import { ArrowLeft, Trash2, RotateCcw, X } from "lucide-react";

function deletedAgo(iso?: string | null): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return `Deleted ${days} day${days === 1 ? "" : "s"} ago`;
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 1) return `Deleted ${hours} hour${hours === 1 ? "" : "s"} ago`;
  const mins = Math.max(1, Math.floor(ms / 60_000));
  return `Deleted ${mins} minute${mins === 1 ? "" : "s"} ago`;
}

// Type-to-confirm modal for permanent deletion.
function PermanentDeleteModal({
  course,
  onClose,
  onDeleted,
}: {
  course: CourseResponse;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canDelete = confirmText === course.title && !deleting;

  async function handleDelete() {
    if (!canDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await api.delete(`/api/courses/${course.id}/permanent`, { confirmTitle: confirmText });
      onDeleted(course.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 arcade-modal-backdrop" onClick={onClose} />
      <div className="relative w-full max-w-md arcade-modal-box rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-tl-lg rounded-br-lg rounded-tr-xs rounded-bl-xs p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink transition-colors cursor-pointer dark:hover:bg-slate-800"
        >
          <X size={18} />
        </button>
        <h3 className="text-base font-bold text-ink">Permanently delete course</h3>
        <p className="mt-1 text-sm text-slate-500">
          This <span className="font-medium text-rose-500">cannot be undone</span>. The course and all of its
          modules, lessons, and drafts will be permanently removed.
        </p>
        <label className="mt-4 block text-sm font-semibold text-ink">
          To confirm, type <span className="text-rose-500">{course.title}</span> below:
        </label>
        <input
          type="text"
          autoFocus
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={course.title}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-ink/30 focus:bg-surface focus:ring-4 focus:ring-slate-200/60"
        />
        {error && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-ink transition-colors cursor-pointer dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canDelete}
            onClick={handleDelete}
            className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {deleting ? "Deleting…" : "Delete permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TrashPage() {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [purgeTarget, setPurgeTarget] = useState<CourseResponse | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<CourseResponse[]>("/api/trash")
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  async function restore(id: string) {
    setRestoringId(id);
    try {
      await api.post(`/api/courses/${id}/restore`, {});
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      console.error("Restore failed", e);
      setRestoringId(null);
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      {purgeTarget && (
        <PermanentDeleteModal
          course={purgeTarget}
          onClose={() => setPurgeTarget(null)}
          onDeleted={(id) => {
            setCourses((prev) => prev.filter((c) => c.id !== id));
            setPurgeTarget(null);
          }}
        />
      )}

      <header className="border-b border-gray-200 bg-surface px-8 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <Link
              href="/"
              className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={13} />
              Back to dashboard
            </Link>
            <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <Trash2 size={18} className="text-gray-500" />
              Trash
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Restore a course, or delete it permanently.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-8 py-8">
        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
              <Trash2 size={24} className="text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Your trash is empty</p>
              <p className="mt-1 text-xs text-gray-400">
                Deleted courses will show up here.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-surface p-5"
              >
                <div>
                  <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-800">
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">
                      {course.description}
                    </p>
                  )}
                </div>
                <p className="mt-auto text-xs text-gray-400">{deletedAgo(course.deletedAt)}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={restoringId === course.id}
                    onClick={() => restore(course.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-50 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 disabled:opacity-60 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/15"
                  >
                    <RotateCcw size={12} />
                    {restoringId === course.id ? "Restoring…" : "Restore"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPurgeTarget(course)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-50 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/15"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
