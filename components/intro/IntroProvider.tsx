"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IntroScreen } from "./IntroScreen";

const EASE = [0.22, 1, 0.36, 1] as const;

interface IntroProviderProps {
  children: React.ReactNode;
}

export function IntroProvider({ children }: IntroProviderProps) {
  const [mounted, setMounted] = useState(false);
  // showIntro: intro overlay is in the DOM
  const [showIntro, setShowIntro] = useState(true);
  // showApp: app content is rendered (fades in while intro is still visible)
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    setMounted(true);
    // DEV: always show intro on every reload
    setShowIntro(true);
    setShowApp(false);
  }, []);

  // Prevent SSR flash — show plain white until client hydrates
  if (!mounted) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse 90% 70% at 50% 42%, #f6f6f6 0%, #ffffff 65%)",
        }}
      />
    );
  }

  return (
    <>
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
    </>
  );
}
