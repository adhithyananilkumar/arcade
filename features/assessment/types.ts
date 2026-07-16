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
