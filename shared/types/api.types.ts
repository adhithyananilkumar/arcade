// types/api.ts
// API request/response types that mirror the Spring Boot DTOs.
// Keep in sync with the backend DTOs in arcade-backend/content/dto/.

import type { TiptapDocument } from "./editor.types";

// ── Course ────────────────────────────────────────────────────────────────────

export type PricingModel = "FREE" | "PAID";

export type ContentStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "PUBLISHED"
  | "ARCHIVED"
  | "REJECTED"
  | "SUSPENDED";

export interface UserProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  permissions: string[];
}

export interface CommentResponse {
  id: string;
  lessonId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/** The owning channel, as the public course surfaces attribute a course. */
export interface CourseChannelSummary {
  id: string;
  name: string;
  iconUrl: string | null;
  isPersonal: boolean;
}

/**
 * Someone credited on a course. `role` is `"Author"` for the primary author and the backend
 * collaborator role name otherwise — which is how the UI credits the author separately from the
 * collaborator list rather than guessing from the username.
 */
export interface CourseCollaboratorSummary {
  id: string;
  name: string;
  username?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  role: string;
  specialities?: string[];
  experienceYears?: number | null;
  courseCount?: number;
}

export interface CourseResponse {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername?: string;
  authorAvatarUrl?: string | null;
  title: string;
  description?: string;
  /** Newline-separated "what you'll walk away with" bullets. */
  learningOutcomes?: string | null;
  coverImageUrl?: string;
  pricingModel: PricingModel;
  /** Minor currency units (e.g. cents/paise). */
  priceAmount?: number;
  currency?: string;
  /** Author-declared total length, free text (e.g. "4h 30m"). */
  duration?: string | null;
  examSchedule?: string;
  /** Super-user-managed category (Console -> Content Manage -> Categories), or null for "Other". */
  categoryId?: string | null;
  hasExam?: boolean;
  status: ContentStatus;
  rejectionReason?: string;
  wasPublished?: boolean;
  /** Live count of granted enrollments. */
  enrollmentCount?: number;
  channel?: CourseChannelSummary;
  /** Author first, then accepted collaborators. */
  collaborators?: CourseCollaboratorSummary[];
  modules: ModuleResponse[];
  badges: BadgeSummaryResponse[];
  /**
   * Course-level assessments — siblings of the module list (a final or certification exam).
   * Assessments placed inside a module travel on that module instead.
   */
  assessments?: AssessmentNodeResponse[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateCourseRequest {
  title: string;
  description?: string;
  learningOutcomes?: string;
  pricingModel?: PricingModel;
  /** Minor currency units (e.g. cents/paise). */
  priceAmount?: number;
  currency?: string;
  duration?: string;
  examSchedule?: string;
  hasExam?: boolean;
}

export interface PatchCourseRequest {
  title?: string;
  description?: string;
  learningOutcomes?: string;
  pricingModel?: PricingModel;
  /** Minor currency units (e.g. cents/paise). */
  priceAmount?: number;
  currency?: string;
  duration?: string;
  examSchedule?: string;
  hasExam?: boolean;
}

/** Aggregate rating for one course — `GET /api/v1/public/reviews/stats`, keyed by course id. */
export interface CourseReviewStats {
  averageRating: number;
  reviewsCount: number;
}

// ── Module ────────────────────────────────────────────────────────────────────

export interface ModuleResponse {
  id: string;
  title: string;
  position: number;
  lessons: LessonResponse[];
  quizzes: QuizResponse[];
  /**
   * Assessments placed in this module. Shares one `position` space with `lessons` — merge and sort
   * the two to get the module's real running order, which is how an assessment can sit between two
   * lessons rather than always at the end.
   */
  assessments?: AssessmentNodeResponse[];
}

/**
 * An assessment node in a course tree. Carries placement and presentation only: no question count,
 * no answer data, no paper construction, no security configuration. Those stay inside the Exam
 * context and are resolved when a candidate opens the assessment, which is what lets exams integrate
 * natively into a course without the course API exposing how they work.
 */
export interface AssessmentNodeResponse {
  placementId: string;
  examId: string;
  planId: string | null;
  title: string;
  position: number;
  requiredForCompletion: boolean;
  /** NONE | COMPLETION | GRADE_CARD | CERTIFICATE — what passing this produces. */
  outcome: string;
}

// ── Badge (a course-level content item — sibling of Module; owned by the badges domain) ─
export interface BadgeSummaryResponse {
  id: string;
  title: string;
  position: number;
}

export interface CreateModuleRequest {
  title: string;
}

// ── Quiz (a module item — sibling of a lesson; owned by the content domain) ─────

export interface QuizResponse {
  id: string;
  title: string;
  position: number;
}

export interface QuizRequest {
  title?: string;
}

// ── Lesson ────────────────────────────────────────────────────────────────────

export interface LessonResponse {
  id: string;
  title: string;
  body?: string; // Raw JSON string — parsed to TiptapDocument by the editor
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLessonRequest {
  title?: string;
}

// ── Draft ─────────────────────────────────────────────────────────────────────

export interface DraftSaveRequest {
  body: string; // JSON.stringify(TiptapDocument)
}

export interface DraftResponse {
  lessonId: string;
  body: string; // JSON string — parse to TiptapDocument
  savedAt: string;
}

// ── Course Renderer (learner-facing, read-only) ──────────────────────────────
// Mirrors arcade-backend com.arcade.backend.learning.delivery.dto.*

export interface LessonRenderResponse {
  id: string;
  title: string;
  position: number;
  body?: string; // Raw JSON string — parsed to TiptapDocument by the renderer
}

export interface QuizRenderResponse {
  id: string;
  title: string;
  position: number;
}

export interface ModuleRenderResponse {
  id: string;
  title: string;
  position: number;
  lessons: LessonRenderResponse[];
  quizzes: QuizRenderResponse[];
  assessments?: AssessmentNodeResponse[];
}

export interface CourseRenderResponse {
  id: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  status: ContentStatus;
  pricingModel: PricingModel;
  /** Minor currency units (e.g. cents/paise). */
  priceAmount?: number;
  currency?: string;
  examSchedule?: string;
  hasExam?: boolean;
  modules: ModuleRenderResponse[];
  assessments?: AssessmentNodeResponse[];
}
