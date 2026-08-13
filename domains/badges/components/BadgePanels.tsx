"use client";

import { Eye, EyeOff, Trash2, Lock, Palette, SlidersHorizontal, Layers as LayersIcon } from "lucide-react";
import type { BadgeEditorPanel, BadgeEditorState } from "../hooks/useBadgeEditor";
import type { BadgeBackground, BadgeBorderStyle, BadgePatternKind } from "..";

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
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className={`${width} rounded-xl border border-white/50 bg-white/60 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#14142b]/30`}
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
    <PanelSection title="Background">
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

const BORDER_STYLES: BadgeBorderStyle[] = ["none", "solid", "dashed", "double"];

function FrameSection({ editor }: { editor: BadgeEditorState }) {
  const border = editor.doc!.border;
  return (
    <PanelSection title="Frame">
      <div className="space-y-2.5">
        <div>
          <p className="mb-1 text-[11px] text-slate-500">Border style</p>
          <SegmentedField value={border.style} options={BORDER_STYLES} onChange={(style) => editor.updateBorder({ style })} />
        </div>
        {border.style !== "none" && (
          <>
            <div className="flex items-center gap-2">
              <span className="w-16 text-[11px] text-slate-500">Color</span>
              <ColorField value={border.color} onChange={(color) => editor.updateBorder({ color })} />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-16 text-[11px] text-slate-500">Width</span>
              <NumberField value={border.width} onChange={(width) => editor.updateBorder({ width })} min={1} max={24} />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-16 text-[11px] text-slate-500">Opacity</span>
              <NumberField value={Math.round(border.opacity * 100)} onChange={(v) => editor.updateBorder({ opacity: v / 100 })} min={0} max={100} />
            </div>
            <label className="flex items-center gap-2 text-[11px] text-slate-500">
              <input type="checkbox" checked={border.inner} onChange={(e) => editor.updateBorder({ inner: e.target.checked })} />
              Inner border
            </label>
            {border.inner && (
              <div className="flex items-center gap-2 pl-5">
                <span className="w-11 text-[11px] text-slate-500">Color</span>
                <ColorField value={border.innerColor} onChange={(innerColor) => editor.updateBorder({ innerColor })} />
              </div>
            )}
            <label className="flex items-center gap-2 text-[11px] text-slate-500">
              <input type="checkbox" checked={border.glow} onChange={(e) => editor.updateBorder({ glow: e.target.checked })} />
              Glow
            </label>
          </>
        )}
      </div>
    </PanelSection>
  );
}

export function BadgeDesignPanel({ editor }: { editor: BadgeEditorState }) {
  if (!editor.doc || !editor.shape) return null;
  const { doc, shape } = editor;

  return (
    <div className="space-y-4">
      <BackgroundSection editor={editor} />
      <FrameSection editor={editor} />
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

function TransformSection({ editor }: { editor: BadgeEditorState }) {
  const obj = editor.selectedObject!;
  return (
    <PanelSection title="Transform">
      <div className="grid grid-cols-2 gap-2">
        <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
          X <NumberField value={Math.round(obj.x)} onChange={(x) => editor.updateSelected({ x })} width="flex-1" />
        </label>
        <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
          Y <NumberField value={Math.round(obj.y)} onChange={(y) => editor.updateSelected({ y })} width="flex-1" />
        </label>
        <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
          W <NumberField value={Math.round(obj.width)} onChange={(width) => editor.updateSelected({ width })} width="flex-1" min={1} />
        </label>
        <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
          H <NumberField value={Math.round(obj.height)} onChange={(height) => editor.updateSelected({ height })} width="flex-1" min={1} />
        </label>
        <label className="col-span-2 flex items-center gap-1.5 text-[11px] text-slate-500">
          Rotation <NumberField value={Math.round(obj.rotation)} onChange={(rotation) => editor.updateSelected({ rotation })} width="flex-1" />
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
    <div className="space-y-4">
      {obj.type === "text" && (
        <>
          <PanelSection title="Text">
            <textarea
              value={obj.text}
              onChange={(e) => editor.updateSelected({ text: e.target.value })}
              rows={2}
              className="w-full resize-none rounded-xl border border-white/50 bg-white/60 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#14142b]/30"
            />
          </PanelSection>
          <PanelSection title="Typography">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-16 text-[11px] text-slate-500">Size</span>
                <NumberField value={obj.fontSize} onChange={(fontSize) => editor.updateSelected({ fontSize })} min={1} />
                <span className="w-16 text-[11px] text-slate-500">Weight</span>
                <NumberField value={obj.fontWeight} onChange={(fontWeight) => editor.updateSelected({ fontWeight })} min={100} max={900} step={100} />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16 text-[11px] text-slate-500">Spacing</span>
                <NumberField value={obj.letterSpacing} onChange={(letterSpacing) => editor.updateSelected({ letterSpacing })} />
                <span className="w-16 text-[11px] text-slate-500">Line ht.</span>
                <NumberField value={obj.lineHeight} onChange={(lineHeight) => editor.updateSelected({ lineHeight })} step={0.1} />
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
          <PanelSection title="Color">
            <ColorField value={obj.color} onChange={(color) => editor.updateSelected({ color })} />
          </PanelSection>
        </>
      )}

      {obj.type === "shape" && (
        <PanelSection title="Shape">
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
        <PanelSection title="Image">
          <div className="space-y-2">
            <div>
              <p className="mb-1 text-[11px] text-slate-500">Fit</p>
              <SegmentedField value={obj.fit} options={["cover", "contain", "fill"] as const} onChange={(fit) => editor.updateSelected({ fit })} />
            </div>
          </div>
        </PanelSection>
      )}

      {obj.type === "icon" && (
        <PanelSection title="Icon">
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
            {obj.type === "text" ? obj.text || "Text" : obj.name || obj.type}
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
