// apps/creator/editor/components/ImageUploadButton.tsx
// Replaces reactjs-tiptap-editor's built-in RichTextImage trigger + dialog with the same
// explicit-states dialog used for video (see VideoUploadButton.tsx / MediaUploadDialog.tsx):
// pick a file -> review it -> press Upload to actually start -> progress bar -> success
// (inserts and closes) or an inline, retryable error — plus a URL tab for pasting an
// existing image link directly.

"use client";

import type { Editor } from "@tiptap/react";
import { Image as ImageIcon } from "lucide-react";

import { MediaUploadDialog } from "./MediaUploadDialog";
import { uploadImageFileWithProgress } from "../lib/imageUpload";

interface ImageUploadButtonProps {
  editor: Editor | null;
}

export function ImageUploadButton({ editor }: ImageUploadButtonProps) {
  return (
    <MediaUploadDialog
      editor={editor}
      icon={<ImageIcon />}
      tooltip="Image"
      title="Insert image"
      description="Upload an image file or paste an image URL."
      accept="image/*"
      chooseFileLabel="Choose image file"
      urlPlaceholder="https://example.com/image.png"
      urlInvalidMessage="Enter a valid image URL"
      upload={(file, { onProgress, signal }) => uploadImageFileWithProgress(file, { onProgress, signal })}
      onInsert={(editor, src) => {
        editor.chain().focus().setImageBlock({ src }).run();
      }}
    />
  );
}
