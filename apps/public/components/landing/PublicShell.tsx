"use client";

/**
 * PublicShell — client wrapper for the (public) layout.
 *
 * On the landing route ("/"), wraps content in IntroProvider so the
 * intro animation plays and HeroNav/Footer are hidden until it finishes.
 * On all other public routes, nav and footer render immediately as normal.
 *
 * The one exception is `domain/<handle>`: profile routes supply their own
 * chrome through `ProfileShell`, which picks the marketing nav or the signed-in
 * app nav depending on who is looking. Rendering HeroNav here as well would put
 * the public site's header — with its sign-up call to action — above a member's
 * own app navigation.
 */

import { usePathname, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { IntroProvider, useIntroContext } from "@/apps/public/components/intro/IntroProvider";
import HeroNav from "./HeroNav";
import Footer from "./Footer";
import { useAuthStore } from "@/infrastructure/auth/auth.store";
import LearnerShell from "@/apps/learner/layout/LearnerShell";

/** True when this render is for the catch-all profile route. */
function useIsProfileRoute(): boolean {
  const params = useParams();
  return !!params?.username;
}

/** Inner shell — reads IntroContext (which is available when isLanding is true) */
function ShellInner({ children }: { children: React.ReactNode }) {
  const { introActive } = useIntroContext();

  return (
    <>
      {!introActive && <HeroNav />}
      {children}
    </>
  );
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
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) {
    return (
      <IntroProvider>
        <ShellInner>{children}</ShellInner>
      </IntroProvider>
    );
  }

  return <ShellOuter>{children}</ShellOuter>;
}
