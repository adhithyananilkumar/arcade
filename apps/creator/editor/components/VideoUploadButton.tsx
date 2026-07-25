// apps/creator/editor/components/VideoUploadButton.tsx
// Replaces reactjs-tiptap-editor's built-in RichTextVideo trigger + dialog. The vendor
// dialog's "Upload" button only re-opens the native file picker (its one job is
// `fileInputRef.current.click()`) — there is no confirm step, no progress feedback, and
// upload failures are swallowed into a generic toast while a broken video block still
// gets inserted. MediaUploadDialog (shared with ImageUploadButton) gives video upload
// its own explicit states instead: pick a file -> review it -> press Upload to actually
// start -> progress bar -> success (inserts and closes) or an inline, retryable error.
// A URL tab covers pasting a link (YouTube/Vimeo/direct file/etc — the Video node view
// resolves the embed at render time, so the raw URL is passed through as-is).

"use client";

import type { Editor } from "@tiptap/react";
import { Video as VideoIcon } from "lucide-react";

import { MediaUploadDialog } from "./MediaUploadDialog";
import { uploadVideoFile } from "../lib/imageUpload";

interface VideoUploadButtonProps {
  editor: Editor | null;
}

export function VideoUploadButton({ editor }: VideoUploadButtonProps) {
  return (
    <MediaUploadDialog
      editor={editor}
      icon={<VideoIcon />}
      tooltip="Video"
      title="Insert video"
      description="Upload a video file or paste a video URL."
      accept="video/*"
      chooseFileLabel="Choose video file"
      urlPlaceholder="https://youtube.com/watch?v=…"
      urlInvalidMessage="Enter a valid video URL (e.g. a YouTube, Vimeo, or direct video link)"
      upload={(file, { onProgress, signal }) => uploadVideoFile(file, { onProgress, signal })}
      onInsert={(editor, src) => {
        editor.chain().focus().setVideo({ src, width: "100%" }).run();
      }}
    />
  );
}
