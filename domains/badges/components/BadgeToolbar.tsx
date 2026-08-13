"use client";

import { useRef, useState } from "react";
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
      const url = await uploadFileToStorage(file, ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"]);
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
        accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
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
              <Sparkles size={15} />
            </button>
          }
        />
        <PopoverContent className="w-72" align="start">
          <div className="flex max-h-80 flex-col gap-3 overflow-y-auto">
            {BADGE_ICON_CATEGORIES.map((category) => (
              <div key={category.label}>
                <div className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {category.label}
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {category.icons.map(({ id, label }) => {
                    const Icon = getBadgeIconComponent(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        title={label}
                        onClick={() => editor.addIconObject(id)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground/70 hover:bg-muted hover:text-foreground"
                      >
                        <Icon size={18} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
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
