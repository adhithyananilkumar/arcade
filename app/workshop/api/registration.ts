import { api } from '@/infrastructure/http/api';

const API_BASE_PATH = '/api/v1/workshops';



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
