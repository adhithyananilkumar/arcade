"use client";

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Creator
 * Type: Workspace
 *
 * Purpose:
 * Exam question authoring, hosted by the shared Arcade Studio.
 * ------------------------------------------------------------------
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlignLeft,
  ChevronDown,
  ChevronRight,
  CircleDot,
  FileQuestion,
  Layers,
  ListChecks,
  Loader2,
  Pencil,
  Plus,
  ToggleLeft,
  Trash2,
  UploadCloud,
} from "lucide-react";
import {
  StudioEditorFrame,
  StudioEditorTopBar,
  StudioEditorBody,
  StudioCanvasError,
  TREE_CONTAINER_ROW_CLASS,
  TREE_SIDEBAR_BUTTON_CLASS,
  TREE_SIDEBAR_ACTIONS_CLASS,
  TREE_EMPTY_STATE_CLASS,
  CANVAS_WRAPPER_CLASS,
} from "@/apps/creator/studio/core/StudioShell";
import { StudioRightPanel } from "@/apps/creator/studio/core/StudioRightPanel";
import { useStudioPanel } from "@/apps/creator/studio/core/useStudioPanel";
import { useStudioConfirm } from "@/apps/creator/studio/core/useStudioConfirm";
import { useStudioSaveManager, type StudioSaveAdapter } from "@/apps/creator/studio/core/useStudioSaveManager";
import { useStudioUnsavedChanges } from "@/apps/creator/studio/core/useStudioUnsavedChanges";
import {
  createSection,
  deleteSection,
  getExam,
  getExamQuestionBank,
  isPlanPublishable,
  listExamPlans,
  listSections,
  planReadiness,
  promptToPlainText,
  publishExam,
  renameSection,
  saveSectionQuestions,
  searchBankQuestions,
  toRequest,
  useSectionQuestions,
  validateExamPlan,
  type BankQuestionResponse,
  type ExamResponse,
  type LocalQuestion,
  type SectionResponse,
} from "@/domains/assessments";
import { QuestionEditorCard } from "./QuestionEditorCard";
import { QuestionListPreview } from "./QuestionListPreview";
import { createExamQuestionHistoryAdapter } from "./ExamQuestionHistoryAdapter";

/**
 * The Exam editor — the same Arcade Studio a course or event is authored in, editing an exam's
 * questions.
 *
 * <p>Structurally it <em>is</em> the course editor: the same frame, top bar, floating toolbar,
 * share control, right-hand panel and canvas geometry, and a tree of containers and leaves in the
 * sidebar. A course's tree is Modules → Lessons; an exam's is Sections → Questions. Expanding a
 * container and picking a leaf opens it in the canvas, with the nouns swapped and nothing else.
 *
 * <p>A question therefore cannot exist outside a section, and the sidebar says so by only offering
 * "Add question" inside an expanded one — the same way a lesson only exists inside a module.
 *
 * <p>Scope is deliberately a course editor's: <em>authoring content</em>. An exam's plans, pools,
 * settings and preview are configuration around the content and live on the Content Overview,
 * alongside publishing and attempts.
 */
/**
 * One icon per question type, so a section's rows are scannable at a glance instead of every
 * question showing the same generic document icon regardless of what it actually asks for.
 */
const QUESTION_TYPE_ICON: Record<string, typeof FileQuestion> = {
  SINGLE: CircleDot,
  MULTIPLE: ListChecks,
  TRUE_FALSE: ToggleLeft,
  SENTENCE: AlignLeft,
};

export function ExamWorkspace({ examId }: { examId: string }) {
  const router = useRouter();

  const [exam, setExam] = useState<ExamResponse | null>(null);
  const [bankId, setBankId] = useState<string | null>(null);
  const [sections, setSections] = useState<SectionResponse[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  /** The expanded section. "" means the tree is collapsed onto "All questions". */
  const [activeSectionId, setActiveSectionId] = useState("");
  const [activeQuestionKey, setActiveQuestionKey] = useState<string | null>(null);
  const [previewReloadKey, setPreviewReloadKey] = useState(0);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);

  const [creatingSection, setCreatingSection] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [renamingSectionId, setRenamingSectionId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");

  // An exam under platform review is locked for editing, exactly like a submitted course.
  const readOnly = exam?.status === "SUBMITTED";

  // The same right-hand panel the course/event editor mounts, from the same hook. Team is real —
  // Exam now shares the one ContentCollaborationController every owner type uses. statusHistoryPath
  // stays null: exams self-publish rather than passing through the review rounds that produce a
  // status history, so there is genuinely nothing to show there (see unavailableNotes below) — the
  // Capability Honesty Rule, not a gap.
  const panel = useStudioPanel({
    collaboratorsPath: `/api/v1/content/EXAM/${examId}/collaborators`,
    statusHistoryPath: null,
  });
  // The same destructive-action confirmation Course/Event use — previously missing here
  // entirely, so deleting a section or a question had no confirmation step while the equivalent
  // actions in Course/Event (delete module, delete lesson) did.
  const { confirm, dialog: confirmDialog } = useStudioConfirm();

  const handleSectionCountChange = useCallback((sectionId: string, count: number) => {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, questionCount: count } : s)));
    // The read-only preview reads through the search endpoint, so it has to be told when the
    // authoring engine has written something it wouldn't otherwise see.
    setPreviewReloadKey((k) => k + 1);
  }, []);

  interface SectionQuestionsSnapshot {
    sectionId: string;
    questions: LocalQuestion[];
  }

  const sectionSaveAdapter = useMemo<StudioSaveAdapter<SectionQuestionsSnapshot>>(
    () => ({
      save: async ({ sectionId, questions }) => {
        if (!sectionId) return;
        await saveSectionQuestions(sectionId, toRequest(questions));
      },
    }),
    []
  );

  const saveManager = useStudioSaveManager(sectionSaveAdapter, { debounceMs: 1200 });
  const { saveState } = saveManager;

  useStudioUnsavedChanges(saveManager);

  const handleQuestionsChange = useCallback(
    (nextQuestions: LocalQuestion[]) => {
      if (activeSectionId) {
        saveManager.scheduleSave({ sectionId: activeSectionId, questions: nextQuestions });
      }
    },
    [activeSectionId, saveManager]
  );

  /**
   * Opening a section closes whatever question was open — the canvas always shows something
   * belonging to the section the tree has expanded. Done here rather than in an effect so
   * changing sections is one render, not two.
   */
  const selectSection = useCallback(
    (sectionId: string) => {
      saveManager.flush();
      setActiveSectionId(sectionId);
      setActiveQuestionKey(null);
    },
    [saveManager]
  );

  const controller = useSectionQuestions(activeSectionId, {
    onQuestionCountChange: handleSectionCountChange,
    onChange: handleQuestionsChange,
    saveState: saveManager.saveState,
  });
  const { questions, loading: questionsLoading, addQuestion, removeQuestion } = controller;

  // `selectSection` is recreated whenever `saveManager` reports a new save-state transition
  // (idle -> saving -> saved -> idle happens on every autosaved edit) — a real dependency for
  // callers that need the *current* flush/selection behavior, but not something the one-time
  // bootstrap effect below should re-run for. Read through a ref instead of the dep array so
  // that effect fires once per `examId`, not once per autosave cycle (the latter is what was
  // hammering /api/exams/{id}/question-bank into a 429).
  const selectSectionRef = useRef(selectSection);
  useEffect(() => {
    selectSectionRef.current = selectSection;
  }, [selectSection]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [examData, bank] = await Promise.all([getExam(examId), getExamQuestionBank(examId)]);
        if (cancelled) return;
        setExam(examData);
        setBankId(bank.id);

        const sectionList = await listSections(bank.id);
        if (cancelled) return;
        setSections(sectionList);
        if (sectionList.length > 0) selectSectionRef.current(sectionList[0].id);
      } catch {
        if (!cancelled) setLoadError("Couldn't load this exam. You may not have access to it.");
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [examId]);

  // Tags already in use, offered as one-click additions while editing a question.
  useEffect(() => {
    if (!bankId) return;
    searchBankQuestions(bankId, { limit: 1 })
      .then((page) => setTagSuggestions(page.availableTags))
      .catch(() => setTagSuggestions([]));
  }, [bankId, previewReloadKey]);

  const activeQuestionIndex = useMemo(
    () => questions.findIndex((q) => q.key === activeQuestionKey),
    [questions, activeQuestionKey]
  );
  const activeQuestion = activeQuestionIndex >= 0 ? questions[activeQuestionIndex] : null;
  const activeSection = sections.find((s) => s.id === activeSectionId) ?? null;

  // ── Sections ───────────────────────────────────────────────────────────────

  const addSection = async () => {
    if (!bankId) return;
    setCreatingSection(true);
    try {
      const section = await createSection(bankId, { title: `Section ${sections.length + 1}` });
      setSections((prev) => [...prev, section]);
      selectSection(section.id);
    } catch {
      toast.error("Couldn't create the section");
    } finally {
      setCreatingSection(false);
    }
  };

  const commitRename = async (sectionId: string, title: string) => {
    const trimmed = title.trim();
    setRenamingSectionId(null);
    if (!trimmed) return;
    const previous = sections;
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, title: trimmed } : s)));
    try {
      await renameSection(sectionId, trimmed);
    } catch {
      setSections(previous);
      toast.error("Couldn't rename the section");
    }
  };

  const removeSectionNow = async (section: SectionResponse) => {
    const previous = sections;
    setSections((prev) => prev.filter((s) => s.id !== section.id));
    if (activeSectionId === section.id) selectSection("");
    try {
      await deleteSection(section.id);
      setPreviewReloadKey((k) => k + 1);
    } catch {
      setSections(previous);
      toast.error("Couldn't delete the section");
    }
  };

  const askDeleteSection = (section: SectionResponse) =>
    confirm({
      title: "Delete section?",
      message: `"${section.title}" and every question in it (${section.questionCount}) will be permanently deleted. This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
      onConfirm: () => removeSectionNow(section),
    });

  // ── Questions ──────────────────────────────────────────────────────────────

  /** A question only ever exists inside a section, so creating one always names its section. */
  const addQuestionTo = useCallback(
    (sectionId: string) => {
      if (sectionId !== activeSectionId) {
        // The engine loads a section asynchronously; expand it now and let the author click
        // again once its questions are in, rather than adding into the wrong section.
        selectSection(sectionId);
        return;
      }
      const created = addQuestion();
      setActiveQuestionKey(created.key);
    },
    [activeSectionId, addQuestion, selectSection]
  );

  // Opening a question that lives in another section has to wait for that section to load before
  // the local key it maps to exists. Declared above its user so the reference is plainly in scope.
  const [pendingOpenId, setPendingOpenId] = useState<string | null>(null);

  /** Opening a question from the read-through preview, which knows server ids, not local keys. */
  const openServerQuestion = useCallback(
    (question: BankQuestionResponse) => {
      if (question.sectionId !== activeSectionId) {
        setActiveSectionId(question.sectionId);
        setPendingOpenId(question.id);
        setActiveQuestionKey(null);
        return;
      }
      const local = questions.find((q) => q.id === question.id);
      if (local) setActiveQuestionKey(local.key);
    },
    [activeSectionId, questions]
  );

  useEffect(() => {
    if (!pendingOpenId || questionsLoading) return;
    const local = questions.find((q) => q.id === pendingOpenId);
    if (local) {
      queueMicrotask(() => {
        setActiveQuestionKey(local.key);
        setPendingOpenId(null);
      });
    } else if (questions.length > 0) {
      queueMicrotask(() => {
        setPendingOpenId(null);
      });
    }
  }, [pendingOpenId, questions, questionsLoading]);

  /**
   * Publishing cuts an immutable version of the exam and every plan on it. Blocked when a plan
   * cannot build its paper: publishing a plan that asks for more questions than exist would let a
   * candidate start an exam that fails at generation time. Plans are edited on the overview, so a
   * failure here points the author there rather than opening a panel in the editor.
   */
  const handlePublish = async () => {
    setPublishing(true);
    try {
      const plans = (await listExamPlans(examId)).filter((p) => p.active);
      const results = await Promise.all(plans.map((p) => validateExamPlan(p.id)));
      const broken = results.filter((r) => !isPlanPublishable(r));
      if (broken.length > 0) {
        const plan = plans.find((p) => p.id === broken[0].planId);
        toast.error(`"${plan?.name ?? "A plan"}" isn't ready`, {
          description: `${planReadiness(broken[0]).message} Open the exam's overview to fix it.`,
        });
        return;
      }

      await publishExam(examId);
      toast.success("Exam published");
      setExam(await getExam(examId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't publish this exam");
    } finally {
      setPublishing(false);
    }
  };

  // ── States ─────────────────────────────────────────────────────────────────

  if (initializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-gray-500">Opening this exam…</p>
        </div>
      </div>
    );
  }

  if (loadError || !exam) {
    return (
      <StudioEditorFrame>
        <div className="relative z-10 flex h-full items-center justify-center">
          <StudioCanvasError message={loadError ?? "Exam not found."} onRetry={() => router.push("/studio")} />
        </div>
      </StudioEditorFrame>
    );
  }

  // ── Sidebar: Sections → Questions, the exam's equivalent of Modules → Lessons ──

  const sidebarTree = (
    <>
      <button
        type="button"
        onClick={() => selectSection("")}
        className={`mb-2 flex w-full items-center gap-2 rounded-2xl border px-3 py-2 text-left text-xs font-bold shadow-sm backdrop-blur-md transition-all ${
          activeSectionId === ""
            ? "border-[#14142b] bg-[#14142b] text-white"
            : "border-white/40 bg-white/60 text-[#14142b] hover:bg-white/80"
        }`}
      >
        <Layers size={13} className="flex-shrink-0" />
        <span className="min-w-0 flex-1 truncate">All questions</span>
      </button>

      {sections.length === 0 && (
        <div className={TREE_EMPTY_STATE_CLASS}>
          <Layers size={24} className="text-[#14142b]/40" />
          <p className="text-xs font-medium text-[#14142b]/60">
            No sections yet. Add a section to start writing questions.
          </p>
        </div>
      )}

      {sections.map((section) => {
        const isExpanded = section.id === activeSectionId;
        return (
          <div key={section.id} className="mb-2 flex flex-col gap-1">
            {/* Section row — the exam's equivalent of a course module */}
            <div className={TREE_CONTAINER_ROW_CLASS}>
              <button
                type="button"
                onClick={() => selectSection(isExpanded ? "" : section.id)}
                className="flex-shrink-0 text-[#14142b]/40 transition-colors hover:text-[#14142b]"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {renamingSectionId === section.id ? (
                <input
                  autoFocus
                  value={renameDraft}
                  onChange={(e) => setRenameDraft(e.target.value)}
                  onBlur={() => commitRename(section.id, renameDraft)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename(section.id, renameDraft);
                    if (e.key === "Escape") setRenamingSectionId(null);
                  }}
                  className="min-w-0 flex-1 rounded-lg border border-[#14142b]/15 bg-white px-2 py-1 text-xs font-bold text-[#14142b] outline-none"
                />
              ) : (
                <span
                  onDoubleClick={() => {
                    if (readOnly) return;
                    setRenamingSectionId(section.id);
                    setRenameDraft(section.title);
                  }}
                  onClick={() => selectSection(section.id)}
                  className="min-w-0 flex-1 cursor-pointer truncate text-xs font-bold text-[#14142b]"
                  title={section.title}
                >
                  {section.title}
                </span>
              )}

              <span className="flex-shrink-0 rounded-full bg-[#14142b]/10 px-2 py-0.5 text-[10px] font-semibold text-[#14142b]/50">
                {section.questionCount}
              </span>

              {!readOnly && (
                <div className="flex flex-shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    title="Add question"
                    onClick={() => addQuestionTo(section.id)}
                    className="rounded-md p-1 text-[#14142b]/40 transition-colors hover:bg-[#14142b]/5 hover:text-[#14142b]"
                  >
                    <Plus size={12} />
                  </button>
                  <button
                    type="button"
                    title="Rename section"
                    onClick={() => {
                      setRenamingSectionId(section.id);
                      setRenameDraft(section.title);
                    }}
                    className="rounded-md p-1 text-[#14142b]/40 transition-colors hover:bg-[#14142b]/5 hover:text-[#14142b]"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    type="button"
                    title="Delete section"
                    onClick={() => askDeleteSection(section)}
                    className="rounded-md p-1 text-[#14142b]/40 transition-colors hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Questions — the exam's equivalent of a module's lessons */}
            {isExpanded && (
              <div className="ml-5 flex flex-col gap-0.5 border-l border-[#14142b]/10 pl-3 pt-1">
                {questionsLoading ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-[#14142b]/40">
                    <Loader2 size={11} className="animate-spin" /> Loading…
                  </span>
                ) : (
                  questions.map((q, index) => {
                    const label = promptToPlainText(q.prompt);
                    const isOpen = q.key === activeQuestionKey;
                    const TypeIcon = QUESTION_TYPE_ICON[q.type] ?? FileQuestion;
                    return (
                      <div
                        key={q.key}
                        className={`group/leaf flex items-center gap-2 rounded-full px-3 transition-all ${
                          isOpen ? "bg-[#14142b] shadow-md" : "hover:bg-white/40"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveQuestionKey(q.key)}
                          className={`flex min-w-0 flex-1 items-center gap-1.5 py-1.5 text-left text-xs ${
                            isOpen ? "font-semibold text-white" : "text-slate-500"
                          }`}
                        >
                          <TypeIcon size={12} className="flex-shrink-0" />
                          <span className="truncate" title={label || `Question ${index + 1}`}>
                            {label || `Question ${index + 1}`}
                          </span>
                        </button>
                        {!readOnly && (
                          <button
                            type="button"
                            title="Delete question"
                            onClick={() =>
                              confirm({
                                title: "Delete question?",
                                message: "This question and its saved draft will be permanently deleted. This cannot be undone.",
                                confirmLabel: "Delete",
                                danger: true,
                                onConfirm: () => {
                                  removeQuestion(q.key);
                                  if (isOpen) setActiveQuestionKey(null);
                                },
                              })
                            }
                            className={`flex-shrink-0 rounded-md p-1 opacity-0 transition-opacity group-hover/leaf:opacity-100 ${
                              isOpen ? "text-white/70 hover:text-white" : "text-[#14142b]/40 hover:text-rose-600"
                            }`}
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}

                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => addQuestionTo(section.id)}
                    className="mt-0.5 flex items-center gap-1 py-1 pl-3 text-[11px] font-semibold text-slate-400 transition-colors hover:text-[#14142b]"
                  >
                    <Plus size={11} />
                    Add question
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );

  return (
    <StudioEditorFrame>
      <StudioEditorTopBar
        onBack={async () => {
          await saveManager.flush();
          router.push(`/studio/content/exam/${examId}`);
        }}
        backTitle="Back to the exam overview"
        breadcrumb={
          activeQuestion && activeSection ? (
            <div className="flex items-center gap-1.5 text-gray-500">
              <span className="block max-w-[15vw] truncate font-medium">{activeSection.title}</span>
              <span className="text-gray-400">/</span>
              <span className="block max-w-[20vw] truncate text-[#14142b]">
                Question {activeQuestionIndex + 1}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-gray-500">
              <span className="block max-w-[28vw] truncate text-[#14142b]">{exam.title}</span>
              {activeSection && (
                <>
                  <span className="text-gray-400">/</span>
                  <span className="block max-w-[18vw] truncate font-medium">{activeSection.title}</span>
                </>
              )}
            </div>
          )
        }
        saveState={saveState}
        collaborators={[]}
        share={{
          onOpenCollaborators: () => {
            panel.setTab("collab");
            panel.setOpen(true);
          },
        }}
        panelOpen={panel.open}
        onTogglePanel={() => panel.setOpen(!panel.open)}
        workspaceActionsBefore={
          exam.courseId ? (
            <span
              title="This assessment is part of a course and will be reviewed and published when the course is submitted."
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-slate-600 backdrop-blur-md"
            >
              Course Assessment
            </span>
          ) : undefined
        }
        primaryAction={
          !readOnly && !exam.courseId
            ? {
                onClick: handlePublish,
                disabled: publishing,
                title: "Snapshot this exam and its plans into a new published version",
                icon: publishing ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />,
                label: "Publish",
              }
            : null
        }
      />

      <StudioRightPanel
        {...panel.sidebarProps}
        mode={panel.open ? "workflow" : "closed"}
        activeLessonId={null}
        collabState={{ status: "disconnected", collaborators: [] }}
        historyCapability={
          activeQuestion?.id
            ? {
                status: "available",
                data: createExamQuestionHistoryAdapter(activeQuestion.id, (snapshot) =>
                  controller.restoreQuestion(activeQuestion.key, snapshot)
                ),
              }
            : {
                status: "unavailable",
                reason:
                  "This question hasn't been saved to the server yet — history starts after the first save.",
              }
        }
        footerOverride={{ label: "Exam ID", value: examId }}
        unavailableNotes={{
          status:
            "Exams publish directly rather than going through a platform review round, so there is no submit/approve history to show. Published versions are listed on the exam's overview.",
        }}
      />

      <StudioEditorBody
        sidebarTitle="Question bank"
        sidebarTree={sidebarTree}
        // The floating rich-text toolbar only mounts while a question is open (QuestionEditorCard
        // embeds ArcadeEditor); the read-through list mounts no editor and needs no extra
        // clearance for it. This is the one legitimate reason to vary the Studio viewport's top
        // offset — the offset itself is never re-derived here, only requested from the shell.
        toolbarClearance={Boolean(activeQuestion)}
        sidebarActions={
          readOnly ? undefined : (
            <div className={TREE_SIDEBAR_ACTIONS_CLASS}>
              <button
                type="button"
                onClick={addSection}
                disabled={creatingSection || !bankId}
                className={TREE_SIDEBAR_BUTTON_CLASS}
              >
                {creatingSection ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Add section
              </button>
            </div>
          )
        }
      >
        {readOnly && (
          <div className="pointer-events-none fixed inset-x-0 top-20 z-[70] flex justify-center">
            <div className="pointer-events-auto flex max-w-[calc(100vw-2rem)] items-center rounded-full border border-slate-200 bg-white px-5 py-2 shadow-md">
              <span className="flex items-center gap-2 text-sm font-medium text-amber-600">
                <span>🔒</span> This exam has been submitted for review and is locked for editing.
              </span>
            </div>
          </div>
        )}

        {/* Scroll and header-safe clearance are owned by StudioEditorBody's `<main>` (see its
            doc comment) — this wrapper only declares its own max width, same as every other
            Studio workspace canvas. */}
        <div className={CANVAS_WRAPPER_CLASS}>
          {activeQuestion ? (
            <QuestionEditorCard
              key={activeQuestion.key}
              question={activeQuestion}
              actions={controller}
              tagSuggestions={tagSuggestions}
              readOnly={readOnly}
              navigation={{
                index: activeQuestionIndex,
                total: questions.length,
                onBack: () => setActiveQuestionKey(null),
                onPrevious:
                  activeQuestionIndex > 0
                    ? () => setActiveQuestionKey(questions[activeQuestionIndex - 1].key)
                    : undefined,
                onNext:
                  activeQuestionIndex < questions.length - 1
                    ? () => setActiveQuestionKey(questions[activeQuestionIndex + 1].key)
                    : undefined,
                onAdd: activeSectionId ? () => addQuestionTo(activeSectionId) : undefined,
              }}
            />
          ) : (
            <QuestionListPreview
              bankId={bankId}
              sections={sections}
              activeSectionId={activeSectionId}
              reloadKey={previewReloadKey}
              readOnly={readOnly}
              onOpenQuestion={openServerQuestion}
              onAddQuestion={
                sections.length > 0
                  ? () => addQuestionTo(activeSectionId || sections[0].id)
                  : undefined
              }
            />
          )}
        </div>
      </StudioEditorBody>

      {confirmDialog}
    </StudioEditorFrame>
  );
}
