import { api } from '@/infrastructure/http/api';

const API_BASE_PATH = '/api/workshops';

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

export const getCollaborators = async (workshopId: string): Promise<Collaborator[]> => {
  return await api.get<Collaborator[]>(`${API_BASE_PATH}/${workshopId}/collaborators`);
};

export const inviteCollaborator = async (
  workshopId: string,
  email: string,
  role: 'OWNER' | 'MANAGER' | 'EDITOR' | 'VIEWER'
): Promise<Collaborator> => {
  return await api.post<Collaborator>(`${API_BASE_PATH}/${workshopId}/collaborators`, {
    email,
    role,
  });
};

export const updateCollaboratorRole = async (
  workshopId: string,
  userId: string,
  role: 'OWNER' | 'MANAGER' | 'EDITOR' | 'VIEWER'
): Promise<Collaborator> => {
  return await api.patch<Collaborator>(`${API_BASE_PATH}/${workshopId}/collaborators/${userId}`, {
    role,
  });
};

export const removeCollaborator = async (workshopId: string, userId: string): Promise<void> => {
  await api.delete<void>(`${API_BASE_PATH}/${workshopId}/collaborators/${userId}`);
};
