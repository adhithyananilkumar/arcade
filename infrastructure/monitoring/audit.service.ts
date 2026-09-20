import { api } from '@/infrastructure/http/api';

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface RoleAssignmentAuditLog {
  id: string;
  actorId?: string;
  actorName?: string;
  targetUserId?: string;
  targetUserName?: string;
  action?: string;
  addedRoles?: string;
  removedRoles?: string;
  reason?: string;
  createdAt: string;
}

export class AuditService {
  /** Platform-wide IAM audit trail; pass targetUserId to scope it to one user's history. */
  static async getRoleAssignmentAuditLogs(
    targetUserId?: string,
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<RoleAssignmentAuditLog>> {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (targetUserId) params.set('targetUserId', targetUserId);
    return api.get<PageResponse<RoleAssignmentAuditLog>>(
      `/api/v1/audit-logs/role-assignments?${params.toString()}`
    );
  }

  /**
   * Retrieves the current user's personal audit logs.
   */
  static async getUserAuditLogs(page: number = 0, size: number = 20): Promise<PageResponse<AuditLog>> {
    const data = await api.get<PageResponse<AuditLog>>(`/audit-logs/me?page=${page}&size=${size}`);
    return data;
  }

  /**
   * Retrieves an organization's audit logs.
   */
  static async getOrgAuditLogs(orgId: string, page: number = 0, size: number = 20): Promise<PageResponse<AuditLog>> {
    const data = await api.get<PageResponse<AuditLog>>(`/audit-logs/organizations/${orgId}?page=${page}&size=${size}`);
    return data;
  }
}
