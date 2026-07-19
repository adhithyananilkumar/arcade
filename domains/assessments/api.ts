// features/assessment/api.ts
// Typed calls to the assessment domain's quiz-authoring endpoints.

import { api } from "@/lib/api";
import type {
  BankQuestionResponse,
  QuestionBankQuestionsRequest,
  QuestionBankRequest,
  QuestionBankSummary,
  QuestionResponse,
  QuizAttemptResponse,
  QuizAttemptSummaryResponse,
  QuizQuestionsRequest,
  QuizStatsResponse,
  QuizSubmitAnswers,
  QuizTakeResponse,
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

// ── Question banks ────────────────────────────────────────────────────────────

/**
 * List all of the caller's question banks. Pass a courseId to also get each bank's
 * enabledForCourse flag for that course; omit it when there's no course context.
 */
export function listQuestionBanks(courseId?: string) {
  const qs = courseId ? `?courseId=${encodeURIComponent(courseId)}` : "";
  return api.get<QuestionBankSummary[]>(`/api/question-banks${qs}`);
}

export function createQuestionBank(req: QuestionBankRequest) {
  return api.post<QuestionBankSummary>(`/api/question-banks`, req);
}

export function renameQuestionBank(bankId: string, title: string) {
  return api.patch<QuestionBankSummary>(`/api/question-banks/${bankId}`, { title });
}

export function deleteQuestionBank(bankId: string) {
  return api.delete<void>(`/api/question-banks/${bankId}`);
}

/** Enable a bank for a course — requires owning both the bank and the course. */
export function enableQuestionBankForCourse(bankId: string, courseId: string) {
  return api.post<void>(`/api/question-banks/${bankId}/courses/${courseId}`, {});
}

export function disableQuestionBankForCourse(bankId: string, courseId: string) {
  return api.delete<void>(`/api/question-banks/${bankId}/courses/${courseId}`);
}

export function getBankQuestions(bankId: string) {
  return api.get<BankQuestionResponse[]>(`/api/question-banks/${bankId}/questions`);
}

export function saveBankQuestions(bankId: string, body: QuestionBankQuestionsRequest) {
  return api.put<BankQuestionResponse[]>(`/api/question-banks/${bankId}/questions`, body);
}
