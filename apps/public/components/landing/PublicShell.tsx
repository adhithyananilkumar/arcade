"use client";

/**
 * PublicShell — client wrapper for the (public) layout: explore, courses, events, exams, forum,
 * credentials, profiles. These are content pages a member keeps using, so a signed-in viewer gets
 * them inside the app shell (navbar, dock, theme); a visitor gets the marketing nav.
 *
 * The marketing site (landing, About, Creators…) is NOT here — it lives in (marketing) and never
 * reads the session. See MarketingShell.
 *
 * The one exception is `domain/<handle>`: profile routes supply their own
 * chrome through `ProfileShell`, which picks the marketing nav or the signed-in
 * app nav depending on who is looking. Rendering HeroNav here as well would put
 * the public site's header — with its sign-up call to action — above a member's
 * own app navigation.
 */

import { usePathname, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import HeroNav from "./HeroNav";
import Footer from "./Footer";
import { useAuthStore } from "@/infrastructure/auth/auth.store";
import LearnerShell from "@/apps/learner/layout/LearnerShell";

/** True when this render is for the catch-all profile route. */
function useIsProfileRoute(): boolean {
  const params = useParams();
  return !!params?.username;
}

/** Outer shell — used for non-landing pages where no intro context exists */
function ShellOuter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isProfile = useIsProfileRoute();
  const isExplore = pathname === "/explore";
  const { status } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (isProfile) {
    return <>{children}</>;
  }

  // Before hydration settles, render clean shell to prevent layout flicker
  if (!mounted || status === 'loading') {
    return <div className="flex min-h-screen w-full flex-col">{children}</div>;
  }

  // When a signed-in user views content/explore pages, keep them in their authenticated dashboard view with dock and navbar
  if (status === 'authenticated') {
    return <LearnerShell>{children}</LearnerShell>;
  }

  return (
    <>
      <HeroNav />
      {children}
      {!isExplore && <Footer />}
    </>
  );
}

export default function PublicShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ShellOuter>{children}</ShellOuter>;
}
