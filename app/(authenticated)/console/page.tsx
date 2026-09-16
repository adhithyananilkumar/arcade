'use client';

import { useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';

export default function ArcConsoleIndex() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Same seven surfaces, in the same order, as the sidebar in console/layout.tsx — redirect to
  // whichever one this user actually has access to first. Missing a surface here previously
  // meant a user with ONLY e.g. Content Manage access got a 404 landing on /console at all, even
  // though /console/content-manage itself worked fine once navigated to directly.
  const showAdminChannels = AuthorizationService.canManageChannels(user);
  const showReviewCourses = AuthorizationService.canReviewCourses(user);
  const showContentManage = AuthorizationService.canManageContent(user);
  const showExams = AuthorizationService.canManageExams(user);
  const showPayments = AuthorizationService.canViewPayments(user);
  const showInbox = AuthorizationService.canManageInbox(user);
  const showIam = AuthorizationService.canAccessIamConsole(user);

  if (
    !showAdminChannels &&
    !showReviewCourses &&
    !showContentManage &&
    !showExams &&
    !showPayments &&
    !showInbox &&
    !showIam
  ) {
    notFound();
  }

  useEffect(() => {
    if (showAdminChannels) {
      router.replace('/console/channels');
    } else if (showReviewCourses) {
      router.replace('/console/reviews');
    } else if (showContentManage) {
      router.replace('/console/content-manage');
    } else if (showExams) {
      router.replace('/console/exam-schedules');
    } else if (showPayments) {
      router.replace('/console/payments');
    } else if (showInbox) {
      router.replace('/console/inbox');
    } else if (showIam) {
      router.replace('/console/iam');
    }
  }, [router, showAdminChannels, showReviewCourses, showContentManage, showExams, showPayments, showInbox, showIam]);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4 text-slate-400">
        <div className="h-8 w-8 rounded-full border-2 border-slate-300 border-t-indigo-600 animate-spin" />
        <p className="text-sm font-medium">Loading Arc Console...</p>
      </div>
    </div>
  );
}
