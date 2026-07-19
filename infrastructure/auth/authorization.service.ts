import { User } from '@/store/auth.store';

export const AuthorizationService = {
  canAccessConsole: (user: User | null | undefined) => 
    AuthorizationService.canManageChannels(user) || 
    AuthorizationService.canReviewCourses(user) || 
    AuthorizationService.canManageUsers(user) || 
    AuthorizationService.canManageRoles(user) ||
    AuthorizationService.canManagePermissions(user) ||
    AuthorizationService.canManageSettings(user),

  canManageChannels: (user: User | null | undefined) => user?.permissions?.includes('channels.manage') || false,
  canReviewCourses: (user: User | null | undefined) => user?.permissions?.includes('courses.review') || false,
  canManageUsers: (user: User | null | undefined) => user?.permissions?.includes('users.manage') || false,
  canManageRoles: (user: User | null | undefined) => user?.permissions?.includes('roles.assign') || false,
  canManagePermissions: (user: User | null | undefined) => user?.permissions?.includes('permissions.manage') || false,
  canManageSettings: (user: User | null | undefined) => user?.permissions?.includes('settings.manage') || false,
  
  canViewAuditLogs: (user: User | null | undefined) => user?.permissions?.includes('audit.view') || false,
};
