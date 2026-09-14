'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';

export default function LearnerNavbar() {
  const pathname = usePathname();
  
  // Intelligent header scroll behavior
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [lastY, setLastY] = useState(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Only hide after 150px of downward scroll to avoid triggering at the very top
    if (latest > 150 && latest > lastY) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setLastY(latest);
  });

  if (/\/learn\/[^/]+\/exam\/(start|terminated)\/?$/.test(pathname)) {
    return null;
  }

  return (
    <motion.div 
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: -20, opacity: 0 },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-6 left-0 right-0 z-40 flex w-full items-center justify-between px-4 md:px-8 pointer-events-none"
    >
      {/* Left Island: Branding */}
      <div className="pointer-events-auto flex h-12 shrink-0 items-center rounded-full px-5 apple-glass-dock shadow-none [box-shadow:none]">
        <Link href="/" className="group flex cursor-pointer items-center">
          <Image
            src="/arcade.svg"
            alt="Arcade"
            width={85}
            height={24}
            className="h-6 w-auto transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </Link>
      </div>
    </motion.div>
  );
}
