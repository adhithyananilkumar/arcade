/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Credentials
 *
 * The three levels, highest first, with one marked — so a reader sees not just "Level 2" but where
 * Level 2 sits in the platform standard.
 * ------------------------------------------------------------------
 */

import { Check } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import { CredentialBadge } from "./CredentialBadge";
import type { BadgeFamilyKey, BadgeLevel } from "../lib/badgeArt";
import type { BadgeTierInfo } from "../types/credential.types";

export interface TierLadderProps {
  tiers: BadgeTierInfo[];
  family: BadgeFamilyKey;
  /** The level to mark. */
  current?: number | null;
  currentLabel?: string;
  /** Hide the per-level guidance and keep only the meaning. */
  compact?: boolean;
  className?: string;
}

export function TierLadder({ tiers, family, current, currentLabel = "This badge", compact, className }: TierLadderProps) {
  const ordered = [...tiers].sort((a, b) => b.level - a.level);
  return (
    <ol className={cn("flex flex-col gap-1.5", className)} aria-label="Arcade badge levels, highest first">
      {ordered.map((tier) => {
        const level = tier.level as BadgeLevel;
        const isCurrent = current === level;
        return (
          <li
            key={tier.level}
            aria-current={isCurrent ? "true" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-3 py-2.5",
              isCurrent
                ? "border-slate-300 bg-surface shadow-sm"
                : "border-slate-200/70 bg-slate-50/60"
            )}
          >
            <div className={cn("w-10 shrink-0", !isCurrent && current != null && "opacity-60")}>
              <CredentialBadge family={family} level={level} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900">{tier.label}</p>
              <p className="mt-0.5 text-xs leading-snug text-slate-600">{tier.meaning}</p>
              {!compact && <p className="mt-0.5 text-[11px] leading-snug text-slate-400">{tier.guidance}</p>}
            </div>
            {isCurrent && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-on-ink">
                <Check size={11} strokeWidth={3} /> {currentLabel}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
