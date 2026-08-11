import { api } from '@/infrastructure/http/api';
import { EnrollmentResult, ResourceType } from '../types/enrollment.types';

export class EnrollmentService {
  /**
   * Enrolls a user in a resource.
   * @param resourceType The type of resource (COURSE | WORKSHOP)
   * @param resourceId The ID of the resource
   * @param idempotencyKey A client-generated UUID for the logical request. Reused on retries.
   */
  static async enroll(resourceType: ResourceType, resourceId: string, idempotencyKey: string): Promise<EnrollmentResult> {
    const data = await api.post<EnrollmentResult>('/api/v1/enrollments', {
      resourceType,
      resourceId,
      idempotencyKey,
    });
    return data;
  }

  /**
   * Revokes an active enrollment for a specific resource.
   * @param resourceType The type of resource
   * @param resourceId The ID of the resource
   */
  static async revoke(resourceType: ResourceType, resourceId: string): Promise<EnrollmentResult> {
    const data = await api.post<EnrollmentResult>(`/api/v1/enrollments/resource/${resourceType}/${resourceId}/revoke`);
    return data;
  }

  /**
   * Re-evaluates a PENDING enrollment (e.g. after a payment requirement is satisfied). Idempotent
   * if already GRANTED.
   */
  static async resume(enrollmentId: string): Promise<EnrollmentResult> {
    const data = await api.post<EnrollmentResult>(`/api/v1/enrollments/${enrollmentId}/resume`);
    return data;
  }
}
