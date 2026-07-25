// apps/creator/editor/components/VideoUploadButton.tsx
// Replaces reactjs-tiptap-editor's built-in RichTextVideo trigger + dialog. The vendor
// dialog's "Upload" button only re-opens the native file picker (its one job is
// `fileInputRef.current.click()`) — there is no confirm step, no progress feedback, and
// upload failures are swallowed into a generic toast while a broken video block still
// gets inserted. This component gives video upload its own explicit states instead:
// pick a file -> review it -> press Upload to actually start -> progress bar -> success
// (inserts the video and closes) or an inline, retryable error. It also keeps the
// vendor dialog's second path — inserting a video by URL (YouTube/Vimeo/direct file/etc,
// the Video node view resolves the embed at render time) — as an explicit tab.

"use client";

import { useCallback, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { Video as VideoIcon, X, RotateCcw } from "lucide-react";

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
import { uploadVideoFile } from "../lib/imageUpload";

const MAX_LABEL_BYTES = 25 * 1024 * 1024;

type UploadStatus = "idle" | "uploading" | "error";
type Mode = "upload" | "link";

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isValidVideoUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

interface VideoUploadButtonProps {
  editor: Editor | null;
}

export function VideoUploadButton({ editor }: VideoUploadButtonProps) {
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
      const src = await uploadVideoFile(file, {
        onProgress: setProgress,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      editor.chain().focus().setVideo({ src, width: "100%" }).run();
      setOpen(false);
      reset();
    } catch (error) {
      if ((error as { name?: string }).name === "AbortError") {
        reset();
        return;
      }
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to upload video");
    }
  }, [file, editor, reset]);

  const handleCancelUpload = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const handleInsertLink = useCallback(() => {
    if (!editor || editor.isDestroyed) return;
    if (!isValidVideoUrl(urlValue)) {
      setUrlError("Enter a valid video URL (e.g. a YouTube, Vimeo, or direct video link)");
      return;
    }
    editor.chain().focus().setVideo({ src: urlValue, width: "100%" }).run();
    setOpen(false);
    reset();
  }, [editor, urlValue, reset]);

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
          <VideoIcon />
        </TooltipTrigger>
        <TooltipContent>Video</TooltipContent>
      </Tooltip>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert video</DialogTitle>
          <DialogDescription>
            Upload a video file (up to {MAX_LABEL_BYTES / 1024 / 1024}MB) or paste a video URL.
          </DialogDescription>
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
            Video URL
          </Button>
        </div>

        {mode === "upload" && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            {!file && (
              <Button className="w-full" size="sm" onClick={handleChooseFile}>
                Choose video file
              </Button>
            )}

            {file && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
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

                {status === "error" && (
                  <p className="text-sm text-destructive">{errorMessage}</p>
                )}

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
                placeholder="https://youtube.com/watch?v=…"
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
