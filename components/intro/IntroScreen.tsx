"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Independent boolean timeline — each element animates on its own clock.
 * This eliminates the "blank" gap: Arcade starts 150ms before AJCE fully dissolves.
 *
 * Timeline (ms from mount):
 *   50        ajceIn = true      AJCE fades in        700ms
 *   1250      ajceOut = true     AJCE dissolves       1200ms
 *   2250      arcadeIn = true    Arcade fades in  ←─ 150ms overlap with AJCE
 *   3000      welcomeIn = true   Welcome writes        1000ms
 *   4350      appReady           App fades in          (calls onAppReady)
 *   4900      introDone          Container fades        (calls onDone)
 */

interface IntroScreenProps {
  onAppReady: () => void;
  onDone: () => void;
}

export function IntroScreen({ onAppReady, onDone }: IntroScreenProps) {
  const [ajceIn, setAjceIn] = useState(false);
  const [ajceOut, setAjceOut] = useState(false);
  const [arcadeIn, setArcadeIn] = useState(false);
  const [welcomeIn, setWelcomeIn] = useState(false);
  const [appReady, setAppReady] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onAppReady();
      onDone();
      return;
    }

    const timers = [
      setTimeout(() => setAjceIn(true), 50),
      setTimeout(() => setAjceOut(true), 1250),   // AJCE starts dissolving
      setTimeout(() => setArcadeIn(true), 2250),   // 150ms overlap — Arcade appears before AJCE is fully gone
      setTimeout(() => setWelcomeIn(true), 3100),   // Welcome writes after Arcade settles
      setTimeout(() => { setAppReady(true); onAppReady(); }, 4400),
      setTimeout(() => { setIntroDone(true); onDone(); }, 5050),
    ];

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── AJCE derived state ─────────────────────────────────────────────────
  // Before ajceIn: hidden below. While ajceIn && !ajceOut: visible. After ajceOut: drifts up.
  const ajceOpacity = ajceIn && !ajceOut ? 1 : 0;
  const ajceY = !ajceIn ? 10 : ajceOut ? -8 : 0;
  const ajceScale = !ajceIn ? 0.988 : ajceOut ? 0.994 : 1;
  // Use 1.2s for the dissolve, 0.7s for fade-in, instant for other states
  const ajceDur = ajceOut ? 1.2 : ajceIn ? 0.7 : 0;

  // ── Arcade derived state ───────────────────────────────────────────────
  const arcadeOpacity = arcadeIn && !appReady ? 1 : 0;
  const arcadeY = !arcadeIn ? 8 : appReady ? -6 : 0;
  const arcadeScale = !arcadeIn ? 0.992 : appReady ? 0.996 : 1;
  const arcadeDur = appReady ? 0.55 : arcadeIn ? 0.75 : 0;

  // ── Container ─────────────────────────────────────────────────────────
  const containerOpacity = introDone ? 0 : 1;

  return (
    <motion.div
      animate={{ opacity: containerOpacity }}
      transition={{ duration: 0.35, ease: "linear" }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        userSelect: "none",
        background:
          "radial-gradient(ellipse 90% 70% at 50% 42%, #f6f6f6 0%, #ffffff 65%)",
      }}
    >
      {/* ── Scene 1 — AJCE Identity ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: ajceOpacity, y: ajceY, scale: ajceScale }}
        transition={{ duration: ajceDur, ease: EASE }}
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          willChange: "transform, opacity",
        }}
      >
        <img
          src="/amaljyothi-logo.svg"
          alt="Amal Jyothi College of Engineering"
          style={{
            width: 126,
            height: 126,
            objectFit: "contain",
            display: "block",
            filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.06))",
          }}
        />
        <img
          src="/amaljyothi-typo.svg"
          alt="Amal Jyothi"
          style={{
            width: "min(460px, 84vw)",
            height: "auto",
            objectFit: "contain",
            display: "block",
            filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.04))",
          }}
        />
      </motion.div>

      {/* ── Scene 2 — Arcade Identity ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: arcadeOpacity, y: arcadeY, scale: arcadeScale }}
        transition={{ duration: arcadeDur, ease: EASE }}
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          willChange: "transform, opacity",
        }}
      >
        {/* Arcade logo */}
        <img
          src="/arcade.svg"
          alt="Arcade"
          style={{
            width: "min(268px, 62vw)",
            height: "auto",
            objectFit: "contain",
            display: "block",
            filter: "drop-shadow(0 6px 28px rgba(0,0,0,0.07))",
          }}
        />



        {/* ── Welcome — Amira Grace, minimal fade-in ─────────────────── */}
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: welcomeIn ? 1 : 0, y: welcomeIn ? 0 : 6 }}
          transition={{ duration: 0.9, ease: EASE }}
          style={{
            display: "block",
            fontFamily: '"Amira Grace", cursive',
            fontSize: "clamp(46px, 6vw, 62px)",
            lineHeight: 1.15,
            color: "#205CA8",
            whiteSpace: "nowrap",
            letterSpacing: "0.02em",
            marginTop: 10,
          }}
        >
          welcome
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
