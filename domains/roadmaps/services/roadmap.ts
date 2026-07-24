import { api } from "@/infrastructure/http/api";
import type { RoadmapData } from "../types";

export const roadmapService = {
  getAllRoadmaps: () => api.get<RoadmapData[]>(`/api/roadmaps`),
  getRoadmap: (id: string) => api.get<RoadmapData>(`/api/roadmaps/${id}`),
  createRoadmap: (data: { title: string; description?: string; ownerType?: string; ownerId?: string; graphJson?: string }) => 
    api.post<RoadmapData>(`/api/roadmaps`, { ...data, ownerType: data.ownerType || "USER", ownerId: data.ownerId || "00000000-0000-0000-0000-000000000000" }),
  updateRoadmap: (id: string, data: { title?: string; description?: string; graphJson?: string; version?: number; status?: RoadmapData['status'] }) => 
    api.put<RoadmapData>(`/api/roadmaps/${id}`, data),
  deleteRoadmap: (id: string) => api.delete<void>(`/api/roadmaps/${id}`),
  duplicateRoadmap: (id: string) => api.post<RoadmapData>(`/api/roadmaps/${id}/duplicate`, {}),
  createFromTemplate: (templateId: string) => api.post<RoadmapData>(`/api/roadmaps/from-template/${templateId}`, {}),
  exportRoadmap: (id: string) => api.get<RoadmapData>(`/api/roadmaps/${id}/export`),
};
