/**
 * Semantic icon registry for BadgeIconObject. `iconId` in the document is one of
 * these keys — never rasterized, resolved to an actual vector icon at render
 * time (see useBadgeIconImage below), so a future renderer (SVG export, a
 * different icon set) can resolve the same id differently without touching
 * BadgeDocument. Icons come from lucide-react, already a project dependency —
 * this registry is the only place that imports individual icon components, so
 * swapping the underlying icon set later means editing this one file.
 */
import { createElement, useEffect, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { LucideIcon } from "lucide-react";
import {
  Trophy,
  Medal,
  Award,
  Star,
  GraduationCap,
  BookOpen,
  FileBadge,
  Code2,
  TerminalSquare,
  Cpu,
  Database,
  Cloud,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Crown,
  Zap,
} from "lucide-react";

export interface BadgeIconCategory {
  label: string;
  icons: Array<{ id: string; label: string }>;
}

const ICON_COMPONENTS: Record<string, LucideIcon> = {
  trophy: Trophy,
  medal: Medal,
  award: Award,
  star: Star,
  "graduation-cap": GraduationCap,
  book: BookOpen,
  certificate: FileBadge,
  code: Code2,
  terminal: TerminalSquare,
  cpu: Cpu,
  database: Database,
  cloud: Cloud,
  check: CheckCircle2,
  spark: Sparkles,
  shield: ShieldCheck,
  crown: Crown,
  lightning: Zap,
};

export const BADGE_ICON_CATEGORIES: BadgeIconCategory[] = [
  {
    label: "Achievement",
    icons: [
      { id: "trophy", label: "Trophy" },
      { id: "medal", label: "Medal" },
      { id: "award", label: "Award" },
      { id: "star", label: "Star" },
    ],
  },
  {
    label: "Education",
    icons: [
      { id: "graduation-cap", label: "Graduation Cap" },
      { id: "book", label: "Book" },
      { id: "certificate", label: "Certificate" },
    ],
  },
  {
    label: "Technical",
    icons: [
      { id: "code", label: "Code" },
      { id: "terminal", label: "Terminal" },
      { id: "cpu", label: "CPU" },
      { id: "database", label: "Database" },
      { id: "cloud", label: "Cloud" },
    ],
  },
  {
    label: "General",
    icons: [
      { id: "check", label: "Check" },
      { id: "spark", label: "Spark" },
      { id: "shield", label: "Shield" },
      { id: "crown", label: "Crown" },
      { id: "lightning", label: "Lightning" },
    ],
  },
];

export function getBadgeIconComponent(iconId: string): LucideIcon {
  return ICON_COMPONENTS[iconId] ?? ShieldCheck;
}

const dataUrlCache = new Map<string, string>();

function buildIconDataUrl(iconId: string, color: string, strokeWidth: number): string {
  const key = `${iconId}:${color}:${strokeWidth}`;
  const cached = dataUrlCache.get(key);
  if (cached) return cached;

  const Icon = getBadgeIconComponent(iconId);
  // 100x100 at a generous strokeWidth headroom — Konva scales the resulting image
  // to the object's actual width/height, so the source resolution just needs to
  // stay crisp at typical on-canvas sizes (badges render up to 4096px).
  const markup = renderToStaticMarkup(createElement(Icon, { size: 100, color, strokeWidth, absoluteStrokeWidth: true }));
  const url = `data:image/svg+xml;base64,${typeof window !== "undefined" ? window.btoa(markup) : ""}`;
  dataUrlCache.set(key, url);
  return url;
}

/** Loads a badge icon as an HTMLImageElement for use as a Konva <Image>'s `image` prop. */
export function useBadgeIconImage(iconId: string, color: string, strokeWidth = 2): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const img = new window.Image();
    img.onload = () => setImage(img);
    img.src = buildIconDataUrl(iconId, color, strokeWidth);
    return () => {
      img.onload = null;
    };
  }, [iconId, color, strokeWidth]);

  return image;
}
