import { api } from '@/infrastructure/http/api';
import type {
  EventTimeframe,
  LearnerEnrollmentDetail,
  LearnerEnrollmentSummary,
  LearnerEventRegistration,
  MyEnrollmentsQueryParams,
  PagedResponse,
  ResourceType,
} from '../types/enrollment.types';

/**
 * Learner self-service enrollment reads.
 *
 * Every route here is derived from the authenticated principal server-side — there is no user id
 * to pass, by design. This replaces the previous pattern of reading `user.enrolledCourses` off the
 * profile payload and filtering it in the browser, which coupled private learning state to the
 * identity DTO and could not represent events at all.
 */
export class MyEnrollmentsService {
  /** Paginated listing of the caller's own enrollments. */
  static async list(
    params: MyEnrollmentsQueryParams = {}
  ): Promise<PagedResponse<LearnerEnrollmentSummary>> {
    const query = new URLSearchParams();
    if (params.resourceType) query.set('resourceType', params.resourceType);
    if (params.status) params.status.forEach((s) => query.append('status', s));
    if (params.page !== undefined) query.set('page', String(params.page));
    if (params.size !== undefined) query.set('size', String(params.size));
    if (params.sort) query.set('sort', params.sort);
    if (params.direction) query.set('direction', params.direction);

    const qs = query.toString();
    return api.get<PagedResponse<LearnerEnrollmentSummary>>(
      `/api/v1/me/enrollments${qs ? `?${qs}` : ''}`
    );
  }

  /**
   * "Am I enrolled in this one thing?" — always resolves, including for a resource the caller has
   * never touched (`enrolled: false`). Not-enrolled is not an error and does not throw.
   */
  static async getForResource(
    resourceType: ResourceType,
    resourceId: string
  ): Promise<LearnerEnrollmentDetail> {
    return api.get<LearnerEnrollmentDetail>(
      `/api/v1/me/enrollments/${resourceType}/${resourceId}`
    );
  }

  /** The caller's own event registrations, split by timeframe server-side. */
  static async listEvents(
    timeframe: EventTimeframe = 'ALL',
    page = 0,
    size = 20
  ): Promise<PagedResponse<LearnerEventRegistration>> {
    const query = new URLSearchParams({
      timeframe,
      page: String(page),
      size: String(size),
    });
    return api.get<PagedResponse<LearnerEventRegistration>>(
      `/api/v1/me/events?${query.toString()}`
    );
  }
}
