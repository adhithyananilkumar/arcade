import { useAuthStore } from '@/infrastructure/auth/auth.store';

export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);

  // The backend resolves all permissions into the user.permissions array.
  // The 'ALL' permission indicates superuser privileges.
  const hasPermission = (permission: string) => 
    user?.permissions?.includes('ALL') || (user?.permissions?.includes(permission) ?? false);
    
  const hasAnyPermission = (permissions: string[]) => permissions.some(hasPermission);

  return { hasPermission, hasAnyPermission };
};
