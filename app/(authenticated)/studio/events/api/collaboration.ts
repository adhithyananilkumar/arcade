import { api } from '@/infrastructure/http/api';

const API_BASE_PATH = '/api/v1/events';

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
