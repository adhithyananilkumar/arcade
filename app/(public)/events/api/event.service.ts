import api from "@/infrastructure/http/api-client";
import type { EventDto } from "../types/event.types";

const BASE = "/api/v1/events";

export async function getPublishedEvents(params?: {
  search?: string;
  category?: string;
  type?: string;
  page?: number;
  size?: number;
}): Promise<{ content: EventDto[]; totalPages: number; totalElements: number }> {
  return api.get(`${BASE}/published`, { params }).then((r) => r.data);
}

export async function getEventById(id: string): Promise<EventDto> {
  return api.get(`${BASE}/${id}`).then((r) => r.data);
}
