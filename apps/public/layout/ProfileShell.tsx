'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Public
 *
 * Purpose:
 * Chrome for `domain/<handle>` — the one route that has to render correctly
 * for both a signed-out visitor and a signed-in member.
 *
 * Rules:
 * - Chooses the shell; never the content. The page below it is identical
 *   either way, because a profile is public information and looks the same to
 *   everyone. What changes is the navigation around it.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import ViewerShell from './ViewerShell';

/**
 * A profile is reachable from inside the app (tapping an instructor's name) and from outside it
 * (a shared link, a search result). Previously both got the marketing nav, so a signed-in member
 * who clicked through to a colleague's profile lost their app navigation and was shown the
 * public site's header — with its sign-up call to action — until they navigated away.
 *
 * The nav follows the viewer, not the route. That rule is not specific to profiles, so it lives
 * in {@link ViewerShell}; the course page needs exactly the same treatment for exactly the same
 * reason. This name is kept because profile routes read better for it.
 */
export function ProfileShell({ children }: { children: React.ReactNode }) {
  return <ViewerShell>{children}</ViewerShell>;
}

export default ProfileShell;
