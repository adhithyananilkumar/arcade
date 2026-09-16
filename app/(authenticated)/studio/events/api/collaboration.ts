import { api } from '@/infrastructure/http/api';

// Backed by the one collaborator system every Studio content type shares — see backend
// ContentCollaborationController (studio/content). Function names/signatures here are kept
// event-shaped since EventCollaboratorsManager (the wizard review step) is written against them,
// but the endpoint itself is the generic `/api/v1/content/EVENT/{id}/collaborators`, not a
// separate Event-only route.
const API_BASE_PATH = '/api/v1/content/EVENT';

export interface Collaborator {
  id: string | null;
  userId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: 'OWNER' | 'MANAGER' | 'EDITOR' | 'VIEWER';
  status: 'PENDING' | 'ACCEPTED';
  joinedAt: string;
}

export const getCollaborators = async (eventId: string): Promise<Collaborator[]> => {
  return await api.get<Collaborator[]>(`${API_BASE_PATH}/${eventId}/collaborators`);
};

export const inviteCollaborator = async (
  eventId: string,
  email: string,
  role: 'OWNER' | 'MANAGER' | 'EDITOR' | 'VIEWER'
): Promise<Collaborator> => {
  return await api.post<Collaborator>(`${API_BASE_PATH}/${eventId}/collaborators`, {
    email,
    role,
  });
};

export const updateCollaboratorRole = async (
  eventId: string,
  userId: string,
  role: 'OWNER' | 'MANAGER' | 'EDITOR' | 'VIEWER'
): Promise<Collaborator> => {
  return await api.patch<Collaborator>(`${API_BASE_PATH}/${eventId}/collaborators/${userId}`, {
    role,
  });
};

export const removeCollaborator = async (eventId: string, userId: string): Promise<void> => {
  await api.delete<void>(`${API_BASE_PATH}/${eventId}/collaborators/${userId}`);
};
