// features/assessment/api.ts
// Typed calls to the assessment domain's quiz-authoring endpoints.

import { api } from "@/lib/api";
import type {
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
