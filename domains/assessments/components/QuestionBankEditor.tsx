// domains/assessments/components/QuestionBankEditor.tsx
// Sidebar shell for the question bank: sections (topics) on the left — like HTML/CSS/JS inside
// a fullstack course's bank — each holding its own set of questions, editable and (eventually)
// queryable independently. Mirrors the course editor's sidebar interaction pattern (create,
// rename, delete, drag-to-reorder) without depending on it.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Layers,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  createSection,
  deleteSection,
  listSections,
  renameSection,
  reorderSections,
} from "../api";
import type { SectionResponse } from "../types";
import { SectionQuestionsEditor } from "./SectionQuestionsEditor";

interface QuestionBankEditorProps {
  bankId: string;
  className?: string;
}

function SortableSectionRow({
  section,
  active,
  onSelect,
  onRename,
  onDelete,
}: {
  section: SectionResponse;
  active: boolean;
  onSelect: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(section.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const commitRename = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== section.title) onRename(trimmed);
    else setDraft(section.title);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-1 rounded-xl px-2 py-1.5 transition-colors ${
        active ? "bg-[#14142b] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className={`flex-shrink-0 cursor-grab opacity-0 transition-opacity group-hover:opacity-100 ${
          active ? "text-white/60" : "text-slate-400"
        }`}
      >
        <GripVertical size={13} />
      </button>

      {editing ? (
        <input
          ref={inputRef}
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") {
              setDraft(section.title);
              setEditing(false);
            }
          }}
          className="min-w-0 flex-1 rounded-md border border-indigo-300 bg-white px-1.5 py-0.5 text-xs text-gray-800 outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={onSelect}
          onDoubleClick={() => setEditing(true)}
          className="min-w-0 flex-1 truncate text-left text-xs font-semibold"
          title={section.title}
        >
          {section.title}
        </button>
      )}

      <span
        className={`flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
          active ? "bg-white/15 text-white/80" : "bg-gray-100 text-gray-400"
        }`}
      >
        {section.questionCount}
      </span>

      <div
        className={`flex flex-shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100`}
      >
        <button
          type="button"
          title="Rename section"
          onClick={() => setEditing(true)}
          className={`rounded p-1 transition-colors ${
            active ? "text-white/70 hover:bg-white/10 hover:text-white" : "text-gray-400 hover:bg-gray-200 hover:text-gray-700"
          }`}
        >
          <Pencil size={11} />
        </button>
        <button
          type="button"
          title="Delete section"
          onClick={onDelete}
          className={`rounded p-1 transition-colors ${
            active ? "text-white/70 hover:bg-rose-500/80 hover:text-white" : "text-gray-400 hover:bg-red-50 hover:text-red-600"
          }`}
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}

export function QuestionBankEditor({ bankId, className = "" }: QuestionBankEditorProps) {
  const [sections, setSections] = useState<SectionResponse[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listSections(bankId);
      setSections(list);
      setActiveSectionId((current) =>
        current && list.some((s) => s.id === current) ? current : (list[0]?.id ?? null)
      );
    } finally {
      setLoading(false);
    }
  }, [bankId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateSection = async () => {
    setCreating(true);
    try {
      const section = await createSection(bankId, {
        title: `Section ${sections.length + 1}`,
      });
      setSections((prev) => [...prev, section]);
      setActiveSectionId(section.id);
    } finally {
      setCreating(false);
    }
  };

  const handleRename = async (sectionId: string, title: string) => {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, title } : s)));
    try {
      await renameSection(sectionId, title);
    } catch (e) {
      console.warn("Failed to rename section", e);
    }
  };

  const handleDelete = async (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;
    if (
      !window.confirm(
        `Delete "${section.title}"? This removes all ${section.questionCount} question(s) in it. This can't be undone.`
      )
    ) {
      return;
    }
    const next = sections.filter((s) => s.id !== sectionId);
    setSections(next);
    if (activeSectionId === sectionId) setActiveSectionId(next[0]?.id ?? null);
    try {
      await deleteSection(sectionId);
    } catch (e) {
      console.warn("Failed to delete section", e);
      load();
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(sections, oldIndex, newIndex);
    setSections(reordered);
    try {
      await reorderSections(bankId, { sectionIds: reordered.map((s) => s.id) });
    } catch (e) {
      console.warn("Failed to reorder sections", e);
      load();
    }
  };

  const activeSection = sections.find((s) => s.id === activeSectionId) ?? null;

  return (
    <div className={className}>
      {/* ── Canvas: full-bleed, scrolls under the floating chrome ── */}
      <div
        className={`absolute inset-0 overflow-y-auto pt-20 pb-10 pr-6 transition-[padding] ${
          sidebarOpen ? "pl-[300px]" : "pl-16"
        }`}
      >
        {loading ? null : activeSection ? (
          <SectionQuestionsEditor
            key={activeSection.id}
            bankId={bankId}
            sectionId={activeSection.id}
            sectionTitle={activeSection.title}
            className="max-w-[900px]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <Layers size={28} className="text-gray-300" />
            <p className="max-w-xs text-sm text-gray-400">
              Create a section to start adding questions — sections split this bank into topics
              like HTML, CSS, or JS.
            </p>
            <button
              type="button"
              onClick={handleCreateSection}
              className="mt-2 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Plus size={15} />
              Create Section
            </button>
          </div>
        )}
      </div>

      {/* ── Floating collapsible sidebar: sections ── */}
      <aside className="absolute left-3 top-16 z-20 flex sm:left-4">
        {!sidebarOpen ? (
          <button
            type="button"
            title="Expand sidebar"
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/95 text-slate-400 shadow-[0_6px_18px_rgba(20,20,43,0.08)] transition-colors hover:text-[#14142b]"
          >
            <PanelLeftOpen size={18} />
          </button>
        ) : (
          <div className="flex max-h-[calc(100vh-6.5rem)] w-[268px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_16px_40px_rgba(20,20,43,0.1)] backdrop-blur-xl">
            {/* ── Sidebar header ───────────────── */}
            <div className="flex flex-shrink-0 items-center border-b border-slate-100 px-3 py-2.5">
              <span className="min-w-0 flex-1 truncate px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Sections
              </span>
              <button
                type="button"
                title="Collapse sidebar"
                onClick={() => setSidebarOpen(false)}
                className="flex flex-shrink-0 items-center justify-center rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
              >
                <PanelLeftClose size={16} />
              </button>
            </div>

            {/* ── Section list ──────────────────── */}
            <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="animate-spin text-indigo-400" size={18} />
                </div>
              ) : sections.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
                  <Layers size={26} className="text-gray-300" />
                  <p className="text-xs leading-relaxed text-slate-400">
                    No sections yet. Sections group questions by topic — e.g. HTML, CSS, JS.
                  </p>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    {sections.map((section) => (
                      <SortableSectionRow
                        key={section.id}
                        section={section}
                        active={section.id === activeSectionId}
                        onSelect={() => setActiveSectionId(section.id)}
                        onRename={(title) => handleRename(section.id, title)}
                        onDelete={() => handleDelete(section.id)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>

            {/* ── Footer ────────────────────────── */}
            <div className="flex-shrink-0 border-t border-slate-100 bg-slate-50/60 p-2">
              <button
                type="button"
                onClick={handleCreateSection}
                disabled={creating}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-[#14142b] transition-colors hover:bg-white disabled:opacity-50"
              >
                {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Create Section
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
