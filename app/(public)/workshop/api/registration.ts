import { api } from '@/infrastructure/http/api';

const API_BASE_PATH = '/api/v1/workshops';

export const registerForWorkshop = async (workshopId: string): Promise<any> => {
  return await api.post<any>(`${API_BASE_PATH}/${workshopId}/participants/register`, {});
};

export const getMyRegistrationStatus = async (workshopId: string): Promise<any> => {
  try {
    return await api.get<any>(`${API_BASE_PATH}/${workshopId}/participants/me`);
  } catch (error: any) {
    if (error.message?.includes('404')) {
      return null;
    }
    throw error;
  }
};
