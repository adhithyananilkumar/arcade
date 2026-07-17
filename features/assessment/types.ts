// features/assessment/types.ts
// Types for the assessment domain (quiz questions & options). Mirror the Spring
// Boot DTOs in arcade-backend/assessment/dto/.

export type QuestionType = "SINGLE" | "MULTIPLE" | "TRUE_FALSE";

export interface OptionResponse {
  id: string;
  text: string;
  correct: boolean;
  position: number;
}

export interface QuestionResponse {
  id: string;
  type: QuestionType;
  prompt: string;
  points: number;
  position: number;
  options: OptionResponse[];
}

export interface OptionRequest {
  text: string;
  correct: boolean;
}

export interface QuestionRequest {
  type: QuestionType;
  prompt: string;
  points?: number;
  options: OptionRequest[];
}

export interface QuizQuestionsRequest {
  questions: QuestionRequest[];
}

// ── Question banks (assessment domain: reusable sets of questions) ───────────
// Bank questions reuse the quiz OptionRequest/Response shape, plus a SENTENCE type (free-text,
// self-checked against sampleAnswer) that quizzes don't support.

export type BankQuestionType = QuestionType | "SENTENCE";

export interface BankOptionResponse {
  id: string;
  text: string;
  correct: boolean;
  position: number;
}

export interface BankQuestionResponse {
  id: string;
  type: BankQuestionType;
  prompt: string;
  points: number;
  position: number;
  options: BankOptionResponse[];
  sampleAnswer: string;
}

export interface BankOptionRequest {
  text: string;
  correct: boolean;
}

export interface BankQuestionRequest {
  type: BankQuestionType;
  prompt: string;
  points?: number;
  options: BankOptionRequest[];
  sampleAnswer?: string;
}

export interface QuestionBankQuestionsRequest {
  questions: BankQuestionRequest[];
}

export interface QuestionBankSummary {
  id: string;
  title: string;
  questionCount: number;
  /** Whether this bank is enabled for the course passed as context when listing; false otherwise. */
  enabledForCourse: boolean;
}

export interface QuestionBankRequest {
  title?: string;
}

// ── Quiz taking (learner-facing, no answer key) ──────────────────────────────

export interface QuizTakeOptionResponse {
  id: string;
  text: string;
  position: number;
}

export interface QuizTakeQuestionResponse {
  id: string;
  type: QuestionType;
  prompt: string;
  points: number;
  position: number;
  options: QuizTakeOptionResponse[];
}

export interface QuizTakeResponse {
  id: string;
  title: string;
  questions: QuizTakeQuestionResponse[];
}

/** questionId -> selected option id(s). */
export type QuizSubmitAnswers = Record<string, string[]>;

export interface QuestionResultResponse {
  questionId: string;
  correct: boolean;
  correctOptionIds: string[];
  selectedOptionIds: string[];
}

export interface QuizAttemptResponse {
  attemptId: string;
  score: number;
  maxScore: number;
  submittedAt: string;
  results: QuestionResultResponse[];
}

export interface QuizAttemptSummaryResponse {
  attemptId: string;
  score: number;
  maxScore: number;
  submittedAt: string;
}

export interface QuizStatsResponse {
  quizId: string;
  bestScore: number | null;
  maxScore: number | null;
  attemptCount: number;
}
