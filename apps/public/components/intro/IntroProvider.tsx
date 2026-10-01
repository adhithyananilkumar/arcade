"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IntroScreen } from "./IntroScreen";

const EASE = [0.22, 1, 0.36, 1] as const;

// The AJCE / Arcade welcome intro plays once per browser per 24 hours. The timestamp lives in
// localStorage, so clearing site data / cache (or a fresh browser) brings the intro back.
const INTRO_SEEN_KEY = "arcade:intro:seenAt";
const INTRO_TTL_MS = 24 * 60 * 60 * 1000;

/** True when the intro already played within the last 24h. Storage failures => play it. */
function introSeenRecently(): boolean {
  try {
    const seenAt = Number(window.localStorage.getItem(INTRO_SEEN_KEY));
    const age = Date.now() - seenAt;
    // age < 0 means a clock change or a tampered value: treat as unseen rather than
    // suppressing the intro until some far-future date.
    return Number.isFinite(seenAt) && seenAt > 0 && age >= 0 && age < INTRO_TTL_MS;
  } catch {
    return false;
  }
}

function markIntroSeen(): void {
  try {
    window.localStorage.setItem(INTRO_SEEN_KEY, String(Date.now()));
  } catch {
    // Private mode / blocked storage: the intro simply plays again next visit.
  }
}

// ── Context: lets layout siblings know whether the intro is still running ──
interface IntroContextValue {
  introActive: boolean;
}
const IntroContext = createContext<IntroContextValue>({ introActive: false });
export const useIntroContext = () => useContext(IntroContext);

interface IntroProviderProps {
  children: React.ReactNode;
  /** When false, skips the intro entirely and renders children immediately */
  enabled?: boolean;
}

export function IntroProvider({ children, enabled = true }: IntroProviderProps) {
  const [mounted, setMounted] = useState(false);
  // showIntro: intro overlay is in the DOM
  const [showIntro, setShowIntro] = useState(true);
  // showApp: app content is rendered (fades in while intro is still visible)
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    if (introSeenRecently()) {
      // Already welcomed in the last 24h: go straight to the page, no intro flash.
      setShowIntro(false);
      setShowApp(true);
    } else {
      // Stamp at start, not at the end: a reload mid-intro must not replay it.
      markIntroSeen();
      setShowIntro(true);
      setShowApp(false);
    }
    setMounted(true);
  }, []);

  // We no longer lock the scrollbar during the intro.
  // By leaving the scrollbar naturally visible from the very first frame,
  // the viewport width remains constant. When the intro finishes,
  // there is no scrollbar popping in, which means zero layout shift (jerk)
  // for both the intro overlay and the underlying page content.

  // Prevent SSR flash — show clean blank intro background until client hydrates
  if (!mounted) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse 90% 70% at 50% 42%, #f6f6f6 0%, #ffffff 65%)",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      />
    );
  }

  return (
    <IntroContext.Provider value={{ introActive: showIntro }}>
      {/* App renders first — behind the intro overlay */}
      {showApp && (
        <motion.div
          key="app"
          initial={{ opacity: 0, scale: 0.995 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          style={{ minHeight: "100vh" }}
        >
          {children}
        </motion.div>
      )}

      {/* Intro overlay — position: fixed on top, unmounted only after its own animation ends */}
      {showIntro && (
        <IntroScreen
          onAppReady={() => setShowApp(true)}
          onDone={() => setShowIntro(false)}
        />
      )}
    </IntroContext.Provider>
  );
}
