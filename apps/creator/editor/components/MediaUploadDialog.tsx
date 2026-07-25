// apps/creator/editor/components/MediaUploadDialog.tsx
// Shared upload-or-link dialog behind both VideoUploadButton and ImageUploadButton.
// Gives whatever media type it's configured for the same explicit states: pick a file
// -> review it -> press Upload to actually start -> progress bar -> success (inserts
// and closes) or an inline, retryable error — plus a "paste a URL" tab as the second
// way to insert. See VideoUploadButton.tsx for why this replaces the vendor dialogs.

"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import type { Editor } from "@tiptap/react";
import { X, RotateCcw } from "lucide-react";

import { Button } from "@/shared/design-system/ui/button";
import { Input } from "@/shared/design-system/ui/input";
import { Progress, ProgressTrack, ProgressIndicator } from "@/shared/design-system/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/design-system/ui/dialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/shared/design-system/ui/tooltip";
import { cn } from "@/shared/utils/utils";

type UploadStatus = "idle" | "uploading" | "error";
type Mode = "upload" | "link";

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("upload");

  // Upload-tab state
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Link-tab state
  const [urlValue, setUrlValue] = useState("");
  const [urlError, setUrlError] = useState("");

  const reset = useCallback(() => {
    setMode("upload");
    setFile(null);
    setStatus("idle");
    setProgress(0);
    setErrorMessage("");
    abortControllerRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUrlValue("");
    setUrlError("");
  }, []);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && status === "uploading") {
        abortControllerRef.current?.abort();
      }
      setOpen(nextOpen);
      if (!nextOpen) reset();
    },
    [status, reset]
  );

  const handleSwitchMode = useCallback(
    (nextMode: Mode) => {
      if (status === "uploading") return;
      setMode(nextMode);
    },
    [status]
  );

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setStatus("idle");
    setProgress(0);
    setErrorMessage("");
  }, []);

  const handleChooseFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file || !editor || editor.isDestroyed) return;

    setStatus("uploading");
    setProgress(0);
    setErrorMessage("");
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const src = await upload(file, { onProgress: setProgress, signal: controller.signal });
      if (controller.signal.aborted) return;
      onInsert(editor, src);
      setOpen(false);
      reset();
    } catch (error) {
      if ((error as { name?: string }).name === "AbortError") {
        reset();
        return;
      }
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to upload file");
    }
  }, [file, editor, upload, onInsert, reset]);

  const handleCancelUpload = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

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
            disabled={status === "uploading"}
            onClick={() => handleSwitchMode("upload")}
          >
            Upload
          </Button>
          <Button
            type="button"
            variant={mode === "link" ? "default" : "ghost"}
            size="sm"
            className={cn(mode !== "link" && "bg-transparent")}
            disabled={status === "uploading"}
            onClick={() => handleSwitchMode("link")}
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
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            {!file && (
              <Button className="w-full" size="sm" onClick={handleChooseFile}>
                {chooseFileLabel}
              </Button>
            )}

            {file && (
              <div className="flex min-w-0 flex-col gap-2">
                <div className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                  {status !== "uploading" && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleChooseFile}
                      aria-label="Choose a different file"
                    >
                      <RotateCcw />
                    </Button>
                  )}
                </div>

                {status === "uploading" && (
                  <div className="flex items-center gap-2">
                    <Progress value={progress} className="flex-1 gap-0">
                      <ProgressTrack>
                        <ProgressIndicator />
                      </ProgressTrack>
                    </Progress>
                    <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                      {progress}%
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleCancelUpload}
                      aria-label="Cancel upload"
                    >
                      <X />
                    </Button>
                  </div>
                )}

                {status === "error" && <p className="text-sm text-destructive">{errorMessage}</p>}

                {status !== "uploading" && (
                  <Button className="w-full" size="sm" onClick={handleUpload}>
                    {status === "error" ? "Retry upload" : "Upload"}
                  </Button>
                )}
              </div>
            )}
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

export { formatFileSize };
