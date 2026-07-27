import { api } from '@/infrastructure/http/api';
import { PublishValidationResponse, WorkshopPreviewDto, Workshop } from '@/app/(authenticated)/studio/workshop/types';

const API_BASE_PATH = '/api/workshops';

export const validateWorkshop = async (workshopId: string): Promise<PublishValidationResponse> => {
  return await api.get<PublishValidationResponse>(`${API_BASE_PATH}/${workshopId}/review`);
};

export const getWorkshopPreview = async (workshopId: string): Promise<WorkshopPreviewDto> => {
  return await api.get<WorkshopPreviewDto>(`${API_BASE_PATH}/${workshopId}/preview`);
};

export const submitWorkshop = async (workshopId: string, data?: { message?: string }): Promise<Workshop> => {
  return await api.post<Workshop>(`${API_BASE_PATH}/${workshopId}/submit`, data);
};

export const approveWorkshop = async (workshopId: string, data?: { note?: string }): Promise<Workshop> => {
  return await api.post<Workshop>(`${API_BASE_PATH}/${workshopId}/approve`, data);
};

export const rejectWorkshop = async (workshopId: string, data: { reason: string }): Promise<Workshop> => {
  return await api.post<Workshop>(`${API_BASE_PATH}/${workshopId}/reject`, data);
};

export const editWorkshop = async (workshopId: string): Promise<Workshop> => {
  return await api.post<Workshop>(`${API_BASE_PATH}/${workshopId}/edit`);
};

export const getWorkshopStatusHistory = async (workshopId: string): Promise<any[]> => {
  return await api.get<any[]>(`${API_BASE_PATH}/${workshopId}/status-history`);
};

export const unpublishWorkshop = async (workshopId: string): Promise<void> => {
  await api.post<void>(`${API_BASE_PATH}/${workshopId}/unpublish`);
};

export const archiveWorkshop = async (workshopId: string): Promise<void> => {
  await api.post<void>(`${API_BASE_PATH}/${workshopId}/archive`);
};

export const duplicateWorkshop = async (workshopId: string): Promise<Workshop> => {
  return await api.post<Workshop>(`${API_BASE_PATH}/${workshopId}/duplicate`);
};
