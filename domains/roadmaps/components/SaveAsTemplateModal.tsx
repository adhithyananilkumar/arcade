import React, { useState } from "react";
import { X, Save } from "lucide-react";
import { roadmapTemplateService } from "../services/template";

export const CATEGORIES = [
  "Programming", "Web Development", "Mobile", "Cloud", "DevOps", 
  "Data Science", "Cyber Security", "Aptitude", "Interview Preparation", "Custom"
];
export const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

interface SaveAsTemplateModalProps {
  roadmapId: string;
  defaultName: string;
  defaultDescription?: string;
  onClose: () => void;
  onSaved: () => void;
}

export function SaveAsTemplateModal({ roadmapId, defaultName, defaultDescription, onClose, onSaved }: SaveAsTemplateModalProps) {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState(defaultDescription || "");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (t: string) => {
    setTags(tags.filter((tag) => tag !== t));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await roadmapTemplateService.createFromRoadmap(roadmapId, {
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        difficulty,
        tags,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save template");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
            <Save size={20} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Save as Template</h3>
            <p className="text-xs text-gray-500">Create a reusable learning path template.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Template Name <span className="text-red-500">*</span></label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300">
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tags (press Enter to add)</label>
            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300" placeholder="e.g. basics, core..." />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(t => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                    {t} <button type="button" onClick={() => removeTag(t)} className="text-gray-400 hover:text-gray-600"><X size={12} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={!name.trim() || saving} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60">
              {saving ? "Saving…" : "Save Template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
