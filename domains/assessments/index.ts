/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Assessments
 *
 * Purpose:
 * Exposes the public API for the Assessments domain.
 *
 * Rules:
 * - Export only stable public APIs.
 * - Never export internal helpers.
 * - Never import from apps/.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

// features/assessment/index.ts
// Public surface of the assessment domain.
export { QuizEditor } from "./components/QuizEditor";
export { StandaloneQuizEditor } from "./components/StandaloneQuizEditor";
export { QuizPlayer } from "./components/QuizPlayer";
export { QuestionBankEditor } from "./components/QuestionBankEditor";
export { getQuizStats, getOrCreateCourseQuestionBank, listPools } from "./api";
export type {
  QuestionType,
  QuestionResponse,
  OptionResponse,
  QuestionRequest,
  OptionRequest,
  QuizQuestionsRequest,
  QuizAttemptResponse,
  QuizStatsResponse,
  Difficulty,
  BankQuestionType,
  QuestionBankSummary,
  SectionResponse,
  QuestionPoolResponse,
} from "./types";
