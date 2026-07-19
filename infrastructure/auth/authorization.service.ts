import { User } from '@/infrastructure/auth/auth.store';

export const AuthorizationService = {
  hasPermission: (user: User | null | undefined, permission: string) => {
    if (!user) return false;
    return user.permissions?.includes('ALL') || user.permissions?.includes(permission) || false;
  },

  canAccessConsole: (user: User | null | undefined) => 
    AuthorizationService.hasPermission(user, 'console.access') || 
    AuthorizationService.hasPermission(user, 'channels.manage') ||
    AuthorizationService.hasPermission(user, 'courses.review') ||
    AuthorizationService.hasPermission(user, 'users.manage') ||
    AuthorizationService.hasPermission(user, 'roles.assign') ||
    AuthorizationService.hasPermission(user, 'permissions.manage') ||
    AuthorizationService.hasPermission(user, 'settings.manage'),

  canManageChannels: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'channels.manage'),
  canReviewCourses: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'courses.review'),
  canManageUsers: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'users.manage'),
  canManageRoles: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'roles.assign'),
  canManagePermissions: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'permissions.manage'),
  canManageSettings: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'settings.manage'),
  
  canViewAuditLogs: (user: User | null | undefined) => AuthorizationService.hasPermission(user, 'audit.view'),
};
