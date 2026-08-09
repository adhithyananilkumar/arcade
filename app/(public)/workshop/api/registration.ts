import { api } from '@/infrastructure/http/api';

const API_BASE_PATH = '/api/v1/events';



export const getMyRegistrationStatus = async (eventId: string): Promise<any> => {
  try {
    return await api.get<any>(`${API_BASE_PATH}/${eventId}/participants/me`);
  } catch (error: any) {
    if (error.message?.includes('404')) {
      return null;
    }
    throw error;
  }
};

export const registerForEvent = async (eventId: string): Promise<any> => {
  return await api.post<any>('/api/v1/enrollments', {
    resourceType: 'WORKSHOP',
    resourceId: eventId,
  });
};
