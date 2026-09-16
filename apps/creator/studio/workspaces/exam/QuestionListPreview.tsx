"use client";

import { useEffect, useState } from "react";
import { FileQuestion, Plus, Search, X } from "lucide-react";
import {
  promptToPlainText,
  searchBankQuestions,
  type BankQuestionResponse,
  type Difficulty,
  type SectionResponse,
} from "@/domains/assessments";
import { TiptapContentView } from "@/domains/learning";
import {
  StudioCanvasEmpty,
  StudioCanvasError,
  StudioCanvasLoading,
} from "@/apps/creator/studio/core/StudioShell";

/**
 * Every question in scope, read straight through as a scrollable page.
 *
 * <p>This replaces a paginated table. A table answered "which questions exist" in the abstract; an
 * author reviewing a bank wants to <em>read</em> the questions — their actual rendered prompt and
 * options, in order, the way a candidate will meet them. Clicking one opens it for editing.
 *
 * <p>Paging still happens on the server; it is just spelled as "load more" rather than page
 * numbers, so a bank of any size stays scrollable without the browser holding all of it.
 */

const PAGE_SIZE = 20;

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  EASY: "bg-emerald-50 text-emerald-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  HARD: "bg-rose-50 text-rose-700",
};

const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

export function QuestionListPreview({
  bankId,
  sections,
  activeSectionId,
  reloadKey,
  onOpenQuestion,
  onAddQuestion,
  readOnly,
}: {
  bankId: string | null;
  sections: SectionResponse[];
  /** The section the tree has selected, or "" for every section. */
  activeSectionId: string;
  /** Bump to re-read after an edit elsewhere. */
  reloadKey: number;
  onOpenQuestion: (question: BankQuestionResponse) => void;
  onAddQuestion?: () => void;
  readOnly?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);

  const [rows, setRows] = useState<BankQuestionResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // A narrowed result set is read from the top — keeping an expanded window would leave the
  // reader scrolled past content that no longer exists.
  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [activeSectionId, difficulties, debouncedSearch]);

  useEffect(() => {
    if (!bankId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    searchBankQuestions(bankId, {
      sectionIds: activeSectionId ? [activeSectionId] : undefined,
      difficulties: difficulties.length > 0 ? difficulties : undefined,
      search: debouncedSearch,
      offset: 0,
      limit,
    })
      .then((page) => {
        if (cancelled) return;
        setRows(page.questions);
        setTotal(page.total);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load these questions.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bankId, activeSectionId, difficulties, debouncedSearch, limit, reloadKey]);

  if (!bankId) return <StudioCanvasLoading label="Opening the question bank…" />;
  if (error) return <StudioCanvasError message={error} onRetry={() => setLimit(PAGE_SIZE)} />;

  const hasFilters = Boolean(debouncedSearch) || difficulties.length > 0;
  const sectionTitle = (id: string) => sections.find((s) => s.id === id)?.title ?? "Unsectioned";

  return (
    <div className="flex flex-col gap-4">
      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions…"
            aria-label="Search questions"
            className="w-full rounded-xl border border-white/50 bg-white/70 py-2 pl-9 pr-8 text-xs font-medium text-[#14142b] shadow-sm outline-none backdrop-blur-md placeholder:text-slate-400 focus:border-indigo-200 focus:ring-2 focus:ring-indigo-100"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              title="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-white/50 bg-white/70 p-1 shadow-sm backdrop-blur-md">
          {DIFFICULTIES.map((d) => {
            const on = difficulties.includes(d);
            return (
              <button
                key={d}
                type="button"
                aria-pressed={on}
                onClick={() => setDifficulties((prev) => (on ? prev.filter((x) => x !== d) : [...prev, d]))}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold capitalize transition-colors ${
                  on ? DIFFICULTY_STYLES[d] : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {d.toLowerCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── The questions ───────────────────────────────────────────────── */}
      {loading && rows.length === 0 ? (
        <StudioCanvasLoading label="Loading questions…" />
      ) : rows.length === 0 ? (
        hasFilters ? (
          <StudioCanvasEmpty
            icon={Search}
            title="No questions match these filters"
            description="Try clearing a filter or widening your search."
            action={
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setDifficulties([]);
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-[#14142b] transition-colors hover:bg-slate-50"
              >
                Clear filters
              </button>
            }
          />
        ) : sections.length === 0 ? (
          <StudioCanvasEmpty
            icon={FileQuestion}
            title="Add a section to start writing questions"
            description="Questions live inside a section, so a section comes first. Exam plans can then draw from a whole section, or from a pool built out of one."
          />
        ) : (
          <StudioCanvasEmpty
            icon={FileQuestion}
            title="Add your first question"
            description="Questions live in the question bank and can be reused by any exam plan built on top of it."
            action={
              onAddQuestion && !readOnly ? (
                <button
                  type="button"
                  onClick={onAddQuestion}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#14142b] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-black"
                >
                  <Plus size={14} /> New question
                </button>
              ) : undefined
            }
          />
        )
      ) : (
        <>
          <ol className="flex flex-col gap-3">
            {rows.map((q, index) => (
              <li key={q.id}>
                <button
                  type="button"
                  onClick={() => onOpenQuestion(q)}
                  className="w-full rounded-2xl border border-white/50 bg-white/70 p-5 text-left shadow-sm backdrop-blur-md transition-all hover:border-indigo-200 hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-[#14142b] text-[11px] font-bold text-white">
                      {index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-[#14142b]">
                        {promptToPlainText(q.prompt) ? (
                          <TiptapContentView body={JSON.stringify(q.prompt)} />
                        ) : (
                          <span className="italic text-slate-300">Untitled question</span>
                        )}
                      </div>

                      {q.options.length > 0 && (
                        <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                          {q.options.map((o, i) => (
                            <li
                              key={o.id}
                              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs ${
                                o.correct
                                  ? "border-emerald-200 bg-emerald-50/60 text-emerald-800"
                                  : "border-slate-100 text-slate-600"
                              }`}
                            >
                              <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-current text-[9px] font-bold opacity-60">
                                {String.fromCharCode(65 + i)}
                              </span>
                              <span className="truncate">{o.text || "—"}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-semibold">
                        <span className={`rounded-full px-2 py-0.5 capitalize ${DIFFICULTY_STYLES[q.difficulty]}`}>
                          {q.difficulty.toLowerCase()}
                        </span>
                        {!activeSectionId && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">
                            {sectionTitle(q.sectionId)}
                          </span>
                        )}
                        <span className="text-slate-400">
                          {q.points} mark{q.points === 1 ? "" : "s"}
                        </span>
                        {q.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ol>

          {rows.length < total && (
            <button
              type="button"
              onClick={() => setLimit((l) => l + PAGE_SIZE)}
              disabled={loading}
              className="mx-auto rounded-xl border border-white/50 bg-white/70 px-5 py-2 text-xs font-bold text-[#14142b] shadow-sm backdrop-blur-md transition-colors hover:bg-white disabled:opacity-50"
            >
              {loading ? "Loading…" : `Show more (${total - rows.length} left)`}
            </button>
          )}

          {onAddQuestion && !readOnly && (
            <button
              type="button"
              onClick={onAddQuestion}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-xs font-bold text-slate-400 transition-colors hover:border-slate-400 hover:bg-white/60 hover:text-[#14142b]"
            >
              <Plus size={14} /> Add question
            </button>
          )}
        </>
      )}
    </div>
  );
}
