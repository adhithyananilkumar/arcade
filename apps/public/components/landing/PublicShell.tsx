"use client";

/**
 * PublicShell — client wrapper for the (public) layout.
 *
 * On the landing route ("/"), wraps content in IntroProvider so the
 * intro animation plays and HeroNav/Footer are hidden until it finishes.
 * On all other public routes, nav and footer render immediately as normal.
 */

import { usePathname } from "next/navigation";
import { IntroProvider, useIntroContext } from "@/apps/public/components/intro/IntroProvider";
import HeroNav from "./HeroNav";
import Footer from "./Footer";

import { useParams } from "next/navigation";

/** Inner shell — reads IntroContext (which is available when isLanding is true) */
function ShellInner({ children }: { children: React.ReactNode }) {
  const { introActive } = useIntroContext();
  const params = useParams();
  const isProfile = !!params?.username;

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
  const params = useParams();
  const pathname = usePathname();
  const isProfile = !!params?.username;
  const isExplore = pathname === "/explore";

  return (
    <>
      <HeroNav />
      {children}
      {!isProfile && !isExplore && <Footer />}
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
