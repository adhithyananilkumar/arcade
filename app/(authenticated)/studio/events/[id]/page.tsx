'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function SingleEventDashboardRedirect() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      router.replace(`/studio/content/event/${id}`);
    }
  }, [id, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="text-xs font-semibold text-slate-500">Redirecting to event overview…</p>
      </div>
    </div>
  );
}
