import { api } from "@/infrastructure/http/api";
import type { RoadmapTemplateData } from "../types";

export const roadmapTemplateService = {
  getAllTemplates: (params?: { category?: string; difficulty?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append("category", params.category);
    if (params?.difficulty) searchParams.append("difficulty", params.difficulty);
    if (params?.search) searchParams.append("search", params.search);
    
    const query = searchParams.toString();
    return api.get<RoadmapTemplateData[]>(`/api/roadmap-templates${query ? `?${query}` : ''}`);
  },
  
  getTemplate: (id: string) => api.get<RoadmapTemplateData>(`/api/roadmap-templates/${id}`),
  
  createFromRoadmap: (roadmapId: string, data: { name: string; description?: string; category: string; difficulty: string; tags: string[]; thumbnail?: string }) => 
    api.post<RoadmapTemplateData>(`/api/roadmap-templates/from-roadmap/${roadmapId}`, data),
    
  importTemplate: (data: { name: string; description?: string; category: string; difficulty: string; tags: string[]; thumbnail?: string; graphJson: string }) => 
    api.post<RoadmapTemplateData>(`/api/roadmap-templates/import`, data),
    
  toggleFavorite: (id: string) => api.post<void>(`/api/roadmap-templates/${id}/favorite`, {}),
  
  deleteTemplate: (id: string) => api.delete<void>(`/api/roadmap-templates/${id}`),
};
