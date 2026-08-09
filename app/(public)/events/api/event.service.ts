import { api } from "@/infrastructure/http/api";
import type { EventDto } from "../types/event.types";

const BASE = "/api/v1/events";

export async function getPublishedEvents(params?: {
  search?: string;
  category?: string;
  type?: string;
  page?: number;
  size?: number;
}): Promise<{ content: EventDto[]; totalPages: number; totalElements: number }> {
  const queryParams = params ? '?' + new URLSearchParams(params as any).toString() : '';
  return api.get<{ content: EventDto[]; totalPages: number; totalElements: number }>(`${BASE}/published${queryParams}`);
}

export async function getEventById(id: string): Promise<EventDto> {
  return api.get<EventDto>(`${BASE}/${id}`);
}
