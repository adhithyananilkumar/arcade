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
const IMMERSIVE_ROUTES = [
  /^\/studio\/course\/[^/]+\/edit\/?$/,
  /^\/studio\/course\/[^/]+\/question-bank\/?$/,
  /^\/studio\/workshop\/[^/]+(\/edit)?\/?$/,
  /^\/studio\/events\/[^/]+(\/edit)?\/?$/,
  /^\/studio\/roadmap\/[^/]+\/edit\/?$/,
  /^\/studio\/article(\/.*)?$/,
  /^\/studio\/content\/[^/]+\/[^/]+(\/edit)?\/?$/,
  /^\/studio\/published\/[^/]+\/?$/,
  /^\/studio\/[^/]+\/new\/?$/,
  /^\/learn\/[^/]+\/exam\/(start|terminated)\/?$/,
  /^\/roadmap\/[^/]+\/?$/,
];

/** Full-focus surfaces — hide the bottom dock so content can breathe. */
const HIDE_DOCK_ROUTES = [
  /^\/learn\/[^/]+\/learn\/?$/,
  /^\/learn\/[^/]+\/exam\/(start|terminated)\/?$/,
  /^\/studio(\/|$)/,
  /^\/settings(\/|$)/,
  /^\/console(\/|$)/,
  /^\/manage-channels(\/|$)/,
  /^\/channels\/[^/]+\/manage\/?$/,
];

export default function LearnerShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useThemeStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const immersive = IMMERSIVE_ROUTES.some((r) => r.test(pathname ?? ''));
  // The global Dock is hidden everywhere under /studio, including the
  // Content Studio listing and the Content Workspace — the workspace has
  // its own page-local floating dock instead (ContentWorkspaceDock),
  // reflecting that specific content item's own sections rather than the
  // app-wide destinations.
  const hideDock = immersive || HIDE_DOCK_ROUTES.some((r) => r.test(pathname ?? ''));

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
      <div className={`relative flex flex-col flex-1 w-full transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''} ${immersive ? 'h-screen overflow-hidden' : ''}`} style={{ fontFamily: 'var(--font-geist-sans)' }}>
        {/*
          Transparent shell — page backgrounds run under the floating navbar.
          Do NOT add top padding here (that paints a solid empty block on bg-white).
          Each page offsets its content below the nav instead.
        */}
        <div className="flex flex-col flex-1 relative z-10 bg-transparent text-slate-900 dark:text-white h-full">
          {!immersive && <LearnerNavbar />}
          <main className={`relative bg-transparent flex flex-col flex-1 ${!hideDock ? 'pb-28' : ''}`}>
            {children}
          </main>
          {!hideDock && <LearnerDock />}
        </div>
      </div>
    </ProtectedLayout>
  );
}
