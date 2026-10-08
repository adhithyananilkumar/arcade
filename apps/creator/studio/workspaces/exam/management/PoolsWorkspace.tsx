"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Boxes, Check, Eye, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deletePool,
  getPoolMembers,
  previewPoolDraft,
  promptToPlainText,
  searchBankQuestions,
  setPoolMembers,
  updatePool,
  type BankQuestionResponse,
  type BankQuestionType,
  type Difficulty,
  type QuestionPoolDetail,
  type QuestionPoolFilterRequest,
  type SectionResponse,
} from "@/domains/assessments";
import {
  StudioCanvasEmpty,
  StudioCanvasLoading,
} from "@/apps/creator/studio/core/StudioShell";

/**
 * The Question Pools workspace.
 *
 * <p>A pool is a reusable group of questions an exam plan can draw from. The important kind is
 * DYNAMIC: a saved filter over the bank, whose matching set changes on its own as questions are
 * added, retagged or removed. That is what makes a pool worth creating rather than repeating the
 * same filter in every plan — "Java · Medium" written once stays correct forever.
 *
 * <p>The match count is live and server-computed while the author is still adjusting facets
 * (nothing is committed until Save), so the number they see is the number the selection engine
 * will actually draw from. Pools remain optional throughout: a plan can select straight from the
 * bank without one.
 */

const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];
const TYPES: BankQuestionType[] = ["SINGLE", "MULTIPLE", "TRUE_FALSE", "SENTENCE"];
const TYPE_LABELS: Record<BankQuestionType, string> = {
  SINGLE: "Single answer",
  MULTIPLE: "Multiple select",
  TRUE_FALSE: "True / False",
  SENTENCE: "Sentence answer",
};

type Draft = Required<Pick<QuestionPoolFilterRequest, "title" | "description" | "mode">> & {
  sectionIds: string[];
  difficulties: Difficulty[];
  questionTypes: BankQuestionType[];
  tags: string[];
};

function toDraft(pool: QuestionPoolDetail): Draft {
  return {
    title: pool.title,
    description: pool.description ?? "",
    mode: pool.mode,
    sectionIds: pool.sectionIds,
    difficulties: pool.difficulties,
    questionTypes: pool.questionTypes,
    tags: pool.tags,
  };
}

function sameFilter(a: Draft, b: Draft) {
  const key = (d: Draft) =>
    JSON.stringify([d.title, d.description, d.mode, d.sectionIds, d.difficulties, d.questionTypes, d.tags]);
  return key(a) === key(b);
}

export function PoolsWorkspace({
  bankId,
  pool,
  sections,
  onChanged,
  onCreate,
  readOnly,
}: {
  bankId: string | null;
  /** The pool the sidebar has selected, or null when none is open. */
  pool: QuestionPoolDetail | null;
  sections: SectionResponse[];
  onChanged: () => void;
  onCreate: () => void;
  readOnly?: boolean;
}) {
  const [draft, setDraft] = useState<Draft | null>(pool ? toDraft(pool) : null);
  const [saving, setSaving] = useState(false);
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [sample, setSample] = useState<BankQuestionResponse[]>([]);
  const [countLoading, setCountLoading] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  // Hand-picked pools: the chosen question ids, as saved and as being edited. Before this the
  // MANUAL mode had no picker at all and Save sent no members, so a pool showing "6 matching"
  // saved as an empty pool no plan could draw from (BUG-1070).
  // Both are tagged with the pool they belong to, so switching pools never shows another pool's
  // selection while the new one loads.
  const [loadedMembers, setLoadedMembers] = useState<{ poolId: string; ids: string[] } | null>(null);
  const [editedMembers, setEditedMembers] = useState<{ poolId: string; ids: string[] } | null>(null);
  const [bankQuestions, setBankQuestions] = useState<BankQuestionResponse[] | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");

  const savedMembers = useMemo(
    () => (pool && pool.mode === "MANUAL" && loadedMembers?.poolId === pool.id ? loadedMembers.ids : []),
    [pool, loadedMembers]
  );
  const members = pool && editedMembers?.poolId === pool.id ? editedMembers.ids : savedMembers;
  const setMembers = useCallback(
    (next: string[] | ((prev: string[]) => string[])) => {
      if (!pool) return;
      setEditedMembers((prev) => {
        const current = prev?.poolId === pool.id ? prev.ids : savedMembers;
        return { poolId: pool.id, ids: typeof next === "function" ? next(current) : next };
      });
    },
    [pool, savedMembers]
  );

  useEffect(() => {
    if (!pool || pool.mode !== "MANUAL") return;
    let cancelled = false;
    getPoolMembers(pool.id)
      .then((ids) => {
        if (!cancelled) setLoadedMembers({ poolId: pool.id, ids });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [pool]);

  const manual = draft?.mode === "MANUAL";
  useEffect(() => {
    if (!bankId || !manual || bankQuestions) return;
    searchBankQuestions(bankId, { limit: 200 })
      .then((page) => setBankQuestions(page.questions))
      .catch(() => setBankQuestions([]));
  }, [bankId, manual, bankQuestions]);

  useEffect(() => {
    if (!bankId) return;
    searchBankQuestions(bankId, { limit: 1 })
      .then((page) => setAvailableTags(page.availableTags))
      .catch(() => setAvailableTags([]));
  }, [bankId]);

  // Live match count. Debounced because each facet click would otherwise fire a query, and the
  // author usually clicks several in a row.
  useEffect(() => {
    // A hand-picked pool's count is its selection, derived at render (see `shownCount`).
    if (!bankId || !draft || draft.mode !== "DYNAMIC") return;
    let cancelled = false;
    setCountLoading(true);
    const timer = setTimeout(() => {
      previewPoolDraft(bankId, {
        mode: "DYNAMIC",
        sectionIds: draft.sectionIds,
        difficulties: draft.difficulties,
        questionTypes: draft.questionTypes,
        tags: draft.tags,
      })
        .then((preview) => {
          if (cancelled) return;
          setMatchCount(preview.matchingCount);
          setSample(preview.questions);
        })
        .catch(() => {
          if (!cancelled) setMatchCount(null);
        })
        .finally(() => {
          if (!cancelled) setCountLoading(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [bankId, draft]);

  const shownCount = draft?.mode === "MANUAL" ? members.length : matchCount;
  const shownLoading = draft?.mode !== "MANUAL" && countLoading;

  const membersChanged =
    manual && (members.length !== savedMembers.length || members.some((id) => !savedMembers.includes(id)));
  const dirty = useMemo(
    () => Boolean(draft && pool && (!sameFilter(draft, toDraft(pool)) || membersChanged)),
    [draft, pool, membersChanged]
  );

  const patch = useCallback((changes: Partial<Draft>) => {
    setDraft((prev) => (prev ? { ...prev, ...changes } : prev));
  }, []);

  /**
   * Switching a filtered pool to hand-picked starts from what the filters match now, so the
   * questions the author was looking at stay in the pool instead of silently becoming zero.
   */
  const switchMode = async (mode: Draft["mode"]) => {
    if (!draft || mode === draft.mode) return;
    patch({ mode });
    if (mode !== "MANUAL" || members.length > 0 || !bankId) return;
    try {
      const page = await searchBankQuestions(bankId, {
        sectionIds: draft.sectionIds,
        difficulties: draft.difficulties,
        types: draft.questionTypes,
        tags: draft.tags,
        limit: 200,
      });
      setMembers(page.questions.map((q) => q.id));
    } catch {
      // The picker below still works; the author just starts from an empty selection.
    }
  };

  const toggle = useCallback(
    <T,>(list: T[], value: T): T[] =>
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    []
  );

  const save = async () => {
    if (!pool || !draft) return;
    setSaving(true);
    try {
      await updatePool(pool.id, {
        title: draft.title,
        description: draft.description,
        mode: draft.mode,
        sectionIds: draft.sectionIds,
        difficulties: draft.difficulties,
        questionTypes: draft.questionTypes,
        tags: draft.tags,
      });
      if (draft.mode === "MANUAL") {
        await setPoolMembers(pool.id, { questionIds: members });
        setLoadedMembers({ poolId: pool.id, ids: members });
        setEditedMembers(null);
      }
      toast.success("Pool saved");
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save this pool");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!pool) return;
    try {
      await deletePool(pool.id);
      toast.success("Pool deleted");
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete this pool");
    }
  };

  if (!bankId) return <StudioCanvasLoading label="Opening the question bank…" />;

  if (!pool || !draft) {
    return (
      <StudioCanvasEmpty
        icon={Boxes}
        title="Create a pool to reuse filtered groups of questions"
        description="A pool is a named group of questions your exam plans can draw from — for example every medium OOP question. Set it up once with filters and it keeps itself up to date as the bank grows."
        action={
          !readOnly && (
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-xs font-bold text-on-ink transition-colors hover:bg-ink-hover"
            >
              <Plus size={14} /> New pool
            </button>
          )
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Identity ────────────────────────────────────────────────────── */}
      <div className="border-t border-slate-200/70 pt-6 first:border-t-0 first:pt-0">
        <label htmlFor="pool-title" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Pool name
        </label>
        <input
          id="pool-title"
          value={draft.title}
          disabled={readOnly}
          onChange={(e) => patch({ title: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-surface px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 dark:focus:border-indigo-500/40 dark:focus:ring-indigo-500/25"
        />
        <label htmlFor="pool-desc" className="mb-1.5 mt-4 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Description <span className="font-medium normal-case text-slate-300">(optional)</span>
        </label>
        <input
          id="pool-desc"
          value={draft.description}
          disabled={readOnly}
          onChange={(e) => patch({ description: e.target.value })}
          placeholder="What this pool is for"
          className="w-full rounded-xl border border-slate-200 bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-slate-300 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 dark:focus:border-indigo-500/40 dark:focus:ring-indigo-500/25"
        />
      </div>

      {/* ── Mode ────────────────────────────────────────────────────────── */}
      <div className="border-t border-slate-200/70 pt-6 first:border-t-0 first:pt-0">
        <span className="mb-3 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
          How this pool picks questions
        </span>
        <div className="grid gap-2 sm:grid-cols-2">
          {(["DYNAMIC", "MANUAL"] as const).map((mode) => {
            const on = draft.mode === mode;
            return (
              <button
                key={mode}
                type="button"
                disabled={readOnly}
                onClick={() => void switchMode(mode)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  on
                    ? "border-indigo-300 bg-indigo-50/60 ring-1 ring-indigo-200 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:ring-indigo-500/25"
                    : "border-slate-200 bg-surface hover:border-slate-300"
                }`}
              >
                <span className="flex items-center gap-1.5 text-xs font-bold text-ink">
                  {on && <Check size={13} className="text-indigo-600 dark:text-indigo-400" />}
                  {mode === "DYNAMIC" ? "Matches filters" : "Hand-picked"}
                </span>
                <span className="mt-1 block text-[11px] leading-relaxed text-slate-500">
                  {mode === "DYNAMIC"
                    ? "Every question matching the filters below, updated automatically as the bank changes."
                    : "A fixed list of questions you choose. It only changes when you edit it."}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      {draft.mode === "DYNAMIC" && (
        <div className="border-t border-slate-200/70 pt-6 first:border-t-0 first:pt-0">
          <span className="mb-4 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Filters
          </span>

          <FacetRow label="Sections">
            {sections.length === 0 ? (
              <span className="text-xs text-slate-400">No sections in this bank yet.</span>
            ) : (
              sections.map((s) => (
                <Facet
                  key={s.id}
                  on={draft.sectionIds.includes(s.id)}
                  disabled={readOnly}
                  onClick={() => patch({ sectionIds: toggle(draft.sectionIds, s.id) })}
                >
                  {s.title}
                </Facet>
              ))
            )}
          </FacetRow>

          <FacetRow label="Difficulty">
            {DIFFICULTIES.map((d) => (
              <Facet
                key={d}
                on={draft.difficulties.includes(d)}
                disabled={readOnly}
                onClick={() => patch({ difficulties: toggle(draft.difficulties, d) })}
              >
                <span className="capitalize">{d.toLowerCase()}</span>
              </Facet>
            ))}
          </FacetRow>

          <FacetRow label="Question type">
            {TYPES.map((t) => (
              <Facet
                key={t}
                on={draft.questionTypes.includes(t)}
                disabled={readOnly}
                onClick={() => patch({ questionTypes: toggle(draft.questionTypes, t) })}
              >
                {TYPE_LABELS[t]}
              </Facet>
            ))}
          </FacetRow>

          <FacetRow label="Tags">
            {availableTags.length === 0 ? (
              <span className="text-xs text-slate-400">
                Tag your questions to filter by topic here.
              </span>
            ) : (
              availableTags.map((tag) => (
                <Facet
                  key={tag}
                  on={draft.tags.includes(tag)}
                  disabled={readOnly}
                  onClick={() => patch({ tags: toggle(draft.tags, tag) })}
                >
                  {tag}
                </Facet>
              ))
            )}
          </FacetRow>

          <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
            Filters combine: a question has to match every one you set. Leave a row untouched to
            put no constraint on it.
          </p>
        </div>
      )}

      {/* ── Hand-picked questions ───────────────────────────────────────── */}
      {draft.mode === "MANUAL" && (
        <div className="border-t border-slate-200/70 pt-6 first:border-t-0 first:pt-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Questions in this pool · {members.length} selected
            </span>
            <input
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              placeholder="Search questions"
              className="w-full max-w-xs rounded-xl border border-slate-200 bg-surface px-3 py-1.5 text-xs text-ink outline-none placeholder:text-slate-300 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 dark:focus:border-indigo-500/40 dark:focus:ring-indigo-500/25"
            />
          </div>
          {bankQuestions === null ? (
            <div className="flex justify-center py-6">
              <Loader2 size={18} className="animate-spin text-slate-400" />
            </div>
          ) : bankQuestions.length === 0 ? (
            <p className="text-xs text-slate-400">This bank has no questions yet. Write some first.</p>
          ) : (
            <ul className="max-h-80 space-y-1 overflow-y-auto rounded-xl border border-slate-200 bg-surface p-2 arcade-scrollbar-mini">
              {bankQuestions
                .filter((q) => {
                  const term = pickerSearch.trim().toLowerCase();
                  return !term || promptToPlainText(q.prompt).toLowerCase().includes(term);
                })
                .map((q) => {
                  const on = members.includes(q.id);
                  return (
                    <li key={q.id}>
                      <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={on}
                          disabled={readOnly}
                          onChange={() =>
                            setMembers((prev) => (on ? prev.filter((id) => id !== q.id) : [...prev, q.id]))
                          }
                          className="mt-0.5 accent-indigo-600"
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {promptToPlainText(q.prompt) || "Untitled question"}
                        </span>
                      </label>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
      )}

      {/* ── Live match ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-indigo-200/70 bg-indigo-50/40 p-5 shadow-sm dark:border-indigo-500/25 dark:bg-indigo-500/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tight text-ink">
                {shownLoading ? <Loader2 size={20} className="animate-spin text-indigo-500" /> : (shownCount ?? "—")}
              </span>
              <span className="text-sm font-semibold text-ink/60">
                question{shownCount === 1 ? "" : "s"} {draft.mode === "MANUAL" ? "picked" : "match"}
              </span>
            </span>
            {shownCount === 0 && (
              <p className="mt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                {draft.mode === "MANUAL"
                  ? "No questions picked yet — a plan drawing from this pool won't be able to build a paper."
                  : "Nothing matches these filters yet — a plan drawing from this pool won't be able to build a paper."}
              </p>
            )}
          </div>
          {draft.mode === "DYNAMIC" && sample.length > 0 && (
            <button
              type="button"
              onClick={() => setShowSample((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-surface px-3 py-1.5 text-xs font-bold text-indigo-700 transition-colors hover:bg-indigo-50 dark:border-indigo-500/25 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
            >
              <Eye size={13} /> {showSample ? "Hide" : "View"} questions
            </button>
          )}
        </div>

        {showSample && (
          <ul className="mt-4 max-h-64 space-y-1 overflow-y-auto rounded-xl bg-surface/80 p-2 arcade-scrollbar-mini">
            {sample.map((q) => (
              <li key={q.id} className="truncate rounded-lg px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50">
                {promptToPlainText(q.prompt) || "Untitled question"}
              </li>
            ))}
            {matchCount !== null && matchCount > sample.length && (
              <li className="px-2 py-1.5 text-[11px] font-semibold text-slate-400">
                and {matchCount - sample.length} more…
              </li>
            )}
          </ul>
        )}
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      {!readOnly && (
        <div className="flex shrink-0 items-center justify-between gap-3 pb-2">
          <button
            type="button"
            onClick={remove}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-surface px-3.5 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-500/25 dark:text-rose-400 dark:hover:bg-rose-500/10"
          >
            <Trash2 size={13} /> Delete pool
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-xs font-bold text-on-ink transition-colors hover:bg-ink-hover disabled:opacity-40"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            {dirty ? "Save changes" : "Saved"}
          </button>
        </div>
      )}
    </div>
  );
}

function FacetRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 last:mb-0">
      <span className="w-full shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:w-28">
        {label}
      </span>
      <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Facet({
  on,
  disabled,
  onClick,
  children,
}: {
  on: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={disabled}
      onClick={onClick}
      className={`max-w-[200px] truncate rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:opacity-60 ${
        on
          ? "bg-indigo-600 text-white shadow-sm"
          : "border border-slate-200 bg-surface text-slate-500 hover:border-indigo-200 hover:text-indigo-700 dark:hover:border-indigo-500/25 dark:hover:text-indigo-300"
      }`}
    >
      {children}
    </button>
  );
}
