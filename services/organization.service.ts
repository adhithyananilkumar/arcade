import { apiClient } from '@/lib/apiClient';

export interface Organization {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface OrganizationMembership {
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
  };
  role: string;
  joinedAt: string;
}

export class OrganizationService {
  /**
   * Retrieves all organizations the current user is a member of.
   */
  static async getOrganizations(): Promise<Organization[]> {
    const { data } = await apiClient.get<Organization[]>('/organizations');
    return data;
  }

  /**
   * Creates a new organization.
   */
  static async createOrganization(name: string, description?: string): Promise<Organization> {
    const { data } = await apiClient.post<Organization>('/organizations', { name, description });
    return data;
  }

  /**
   * Retrieves details of a specific organization.
   */
  static async getOrganization(id: string): Promise<Organization> {
    const { data } = await apiClient.get<Organization>(`/organizations/${id}`);
    return data;
  }

  /**
   * Retrieves members of a specific organization.
   */
  static async getMembers(id: string): Promise<OrganizationMembership[]> {
    const { data } = await apiClient.get<OrganizationMembership[]>(`/organizations/${id}/members`);
    return data;
  }

  /**
   * Invites a user to the organization by email.
   */
  static async inviteUser(id: string, email: string, role: string = 'MEMBER'): Promise<void> {
    await apiClient.post(`/organizations/${id}/invitations`, { email, role });
  }

  /**
   * Accepts an organization invitation using the provided token.
   */
  static async acceptInvitation(token: string): Promise<void> {
    await apiClient.post(`/organizations/invitations/accept?token=${token}`);
  }

  /**
   * Leaves an organization.
   */
  static async leaveOrganization(id: string): Promise<void> {
    await apiClient.delete(`/organizations/${id}/members/me`);
  }
}
