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

import { useId, useMemo } from "react";
import { cn } from "@/shared/utils/utils";
import { renderBadgeSvg, type BadgeFamilyKey, type BadgeLevel } from "../lib/badgeArt";

export interface CredentialBadgeProps {
  family: BadgeFamilyKey;
  level: BadgeLevel;
  /** The content's name, printed on the badge. Omit for the generic level artwork. */
  title?: string;
  /** The issuing organisation's logo, shown in the badge's lower medallion. */
  issuerLogoUrl?: string | null;
  /** Not yet earned: drawn in grey. */
  locked?: boolean;
  /** Revoked: drawn in grey with reduced contrast. */
  revoked?: boolean;
  /** Accessible name, e.g. "Level 3 Professional course badge for React Fundamentals". */
  label?: string;
  className?: string;
}

export function CredentialBadge({ family, level, title, issuerLogoUrl, locked, revoked, label, className }: CredentialBadgeProps) {
  const uid = useId();
  const svg = useMemo(
    () => renderBadgeSvg({ family, level, title, issuerLogoUrl, uid: `cb${uid}` }),
    [family, level, title, issuerLogoUrl, uid]
  );
  return (
    <div
      role="img"
      aria-label={label ?? `Level ${level} ${family.toLowerCase()} badge${title ? ` for ${title}` : ""}`}
      className={cn(
        "relative select-none [&>svg]:block [&>svg]:h-auto [&>svg]:w-full",
        locked && "opacity-50 grayscale",
        revoked && "opacity-60 grayscale contrast-75",
        className
      )}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
