import { PublishValidationResponse, WorkshopPreviewDto, Workshop } from '@/app/(authenticated)/studio/workshop/types';

export const validateWorkshop = async (workshopId: string): Promise<PublishValidationResponse> => {
  const response = await fetch(`/api/workshops/${workshopId}/review`);
  if (!response.ok) throw new Error('Failed to validate workshop');
  return response.json();
};

export const getWorkshopPreview = async (workshopId: string): Promise<WorkshopPreviewDto> => {
  const response = await fetch(`/api/workshops/${workshopId}/preview`);
  if (!response.ok) throw new Error('Failed to get workshop preview');
  return response.json();
};

export const publishWorkshop = async (workshopId: string): Promise<void> => {
  const response = await fetch(`/api/workshops/${workshopId}/publish`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to publish workshop');
};

export const unpublishWorkshop = async (workshopId: string): Promise<void> => {
  const response = await fetch(`/api/workshops/${workshopId}/unpublish`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to unpublish workshop');
};

export const archiveWorkshop = async (workshopId: string): Promise<void> => {
  const response = await fetch(`/api/workshops/${workshopId}/archive`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to archive workshop');
};

export const duplicateWorkshop = async (workshopId: string): Promise<Workshop> => {
  const response = await fetch(`/api/workshops/${workshopId}/duplicate`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to duplicate workshop');
  return response.json();
};
