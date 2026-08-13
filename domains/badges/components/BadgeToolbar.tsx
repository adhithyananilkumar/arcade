"use client";

import { MousePointer2, Undo2, Redo2, Type, Image as ImageIcon, Shapes, Sparkles, QrCode, Eye, EyeOff, Trash2 } from "lucide-react";
import { Separator } from "@/shared/design-system/ui/separator";
import { FloatingToolbar } from "@/shared/design-system/ui/floating-toolbar";
import type { BadgeEditorState } from "../hooks/useBadgeEditor";

/**
 * Same floating pill shell as the Lesson editor's RichTextToolbar (see
 * FloatingToolbar) — same anchor position, same visual language. Only the
 * button groups differ.
 */
// Matches the right-sidebar reservation SharedContentEditorOrchestrator applies to the badge
// workspace's own paddingRight (340px panel + 16px gap) — the sidebar is effectively always
// shown while a badge is open (EditorRightSidebar's "editor" mode), so the toolbar keeps this
// reserved unconditionally rather than tracking rightPanelOpen, to stay visually aligned with
// the canvas below it instead of re-centering on the full viewport underneath the panel.
const SIDEBAR_RESERVED_PX = 356;

export function BadgeToolbar({ editor }: { editor: BadgeEditorState }) {
  const hasSelection = !!editor.selectedObject;

  return (
    <FloatingToolbar rightInset={SIDEBAR_RESERVED_PX}>
      <ToolButton icon={MousePointer2} label="Select" active />
      <Separator orientation="vertical" className="h-5 mx-1" />
      <ToolButton icon={Undo2} label="Undo — coming soon" disabled />
      <ToolButton icon={Redo2} label="Redo — coming soon" disabled />
      <Separator orientation="vertical" className="h-5 mx-1" />
      <ToolButton icon={Type} label="Text" onClick={editor.addTextObject} />
      <ToolButton icon={ImageIcon} label="Image — coming soon" disabled />
      <ToolButton icon={Shapes} label="Shape — coming soon" disabled />
      <ToolButton icon={Sparkles} label="Icon — coming soon" disabled />
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
      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
        active
          ? "bg-[#14142b] text-white"
          : disabled
            ? "cursor-not-allowed text-[#14142b]/20"
            : danger
              ? "text-red-500 hover:bg-red-50"
              : "text-[#14142b]/60 hover:bg-[#14142b]/10 hover:text-[#14142b]"
      }`}
    >
      <Icon size={15} />
    </button>
  );
}
