import { api } from '@/infrastructure/http/api';

// Mirrors com.arcade.backend.identity.iam.pipeline.dto.IamPipelineDtos on the backend.
// Field names must match the Java record component names exactly (Jackson serializes
// record components as-is — a component named `assigned` becomes JSON `assigned`, not
// `isAssigned`; `isSystemRole` / `isSatisfied` / `isArcadeAdmin` keep their `is` prefix
// because that is the record component's own name).

export interface PipelineUserSummary {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface PolicySummary {
  id: string;
  code: string;
  displayName: string;
  description?: string;
  isSystemRole: boolean;
  permissionCount: number;
  permissions: string[];
}

export interface AdminTaskDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  requiredPermission: string;
  isSatisfied: boolean;
}

export interface PolicyPermission {
  id: string;
  code: string;
  name: string;
  description?: string;
  assigned: boolean;
}

export interface GranularPolicy {
  id: string;
  code: string;
  displayName: string;
  description?: string;
  isSystemRole: boolean;
  totalPermissions: number;
  assignedPermissionsCount: number;
  permissions: PolicyPermission[];
}

export type ComplianceStatus =
  | 'UNASSIGNED_USER'
  | 'ADMIN_WITHOUT_POLICY'
  | 'TASK_MISSING_REQUIRED_POLICY'
  | 'ADMIN_WITHOUT_TASKS'
  | 'COMPLIANT';

export interface IamPipelineStatus {
  user: PipelineUserSummary;
  isArcadeAdmin: boolean;
  roleCode: string | null;
  roleDisplayName: string | null;
  assignedPolicies: PolicySummary[];
  availablePolicies: PolicySummary[];
  missingPolicies: PolicySummary[];
  assignedTasks: AdminTaskDto[];
  availableTasks: AdminTaskDto[];
  missingTasks: AdminTaskDto[];
  complianceStatus: ComplianceStatus;
  complianceNotes: string[];
  policies: GranularPolicy[];
}

export interface IncompleteUserSummary {
  id: string;
  email: string;
  username?: string;
  fullName: string;
  isArcadeAdmin: boolean;
  assignedPoliciesCount: number;
  assignedTasksCount: number;
  issueType: string;
  description: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const pipelineService = {
  getAllTasks: async (): Promise<AdminTaskDto[]> => {
    return api.get<AdminTaskDto[]>('/api/v1/iam/tasks');
  },

  getPipelineStatus: async (userId: string): Promise<IamPipelineStatus> => {
    return api.get<IamPipelineStatus>(`/api/v1/iam/pipeline/${userId}`);
  },

  setArcadeAdminRole: async (
    userId: string,
    enable: boolean,
    roleCode?: string
  ): Promise<IamPipelineStatus> => {
    return api.post<IamPipelineStatus>(`/api/v1/iam/pipeline/${userId}/admin-role`, {
      enable,
      roleCode: roleCode ?? null,
    });
  },

  assignPolicies: async (userId: string, policyIds: string[]): Promise<IamPipelineStatus> => {
    return api.put<IamPipelineStatus>(`/api/v1/iam/pipeline/${userId}/policies`, { policyIds });
  },

  revokePolicy: async (userId: string, policyId: string): Promise<IamPipelineStatus> => {
    return api.delete<IamPipelineStatus>(`/api/v1/iam/pipeline/${userId}/policies/${policyId}`);
  },

  assignPermissions: async (
    userId: string,
    permissionIds: string[]
  ): Promise<IamPipelineStatus> => {
    return api.put<IamPipelineStatus>(`/api/v1/iam/pipeline/${userId}/permissions`, {
      permissionIds,
    });
  },

  assignTasks: async (userId: string, taskCodes: string[]): Promise<IamPipelineStatus> => {
    return api.put<IamPipelineStatus>(`/api/v1/iam/pipeline/${userId}/tasks`, { taskCodes });
  },

  revokeTask: async (userId: string, taskCode: string): Promise<IamPipelineStatus> => {
    return api.delete<IamPipelineStatus>(
      `/api/v1/iam/pipeline/${userId}/tasks/${encodeURIComponent(taskCode)}`
    );
  },

  getIncompleteUsers: async (
    filter: 'ALL' | 'UNASSIGNED' = 'ALL',
    page = 0,
    size = 50
  ): Promise<Page<IncompleteUserSummary>> => {
    return api.get<Page<IncompleteUserSummary>>(
      `/api/v1/iam/pipeline/incomplete?filter=${filter}&page=${page}&size=${size}`
    );
  },
};
