import { api } from "@/infrastructure/http/api";
import type { RoadmapData } from "../types";

export const roadmapService = {
  getAllRoadmaps: () => api.get<RoadmapData[]>(`/api/roadmaps`),
  getRoadmap: (id: string) => api.get<RoadmapData>(`/api/roadmaps/${id}`),
  createRoadmap: (data: { title: string; description?: string; ownerType?: string; ownerId?: string; graphJson?: string; channelId: string }) =>
    api.post<RoadmapData>(`/api/roadmaps`, { ...data, ownerType: data.ownerType || "USER", ownerId: data.ownerId || "00000000-0000-0000-0000-000000000000" }),
  updateRoadmap: (id: string, data: { title?: string; description?: string; graphJson?: string; version?: number; status?: string }) =>
    api.put<RoadmapData>(`/api/roadmaps/${id}`, data),
  deleteRoadmap: (id: string) => api.delete<void>(`/api/roadmaps/${id}`),
  duplicateRoadmap: (id: string) => api.post<RoadmapData>(`/api/roadmaps/${id}/duplicate`, {}),
  createFromTemplate: (templateId: string, channelId: string) =>
    api.post<RoadmapData>(`/api/roadmaps/from-template/${templateId}?channelId=${channelId}`, {}),
  exportRoadmap: (id: string) => api.get<RoadmapData>(`/api/roadmaps/${id}/export`),
  submitRoadmap: (id: string, message?: string) => api.post<RoadmapData>(`/api/roadmaps/${id}/submit`, { message }),
  approveRoadmap: (id: string, note?: string) => api.post<RoadmapData>(`/api/roadmaps/${id}/approve`, { note }),
  rejectRoadmap: (id: string, reason: string) => api.post<RoadmapData>(`/api/roadmaps/${id}/reject`, { reason }),
  revertToDraft: (id: string) => api.post<RoadmapData>(`/api/roadmaps/${id}/edit`, {}),
  getRoadmapStatusHistory: (id: string) => api.get<any[]>(`/api/roadmaps/${id}/status-history`),
};
