"use client";

// domains/assessments/components/prompt-editor/ImagePickerDialog.tsx
// Same Upload/URL picker UX as the content engine's MediaUploadDialog (apps/creator/editor),
// rebuilt on the same shared/design-system primitives so it looks and behaves identically —
// without depending on apps/creator/editor's Tiptap-typed props or its background upload-queue
// store (ADR-001: a domain may never import from apps/). Uploads still land in R2 via the same
// shared infrastructure/media/upload.ts flow.

import { useCallback, useRef, useState } from "react";
import { ImageIcon, Loader2, UploadCloud } from "lucide-react";

import { Button } from "@/shared/design-system/ui/button";
import { Input } from "@/shared/design-system/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/design-system/ui/dialog";
import { cn } from "@/shared/utils/utils";
import { PROMPT_IMAGE_TYPES, uploadPromptImageWithProgress } from "../../lib/uploadPromptImage";

type Mode = "upload" | "link";

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

interface ImagePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (src: string) => void;
}

export function ImagePickerDialog({ open, onOpenChange, onInsert }: ImagePickerDialogProps) {
  const [mode, setMode] = useState<Mode>("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [urlValue, setUrlValue] = useState("");
  const [urlError, setUrlError] = useState("");

  const reset = useCallback(() => {
    setMode("upload");
    setIsDragging(false);
    setUploading(false);
    setProgress(0);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUrlValue("");
    setUrlError("");
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen);
      if (!nextOpen) reset();
    },
    [onOpenChange, reset]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);
      setProgress(0);
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const url = await uploadPromptImageWithProgress(file, {
          onProgress: setProgress,
          signal: controller.signal,
        });
        onInsert(url);
        handleOpenChange(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
        setUploading(false);
      }
    },
    [onInsert, handleOpenChange]
  );

  const handleChooseFile = useCallback(() => fileInputRef.current?.click(), []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleInsertLink = useCallback(() => {
    if (!isValidHttpUrl(urlValue)) {
      setUrlError("Enter a valid image URL");
      return;
    }
    onInsert(urlValue);
    handleOpenChange(false);
  }, [urlValue, onInsert, handleOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert image</DialogTitle>
          <DialogDescription>Upload an image file or paste an image URL.</DialogDescription>
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
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors",
              isDragging
                ? "border-primary bg-primary/10"
                : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={PROMPT_IMAGE_TYPES.join(",")}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm font-medium">Uploading… {progress}%</p>
              </>
            ) : (
              <>
                <UploadCloud className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">Drag & drop an image here</p>
                  <p className="mt-1 text-xs text-muted-foreground">or</p>
                </div>
                <Button size="sm" onClick={handleChooseFile} className="mt-2 w-full">
                  <ImageIcon /> Choose image file
                </Button>
              </>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        {mode === "link" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                type="url"
                placeholder="https://example.com/image.png"
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
