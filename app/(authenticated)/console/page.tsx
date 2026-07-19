'use client';

import { useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { usePermissions } from "@/domains/identity";

export default function ArcConsoleIndex() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  
  const showAdminChannels = hasPermission('channels.approve') || hasPermission('channels.suspend');
  const showReviewCourses = hasPermission('courses.review') || hasPermission('channel.courses.review');
  const showAdminSettings = hasPermission('roles.create') || hasPermission('roles.assign') || hasPermission('users.suspend');

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
