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
  onSaved?: (assignment: BadgeAssignment) => void;
}

export function BadgeTierPanel({ contentType, contentId, readOnly, variant = "card", onSaved }: BadgeTierPanelProps) {
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
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-black tracking-tight text-[#14142b] dark:text-white">
            <Award size={15} className="text-slate-400" /> Completion badge
          </h3>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-500">
            Arcade issues every badge to one central standard. You choose the level this {NOUN[contentType]} awards;
            the design and criteria are the same across the platform, the badge carries this {NOUN[contentType]}&apos;s
            name, and every badge is publicly verifiable.
          </p>
        </div>
        {assignment && (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
              savedLevel ? TIER_STYLE[savedLevel].chip : "border-slate-200 bg-slate-50 text-slate-500"
            )}
          >
            {assignment.tier ? assignment.tier.label : "No badge"}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 size={16} className="animate-spin text-slate-400" />
        </div>
      ) : error || !catalogue || !assignment ? (
        <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{error ?? "Unavailable."}</p>
      ) : (
        <>
          {assignment.lockedReason && (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-800">
              <Lock size={12} className="mt-0.5 shrink-0" /> {assignment.lockedReason}
            </p>
          )}

          <div className="mt-4 grid gap-5 lg:grid-cols-[220px_1fr]">
            {/* Preview: exactly what learners will receive. */}
            <div className="flex flex-col items-center rounded-2xl border border-slate-200/70 bg-gradient-to-b from-slate-50 to-white p-4 text-center dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
              {draft ? (
                <CredentialBadge
                  family={contentType}
                  level={draft}
                  title={assignment.contentTitle}
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
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                {draftTier ? draftTier.label : "Choose a level"}
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{EARNED_BY[contentType]}</p>
              {assignment.awardedCount > 0 && (
                <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                  <ShieldCheck size={12} /> {assignment.awardedCount} issued
                </p>
              )}
            </div>

            <div>
              <BadgeTierPicker
                family={contentType}
                tiers={catalogue.tiers}
                contentTitle={assignment.contentTitle}
                value={draft}
                onChange={setDraft}
                disabled={locked || saving}
              />
              {assignment.awardedCount > 0 && dirty && (
                <p className="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-[11px] font-medium text-sky-800">
                  The {assignment.awardedCount} badge{assignment.awardedCount === 1 ? "" : "s"} already issued keep the level
                  they were earned at. The new level applies to learners who finish from now on.
                </p>
              )}
            </div>
          </div>

          {!locked && (
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              {savedLevel != null && (
                <button
                  type="button"
                  onClick={remove}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  <Trash2 size={13} /> Award no badge
                </button>
              )}
              <button
                type="button"
                onClick={save}
                disabled={!dirty || draft == null || saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#14142b] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#23234a] disabled:opacity-40"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Award size={13} />}
                {savedLevel == null ? "Award this badge" : "Save level"}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );

  if (variant === "plain") return <div>{body}</div>;
  return (
    <section className="rounded-2xl border border-white/50 bg-white/70 p-5 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/70">
      {body}
    </section>
  );
}
