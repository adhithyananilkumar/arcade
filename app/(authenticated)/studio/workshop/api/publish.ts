import { api } from '@/infrastructure/http/api';
import { PublishValidationResponse, WorkshopPreviewDto, Workshop } from '@/app/(authenticated)/studio/workshop/types';

const API_BASE_PATH = '/api/workshops';

export const validateWorkshop = async (workshopId: string): Promise<PublishValidationResponse> => {
  return await api.get<PublishValidationResponse>(`${API_BASE_PATH}/${workshopId}/review`);
};

export const getWorkshopPreview = async (workshopId: string): Promise<WorkshopPreviewDto> => {
  return await api.get<WorkshopPreviewDto>(`${API_BASE_PATH}/${workshopId}/preview`);
};

export const publishWorkshop = async (workshopId: string): Promise<void> => {
  await api.post<void>(`${API_BASE_PATH}/${workshopId}/publish`);
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
