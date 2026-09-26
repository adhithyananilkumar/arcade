/**
 * Event authoring types.
 *
 * These moved to `@/domains/events` — a domain must not depend on a route folder, and the HTTP
 * layer that uses them now lives in the domain. This file re-exports them so the 25 existing
 * import sites keep working; new code should import from `@/domains/events` directly.
 */
export * from '@/domains/events/types/event.types';
