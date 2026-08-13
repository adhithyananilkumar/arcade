"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import debounce from "lodash.debounce";
import {
  MousePointer2,
  Undo2,
  Redo2,
  Type,
  Image as ImageIcon,
  Shapes,
  Sparkles,
  QrCode,
  Eye,
  EyeOff,
  Trash2,
  Palette,
  SlidersHorizontal,
  Layers as LayersIcon,
  Lock,
} from "lucide-react";
import { getBadge, saveBadgeDocument } from "../api";
import { migrateBadgeDocument, getBadgeShapeDefinition, type BadgeDocument, type BadgeTextObject } from "..";

// Konva touches the canvas/DOM at import time — must never run during SSR.
const BadgeCanvas = dynamic(() => import("./BadgeCanvas").then((m) => m.BadgeCanvas), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-xs text-[#14142b]/40">Loading editor…</div>
  ),
});

const AUTOSAVE_DEBOUNCE_MS = 2000;
const MIN_CANVAS_SIZE = 280;
const MAX_CANVAS_SIZE = 640;

interface StandaloneBadgeEditorProps {
  badgeId: string;
  readOnly?: boolean;
  className?: string;
}

type PanelTab = "design" | "properties" | "layers";

export function StandaloneBadgeEditor({ badgeId, readOnly, className = "" }: StandaloneBadgeEditorProps) {
  const [doc, setDoc] = useState<BadgeDocument | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [panelTab, setPanelTab] = useState<PanelTab>("design");
  const [canvasSize, setCanvasSize] = useState(MIN_CANVAS_SIZE);
  const lastSavedRef = useRef<string | null>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setDoc(null);
    setLoadError(null);
    setSelectedId(null);
    getBadge(badgeId)
      .then((res) => {
        if (cancelled) return;
        const parsed = migrateBadgeDocument(JSON.parse(res.document));
        lastSavedRef.current = JSON.stringify(parsed);
        setDoc(parsed);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load badge", err);
        setLoadError("This badge design couldn't be loaded. It may be corrupted or you may not have access.");
      });
    return () => {
      cancelled = true;
    };
  }, [badgeId]);

  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const available = Math.min(entry.contentRect.width, entry.contentRect.height);
      setCanvasSize(Math.max(MIN_CANVAS_SIZE, Math.min(MAX_CANVAS_SIZE, available)));
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const debouncedSave = useRef(
    debounce(async (id: string, document: BadgeDocument) => {
      const serialized = JSON.stringify(document);
      if (serialized === lastSavedRef.current) return;
      setSaveState("saving");
      try {
        await saveBadgeDocument(id, document);
        lastSavedRef.current = serialized;
        setSaveState("saved");
      } catch (err) {
        console.error("Failed to save badge document", err);
        setSaveState("error");
      }
    }, AUTOSAVE_DEBOUNCE_MS)
  ).current;

  useEffect(() => () => debouncedSave.cancel(), [debouncedSave]);

  const handleChange = useCallback(
    (next: BadgeDocument) => {
      setDoc(next);
      if (!readOnly) debouncedSave(badgeId, next);
    },
    [badgeId, readOnly, debouncedSave]
  );

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id);
    setPanelTab(id ? "properties" : "design");
  }, []);

  const addTextObject = () => {
    if (!doc || readOnly) return;
    const id = `obj-${crypto.randomUUID()}`;
    const next: BadgeTextObject = {
      id,
      type: "text",
      x: doc.canvas.width / 2 - 150,
      y: doc.canvas.height / 2 - 20,
      width: 300,
      height: 40,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: doc.objects.length,
      text: "New Text",
      fontFamily: "Geist",
      fontSize: 32,
      fontWeight: 700,
      color: "#FFFFFF",
      align: "center",
      lineHeight: 1.2,
      letterSpacing: 0,
      wrap: true,
    };
    handleChange({ ...doc, objects: [...doc.objects, next] });
    handleSelect(id);
  };

  const updateSelected = (patch: Partial<BadgeTextObject>) => {
    if (!doc || !selectedId) return;
    handleChange({
      ...doc,
      objects: doc.objects.map((o) => (o.id === selectedId ? ({ ...o, ...patch } as BadgeTextObject) : o)),
    });
  };

  const toggleVisibility = (id: string) => {
    if (!doc) return;
    handleChange({
      ...doc,
      objects: doc.objects.map((o) => (o.id === id ? { ...o, visible: !o.visible } : o)),
    });
  };

  const deleteObject = (id: string) => {
    if (!doc) return;
    handleChange({ ...doc, objects: doc.objects.filter((o) => o.id !== id) });
    if (selectedId === id) handleSelect(null);
  };

  if (loadError) {
    return (
      <div className={`flex flex-1 flex-col items-center justify-center gap-2 text-center ${className}`}>
        <p className="text-sm text-gray-500">{loadError}</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className={`flex flex-1 items-center justify-center ${className}`}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#14142b]/15 border-t-[#14142b]" />
      </div>
    );
  }

  const selectedObject = doc.objects.find((o) => o.id === selectedId) ?? null;
  const shape = getBadgeShapeDefinition(doc.shape.type);

  return (
    <div className={`flex h-full w-full min-h-0 flex-1 gap-4 ${className}`}>
      {/* ── Center: toolbar + the badge itself (no surrounding card — the badge IS the canvas) ── */}
      <div className="flex min-w-0 flex-1 flex-col items-center gap-3">
        {!readOnly && (
          <BadgeToolbar
            hasSelection={!!selectedObject}
            previewMode={previewMode}
            onAddText={addTextObject}
            onDeleteSelected={() => selectedId && deleteObject(selectedId)}
            onTogglePreview={() => setPreviewMode((v) => !v)}
          />
        )}

        <div ref={canvasHostRef} className="flex min-h-0 w-full flex-1 items-center justify-center">
          <BadgeCanvas
            document={doc}
            onChange={handleChange}
            selectedId={selectedId}
            onSelect={handleSelect}
            size={canvasSize}
            showGuides={!previewMode}
            readOnly={readOnly || previewMode}
          />
        </div>

        <div className="h-4 text-[11px] text-[#14142b]/40">
          {!readOnly && saveState === "saving" && "Saving…"}
          {!readOnly && saveState === "saved" && "Saved"}
          {!readOnly && saveState === "error" && <span className="text-red-500">Failed to save — retrying on next edit</span>}
        </div>
      </div>

      {/* ── Right: contextual Design / Properties / Layers panel ── */}
      {!readOnly && (
        <div className="flex w-[260px] flex-shrink-0 flex-col rounded-2xl border border-[#14142b]/10 bg-white/50 backdrop-blur-md">
          <div className="flex border-b border-[#14142b]/10 px-2 pt-2">
            <PanelTabButton icon={Palette} label="Design" active={panelTab === "design"} onClick={() => setPanelTab("design")} />
            <PanelTabButton
              icon={SlidersHorizontal}
              label="Properties"
              active={panelTab === "properties"}
              onClick={() => setPanelTab("properties")}
              disabled={!selectedObject}
            />
            <PanelTabButton icon={LayersIcon} label="Layers" active={panelTab === "layers"} onClick={() => setPanelTab("layers")} />
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {panelTab === "design" && (
              <div className="flex flex-col gap-4">
                <PanelSection title="Background">
                  {doc.background.type === "solid" ? (
                    <label className="flex items-center gap-2 text-xs text-[#14142b]/70">
                      <input
                        type="color"
                        value={doc.background.value}
                        onChange={(e) => handleChange({ ...doc, background: { type: "solid", value: e.target.value } })}
                        className="h-7 w-7 cursor-pointer rounded border border-[#14142b]/10 bg-transparent p-0"
                      />
                      {doc.background.value}
                    </label>
                  ) : (
                    <p className="text-xs text-[#14142b]/40">Gradient/image backgrounds — coming soon.</p>
                  )}
                </PanelSection>
                <PanelSection title="Shape">
                  <p className="text-xs text-[#14142b]/70">{shape.name}</p>
                </PanelSection>
                <PanelSection title="Canvas">
                  <p className="text-xs text-[#14142b]/70">
                    {doc.canvas.width} × {doc.canvas.height}
                  </p>
                </PanelSection>
              </div>
            )}

            {panelTab === "properties" && selectedObject && selectedObject.type === "text" && (
              <div className="flex flex-col gap-4">
                <PanelSection title="Text">
                  <textarea
                    value={selectedObject.text}
                    onChange={(e) => updateSelected({ text: e.target.value })}
                    rows={2}
                    className="w-full resize-none rounded-lg border border-[#14142b]/10 bg-white/70 px-2 py-1.5 text-xs text-[#14142b] outline-none focus:border-[#14142b]/30"
                  />
                </PanelSection>
                <PanelSection title="Font size">
                  <input
                    type="number"
                    value={selectedObject.fontSize}
                    onChange={(e) => updateSelected({ fontSize: Number(e.target.value) || 1 })}
                    className="w-20 rounded-lg border border-[#14142b]/10 bg-white/70 px-2 py-1.5 text-xs text-[#14142b] outline-none focus:border-[#14142b]/30"
                  />
                </PanelSection>
                <PanelSection title="Color">
                  <input
                    type="color"
                    value={selectedObject.color}
                    onChange={(e) => updateSelected({ color: e.target.value })}
                    className="h-7 w-7 cursor-pointer rounded border border-[#14142b]/10 bg-transparent p-0"
                  />
                </PanelSection>
                <PanelSection title="Align">
                  <div className="flex gap-1">
                    {(["left", "center", "right"] as const).map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => updateSelected({ align })}
                        className={`rounded-lg px-2 py-1 text-[11px] font-medium capitalize ${
                          selectedObject.align === align
                            ? "bg-[#14142b] text-white"
                            : "bg-white/70 text-[#14142b]/60 hover:bg-white"
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </PanelSection>
              </div>
            )}
            {panelTab === "properties" && !selectedObject && (
              <p className="text-xs text-[#14142b]/40">Select an object to edit its properties.</p>
            )}

            {panelTab === "layers" && (
              <div className="flex flex-col gap-1">
                {doc.objects
                  .slice()
                  .sort((a, b) => b.zIndex - a.zIndex)
                  .map((obj) => (
                    <div
                      key={obj.id}
                      className={`group flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs ${
                        selectedId === obj.id ? "bg-[#14142b] text-white" : "text-[#14142b]/70 hover:bg-white/70"
                      }`}
                    >
                      <button type="button" onClick={() => toggleVisibility(obj.id)} className="flex-shrink-0 opacity-60 hover:opacity-100">
                        {obj.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                      <button type="button" onClick={() => handleSelect(obj.id)} className="min-w-0 flex-1 truncate text-left">
                        {obj.type === "text" ? obj.text || "Text" : obj.type}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteObject(obj.id)}
                        className="flex-shrink-0 opacity-0 hover:text-red-400 group-hover:opacity-60"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                {doc.objects.length === 0 && <p className="px-2 text-xs text-[#14142b]/40">No objects yet.</p>}
                <div className="mt-2 flex items-center gap-1.5 rounded-lg border-t border-[#14142b]/10 px-2 pt-2 text-xs text-[#14142b]/40">
                  <Lock size={12} />
                  Badge Frame
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BadgeToolbar({
  hasSelection,
  previewMode,
  onAddText,
  onDeleteSelected,
  onTogglePreview,
}: {
  hasSelection: boolean;
  previewMode: boolean;
  onAddText: () => void;
  onDeleteSelected: () => void;
  onTogglePreview: () => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-[#14142b]/10 bg-white/60 px-1.5 py-1.5 backdrop-blur-md shadow-sm">
      <ToolButton icon={MousePointer2} label="Select" active />
      <Divider />
      <ToolButton icon={Undo2} label="Undo" disabled />
      <ToolButton icon={Redo2} label="Redo" disabled />
      <Divider />
      <ToolButton icon={Type} label="Text" onClick={onAddText} />
      <ToolButton icon={ImageIcon} label="Image — coming soon" disabled />
      <ToolButton icon={Shapes} label="Shape — coming soon" disabled />
      <ToolButton icon={Sparkles} label="Icon — coming soon" disabled />
      <ToolButton icon={QrCode} label="QR — coming soon" disabled />
      {hasSelection && (
        <>
          <Divider />
          <ToolButton icon={Trash2} label="Delete" onClick={onDeleteSelected} danger />
        </>
      )}
      <Divider />
      <ToolButton icon={previewMode ? EyeOff : Eye} label={previewMode ? "Exit preview" : "Preview"} active={previewMode} onClick={onTogglePreview} />
    </div>
  );
}

function ToolButton({
  icon: Icon,
  label,
  onClick,
  active,
  disabled,
  danger,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
        active
          ? "bg-[#14142b] text-white"
          : disabled
            ? "text-[#14142b]/20 cursor-not-allowed"
            : danger
              ? "text-red-500 hover:bg-red-50"
              : "text-[#14142b]/60 hover:bg-[#14142b]/10 hover:text-[#14142b]"
      }`}
    >
      <Icon size={15} />
    </button>
  );
}

function Divider() {
  return <div className="mx-0.5 h-5 w-px bg-[#14142b]/10" />;
}

function PanelTabButton({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-1 flex-col items-center gap-1 border-b-2 px-2 pb-2 text-[10px] font-medium transition-colors ${
        active
          ? "border-[#14142b] text-[#14142b]"
          : disabled
            ? "border-transparent text-[#14142b]/20 cursor-not-allowed"
            : "border-transparent text-[#14142b]/40 hover:text-[#14142b]/70"
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-[#14142b]/40">{title}</p>
      {children}
    </div>
  );
}
