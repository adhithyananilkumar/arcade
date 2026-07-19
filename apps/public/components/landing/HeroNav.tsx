"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import "@/apps/public/landing.css";

const navLinks = [
  { label: "Explore", href: "/explore" },
  { label: "About", href: "/about" },
  { label: "For creators", href: "/for-creators" },
];

export default function HeroNav() {
  const shouldReduceMotion = useReducedMotion();
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Hide only if we scroll down past 120px
      if (currentScrollY > lastScrollY && currentScrollY > 120) {
        setIsHidden(true);
      }
      // Show when scrolling up
      else if (currentScrollY < lastScrollY) {
        setIsHidden(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navVariant = {
    hidden: { y: -100, scale: 0.9, opacity: 0 },
    visible: {
      y: 0,
      scale: 1,
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0.3 }
        : {
          type: "spring" as const,
          stiffness: 100,
          damping: 15,
          delay: 0.1, // slightly reduced delay for immediate loading responsiveness
        },
    },
    scrollHidden: {
      y: -100,
      opacity: 0,
      transition: {
        duration: 0.25,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.nav
      className="l-nav"
      variants={navVariant as any}
      initial="hidden"
      animate={isHidden ? "scrollHidden" : "visible"}
      role="navigation"
      aria-label="Main navigation"
      style={{ position: "fixed", zIndex: 100 }}
    >
      {/* Wordmark */}
      <Link href="/" className="l-nav__logo-container" aria-label="Arcade home">
        <span className="l-nav__logo-text">arcade.</span>
      </Link>

      {/* Center-right links */}
      <ul className="l-nav__links" role="list">
        {navLinks.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="l-nav__link">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Right actions */}
      <div className="l-nav__actions">
        <Link href="/sign" className="l-nav__get-started">
          Get Started
        </Link>
      </div>
    </motion.nav>
  );
}
