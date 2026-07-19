'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuthStore } from '@/store/auth.store';

export default function ArcConsoleIndex() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const { user } = useAuthStore();
  
  const primaryRole = user?.roles?.[0]?.name;
  const isSuperUser = primaryRole === 'SUPER_USER';
  const showAdminChannels = isSuperUser || hasPermission('channels.approve') || hasPermission('channels.suspend');
  const showReviewCourses = isSuperUser || hasPermission('courses.review') || hasPermission('channel.courses.review');
  const showAdminSettings = isSuperUser || hasPermission('roles.create') || hasPermission('roles.assign') || hasPermission('users.suspend');

  useEffect(() => {
    if (showAdminChannels) {
      router.replace('/arc-console/channels');
    } else if (showReviewCourses) {
      router.replace('/arc-console/courses');
    } else if (showAdminSettings) {
      router.replace('/arc-console/settings');
    } else {
      router.replace('/dashboard');
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
