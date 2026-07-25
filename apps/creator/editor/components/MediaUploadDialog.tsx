// apps/creator/editor/components/MediaUploadDialog.tsx
// Shared upload-or-link picker behind both VideoUploadButton and ImageUploadButton.
// Selecting one or more files hands them straight to the global upload queue
// (uploadQueueStore.ts) and closes immediately — the actual upload runs in the
// background, tracked by the floating UploadQueuePanel, so it never blocks the author
// from continuing to edit (Google Docs' upload-tray pattern). A "paste a URL" tab is
// the second way to insert, since a link doesn't need queueing at all.

"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import type { Editor } from "@tiptap/react";

import { Button } from "@/shared/design-system/ui/button";
import { Input } from "@/shared/design-system/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/design-system/ui/dialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/shared/design-system/ui/tooltip";
import { cn } from "@/shared/utils/utils";
import { useUploadQueueStore, type UploadKind } from "../lib/uploadQueueStore";

type Mode = "upload" | "link";

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export interface MediaUploadDialogProps {
  editor: Editor | null;
  kind: UploadKind;
  /** Trigger button icon (e.g. a lucide-react icon element). */
  icon: ReactNode;
  /** Tooltip shown on the trigger button. */
  tooltip: string;
  title: string;
  description: string;
  /** `<input accept>` value, e.g. "video/*" or "image/*". */
  accept: string;
  chooseFileLabel: string;
  urlPlaceholder: string;
  urlInvalidMessage: string;
  upload: (file: File, options: { onProgress: (percent: number) => void; signal: AbortSignal }) => Promise<string>;
  /** Called with the resolved src (uploaded URL or pasted link) to insert into the doc. */
  onInsert: (editor: Editor, src: string) => void;
}

export function MediaUploadDialog({
  editor,
  kind,
  icon,
  tooltip,
  title,
  description,
  accept,
  chooseFileLabel,
  urlPlaceholder,
  urlInvalidMessage,
  upload,
  onInsert,
}: MediaUploadDialogProps) {
  const enqueue = useUploadQueueStore((s) => s.enqueue);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Link-tab state
  const [urlValue, setUrlValue] = useState("");
  const [urlError, setUrlError] = useState("");

  const reset = useCallback(() => {
    setMode("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUrlValue("");
    setUrlError("");
  }, []);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (!nextOpen) reset();
    },
    [reset]
  );

  const handleChooseFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0 || !editor || editor.isDestroyed) return;
      for (const file of Array.from(files)) {
        enqueue({ file, kind, editor, upload, onInsert });
      }
      setOpen(false);
      reset();
    },
    [editor, kind, upload, onInsert, enqueue, reset]
  );

  const handleInsertLink = useCallback(() => {
    if (!editor || editor.isDestroyed) return;
    if (!isValidHttpUrl(urlValue)) {
      setUrlError(urlInvalidMessage);
      return;
    }
    onInsert(editor, urlValue);
    setOpen(false);
    reset();
  }, [editor, urlValue, urlInvalidMessage, onInsert, reset]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpen(true)}
              disabled={!editor || editor.isDestroyed}
            />
          }
        >
          {icon}
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
          <Button
            type="button"
            variant={mode === "upload" ? "default" : "ghost"}
            size="sm"
            className={cn(mode !== "upload" && "bg-transparent")}
            onClick={() => setMode("upload")}
          >
            Upload
          </Button>
          <Button
            type="button"
            variant={mode === "link" ? "default" : "ghost"}
            size="sm"
            className={cn(mode !== "link" && "bg-transparent")}
            onClick={() => setMode("link")}
          >
            URL
          </Button>
        </div>

        {mode === "upload" && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <Button className="w-full" size="sm" onClick={handleChooseFile}>
              {chooseFileLabel}
            </Button>
          </>
        )}

        {mode === "link" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                type="url"
                placeholder={urlPlaceholder}
                value={urlValue}
                onChange={(event) => {
                  setUrlValue(event.target.value);
                  if (urlError) setUrlError("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleInsertLink();
                  }
                }}
              />
              <Button type="button" size="sm" onClick={handleInsertLink}>
                Insert
              </Button>
            </div>
            {urlError && <p className="text-sm text-destructive">{urlError}</p>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
