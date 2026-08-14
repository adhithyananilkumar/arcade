// features/assessment/api.ts
// Typed calls to the assessment domain's quiz-authoring endpoints.

import { api } from "@/infrastructure/http/api";
import type { TiptapDocument } from "@/shared/types/editor.types";
import type {
  BankQuestionRequest,
  BankQuestionResponse,
  QuestionBankQuestionsRequest,
  QuestionBankSummary,
  QuestionPoolMembersRequest,
  QuestionPoolRequest,
  QuestionPoolResponse,
  QuestionResponse,
  QuizAttemptResponse,
  QuizAttemptSummaryResponse,
  QuizQuestionsRequest,
  QuizStatsResponse,
  QuizSubmitAnswers,
  QuizTakeResponse,
  ReorderSectionsRequest,
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

// ── Question pools ────────────────────────────────────────────────────────────

export function listPools(bankId: string) {
  return api.get<QuestionPoolResponse[]>(`/api/question-banks/${bankId}/pools`);
}

export function createPool(bankId: string, req: QuestionPoolRequest = {}) {
  return api.post<QuestionPoolResponse>(`/api/question-banks/${bankId}/pools`, req);
}

export function renamePool(poolId: string, title: string) {
  return api.patch<QuestionPoolResponse>(`/api/question-banks/pools/${poolId}`, { title });
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
