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
// An exam is Arcade's assessment and grading unit. It is either standalone (found by learners in
// Explore > Exams) or tied to exactly one course or event, whose assessments are then plans on it.
// Mirrors arcade-backend exam/dto/{ExamRequest,ExamResponse}.java.

/** The content an exam is tied to. Null when the exam is standalone. */
export type ExamTieType = "COURSE" | "EVENT";

export interface ExamResponse {
  id: string;
  authorId: string | null;
  authorName: string | null;
  authorUsername: string | null;
  authorAvatarUrl: string | null;
  title: string;
  description: string | null;
  purpose: string | null;
  /** Tiptap JSON, serialized. */
  instructions: string | null;
  status: string;
  rejectionReason: string | null;
  published: boolean;
  /** Edited since the version learners are served — they keep the frozen one until it is republished. */
  hasUnpublishedChanges: boolean;
  publishedVersionId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  channelId: string | null;
  tieType: ExamTieType | null;
  tiedContentId: string | null;
  tiedContentTitle: string | null;
  /** The exam's own price (standalone exams), in minor currency units. */
  priceAmountMinor: number | null;
  currency: string | null;
  /** What a learner actually pays to register: the price, or the platform's certification fee. */
  registrationFeeMinor: number;
  planCount: number;
  canManage: boolean;
  /** The Explore category; null is "Other". */
  categoryId: string | null;
}

export interface ExamRequest {
  title?: string;
  description?: string;
  channelId?: string;
  courseId?: string;
  eventId?: string;
  purpose?: string;
  instructions?: string;
  priceAmountMinor?: number | null;
  currency?: string;
  /** An Explore category id; "" clears it. */
  categoryId?: string;
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
  sectionTitle?: string | null;
}

export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "AUTO_SUBMITTED" | "EXPIRED" | "CANCELLED";

export interface AttemptResponse {
  id: string;
  examId: string;
  planId: string;
  planType: ExamPlanType | null;
  planName: string | null;
  examVersionId: string;
  attemptNumber: number;
  status: AttemptStatus | string;
  /** Why an attempt was ended by someone other than the candidate. */
  terminationReason: string | null;
  startedAt: string;
  expiresAt: string;
  extraMinutes: number;
  submittedAt: string | null;
  serverTime: string;
  secondsRemaining: number;
  proctoringRequired: boolean;
  fullscreenRequired: boolean;
  /** Recorded violations that end the attempt. 0 means unlimited. */
  maxViolations: number;
  violationCount: number;
  questions: AttemptQuestionResponse[];
}

export interface SaveAnswerRequest {
  selectedOptionIds: string[];
  textAnswer?: string | null;
}

/** Creator-facing: one learner's attempt row in an exam's Attempts tab. */
export interface ExamAttemptSummaryResponse {
  attemptId: string;
  userId: string;
  userName: string;
  planId: string;
  planName: string | null;
  attemptNumber: number;
  status: string;
  terminationReason: string | null;
  startedAt: string;
  expiresAt: string;
  submittedAt: string | null;
  extraMinutes: number;
  marksObtained: number | null;
  maximumMarks: number | null;
  percentage: number | null;
  passed: boolean | null;
  awaitingMarking: boolean;
  identityStatus: IdentityStatus | null;
  identityEvidenceUrl: string | null;
  violationCount: number;
}

export interface ExamResultResponse {
  attemptId: string;
  examId: string;
  planId: string | null;
  examVersionId: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  marksObtained: number;
  maximumMarks: number;
  percentage: number;
  passPercentage: number;
  /** Always false for an ungraded assessment — it records a score, not a pass. */
  passed: boolean;
  graded: boolean;
  /** FINAL, or PENDING_REVIEW while written answers await marking. */
  status: string;
  scoringVersion: number;
  calculatedAt: string;
}

// ── Exam Plans ────────────────────────────────────────────────────────────────
// A plan is one sitting an exam offers. Its type is platform-defined and decides what passing it
// does; its settings are governed by the platform's exam standards (locked, or a default the
// creator may change within limits). Mirrors exam/dto/ExamPlan{Request,Response}.java.

/**
 * CERTIFICATION — issues a certificate; listed in Explore > Exams; at most one per exam.
 * COMPLETION — passing it completes the tied course/event; at most one per exam; tied exams only.
 * ASSESSMENT — a graded or ungraded check inside content, or a standalone exam in the hub.
 */
export type ExamPlanType = "CERTIFICATION" | "COMPLETION" | "ASSESSMENT";

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

export type ExamSettingKey =
  | "DURATION_MINUTES"
  | "MAX_ATTEMPTS"
  | "PASS_PERCENTAGE"
  | "MIN_QUESTIONS"
  | "GRADED"
  | "SHUFFLE_QUESTIONS"
  | "SHUFFLE_OPTIONS"
  | "FIXED_PAPER"
  | "PROCTORING_REQUIRED"
  | "IDENTITY_VERIFICATION_REQUIRED"
  | "FULLSCREEN_REQUIRED"
  | "MAX_VIOLATIONS"
  | "FEE_AMOUNT_MINOR";

export type ExamSettingKind = "BOOLEAN" | "INTEGER" | "DECIMAL";

/** LOCKED forces the platform's value; DEFAULT pre-fills it and lets the creator change it within min/max. */
export type ExamSettingMode = "LOCKED" | "DEFAULT";

/**
 * One plan setting as the server resolved it against the platform standard. `editable` is the only
 * thing the UI uses to enable a control — never re-derive it from `mode`.
 */
export interface ExamPlanSettingView {
  key: ExamSettingKey;
  label: string;
  kind: ExamSettingKind;
  /** Booleans come as 0/1. */
  value: number | null;
  platformValue: number | null;
  mode: ExamSettingMode;
  min: number | null;
  max: number | null;
  /** Whether the standard binds this plan at all (tied exam, or enforced on standalone ones). */
  binds: boolean;
  editable: boolean;
}

export interface ExamPlanPlacement {
  placementId: string;
  hostType: AssessmentHostType;
  hostId: string;
  instructions: string | null;
  titleOverride: string | null;
}

export interface ExamPlanResponse {
  id: string;
  examId: string;
  planType: ExamPlanType;
  name: string;
  description: string | null;
  position: number;
  active: boolean;
  durationMinutes: number;
  maxAttempts: number;
  passPercentage: number;
  /** ASSESSMENT only: whether the sitting has a pass mark and counts towards the transcript. */
  graded: boolean;
  fixedPaper: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  proctoringRequired: boolean;
  identityVerificationRequired: boolean;
  fullscreenRequired: boolean;
  maxViolations: number;
  /** Shown in Explore > Exams (certifications, and every plan of a standalone exam). */
  hubListed: boolean;
  /** Where inside the tied content this plan sits. Null for hub-listed plans. */
  placement: ExamPlanPlacement | null;
  /** The platform's minimum paper size for this type; publishing is refused below it. */
  minQuestions: number;
  /** Sum of every rule's count — the size of the paper this plan builds. */
  totalQuestions: number;
  totalMarks: number;
  settings: ExamPlanSettingView[];
  sections: ExamPlanSectionResponse[];
  /**
   * In the version learners sit now. False means draft only: learners cannot see this plan until
   * the next approved submission (for a linked exam, of its course or event).
   */
  live: boolean;
}

/** Every field optional: an absent field leaves that part of the plan unchanged. `planType` is create-only. */
export type ExamPlanRequest = Partial<{
  planType: ExamPlanType;
  name: string;
  description: string;
  active: boolean;
  durationMinutes: number;
  maxAttempts: number;
  passPercentage: number;
  graded: boolean;
  fixedPaper: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  proctoringRequired: boolean;
  identityVerificationRequired: boolean;
  fullscreenRequired: boolean;
  maxViolations: number;
}>;

export interface ExamPlanValidationResponse {
  ok: boolean;
  planId: string;
  totalRequired: number;
  minQuestions: number;
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

// ── Exam standards (Platform Console) ─────────────────────────────────────────

export interface ExamStandardSetting {
  key: ExamSettingKey;
  label: string;
  kind: ExamSettingKind;
  value: number | null;
  mode: ExamSettingMode;
  min: number | null;
  max: number | null;
}

export interface ExamStandard {
  planType: ExamPlanType;
  displayName: string;
  description: string | null;
  /** Extend this type's locks to standalone exams too. Off: standalone exams only get the defaults. */
  enforceOnUntied: boolean;
  updatedAt: string | null;
  settings: ExamStandardSetting[];
}

export interface ExamStandardUpdate {
  displayName?: string;
  description?: string;
  enforceOnUntied?: boolean;
  settings?: Array<{
    key: ExamSettingKey;
    value: number | null;
    mode: ExamSettingMode;
    min: number | null;
    max: number | null;
  }>;
}

// ── Marking ───────────────────────────────────────────────────────────────────

export interface MarkingQuestion {
  attemptQuestionId: string;
  position: number;
  prompt: unknown;
  sampleAnswer: string | null;
  textAnswer: string | null;
  points: number;
  awardedMarks: number | null;
  note: string | null;
}

export interface MarkingItem {
  attemptId: string;
  planId: string;
  userId: string;
  learnerName: string;
  attemptNumber: number;
  submittedAt: string | null;
  questions: MarkingQuestion[];
}

// ── Proctoring ────────────────────────────────────────────────────────────────

/** SUBMITTED lets the candidate start; an administrator then approves or rejects the evidence. */
export type IdentityStatus = "NOT_SUBMITTED" | "SUBMITTED" | "APPROVED" | "REJECTED";

export interface ProctorSessionResponse {
  id: string | null;
  examId: string;
  planId: string;
  attemptId: string | null;
  status: string;
  identityStatus: IdentityStatus;
  identitySubmittedAt: string | null;
  violationCount: number;
  startedAt: string | null;
  endedAt: string | null;
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

// ── Assessment placement & landing ────────────────────────────────────────────
// A COMPLETION or ASSESSMENT plan of a tied exam sits somewhere inside the tied content — the
// course root, a module, or the event. Every such plan has exactly one placement.

/** Where an assessment can sit. */
export type AssessmentHostType = "COURSE" | "COURSE_MODULE" | "EVENT";

export interface AssessmentPlacementResponse {
  id: string;
  examId: string;
  hostType: AssessmentHostType;
  hostId: string;
  planId: string;
  /** Shares one ordering space with the host's lessons, so it can sit between two of them. */
  position: number;
  /** Tiptap JSON, serialized. Overrides the exam's own instructions for this appearance. */
  instructions: string | null;
  titleOverride: string | null;
}

/** An assessment node inside a course tree, as the learner player and renderers see it. */
export interface AssessmentNode {
  placementId: string;
  examId: string;
  planId: string | null;
  title: string;
  position: number;
  /** COMPLETION | ASSESSMENT. Null on snapshots published before exam types existed. */
  planType: ExamPlanType | null;
  graded: boolean;
  /** Derived server-side: a COMPLETION plan gates the content's completion. */
  requiredForCompletion: boolean;
}

/**
 * Why a candidate cannot begin. Decided by the server from the same rules the attempt-start path
 * enforces — never recomputed in the browser, which would drift from what is actually enforced.
 */
export type AssessmentBlockedReason =
  | "NOT_PUBLISHED"
  | "NOT_AVAILABLE"
  | "NOT_ENROLLED"
  | "REGISTRATION_REQUIRED"
  | "PAYMENT_REQUIRED"
  | "PREREQUISITE_NOT_MET"
  | "NOT_STARTED_YET"
  | "WINDOW_CLOSED"
  | "ATTEMPTS_EXHAUSTED"
  | "IDENTITY_REQUIRED"
  | "COMPLETION_REQUIREMENTS"
  | "RETAKE_APPROVAL_REQUIRED";

/** One line of a completion (final) assessment's checklist: finish every lesson, pass each graded assessment. */
export interface CompletionRequirement {
  kind: "LESSONS" | "GRADED_ASSESSMENT";
  label: string;
  met: boolean;
  /** The graded assessment to open, for a GRADED_ASSESSMENT line. */
  placementId: string | null;
}

/** An assessment placed in an event, as its learner meets it. */
export interface LearnerAssessmentNode {
  placementId: string;
  examId: string;
  planId: string;
  title: string;
  position: number;
  planType: "COMPLETION" | "ASSESSMENT";
  graded: boolean;
  requiredForCompletion: boolean;
  passed: boolean;
}

/** One past sitting. A pending-review entry reports no pass/fail yet, rather than a provisional one. */
export interface AttemptHistoryItem {
  attemptId: string;
  attemptNumber: number;
  status: string;
  terminationReason: string | null;
  submittedAt: string | null;
  percentage: number | null;
  passed: boolean | null;
  awaitingReview: boolean;
  gradeCardId: string | null;
  certificateIssued: boolean;
}

export interface LandingPlanOption {
  planId: string;
  name: string;
  planType: ExamPlanType;
}

export interface LandingPrerequisite {
  contentType: ExamTieType;
  contentId: string;
  title: string;
  met: boolean;
  message: string | null;
}

/** `state` is OPEN, NOT_YET_OPEN, CLOSED or NEVER. Null bounds are unbounded. */
export interface LandingWindow {
  opensAt: string | null;
  closesAt: string | null;
  state: string;
}

/**
 * Everything the assessment landing page shows before a candidate starts. `startable` and
 * `blockedReason` are server-decided — render them, never recompute them.
 */
export interface AssessmentLandingResponse {
  examId: string;
  title: string;
  description: string | null;
  purpose: string | null;
  /** Tiptap document. */
  instructions: unknown | null;

  tieType: ExamTieType | null;
  tiedContentId: string | null;
  tiedContentTitle: string | null;

  placementId: string | null;
  planId: string | null;
  planName: string | null;
  planDescription: string | null;
  planType: ExamPlanType | null;
  graded: boolean;
  /** Reached from Explore > Exams (registration-based) rather than from inside content. */
  hubListed: boolean;
  /** Other plans the candidate could sit on this exam from the same entry point. */
  plans: LandingPlanOption[];

  durationMinutes: number;
  maxAttempts: number;
  passPercentage: number;
  questionCount: number;

  proctoringRequired: boolean;
  identityVerificationRequired: boolean;
  fullscreenRequired: boolean;
  maxViolations: number;

  registrationRequired: boolean;
  registered: boolean;
  feeMinor: number;
  currency: string | null;
  prerequisite: LandingPrerequisite | null;
  enrollmentWindow: LandingWindow | null;
  accessWindow: LandingWindow | null;
  identityStatus: IdentityStatus | null;

  attemptsUsed: number;
  attemptsRemaining: number;
  /** An attempt already in progress, which Start resumes rather than replacing. */
  openAttemptId: string | null;

  history: AttemptHistoryItem[];
  latestAttempt: AttemptHistoryItem | null;
  bestAttempt: AttemptHistoryItem | null;
  passed: boolean | null;
  score: number | null;

  startable: boolean;
  blockedReason: AssessmentBlockedReason | null;
  blockedMessage: string | null;
  canManage: boolean;
  /** For a content's completion assessment: what must be finished first. Empty otherwise. */
  completionRequirements?: CompletionRequirement[];
}

// ── Exam catalogue (Explore > Exams) and My Learning > Exams ──────────────────────────────────────────

export interface ExamHubPlan {
  planId: string;
  name: string;
  planType: ExamPlanType;
  durationMinutes: number;
  questionCount: number;
}

/**
 * Where a learner stands with a main exam. Not registered: registration state (OPEN, NOT_YET_OPEN,
 * CLOSED). Registered: READY, UPCOMING, IN_PROGRESS, ATTEMPTED, PASSED or CLOSED.
 */
export type ExamHubStatus =
  | "OPEN"
  | "NOT_YET_OPEN"
  | "CLOSED"
  | "READY"
  | "UPCOMING"
  | "IN_PROGRESS"
  | "ATTEMPTED"
  | "PASSED";

/** A main exam as the hub lists it. Everything a card shows is server-computed. */
export interface ExamHubCard {
  examId: string;
  title: string;
  description: string | null;
  purpose: string | null;
  channelName: string | null;
  /** The channel's picture; for a personal channel, its owner's profile picture. */
  channelIconUrl: string | null;
  certification: boolean;
  plans: ExamHubPlan[];
  tieType: ExamTieType | null;
  tiedContentId: string | null;
  tiedContentTitle: string | null;
  /** Null when there is no prerequisite (standalone exam). */
  prerequisiteMet: boolean | null;
  feeMinor: number;
  currency: string | null;
  registered: boolean;
  status: ExamHubStatus;
  enrollmentOpensAt: string | null;
  enrollmentClosesAt: string | null;
  accessStartsAt: string | null;
  accessEndsAt: string | null;
  bestPercentage: number | null;
  /** The Explore category; null is "Other". */
  categoryId: string | null;
}

/** The certification a course or event leads to — the info card on the content's page. */
export interface ContentCertificationView {
  examId: string;
  planId: string;
  title: string;
  feeMinor: number;
  currency: string | null;
  published: boolean;
}

// ── Grade cards ───────────────────────────────────────────────────────────────

export interface GradeCardSection {
  sectionId: string | null;
  sectionTitle: string;
  questions: number;
  attempted: number;
  correct: number;
  marksObtained: number;
  maximumMarks: number;
}

export interface GradeCardLineItem {
  planId: string;
  planName: string;
  planType: ExamPlanType;
  attemptId: string | null;
  percentage: number | null;
  passed: boolean;
  marksObtained: number;
  maximumMarks: number;
}

/**
 * A certification sitting's card (ATTEMPT) or a course/event's assessment transcript
 * (CONTENT_TRANSCRIPT). Frozen at issue; `sections` and `lineItems` are the server's JSON as issued.
 */
export interface GradeCardResponse {
  id: string;
  kind: "ATTEMPT" | "CONTENT_TRANSCRIPT";
  examId: string;
  planId: string | null;
  attemptId: string | null;
  contentType: string | null;
  contentId: string | null;
  candidateName: string;
  examTitle: string;
  planName: string | null;
  marksObtained: number;
  maximumMarks: number;
  percentage: number;
  passPercentage: number;
  passed: boolean;
  /** The stored 12-character code. */
  verificationCode: string;
  /** The same code as printed on the PDF and checked on the verify page: `GC-XXXX-XXXX-XXXX`. */
  credentialCode: string;
  issuedAt: string;
  certificateIssued: boolean;
  /**
   * Where this card's certificate stands, decided by the server. Null on the public verify view.
   * AWAITING_ISSUE means cleared but not yet recorded; the server issues it on the next read.
   */
  certificateStatus:
    | "ISSUED"
    | "AWAITING_IDENTITY_REVIEW"
    | "AWAITING_ISSUE"
    | "IDENTITY_REJECTED"
    | "WITHHELD"
    | "NOT_APPLICABLE"
    | null;
  /** The certificate's `CERT-…` ID once issued. */
  certificateCode: string | null;
  revoked: boolean;
  revokedReason: string | null;
  sections: GradeCardSection[];
  lineItems: GradeCardLineItem[];
  /** The sitting an attempt card reports; null for a transcript and on the public verify view. */
  sitting: GradeCardSitting | null;
}

/** Read from the sitting's own frozen attempt and result. */
export interface GradeCardSitting {
  planType: ExamPlanType | null;
  /** False for an ungraded assessment: the score stands, pass/fail must not be shown. */
  graded: boolean;
  attemptNumber: number;
  startedAt: string | null;
  submittedAt: string | null;
  timeTakenSeconds: number | null;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
}
