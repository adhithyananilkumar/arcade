import { api } from '@/infrastructure/http/api';

export interface Organization {
  id: string;
  name: string;
  description?: string;
  slug: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  adminName?: string;
  adminTitle?: string;
  address?: string;
  studentVolunteer?: string;
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
    const data = await api.get<Organization[]>('/api/v1/organizations');
    return data;
  }

  /**
   * Creates a new organization.
   */
  static async createOrganization(name: string, description?: string): Promise<Organization> {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const data = await api.post<Organization>('/api/v1/organizations', { name, slug, description });
    return data;
  }

  /**
   * Retrieves details of a specific organization.
   */
  static async getOrganization(id: string): Promise<Organization> {
    const data = await api.get<Organization>(`/api/v1/organizations/${id}`);
    return data;
  }

  /**
   * Retrieves members of a specific organization.
   */
  static async getMembers(id: string): Promise<OrganizationMembership[]> {
    const data = await api.get<OrganizationMembership[]>(`/api/v1/organizations/${id}/members`);
    return data;
  }

  /**
   * Invites a user to the organization by email.
   */
  static async inviteUser(id: string, email: string, role: string = 'MEMBER'): Promise<void> {
    await api.post(`/api/v1/organizations/${id}/invitations`, { email, role });
  }

  /**
   * Accepts an organization invitation using the provided token.
   */
  static async acceptInvitation(token: string): Promise<void> {
    await api.post(`/api/v1/organizations/invitations/accept?token=${token}`);
  }

  /**
   * Leaves an organization.
   */
  static async leaveOrganization(id: string): Promise<void> {
    await api.delete(`/api/v1/organizations/${id}/members/me`);
  }

  /**
   * Updates an organization's profile info.
   */
  static async updateOrgProfile(id: string, data: Partial<Organization>): Promise<Organization> {
    const updated = await api.patch<Organization>(`/api/v1/organizations/${id}/profile`, data);
    return updated;
  }

  /**
   * Uploads an organization logo.
   */
  static async uploadLogo(id: string, file: File): Promise<Organization> {
    const formData = new FormData();
    formData.append('file', file);
    const updated = await api.post<Organization>(`/api/v1/organizations/${id}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return updated;
  }

  /**
   * Updates a member's role within an organization.
   */
  static async updateMemberRole(orgId: string, userId: string, role: string): Promise<void> {
    await api.put(`/api/v1/organizations/${orgId}/members/${userId}/role`, { role });
  }

  /**
   * Removes a member from an organization.
   */
  static async removeMember(orgId: string, userId: string): Promise<void> {
    await api.delete(`/api/v1/organizations/${orgId}/members/${userId}`);
  }
}
