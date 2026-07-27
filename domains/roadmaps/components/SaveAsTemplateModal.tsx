'use client';

import React, { useState } from "react";
import { X, Save } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/shared/design-system/ui/dialog";
import { Button } from "@/shared/design-system/ui/button";
import { Input } from "@/shared/design-system/ui/input";
import { Textarea } from "@/shared/design-system/ui/textarea";
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
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-6 bg-white overflow-hidden" showCloseButton={false}>
        <Button variant="ghost" size="icon" type="button" onClick={onClose} className="absolute right-4 top-4 h-8 w-8 text-gray-400 hover:text-gray-600">
          <X size={18} />
        </Button>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
            <Save size={20} className="text-indigo-600" />
          </div>
          <div>
            <DialogTitle className="text-base font-semibold text-gray-900">Save as Template</DialogTitle>
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
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tags (press Enter to add)</label>
            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="e.g. basics, core..." />
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
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!name.trim() || saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {saving ? "Saving…" : "Save Template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
