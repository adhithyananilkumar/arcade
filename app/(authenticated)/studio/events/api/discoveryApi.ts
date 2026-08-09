import { api } from '@/infrastructure/http/api';
import { Event } from '@/app/(authenticated)/studio/events/types';

export interface PublishedEventPage {
  content: Event[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface EventSearchParams {
  search?: string;
  category?: string;
  type?: string;
  types?: string[];
  difficulty?: string;
  page?: number;
  size?: number;
}

const API_BASE_PATH = '/api/v1/events';

export const getPublishedEvents = async (params?: EventSearchParams): Promise<PublishedEventPage> => {
  const queryParams = new URLSearchParams();
  if (params) {
    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);
    if (params.type) queryParams.append('type', params.type);
    if (params.types && params.types.length > 0) queryParams.append('types', params.types.join(','));
    if (params.difficulty) queryParams.append('difficulty', params.difficulty);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
  }

  return await api.get<PublishedEventPage>(`${API_BASE_PATH}/published?${queryParams.toString()}`);
};

export const getPublicEventById = async (id: string): Promise<Event> => {
  return await api.get<Event>(`${API_BASE_PATH}/${id}`);
};
