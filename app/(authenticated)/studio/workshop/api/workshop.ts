import axios from 'axios';
import { CreateWorkshopRequest, Workshop, WorkshopFormData, CreateWorkshopSessionRequest, UpdateWorkshopSessionRequest, WorkshopSession } from '@/app/(authenticated)/studio/workshop/types';

// Assuming an existing axios instance or using raw axios with interceptors setup in the project
// If there's an api client already configured, we should use it. For now, we use a basic axios setup.
// Example: import api from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const createWorkshop = async (data: CreateWorkshopRequest): Promise<Workshop> => {
  const response = await axios.post(`${API_BASE_URL}/workshops`, data, {
    withCredentials: true // Assuming session-based or token-based auth stored in cookies
  });
  return response.data;
};

export const createWorkshopSession = async (workshopId: string, data: CreateWorkshopSessionRequest): Promise<WorkshopSession> => {
  const response = await axios.post(`${API_BASE_URL}/workshops/${workshopId}/sessions`, data, { withCredentials: true });
  return response.data;
};

export const updateWorkshopSession = async (workshopId: string, sessionId: string, data: UpdateWorkshopSessionRequest): Promise<WorkshopSession> => {
  const response = await axios.patch(`${API_BASE_URL}/workshops/${workshopId}/sessions/${sessionId}`, data, { withCredentials: true });
  return response.data;
};

export const deleteWorkshopSession = async (workshopId: string, sessionId: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/workshops/${workshopId}/sessions/${sessionId}`, { withCredentials: true });
};
