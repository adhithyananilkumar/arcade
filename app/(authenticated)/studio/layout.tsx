'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudioAccess } from '@/domains/channels';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';

export default function ContentStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { hasAccess, loading } = useStudioAccess();

  // Platform admins / course reviewers get in regardless of channel affiliation.
  const hasAdminAccess = AuthorizationService.canManageChannels(user) || AuthorizationService.canReviewCourses(user);
  const isAuthorized = hasAdminAccess || hasAccess;

  useEffect(() => {
    if (!hasAdminAccess && !loading && !hasAccess) {
      router.push('/');
    }
  }, [hasAdminAccess, loading, hasAccess, router]);

  if (!hasAdminAccess && loading) {
    return <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50"><p className="text-gray-500 font-medium animate-pulse">Loading Studio...</p></div>;
  }

  if (!isAuthorized) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
