import { api } from '@/infrastructure/http/api';
import { Workshop } from '@/app/(authenticated)/studio/workshop/types';

export interface ActivityLog {
  action: string;
  description: string;
  timestamp: string;
}

export interface WorkshopSummary {
  id: string;
  title: string;
  category: string;
  status: string;
  workshopType: string;
  deliveryMode: string;
  visibility: string;
  language: string;
  coverImageUrl: string;
  completionPercentage: number;
  sessionsCount: number;
  resourcesCount: number;
  createdAt: string;
  updatedAt: string;
  basicInfoComplete: boolean;
  scheduleComplete: boolean;
  resourcesComplete: boolean;
  pricingComplete: boolean;
  settingsComplete: boolean;
  recentActivity: ActivityLog[];
}

export interface WorkshopListDto {
  id: string;
  title: string;
  category: string;
  status: string;
  workshopType: string;
  coverImageUrl: string;
  sessionsCount: number;
  resourcesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkshopPage {
  content: WorkshopListDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface DashboardFilter {
  search?: string;
  status?: string;
  type?: string;
  category?: string;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  size?: number;
}

const API_BASE_PATH = '/api/workshops';

export const getDashboardWorkshops = async (filter?: DashboardFilter): Promise<WorkshopPage> => {
  const params = new URLSearchParams();
  if (filter) {
    if (filter.search) params.append('search', filter.search);
    if (filter.status) params.append('status', filter.status);
    if (filter.type) params.append('type', filter.type);
    if (filter.category) params.append('category', filter.category);
    if (filter.sortBy) params.append('sortBy', filter.sortBy);
    if (filter.sortDir) params.append('sortDir', filter.sortDir);
    if (filter.page !== undefined) params.append('page', filter.page.toString());
    if (filter.size !== undefined) params.append('size', filter.size.toString());
  }

  return await api.get<WorkshopPage>(`${API_BASE_PATH}/dashboard?${params.toString()}`);
};

export const getWorkshopSummary = async (workshopId: string): Promise<WorkshopSummary> => {
  return await api.get<WorkshopSummary>(`${API_BASE_PATH}/${workshopId}/summary`);
};

export const deleteWorkshop = async (workshopId: string): Promise<void> => {
  await api.delete<void>(`${API_BASE_PATH}/${workshopId}`);
};
