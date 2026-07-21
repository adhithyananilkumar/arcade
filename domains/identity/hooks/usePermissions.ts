import { useAuthStore } from '@/infrastructure/auth/auth.store';

export const CONTENT_CREATION_PERMISSIONS = [
  'channel.courses.create',
  'channel.roadmaps.create',
  'channel.lessons.create',
  'channel.quizzes.create',
  'channel.media.upload',
];

export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);

  // The backend resolves all permissions into the user.permissions array.
  // The 'ALL' permission indicates superuser privileges.
  const hasPermission = (permission: string) => 
    user?.permissions?.includes('ALL') || (user?.permissions?.includes(permission) ?? false);
    
  const hasAnyPermission = (permissions: string[]) => permissions.some(hasPermission);

  const canCreateContent = () => hasAnyPermission(CONTENT_CREATION_PERMISSIONS);

  return { hasPermission, hasAnyPermission, canCreateContent };
};
