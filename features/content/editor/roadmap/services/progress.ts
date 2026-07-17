import { api } from "@/lib/api";
import type { RoadmapProgressData, NodeProgressData, RoadmapAnalyticsData } from "../types";

export const roadmapProgressService = {
  getProgress: (roadmapId: string) => 
    api.get<RoadmapProgressData>(`/api/roadmaps/${roadmapId}/progress`),
    
  updateNodeProgress: (roadmapId: string, nodeId: string, status: NodeProgressData["status"], timeSpentSeconds?: number) => 
    api.post<NodeProgressData>(`/api/roadmaps/${roadmapId}/nodes/${nodeId}/progress`, { status, timeSpentSeconds }),

  getAnalytics: (roadmapId: string) => 
    api.get<RoadmapAnalyticsData>(`/api/roadmaps/${roadmapId}/analytics`),
};
