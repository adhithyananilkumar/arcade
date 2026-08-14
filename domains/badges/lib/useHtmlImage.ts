"use client";

import { useEffect, useState } from "react";

/** Loads an image URL into an HTMLImageElement for use as a Konva <Image>'s `image` prop. */
export function useHtmlImage(src: string | undefined): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src || typeof window === "undefined") {
      setImage(null);
      return;
    }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setImage(img);
    img.src = src;
    return () => {
      img.onload = null;
    };
  }, [src]);

  return image;
}
