'use client';

/**
 * Shared visual chrome for the channel-invitation flow. Lifted verbatim from /reach-us so the
 * invitation landing step and the creation form sit on the exact same pastel backdrop and share
 * its stagger-reveal timing.
 */

import { Variants } from 'framer-motion';

/** Subtle stagger reveal variants (shared with /reach-us). */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay: i * 0.07,
      ease: [0.215, 0.61, 0.355, 1],
    },
  }),
};

/** Extremely subtle pastel atmospheric background (same values as /reach-us). */
export function AtmosphericBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10"
      style={{
        backgroundColor: '#FAFBFD',
        backgroundImage: `
          radial-gradient(ellipse 70% 40% at 50% 0%, rgba(224, 236, 255, 0.25) 0%, transparent 70%),
          radial-gradient(ellipse 60% 40% at 10% 25%, rgba(233, 225, 254, 0.20) 0%, transparent 65%),
          radial-gradient(ellipse 60% 40% at 90% 75%, rgba(253, 232, 240, 0.18) 0%, transparent 65%),
          linear-gradient(
            180deg,
            #FAFBFD 0%,
            #F6F8FD 35%,
            #F8F6FD 70%,
            #FAF9FB 100%
          )
        `,
      }}
    />
  );
}
