"use client";

import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/design-system/ui/tooltip";
import { cn } from "@/shared/utils/utils";

/**
 * One icon button for the editor's own menus (table controls, context-menu rows). Its label shows
 * as a tooltip pinned right beside the button, in the theme's ink — the same pill every other
 * editor tooltip uses — so no control in the editor is an unlabelled icon.
 */
export function EditorIconButton({
  label,
  shortcut,
  onClick,
  active = false,
  disabled = false,
  danger = false,
  side = "top",
  children,
}: {
  label: string;
  shortcut?: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  danger?: boolean;
  side?: "top" | "bottom";
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={label}
            aria-pressed={active || undefined}
            disabled={disabled}
            // Keep the editor's selection: a mousedown that takes focus would collapse the very
            // selection (cells, text) this button is about to act on.
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className={cn(
              "arcade-editor-icon-btn",
              active && "is-active",
              danger && "is-danger"
            )}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} sideOffset={6} className="arcade-editor-tooltip">
        <span>{label}</span>
        {shortcut && <kbd className="arcade-editor-tooltip-kbd">{shortcut}</kbd>}
      </TooltipContent>
    </Tooltip>
  );
}

/** Hairline between groups inside an editor pill. */
export function EditorPillDivider() {
  return <span className="arcade-editor-pill-divider" aria-hidden />;
}
