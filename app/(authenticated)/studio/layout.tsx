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
  const { user, status: authStatus } = useAuthStore();
  const { hasAccess, loading } = useStudioAccess();
  
  const eventIdMatch = pathname.match(/^\/studio\/workshop\/([a-f0-9-]+)/i);
  const eventId = eventIdMatch ? eventIdMatch[1] : null;
  const [hasEventAccess, setHasEventAccess] = useState<boolean | null>(null);
  const [checkingEvent, setCheckingEvent] = useState(false);

  const isCollaborationsPage = pathname.startsWith('/studio/my-collaborations') || pathname.startsWith('/studio/collaborator-dashboard') || pathname.startsWith('/studio/events');
  const isPublishedPreview = pathname.startsWith('/studio/published/');
  const [hasCollabs, setHasCollabs] = useState<boolean | null>(null);

  useEffect(() => {
    if (isCollaborationsPage) {
      api.get<any[]>('/api/v1/events/my-collaborations')
        .then(res => {
          setHasCollabs(res && res.length > 0);
        })
        .catch(() => setHasCollabs(false));
    } else {
      setHasCollabs(null);
    }
  }, [isCollaborationsPage]);

  useEffect(() => {
    if (eventId) {
      setCheckingEvent(true);
      api.get<boolean>(`/api/v1/events/${eventId}/view-access`)
        .then(res => {
          setHasEventAccess(res);
          setCheckingEvent(false);
        })
        .catch(() => {
          setHasEventAccess(false);
          setCheckingEvent(false);
        });
    } else {
      setHasEventAccess(null);
      setCheckingEvent(false);
    }
  }, [eventId]);

  // Platform admins / course reviewers get in regardless of channel affiliation.
  const hasAdminAccess = AuthorizationService.canManageChannels(user) || AuthorizationService.canReviewCourses(user);
  
  // Authorized if admin, or visiting a workshop they have view access to, or visiting the collaborations page, or viewing a published preview, or has general studio access
  const isAuthorized = hasAdminAccess || isPublishedPreview ||
    (eventId ? hasEventAccess === true : (isCollaborationsPage ? true : hasAccess));

  const isLayoutLoading = loading || authStatus === 'loading' ||
    (eventId !== null && hasEventAccess === null);

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
