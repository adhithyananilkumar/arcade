/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Credentials
 *
 * Read-only: the badge a piece of content awards, compact. For places that show the level without
 * editing it — a reviewer deciding whether to approve, a sidebar.
 * ------------------------------------------------------------------
 */

import { Award } from "lucide-react";
import { CredentialBadge } from "./CredentialBadge";
import type { BadgeLevel } from "../lib/badgeArt";
import type { BadgeAssignment } from "../types/credential.types";

export function BadgeLevelSummary({ assignment }: { assignment: BadgeAssignment }) {
  const tier = assignment.tier;
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Completion badge</p>
      {tier ? (
        <div className="flex items-center gap-3">
          <div className="w-14 shrink-0">
            <CredentialBadge
              family={assignment.contentType}
              level={tier.level as BadgeLevel}
              title={assignment.contentTitle}
              issuerLogoUrl={assignment.issuerLogoUrl}
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{tier.label}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{tier.meaning}</p>
            {assignment.awardedCount > 0 && (
              <p className="mt-1 text-[11px] font-semibold text-emerald-600">{assignment.awardedCount} issued</p>
            )}
          </div>
        </div>
      ) : (
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <Award size={14} className="text-slate-300" /> Awards no badge
        </p>
      )}
    </div>
  );
}
