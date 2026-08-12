import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

/**
 * Shared full-page shell for sign-in, sign-up, and onboarding.
 * Matches the home/explore landing gradient — no image split.
 * Logo lives in the form heading by default (pass showLogo for corner mark).
 */
export function AuthPageShell({
  children,
  showLogo = false,
}: {
  children: ReactNode;
  showLogo?: boolean;
}) {
  return (
    <div
      className={`relative min-h-screen w-full overflow-x-hidden ${spaceGrotesk.className}`}
      style={{
        background:
          'linear-gradient(to bottom, #E9EEFB 0%, #F8FAFC 28%, #FFFFFF 52%, #FFFFFF 72%, #EAF7EF 100%)',
        color: '#14142b',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: [
            'radial-gradient(ellipse 55% 40% at 8% 12%, rgba(59, 130, 246, 0.16) 0%, transparent 60%)',
            'radial-gradient(ellipse 50% 35% at 92% 24%, rgba(16, 185, 129, 0.12) 0%, transparent 60%)',
            'radial-gradient(ellipse 45% 35% at 50% 48%, rgba(155, 93, 229, 0.07) 0%, transparent 60%)',
            'radial-gradient(ellipse 50% 35% at 6% 86%, rgba(14, 165, 233, 0.10) 0%, transparent 60%)',
            'radial-gradient(ellipse 50% 35% at 94% 88%, rgba(249, 200, 70, 0.07) 0%, transparent 60%)',
          ].join(', '),
        }}
      />

      {showLogo && (
        <div className="absolute left-4 top-6 z-50 flex h-12 items-center rounded-full px-5 apple-glass-dock md:left-8">
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
      )}

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 sm:py-20">
        <div className="w-full max-w-[440px]">{children}</div>
      </main>
    </div>
  );
}
