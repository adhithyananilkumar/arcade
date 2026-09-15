'use client';

import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { useEffect, useState } from 'react';
import PublicApp from '@/apps/public/PublicApp';
import LearnerApp from '@/apps/learner/LearnerApp';
import { useSearchParams } from 'next/navigation';

export default function AppShellResolver() {
  const { status } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const PUBLIC_VIEW_PARAM = 'public';
  const showPublic = searchParams.get(PUBLIC_VIEW_PARAM) === 'true';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === 'loading') {
    // Clean blank screen matching the intro radial gradient (no skeleton/block)
    return (
      <div
        className="fixed inset-0 z-[9999] pointer-events-none select-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 42%, #f6f6f6 0%, #ffffff 65%)",
        }}
      />
    );
  }

  /**
   * `?public=true` is a presentation-only override that allows
   * authenticated users to temporarily view the public marketing
   * site. It must never influence authentication or authorization.
   */
  if (status === 'unauthenticated' || showPublic) {
    return <PublicApp />;
  }

  return <LearnerApp />;
}
