"use client";

// Blueprint editor: an exam is a set of sections, each holding selection rules that describe what
// to draw ("5 medium questions from pool X") rather than which exact questions — the runtime
// selection engine (ExamGenerationService) resolves this into an actual paper per student.
// MANUAL-mode rules (explicit question picks) are modeled on the backend but not exposed here yet
// — this editor only authors RULE_BASED rules.

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2, CircleAlert, CircleCheck, ChevronUp, ChevronDown } from "lucide-react";
import { api } from "@/infrastructure/http/api";
import { toast } from "sonner";
import { getOrCreateCourseQuestionBank, listPools, type QuestionPoolResponse } from "@/domains/assessments";

type Difficulty = "EASY" | "MEDIUM" | "HARD";

interface RuleWire {
  id: string;
  sectionId: string;
  selectionMode: "RULE_BASED" | "MANUAL";
  poolId: string | null;
  difficulty: Difficulty | null;
  count: number;
  position: number;
  manualQuestionIds: string[];
}

interface SectionWire {
  id: string;
  examId: string;
  title: string;
  position: number;
  rules: RuleWire[];
}

interface RuleAvailability {
  ruleId: string;
  sectionId: string;
  sectionTitle: string;
  required: number;
  available: number;
  ok: boolean;
}

interface ValidationResponse {
  ok: boolean;
  rules: RuleAvailability[];
}

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  EASY: "bg-emerald-50 text-emerald-700 border-emerald-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  HARD: "bg-rose-50 text-rose-700 border-rose-200",
};

const EditorNumberInput = ({ value, onChange }: { value: number; onChange: (val: number) => void }) => (
  <div className="relative flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-300 transition-all">
    <input
      type="number"
      min={0}
      value={value}
      onChange={(e) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val)) onChange(Math.max(0, val));
      }}
      className="w-12 appearance-none border-none bg-transparent px-2 py-1.5 text-center text-xs font-semibold text-[#14142b] outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
    />
    <div className="flex flex-col border-l border-slate-200 bg-slate-50">
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex h-[13.5px] w-[18px] items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-[#14142b] transition-colors"
      >
        <ChevronUp size={10} strokeWidth={3} />
      </button>
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="flex h-[13.5px] w-[18px] items-center justify-center border-t border-slate-200 text-slate-400 hover:bg-slate-200 hover:text-[#14142b] transition-colors"
      >
        <ChevronDown size={10} strokeWidth={3} />
      </button>
    </div>
  </div>
);

export function ExamBlueprintEditor({ examId, courseId }: { examId: string; courseId: string }) {
  const [sections, setSections] = useState<SectionWire[]>([]);
  const [pools, setPools] = useState<QuestionPoolResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingSection, setCreatingSection] = useState(false);
  const [validation, setValidation] = useState<ValidationResponse | null>(null);
  const [validating, setValidating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sectionList, bank] = await Promise.all([
        api.get<SectionWire[]>(`/api/exams/${examId}/sections`),
        getOrCreateCourseQuestionBank(courseId),
      ]);
      setSections(sectionList);
      const poolList = await listPools(bank.id);
      setPools(poolList);
    } catch (e) {
      console.warn("Failed to load exam blueprint", e);
    } finally {
      setLoading(false);
    }
  }, [examId, courseId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddSection = async () => {
    setCreatingSection(true);
    try {
      const section = await api.post<SectionWire>(`/api/exams/${examId}/sections`, {
        title: `Section ${sections.length + 1}`,
      });
      setSections((prev) => [...prev, { ...section, rules: [] }]);
    } catch (e) {
      toast.error("Failed to create section");
    } finally {
      setCreatingSection(false);
    }
  };

  const handleRenameSection = async (sectionId: string, title: string) => {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, title } : s)));
    try {
      await api.patch(`/api/exams/sections/${sectionId}`, { title });
    } catch (e) {
      toast.error("Failed to rename section");
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!window.confirm("Delete this section and all its rules?")) return;
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
    try {
      await api.delete(`/api/exams/sections/${sectionId}`);
    } catch (e) {
      toast.error("Failed to delete section");
      load();
    }
  };

  const saveRules = async (sectionId: string, rules: RuleWire[]) => {
    try {
      const saved = await api.put<RuleWire[]>(`/api/exams/sections/${sectionId}/rules`, {
        rules: rules.map((r) => ({
          selectionMode: r.selectionMode,
          poolId: r.poolId,
          difficulty: r.difficulty,
          count: r.count,
          manualQuestionIds: r.manualQuestionIds,
        })),
      });
      setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, rules: saved } : s)));
    } catch (e) {
      toast.error("Failed to save rules");
      load();
    }
  };

  const handleAddRule = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;
    const nextRules: RuleWire[] = [
      ...section.rules,
      {
        id: "",
        sectionId,
        selectionMode: "RULE_BASED",
        poolId: null,
        difficulty: null,
        count: 5,
        position: section.rules.length,
        manualQuestionIds: [],
      },
    ];
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, rules: nextRules } : s)));
    saveRules(sectionId, nextRules);
  };

  const handleRemoveRule = (sectionId: string, index: number) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;
    const nextRules = section.rules.filter((_, i) => i !== index);
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, rules: nextRules } : s)));
    saveRules(sectionId, nextRules);
  };

  const handleRuleChange = (sectionId: string, index: number, patch: Partial<RuleWire>) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;
    const nextRules = section.rules.map((r, i) => (i === index ? { ...r, ...patch } : r));
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, rules: nextRules } : s)));
    saveRules(sectionId, nextRules);
  };

  const handleValidate = async () => {
    setValidating(true);
    try {
      const result = await api.get<ValidationResponse>(`/api/exams/${examId}/blueprint/validate`);
      setValidation(result);
    } catch (e) {
      toast.error("Failed to validate blueprint");
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="animate-spin text-slate-400" size={20} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-slate-500">
        Define what this exam draws from the question bank, section by section — a rule says
        &quot;N questions of a given difficulty from a pool (or the whole bank)&quot;. The actual
        paper is sampled per student at attempt time.
      </p>

      {sections.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center text-sm text-slate-500">
          No sections yet. Until you add one, this exam falls back to its legacy flat question
          count / difficulty split.
        </p>
      )}

      {sections.map((section) => (
        <div key={section.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <input
              value={section.title}
              onChange={(e) => handleRenameSection(section.id, e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-bold text-[#14142b] outline-none hover:border-slate-200 focus:border-slate-300 focus:bg-white"
            />
            <button
              type="button"
              onClick={() => handleDeleteSection(section.id)}
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
              title="Delete section"
            >
              <Trash2 size={14} />
            </button>
          </div>

          <div className="space-y-2.5">
            {section.rules.map((rule, i) => {
              const availability = validation?.rules.find((r) => r.ruleId === rule.id);
              return (
                <div
                  key={i}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2"
                >
                  <select
                    value={rule.poolId ?? ""}
                    onChange={(e) => handleRuleChange(section.id, i, { poolId: e.target.value || null })}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:ring-1 focus:ring-slate-300"
                  >
                    <option value="">Whole question bank</option>
                    {pools.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>

                  <select
                    value={rule.difficulty ?? ""}
                    onChange={(e) =>
                      handleRuleChange(section.id, i, {
                        difficulty: (e.target.value || null) as Difficulty | null,
                      })
                    }
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium outline-none focus:ring-1 focus:ring-slate-300 ${
                      rule.difficulty ? DIFFICULTY_STYLES[rule.difficulty] : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <option value="">Any difficulty</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>

                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    Count
                    <EditorNumberInput
                      value={rule.count}
                      onChange={(val) => handleRuleChange(section.id, i, { count: val })}
                    />
                  </label>

                  {availability && (
                    <span
                      className={`flex items-center gap-1 text-[11px] font-medium ${
                        availability.ok ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {availability.ok ? <CircleCheck size={12} /> : <CircleAlert size={12} />}
                      {availability.available} available
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveRule(section.id, i)}
                    className="ml-auto rounded-md p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    title="Remove rule"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handleAddRule(section.id)}
            className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#14142b] transition-colors"
          >
            <Plus size={14} />
            Add rule
          </button>
        </div>
      ))}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleAddSection}
          disabled={creatingSection}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
        >
          {creatingSection ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
          Add Section
        </button>

        {sections.length > 0 && (
          <button
            type="button"
            onClick={handleValidate}
            disabled={validating}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            {validating ? <Loader2 size={13} className="animate-spin" /> : null}
            Validate Blueprint
          </button>
        )}

        {validation && (
          <span
            className={`text-xs font-semibold ${validation.ok ? "text-emerald-600" : "text-rose-600"}`}
          >
            {validation.ok
              ? "All rules have enough eligible questions."
              : "Some rules don't have enough eligible questions."}
          </span>
        )}
      </div>
    </div>
  );
}
