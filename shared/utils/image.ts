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

function canvasToFile(canvas: HTMLCanvasElement, name: string, type: string): Promise<File> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(new File([blob], name, { type })) : reject(new Error("Could not convert the image"))),
      type,
      0.92,
    ),
  );
}

async function drawFile(
  file: File,
  size: (w: number, h: number) => [number, number],
  draw: (ctx: CanvasRenderingContext2D, img: HTMLImageElement) => void,
): Promise<HTMLCanvasElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    [canvas.width, canvas.height] = size(img.naturalWidth, img.naturalHeight);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Could not prepare the image");
    draw(ctx, img);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Turns an image a quarter turn: clockwise for 90, anticlockwise for -90. Keeps its type. */
export async function rotateQuarter(file: File, degrees: 90 | -90): Promise<File> {
  const canvas = await drawFile(
    file,
    (w, h) => [h, w],
    (ctx, img) => {
      ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
      ctx.rotate((degrees * Math.PI) / 180);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    },
  );
  return canvasToFile(canvas, file.name, file.type === "image/jpeg" ? "image/jpeg" : "image/png");
}

/**
 * Makes a light paper background transparent — for a signature or logo photographed or scanned on
 * white. Pixels brighter than `threshold` (0–255) become clear, with a soft ramp below it so the
 * ink keeps anti-aliased edges. Always returns a PNG.
 */
export async function knockOutLightBackground(file: File, threshold = 215): Promise<File> {
  const canvas = await drawFile(
    file,
    (w, h) => [w, h],
    (ctx, img) => {
      ctx.drawImage(img, 0, 0);
      const image = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      const d = image.data;
      const ramp = 40;
      for (let i = 0; i < d.length; i += 4) {
        const light = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        if (light >= threshold) d[i + 3] = 0;
        else if (light > threshold - ramp) d[i + 3] = Math.round(d[i + 3] * ((threshold - light) / ramp));
      }
      ctx.putImageData(image, 0, 0);
    },
  );
  return canvasToFile(canvas, file.name.replace(/\.[^.]+$/, "") + ".png", "image/png");
}

/**
 * The box around an image's visible content, as fractions (0–1) of its width and height; null when
 * it is entirely transparent. Used to trim empty margins off a logo or signature.
 */
export async function contentBounds(
  src: string,
): Promise<{ x: number; y: number; width: number; height: number } | null> {
  const img = await loadImage(src);
  const scale = Math.min(1, 512 / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] >= 16) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  return { x: minX / w, y: minY / h, width: (maxX - minX + 1) / w, height: (maxY - minY + 1) / h };
}

/**
 * Turns an image by any angle (degrees, clockwise), growing the canvas so no corner is cut off. The
 * new corners are transparent (white for a JPEG, which has no alpha). Keeps PNG/JPEG; others become PNG.
 */
export async function rotateBy(file: File, degrees: number): Promise<File> {
  const rad = (degrees * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const jpeg = file.type === "image/jpeg";
  const canvas = await drawFile(
    file,
    (w, h) => [Math.ceil(w * cos + h * sin), Math.ceil(w * sin + h * cos)],
    (ctx, img) => {
      if (jpeg) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
      ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
      ctx.rotate(rad);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    },
  );
  return canvasToFile(canvas, file.name, jpeg ? "image/jpeg" : "image/png");
}
