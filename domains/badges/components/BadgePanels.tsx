"use client";

import { useState, createContext, useContext, useEffect } from "react";
import { Eye, EyeOff, Trash2, Lock, Palette, SlidersHorizontal, Layers as LayersIcon, ChevronRight, GripVertical, Pencil } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import type { BadgeEditorPanel, BadgeEditorState } from "../hooks/useBadgeEditor";
import type { BadgeBackground, BadgeBorderStyle, BadgePatternKind } from "..";

function StaticPanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 mt-3 px-1">
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
      {children}
    </div>
  );
}

function PanelSection({ title, children, defaultOpen = false, isOpen: controlledIsOpen, onToggle }: { title: string; children: React.ReactNode; defaultOpen?: boolean; isOpen?: boolean; onToggle?: () => void }) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  return (
    <div className="border-b border-white/40 last:border-b-0">
      <button
        type="button"
        onClick={() => onToggle ? onToggle() : setInternalIsOpen(!internalIsOpen)}
        className="flex w-full items-center gap-2 py-2.5 px-1 text-left hover:bg-white/40 transition-colors"
      >
        <ChevronRight size={14} className={`text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</span>
      </button>
      {isOpen && <div className="pb-3 pt-1 px-1 pl-7">{children}</div>}
    </div>
  );
}

function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-2 text-xs text-slate-600">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-7 cursor-pointer rounded border border-white/60 bg-transparent p-0"
      />
      {value}
    </label>
  );
}

function NumberField({ value, onChange, min, max, step, width = "w-20" }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; width?: string }) {
  const [localValue, setLocalValue] = useState<string>(String(value));

  useEffect(() => {
    setLocalValue((prev) => {
      const parsed = Number(prev);
      if (parsed === value) return prev;
      if (prev === "" && value === 0) return prev;
      if (prev === "-" && value === 0) return prev;
      return String(value);
    });
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    
    if (val === "" || val === "-") {
      onChange(0);
      return;
    }
    
    const parsed = Number(val);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    let finalValue = value;
    if (min !== undefined && finalValue < min) finalValue = min;
    if (max !== undefined && finalValue > max) finalValue = max;
    
    if (finalValue !== value) {
      onChange(finalValue);
    }
    setLocalValue(String(finalValue));
  };

  return (
    <input
      type="number"
      value={localValue}
      min={min}
      max={max}
      step={step}
      onChange={handleChange}
      onBlur={handleBlur}
      className={`${width} min-w-0 rounded-xl border border-white/50 bg-white/60 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#14142b]/30`}
    />
  );
}

function SegmentedField<T extends string>({ value, options, onChange }: { value: T; options: readonly T[]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize ${
            value === opt ? "bg-[#14142b] text-white" : "bg-white/60 text-slate-500 hover:bg-white"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

const BACKGROUND_TYPES = ["solid", "gradient", "radialGradient", "pattern", "image"] as const;
const BACKGROUND_LABELS: Record<(typeof BACKGROUND_TYPES)[number], string> = {
  solid: "Solid",
  gradient: "Linear",
  radialGradient: "Radial",
  pattern: "Pattern",
  image: "Image",
};
const PATTERN_KINDS: BadgePatternKind[] = ["dots", "grid", "diagonalLines", "hexGrid"];

function BackgroundSection({ editor }: { editor: BadgeEditorState }) {
  const doc = editor.doc!;
  const bg = doc.background;

  const switchType = (type: (typeof BACKGROUND_TYPES)[number]) => {
    const next: BadgeBackground =
      type === "solid"
        ? { type: "solid", value: "#0B3D36" }
        : type === "gradient"
          ? { type: "gradient", angle: 45, stops: [{ offset: 0, color: "#00C2A8" }, { offset: 1, color: "#7C3AED" }] }
          : type === "radialGradient"
            ? { type: "radialGradient", cx: 0.5, cy: 0.5, radius: 0.7, stops: [{ offset: 0, color: "#00C2A8" }, { offset: 1, color: "#0B3D36" }] }
            : type === "pattern"
              ? { type: "pattern", pattern: "dots", color: "#FFFFFF", opacity: 0.15, scale: 1, rotation: 0 }
              : { type: "image", src: "", fit: "cover" };
    editor.updateBackground(next);
  };

  return (
    <PanelSection 
      title="Background" 
      isOpen={editor.openDesignSections.background} 
      onToggle={() => editor.setOpenDesignSections(prev => ({ ...prev, background: !prev.background }))}
    >
      <div className="mb-2 flex flex-wrap gap-1">
        {BACKGROUND_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => switchType(t)}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium ${
              bg.type === t ? "bg-[#14142b] text-white" : "bg-white/60 text-slate-500 hover:bg-white"
            }`}
          >
            {BACKGROUND_LABELS[t]}
          </button>
        ))}
      </div>

      {bg.type === "solid" && <ColorField value={bg.value} onChange={(value) => editor.updateBackground({ ...bg, value })} />}

      {bg.type === "gradient" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-16 text-[11px] text-slate-500">Angle</span>
            <NumberField value={bg.angle} onChange={(angle) => editor.updateBackground({ ...bg, angle })} min={0} max={360} />
          </div>
          {bg.stops.map((stop, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-16 text-[11px] text-slate-500">Stop {i + 1}</span>
              <ColorField
                value={stop.color}
                onChange={(color) =>
                  editor.updateBackground({ ...bg, stops: bg.stops.map((s, si) => (si === i ? { ...s, color } : s)) })
                }
              />
            </div>
          ))}
        </div>
      )}

      {bg.type === "radialGradient" && (
        <div className="space-y-2">
          {bg.stops.map((stop, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-16 text-[11px] text-slate-500">Stop {i + 1}</span>
              <ColorField
                value={stop.color}
                onChange={(color) =>
                  editor.updateBackground({ ...bg, stops: bg.stops.map((s, si) => (si === i ? { ...s, color } : s)) })
                }
              />
            </div>
          ))}
        </div>
      )}

      {bg.type === "pattern" && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {PATTERN_KINDS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => editor.updateBackground({ ...bg, pattern: p })}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize ${
                  bg.pattern === p ? "bg-[#14142b] text-white" : "bg-white/60 text-slate-500 hover:bg-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-16 text-[11px] text-slate-500">Color</span>
            <ColorField value={bg.color} onChange={(color) => editor.updateBackground({ ...bg, color })} />
          </div>
        </div>
      )}

      {bg.type === "image" && (
        <p className="text-xs text-slate-400">Use the toolbar's Image tool to upload, then set it as background from Layers — dedicated background image upload lands in a follow-up pass.</p>
      )}
    </PanelSection>
  );
}

const BORDER_TYPES = ["solid", "gradient"] as const;

function FrameSection({ editor }: { editor: BadgeEditorState }) {
  const border = editor.doc!.border;
  
  const switchType = (type: "solid" | "gradient") => {
    if (type === "solid") {
      editor.updateBorder({ type: "solid", color: border.color || "#16C7A3" });
    } else {
      editor.updateBorder({ 
        type: "gradient", 
        angle: border.angle || 45, 
        stops: border.stops?.length ? border.stops : [{ offset: 0, color: "#00C2A8" }, { offset: 1, color: "#7C3AED" }] 
      });
    }
  };

  return (
    <PanelSection 
      title="Frame" 
      isOpen={editor.openDesignSections.frame} 
      onToggle={() => editor.setOpenDesignSections(prev => ({ ...prev, frame: !prev.frame }))}
    >
      <div className="space-y-2.5">
        <div className="mb-2 flex flex-wrap gap-1">
          {BORDER_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => switchType(t)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize ${
                border.type === t ? "bg-[#14142b] text-white" : "bg-white/60 text-slate-500 hover:bg-white"
              }`}
            >
              {t === "gradient" ? "Linear" : "Solid"}
            </button>
          ))}
        </div>

        {border.type === "solid" && (
          <div className="flex items-center gap-2">
            <span className="w-16 text-[11px] text-slate-500">Color</span>
            <ColorField value={border.color} onChange={(color) => editor.updateBorder({ color })} />
          </div>
        )}

        {border.type === "gradient" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-16 text-[11px] text-slate-500">Angle</span>
              <NumberField value={border.angle} onChange={(angle) => editor.updateBorder({ angle })} min={0} max={360} />
            </div>
            {border.stops.map((stop, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-16 text-[11px] text-slate-500">Stop {i + 1}</span>
                <ColorField
                  value={stop.color}
                  onChange={(color) =>
                    editor.updateBorder({ stops: border.stops.map((s, si) => (si === i ? { ...s, color } : s)) })
                  }
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="w-16 text-[11px] text-slate-500">Width</span>
          <NumberField value={border.width} onChange={(width) => editor.updateBorder({ width })} min={1} max={24} />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-16 text-[11px] text-slate-500">Opacity</span>
          <NumberField value={Math.round(border.opacity * 100)} onChange={(v) => editor.updateBorder({ opacity: v / 100 })} min={0} max={100} />
        </div>
      </div>
    </PanelSection>
  );
}

export function BadgeDesignPanel({ editor }: { editor: BadgeEditorState }) {
  if (!editor.doc || !editor.shape) return null;
  const { doc, shape } = editor;

  return (
    <div>
      <BackgroundSection editor={editor} />
      <FrameSection editor={editor} />
      <StaticPanelSection title="Shape">
        <p className="text-xs text-slate-600">{shape.name}</p>
      </StaticPanelSection>
      <StaticPanelSection title="Canvas">
        <p className="text-xs text-slate-600">
          {doc.canvas.width} × {doc.canvas.height}
        </p>
      </StaticPanelSection>
    </div>
  );
}

function TransformSection({ editor }: { editor: BadgeEditorState }) {
  const obj = editor.selectedObject!;
  return (
    <PanelSection title="Transform">
      <div className="grid grid-cols-2 gap-2">
        <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="w-4">X</span>
          <NumberField value={Math.round(obj.x)} onChange={(x) => editor.updateSelected({ x })} width="flex-1" />
        </label>
        <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="w-4">Y</span>
          <NumberField value={Math.round(obj.y)} onChange={(y) => editor.updateSelected({ y })} width="flex-1" />
        </label>
        <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="w-4">W</span>
          <NumberField value={Math.round(obj.width)} onChange={(width) => editor.updateSelected({ width })} width="flex-1" min={1} />
        </label>
        <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="w-4">H</span>
          <NumberField value={Math.round(obj.height)} onChange={(height) => editor.updateSelected({ height })} width="flex-1" min={1} />
        </label>
        <label className="col-span-2 flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="w-16">Rotation</span>
          <NumberField value={Math.round(obj.rotation)} onChange={(rotation) => editor.updateSelected({ rotation })} width="flex-1" />
        </label>
      </div>
    </PanelSection>
  );
}

function AppearanceSection({ editor }: { editor: BadgeEditorState }) {
  const obj = editor.selectedObject!;
  return (
    <PanelSection title="Appearance">
      <div className="flex items-center gap-2">
        <span className="w-16 text-[11px] text-slate-500">Opacity</span>
        <NumberField
          value={Math.round(obj.opacity * 100)}
          onChange={(v) => editor.updateSelected({ opacity: Math.max(0, Math.min(1, v / 100)) })}
          min={0}
          max={100}
        />
      </div>
    </PanelSection>
  );
}

export function BadgePropertiesPanel({ editor }: { editor: BadgeEditorState }) {
  const obj = editor.selectedObject;

  if (!obj) {
    return <p className="text-xs italic text-slate-400">Select an object to edit its properties.</p>;
  }

  return (
    <div>
      {obj.type === "text" && (
        <>
          <PanelSection title="Text" defaultOpen>
            <textarea
              value={obj.text}
              onChange={(e) => editor.updateSelected({ text: e.target.value })}
              rows={2}
              className="w-full resize-none rounded-xl border border-white/50 bg-white/60 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#14142b]/30"
            />
          </PanelSection>
          <PanelSection title="Typography" defaultOpen>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="w-12">Size</span>
                  <NumberField value={obj.fontSize} onChange={(fontSize) => editor.updateSelected({ fontSize })} min={1} width="flex-1" />
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="w-12">Weight</span>
                  <NumberField value={obj.fontWeight} onChange={(fontWeight) => editor.updateSelected({ fontWeight })} min={100} max={900} step={100} width="flex-1" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="w-12">Spacing</span>
                  <NumberField value={obj.letterSpacing} onChange={(letterSpacing) => editor.updateSelected({ letterSpacing })} width="flex-1" />
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="w-12">Line ht.</span>
                  <NumberField value={obj.lineHeight} onChange={(lineHeight) => editor.updateSelected({ lineHeight })} step={0.1} width="flex-1" />
                </label>
              </div>
              <label className="flex items-center gap-2 text-[11px] text-slate-500">
                <input
                  type="checkbox"
                  checked={obj.fontStyle === "italic"}
                  onChange={(e) => editor.updateSelected({ fontStyle: e.target.checked ? "italic" : "normal" })}
                />
                Italic
              </label>
              <div>
                <p className="mb-1 text-[11px] text-slate-500">Transform</p>
                <SegmentedField
                  value={obj.textTransform ?? "none"}
                  options={["none", "uppercase", "lowercase", "capitalize"] as const}
                  onChange={(textTransform) => editor.updateSelected({ textTransform })}
                />
              </div>
              <div>
                <p className="mb-1 text-[11px] text-slate-500">Align</p>
                <SegmentedField value={obj.align} options={["left", "center", "right"] as const} onChange={(align) => editor.updateSelected({ align })} />
              </div>
            </div>
          </PanelSection>
          <PanelSection title="Color" defaultOpen>
            <ColorField value={obj.color} onChange={(color) => editor.updateSelected({ color })} />
          </PanelSection>
        </>
      )}

      {obj.type === "shape" && (
        <PanelSection title="Shape" defaultOpen>
          <div className="space-y-2">
            {obj.shape !== "line" && (
              <div className="flex items-center gap-2">
                <span className="w-16 text-[11px] text-slate-500">Fill</span>
                <ColorField value={obj.fill ?? "#FFFFFF"} onChange={(fill) => editor.updateSelected({ fill })} />
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="w-16 text-[11px] text-slate-500">Stroke</span>
              <ColorField value={obj.stroke ?? "#FFFFFF"} onChange={(stroke) => editor.updateSelected({ stroke })} />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-16 text-[11px] text-slate-500">Stroke W.</span>
              <NumberField value={obj.strokeWidth ?? 0} onChange={(strokeWidth) => editor.updateSelected({ strokeWidth })} min={0} />
            </div>
            {(obj.shape === "star" || obj.shape === "ring") && (
              <div className="flex items-center gap-2">
                <span className="w-16 text-[11px] text-slate-500">Inner ratio</span>
                <NumberField
                  value={obj.innerRadiusRatio ?? 0.5}
                  onChange={(innerRadiusRatio) => editor.updateSelected({ innerRadiusRatio: Math.max(0, Math.min(1, innerRadiusRatio)) })}
                  step={0.05}
                  min={0}
                  max={1}
                />
              </div>
            )}
          </div>
        </PanelSection>
      )}

      {obj.type === "image" && (
        <PanelSection title="Image" defaultOpen>
          <div className="space-y-2">
            <div>
              <p className="mb-1 text-[11px] text-slate-500">Fit</p>
              <SegmentedField value={obj.fit} options={["cover", "contain", "fill"] as const} onChange={(fit) => editor.updateSelected({ fit })} />
            </div>
          </div>
        </PanelSection>
      )}

      {obj.type === "icon" && (
        <PanelSection title="Icon" defaultOpen>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-16 text-[11px] text-slate-500">Color</span>
              <ColorField value={obj.color} onChange={(color) => editor.updateSelected({ color })} />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-16 text-[11px] text-slate-500">Stroke W.</span>
              <NumberField value={obj.strokeWidth ?? 2} onChange={(strokeWidth) => editor.updateSelected({ strokeWidth })} min={0.5} step={0.5} />
            </div>
          </div>
        </PanelSection>
      )}

      {obj.type === "qrcode" && <p className="text-xs italic text-slate-400">QR code generation — coming soon.</p>}

      <TransformSection editor={editor} />
      <AppearanceSection editor={editor} />
    </div>
  );
}

function SortableLayerItem({
  obj,
  editor,
}: {
  obj: import("..").BadgeObject;
  editor: BadgeEditorState;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: obj.id });
  const [isEditing, setIsEditing] = useState(false);
  const defaultName = obj.type === "text" ? obj.text || "Text" : obj.type;
  const displayName = obj.name || defaultName;
  const [tempName, setTempName] = useState(displayName);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    position: "relative" as const,
  };

  const handleRenameSubmit = () => {
    setIsEditing(false);
    if (tempName.trim() !== "" && tempName !== displayName) {
      editor.updateObject(obj.id, { name: tempName.trim() });
    } else {
      setTempName(displayName);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs ${
        editor.selectedId === obj.id ? "bg-[#14142b] text-white" : "text-slate-600 hover:bg-white/60"
      }`}
    >
      <button type="button" onClick={() => editor.toggleVisibility(obj.id)} className="flex-shrink-0 opacity-60 hover:opacity-100">
        {obj.visible ? <Eye size={13} /> : <EyeOff size={13} />}
      </button>
      
      {isEditing ? (
        <input
          autoFocus
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRenameSubmit();
            if (e.key === "Escape") {
              setTempName(displayName);
              setIsEditing(false);
            }
          }}
          className="min-w-0 flex-1 truncate rounded bg-white px-1 py-0.5 text-slate-800 outline-none ring-1 ring-[#14142b]/30"
        />
      ) : (
        <button
          type="button"
          onClick={() => editor.handleSelect(obj.id)}
          onDoubleClick={() => {
            setTempName(displayName);
            setIsEditing(true);
          }}
          className="min-w-0 flex-1 truncate text-left"
          title="Double-click to rename"
        >
          {displayName}
        </button>
      )}

      <button
        type="button"
        onClick={() => {
          setTempName(displayName);
          setIsEditing(true);
        }}
        className="flex-shrink-0 opacity-0 hover:text-[#14142b] group-hover:opacity-60"
        title="Rename layer"
      >
        <Pencil size={13} />
      </button>

      <button
        type="button"
        onClick={() => editor.deleteObject(obj.id)}
        className="flex-shrink-0 opacity-0 hover:text-red-400 group-hover:opacity-60"
      >
        <Trash2 size={13} />
      </button>
      <button
        type="button"
        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-slate-400 opacity-60 hover:opacity-100 focus:outline-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={13} />
      </button>
    </div>
  );
}

export function BadgeLayersPanel({ editor }: { editor: BadgeEditorState }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!editor.doc) return null;
  const objects = editor.doc.objects.slice().sort((a, b) => b.zIndex - a.zIndex);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = objects.findIndex((item) => item.id === active.id);
      const newIndex = objects.findIndex((item) => item.id === over.id);
      editor.reorderObjects(oldIndex, newIndex);
    }
  };

  return (
    <div className="space-y-1">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
        <SortableContext items={objects.map((o) => o.id)} strategy={verticalListSortingStrategy}>
          {objects.map((obj) => (
            <SortableLayerItem key={obj.id} obj={obj} editor={editor} />
          ))}
        </SortableContext>
      </DndContext>
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
      <div className="min-h-0 flex-1 overflow-x-hidden">
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
