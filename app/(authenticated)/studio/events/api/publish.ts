import { api } from '@/infrastructure/http/api';
import { PublishValidationResponse, EventPreviewDto, Event } from '@/app/(authenticated)/studio/events/types';

const API_BASE_PATH = '/api/v1/events';

export const validateEvent = async (eventId: string): Promise<PublishValidationResponse> => {
  return await api.get<PublishValidationResponse>(`${API_BASE_PATH}/${eventId}/review`);
};

export const getEventPreview = async (eventId: string): Promise<EventPreviewDto> => {
  return await api.get<EventPreviewDto>(`${API_BASE_PATH}/${eventId}/preview`);
};

export const submitEvent = async (eventId: string, data?: { message?: string }): Promise<Event> => {
  return await api.post<Event>(`${API_BASE_PATH}/${eventId}/submit`, data);
};

export const approveEvent = async (eventId: string, data?: { note?: string }): Promise<Event> => {
  return await api.post<Event>(`${API_BASE_PATH}/${eventId}/approve`, data);
};

export const rejectEvent = async (eventId: string, data: { reason: string }): Promise<Event> => {
  return await api.post<Event>(`${API_BASE_PATH}/${eventId}/reject`, data);
};

export const editEvent = async (eventId: string): Promise<Event> => {
  return await api.post<Event>(`${API_BASE_PATH}/${eventId}/edit`);
};

export const getEventStatusHistory = async (eventId: string): Promise<any[]> => {
  return await api.get<any[]>(`${API_BASE_PATH}/${eventId}/status-history`);
};

export const unpublishEvent = async (eventId: string): Promise<void> => {
  await api.post<void>(`${API_BASE_PATH}/${eventId}/unpublish`);
};

export const archiveEvent = async (eventId: string): Promise<void> => {
  await api.post<void>(`${API_BASE_PATH}/${eventId}/archive`);
};

export const duplicateEvent = async (eventId: string): Promise<Event> => {
  return await api.post<Event>(`${API_BASE_PATH}/${eventId}/duplicate`);
};
