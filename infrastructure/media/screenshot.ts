/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Infrastructure
 * Module: Media
 *
 * Purpose:
 * Grabbing what the user is looking at as an image, and shrinking images before upload.
 *
 * Rules:
 * - Technical only; no domain knowledge.
 * - Elements carrying `data-capture-ignore` are left out of a capture (e.g. the widget doing it).
 * ------------------------------------------------------------------
 */

import { toCanvas } from "html-to-image";

/** Uploads are capped at 5MB by the API; stay comfortably under. */
const TARGET_MAX_BYTES = 4 * 1024 * 1024;
const MAX_DIMENSION = 2400;

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not encode the image"))), type, quality),
  );
}

/**
 * Renders the visible part of the page to a JPEG. Done in the browser from the DOM, so it needs no
 * screen-share permission — but it is a re-render, not a pixel copy: inner scroll positions,
 * video frames and cross-origin iframes may not appear exactly as on screen.
 */
export async function captureVisiblePage(): Promise<Blob> {
  const body = document.body;
  const background = getComputedStyle(body).backgroundColor;
  const canvas = await toCanvas(body, {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    backgroundColor: background && background !== "rgba(0, 0, 0, 0)" ? background : "#ffffff",
    cacheBust: true,
    style: {
      transform: `translate(${-window.scrollX}px, ${-window.scrollY}px)`,
      transformOrigin: "top left",
    },
    filter: (node) => !(node instanceof HTMLElement && node.dataset.captureIgnore !== undefined),
  });
  return canvasToBlob(canvas, "image/jpeg", 0.9);
}

/** Loads any image blob onto a canvas, scaled so neither side exceeds MAX_DIMENSION. */
async function toScaledCanvas(blob: Blob): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas;
}

/**
 * Makes an image safe to upload: PNG or JPEG, at most MAX_DIMENSION on its longest side and under
 * the size cap. A small PNG/JPEG is passed through untouched so text in screenshots stays crisp.
 */
export async function prepareImageForUpload(blob: Blob): Promise<Blob> {
  const passThrough = (blob.type === "image/png" || blob.type === "image/jpeg") && blob.size <= TARGET_MAX_BYTES;
  if (passThrough) {
    const bitmap = await createImageBitmap(blob);
    const fits = Math.max(bitmap.width, bitmap.height) <= MAX_DIMENSION;
    bitmap.close();
    if (fits) return blob;
  }
  const canvas = await toScaledCanvas(blob);
  for (const quality of [0.9, 0.8, 0.7, 0.6]) {
    const out = await canvasToBlob(canvas, "image/jpeg", quality);
    if (out.size <= TARGET_MAX_BYTES) return out;
  }
  return canvasToBlob(canvas, "image/jpeg", 0.5);
}

/** Draws an image blob onto a fresh canvas at its natural size (for annotation). */
export async function imageToCanvas(blob: Blob): Promise<HTMLCanvasElement> {
  return toScaledCanvas(blob);
}

export { canvasToBlob };
