import { api } from '@/infrastructure/http/api';
import { CreateEventRequest, Event, EventFormData, CreateEventSessionRequest, UpdateEventSessionRequest, EventSession } from '@/app/(authenticated)/studio/events/types';

const API_BASE_PATH = '/api/v1/events';

export const createEvent = async (data: CreateEventRequest): Promise<Event> => {
  return await api.post<Event>(API_BASE_PATH, data);
};

export const updateEvent = async (id: string, data: Partial<CreateEventRequest>): Promise<Event> => {
  return await api.patch<Event>(`${API_BASE_PATH}/${id}`, data);
};

export const getEvent = async (id: string): Promise<Event> => {
  return await api.get<Event>(`${API_BASE_PATH}/${id}`);
};

export const createEventSession = async (eventId: string, data: CreateEventSessionRequest): Promise<EventSession> => {
  return await api.post<EventSession>(`${API_BASE_PATH}/${eventId}/sessions`, data);
};

export const updateEventSession = async (eventId: string, sessionId: string, data: UpdateEventSessionRequest): Promise<EventSession> => {
  return await api.patch<EventSession>(`${API_BASE_PATH}/${eventId}/sessions/${sessionId}`, data);
};

export const deleteEventSession = async (eventId: string, sessionId: string): Promise<void> => {
  await api.delete<void>(`${API_BASE_PATH}/${eventId}/sessions/${sessionId}`);
};
