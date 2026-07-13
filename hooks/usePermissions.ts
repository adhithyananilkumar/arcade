import { useAuthStore } from '@/store/auth.store';

export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);

  const hasRole = (role: string) => user?.roles?.includes(role) ?? false;
  const hasAnyRole = (roles: string[]) => roles.some(hasRole);
  
  const hasPermission = (permission: string) => user?.permissions?.includes(permission) ?? false;
  const hasAnyPermission = (permissions: string[]) => permissions.some(hasPermission);

  return { hasRole, hasAnyRole, hasPermission, hasAnyPermission, isOwner: hasRole('ROLE_OWNER') };
};
