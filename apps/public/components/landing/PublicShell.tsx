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
import Link from "next/link";
import Image from "next/image";

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
  const isCreators = pathname === "/creators";

  return (
    <>
      {isCreators ? (
        <div className="fixed left-4 top-6 z-50 flex h-12 items-center rounded-full px-5 apple-glass-dock md:left-8">
          <Link href="/" className="group flex cursor-pointer items-center">
            <Image
              src="/arcade.svg"
              alt="Arcade"
              width={85}
              height={24}
              className="h-6 w-auto transition-transform duration-200 group-hover:scale-[1.02]"
              priority
            />
          </Link>
        </div>
      ) : (
        <HeroNav />
      )}
      {children}
      {!isProfile && !isExplore && !isCreators && <Footer />}
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
