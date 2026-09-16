"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Boxes, ClipboardList, Eye, Loader2, Plus, SlidersHorizontal, Users } from "lucide-react";
import { toast } from "sonner";
import {
  createExamPlan,
  createPoolWithFilter,
  getExamQuestionBank,
  listExamPlans,
  listPoolDetails,
  listSections,
  type ExamPlanResponse,
  type ExamResponse,
  type QuestionPoolDetail,
  type SectionResponse,
} from "@/domains/assessments";
import { PoolsWorkspace } from "./PoolsWorkspace";
import { PlanWorkspace } from "./PlanWorkspace";
import { ExamPreviewWorkspace } from "./ExamPreviewWorkspace";
import { ExamSettingsWorkspace } from "./ExamSettingsWorkspace";
import { ExamAttemptsWorkspace } from "./ExamAttemptsWorkspace";

/**
 * Everything about an exam that is <em>not</em> writing questions: its plans, its pools, its
 * settings, a learner-facing preview, and the attempts learners have made.
 *
 * <p>These live on the Content Overview rather than inside the editor on purpose. The editor is
 * for authoring content — a course editor writes lessons, an exam editor writes questions — while
 * how a piece of content is configured, offered and previewed belongs to the workspace around it,
 * the same place a course's publishing and collaborators live. Keeping them here is what stops the
 * exam editor turning back into a mini-application with a mode for each of them.
 *
 * <p>Each tab is a list-and-detail pair: pick a plan or pool on the left, configure it on the
 * right. On narrow screens the two stack.
 */

type TabId = "plans" | "pools" | "preview" | "settings" | "attempts";

const TABS: { id: TabId; label: string; icon: typeof ClipboardList }[] = [
  { id: "plans", label: "Exam plans", icon: ClipboardList },
  { id: "pools", label: "Question pools", icon: Boxes },
  { id: "preview", label: "Preview", icon: Eye },
  { id: "settings", label: "Settings", icon: SlidersHorizontal },
  { id: "attempts", label: "Attempts & results", icon: Users },
];

export function ExamManagementSections({
  exam,
  onExamChange,
}: {
  exam: ExamResponse;
  onExamChange: (exam: ExamResponse) => void;
}) {
  const [tab, setTab] = useState<TabId>("plans");

  const [bankId, setBankId] = useState<string | null>(null);
  const [sections, setSections] = useState<SectionResponse[]>([]);
  const [pools, setPools] = useState<QuestionPoolDetail[]>([]);
  const [plans, setPlans] = useState<ExamPlanResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [activePoolId, setActivePoolId] = useState<string | null>(null);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [creatingPool, setCreatingPool] = useState(false);
  const [creatingPlan, setCreatingPlan] = useState(false);

  const readOnly = exam.status === "SUBMITTED";

  const loadPools = useCallback(async (id: string) => {
    try {
      setPools(await listPoolDetails(id));
    } catch {
      setPools([]);
    }
  }, []);

  const loadPlans = useCallback(async () => {
    try {
      const list = await listExamPlans(exam.id);
      setPlans(list);
      return list;
    } catch {
      setPlans([]);
      return [];
    }
  }, [exam.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const bank = await getExamQuestionBank(exam.id);
        if (cancelled) return;
        setBankId(bank.id);
        const [sectionList, planList] = await Promise.all([listSections(bank.id), loadPlans()]);
        if (cancelled) return;
        setSections(sectionList);
        if (planList.length > 0) setActivePlanId((prev) => prev ?? planList[0].id);
        await loadPools(bank.id);
      } catch {
        // Each panel renders its own empty/error state; a failure here just leaves them empty.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [exam.id, loadPlans, loadPools]);

  const activePool = useMemo(() => pools.find((p) => p.id === activePoolId) ?? null, [pools, activePoolId]);
  const activePlan = useMemo(() => plans.find((p) => p.id === activePlanId) ?? null, [plans, activePlanId]);

  const addPool = async () => {
    if (!bankId) return;
    setCreatingPool(true);
    try {
      // New pools start DYNAMIC: a saved filter is the kind worth having, and an author who wants
      // a hand-picked set can switch it in the panel.
      const pool = await createPoolWithFilter(bankId, { title: `Pool ${pools.length + 1}`, mode: "DYNAMIC" });
      await loadPools(bankId);
      setActivePoolId(pool.id);
    } catch {
      toast.error("Couldn't create the pool");
    } finally {
      setCreatingPool(false);
    }
  };

  const addPlan = async () => {
    setCreatingPlan(true);
    try {
      const plan = await createExamPlan(exam.id, { name: `Plan ${plans.length + 1}` });
      await loadPlans();
      setActivePlanId(plan.id);
    } catch {
      toast.error("Couldn't create the plan");
    } finally {
      setCreatingPlan(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? "page" : undefined}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all ${
              tab === t.id ? "bg-[#14142b] text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-[24px] border-[1.5px] border-indigo-400/80 bg-gradient-to-b from-indigo-50/30 via-white to-white p-5 shadow-[4px_-4px_0px_0px_#C7D2FE]">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={18} className="animate-spin text-slate-400" />
          </div>
        ) : tab === "plans" ? (
          <ListDetail
            items={plans.map((plan) => ({
              id: plan.id,
              title: plan.name,
              subtitle: `${plan.totalQuestions} question${plan.totalQuestions === 1 ? "" : "s"} · ${plan.durationMinutes} min`,
              badge: plan.active ? undefined : "Hidden",
            }))}
            activeId={activePlanId}
            onSelect={setActivePlanId}
            onCreate={readOnly ? undefined : addPlan}
            creating={creatingPlan}
            createLabel="New plan"
            emptyLabel="No plans yet"
          >
            <PlanWorkspace
              plan={activePlan}
              pools={pools}
              bankSections={sections}
              readOnly={readOnly}
              onCreate={addPlan}
              onChanged={async () => {
                const list = await loadPlans();
                if (activePlanId && !list.some((p) => p.id === activePlanId)) {
                  setActivePlanId(list[0]?.id ?? null);
                }
              }}
            />
          </ListDetail>
        ) : tab === "pools" ? (
          <ListDetail
            items={pools.map((pool) => ({
              id: pool.id,
              title: pool.title,
              subtitle: `${pool.questionCount} matching`,
            }))}
            activeId={activePoolId}
            onSelect={setActivePoolId}
            onCreate={readOnly ? undefined : addPool}
            creating={creatingPool}
            createLabel="New pool"
            emptyLabel="No pools yet"
          >
            <PoolsWorkspace
              key={activePoolId ?? "none"}
              bankId={bankId}
              pool={activePool}
              sections={sections}
              readOnly={readOnly}
              onCreate={addPool}
              onChanged={() => {
                if (bankId) loadPools(bankId);
              }}
            />
          </ListDetail>
        ) : tab === "preview" ? (
          <div className="flex flex-col gap-3">
            {plans.length > 1 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Plan</span>
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setActivePlanId(plan.id)}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold transition-colors ${
                      plan.id === activePlanId
                        ? "bg-[#14142b] text-white"
                        : "border border-slate-200 bg-white text-slate-500 hover:text-[#14142b]"
                    }`}
                  >
                    {plan.name}
                  </button>
                ))}
              </div>
            )}
            <ExamPreviewWorkspace exam={exam} plan={activePlan} />
          </div>
        ) : tab === "settings" ? (
          <ExamSettingsWorkspace key={exam.id} exam={exam} onChange={onExamChange} readOnly={readOnly} />
        ) : (
          <ExamAttemptsWorkspace examId={exam.id} />
        )}
      </div>
    </div>
  );
}

/**
 * Pick one of several records on the left, configure it on the right.
 *
 * <p>The editor gave plans and pools a sidebar; on a page that has no sidebar, this is the same
 * relationship expressed inline, so the two surfaces stay recognisably the same thing.
 */
function ListDetail({
  items,
  activeId,
  onSelect,
  onCreate,
  creating,
  createLabel,
  emptyLabel,
  children,
}: {
  items: Array<{ id: string; title: string; subtitle?: string; badge?: string }>;
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate?: () => void;
  creating?: boolean;
  createLabel: string;
  emptyLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <aside className="flex w-full shrink-0 flex-col gap-1.5 lg:w-[220px]">
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-center text-[11px] font-semibold text-slate-400">
            {emptyLabel}
          </p>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`flex w-full flex-col gap-0.5 rounded-xl border px-3 py-2 text-left transition-all ${
                item.id === activeId
                  ? "border-[#14142b] bg-[#14142b] text-white"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className="min-w-0 flex-1 truncate text-xs font-bold" title={item.title}>
                  {item.title}
                </span>
                {item.badge && (
                  <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                      item.id === activeId ? "bg-white/20 text-white" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </span>
              {item.subtitle && (
                <span
                  className={`truncate text-[10px] font-medium ${
                    item.id === activeId ? "text-white/60" : "text-slate-400"
                  }`}
                >
                  {item.subtitle}
                </span>
              )}
            </button>
          ))
        )}

        {onCreate && (
          <button
            type="button"
            onClick={onCreate}
            disabled={creating}
            className="mt-1 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-xs font-bold text-slate-500 transition-colors hover:border-slate-400 hover:bg-white hover:text-[#14142b] disabled:opacity-50"
          >
            {creating ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            {createLabel}
          </button>
        )}
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
