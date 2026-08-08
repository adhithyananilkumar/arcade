'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStudioAccess } from '@/domains/channels';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';
import { api } from '@/infrastructure/http/api';

export default function ContentStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { hasAccess, loading } = useStudioAccess();
  
  const workshopIdMatch = pathname.match(/^\/studio\/workshop\/([a-f0-9-]+)/i);
  const workshopId = workshopIdMatch ? workshopIdMatch[1] : null;
  const [hasWorkshopAccess, setHasWorkshopAccess] = useState<boolean | null>(null);
  const [checkingWorkshop, setCheckingWorkshop] = useState(false);

  const isCollaborationsPage = pathname.startsWith('/studio/my-collaborations') || pathname.startsWith('/studio/collaborator-dashboard');
  const [hasCollabs, setHasCollabs] = useState<boolean | null>(null);

  useEffect(() => {
    if (isCollaborationsPage) {
      api.get<any[]>('/api/workshops/my-collaborations')
        .then(res => {
          setHasCollabs(res && res.length > 0);
        })
        .catch(() => setHasCollabs(false));
    } else {
      setHasCollabs(null);
    }
  }, [isCollaborationsPage]);

  useEffect(() => {
    if (workshopId) {
      setCheckingWorkshop(true);
      api.get<boolean>(`/api/workshops/${workshopId}/view-access`)
        .then(res => {
          setHasWorkshopAccess(res);
          setCheckingWorkshop(false);
        })
        .catch(() => {
          setHasWorkshopAccess(false);
          setCheckingWorkshop(false);
        });
    } else {
      setHasWorkshopAccess(null);
      setCheckingWorkshop(false);
    }
  }, [workshopId]);

  // Platform admins / course reviewers get in regardless of channel affiliation.
  const hasAdminAccess = AuthorizationService.canManageChannels(user) || AuthorizationService.canReviewCourses(user);
  
  // Authorized if admin, or visiting a workshop they have view access to, or visiting the collaborations page, or has general studio access
  const isAuthorized = hasAdminAccess || 
    (workshopId ? hasWorkshopAccess === true : (isCollaborationsPage ? true : hasAccess));

  const isLayoutLoading = loading || 
    (workshopId !== null && hasWorkshopAccess === null);

  useEffect(() => {
    if (!hasAdminAccess && !isLayoutLoading && !isAuthorized) {
      router.push('/');
    }
  }, [hasAdminAccess, isLayoutLoading, isAuthorized, router]);

  if (!hasAdminAccess && isLayoutLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50"><p className="text-gray-500 font-medium animate-pulse">Loading Studio...</p></div>;
  }

  if (!isAuthorized) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
