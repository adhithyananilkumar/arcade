"use client";

import { useRef } from "react";
import Link from "next/link";
import Lottie from "lottie-react";
import { useAuthStore } from "@/infrastructure/auth/auth.store";
import HeroNav from "@/apps/public/components/landing/HeroNav";
import Footer from "@/apps/public/components/landing/Footer";
import notFoundAnimation from "@/public/404 page not found.json";

// This is the global not-found page — it sits outside both the (public) and (authenticated)
// route groups, so neither PublicShell nor the authenticated app shell wrap it automatically.
// A logged-in user landing here (e.g. a stale/broken link from inside the app) doesn't need
// the marketing nav or footer — just a way back in. A guest gets the normal public chrome.
export default function NotFound() {
  const status = useAuthStore((state) => state.status);
  const isAuthenticated = status === "authenticated";
  const lottieRef = useRef<any>(null);

  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthenticated && <HeroNav />}

      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 py-12 px-4 text-slate-600">
        <div className="w-64 h-64 md:w-96 md:h-96 shrink-0">
          <Lottie
            lottieRef={lottieRef}
            animationData={notFoundAnimation}
            loop={false}
            onDOMLoaded={() => {
              if (lottieRef.current) {
                lottieRef.current.setSpeed(0.5);
              }
            }}
          />
        </div>

        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className="text-7xl md:text-9xl font-black text-slate-800 tracking-tight leading-none">404</h1>
          <h2 className="text-2xl md:text-4xl font-bold text-slate-600 mt-2 md:mt-4">Page not found</h2>
          <p className="mt-4 text-slate-500 font-medium max-w-sm">
            The page you're looking for doesn't exist or might have been moved.
          </p>
          <Link
            href="/"
            className="mt-8 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm active:scale-95"
          >
            Back to Home
          </Link>
        </div>
      </div>

      {!isAuthenticated && <Footer />}
    </div>
  );
}
