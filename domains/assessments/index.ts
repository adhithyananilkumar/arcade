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
export { QuizPlayer } from "./components/QuizPlayer";
export { QuestionTagEditor } from "./components/QuestionTagEditor";
// The headless question-authoring engine. Rendering a question is deliberately NOT here: it needs
// Arcade's rich-text editor, which composes infrastructure and other domains and therefore lives
// at the apps layer (apps/creator/editor). The domain owns the state machine; the Studio owns the
// writing surface, and there is exactly one of those in the platform.
export {
  useSectionQuestions,
  toRequest,
  promptToPlainText,
  DIFFICULTIES,
  DIFFICULTIES_BG,
  TYPE_LABELS,
} from "./components/useSectionQuestions";
export type {
  LocalQuestion,
  LocalOption,
  SaveState,
  SectionQuestionsController,
  RestoredQuestionSnapshot,
} from "./components/useSectionQuestions";
export { listSections, createSection, renameSection, deleteSection } from "./api";
export { planReadiness, isPlanPublishable } from "./lib/planReadiness";
export type { PlanReadiness } from "./lib/planReadiness";
export { buildQuestionSearchParams } from "./api";
export { getQuizStats, getOrCreateCourseQuestionBank, listPools } from "./api";
export {
  searchBankQuestions,
  getAllBankQuestions,
  saveSectionQuestions,
  getSectionQuestions,
  reorderSections,
  listPoolDetails,
  createPoolWithFilter,
  updatePool,
  deletePool,
  previewPool,
  previewPoolDraft,
  getPoolMembers,
  setPoolMembers,
} from "./api";
export {
  listExamPlans,
  createExamPlan,
  getExamPlan,
  updateExamPlan,
  duplicateExamPlan,
  deleteExamPlan,
  validateExamPlan,
  createPlanSection,
  renamePlanSection,
  deletePlanSection,
  savePlanSectionRules,
  previewExamPaper,
} from "./api";
export {
  createExam,
  getExam,
  updateExam,
  listMyExams,
  listExamsForCourse,
  listAvailableExamsForCourse,
  attachExamToCourse,
  detachExamFromCourse,
  listExamsForEvent,
  attachExamToEvent,
  detachExamFromEvent,
  startExamAttempt,
  getExamAttempt,
  getExamAttemptQuestions,
  saveExamAnswer,
  submitExamAttempt,
  getExamResult,
  listAttemptsForExam,
  getExamQuestionBank,
  listExamVersions,
  publishExam,
} from "./api";
export type {
  DeliveryMode,
  SelectionMode,
  PoolMode,
  ExamPlanRequest,
  ExamPlanResponse,
  ExamPlanSectionResponse,
  ExamPlanValidationResponse,
  ExamSelectionRuleRequest,
  ExamSelectionRuleResponse,
  QuestionPoolDetail,
  QuestionPoolFilterRequest,
  QuestionPoolPreviewResponse,
  QuestionSearchCriteria,
  QuestionSearchResponse,
  BankQuestionResponse,
  BankQuestionRequest,
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
  ExamRequest,
  ExamResponse,
  AttemptResponse,
  AttemptQuestionResponse,
  SaveAnswerRequest,
  ExamResultResponse,
  ExamAttemptSummaryResponse,
} from "./types";
