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
// The assessment landing page. Shared by the in-course player, the preview renderer and the
// standalone exam route, so an assessment presents identically wherever it is met.
export { AssessmentLanding } from "./components/AssessmentLanding";
export type { AssessmentLandingProps } from "./components/AssessmentLanding";
export { AssessmentResultCard } from "./components/AssessmentResultCard";
export { ExamOverview } from "./components/ExamOverview";
export { ExamGradesDialog } from "./components/ExamGradesDialog";
export type { ExamGradesDialogProps } from "./components/ExamGradesDialog";
export type { ExamOverviewProps } from "./components/ExamOverview";
export { ExamHubCardView } from "./components/ExamHubCardView";
export { planTypeMeta, planKindLabel, PLAN_TYPES } from "./lib/planTypeMeta";
export type { PlanTypeMeta } from "./lib/planTypeMeta";
export type { AssessmentResultCardProps } from "./components/AssessmentResultCard";
export { HonorCodeModal } from "./components/HonorCodeModal";
export type { HonorCodeModalProps } from "./components/HonorCodeModal";
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
  tieExam,
  listTieCandidates,
  untieExam,
  submitExamForReview,
  getCourseExam,
  createCourseExam,
  getEventExam,
  createEventExam,
  getContentCertification,
  getMyHubExams,
  getAvailableHubExams,
  getPublicExams,
  listExamStandards,
  updateExamStandard,
  startExamAttempt,
  getExamAttempt,
  getExamAttemptQuestions,
  saveExamAnswer,
  submitExamAttempt,
  getExamResult,
  getProctorSession,
  submitIdentityEvidence,
  recordProctorEvent,
  listAttemptsForExam,
  cancelExamAttempt,
  extendExamAttempt,
  grantExtraAttempts,
  reviewAttemptIdentity,
  getMarkingQueue,
  markAnswer,
  listAssessmentPlacements,
  listAssessmentPlacementsForCourse,
  placeAssessment,
  updateAssessmentPlacement,
  getAssessmentLanding,
  getExamQuestionBank,
  getExamQuestions,
  listExamVersions,
  gradePreviewPaper,
  previewAttemptPaper,
  getGradeCard,
  downloadGradeCardPdf,
  getMyGradeCards,
  verifyGradeCard,
} from "./api";
export type {
  AssessmentHostType,
  AttemptStatus,
  GradeCardResponse,
  GradeCardSection,
  GradeCardLineItem,
  GradeCardSitting,
  ContentCertificationView,
  ExamHubCard,
  ExamHubPlan,
  ExamHubStatus,
  ExamPlanPlacement,
  ExamPlanSettingView,
  ExamPlanType,
  ExamSettingKey,
  ExamSettingKind,
  ExamSettingMode,
  ExamStandard,
  ExamStandardSetting,
  ExamStandardUpdate,
  ExamTieType,
  IdentityStatus,
  LandingPlanOption,
  LandingPrerequisite,
  LandingWindow,
  MarkingItem,
  MarkingQuestion,
  ProctorSessionResponse,
  AssessmentPlacementResponse,
  AssessmentNode,
  AssessmentBlockedReason,
  AssessmentLandingResponse,
  AttemptHistoryItem,
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
export { QuestionBankImportDialog } from "./components/QuestionBankImportDialog";
export type { QuestionBankImportDialogProps } from "./components/QuestionBankImportDialog";
export { parseQuestionImport, QUESTION_IMPORT_EXAMPLE, QUESTION_IMPORT_LIMIT } from "./lib/questionImport";
export type { ImportedQuestion, ImportedSection, QuestionImportResult } from "./lib/questionImport";
