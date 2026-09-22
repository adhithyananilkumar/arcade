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

import { usePathname } from "next/navigation";
import { IntroProvider, useIntroContext } from "@/apps/public/components/intro/IntroProvider";
import HeroNav from "./HeroNav";
import Footer from "./Footer";

import { useParams } from "next/navigation";

/** True when this render is for the catch-all profile route. */
function useIsProfileRoute(): boolean {
  const params = useParams();
  return !!params?.username;
}

/** Inner shell — reads IntroContext (which is available when isLanding is true) */
function ShellInner({ children }: { children: React.ReactNode }) {
  const { introActive } = useIntroContext();

  // HeroNav renders correctly for both auth states on its own (it swaps "Get Started" for
  // "Open Arcade"), and public routes never render any other nav — hiding it here for
  // authenticated users used to leave them with no top nav at all on every public page.
  // Only the landing-page intro animation is a legitimate reason to hide it.
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
  // A single course (`/courses/<id>`), not the listing at `/courses`: it supplies its own chrome
  // through ViewerShell, which picks the signed-in app nav or the marketing nav depending on who
  // is looking. Rendering HeroNav and Footer here too would stack a second header and footer
  // around it.
  const isCourse = pathname?.startsWith("/courses/") ?? false;

  if (isProfile || isCourse) {
    return <>{children}</>;
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
