// types/api.ts
// API request/response types that mirror the Spring Boot DTOs.
// Keep in sync with the backend DTOs in arcade-backend/content/dto/.

import type { TiptapDocument } from "./editor";

// ── Course ────────────────────────────────────────────────────────────────────

export type PricingModel = "FREE" | "PAID";

export type ContentStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "PUBLISHED"
  | "ARCHIVED";

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

export interface CourseResponse {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername?: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  pricingModel: PricingModel;
  status: ContentStatus;
  wasPublished?: boolean;
  modules: ModuleResponse[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateCourseRequest {
  title: string;
  description?: string;
  pricingModel?: PricingModel;
}

export interface PatchCourseRequest {
  title?: string;
  description?: string;
  pricingModel?: PricingModel;
}

// ── Module ────────────────────────────────────────────────────────────────────

export interface ModuleResponse {
  id: string;
  title: string;
  position: number;
  lessons: LessonResponse[];
  quizzes: QuizResponse[];
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
}

export interface CourseRenderResponse {
  id: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  status: ContentStatus;
  modules: ModuleRenderResponse[];
}
