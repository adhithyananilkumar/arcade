// features/assessment/api.ts
// Typed calls to the assessment domain's quiz-authoring endpoints.

import { api } from "@/infrastructure/http/api";
import type { TiptapDocument } from "@/shared/types/editor.types";
import type {
  AssessmentHostType,
  ContentCertificationView,
  ExamHubCard,
  ExamPlanType,
  ExamStandard,
  ExamStandardUpdate,
  ExamTieType,
  GradeCardResponse,
  MarkingItem,
  ProctorSessionResponse,
  AssessmentLandingResponse,
  AssessmentPlacementResponse,
  AttemptResponse,
  BankQuestionRequest,
  BankQuestionResponse,
  ExamAttemptSummaryResponse,
  ExamPlanRequest,
  ExamPlanResponse,
  ExamPlanSectionResponse,
  ExamPlanValidationResponse,
  ExamRequest,
  ExamResponse,
  ExamResultResponse,
  ExamSelectionRuleRequest,
  ExamSelectionRuleResponse,
  QuestionBankQuestionsRequest,
  QuestionBankSummary,
  AttemptQuestionResponse,
  QuestionPoolDetail,
  QuestionPoolFilterRequest,
  QuestionPoolMembersRequest,
  QuestionPoolPreviewResponse,
  QuestionPoolRequest,
  QuestionPoolResponse,
  QuestionResponse,
  QuestionSearchCriteria,
  QuestionSearchResponse,
  QuizAttemptResponse,
  QuizAttemptSummaryResponse,
  QuizQuestionsRequest,
  QuizStatsResponse,
  QuizSubmitAnswers,
  QuizTakeResponse,
  ReorderSectionsRequest,
  SaveAnswerRequest,
  SectionRequest,
  SectionResponse,
} from "./types";

/** Load the full question set for a quiz (authoring). */
export function getQuizQuestions(quizId: string) {
  return api.get<QuestionResponse[]>(`/api/quizzes/${quizId}/questions`);
}

/** Replace a quiz's entire question set. */
export function saveQuizQuestions(quizId: string, body: QuizQuestionsRequest) {
  return api.put<QuestionResponse[]>(`/api/quizzes/${quizId}/questions`, body);
}

// ── Quiz taking (learner-facing) ──────────────────────────────────────────────

/** Load a quiz for taking — prompts and options only, no answer key. */
export function getQuizForTaking(quizId: string) {
  return api.get<QuizTakeResponse>(`/api/quizzes/${quizId}/take`);
}

/** Submit answers and get back the graded result. */
export function submitQuizAttempt(quizId: string, answers: QuizSubmitAnswers) {
  return api.post<QuizAttemptResponse>(`/api/quizzes/${quizId}/attempts`, { answers });
}

/** This quiz's past attempts for the current user, most recent first. */
export function getQuizAttempts(quizId: string) {
  return api.get<QuizAttemptSummaryResponse[]>(`/api/quizzes/${quizId}/attempts`);
}

/** Best-score/attempt-count summary for a batch of quizzes (sidebar badges). */
export function getQuizStats(quizIds: string[]) {
  if (quizIds.length === 0) return Promise.resolve<QuizStatsResponse[]>([]);
  const params = quizIds.map((id) => `quizIds=${encodeURIComponent(id)}`).join("&");
  return api.get<QuizStatsResponse[]>(`/api/quizzes/stats?${params}`);
}

// ── Question banks (one per course) ───────────────────────────────────────────

const EMPTY_DOC: TiptapDocument = { type: "doc", content: [] };

/** The backend stores `prompt` as a JSON string column; the domain works with parsed TiptapDocument. */
type WireBankQuestionResponse = Omit<BankQuestionResponse, "prompt"> & { prompt: string };
type WireBankQuestionRequest = Omit<BankQuestionRequest, "prompt"> & { prompt: string };

function parsePrompt(raw: string): TiptapDocument {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as TiptapDocument) : EMPTY_DOC;
  } catch {
    return EMPTY_DOC;
  }
}

function fromWire(q: WireBankQuestionResponse): BankQuestionResponse {
  return { ...q, prompt: parsePrompt(q.prompt) };
}

type WirePoolPreview = Omit<QuestionPoolPreviewResponse, "questions"> & {
  questions: WireBankQuestionResponse[];
};

function toWire(q: BankQuestionRequest): WireBankQuestionRequest {
  return { ...q, prompt: JSON.stringify(q.prompt ?? EMPTY_DOC) };
}

/** Get (or auto-create) the question bank belonging to a course. */
export function getOrCreateCourseQuestionBank(courseId: string) {
  return api.get<QuestionBankSummary>(`/api/courses/${courseId}/question-bank`);
}

/** Every question in the bank across all sections, in section-then-position order (used by preview). */
export async function getAllBankQuestions(bankId: string): Promise<BankQuestionResponse[]> {
  const wire = await api.get<WireBankQuestionResponse[]>(`/api/question-banks/${bankId}/questions`);
  return wire.map(fromWire);
}

// ── Sections ───────────────────────────────────────────────────────────────────

export function listSections(bankId: string) {
  return api.get<SectionResponse[]>(`/api/question-banks/${bankId}/sections`);
}

export function createSection(bankId: string, req: SectionRequest = {}) {
  return api.post<SectionResponse>(`/api/question-banks/${bankId}/sections`, req);
}

export function renameSection(sectionId: string, title: string) {
  return api.patch<SectionResponse>(`/api/question-banks/sections/${sectionId}`, { title });
}

export function deleteSection(sectionId: string) {
  return api.delete<void>(`/api/question-banks/sections/${sectionId}`);
}

export function reorderSections(bankId: string, req: ReorderSectionsRequest) {
  return api.patch<SectionResponse[]>(`/api/question-banks/${bankId}/sections/reorder`, req);
}

// ── Section-scoped questions ──────────────────────────────────────────────────

export async function getSectionQuestions(sectionId: string): Promise<BankQuestionResponse[]> {
  const wire = await api.get<WireBankQuestionResponse[]>(
    `/api/question-banks/sections/${sectionId}/questions`
  );
  return wire.map(fromWire);
}

export async function saveSectionQuestions(
  sectionId: string,
  body: QuestionBankQuestionsRequest
): Promise<BankQuestionResponse[]> {
  const wireBody = { questions: body.questions.map(toWire) };
  const wire = await api.put<WireBankQuestionResponse[]>(
    `/api/question-banks/sections/${sectionId}/questions`,
    wireBody
  );
  return wire.map(fromWire);
}

/**
 * One filtered page of the bank's questions. Always paginated — the authoring table must stay
 * usable on a bank with tens of thousands of questions, so the browser never holds them all.
 */
export function buildQuestionSearchParams(criteria: QuestionSearchCriteria = {}): URLSearchParams {
  const params = new URLSearchParams();
  // Repeated keys rather than comma-joined values: the endpoint binds each facet to a List, and a
  // tag containing a comma would otherwise silently split into two filters.
  criteria.sectionIds?.forEach((id) => params.append("sectionId", id));
  criteria.difficulties?.forEach((d) => params.append("difficulty", d));
  criteria.types?.forEach((t) => params.append("type", t));
  criteria.tags?.forEach((t) => params.append("tag", t));
  if (criteria.search?.trim()) params.set("q", criteria.search.trim());
  params.set("offset", String(criteria.offset ?? 0));
  params.set("limit", String(criteria.limit ?? 25));
  return params;
}

export async function searchBankQuestions(
  bankId: string,
  criteria: QuestionSearchCriteria = {}
): Promise<QuestionSearchResponse> {
  const params = buildQuestionSearchParams(criteria);

  const wire = await api.get<Omit<QuestionSearchResponse, "questions"> & { questions: WireBankQuestionResponse[] }>(
    `/api/question-banks/${bankId}/questions/search?${params.toString()}`
  );
  return { ...wire, questions: wire.questions.map(fromWire) };
}

// ── Question pools ────────────────────────────────────────────────────────────

export function listPools(bankId: string) {
  return api.get<QuestionPoolResponse[]>(`/api/question-banks/${bankId}/pools`);
}

export function createPool(bankId: string, req: QuestionPoolRequest = {}) {
  return api.post<QuestionPoolResponse>(`/api/question-banks/${bankId}/pools`, req);
}

export function listPoolDetails(bankId: string) {
  return api.get<QuestionPoolDetail[]>(`/api/question-banks/${bankId}/pools`);
}

export function createPoolWithFilter(bankId: string, req: QuestionPoolFilterRequest) {
  return api.post<QuestionPoolDetail>(`/api/question-banks/${bankId}/pools`, req);
}

/** Partial update — title, description, mode and filter facets, each independently optional. */
export function updatePool(poolId: string, req: QuestionPoolFilterRequest) {
  return api.patch<QuestionPoolDetail>(`/api/question-banks/pools/${poolId}`, req);
}

export function renamePool(poolId: string, title: string) {
  return api.patch<QuestionPoolResponse>(`/api/question-banks/pools/${poolId}`, { title });
}

/** What a saved pool matches right now. */
export async function previewPool(poolId: string): Promise<QuestionPoolPreviewResponse> {
  const wire = await api.get<WirePoolPreview>(`/api/question-banks/pools/${poolId}/preview`);
  return { ...wire, questions: wire.questions.map(fromWire) };
}

/** What an unsaved filter would match — drives the live count while the author edits facets. */
export async function previewPoolDraft(
  bankId: string,
  req: QuestionPoolFilterRequest
): Promise<QuestionPoolPreviewResponse> {
  const wire = await api.post<WirePoolPreview>(`/api/question-banks/${bankId}/pools/preview`, req);
  return { ...wire, questions: wire.questions.map(fromWire) };
}

export function deletePool(poolId: string) {
  return api.delete<void>(`/api/question-banks/pools/${poolId}`);
}

export function getPoolMembers(poolId: string) {
  return api.get<string[]>(`/api/question-banks/pools/${poolId}/members`);
}

export function setPoolMembers(poolId: string, req: QuestionPoolMembersRequest) {
  return api.put<QuestionPoolResponse>(`/api/question-banks/pools/${poolId}/members`, req);
}

// ── Central Exam capability: authoring & tie ─────────────────────────────────

export function createExam(req: ExamRequest) {
  return api.post<ExamResponse>(`/api/exams`, req);
}

export function getExam(examId: string) {
  return api.get<ExamResponse>(`/api/exams/${examId}`);
}

export function updateExam(examId: string, req: Partial<ExamRequest>) {
  return api.patch<ExamResponse>(`/api/exams/${examId}`, req);
}

/** Every exam a channel has authored, for the Studio "Exams" listing. */
export function listMyExams() {
  return api.get<Array<{ id: string; type: string; title: string; status: string; updatedAt: string | null }>>(
    `/api/content?type=EXAM`
  );
}

/**
 * Ties a standalone exam to one course or event. Refused when either side already has a tie. The
 * platform's locked settings then apply to every plan on it.
 */
export function tieExam(examId: string, target: { courseId: string } | { eventId: string }) {
  return api.post<ExamResponse>(`/api/exams/${examId}/tie`, target);
}

/** Makes a tied exam standalone again. Its in-content placements are removed. */
export function untieExam(examId: string) {
  return api.delete<ExamResponse>(`/api/exams/${examId}/tie`);
}

/** Submits a standalone exam to review. A tied exam is reviewed and published with its content. */
export function submitExamForReview(examId: string, note?: string) {
  return api.post<void>(`/api/exams/${examId}/submit`, note ? { note } : {});
}

/** Immutable published versions of this exam, newest first. */
export function listExamVersions(examId: string) {
  return api.get<Array<{ id: string; versionNumber: number; label: string | null; publishedAt: string }>>(
    `/api/exams/${examId}/versions`
  );
}

/**
 * The exam tied to a course. Null (204) when the course has none yet — a normal state, so the
 * caller can offer to set one up rather than creating it as a side effect of asking.
 */
export function getCourseExam(courseId: string) {
  return api.get<ExamResponse | null>(`/api/courses/${courseId}/exam`);
}

/** Creates the course's tied exam. Idempotent — returns the existing one if there already is one. */
export function createCourseExam(courseId: string) {
  return api.post<ExamResponse>(`/api/courses/${courseId}/exam`, {});
}

export function getEventExam(eventId: string) {
  return api.get<ExamResponse | null>(`/api/events/${eventId}/exam`);
}

export function createEventExam(eventId: string) {
  return api.post<ExamResponse>(`/api/events/${eventId}/exam`, {});
}

/** Learner-facing: the certification a course or event leads to. Null when there is none. */
export function getContentCertification(tieType: ExamTieType, contentId: string) {
  const base = tieType === "COURSE" ? "courses" : "events";
  return api.get<ContentCertificationView | null>(`/api/${base}/${contentId}/exam/certification`);
}

// ── Exams hub (learner) ───────────────────────────────────────────────────────

/** Exams the caller registered for, with where they stand. */
export function getMyHubExams() {
  return api.get<ExamHubCard[]>(`/api/exams/hub/mine`);
}

/** Every published main exam — certifications and standalone exams. */
export function getAvailableHubExams(query?: string) {
  const q = query?.trim();
  return api.get<ExamHubCard[]>(`/api/exams/hub/available${q ? `?q=${encodeURIComponent(q)}` : ""}`);
}

// ── Exam standards (Platform Console) ─────────────────────────────────────────

export function listExamStandards() {
  return api.get<ExamStandard[]>(`/api/platform/exam-standards`);
}

export function updateExamStandard(planType: ExamPlanType, body: ExamStandardUpdate) {
  return api.put<ExamStandard>(`/api/platform/exam-standards/${planType}`, body);
}

// ── Exam attempts (learner-facing) ────────────────────────────────────────────
// Every mutation here is authoritative server-side — score, pass/fail, remaining time, and
// question correctness are never computed or trusted from the client.

/**
 * Starts a new attempt at one plan, or resumes the caller's open attempt at it. Omitting `planId`
 * lets the server pick the exam's hub plan.
 */
export function startExamAttempt(examId: string, planId?: string | null) {
  const params = new URLSearchParams();
  if (planId) params.set("planId", planId);
  return api.post<AttemptResponse>(
    `/api/exam-attempts/exams/${examId}/start${params.toString() ? `?${params.toString()}` : ""}`,
    {}
  );
}

export function getExamAttempt(attemptId: string) {
  return api.get<AttemptResponse>(`/api/exam-attempts/${attemptId}`);
}

/** The attempt's frozen paper plus any answers already saved. Never includes an answer key. */
export function getExamAttemptQuestions(attemptId: string) {
  return api.get<AttemptResponse>(`/api/exam-attempts/${attemptId}/questions`);
}

/** Saves or replaces one answer. Idempotent — safe to call on every selection change. */
export function saveExamAnswer(attemptId: string, attemptQuestionId: string, answer: SaveAnswerRequest) {
  return api.put<void>(`/api/exam-attempts/${attemptId}/questions/${attemptQuestionId}/answer`, answer);
}

/** Idempotent: resubmitting an already-terminal attempt returns the same authoritative result. */
export function submitExamAttempt(attemptId: string) {
  return api.post<ExamResultResponse>(`/api/exam-attempts/${attemptId}/submit`, {});
}

export function getExamResult(attemptId: string) {
  return api.get<ExamResultResponse>(`/api/exam-attempts/${attemptId}/result`);
}

// ── Proctoring ───────────────────────────────────────────────────────────────────────────────
// The server counts violations and ends the attempt at the plan's limit; the client only reports.

/** The candidate's proctoring session for a plan — identity status before starting. */
export function getProctorSession(examId: string, planId: string) {
  return api.get<ProctorSessionResponse>(`/api/exams/${examId}/plans/${planId}/proctoring/session`);
}

/** Submits identity evidence: a photo already uploaded through the media endpoint. */
export function submitIdentityEvidence(examId: string, planId: string, evidenceUrl: string) {
  return api.post<ProctorSessionResponse>(`/api/exams/${examId}/plans/${planId}/proctoring/identity`, {
    evidenceUrl,
  });
}

/**
 * Reports a proctoring event (tab switch, fullscreen exit…). Returns the attempt as the server now
 * sees it — which may be CANCELLED if this report reached the plan's violation limit.
 */
export function recordProctorEvent(attemptId: string, eventType: string, detail?: string) {
  return api.post<AttemptResponse>(`/api/exam-attempts/${attemptId}/proctoring/events`, { eventType, detail });
}

// ── Exam administration (creator-facing) ─────────────────────────────────────

/** Every learner's attempts at this exam. */
export function listAttemptsForExam(examId: string) {
  return api.get<ExamAttemptSummaryResponse[]>(`/api/exam-attempts/exams/${examId}/all`);
}

export function cancelExamAttempt(attemptId: string) {
  return api.post<void>(`/api/exam-attempts/${attemptId}/cancel`, {});
}

/** Gives an in-progress attempt extra time (an accommodation). */
export function extendExamAttempt(attemptId: string, minutes: number) {
  return api.post<AttemptResponse>(`/api/exam-attempts/${attemptId}/extend`, { minutes });
}

/** Grants one learner extra attempts at one plan. */
export function grantExtraAttempts(planId: string, learnerId: string, extraAttempts: number, reason?: string) {
  return api.post<void>(`/api/exam-attempts/plans/${planId}/learners/${learnerId}/allowance`, {
    extraAttempts,
    reason: reason ?? null,
  });
}

export function reviewAttemptIdentity(attemptId: string, approved: boolean, note?: string) {
  return api.post<void>(`/api/exam-attempts/${attemptId}/identity-review`, { approved, note: note ?? null });
}

/** Attempts with written answers awaiting marking. */
export function getMarkingQueue(examId: string) {
  return api.get<MarkingItem[]>(`/api/exams/${examId}/marking`);
}

/** Marks one written answer. Returns the result's status — FINAL once every answer is marked. */
export function markAnswer(attemptId: string, attemptQuestionId: string, marks: number, note?: string) {
  return api.put<{ resultStatus: string }>(
    `/api/exam-attempts/${attemptId}/questions/${attemptQuestionId}/mark`,
    { marks, note: note ?? null }
  );
}

/** Get-or-create the question bank this exam draws from (its course's, or its own if standalone). */
export function getExamQuestionBank(examId: string) {
  return api.get<QuestionBankSummary>(`/api/exams/${examId}/question-bank`);
}

/** All questions configured for this exam's question bank. */
export async function getExamQuestions(examId: string): Promise<BankQuestionResponse[]> {
  const wire = await api.get<WireBankQuestionResponse[]>(`/api/exams/${examId}/question-bank/questions`);
  return wire.map(fromWire);
}

// ── Exam plans ────────────────────────────────────────────────────────────────
// A plan is one sitting an exam offers. Sections and selection rules belong to a plan.

export function listExamPlans(examId: string) {
  return api.get<ExamPlanResponse[]>(`/api/exams/${examId}/plans`);
}

/** `planType` is required; the server applies the platform's standard for that type. */
export function createExamPlan(examId: string, req: ExamPlanRequest & { planType: ExamPlanType }) {
  return api.post<ExamPlanResponse>(`/api/exams/${examId}/plans`, req);
}

export function getExamPlan(planId: string) {
  return api.get<ExamPlanResponse>(`/api/exam-plans/${planId}`);
}

export function updateExamPlan(planId: string, req: ExamPlanRequest) {
  return api.patch<ExamPlanResponse>(`/api/exam-plans/${planId}`, req);
}

export function duplicateExamPlan(planId: string) {
  return api.post<ExamPlanResponse>(`/api/exam-plans/${planId}/duplicate`, {});
}

export function deleteExamPlan(planId: string) {
  return api.delete<void>(`/api/exam-plans/${planId}`);
}

/** Per-rule "asked for N, N available" check, plus the platform minimum. */
export function validateExamPlan(planId: string) {
  return api.get<ExamPlanValidationResponse>(`/api/exam-plans/${planId}/validate`);
}

export function createPlanSection(planId: string, title?: string) {
  return api.post<ExamPlanSectionResponse>(`/api/exam-plans/${planId}/sections`, title ? { title } : {});
}

export function renamePlanSection(sectionId: string, title: string) {
  return api.patch<ExamPlanSectionResponse>(`/api/exams/sections/${sectionId}`, { title });
}

export function deletePlanSection(sectionId: string) {
  return api.delete<void>(`/api/exams/sections/${sectionId}`);
}

/** Replaces a section's entire rule set. */
export function savePlanSectionRules(sectionId: string, rules: ExamSelectionRuleRequest[]) {
  return api.put<ExamSelectionRuleResponse[]>(`/api/exams/sections/${sectionId}/rules`, { rules });
}

/** Creator-facing preview of the paper a plan's current draft would produce. Persists nothing. */
export async function previewExamPaper(
  examId: string,
  planId?: string | null
): Promise<Array<{ id: string; level: string; question: TiptapDocument; options: string[]; marks: number | null }>> {
  const query = planId ? `?planId=${encodeURIComponent(planId)}` : "";
  const wire = await api.get<Array<{ id: string; level: string; question: string; options: string[]; marks: number | null }>>(
    `/api/exams/${examId}/preview-paper${query}`
  );
  return wire.map((q) => ({ ...q, question: parsePrompt(q.question) }));
}

/**
 * Creator-facing preview paper shaped like a real attempt — real option ids, no correctness — so an
 * author can sit their own exam end to end and have it graded.
 */
export function previewAttemptPaper(examId: string, planId?: string | null) {
  const query = planId ? `?planId=${encodeURIComponent(planId)}` : "";
  return api.get<AttemptQuestionResponse[]>(`/api/exams/${examId}/preview-paper/attempt${query}`);
}

/**
 * Grades an author's preview sitting. The whole paper is sent (question id + the marks it carried)
 * so skipped questions count as unanswered and rule marks are honoured.
 */
export function gradePreviewPaper(
  examId: string,
  payload: {
    planId?: string | null;
    questions: Array<{ questionId: string; points: number }>;
    answers: Record<string, { selectedOptionIds?: string[]; textAnswer?: string | null }>;
  }
) {
  return api.post<ExamResultResponse>(`/api/exams/${examId}/preview-paper/grade`, payload);
}

// ── Assessment placement & landing ────────────────────────────────────────────

/** Every assessment placed in one host — a module's, or a course's own root-level ones. */
export function listAssessmentPlacements(hostType: AssessmentHostType, hostId: string) {
  return api.get<AssessmentPlacementResponse[]>(
    `/api/assessments/placements?hostType=${hostType}&hostId=${encodeURIComponent(hostId)}`
  );
}

/** Every assessment anywhere under a course — root and all modules — for the Assessments tab. */
export function listAssessmentPlacementsForCourse(courseId: string) {
  return api.get<AssessmentPlacementResponse[]>(`/api/assessments/placements/course/${courseId}`);
}

/**
 * Places a plan in a host inside its exam's tied content, or moves it there. Only COMPLETION and
 * ASSESSMENT plans of a tied exam can be placed; each has exactly one placement.
 */
export function placeAssessment(payload: {
  examId: string;
  planId: string;
  hostType: AssessmentHostType;
  hostId: string;
}) {
  return api.post<AssessmentPlacementResponse>("/api/assessments/placements", payload);
}

export function updateAssessmentPlacement(
  placementId: string,
  patch: { instructions?: string; titleOverride?: string }
) {
  return api.patch<AssessmentPlacementResponse>(`/api/assessments/placements/${placementId}`, patch);
}

/**
 * The assessment landing page's data: what this is, the terms of the sitting, the candidate's own
 * history, and whether they may begin. `startable`/`blockedReason` are server-decided — render them,
 * never recompute them.
 */
export function getAssessmentLanding(
  examId: string,
  opts: { planId?: string | null; placementId?: string | null } = {}
) {
  const params = new URLSearchParams();
  if (opts.planId) params.set("planId", opts.planId);
  if (opts.placementId) params.set("placementId", opts.placementId);
  const query = params.toString();
  return api.get<AssessmentLandingResponse>(`/api/assessments/landing/${examId}${query ? `?${query}` : ""}`);
}

// ── Grade cards ───────────────────────────────────────────────────────────────

export function getGradeCard(cardId: string) {
  return api.get<GradeCardResponse>(`/api/exams/grade-cards/${cardId}`);
}

export function getMyGradeCards() {
  return api.get<GradeCardResponse[]>(`/api/exams/grade-cards/mine`);
}

export function verifyGradeCard(code: string) {
  return api.get<GradeCardResponse>(`/api/exams/grade-cards/verify/${encodeURIComponent(code.trim())}`);
}
