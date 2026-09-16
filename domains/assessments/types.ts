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
  /** Free-form author-set topic tags. Dynamic pools and selection rules filter on these. */
  tags: string[];
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
  /** Omit to leave the question's existing tags untouched. */
  tags?: string[];
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

// ── Central Exam capability ───────────────────────────────────────────────────
// An exam is a first-class capability: standalone, or placed under a Course/Event (never both).
// Placement is a location, not a type — `purpose` is a free-form, creator-set label, never an
// enum the UI branches on. Mirrors arcade-backend exam/dto/{ExamRequest,ExamResponse}.java.

export interface ExamResponse {
  id: string;
  authorId: string | null;
  authorName: string | null;
  authorUsername: string | null;
  authorAvatarUrl: string | null;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  pricingModel: string;
  priceAmount: number | null;
  examSchedule: string | null;
  rejectionReason: string | null;
  status: string;
  wasPublished: boolean;
  hasDraftChanges: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  courseId: string | null;
  eventId: string | null;
  channelId: string | null;
  purpose: string | null;
  requiredForCompletion: boolean;
  questionCount: number;
  easyPercent: number;
  mediumPercent: number;
  hardPercent: number;
  examType: "BADGED" | "CERTIFIED";
  durationMinutes: number;
  passPercentage: number;
  maxAttempts: number;
  proctoringRequired: boolean;
  identityVerificationRequired: boolean;
  fullscreenRequired: boolean;
  sameQuestionsForAllStudents: boolean;
}

export interface ExamRequest {
  title: string;
  description?: string;
  coverImageUrl?: string;
  pricingModel?: string;
  priceAmount?: number;
  examSchedule?: string;
  channelId?: string;
  courseId?: string;
  eventId?: string;
  purpose?: string;
  requiredForCompletion?: boolean;
  questionCount?: number;
  easyPercent?: number;
  mediumPercent?: number;
  hardPercent?: number;
  examType?: "BADGED" | "CERTIFIED";
  durationMinutes?: number;
  passPercentage?: number;
  maxAttempts?: number;
  proctoringRequired?: boolean;
  identityVerificationRequired?: boolean;
  fullscreenRequired?: boolean;
  sameQuestionsForAllStudents?: boolean;
}

// ── Exam attempts (learner-facing, server-authoritative) ─────────────────────
// The server owns time, scoring, and correctness. No response here ever carries an answer key.

export interface AttemptQuestionOptionView {
  id: string;
  text: string;
  position: number;
}

export interface AttemptQuestionResponse {
  id: string;
  position: number;
  type: string;
  points: number;
  prompt: unknown; // Tiptap JSON document
  options: AttemptQuestionOptionView[];
  selectedOptionIds: string[];
  textAnswer: string | null;
}

export interface AttemptResponse {
  id: string;
  examId: string;
  examVersionId: string;
  attemptNumber: number;
  status: string;
  startedAt: string;
  expiresAt: string;
  submittedAt: string | null;
  serverTime: string;
  secondsRemaining: number;
  questions: AttemptQuestionResponse[];
}

export interface SaveAnswerRequest {
  selectedOptionIds: string[];
  textAnswer?: string | null;
}

/** Creator-facing: one learner's attempt row in an exam's Attempts & Results tab. */
export interface ExamAttemptSummaryResponse {
  attemptId: string;
  userId: string;
  userName: string;
  attemptNumber: number;
  status: string;
  startedAt: string;
  submittedAt: string | null;
  marksObtained: number | null;
  maximumMarks: number | null;
  percentage: number | null;
  passed: boolean | null;
}

export interface ExamResultResponse {
  attemptId: string;
  examId: string;
  examVersionId: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  marksObtained: number;
  maximumMarks: number;
  percentage: number;
  passPercentage: number;
  passed: boolean;
  scoringVersion: number;
  calculatedAt: string;
}

// ── Exam Plans ────────────────────────────────────────────────────────────────
// An Exam Content is the examination itself. An Exam Plan is one way of offering it — its own
// question selection, timing, attempt allowance, scoring, delivery, security and completion
// behaviour. One exam may carry several ("Course Completion", "Certification", "Practice").
// `name` is free text the creator authors; nothing in the platform branches on it, so a new kind
// of examination never needs a code change. Mirrors exam/dto/ExamPlan{Request,Response}.java.

export type DeliveryMode = "ON_DEMAND" | "SCHEDULED";

export type SelectionMode = "RULE_BASED" | "MANUAL";

export interface ExamSelectionRuleResponse {
  id: string;
  sectionId: string;
  selectionMode: SelectionMode;
  /** Draw from this pool; null means the question bank itself. */
  poolId: string | null;
  /** Restrict to one question-bank section; null means no section constraint. */
  bankSectionId: string | null;
  difficulty: Difficulty | null;
  tags: string[];
  /** Marks each drawn question is worth; null means "the question's own points". */
  marksPerQuestion: number | null;
  count: number;
  position: number;
  /** Server-rendered description of the source, e.g. "Java Medium" or "Question Bank · OOP". */
  sourceLabel: string;
  manualQuestionIds: string[];
}

export interface ExamSelectionRuleRequest {
  selectionMode?: SelectionMode;
  poolId?: string | null;
  bankSectionId?: string | null;
  difficulty?: Difficulty | null;
  tags?: string[];
  marksPerQuestion?: number | null;
  count?: number;
  manualQuestionIds?: string[];
}

export interface ExamPlanSectionResponse {
  id: string;
  examId: string;
  planId: string;
  title: string;
  position: number;
  rules: ExamSelectionRuleResponse[];
}

export interface ExamPlanResponse {
  id: string;
  examId: string;
  name: string;
  description: string | null;
  position: number;
  active: boolean;
  durationMinutes: number;
  maxAttempts: number;
  passPercentage: number;
  deliveryMode: DeliveryMode;
  opensAt: string | null;
  closesAt: string | null;
  fixedPaper: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  registrationRequired: boolean;
  proctoringRequired: boolean;
  identityVerificationRequired: boolean;
  fullscreenRequired: boolean;
  grantsCompletion: boolean;
  grantsCertificate: boolean;
  /** Sum of every rule's count — the size of the paper this plan builds. */
  totalQuestions: number;
  totalMarks: number;
  sections: ExamPlanSectionResponse[];
}

/** Every field optional: a null/absent field leaves that part of the plan unchanged. */
export type ExamPlanRequest = Partial<{
  name: string;
  description: string;
  active: boolean;
  durationMinutes: number;
  maxAttempts: number;
  passPercentage: number;
  deliveryMode: DeliveryMode;
  opensAt: string | null;
  closesAt: string | null;
  fixedPaper: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  registrationRequired: boolean;
  proctoringRequired: boolean;
  identityVerificationRequired: boolean;
  fullscreenRequired: boolean;
  grantsCompletion: boolean;
  grantsCertificate: boolean;
}>;

export interface ExamPlanValidationResponse {
  ok: boolean;
  planId: string;
  totalRequired: number;
  rules: Array<{
    ruleId: string;
    sectionId: string;
    sectionTitle: string;
    sourceLabel: string;
    required: number;
    available: number;
    ok: boolean;
  }>;
}

// ── Question pools, dynamic ───────────────────────────────────────────────────
// A MANUAL pool is a curated list of questions. A DYNAMIC pool is a saved filter whose matching
// set changes on its own as the question bank changes. `questionCount` is always the live count.

export type PoolMode = "MANUAL" | "DYNAMIC";

export interface QuestionPoolDetail {
  id: string;
  bankId: string;
  title: string;
  description: string | null;
  mode: PoolMode;
  sectionIds: string[];
  difficulties: Difficulty[];
  questionTypes: BankQuestionType[];
  tags: string[];
  questionCount: number;
}

export interface QuestionPoolFilterRequest {
  title?: string;
  description?: string;
  mode?: PoolMode;
  sectionIds?: string[];
  difficulties?: Difficulty[];
  questionTypes?: BankQuestionType[];
  tags?: string[];
}

export interface QuestionPoolPreviewResponse {
  matchingCount: number;
  questions: BankQuestionResponse[];
  hasMore: boolean;
}

// ── Question bank search ──────────────────────────────────────────────────────

export interface QuestionSearchCriteria {
  sectionIds?: string[];
  difficulties?: Difficulty[];
  types?: BankQuestionType[];
  tags?: string[];
  search?: string;
  offset?: number;
  limit?: number;
}

export interface QuestionSearchResponse {
  questions: BankQuestionResponse[];
  total: number;
  offset: number;
  limit: number;
  /** Every tag in use anywhere in the bank — the tag filter's options. */
  availableTags: string[];
}
