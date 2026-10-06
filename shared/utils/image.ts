/**
 * Browser-side image helpers: turning a vector file into a raster one, and checking whether an
 * image has a transparent background. Generic — no knowledge of what the image is for.
 */

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("The image could not be read"));
    img.src = src;
  });
}

/**
 * Draws an SVG file into a transparent PNG, `size` pixels on its longer side, keeping its
 * proportions. Rasterising in the browser means the SVG's markup is never uploaded anywhere.
 */
export async function rasteriseSvg(file: File, size = 1024): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    // An SVG without width/height reports 0 (or 150×150); fall back to a square.
    const w = img.naturalWidth || 1;
    const h = img.naturalHeight || 1;
    const scale = size / Math.max(w, h);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not prepare the image");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("Could not convert the image");
    return new File([blob], file.name.replace(/\.svg$/i, "") + ".png", { type: "image/png" });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Whether an image's background is transparent: at least `share` of the pixels along its outer
 * edge are (nearly) fully transparent. A logo on a white or coloured box fails this.
 */
export async function hasTransparentBackground(src: string, share = 0.6): Promise<boolean> {
  const img = await loadImage(src);
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return false;
  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);
  let edge = 0;
  let clear = 0;
  for (let i = 0; i < size; i++) {
    for (const [x, y] of [[i, 0], [i, size - 1], [0, i], [size - 1, i]]) {
      edge++;
      if (data[(y * size + x) * 4 + 3] < 16) clear++;
    }
  }
  return clear / edge >= share;
}
