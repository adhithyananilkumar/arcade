"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const EASE = [0.22, 1, 0.36, 1] as const;

const features = [
  {
    icon: "⚡",
    title: "Hackathons",
    description:
      "Compete in cutting-edge hackathons, push your limits, and build solutions that matter.",
  },
  {
    icon: "🧠",
    title: "Workshops",
    description:
      "Learn from industry experts through hands-on workshops tailored for engineers.",
  },
  {
    icon: "🤝",
    title: "Communities",
    description:
      "Join thriving technical communities — from AI to Web3, robotics to open source.",
  },
  {
    icon: "🏆",
    title: "Competitions",
    description:
      "Showcase your skills in inter-college competitions and earn recognition.",
  },
  {
    icon: "📚",
    title: "Resources",
    description:
      "Access curated learning materials, roadmaps, and project ideas for every stack.",
  },
  {
    icon: "🚀",
    title: "Launchpad",
    description:
      "Turn your side project into a startup with mentorship and community support.",
  },
];

const stats = [
  { value: "2000+", label: "Active Members" },
  { value: "50+", label: "Events Hosted" },
  { value: "12", label: "Tech Clubs" },
  { value: "100+", label: "Projects Launched" },
];

export default function AppShell() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        color: "#111111",
        fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* ── Navbar ── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 48px",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          backgroundColor: "rgba(255,255,255,0.9)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Image
          src="/arcade.svg"
          alt="Arcade"
          width={96}
          height={30}
          style={{ height: 26, width: "auto", objectFit: "contain" }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <a
            href="#features"
            style={{ fontSize: 13, color: "#666", textDecoration: "none", fontWeight: 500 }}
          >
            Features
          </a>
          <a
            href="#community"
            style={{ fontSize: 13, color: "#666", textDecoration: "none", fontWeight: 500 }}
          >
            Community
          </a>
          <a
            href="/auth/login"
            style={{ fontSize: 13, color: "#444", textDecoration: "none", fontWeight: 500 }}
          >
            Sign in
          </a>
          <a
            href="/auth/register"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#fff",
              backgroundColor: "#111",
              borderRadius: 100,
              padding: "8px 20px",
              textDecoration: "none",
            }}
          >
            Get Started
          </a>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "120px 24px 80px",
        }}
      >
        {/* Ambient gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(99,102,241,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: "1px solid #e5e5e5",
            borderRadius: 100,
            padding: "6px 14px",
            fontSize: 11,
            color: "#888",
            fontWeight: 500,
            marginBottom: 32,
            backgroundColor: "#fafafa",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "#22c55e",
              display: "inline-block",
            }}
          />
          Amal Jyothi College of Engineering — Official Platform
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.12 }}
          style={{
            fontSize: "clamp(40px, 6vw, 72px)",
            fontWeight: 650,
            letterSpacing: "-0.03em",
            lineHeight: 1.07,
            maxWidth: 760,
            margin: "0 0 24px",
            color: "#0a0a0a",
          }}
        >
          Where Engineers{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Build, Compete
          </span>{" "}
          &amp; Grow.
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.22 }}
          style={{
            fontSize: "clamp(15px, 1.8vw, 19px)",
            color: "#777",
            maxWidth: 520,
            lineHeight: 1.7,
            margin: "0 0 40px",
          }}
        >
          Arcade is the central hub for technical communities at AJCE — connecting
          students with hackathons, workshops, clubs, and opportunities to innovate.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
          style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}
        >
          <a
            href="/auth/register"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              height: 48,
              borderRadius: 100,
              backgroundColor: "#0a0a0a",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              padding: "0 28px",
              textDecoration: "none",
              boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            }}
          >
            Join Arcade →
          </a>
          <a
            href="#features"
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: 48,
              borderRadius: 100,
              border: "1px solid #e0e0e0",
              color: "#444",
              fontSize: 14,
              fontWeight: 600,
              padding: "0 28px",
              textDecoration: "none",
            }}
          >
            Explore Features
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.42 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "0 48px",
            marginTop: 72,
            maxWidth: 640,
            width: "100%",
          }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
            >
              <span
                style={{ fontSize: "clamp(26px, 3vw, 36px)", fontWeight: 650, letterSpacing: "-0.02em", color: "#0a0a0a" }}
              >
                {stat.value}
              </span>
              <span
                style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.15em" }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          style={{
            position: "absolute",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            color: "#ccc",
          }}
        >
          <div
            style={{
              width: 1,
              height: 40,
              background: "linear-gradient(to bottom, transparent, #ccc)",
            }}
          />
          <span style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Scroll
          </span>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section
        id="features"
        style={{ padding: "96px 48px", backgroundColor: "#fafafa" }}
      >
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: EASE }}
            style={{ textAlign: "center", marginBottom: 64 }}
          >
            <p
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                color: "#aaa",
                marginBottom: 16,
              }}
            >
              Everything you need
            </p>
            <h2
              style={{
                fontSize: "clamp(32px, 4vw, 52px)",
                fontWeight: 650,
                letterSpacing: "-0.025em",
                lineHeight: 1.12,
                color: "#0a0a0a",
              }}
            >
              Built for engineers,
              <br />
              by engineers.
            </h2>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
            }}
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.65, ease: EASE, delay: i * 0.06 }}
                style={{
                  borderRadius: 16,
                  border: "1px solid #ebebeb",
                  backgroundColor: "#fff",
                  padding: "28px 28px 32px",
                  cursor: "default",
                  transition: "box-shadow 0.2s, border-color 0.2s",
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 16 }}>{feature.icon}</div>
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#111",
                    marginBottom: 8,
                  }}
                >
                  {feature.title}
                </h3>
                <p style={{ fontSize: 13, color: "#888", lineHeight: 1.65 }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Community Banner ── */}
      <section
        id="community"
        style={{ padding: "48px 48px 80px" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: EASE }}
          style={{
            position: "relative",
            borderRadius: 28,
            overflow: "hidden",
            background: "linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 50%, #16213e 100%)",
            padding: "80px 48px",
            textAlign: "center",
          }}
        >
          {/* Orb glow */}
          <div
            style={{
              position: "absolute",
              top: "-40px",
              left: "50%",
              transform: "translateX(-50%)",
              width: 480,
              height: 320,
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse, rgba(99,102,241,0.5) 0%, transparent 70%)",
              filter: "blur(60px)",
              opacity: 0.35,
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.25em",
                color: "#666",
                marginBottom: 20,
              }}
            >
              Join the community
            </p>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 52px)",
                fontWeight: 650,
                letterSpacing: "-0.025em",
                color: "#fff",
                lineHeight: 1.12,
                marginBottom: 20,
                maxWidth: 560,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Your engineering journey starts here.
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "#888",
                maxWidth: 460,
                lineHeight: 1.7,
                marginBottom: 40,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Connect with 2000+ fellow engineers at AJCE. Learn, build, compete, and
              grow together in a space made for technical excellence.
            </p>
            <a
              href="/auth/register"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 48,
                borderRadius: 100,
                backgroundColor: "#fff",
                color: "#0a0a0a",
                fontSize: 14,
                fontWeight: 600,
                padding: "0 28px",
                textDecoration: "none",
              }}
            >
              Join for free →
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          padding: "28px 48px",
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <Image
          src="/amaljyothi-typo.svg"
          alt="Amal Jyothi College of Engineering"
          width={160}
          height={28}
          style={{ height: 22, width: "auto", opacity: 0.35 }}
        />
        <p style={{ fontSize: 12, color: "#bbb" }}>
          © 2024 Arcade — Amal Jyothi College of Engineering
        </p>
        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy", "Terms", "Contact"].map((link) => (
            <a
              key={link}
              href="#"
              style={{ fontSize: 12, color: "#bbb", textDecoration: "none" }}
            >
              {link}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
