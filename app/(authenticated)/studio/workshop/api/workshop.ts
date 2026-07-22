import { api } from '@/infrastructure/http/api';
import { CreateWorkshopRequest, Workshop, WorkshopFormData, CreateWorkshopSessionRequest, UpdateWorkshopSessionRequest, WorkshopSession } from '@/app/(authenticated)/studio/workshop/types';

const API_BASE_PATH = '/api/workshops';

export const createWorkshop = async (data: CreateWorkshopRequest): Promise<Workshop> => {
  return await api.post<Workshop>(API_BASE_PATH, data);
};

export const updateWorkshop = async (id: string, data: Partial<CreateWorkshopRequest>): Promise<Workshop> => {
  return await api.patch<Workshop>(`${API_BASE_PATH}/${id}`, data);
};

export const createWorkshopSession = async (workshopId: string, data: CreateWorkshopSessionRequest): Promise<WorkshopSession> => {
  return await api.post<WorkshopSession>(`${API_BASE_PATH}/${workshopId}/sessions`, data);
};

export const updateWorkshopSession = async (workshopId: string, sessionId: string, data: UpdateWorkshopSessionRequest): Promise<WorkshopSession> => {
  return await api.patch<WorkshopSession>(`${API_BASE_PATH}/${workshopId}/sessions/${sessionId}`, data);
};

export const deleteWorkshopSession = async (workshopId: string, sessionId: string): Promise<void> => {
  await api.delete<void>(`${API_BASE_PATH}/${workshopId}/sessions/${sessionId}`);
};
