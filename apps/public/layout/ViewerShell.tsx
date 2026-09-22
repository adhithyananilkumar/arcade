'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Public
 *
 * Purpose:
 * Chrome for a public route that has to render correctly for both a
 * signed-out visitor and a signed-in member.
 *
 * Rules:
 * - Chooses the shell; never the content. The page below it is identical
 *   either way. What changes is the navigation around it.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import LearnerShell from '@/apps/learner/layout/LearnerShell';
import HeroNav from '@/apps/public/components/landing/HeroNav';
import Footer from '@/apps/public/components/landing/Footer';

/**
 * Some pages are reachable from inside the app and from outside it — a profile from a colleague's
 * name or a shared link; a course from the learner's home page or a search result. Giving every
 * visitor the marketing nav means a signed-in member loses their app navigation and is shown the
 * public site's header, with its sign-up call to action, until they navigate away.
 *
 * The nav follows the viewer, not the route.
 */
export function ViewerShell({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status);

  // The shell is chosen from client state, so the server render cannot know it. Committing to
  // either shell before mount would guarantee a wrong first paint for half the audience and a
  // hydration mismatch; the content renders immediately either way and the chrome settles a
  // frame later.
  const [mounted, setMounted] = useState(false);
  // Mount detection. "Has this hydrated yet" is knowable only after mount, and the one extra
  // render is the point: it is what keeps the server and client markup identical. Same pattern
  // as LearnerShell.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted || status === 'loading') {
    return <div className="flex min-h-screen w-full flex-col bg-background text-foreground">{children}</div>;
  }

  if (status === 'authenticated') {
    return <LearnerShell>{children}</LearnerShell>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      <HeroNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default ViewerShell;
