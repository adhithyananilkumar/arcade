import { api } from '@/infrastructure/http/api';
import { Workshop } from '@/app/(authenticated)/studio/workshop/types';

export interface PublishedWorkshopPage {
  content: Workshop[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface WorkshopSearchParams {
  search?: string;
  category?: string;
  type?: string;
  difficulty?: string;
  page?: number;
  size?: number;
}

const API_BASE_PATH = '/api/workshops';

export const getPublishedWorkshops = async (params?: WorkshopSearchParams): Promise<PublishedWorkshopPage> => {
  const queryParams = new URLSearchParams();
  if (params) {
    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);
    if (params.type) queryParams.append('type', params.type);
    if (params.difficulty) queryParams.append('difficulty', params.difficulty);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
  }

  return await api.get<PublishedWorkshopPage>(`${API_BASE_PATH}/published?${queryParams.toString()}`);
};

export const getPublicWorkshopById = async (id: string): Promise<Workshop> => {
  return await api.get<Workshop>(`${API_BASE_PATH}/${id}`);
};
