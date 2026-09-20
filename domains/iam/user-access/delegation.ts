import type { Role } from '@/domains/identity';

/**
 * Frontend mirror of the backend's delegation cap
 * (`PlatformRoleAssignmentService#assertWithinAssignerPermissions`): an admin may only assign or
 * revoke a policy whose permissions they themselves already hold (or hold `ALL`). This is a UX
 * guard only — the backend re-enforces the exact same rule on every request and remains the
 * actual authority boundary — but showing it up front means an admin never clicks through a
 * confirmation just to hit a 403 on a policy they were never going to be allowed to touch.
 */
export function canDelegatePolicy(myPermissionCodes: string[] | undefined, policy: Role): boolean {
  const mine = new Set(myPermissionCodes ?? []);
  if (mine.has('ALL')) return true;
  return (policy.permissions ?? []).every((p) => mine.has(p.code));
}
