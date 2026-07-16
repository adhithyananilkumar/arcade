// features/assessment/index.ts
// Public surface of the assessment domain.
export { QuizEditor } from "./components/QuizEditor";
export { QuizPlayer } from "./components/QuizPlayer";
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
