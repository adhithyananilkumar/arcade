// features/assessment/components/QuestionBankPanel.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, FileText, Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import {
  createQuestionBank,
  deleteQuestionBank,
  disableQuestionBankForCourse,
  enableQuestionBankForCourse,
  listQuestionBanks,
  renameQuestionBank,
} from "../api";
import type { QuestionBankSummary } from "../types";
import { QuestionBankEditor } from "./QuestionBankEditor";
import { QuestionBankImportDialog } from "./QuestionBankImportDialog";

interface QuestionBankPanelProps {
  open: boolean;
  courseId?: string;
  onClose: () => void;
}

/**
 * All of the creator's question banks in one flat list — banks are always personal, and can
 * independently be enabled for any number of courses via a per-row toggle (only shown when opened
 * with a courseId, i.e. from inside a course editor).
 */
export function QuestionBankPanel({ open, courseId, onClose }: QuestionBankPanelProps) {
  const [banks, setBanks] = useState<QuestionBankSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBankId, setActiveBankId] = useState<string | null>(null);
  const [importBankId, setImportBankId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [enableConfirmBank, setEnableConfirmBank] = useState<QuestionBankSummary | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setBanks(await listQuestionBanks(courseId));
    } catch (e) {
      console.warn("Failed to load question banks", e);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (open) {
      setActiveBankId(null);
      load();
    }
  }, [open, load]);

  if (!open) return null;

  async function createBank() {
    try {
      const bank = await createQuestionBank({ title: "Untitled Question Bank" });
      await load();
      setActiveBankId(bank.id);
    } catch (e) {
      console.warn("Failed to create question bank", e);
    }
  }

  async function handleRename(bankId: string) {
    const title = renameValue.trim();
    setRenamingId(null);
    if (!title) return;
    try {
      await renameQuestionBank(bankId, title);
      await load();
    } catch (e) {
      console.warn("Failed to rename question bank", e);
    }
  }

  async function handleDelete(bankId: string) {
    try {
      await deleteQuestionBank(bankId);
      if (activeBankId === bankId) setActiveBankId(null);
      await load();
    } catch (e) {
      console.warn("Failed to delete question bank", e);
    }
  }

  async function handleToggle(bank: QuestionBankSummary) {
    if (!courseId) return;
    if (!bank.enabledForCourse) {
      // Enabling is the consequential direction — confirm first.
      setEnableConfirmBank(bank);
      return;
    }
    setToggling(bank.id);
    try {
      await disableQuestionBankForCourse(bank.id, courseId);
      await load();
    } catch (e) {
      console.warn("Failed to disable question bank for course", e);
    } finally {
      setToggling(null);
    }
  }

  async function confirmEnable() {
    if (!enableConfirmBank || !courseId) return;
    const bank = enableConfirmBank;
    setEnableConfirmBank(null);
    setToggling(bank.id);
    try {
      await enableQuestionBankForCourse(bank.id, courseId);
      await load();
    } catch (e) {
      console.warn("Failed to enable question bank for course", e);
    } finally {
      setToggling(null);
    }
  }

  const activeBank = banks.find((b) => b.id === activeBankId);

  function BankRow({ bank }: { bank: QuestionBankSummary }) {
    const isRenaming = renamingId === bank.id;
    return (
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
        {isRenaming ? (
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={() => handleRename(bank.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename(bank.id);
              if (e.key === "Escape") setRenamingId(null);
            }}
            className="flex-1 rounded-md border border-indigo-200 px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-indigo-300"
          />
        ) : (
          <button
            type="button"
            onClick={() => setActiveBankId(bank.id)}
            className="flex flex-1 items-center gap-2 text-left text-sm font-medium text-gray-700 hover:text-indigo-600"
          >
            <FileText size={14} className="flex-shrink-0 text-gray-400" />
            {bank.title}
            <span className="text-xs font-normal text-gray-400">
              {bank.questionCount} {bank.questionCount === 1 ? "question" : "questions"}
            </span>
          </button>
        )}

        {courseId && (
          <div className="flex w-9 flex-shrink-0 items-center justify-center">
            {toggling === bank.id ? (
              <Loader2 size={13} className="animate-spin text-gray-400" />
            ) : (
              <button
                type="button"
                role="switch"
                aria-checked={bank.enabledForCourse}
                title={bank.enabledForCourse ? "Enabled for this course" : "Enable for this course"}
                onClick={() => handleToggle(bank)}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
                  bank.enabledForCourse ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    bank.enabledForCourse ? "translate-x-[18px]" : "translate-x-0.5"
                  }`}
                />
              </button>
            )}
          </div>
        )}

        <button
          type="button"
          title="Import from JSON"
          onClick={() => setImportBankId(bank.id)}
          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-indigo-600"
        >
          <Upload size={13} />
        </button>
        <button
          type="button"
          title="Rename"
          onClick={() => {
            setRenamingId(bank.id);
            setRenameValue(bank.title);
          }}
          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <Pencil size={13} />
        </button>
        <button
          type="button"
          title="Delete"
          onClick={() => handleDelete(bank.id)}
          className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 size={13} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mx-4 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>

        {activeBank ? (
          <>
            <div className="mb-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveBankId(null);
                  load();
                }}
                className="text-xs font-medium text-gray-400 hover:text-indigo-600"
              >
                ← All banks
              </button>
            </div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">{activeBank.title}</h3>
            <QuestionBankEditor bankId={activeBank.id} className="min-h-0 flex-1" />
          </>
        ) : (
          <>
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Question Banks</h3>
              <button
                type="button"
                onClick={createBank}
                className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline"
              >
                <Plus size={12} />
                New bank
              </button>
            </div>
            <p className="mb-4 text-sm text-gray-500">
              Build reusable sets of questions — mix MCQ, true/false, and sentence-answer
              questions freely within a bank.
              {courseId &&
                " Use the toggle to enable a bank for this course — a bank can be enabled for any number of courses."}
            </p>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-indigo-400" size={22} />
              </div>
            ) : (
              <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto">
                {banks.length === 0 && (
                  <p className="text-xs text-gray-400">No question banks yet.</p>
                )}
                {banks.map((b) => (
                  <BankRow key={b.id} bank={b} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {enableConfirmBank && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setEnableConfirmBank(null)}
          />
          <div className="relative mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-3 flex items-center gap-2 text-amber-600">
              <AlertTriangle size={18} />
              <h4 className="text-base font-semibold text-gray-900">Enable question bank?</h4>
            </div>
            <p className="mb-5 text-sm text-gray-600">
              Enabling <span className="font-medium text-gray-800">{enableConfirmBank.title}</span>{" "}
              makes its questions available to this course. You can disable it again at any time.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEnableConfirmBank(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmEnable}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Enable
              </button>
            </div>
          </div>
        </div>
      )}

      {importBankId && (
        <QuestionBankImportDialog
          bankId={importBankId}
          hasExistingQuestions={
            banks.find((b) => b.id === importBankId)?.questionCount ? true : false
          }
          onClose={() => setImportBankId(null)}
          onImported={() => {
            setImportBankId(null);
            load();
          }}
        />
      )}
    </div>
  );
}
