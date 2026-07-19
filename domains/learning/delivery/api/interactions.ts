// features/learning/delivery/api/interactions.ts
// Per-learner interaction state for interactive blocks (toggle, and future ones) inside a lesson.
// See arcade-backend com.arcade.backend.learning.interaction.*

import { api } from "@/infrastructure/http/api";

export interface InteractionStateResponse {
  state: Record<string, unknown>;
  updatedAt: string;
}

export const interactionService = {
  getStates: (lessonId: string) =>
    api.get<Record<string, InteractionStateResponse>>(`/api/lessons/${lessonId}/interactions`),
  putState: (lessonId: string, nodeId: string, state: Record<string, unknown>) =>
    api.put<InteractionStateResponse>(`/api/lessons/${lessonId}/interactions/${nodeId}`, {
      state,
    }),
};
