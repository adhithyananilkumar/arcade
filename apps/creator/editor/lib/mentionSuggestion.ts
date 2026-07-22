// apps/creator/editor/lib/mentionSuggestion.ts
// Backs reactjs-tiptap-editor's Mention extension `suggestion.items` — searches our own
// GET /api/users/search endpoint (added for the in-house mention picker, still valid here).

import { api } from "@/infrastructure/http/api";

export interface MentionUser {
  id: string;
  label: string;
  avatarUrl: string | null;
}

export async function searchUsersForMention(query: string): Promise<MentionUser[]> {
  if (!query.trim()) return [];
  try {
    return await api.get<MentionUser[]>(`/api/users/search?q=${encodeURIComponent(query)}`);
  } catch {
    return [];
  }
}
