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
import { useAuthStore } from "@/infrastructure/auth/auth.store";
import HeroNav from "./HeroNav";
import Footer from "./Footer";

import { useParams } from "next/navigation";

/** Inner shell — reads IntroContext (which is available when isLanding is true) */
function ShellInner({ children }: { children: React.ReactNode }) {
  const { introActive } = useIntroContext();
  const status = useAuthStore((state) => state.status);
  const showNav = !introActive && status !== 'authenticated';
  const params = useParams();
  const isProfile = !!params?.username;

  return (
    <>
      {showNav && <HeroNav />}
      {children}
      {!introActive && !isProfile && <Footer />}
    </>
  );
}

/** Outer shell — used for non-landing pages where no intro context exists */
function ShellOuter({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((state) => state.status);
  const showNav = status !== 'authenticated';
  const params = useParams();
  const isProfile = !!params?.username;

  return (
    <>
      {showNav && <HeroNav />}
      {children}
      {!isProfile && <Footer />}
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
