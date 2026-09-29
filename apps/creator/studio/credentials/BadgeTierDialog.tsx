"use client";

/**
 * The editor's "Add badge": asks for a level instead of opening a designer. Same panel as the
 * content overview's settings tab, framed as a dialog so the author never leaves the editor.
 */

import { Dialog, DialogContent, DialogTitle } from "@/shared/design-system/ui/dialog";
import type { BadgeAssignment, BadgeContentType } from "@/domains/credentials";
import { BadgeTierPanel } from "./BadgeTierPanel";

export interface BadgeTierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: BadgeContentType;
  contentId: string;
  readOnly?: boolean;
  onSaved?: (assignment: BadgeAssignment) => void;
}

export function BadgeTierDialog({ open, onOpenChange, contentType, contentId, readOnly, onSaved }: BadgeTierDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-6 sm:max-w-3xl">
        <DialogTitle className="sr-only">Completion badge</DialogTitle>
        {open && (
          <BadgeTierPanel
            contentType={contentType}
            contentId={contentId}
            readOnly={readOnly}
            variant="plain"
            onSaved={onSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
