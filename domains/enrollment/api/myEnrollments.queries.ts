import { useQuery } from '@tanstack/react-query';
import { MyEnrollmentsService } from './myEnrollments.service';
import type {
  EventTimeframe,
  MyEnrollmentsQueryParams,
  ResourceType,
} from '../types/enrollment.types';

/**
 * Query keys for the learner enrollment read model.
 *
 * `all` is the invalidation root: after a successful enroll/revoke, invalidating
 * `myEnrollmentKeys.all` refreshes the library list, the per-resource state and the events list
 * together, which is what closes the "enrollment does not show up until a full page reload" gap.
 */
export const myEnrollmentKeys = {
  all: ['me', 'enrollments'] as const,
  list: (params: MyEnrollmentsQueryParams) => ['me', 'enrollments', 'list', params] as const,
  resource: (resourceType: ResourceType, resourceId: string) =>
    ['me', 'enrollments', 'resource', resourceType, resourceId] as const,
  events: (timeframe: EventTimeframe, page: number, size: number) =>
    ['me', 'enrollments', 'events', timeframe, page, size] as const,
};

/** Paginated listing of the caller's own enrollments. */
export function useMyEnrollmentsQuery(
  params: MyEnrollmentsQueryParams = {},
  enabled: boolean = true
) {
  return useQuery({
    queryKey: myEnrollmentKeys.list(params),
    queryFn: () => MyEnrollmentsService.list(params),
    enabled,
  });
}

/**
 * Server-owned "am I enrolled in this resource?" — the replacement for
 * `user.enrolledCourses.some(...)`.
 *
 * Pass `enabled: false` (or an empty `resourceId`) while the resource id is still unknown, so the
 * hook does not fire a request for `undefined`.
 */
export function useMyEnrollmentForResourceQuery(
  resourceType: ResourceType,
  resourceId: string | undefined,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: myEnrollmentKeys.resource(resourceType, resourceId ?? ''),
    queryFn: () => MyEnrollmentsService.getForResource(resourceType, resourceId as string),
    enabled: enabled && Boolean(resourceId),
  });
}

/** The caller's own event registrations. */
export function useMyEventsQuery(
  timeframe: EventTimeframe = 'ALL',
  page: number = 0,
  size: number = 20,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: myEnrollmentKeys.events(timeframe, page, size),
    queryFn: () => MyEnrollmentsService.listEvents(timeframe, page, size),
    enabled,
  });
}
