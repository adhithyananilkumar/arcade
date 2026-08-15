import { User } from '@/infrastructure/auth/auth.store';

export const AuthorizationService = {
  hasPermission: (user: User | null | undefined, permission: string) => {
    if (!user) return false;
    return user.permissions?.includes('ALL') || user.permissions?.includes(permission) || false;
  },

  canAccessConsole: (user: User | null | undefined) => 
    AuthorizationService.hasPermission(user, 'platform.channels.manage') ||
    AuthorizationService.canReviewContent(user) ||
    AuthorizationService.hasPermission(user, 'platform.users.manage') ||
    AuthorizationService.hasPermission(user, 'platform.roles.assign') ||
    AuthorizationService.hasPermission(user, 'platform.permissions.manage') ||
    AuthorizationService.hasPermission(user, 'platform.system.manage') ||
    AuthorizationService.hasPermission(user, 'payments.view'),

  canManageChannels: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'platform.channels.manage'),

  /** Accepts platform.content.review, legacy platform.courses.review, or channel.content.review. */
  canReviewContent: (user: User | null | undefined) =>
    AuthorizationService.hasPermission(user, 'platform.content.review') ||
    AuthorizationService.hasPermission(user, 'platform.courses.review') ||
    AuthorizationService.hasPermission(user, 'channel.content.review'),

  /** Checks if the user is a platform/global reviewer */
  canReviewPlatformContent: (user: User | null | undefined) =>
    AuthorizationService.hasPermission(user, 'platform.content.review') ||
    AuthorizationService.hasPermission(user, 'platform.courses.review'),

  /** Checks if the user is a channel reviewer */
  canReviewChannelContent: (user: User | null | undefined) =>
    AuthorizationService.hasPermission(user, 'channel.content.review'),

  /** @deprecated Use canReviewContent */
  canReviewCourses: (user: User | null | undefined) => AuthorizationService.canReviewContent(user),

  canManageUsers: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'platform.users.manage'),
  canManageRoles: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'platform.roles.assign') || AuthorizationService.hasPermission(user, 'platform.roles.manage'),
  canManagePermissions: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'platform.permissions.manage'),
  canManageSettings: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'platform.system.manage'),

  canManageCategories: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'platform.categories.manage'),

  canViewAuditLogs: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'platform.audit.view'),

  canViewPayments: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'payments.view'),
};
