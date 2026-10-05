"use client";

/**
 * MarketingShell — layout chrome for the (marketing) route group.
 *
 * Deliberately knows nothing about the session: no auth gate, no LearnerShell, no ThemeScope. The
 * landing route ("/") wraps content in IntroProvider so the intro plays and HeroNav stays hidden
 * until it finishes; every other marketing page gets HeroNav and Footer immediately.
 */

import { usePathname } from "next/navigation";
import { IntroProvider, useIntroContext } from "@/apps/public/components/intro/IntroProvider";
import HeroNav from "./HeroNav";
import Footer from "./Footer";

/** Reads IntroContext, which exists only under the landing route's IntroProvider. */
function LandingChrome({ children }: { children: React.ReactNode }) {
  const { introActive } = useIntroContext();
  return (
    <>
      {!introActive && <HeroNav />}
      {children}
    </>
  );
}

export default function MarketingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/") {
    return (
      <IntroProvider>
        <LandingChrome>{children}</LandingChrome>
      </IntroProvider>
    );
  }

  return (
    <>
      <HeroNav />
      {children}
      <Footer />
    </>
  );
}
