'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { channelService } from '@/domains/channels';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';

export default function ContentStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // If the user can manage channels or review courses, they have access
    const hasAdminAccess = AuthorizationService.canManageChannels(user) || AuthorizationService.canReviewCourses(user);
    
    if (hasAdminAccess) {
      setIsAuthorized(true);
      return;
    }

    // Otherwise, check if they have any channels or workspaces
    Promise.all([
      channelService.getMyChannels(),
      channelService.getMyWorkspaces()
    ])
      .then(([channels, workspaces]) => {
        if (channels.length > 0 || workspaces.length > 0) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          router.push('/dashboard');
        }
      })
      .catch(() => {
        setIsAuthorized(false);
        router.push('/dashboard');
      });
  }, [user, router]);

  if (isAuthorized === null) {
    return <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50"><p className="text-gray-500 font-medium animate-pulse">Loading Studio...</p></div>;
  }

  if (isAuthorized === false) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
