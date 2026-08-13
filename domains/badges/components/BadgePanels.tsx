"use client";

import { Eye, EyeOff, Trash2, Lock, Palette, SlidersHorizontal, Layers as LayersIcon } from "lucide-react";
import type { BadgeEditorPanel, BadgeEditorState } from "../hooks/useBadgeEditor";

/**
 * Content for the "Design" / "Properties" / "Layers" tabs of the shared Studio
 * right sidebar (EditorRightSidebar) when a Badge is the active editor. These
 * are pure content — the tab switcher, panel chrome (glass card, sizing,
 * open/close), and position are all owned by EditorRightSidebar itself, the
 * same shell the Lesson editor's Status/History/Team tabs render inside.
 */

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
      {children}
    </div>
  );
}

export function BadgeDesignPanel({ editor }: { editor: BadgeEditorState }) {
  if (!editor.doc || !editor.shape) return null;
  const { doc, shape } = editor;

  return (
    <div className="space-y-4">
      <PanelSection title="Background">
        {doc.background.type === "solid" ? (
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input
              type="color"
              value={doc.background.value}
              onChange={(e) => editor.updateBackground(e.target.value)}
              className="h-7 w-7 cursor-pointer rounded border border-white/60 bg-transparent p-0"
            />
            {doc.background.value}
          </label>
        ) : (
          <p className="text-xs text-slate-400">Gradient/image backgrounds — coming soon.</p>
        )}
      </PanelSection>
      <PanelSection title="Shape">
        <p className="text-xs text-slate-600">{shape.name}</p>
      </PanelSection>
      <PanelSection title="Canvas">
        <p className="text-xs text-slate-600">
          {doc.canvas.width} × {doc.canvas.height}
        </p>
      </PanelSection>
    </div>
  );
}

export function BadgePropertiesPanel({ editor }: { editor: BadgeEditorState }) {
  const obj = editor.selectedObject;

  if (!obj) {
    return <p className="text-xs italic text-slate-400">Select an object to edit its properties.</p>;
  }
  if (obj.type !== "text") {
    return <p className="text-xs italic text-slate-400">{obj.type} properties — coming soon.</p>;
  }

  return (
    <div className="space-y-4">
      <PanelSection title="Text">
        <textarea
          value={obj.text}
          onChange={(e) => editor.updateSelected({ text: e.target.value })}
          rows={2}
          className="w-full resize-none rounded-xl border border-white/50 bg-white/60 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#14142b]/30"
        />
      </PanelSection>
      <PanelSection title="Font size">
        <input
          type="number"
          value={obj.fontSize}
          onChange={(e) => editor.updateSelected({ fontSize: Number(e.target.value) || 1 })}
          className="w-20 rounded-xl border border-white/50 bg-white/60 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#14142b]/30"
        />
      </PanelSection>
      <PanelSection title="Color">
        <input
          type="color"
          value={obj.color}
          onChange={(e) => editor.updateSelected({ color: e.target.value })}
          className="h-7 w-7 cursor-pointer rounded border border-white/60 bg-transparent p-0"
        />
      </PanelSection>
      <PanelSection title="Align">
        <div className="flex gap-1">
          {(["left", "center", "right"] as const).map((align) => (
            <button
              key={align}
              type="button"
              onClick={() => editor.updateSelected({ align })}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize ${
                obj.align === align ? "bg-[#14142b] text-white" : "bg-white/60 text-slate-500 hover:bg-white"
              }`}
            >
              {align}
            </button>
          ))}
        </div>
      </PanelSection>
    </div>
  );
}

export function BadgeLayersPanel({ editor }: { editor: BadgeEditorState }) {
  if (!editor.doc) return null;
  const objects = editor.doc.objects.slice().sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="space-y-1">
      {objects.map((obj) => (
        <div
          key={obj.id}
          className={`group flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs ${
            editor.selectedId === obj.id ? "bg-[#14142b] text-white" : "text-slate-600 hover:bg-white/60"
          }`}
        >
          <button type="button" onClick={() => editor.toggleVisibility(obj.id)} className="flex-shrink-0 opacity-60 hover:opacity-100">
            {obj.visible ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
          <button type="button" onClick={() => editor.handleSelect(obj.id)} className="min-w-0 flex-1 truncate text-left">
            {obj.type === "text" ? obj.text || "Text" : obj.type}
          </button>
          <button
            type="button"
            onClick={() => editor.deleteObject(obj.id)}
            className="flex-shrink-0 opacity-0 hover:text-red-400 group-hover:opacity-60"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      {objects.length === 0 && <p className="px-2 text-xs text-slate-400">No objects yet.</p>}
      <div className="mt-2 flex items-center gap-1.5 border-t border-white/50 px-2 pt-2 text-xs text-slate-400">
        <Lock size={12} />
        Badge Frame
      </div>
    </div>
  );
}

const CONTEXT_TABS: { id: BadgeEditorPanel; label: string; icon: typeof LayersIcon }[] = [
  { id: "design", label: "Design", icon: Palette },
  { id: "properties", label: "Properties", icon: SlidersHorizontal },
  { id: "layers", label: "Layers", icon: LayersIcon },
];

/**
 * Everything the sidebar shows while a Badge is the active editor: a small tab
 * strip (Design/Properties/Layers) plus the selected tab's content — self-
 * contained so EditorRightSidebar itself stays generic (it just renders
 * whatever `editorContextNode` it's given, same as it already did for the
 * Lesson-only Status/History/Team tabs before this existed). Layers lives here
 * rather than behind a toolbar toggle, so it's reachable directly from the
 * sidebar the same way Design/Properties are.
 */
export function BadgeEditorContextPanel({ editor }: { editor: BadgeEditorState }) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center gap-1 rounded-full border border-white/40 bg-white/60 p-1">
        {CONTEXT_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => editor.setActivePanel(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-1.5 text-xs font-semibold transition-colors ${
              editor.activePanel === id ? "bg-[#14142b] text-white shadow-sm" : "text-slate-500 hover:text-[#14142b]"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1">
        {editor.activePanel === "properties" ? (
          <BadgePropertiesPanel editor={editor} />
        ) : editor.activePanel === "layers" ? (
          <BadgeLayersPanel editor={editor} />
        ) : (
          <BadgeDesignPanel editor={editor} />
        )}
      </div>
    </div>
  );
}

