// domains/assessments/components/QuestionPoolsPanel.tsx
// Question pools are curated, reference-based subsets of a bank's questions that an exam
// blueprint can draw from — a pool never copies question content, only which questions belong
// to it. Left rail lists pools (create/rename/delete); right panel is a checklist of every
// question in the bank, toggled in/out of the selected pool.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Boxes, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import {
  createPool,
  deletePool,
  getAllBankQuestions,
  getPoolMembers,
  listPools,
  renamePool,
  setPoolMembers,
} from "../api";
import type { BankQuestionResponse, QuestionPoolResponse } from "../types";
import { PromptView } from "./prompt-editor/PromptView";

interface QuestionPoolsPanelProps {
  bankId: string;
  className?: string;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  EASY: "bg-emerald-50 text-emerald-700 border-emerald-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  HARD: "bg-rose-50 text-rose-700 border-rose-200",
};

function PoolRow({
  pool,
  active,
  onSelect,
  onRename,
  onDelete,
}: {
  pool: QuestionPoolResponse;
  active: boolean;
  onSelect: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(pool.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const commitRename = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== pool.title) onRename(trimmed);
    else setDraft(pool.title);
  };

  return (
    <div
      className={`group flex items-center gap-1 rounded-xl px-2 py-1.5 transition-colors ${
        active ? "bg-[#14142b] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {editing ? (
        <input
          ref={inputRef}
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") {
              setDraft(pool.title);
              setEditing(false);
            }
          }}
          className="min-w-0 flex-1 rounded-md border border-indigo-300 bg-white px-1.5 py-0.5 text-xs text-gray-800 outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={onSelect}
          onDoubleClick={() => setEditing(true)}
          className="min-w-0 flex-1 truncate text-left text-xs font-semibold"
          title={pool.title}
        >
          {pool.title}
        </button>
      )}

      <span
        className={`flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
          active ? "bg-white/15 text-white/80" : "bg-gray-100 text-gray-400"
        }`}
      >
        {pool.questionCount}
      </span>

      <div className="flex flex-shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          title="Rename pool"
          onClick={() => setEditing(true)}
          className={`rounded p-1 transition-colors ${
            active ? "text-white/70 hover:bg-white/10 hover:text-white" : "text-gray-400 hover:bg-gray-200 hover:text-gray-700"
          }`}
        >
          <Pencil size={11} />
        </button>
        <button
          type="button"
          title="Delete pool"
          onClick={onDelete}
          className={`rounded p-1 transition-colors ${
            active ? "text-white/70 hover:bg-rose-500/80 hover:text-white" : "text-gray-400 hover:bg-red-50 hover:text-red-600"
          }`}
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}

export function QuestionPoolsPanel({ bankId, className = "" }: QuestionPoolsPanelProps) {
  const [pools, setPools] = useState<QuestionPoolResponse[]>([]);
  const [activePoolId, setActivePoolId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<BankQuestionResponse[]>([]);
  const [memberIds, setMemberIds] = useState<Set<string>>(new Set());
  const [loadingPools, setLoadingPools] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadPools = useCallback(async () => {
    setLoadingPools(true);
    try {
      const list = await listPools(bankId);
      setPools(list);
      setActivePoolId((current) =>
        current && list.some((p) => p.id === current) ? current : (list[0]?.id ?? null)
      );
    } finally {
      setLoadingPools(false);
    }
  }, [bankId]);

  useEffect(() => {
    loadPools();
    getAllBankQuestions(bankId).then(setQuestions);
  }, [bankId, loadPools]);

  useEffect(() => {
    if (!activePoolId) {
      setMemberIds(new Set());
      return;
    }
    let cancelled = false;
    setLoadingMembers(true);
    getPoolMembers(activePoolId)
      .then((ids) => {
        if (!cancelled) setMemberIds(new Set(ids));
      })
      .finally(() => {
        if (!cancelled) setLoadingMembers(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activePoolId]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const pool = await createPool(bankId, { title: `Pool ${pools.length + 1}` });
      setPools((prev) => [...prev, pool]);
      setActivePoolId(pool.id);
    } finally {
      setCreating(false);
    }
  };

  const handleRename = async (poolId: string, title: string) => {
    setPools((prev) => prev.map((p) => (p.id === poolId ? { ...p, title } : p)));
    try {
      await renamePool(poolId, title);
    } catch (e) {
      console.warn("Failed to rename pool", e);
    }
  };

  const handleDelete = async (poolId: string) => {
    const pool = pools.find((p) => p.id === poolId);
    if (!pool) return;
    if (!window.confirm(`Delete pool "${pool.title}"? This can't be undone.`)) return;
    const next = pools.filter((p) => p.id !== poolId);
    setPools(next);
    if (activePoolId === poolId) setActivePoolId(next[0]?.id ?? null);
    try {
      await deletePool(poolId);
    } catch (e) {
      console.warn("Failed to delete pool", e);
      loadPools();
    }
  };

  const toggleMember = async (questionId: string) => {
    if (!activePoolId) return;
    const next = new Set(memberIds);
    if (next.has(questionId)) next.delete(questionId);
    else next.add(questionId);
    setMemberIds(next);
    setPools((prev) =>
      prev.map((p) => (p.id === activePoolId ? { ...p, questionCount: next.size } : p))
    );
    try {
      await setPoolMembers(activePoolId, { questionIds: Array.from(next) });
    } catch (e) {
      console.warn("Failed to update pool membership", e);
    }
  };

  const activePool = pools.find((p) => p.id === activePoolId) ?? null;

  return (
    <div className={`flex gap-4 ${className}`}>
      <div className="w-56 flex-shrink-0 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
        <div className="mb-1 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Question Pools
        </div>
        {loadingPools ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-indigo-400" size={16} />
          </div>
        ) : pools.length === 0 ? (
          <p className="px-2 py-4 text-xs leading-relaxed text-slate-400">
            No pools yet. A pool is a curated subset of this bank&apos;s questions an exam can draw
            from.
          </p>
        ) : (
          <div className="space-y-0.5">
            {pools.map((pool) => (
              <PoolRow
                key={pool.id}
                pool={pool}
                active={pool.id === activePoolId}
                onSelect={() => setActivePoolId(pool.id)}
                onRename={(title) => handleRename(pool.id, title)}
                onDelete={() => handleDelete(pool.id)}
              />
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating}
          className="mt-1 flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-[#14142b] transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Create Pool
        </button>
      </div>

      <div className="min-w-0 flex-1 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        {!activePool ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-center text-slate-400">
            <Boxes size={24} className="text-gray-300" />
            <p className="text-sm">Select or create a pool to choose its questions.</p>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">{activePool.title}</h3>
              <span className="text-xs text-slate-400">
                {memberIds.size} of {questions.length} questions
              </span>
            </div>
            {loadingMembers ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="animate-spin text-indigo-400" size={18} />
              </div>
            ) : questions.length === 0 ? (
              <p className="text-sm text-slate-400">This bank has no questions yet.</p>
            ) : (
              <div className="max-h-[60vh] space-y-1 overflow-y-auto">
                {questions.map((q) => (
                  <label
                    key={q.id}
                    className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={memberIds.has(q.id)}
                      onChange={() => toggleMember(q.id)}
                      className="mt-1 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <PromptView doc={q.prompt} className="min-w-0 flex-1 [&_p]:my-0" />
                    <span
                      className={`flex-shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium capitalize ${DIFFICULTY_STYLES[q.difficulty]}`}
                    >
                      {q.difficulty.toLowerCase()}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
