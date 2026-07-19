import { api } from "@/infrastructure/http/api";
import type { CollaboratorData, CommentData, ActivityData } from "../types";

export const collaborationService = {
  getCollaborators: (roadmapId: string) => 
    api.get<CollaboratorData[]>(`/api/roadmaps/${roadmapId}/collaborators`),
    
  inviteCollaborator: (roadmapId: string, email: string, role: string) => 
    api.post<CollaboratorData>(`/api/roadmaps/${roadmapId}/collaborators`, { email, role }),

  updateRole: (roadmapId: string, userId: string, role: string) => 
    api.put<CollaboratorData>(`/api/roadmaps/${roadmapId}/collaborators/${userId}`, { role }),

  removeCollaborator: (roadmapId: string, userId: string) => 
    api.delete(`/api/roadmaps/${roadmapId}/collaborators/${userId}`),

  getComments: (roadmapId: string, nodeId?: string) => {
    const url = nodeId ? `/api/roadmaps/${roadmapId}/comments?nodeId=${nodeId}` : `/api/roadmaps/${roadmapId}/comments`;
    return api.get<CommentData[]>(url);
  },
    
  addComment: (roadmapId: string, content: string, nodeId?: string | null) => 
    api.post<CommentData>(`/api/roadmaps/${roadmapId}/comments`, { content, nodeId }),

  resolveComment: (roadmapId: string, commentId: string) => 
    api.put(`/api/roadmaps/${roadmapId}/comments/${commentId}/resolve`, {}),

  getActivities: (roadmapId: string) => 
    api.get<ActivityData[]>(`/api/roadmaps/${roadmapId}/activity`),
};
