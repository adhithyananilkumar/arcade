'use client';

import ProtectedLayout from '@/apps/core/layout/ProtectedLayout';
import LearnerNavbar from '@/apps/learner/layout/LearnerNavbar';
import LearnerDock from '@/apps/learner/layout/LearnerDock';
import { TimeTracker } from "@/domains/learning";
import { useThemeStore } from '@/infrastructure/state/theme.store';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Routes that own their entire viewport and supply their own top chrome. The
 * learner navbar is `fixed top-6 z-40`, so on these it floats over the page's
 * own bar and toolbar instead of sitting above them.
 */
const IMMERSIVE_ROUTES = [/^\/studio\/course\/[^/]+\/edit\/?$/];

export default function LearnerShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useThemeStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const immersive = IMMERSIVE_ROUTES.some((r) => r.test(pathname ?? ''));

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // or a loading spinner
  }

  return (
    <ProtectedLayout>
      <TimeTracker />
      <div className={`relative flex flex-col flex-1 w-full transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''}`} style={{ fontFamily: 'var(--font-geist-sans)' }}>
        {/* Main Content Area */}
        <div className="flex flex-col flex-1 relative z-10 bg-white dark:bg-black text-slate-900 dark:text-white">
          <LearnerNavbar />
          <main className="relative bg-transparent flex flex-col flex-1 pt-24 pb-28">
            {children}
          </main>
          <LearnerDock />
        </div>
      </div>
    </ProtectedLayout>
  );
}
