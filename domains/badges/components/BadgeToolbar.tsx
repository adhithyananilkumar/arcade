"use client";

import { useRef, useState } from "react";
import {
  MousePointer2,
  Undo2,
  Redo2,
  Type,
  Image as ImageIcon,
  Shapes,
  Smile,
  QrCode,
  Eye,
  EyeOff,
  Trash2,
  Square,
  RectangleHorizontal,
  Circle,
  Triangle,
  Diamond,
  Star as StarIcon,
  CircleDashed,
  Minus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/shared/design-system/ui/separator";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/design-system/ui/popover";
import { FloatingToolbar } from "@/shared/design-system/ui/floating-toolbar";
import { uploadFileToStorage } from "@/infrastructure/media/upload";
import { BADGE_ICON_CATEGORIES, getBadgeIconComponent, type BadgeShapeKind } from "..";
import type { BadgeEditorState } from "../hooks/useBadgeEditor";

const SHAPE_OPTIONS: Array<{ kind: BadgeShapeKind; label: string; icon: typeof Square }> = [
  { kind: "rectangle", label: "Rectangle", icon: Square },
  { kind: "roundedRectangle", label: "Rounded Rectangle", icon: RectangleHorizontal },
  { kind: "circle", label: "Circle", icon: Circle },
  { kind: "triangle", label: "Triangle", icon: Triangle },
  { kind: "diamond", label: "Diamond", icon: Diamond },
  { kind: "star", label: "Star", icon: StarIcon },
  { kind: "ring", label: "Ring", icon: CircleDashed },
  { kind: "line", label: "Line", icon: Minus },
];

export function BadgeToolbar({ editor, centerX }: { editor: BadgeEditorState; centerX?: number }) {
  const hasSelection = !!editor.selectedObject;
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChosen = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFileToStorage(file, ["image/png", "image/svg+xml"]);
      editor.addImageObject(url);
    } catch (err) {
      console.error("Failed to upload badge image", err);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <FloatingToolbar centerX={centerX}>
      <ToolButton icon={MousePointer2} label="Select" active />
      <Separator orientation="vertical" className="h-5 mx-1" />
      <ToolButton icon={Undo2} label="Undo — coming soon" disabled />
      <ToolButton icon={Redo2} label="Redo — coming soon" disabled />
      <Separator orientation="vertical" className="h-5 mx-1" />
      <ToolButton icon={Type} label="Text" onClick={editor.addTextObject} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          void handleFileChosen(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <ToolButton
        icon={uploading ? Loader2 : ImageIcon}
        label="Image"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        spin={uploading}
      />

      <Popover>
        <PopoverTrigger
          render={
            <button type="button" title="Shape" className={toolButtonClass(false, false, false)}>
              <Shapes size={15} />
            </button>
          }
        />
        <PopoverContent className="w-56" align="start">
          <div className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Shapes</div>
          <div className="grid grid-cols-4 gap-1.5">
            {SHAPE_OPTIONS.map(({ kind, label, icon: Icon }) => (
              <button
                key={kind}
                type="button"
                title={label}
                onClick={() => editor.addShapeObject(kind)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground/70 hover:bg-muted hover:text-foreground"
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger
          render={
            <button type="button" title="Icon" className={toolButtonClass(false, false, false)}>
              <Smile size={15} />
            </button>
          }
        />
        <PopoverContent className="w-80 p-0" align="start">
          <IconPicker onSelect={editor.addIconObject} />
        </PopoverContent>
      </Popover>

      <ToolButton icon={QrCode} label="QR — coming soon" disabled />
      {hasSelection && (
        <>
          <Separator orientation="vertical" className="h-5 mx-1" />
          <ToolButton
            icon={Trash2}
            label="Delete"
            danger
            onClick={() => editor.selectedId && editor.deleteObject(editor.selectedId)}
          />
        </>
      )}
      <Separator orientation="vertical" className="h-5 mx-1" />
      <ToolButton
        icon={editor.previewMode ? EyeOff : Eye}
        label={editor.previewMode ? "Exit preview" : "Preview"}
        active={editor.previewMode}
        onClick={() => editor.setPreviewMode((v) => !v)}
      />
    </FloatingToolbar>
  );
}

// ─── Icon Picker ─────────────────────────────────────────────────────────────
function IconPicker({ onSelect }: { onSelect: (id: string) => void }) {
  const [activeTab, setActiveTab] = useState(0);
  const category = BADGE_ICON_CATEGORIES[activeTab];

  return (
    <div className="flex flex-col">
      {/* Category tab pills — horizontally scrollable */}
      <div className="flex gap-1 overflow-x-auto border-b border-border px-2 py-1.5 scrollbar-none">
        {BADGE_ICON_CATEGORIES.map((cat, i) => (
          <button
            key={cat.label}
            type="button"
            onClick={() => setActiveTab(i)}
            className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
              i === activeTab
                ? "bg-[#14142b] text-white"
                : "text-[#14142b]/60 hover:bg-[#14142b]/8 hover:text-[#14142b]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Icon grid for active category */}
      <div className="grid max-h-56 grid-cols-6 gap-0.5 overflow-y-auto p-2">
        {category.icons.map(({ id, label }) => {
          const Icon = getBadgeIconComponent(id);
          return (
            <button
              key={id}
              type="button"
              title={label}
              onClick={() => onSelect(id)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon size={17} />
            </button>
          );
        })}
      </div>

      {/* Footer label */}
      <div className="border-t border-border px-3 py-1.5 text-[11px] text-muted-foreground">
        {category.label} · {category.icons.length} icons
      </div>
    </div>
  );
}

function toolButtonClass(active?: boolean, disabled?: boolean, danger?: boolean) {
  return `flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
    active
      ? "bg-[#14142b] text-white"
      : disabled
        ? "cursor-not-allowed text-[#14142b]/20"
        : danger
          ? "text-red-500 hover:bg-red-50"
          : "text-[#14142b]/60 hover:bg-[#14142b]/10 hover:text-[#14142b]"
  }`;
}

function ToolButton({
  icon: Icon,
  label,
  onClick,
  active,
  disabled,
  danger,
  spin,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  danger?: boolean;
  spin?: boolean;
}) {
  return (
    <button type="button" title={label} onClick={onClick} disabled={disabled} className={toolButtonClass(active, disabled, danger)}>
      <Icon size={15} className={spin ? "animate-spin" : undefined} />
    </button>
  );
}
