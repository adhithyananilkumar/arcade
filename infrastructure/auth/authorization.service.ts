import { User } from '@/infrastructure/auth/auth.store';

export const AuthorizationService = {
  hasPermission: (user: User | null | undefined, permission: string) => {
    if (!user) return false;
    return user.permissions?.includes('ALL') || user.permissions?.includes(permission) || false;
  },

  canAccessConsole: (user: User | null | undefined) => 
    AuthorizationService.hasPermission(user, 'platform.channels.manage') ||
    AuthorizationService.hasPermission(user, 'platform.courses.review') ||
    AuthorizationService.hasPermission(user, 'platform.users.manage') ||
    AuthorizationService.hasPermission(user, 'platform.roles.assign') ||
    AuthorizationService.hasPermission(user, 'platform.permissions.manage') ||
    AuthorizationService.hasPermission(user, 'platform.system.manage'),

  canManageChannels: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'platform.channels.manage'),
  canReviewCourses: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'platform.courses.review'),
  canManageUsers: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'platform.users.manage'),
  canManageRoles: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'platform.roles.assign') || AuthorizationService.hasPermission(user, 'platform.roles.manage'),
  canManagePermissions: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'platform.permissions.manage'),
  canManageSettings: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'platform.system.manage'),
  
  canViewAuditLogs: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'platform.audit.view'),
};
