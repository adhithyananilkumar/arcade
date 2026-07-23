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
export { QuizPlayer } from "./components/QuizPlayer";
export { SnapshotQuizViewer } from "./components/SnapshotQuizViewer";
export { QuestionBankPanel } from "./components/QuestionBankPanel";
export { getQuizStats } from "./api";
export type {
  QuestionType,
  QuestionResponse,
  OptionResponse,
  QuestionRequest,
  OptionRequest,
  QuizQuestionsRequest,
  QuizAttemptResponse,
  QuizStatsResponse,
} from "./types";
