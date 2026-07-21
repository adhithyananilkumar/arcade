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
  const showPublic = searchParams.get('public') === 'true';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === 'loading') {
    // Return a neutral loading state that avoids flashing either shell
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-black transition-colors duration-300">
        <div className="animate-pulse">
          {/* Neutral Arcade Logo Placeholder */}
          <div className="h-8 w-32 bg-slate-200 dark:bg-neutral-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Route to the appropriate workspace application
  if (status === 'unauthenticated' || showPublic) {
    return <PublicApp />;
  }

  return <LearnerApp />;
}
