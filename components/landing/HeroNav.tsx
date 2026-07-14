"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

const navLinks = [
  { label: "Explore", href: "/courses" },
  { label: "Forums", href: "/forum" },
  { label: "For Colleges", href: "#colleges" },
  { label: "Docs", href: "#docs" },
];

export default function HeroNav() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
    <>
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
          {navLinks.map((link) => {
            const isExplore = link.label === "Explore";
            return (
              <li key={link.label} style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                <Link href={link.href} className="l-nav__link">
                  {link.label}
                </Link>
                {isExplore && (
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px 2px",
                      color: "inherit",
                      display: "flex",
                      alignItems: "center",
                      opacity: 0.7,
                      transition: "transform 0.2s ease",
                      transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0)"
                    }}
                    aria-label="Toggle explore categories"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                )}
              </li>
            );
          })}
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

        {/* Mega Menu Dropdown */}
        {isDropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "64px",
              left: 0,
              right: 0,
              background: "#FFFFFF",
              borderBottom: "1px solid rgba(20, 20, 43, 0.08)",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.06)",
              zIndex: 99,
              animation: "slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div
              style={{
                maxWidth: "1100px",
                margin: "0 auto",
                padding: "40px 24px",
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "40px",
                textAlign: "left",
              }}
            >
              {/* Column 1: Categories */}
              <div>
                <h4 style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#8B5CF6", marginBottom: "16px" }}>
                  Categories
                </h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    "Computer Science",
                    "Artificial Intelligence",
                    "Information Technology",
                    "Business & Management",
                    "Civil & Mechanical",
                    "Basic Sciences",
                    "Humanities & Languages",
                    "Personal Development"
                  ].map(item => (
                    <li key={item}>
                      <Link href="/courses" onClick={() => setIsDropdownOpen(false)} style={{ fontSize: "0.9rem", color: "#374151", textDecoration: "none" }} className="lp-dropdown-link">
                        {item}
                      </Link>
                    </li>
                  ))}
                  <li style={{ borderTop: "1px solid #F3F4F6", paddingTop: "8px", marginTop: "4px" }}>
                    <Link href="/courses" onClick={() => setIsDropdownOpen(false)} style={{ fontSize: "0.85rem", fontWeight: "700", color: "#8B5CF6", textDecoration: "none" }}>
                      View all Categories →
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 2: Bootcamps & Workshops */}
              <div>
                <h4 style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#C97A14", marginBottom: "16px" }}>
                  Bootcamps & Workshops
                </h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                  {["UI/UX Design Intensive", "AI Engineering", "Fullstack Development", "Javascript Fundamentals"].map(item => (
                    <li key={item}>
                      <Link href="/bootcamps" onClick={() => setIsDropdownOpen(false)} style={{ fontSize: "0.9rem", color: "#374151", textDecoration: "none" }} className="lp-dropdown-link">
                        {item}
                      </Link>
                    </li>
                  ))}
                  <li style={{ borderTop: "1px solid #F3F4F6", paddingTop: "8px", marginTop: "4px" }}>
                    <Link href="/bootcamps" onClick={() => setIsDropdownOpen(false)} style={{ fontSize: "0.85rem", fontWeight: "700", color: "#C97A14", textDecoration: "none" }}>
                      View all Bootcamps →
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: Live Webinars */}
              <div>
                <h4 style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#23946A", marginBottom: "16px" }}>
                  Live Webinars
                </h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                  {["Future of Generative AI", "Scaling React Applications", "Building Resilient APIs", "Cloud Architecture Trends"].map(item => (
                    <li key={item}>
                      <Link href="/webinars" onClick={() => setIsDropdownOpen(false)} style={{ fontSize: "0.9rem", color: "#374151", textDecoration: "none" }} className="lp-dropdown-link">
                        {item}
                      </Link>
                    </li>
                  ))}
                  <li style={{ borderTop: "1px solid #F3F4F6", paddingTop: "8px", marginTop: "4px" }}>
                    <Link href="/webinars" onClick={() => setIsDropdownOpen(false)} style={{ fontSize: "0.85rem", fontWeight: "700", color: "#23946A", textDecoration: "none" }}>
                      View all Webinars →
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 4: Articles & Guides */}
              <div>
                <h4 style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#3B5CD7", marginBottom: "16px" }}>
                  Articles & Guides
                </h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                  {["Optimizing Next.js Apps", "Modern CSS Grid Guides", "State Management in React", "Database Optimization"].map(item => (
                    <li key={item}>
                      <Link href="/articles" onClick={() => setIsDropdownOpen(false)} style={{ fontSize: "0.9rem", color: "#374151", textDecoration: "none" }} className="lp-dropdown-link">
                        {item}
                      </Link>
                    </li>
                  ))}
                  <li style={{ borderTop: "1px solid #F3F4F6", paddingTop: "8px", marginTop: "4px" }}>
                    <Link href="/articles" onClick={() => setIsDropdownOpen(false)} style={{ fontSize: "0.85rem", fontWeight: "700", color: "#3B5CD7", textDecoration: "none" }}>
                      View all Articles →
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </motion.nav>

      {/* Backdrop overlay to close when clicking outside */}
      {isDropdownOpen && (
        <div
          onClick={() => setIsDropdownOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.01)",
            zIndex: 98,
          }}
        />
      )}
    </>
  );
}
