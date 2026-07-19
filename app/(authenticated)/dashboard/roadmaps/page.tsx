"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Map, Plus, Clock, MoreVertical, Pencil, Trash2, Copy, X, Library, Upload } from "lucide-react";
import { roadmapService } from "@/domains/roadmaps";
import type { RoadmapData } from "@/domains/roadmaps";

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
      router.push(`/dashboard/roadmaps/${roadmap.id}/edit`);
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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
            <Map size={20} className="text-indigo-600" />
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300"
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
              disabled={!title.trim() || creating}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
            >
              {creating ? "Creating…" : "Create Roadmap"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RenameRoadmapModal({ roadmap, onClose, onUpdated }: { roadmap: RoadmapData; onClose: () => void; onUpdated: () => void }) {
  const [title, setTitle] = useState(roadmap.title);
  const [description, setDescription] = useState(roadmap.description || "");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setUpdating(true);
    setError(null);
    try {
      await roadmapService.updateRoadmap(roadmap.id, {
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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
            <Pencil size={20} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Rename Roadmap</h3>
          </div>
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300"
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
              disabled={!title.trim() || updating || (title === roadmap.title && description === (roadmap.description || ""))}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
            >
              {updating ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteRoadmapModal({ roadmap, onClose, onDeleted }: { roadmap: RoadmapData; onClose: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await roadmapService.deleteRoadmap(roadmap.id);
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
          <div>
            <h3 className="text-base font-semibold text-gray-900">Delete Roadmap</h3>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete <strong>{roadmap.title}</strong>? This action cannot be undone. Lessons will not be deleted.
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

function RoadmapCard({
  roadmap,
  onRename,
  onDelete,
  onDuplicate,
}: {
  roadmap: RoadmapData;
  onRename: (roadmap: RoadmapData) => void;
  onDelete: (roadmap: RoadmapData) => void;
  onDuplicate: (roadmap: RoadmapData) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  
  let nodeCount = 0;
  let edgeCount = 0;
  try {
    if (roadmap.graphJson) {
      const parsed = JSON.parse(roadmap.graphJson);
      nodeCount = parsed.nodes?.length || 0;
      edgeCount = parsed.edges?.length || 0;
    }
  } catch (e) {
    // Ignore
  }

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all p-5 flex flex-col gap-3 relative">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
          {roadmap.title}
        </h3>
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
                  onClick={() => { setMenuOpen(false); onRename(roadmap); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                >
                  <Pencil size={14} /> Rename
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDuplicate(roadmap); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                >
                  <Copy size={14} /> Duplicate
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(roadmap); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {roadmap.description && (
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {roadmap.description}
        </p>
      )}
      <div className="flex gap-3 text-xs text-gray-500 font-medium">
        <span>{nodeCount} Nodes</span>
        <span>•</span>
        <span>{edgeCount} Connections</span>
      </div>
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
        <div className="flex flex-col text-[10px] text-gray-400">
          <span>By {roadmap.createdByName}</span>
          <span className="flex items-center gap-1 mt-0.5">
            <Clock size={10} />
            {new Date(roadmap.updatedAt).toLocaleDateString()}
          </span>
        </div>
        <Link
          href={`/dashboard/roadmaps/${roadmap.id}/edit`}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-3 py-1.5 transition-colors"
        >
          Open Studio
        </Link>
      </div>
    </div>
  );
}

export default function RoadmapsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [roadmaps, setRoadmaps] = useState<RoadmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [renameTarget, setRenameTarget] = useState<RoadmapData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoadmapData | null>(null);

  const fetchRoadmaps = () => {
    setLoading(true);
    roadmapService
      .getAllRoadmaps()
      .then((data) => {
        setRoadmaps(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const handleDuplicate = async (roadmap: RoadmapData) => {
    try {
      await roadmapService.duplicateRoadmap(roadmap.id);
      fetchRoadmaps();
    } catch (e) {
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
        fetchRoadmaps();
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="flex-1 flex flex-col">
      {createOpen && <CreateRoadmapModal onClose={() => setCreateOpen(false)} />}
      {renameTarget && (
        <RenameRoadmapModal 
          roadmap={renameTarget} 
          onClose={() => setRenameTarget(null)} 
          onUpdated={() => {
            setRenameTarget(null);
            fetchRoadmaps();
          }} 
        />
      )}
      {deleteTarget && (
        <DeleteRoadmapModal 
          roadmap={deleteTarget} 
          onClose={() => setDeleteTarget(null)} 
          onDeleted={() => {
            setDeleteTarget(null);
            fetchRoadmaps();
          }} 
        />
      )}

      <header className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
             </Link>
             <div>
              <h1 className="text-xl font-bold text-gray-900">Roadmaps</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage interactive roadmaps before embedding them into lessons
              </p>
             </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer">
              <Upload size={16} />
              Import JSON
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
            <Link
              href="/dashboard/roadmaps/templates"
              className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <Library size={16} />
              Template Library
            </Link>
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors"
            >
              <Plus size={16} />
              Create Roadmap
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-8 py-8 max-w-6xl mx-auto w-full">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse h-36">
                <div className="h-4 bg-gray-100 rounded mb-3 w-2/3" />
                <div className="h-3 bg-gray-50 rounded mb-2 w-full" />
                <div className="h-3 bg-gray-50 rounded mb-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md mx-auto mt-10">
             <p className="text-red-700 mb-4">{error}</p>
             <button onClick={fetchRoadmaps} className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-medium text-sm hover:bg-red-200">
               Retry
             </button>
          </div>
        ) : roadmaps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Map size={24} className="text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">No roadmaps yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Click &quot;Create Roadmap&quot; to build your first learning path.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {roadmaps.map((roadmap) => (
              <RoadmapCard 
                key={roadmap.id} 
                roadmap={roadmap} 
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
