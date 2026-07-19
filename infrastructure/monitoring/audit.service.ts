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

export class AuditService {
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
