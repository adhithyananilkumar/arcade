"use client";

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps (creator)
 *
 * The creator's one badge decision for a course, event or exam: which platform level it awards.
 * Replaces the per-course badge designer. The badge's look, name and criteria are Arcade's, the
 * same for every channel; the server decides who may change the level and when.
 * ------------------------------------------------------------------
 */

import { useEffect, useMemo, useState } from "react";
import { Award, Loader2, Lock, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  BadgeTierPicker,
  CredentialBadge,
  TIER_STYLE,
  credentialsApi,
  type BadgeAssignment,
  type BadgeCatalogue,
  type BadgeContentType,
  type BadgeLevel,
} from "@/domains/credentials";
import { cn } from "@/shared/utils/utils";

const NOUN: Record<BadgeContentType, string> = { COURSE: "course", EVENT: "event", EXAM: "exam" };

const EARNED_BY: Record<BadgeContentType, string> = {
  COURSE: "Issued automatically when a learner completes 100% of the course — every required lesson and assessment.",
  EVENT: "Issued automatically when an attendee is checked in, or passes the event's completion assessment if it has one.",
  EXAM: "Issued automatically when a candidate passes the exam's completion or certification assessment.",
};

export interface BadgeTierPanelProps {
  contentType: BadgeContentType;
  contentId: string;
  /** Forces read-only regardless of what the server allows (e.g. content in review). */
  readOnly?: boolean;
  /** "card" for an overview page; "plain" inside a dialog that already has a frame. */
  variant?: "card" | "plain";
  /** Drop the built-in heading — the host (a numbered Content Overview row) supplies it. */
  bare?: boolean;
  onSaved?: (assignment: BadgeAssignment) => void;
}

export function BadgeTierPanel({ contentType, contentId, readOnly, variant = "card", bare = false, onSaved }: BadgeTierPanelProps) {
  const [catalogue, setCatalogue] = useState<BadgeCatalogue | null>(null);
  const [assignment, setAssignment] = useState<BadgeAssignment | null>(null);
  const [draft, setDraft] = useState<BadgeLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Loads once per content; the panel is remounted (keyed by content) rather than reloaded.
  useEffect(() => {
    let cancelled = false;
    Promise.all([credentialsApi.catalogue(), credentialsApi.getAssignment(contentType, contentId)])
      .then(([cat, current]) => {
        if (cancelled) return;
        setCatalogue(cat);
        setAssignment(current);
        setDraft((current.tier?.level as BadgeLevel | undefined) ?? null);
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Couldn't load the badge settings."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [contentType, contentId]);

  const locked = readOnly || !!assignment?.lockedReason;
  const savedLevel = (assignment?.tier?.level as BadgeLevel | undefined) ?? null;
  const dirty = draft !== savedLevel;
  const draftTier = useMemo(
    () => catalogue?.tiers.find((t) => t.level === draft) ?? null,
    [catalogue, draft]
  );

  const save = async () => {
    if (draft == null) return;
    setSaving(true);
    try {
      const next = await credentialsApi.assignTier(contentType, contentId, draft);
      setAssignment(next);
      onSaved?.(next);
      toast.success(`This ${NOUN[contentType]} now awards a Level ${draft} badge`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save the badge level");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      const next = await credentialsApi.clearTier(contentType, contentId);
      setAssignment(next);
      setDraft(null);
      onSaved?.(next);
      toast.success(`This ${NOUN[contentType]} no longer awards a badge`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't remove the badge");
    } finally {
      setSaving(false);
    }
  };

  const body = (
    <div className="flex flex-col gap-5 py-2">
      {bare ? (
        assignment && <div className="flex">
        {assignment && (
          <span
            className={cn(
              "inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold shadow-2xs",
              savedLevel ? TIER_STYLE[savedLevel].chip : "border-slate-200 bg-surface text-slate-600"
            )}
          >
            {assignment.tier ? assignment.tier.label : "Ribbon badge"}
          </span>
        )}
        </div>
      ) : (
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-base font-extrabold tracking-tight text-slate-900">Completion badge</h3>
            <p className="text-xs font-medium text-slate-500">
              Choose the recognition learners receive after completing this {NOUN[contentType]}.
            </p>
          </div>
        {assignment && (
          <span
            className={cn(
              "inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold shadow-2xs",
              savedLevel ? TIER_STYLE[savedLevel].chip : "border-slate-200 bg-surface text-slate-600"
            )}
          >
            {assignment.tier ? assignment.tier.label : "Ribbon badge"}
          </span>
        )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 size={16} className="animate-spin text-slate-400" />
        </div>
      ) : error || !catalogue || !assignment ? (
        <p className="mt-2 rounded-xl bg-rose-50 px-3.5 py-2 text-xs font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{error ?? "Unavailable."}</p>
      ) : (
        <>
          {assignment.lockedReason && (
            <p className="mt-1 flex items-start gap-2 rounded-xl bg-amber-50 px-3.5 py-2 text-xs font-medium text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
              <Lock size={12} className="mt-0.5 shrink-0" /> {assignment.lockedReason}
            </p>
          )}

          <div className="mt-1 grid gap-5 lg:grid-cols-[220px_1fr]">
            {/* Preview: exactly what learners will receive. */}
            <div className="flex flex-col items-center rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50 to-surface p-4 text-center">
              {draft ? (
                <CredentialBadge
                  family={contentType}
                  level={draft}
                  title={assignment.contentTitle}
                  issuerLogoUrl={assignment.issuerLogoUrl}
                  className="w-40"
                  label={`Level ${draft} ${assignment.family.label} badge`}
                />
              ) : (
                <div className="flex aspect-[240/256] w-40 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                  <Award size={28} />
                  <span className="mt-2 text-xs font-bold">No badge</span>
                </div>
              )}
              <p className="mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                {assignment.family.label}
              </p>
              <p className="text-sm font-extrabold text-slate-900">
                {draftTier ? draftTier.label : "Choose a level"}
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{EARNED_BY[contentType]}</p>
              {assignment.awardedCount > 0 && (
                <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <ShieldCheck size={12} /> {assignment.awardedCount} issued
                </p>
              )}
            </div>

            <div>
              <BadgeTierPicker
                family={contentType}
                tiers={catalogue.tiers}
                contentTitle={assignment.contentTitle}
                issuerLogoUrl={assignment.issuerLogoUrl}
                value={draft}
                onChange={setDraft}
                disabled={locked || saving}
              />
              {assignment.awardedCount > 0 && dirty && (
                <p className="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-[11px] font-medium text-sky-800 dark:bg-sky-500/10 dark:text-sky-200">
                  The {assignment.awardedCount} badge{assignment.awardedCount === 1 ? "" : "s"} already issued keep the level
                  they were earned at. The new level applies to learners who finish from now on.
                </p>
              )}
            </div>
          </div>

          {!locked && (
            <div className="mt-2 flex flex-wrap justify-end gap-2">
              {savedLevel != null && (
                <button
                  type="button"
                  onClick={remove}
                  disabled={saving}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200/90 bg-surface px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-50"
                >
                  <Trash2 size={13} /> Award no badge
                </button>
              )}
              <button
                type="button"
                onClick={save}
                disabled={!dirty || draft == null || saving}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-ink px-7 py-2.5 text-xs font-extrabold text-on-ink shadow-md transition-all hover:bg-[#205ca8] disabled:opacity-50"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Award size={13} />}
                {savedLevel == null ? "Save badge" : "Save level"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  return body;
}
