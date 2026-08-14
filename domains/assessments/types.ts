// features/assessment/types.ts
// Types for the assessment domain (quiz questions & options). Mirror the Spring
// Boot DTOs in arcade-backend/assessment/dto/.

import type { TiptapDocument } from "@/shared/types/editor.types";

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

// ── Question banks (assessment domain: one per course, rich-text prompts) ────
// Every course has exactly one question bank, auto-provisioned on first access.
// Bank questions reuse the quiz OptionRequest/Response shape, plus a SENTENCE type (free-text,
// self-checked against sampleAnswer) that quizzes don't support. Unlike quiz prompts, bank
// prompts are rich text (a Tiptap document) authored with the bank's own standalone editor —
// never the course content engine's ArcadeEditor, and never stored alongside lesson content.

export type BankQuestionType = QuestionType | "SENTENCE";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface BankOptionResponse {
  id: string;
  text: string;
  correct: boolean;
  position: number;
}

export interface BankQuestionResponse {
  id: string;
  sectionId: string;
  type: BankQuestionType;
  difficulty: Difficulty;
  prompt: TiptapDocument;
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
  id?: string;
  type: BankQuestionType;
  difficulty: Difficulty;
  prompt: TiptapDocument;
  points?: number;
  options: BankOptionRequest[];
  sampleAnswer?: string;
}

export interface QuestionBankQuestionsRequest {
  questions: BankQuestionRequest[];
}

export interface QuestionPoolResponse {
  id: string;
  bankId: string;
  title: string;
  questionCount: number;
}

export interface QuestionPoolRequest {
  title?: string;
}

export interface QuestionPoolMembersRequest {
  questionIds: string[];
}

export interface QuestionBankSummary {
  id: string;
  courseId: string;
  title: string;
  questionCount: number;
}

// ── Question bank sections (topics that group a bank's questions) ────────────

export interface SectionResponse {
  id: string;
  title: string;
  position: number;
  questionCount: number;
}

export interface SectionRequest {
  title?: string;
}

export interface ReorderSectionsRequest {
  sectionIds: string[];
}

// ── Quiz taking (learner-facing, no answer key) ──────────────────────────────

export interface QuizResponse {
  id: string;
  title: string;
  position: number;
  passingScore: number;
}

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
  passingScore: number;
  passed: boolean;
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
