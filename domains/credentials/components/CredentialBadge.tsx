"use client";

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Credentials
 *
 * A platform badge, drawn. Pure: family and level in, artwork out. Every badge on Arcade renders
 * through this (or the image route that shares its drawing), so a Level 3 course badge looks the
 * same everywhere it appears.
 * ------------------------------------------------------------------
 */

import { useEffect, useId, useMemo, useRef, type PointerEvent } from "react";
import { cn } from "@/shared/utils/utils";
import { renderBadgeSvg, type BadgeFamilyKey, type BadgeLevel } from "../lib/badgeArt";

export interface CredentialBadgeProps {
  family: BadgeFamilyKey;
  level: BadgeLevel;
  /** The content's name, printed on the badge. Omit for the generic level artwork. */
  title?: string;
  /** The issuing organisation's logo, shown in the badge's lower medallion. */
  issuerLogoUrl?: string | null;
  /** Motion by level (sweep · orbiting light · flames) plus a hover tilt. Default on; never when locked or revoked. */
  animate?: boolean;
  /** "metal" (default) blends the org logo into the badge metal; "original" keeps its colours. */
  logoStyle?: "metal" | "original";
  /** Year earned, printed on the badge. */
  year?: number | null;
  /** A Distinguished honour's rating, 1–5, shown as stars on the badge. */
  stars?: number | null;
  /** Not yet earned: drawn in grey. */
  locked?: boolean;
  /** Revoked: drawn in grey with reduced contrast. */
  revoked?: boolean;
  /** Accessible name, e.g. "Level 3 Professional course badge for React Fundamentals". */
  label?: string;
  className?: string;
}

export function CredentialBadge({ family, level, title, issuerLogoUrl, year, stars, animate = true, logoStyle, locked, revoked, label, className }: CredentialBadgeProps) {
  const uid = useId();
  const ref = useRef<HTMLDivElement>(null);
  const live = animate && !locked && !revoked;
  const svg = useMemo(
    () => renderBadgeSvg({ family, level, title, issuerLogoUrl, year, stars, logoStyle, animate: live, uid: `cb${uid}` }),
    [family, level, title, issuerLogoUrl, year, stars, logoStyle, live, uid]
  );

  // A wall of badges should not burn frames off-screen: pause CSS and SVG animations while hidden.
  useEffect(() => {
    const el = ref.current;
    const art = el?.querySelector("svg");
    if (!live || !el || !art || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => {
      el.toggleAttribute("data-paused", !entry.isIntersecting);
      if (entry.isIntersecting) art.unpauseAnimations();
      else art.pauseAnimations();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [live, svg]);

  // The struck-metal feel: the badge tilts toward the pointer.
  const tilt = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateX(${(-y * 14).toFixed(2)}deg) rotateY(${(x * 16).toFixed(2)}deg)`;
  };
  const untilt = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div
      ref={ref}
      role="img"
      aria-label={label ?? `Level ${level} ${family.toLowerCase()} badge${title ? ` for ${title}` : ""}`}
      onPointerMove={live ? tilt : undefined}
      onPointerLeave={live ? untilt : undefined}
      className={cn(
        "relative select-none [&>svg]:block [&>svg]:h-auto [&>svg]:w-full",
        live && "transition-transform duration-300 ease-out [&>svg]:overflow-visible [&[data-paused]_*]:[animation-play-state:paused]",
        locked && "opacity-50 grayscale",
        revoked && "opacity-60 grayscale contrast-75",
        className
      )}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
