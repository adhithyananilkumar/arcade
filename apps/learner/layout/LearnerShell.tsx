'use client';

import ProtectedLayout from '@/apps/core/layout/ProtectedLayout';
import LearnerNavbar from '@/apps/learner/layout/LearnerNavbar';
import LearnerDock from '@/apps/learner/layout/LearnerDock';
import { QuickAppearance } from '@/apps/core/components/appearance/QuickAppearance';
import { ThemeScope } from '@/apps/core/components/ThemeScope';
import { BugIsland } from '@/apps/core/components/bug-reports/BugIsland';
import { TimeTracker } from "@/domains/learning";
import { usePathname } from 'next/navigation';

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
  /^\/studio\/content\/[^/]+\/[^/]+\/edit\/?$/,
  // The exam editor is the same full-screen Studio surface as the course editor: it draws its own
  // top bar, so the app navbar sitting above it produced two overlapping rows of pills.
  /^\/studio\/exam\/[^/]+\/edit\/?$/,
  /^\/studio\/published\/[^/]+\/?$/,
  // Exam sitting and its termination screen — full viewport, own chrome.
  /^\/exams\/[^/]+\/(attempt|terminated)\/?$/,
];

/** Full-focus surfaces — hide the bottom dock so content can breathe. */
const HIDE_DOCK_ROUTES = [
  // The lesson player. Deliberately only the player: the course overview hub at
  // /courses/{id}/learn is an ordinary browsing surface and keeps the dock.
  /^\/courses\/[^/]+\/learn\/[^/]+\/?$/,
  /^\/exams\/[^/]+\/(attempt|terminated)\/?$/,
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
  const pathname = usePathname();

  const immersive = IMMERSIVE_ROUTES.some((r) => r.test(pathname ?? ''));
  // The global Dock is hidden everywhere under /studio, including the
  // Content Studio listing and the Content Workspace — the workspace has
  // its own page-local floating dock instead (ContentWorkspaceDock),
  // reflecting that specific content item's own sections rather than the
  // app-wide destinations.
  const hideDock = immersive || HIDE_DOCK_ROUTES.some((r) => r.test(pathname ?? ''));

  return (
    <>
    {/*
      The viewer's theme applies wherever the signed-in app shell is shown — the dashboard routes,
      and public pages (explore, courses, events, profiles) when a member views them. Outside
      ProtectedLayout on purpose: it holds its children back until mount.
    */}
    <ThemeScope />
    <ProtectedLayout>
      <TimeTracker />
      <div className={`relative flex flex-col flex-1 w-full transition-colors duration-300 ${immersive ? 'h-screen overflow-hidden' : ''}`} style={{ fontFamily: 'var(--font-geist-sans)' }}>
        {/*
          Transparent shell — page backgrounds run under the floating navbar.
          Do NOT add top padding here (that paints a solid empty block on bg-white).
          Each page offsets its content below the nav instead.
        */}
        <div className="flex flex-col flex-1 relative z-10 bg-transparent text-slate-900 h-full">
          {!immersive && <LearnerNavbar />}
          <main className="relative bg-transparent flex flex-col flex-1">
            {children}
          </main>
          {!hideDock && <LearnerDock />}
          {/* Quick preferences (theme, glass, wallpaper) on the same browsing surfaces as the dock —
              Home, Explore, Learning, Achievements… — not on focus screens. Hideable in Settings. */}
          {!hideDock && <QuickAppearance />}
          {/* Renders nothing unless the backend says this account may report bugs. */}
          <BugIsland />
        </div>
      </div>
    </ProtectedLayout>
    </>
  );
}
