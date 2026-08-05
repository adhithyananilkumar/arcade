'use client';

import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';
import { CouponEditor } from './CouponEditor';

export default function ConsoleCouponsPage() {
  const { user, status } = useAuthStore();

  if (status === 'loading' || !user) {
    return <div className="text-sm text-slate-500">Loading…</div>;
  }

  const allowed =
    AuthorizationService.canManageChannels(user) ||
    AuthorizationService.canManageSettings(user) ||
    AuthorizationService.canReviewContent(user) ||
    AuthorizationService.canAccessConsole(user);

  if (!allowed) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        You do not have permission to manage coupons.
      </div>
    );
  }

  return <CouponEditor />;
}
