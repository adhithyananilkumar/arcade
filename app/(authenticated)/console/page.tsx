'use client';

import { useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';

export default function ArcConsoleIndex() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const showAdminChannels = AuthorizationService.canManageChannels(user);
  const showReviewCourses = AuthorizationService.canReviewCourses(user);
  const showAdminSettings = AuthorizationService.canManageSettings(user) || AuthorizationService.canManageUsers(user) || AuthorizationService.canManageRoles(user) || AuthorizationService.canManagePermissions(user);

  if (!showAdminChannels && !showReviewCourses && !showAdminSettings) {
    notFound();
  }

  useEffect(() => {
    if (showAdminChannels) {
      router.replace('/console/channels');
    } else if (showReviewCourses) {
      router.replace('/console/courses');
    } else if (showAdminSettings) {
      router.replace('/console/settings');
    }
  }, [router, showAdminChannels, showReviewCourses, showAdminSettings]);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4 text-slate-400">
        <div className="h-8 w-8 rounded-full border-2 border-slate-300 border-t-indigo-600 animate-spin" />
        <p className="text-sm font-medium">Loading Arc Console...</p>
      </div>
    </div>
  );
}
