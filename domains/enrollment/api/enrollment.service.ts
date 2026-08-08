import { api } from '@/infrastructure/http/api';

export type ResourceType = 'COURSE' | 'WORKSHOP';

export type EnrollmentResultStatus = 'GRANTED' | 'PENDING_ACTION' | 'DENIED';

export interface EnrollmentResult {
  status: EnrollmentResultStatus;
  message: string;
  nextAction?: string;
  redirectUrl?: string;
  requestId?: string;
  recordId?: string;
}

export class EnrollmentService {
  static async enroll(resourceType: ResourceType, resourceId: string): Promise<EnrollmentResult> {
    const data = await api.post<EnrollmentResult>('/api/v1/enrollments', {
      resourceType,
      resourceId,
    });
    return data;
  }
}
