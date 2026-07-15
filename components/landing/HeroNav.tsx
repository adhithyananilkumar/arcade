"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

const navLinks = [
  { label: "Explore", href: "/courses" },
  { label: "Forums", href: "/forum" },
  { label: "For Colleges", href: "#colleges" },
  { label: "Docs", href: "#docs" },
];

export default function HeroNav() {
  const shouldReduceMotion = useReducedMotion();

  const navVariant = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0.3 }
        : { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <motion.nav
      className="l-nav"
      variants={navVariant}
      initial="hidden"
      animate="visible"
      role="navigation"
      aria-label="Main navigation"
      style={{ position: "fixed", zIndex: 100 }}
    >
      {/* Wordmark */}
      <Link href="/" className="l-nav__wordmark" aria-label="Arcade home" style={{ display: "flex", alignItems: "center" }}>
        <img src="/arcade.svg" alt="Arcade Logo" style={{ height: "30px", width: "auto" }} />
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
        <Link href="/login" className="l-nav__login">
          Log in
        </Link>
        <Link href="/register" className="l-btn l-btn--outline-ink">
          Get Started
        </Link>
      </div>
    </motion.nav>
  );
}
