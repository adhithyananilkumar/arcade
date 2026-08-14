// apps/creator/editor/extensions/imageDropPaste.ts
// reactjs-tiptap-editor ships its own drag/drop + paste upload plugin for the Image
// extension, but it's commented out in the published build (verified against
// node_modules/reactjs-tiptap-editor/lib/index-DRcwHivm.js — the whole
// `addProseMirrorPlugins` block, including `UploadImagesPlugin()`, is dead code).
// Without it, dropping or pasting an image file falls through to the browser's native
// contenteditable behaviour (navigating to the file, or inserting a raw untyped <img>
// with none of imageBlock's align/resize/flip attrs). This extension reimplements just
// the upload-on-drop/-paste behaviour, inserting a proper `imageBlock` node so dropped
// images get the same alignment and resize support as images inserted via the toolbar.

import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { uploadImageFile } from "../lib/imageUpload";

const IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"];

function imageFilesFrom(list: FileList | DataTransferItemList | null | undefined): File[] {
  if (!list) return [];
  return Array.from(list as unknown as ArrayLike<File | DataTransferItem>)
    .map((item) => ("getAsFile" in item ? item.getAsFile() : (item as File)))
    .filter((file): file is File => !!file && IMAGE_MIME_TYPES.includes(file.type));
}

export const ImageDropPaste = Extension.create({
  name: "imageDropPaste",

  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      new Plugin({
        key: new PluginKey("imageDropPaste"),
        props: {
          handleDrop(view, event) {
            const files = imageFilesFrom(event.dataTransfer?.files);
            if (files.length === 0) return false;

            event.preventDefault();
            const coords = { left: event.clientX, top: event.clientY };
            const dropPos = view.posAtCoords(coords)?.pos ?? view.state.selection.from;

            files.forEach((file, i) => {
              uploadImageFile(file).then((src) => {
                if (!src) return;
                editor
                  .chain()
                  .insertContentAt(dropPos + i, {
                    type: "imageBlock",
                    attrs: { src, alt: file.name, align: "center", width: null },
                  })
                  .run();
              });
            });

            return true;
          },
          handlePaste(view, event) {
            const files = imageFilesFrom(event.clipboardData?.files);
            if (files.length === 0) return false;

            event.preventDefault();
            const pastePos = view.state.selection.from;

            files.forEach((file, i) => {
              uploadImageFile(file).then((src) => {
                if (!src) return;
                editor
                  .chain()
                  .insertContentAt(pastePos + i, {
                    type: "imageBlock",
                    attrs: { src, alt: file.name, align: "center", width: null },
                  })
                  .run();
              });
            });

            return true;
          },
        },
      }),
    ];
  },
});
