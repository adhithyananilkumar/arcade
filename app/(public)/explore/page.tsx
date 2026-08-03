"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import GradientText from "@/components/landing/GradientText";
import Link from "next/link";
import { ArcCarousel } from "../../../apps/public/components/ui/ArcCarousel";
import "@/apps/public/landing.css";

import { 
  CATEGORY_DATA, 
  categoriesList, 
  CategoryWatermark, 
  CategoryHeaderIllustration, 
  WebinarCardHeader 
} from "./data";
import { ExploreCategoryGrid } from "./ExploreCategoryGrid";

function CoursesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Route selector
  const initialCategory = searchParams.get("category");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<"courses" | "bootcamps" | "webinars" | "departments" | "community">("courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 8;

  // Ref for the content section — used to auto-scroll into view on tab switch
  const contentRef = React.useRef<HTMLDivElement>(null);

  const handleTabSwitch = (tab: "courses" | "bootcamps" | "webinars" | "departments" | "community") => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery("");
    // Small delay lets React flush the state before scrolling
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  useEffect(() => {
    if (initialCategory && categoriesList.includes(initialCategory)) {
      router.push(`/courses?category=${encodeURIComponent(initialCategory)}`);
    } else {
      setActiveCategory(null);
    }
  }, [initialCategory, router]);

  const handleCategorySwitch = (category: string) => {
    setActiveCategory(category);
    if (activeTab === "courses") {
      router.push(`/courses?category=${encodeURIComponent(category)}`);
    } else if (activeTab === "bootcamps") {
      router.push(`/bootcamps?category=${encodeURIComponent(category)}`);
    } else if (activeTab === "webinars") {
      router.push(`/webinars?category=${encodeURIComponent(category)}`);
    } else if (activeTab === "departments") {
      router.push(`/departments?category=${encodeURIComponent(category)}`);
    } else if (activeTab === "community") {
      router.push(`/community?category=${encodeURIComponent(category)}`);
    }
  };

  const handleGoBackToExplore = () => {
    setActiveCategory(null);
    router.push("/explore");
  };

  // RENDER OPTION B: Main Explore Hub Dashboard
  return (
    <div
      style={{
        background: `
          radial-gradient(ellipse 55% 40% at 8% 12%, rgba(59, 130, 246, 0.16) 0%, transparent 60%),
          radial-gradient(ellipse 50% 35% at 92% 24%, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
          radial-gradient(ellipse 45% 35% at 5% 52%, rgba(155, 93, 229, 0.08) 0%, transparent 60%),
          radial-gradient(ellipse 50% 35% at 6% 76%, rgba(14, 165, 233, 0.11) 0%, transparent 60%),
          radial-gradient(ellipse 50% 35% at 94% 76%, rgba(14, 165, 233, 0.11) 0%, transparent 60%),
          radial-gradient(ellipse 40% 30% at 48% 94%, rgba(249, 200, 70, 0.07) 0%, transparent 60%),
          linear-gradient(to bottom, #E9EEFB 0%, #F8FAFC 25%, #FFFFFF 50%, #FFFFFF 75%, #EAF7EF 100%)
        `,
        minHeight: "100vh",
        color: "#000000",
        fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
      }}
    >
      <style>{`
        .lp-category-card {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .lp-category-card:hover {
          transform: translateY(-8px);
          border-color: var(--hover-color) !important;
          box-shadow: 0 20px 30px -10px var(--hover-shadow) !important;
        }
        .lp-category-card:hover .lp-category-card-arrow {
          stroke: var(--hover-color) !important;
          transform: translateX(6px);
        }
        .lp-bootcamp-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 32px -8px rgba(75, 97, 137, 0.2);
          border-left-color: #2563EB !important;
        }
        .lp-webinar-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.12);
        }
        @keyframes tabContentEnter {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tab-content-panel {
          animation: tabContentEnter 0.38s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>

      {/* Spacer to prevent banner content/diagonal background from sliding under the fixed header navigation bar */}
      <div style={{ height: "64px" }} />

      {/* Neobrutalist Typography Header */}
      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "80px 48px 24px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            fontWeight: 900,
            color: "#1A1A1A",
            letterSpacing: "-0.04em",
            marginBottom: "12px",
            lineHeight: "1.15",
            fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
          }}
        >
          EXPLORE{" "}
          <span
            style={{
              position: "relative",
              display: "inline-block",
              padding: "4px 16px",
              border: "2px solid #4B6189",
              borderRadius: "6px",
              marginLeft: "8px",
              background: "#FFFFFF"
            }}
          >
            <GradientText
              colors={['#2563EB', '#0EA5E9', '#06B6D4', '#10B981', '#4F46E5', '#2563EB']}
              animationSpeed={8}
            >
              Arcade Hub
            </GradientText>
            {/* Top-left handle stick and dot */}
            <span style={{ position: "absolute", left: "-2px", top: "-14px", width: "2px", height: "14px", background: "#4B6189" }}>
              <span style={{ position: "absolute", left: "-3px", top: "-6px", width: "8px", height: "8px", borderRadius: "50%", background: "#4B6189" }} />
            </span>
            {/* Bottom-right handle stick and dot */}
            <span style={{ position: "absolute", right: "-2px", bottom: "-14px", width: "2px", height: "14px", background: "#4B6189" }}>
              <span style={{ position: "absolute", right: "-3px", bottom: "-6px", width: "8px", height: "8px", borderRadius: "50%", background: "#4B6189" }} />
            </span>
            {/* Top-right corner handle */}
            <span style={{ position: "absolute", right: "-4px", top: "-4px", width: "8px", height: "8px", border: "1px solid #FFFFFF", background: "#4B6189" }} />
            {/* Bottom-left corner handle */}
            <span style={{ position: "absolute", left: "-4px", bottom: "-4px", width: "8px", height: "8px", border: "1px solid #FFFFFF", background: "#4B6189" }} />
          </span>
        </h1>
        <p
          style={{
            fontSize: "0.92rem",
            color: "#4B5563",
            maxWidth: "600px",
            margin: "18px auto 0",
            lineHeight: "1.6",
            textAlign: "center",
            fontWeight: 500
          }}
        >
          Access self-paced categories, practical masterclass bootcamps, and live expert webinars, all customized in one unified interface.
        </p>
      </div>

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 48px 100px" }}>

        {/* Tab Selection Cards - 3D Arc Coverflow */}
        <div style={{ maxWidth: "1400px", margin: "32px auto 0", padding: "0 16px", overflow: "visible" }}>
          <ArcCarousel 
            cardWidth={320}
            cardHeight={320}
            xSpacing={220}
            yFalloff={35}
            scaleFalloff={0.12}
            rotateZFactor={6}
            opacityFalloff={0.2}
            onActiveIndexChange={(idx: number) => {
              const keys = ["courses", "bootcamps", "webinars", "departments", "community"] as const;
              handleTabSwitch(keys[idx] as any);
            }}
            items={[
              <React.Fragment key="courses">
                {/* Card: Courses */}
          <motion.div
            onClick={() => handleTabSwitch("courses")}
            whileHover={{ y: -6, scale: 1.02, opacity: 1 }}
            animate={{
              scale: activeTab === "courses" ? 1.03 : 0.97,
              opacity: activeTab === "courses" ? 1 : 0.7,
              rotate: activeTab === "courses" ? -1.5 : 0
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              position: "relative",
              background: activeTab === "courses" ? "#EFF6FF" : "#FFFFFF",
              border: activeTab === "courses" ? "3px solid #3B82F6" : "2px solid #E5E7EB",
              borderRadius: "20px",
              padding: "24px 20px",
              cursor: "pointer",
              textAlign: "left",
              boxShadow: activeTab === "courses" ? "8px 8px 0px #3B82F6" : "2px 2px 0px rgba(0, 0, 0, 0.05)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "260px",
              zIndex: activeTab === "courses" ? 3 : 1,
              transition: "background-color 0.3s, border-color 0.3s, box-shadow 0.3s"
            }}
          >
            <div>
              <div style={{
                fontSize: "0.68rem",
                fontWeight: "800",
                color: activeTab === "courses" ? "#2563EB" : "#6B7280",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "10px",
                transition: "color 0.3s"
              }}>
                01 // SELF-PACED
              </div>
              <h3 style={{
                fontSize: "1.15rem",
                fontWeight: "800",
                color: activeTab === "courses" ? "#1E40AF" : "#1A1A1A",
                margin: "0 0 8px",
                lineHeight: "1.2",
                transition: "color 0.3s"
              }}>
                Self-Paced Courses
              </h3>
              <p style={{ fontSize: "0.78rem", color: "#4B5563", margin: "0 0 16px", lineHeight: "1.5" }}>
                Explore available categories and select department tracks to see individual courses.
              </p>
            </div>
            {/* Minimalist Sketch Illustration */}
            <motion.div
              animate={{
                scale: activeTab === "courses" ? 1.15 : 1,
                y: activeTab === "courses" ? -5 : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              style={{ width: "100%", height: "65px" }}
            >
              <svg viewBox="0 0 160 120" width="100%" height="65" style={{ display: "block", margin: "0 auto", overflow: "visible" }}>
                <rect x="30" y="30" width="100" height="60" rx="8" fill="none" stroke={activeTab === "courses" ? "#3B82F6" : "#1A1A1A"} strokeWidth="2" style={{ transition: "stroke 0.3s" }} />
                <rect x="36" y="36" width="88" height="48" rx="4" fill={activeTab === "courses" ? "rgba(59, 130, 246, 0.05)" : "none"} stroke={activeTab === "courses" ? "#3B82F6" : "#1A1A1A"} strokeWidth="1.5" style={{ transition: "stroke 0.3s, fill 0.3s" }} />
                <path d="M 16,98 L 144,98 L 132,106 L 28,106 Z" fill="none" stroke={activeTab === "courses" ? "#3B82F6" : "#1A1A1A"} strokeWidth="2" strokeLinejoin="round" style={{ transition: "stroke 0.3s" }} />
                <rect x="68" y="100" width="24" height="4" rx="1" fill="none" stroke={activeTab === "courses" ? "#3B82F6" : "#1A1A1A"} strokeWidth="1.5" style={{ transition: "stroke 0.3s" }} />
                <motion.line x1="44" y1="44" x2="72" y2="44" stroke={activeTab === "courses" ? "#3B82F6" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" animate={activeTab === "courses" ? { x: [0, 4, 0] } : {}} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} style={{ transition: "stroke 0.3s" }} />
                <motion.line x1="44" y1="52" x2="88" y2="52" stroke={activeTab === "courses" ? "#3B82F6" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" animate={activeTab === "courses" ? { x: [0, 6, -2, 0] } : {}} transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }} style={{ transition: "stroke 0.3s" }} />
                <motion.line x1="44" y1="60" x2="64" y2="60" stroke={activeTab === "courses" ? "#3B82F6" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" animate={activeTab === "courses" ? { x: [0, -3, 3, 0] } : {}} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }} style={{ transition: "stroke 0.3s" }} />
                <motion.line x1="52" y1="68" x2="96" y2="68" stroke={activeTab === "courses" ? "#3B82F6" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" animate={activeTab === "courses" ? { x: [0, 5, 0] } : {}} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} style={{ transition: "stroke 0.3s" }} />
                <motion.line x1="52" y1="76" x2="80" y2="76" stroke={activeTab === "courses" ? "#3B82F6" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" animate={activeTab === "courses" ? { x: [0, -2, 2, 0] } : {}} transition={{ repeat: Infinity, duration: 2.1, ease: "easeInOut" }} style={{ transition: "stroke 0.3s" }} />
                <path d="M 12,28 Q 20,20 18,12" stroke={activeTab === "courses" ? "#3B82F6" : "#4B6189"} strokeWidth="1.5" strokeLinecap="round" fill="none" style={{ transition: "stroke 0.3s" }} />
                <motion.circle cx="140" cy="24" r="3" fill={activeTab === "courses" ? "#3B82F6" : "#4B6189"} animate={activeTab === "courses" ? { scale: [1, 1.4, 1] } : {}} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} style={{ transition: "fill 0.3s" }} />
                <motion.circle cx="148" cy="40" r="1.5" fill={activeTab === "courses" ? "#3B82F6" : "#4B6189"} animate={activeTab === "courses" ? { scale: [1, 1.6, 1] } : {}} transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", delay: 0.3 }} style={{ transition: "fill 0.3s" }} />
              </svg>
            </motion.div>
          </motion.div>
              </React.Fragment>,
              <React.Fragment key="bootcamps">
                {/* Card: Bootcamps */}
          <motion.div
            onClick={() => handleTabSwitch("bootcamps")}
            whileHover={{ y: -6, scale: 1.02, opacity: 1 }}
            animate={{
              scale: activeTab === "bootcamps" ? 1.03 : 0.97,
              opacity: activeTab === "bootcamps" ? 1 : 0.7,
              rotate: activeTab === "bootcamps" ? 0.5 : 0
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              position: "relative",
              background: activeTab === "bootcamps" ? "#F5F3FF" : "#FFFFFF",
              border: activeTab === "bootcamps" ? "3px solid #8B5CF6" : "2px solid #E5E7EB",
              borderRadius: "20px",
              padding: "24px 20px",
              cursor: "pointer",
              textAlign: "left",
              boxShadow: activeTab === "bootcamps" ? "8px 8px 0px #8B5CF6" : "2px 2px 0px rgba(0, 0, 0, 0.05)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "260px",
              zIndex: activeTab === "bootcamps" ? 3 : 1,
              transition: "background-color 0.3s, border-color 0.3s, box-shadow 0.3s"
            }}
          >
            <div>
              <div style={{
                fontSize: "0.68rem",
                fontWeight: "800",
                color: activeTab === "bootcamps" ? "#7C3AED" : "#6B7280",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "10px",
                transition: "color 0.3s"
              }}>
                02 // INTERACTIVE
              </div>
              <h3 style={{
                fontSize: "1.15rem",
                fontWeight: "800",
                color: activeTab === "bootcamps" ? "#5B21B6" : "#1A1A1A",
                margin: "0 0 8px",
                lineHeight: "1.2",
                transition: "color 0.3s"
              }}>
                Workshops & Bootcamps
              </h3>
              <p style={{ fontSize: "0.78rem", color: "#4B5563", margin: "0 0 16px", lineHeight: "1.5" }}>
                Join live, interactive, mentor-led programs designed for technical skill development.
              </p>
            </div>
            {/* Minimalist Sketch Illustration */}
            <motion.div
              animate={{
                scale: activeTab === "bootcamps" ? 1.15 : 1,
                y: activeTab === "bootcamps" ? -5 : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              style={{ width: "100%", height: "65px" }}
            >
              <svg viewBox="0 0 160 120" width="100%" height="65" style={{ display: "block", margin: "0 auto", overflow: "visible" }}>
                <rect x="25" y="85" width="22" height="20" rx="3" fill={activeTab === "bootcamps" ? "rgba(139, 92, 246, 0.05)" : "none"} stroke={activeTab === "bootcamps" ? "#8B5CF6" : "#1A1A1A"} strokeWidth="2" style={{ transition: "stroke 0.3s, fill 0.3s" }} />
                <rect x="47" y="65" width="22" height="40" rx="3" fill={activeTab === "bootcamps" ? "rgba(139, 92, 246, 0.05)" : "none"} stroke={activeTab === "bootcamps" ? "#8B5CF6" : "#1A1A1A"} strokeWidth="2" style={{ transition: "stroke 0.3s, fill 0.3s" }} />
                <rect x="69" y="45" width="22" height="60" rx="3" fill={activeTab === "bootcamps" ? "rgba(139, 92, 246, 0.05)" : "none"} stroke={activeTab === "bootcamps" ? "#8B5CF6" : "#1A1A1A"} strokeWidth="2" style={{ transition: "stroke 0.3s, fill 0.3s" }} />
                <motion.rect x="91" y="25" width="22" height="80" rx="3" fill={activeTab === "bootcamps" ? "rgba(139, 92, 246, 0.05)" : "none"} stroke={activeTab === "bootcamps" ? "#8B5CF6" : "#1A1A1A"} strokeWidth="2" animate={activeTab === "bootcamps" ? { height: [80, 85, 80], y: [25, 20, 25] } : {}} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.3 }} style={{ transition: "stroke 0.3s, fill 0.3s" }} />
                <motion.path d="M 125,25 L 128,31 L 135,32 L 130,36 L 132,43 L 125,39 L 118,43 L 120,36 L 115,32 L 122,31 Z" fill={activeTab === "bootcamps" ? "rgba(139, 92, 246, 0.2)" : "none"} stroke={activeTab === "bootcamps" ? "#8B5CF6" : "#4B6189"} strokeWidth="1.5" strokeLinejoin="round" animate={activeTab === "bootcamps" ? { scale: [1, 1.25, 1], rotate: [0, 15, -15, 0] } : {}} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} style={{ transformOrigin: "125px 34px", transition: "stroke 0.3s, fill 0.3s" }} />
                <circle cx="58" cy="28" r="7" fill="none" stroke={activeTab === "bootcamps" ? "#8B5CF6" : "#1A1A1A"} strokeWidth="2" style={{ transition: "stroke 0.3s" }} />
                <path d="M 58,35 C 58,45 52,50 62,55" fill="none" stroke={activeTab === "bootcamps" ? "#8B5CF6" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />
                <path d="M 54,42 Q 68,36 82,30" fill="none" stroke={activeTab === "bootcamps" ? "#8B5CF6" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />
                <path d="M 82,30 L 102,15 Q 104,13 107,16 L 109,19 Q 111,22 108,24 L 88,39 Z" fill="none" stroke={activeTab === "bootcamps" ? "#8B5CF6" : "#1A1A1A"} strokeWidth="1.5" strokeLinejoin="round" style={{ transition: "stroke 0.3s" }} />
                <path d="M 102,15 L 108,24" stroke={activeTab === "bootcamps" ? "#8B5CF6" : "#1A1A1A"} strokeWidth="1.5" style={{ transition: "stroke 0.3s" }} />
                <path d="M 55,50 L 48,65" stroke={activeTab === "bootcamps" ? "#8B5CF6" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />
                <path d="M 60,51 L 69,45" stroke={activeTab === "bootcamps" ? "#8B5CF6" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />
              </svg>
            </motion.div>
          </motion.div>
              </React.Fragment>,
              <React.Fragment key="webinars">
                {/* Card: Webinars */}
          <motion.div
            onClick={() => handleTabSwitch("webinars")}
            whileHover={{ y: -6, scale: 1.02, opacity: 1 }}
            animate={{
              scale: activeTab === "webinars" ? 1.03 : 0.97,
              opacity: activeTab === "webinars" ? 1 : 0.7,
              rotate: activeTab === "webinars" ? 1.5 : 0
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              position: "relative",
              background: activeTab === "webinars" ? "#EFF4FC" : "#FFFFFF",
              border: activeTab === "webinars" ? "3px solid #0A1931" : "2px solid #E5E7EB",
              borderRadius: "20px",
              padding: "24px 20px",
              cursor: "pointer",
              textAlign: "left",
              boxShadow: activeTab === "webinars" ? "8px 8px 0px #0A1931" : "2px 2px 0px rgba(0, 0, 0, 0.05)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "260px",
              zIndex: activeTab === "webinars" ? 3 : 1,
              transition: "background-color 0.3s, border-color 0.3s, box-shadow 0.3s"
            }}
          >
            <div>
              <div style={{
                fontSize: "0.68rem",
                fontWeight: "800",
                color: activeTab === "webinars" ? "#1E3A8A" : "#6B7280",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "10px",
                transition: "color 0.3s"
              }}>
                03 // EXPERT LED
              </div>
              <h3 style={{
                fontSize: "1.15rem",
                fontWeight: "800",
                color: activeTab === "webinars" ? "#0F172A" : "#1A1A1A",
                margin: "0 0 8px",
                lineHeight: "1.2",
                transition: "color 0.3s"
              }}>
                Expert Webinars
              </h3>
              <p style={{ fontSize: "0.78rem", color: "#4B5563", margin: "0 0 16px", lineHeight: "1.5" }}>
                Watch recorded sessions or register for live-streamed presentations.
              </p>
            </div>
            {/* Minimalist Sketch Illustration */}
            <motion.div
              animate={{
                scale: activeTab === "webinars" ? 1.15 : 1,
                y: activeTab === "webinars" ? -5 : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              style={{ width: "100%", height: "65px" }}
            >
              <svg viewBox="0 0 160 120" width="100%" height="65" style={{ display: "block", margin: "0 auto", overflow: "visible" }}>
                <motion.circle cx="45" cy="40" r="7" fill={activeTab === "webinars" ? "rgba(10, 25, 49, 0.05)" : "none"} stroke={activeTab === "webinars" ? "#0A1931" : "#1A1A1A"} strokeWidth="2" animate={activeTab === "webinars" ? { y: [0, -3, 0] } : {}} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} style={{ transition: "stroke 0.3s, fill 0.3s" }} />
                <path d="M 45,47 L 45,75" stroke={activeTab === "webinars" ? "#0A1931" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />
                <path d="M 45,55 L 30,65" stroke={activeTab === "webinars" ? "#0A1931" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />
                <path d="M 45,52 L 65,38" stroke={activeTab === "webinars" ? "#0A1931" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />
                <path d="M 45,75 L 35,95" stroke={activeTab === "webinars" ? "#0A1931" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />
                <path d="M 45,75 L 55,95" stroke={activeTab === "webinars" ? "#0A1931" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />

                <motion.circle cx="115" cy="40" r="7" fill={activeTab === "webinars" ? "rgba(10, 25, 49, 0.05)" : "none"} stroke={activeTab === "webinars" ? "#0A1931" : "#1A1A1A"} strokeWidth="2" animate={activeTab === "webinars" ? { y: [0, -3, 0] } : {}} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.3 }} style={{ transition: "stroke 0.3s, fill 0.3s" }} />
                <path d="M 115,47 L 115,75" stroke={activeTab === "webinars" ? "#0A1931" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />
                <path d="M 115,52 L 95,38" stroke={activeTab === "webinars" ? "#0A1931" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />
                <path d="M 115,55 L 130,65" stroke={activeTab === "webinars" ? "#0A1931" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />
                <path d="M 115,75 L 105,95" stroke={activeTab === "webinars" ? "#0A1931" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />
                <path d="M 115,75 L 125,95" stroke={activeTab === "webinars" ? "#0A1931" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />

                <motion.path d="M 80,30 L 80,24" stroke={activeTab === "webinars" ? "#0A1931" : "#4B6189"} strokeWidth="2" strokeLinecap="round" animate={activeTab === "webinars" ? { scaleY: [1, 1.5, 1], y: [0, -2, 0] } : {}} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} style={{ transformOrigin: "80px 30px", transition: "stroke 0.3s" }} />
                <motion.path d="M 75,34 L 69,30" stroke={activeTab === "webinars" ? "#0A1931" : "#4B6189"} strokeWidth="2" strokeLinecap="round" animate={activeTab === "webinars" ? { x: [0, -2, 0], y: [0, -1, 0] } : {}} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} style={{ transition: "stroke 0.3s" }} />
                <motion.path d="M 85,34 L 91,30" stroke={activeTab === "webinars" ? "#0A1931" : "#4B6189"} strokeWidth="2" strokeLinecap="round" animate={activeTab === "webinars" ? { x: [0, 2, 0], y: [0, -1, 0] } : {}} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} style={{ transition: "stroke 0.3s" }} />
              </svg>
            </motion.div>
          </motion.div>
              </React.Fragment>,
              <React.Fragment key="departments">
                {/* Card: Departments */}
          <motion.div
            onClick={() => handleTabSwitch("departments" as any)}
            whileHover={{ y: -6, scale: 1.02, opacity: 1 }}
            animate={{
              scale: activeTab === ("departments" as any) ? 1.03 : 0.97,
              opacity: activeTab === ("departments" as any) ? 1 : 0.7,
              rotate: activeTab === ("departments" as any) ? -0.5 : 0
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              position: "relative", background: activeTab === ("departments" as any) ? "#ECFDF5" : "#FFFFFF",
              border: activeTab === ("departments" as any) ? "3px solid #10B981" : "2px solid #E5E7EB",
              borderRadius: "20px",
              padding: "24px 20px",
              cursor: "pointer",
              textAlign: "left",
              boxShadow: activeTab === ("departments" as any) ? "8px 8px 0px #10B981" : "2px 2px 0px rgba(0, 0, 0, 0.05)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "260px",
              zIndex: activeTab === ("departments" as any) ? 3 : 1,
              transition: "background-color 0.3s, border-color 0.3s, box-shadow 0.3s"
            }}
          >
            <div>
              <div style={{
                fontSize: "0.68rem",
                fontWeight: "800",
                color: activeTab === ("departments" as any) ? "#047857" : "#6B7280",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "10px",
                transition: "color 0.3s"
              }}>
                04 // DEPARTMENTS
              </div>
              <h3 style={{
                fontSize: "1.15rem",
                fontWeight: "800",
                color: activeTab === ("departments" as any) ? "#064E3B" : "#1A1A1A",
                margin: "0 0 8px",
                lineHeight: "1.2",
                transition: "color 0.3s"
              }}>
                Academic Departments
              </h3>
              <p style={{ fontSize: "0.78rem", color: "#4B5563", margin: "0 0 16px", lineHeight: "1.5" }}>
                Explore specialized knowledge curated by top university departments.
              </p>
            </div>
            {/* Minimalist Sketch Illustration */}
            <motion.div
              animate={{
                scale: activeTab === ("departments" as any) ? 1.15 : 1,
                y: activeTab === ("departments" as any) ? -5 : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              style={{ width: "100%", height: "65px" }}
            >
              <svg viewBox="0 0 160 120" width="100%" height="65" style={{ display: "block", margin: "0 auto", overflow: "visible" }}>
                <path d="M 30,80 Q 80,40 130,80" fill="none" stroke={activeTab === ("departments" as any) ? "#10B981" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" strokeDasharray="6 4" style={{ transition: "stroke 0.3s" }} />
                <motion.circle cx="80" cy="60" r="8" fill={activeTab === ("departments" as any) ? "rgba(16, 185, 129, 0.2)" : "none"} stroke={activeTab === ("departments" as any) ? "#10B981" : "#1A1A1A"} strokeWidth="2" animate={activeTab === ("departments" as any) ? { scale: [1, 1.3, 1] } : {}} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.6 }} style={{ transition: "stroke 0.3s, fill 0.3s" }} />
                <path d="M 30,80 L 26,76 M 30,80 L 34,76 M 30,80 L 30,86" stroke={activeTab === ("departments" as any) ? "#10B981" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke 0.3s" }} />
              </svg>
            </motion.div>
          </motion.div>
              </React.Fragment>,
              <React.Fragment key="community">
                {/* Card: Community */}
          <motion.div
            onClick={() => handleTabSwitch("community" as any)}
            whileHover={{ y: -6, scale: 1.02, opacity: 1 }}
            animate={{
              scale: activeTab === ("community" as any) ? 1.03 : 0.97,
              opacity: activeTab === ("community" as any) ? 1 : 0.7,
              rotate: activeTab === ("community" as any) ? 1 : 0
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              position: "relative", background: activeTab === ("community" as any) ? "#FFF7ED" : "#FFFFFF",
              border: activeTab === ("community" as any) ? "3px solid #F97316" : "2px solid #E5E7EB",
              borderRadius: "20px",
              padding: "24px 20px",
              cursor: "pointer",
              textAlign: "left",
              boxShadow: activeTab === ("community" as any) ? "8px 8px 0px #F97316" : "2px 2px 0px rgba(0, 0, 0, 0.05)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "260px",
              zIndex: activeTab === ("community" as any) ? 3 : 1,
              transition: "background-color 0.3s, border-color 0.3s, box-shadow 0.3s"
            }}
          >
            <div>
              <div style={{
                fontSize: "0.68rem",
                fontWeight: "800",
                color: activeTab === ("community" as any) ? "#C2410C" : "#6B7280",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "10px",
                transition: "color 0.3s"
              }}>
                05 // COLLABORATE
              </div>
              <h3 style={{
                fontSize: "1.15rem",
                fontWeight: "800",
                color: activeTab === ("community" as any) ? "#7C2D12" : "#1A1A1A",
                margin: "0 0 8px",
                lineHeight: "1.2",
                transition: "color 0.3s"
              }}>
                Community Hub
              </h3>
              <p style={{ fontSize: "0.78rem", color: "#4B5563", margin: "0 0 16px", lineHeight: "1.5" }}>
                Connect with peers, share resources, and join study groups online.
              </p>
            </div>
            {/* Minimalist Sketch Illustration */}
            <motion.div
              animate={{
                scale: activeTab === ("community" as any) ? 1.15 : 1,
                y: activeTab === ("community" as any) ? -5 : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              style={{ width: "100%", height: "65px" }}
            >
              <svg viewBox="0 0 160 120" width="100%" height="65" style={{ display: "block", margin: "0 auto", overflow: "visible" }}>
                <path d="M 40,60 L 80,20 L 120,60" fill="none" stroke={activeTab === ("community" as any) ? "#F97316" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.3s" }} />
                <path d="M 40,60 L 40,100 L 120,100 L 120,60" fill="none" stroke={activeTab === ("community" as any) ? "#F97316" : "#1A1A1A"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.3s" }} />
                <rect x="70" y="70" width="20" height="30" fill={activeTab === ("community" as any) ? "rgba(249, 115, 22, 0.2)" : "none"} stroke={activeTab === ("community" as any) ? "#F97316" : "#1A1A1A"} strokeWidth="2" style={{ transition: "stroke 0.3s, fill 0.3s" }} />
              </svg>
            </motion.div>
          </motion.div>
              </React.Fragment>
            ]}
          />
        </div>

        {/* Full-Width Search and Filters Row */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            width: "100%",
            background: "#FFFFFF",
            border: isSearchFocused ? "2px solid #4B6189" : "1px solid #E5E7EB",
            borderRadius: "16px",
            padding: isSearchFocused ? "14px 22px" : "15px 23px",
            marginBottom: "40px",
            boxShadow: isSearchFocused
              ? "0 10px 25px -5px rgba(59, 130, 246, 0.15), 0 0 0 4px rgba(59, 130, 246, 0.1)"
              : "0 4px 12px rgba(0, 0, 0, 0.02)",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            cursor: "text"
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isSearchFocused ? "#4B6189" : "#9CA3AF"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transition: "stroke 0.3s ease" }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder={`Search available ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            suppressHydrationWarning
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: "1rem",
              fontWeight: "500",
              color: "#111827",
              background: "transparent"
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9CA3AF",
                borderRadius: "50%",
                transition: "background 0.2s, color 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#F3F4F6";
                e.currentTarget.style.color = "#1F2937";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.color = "#9CA3AF";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Tab content panels — ref used for auto-scroll on tab switch */}
        <div
          ref={contentRef}
          style={{ scrollMarginTop: "100px" }}
        >
          <ExploreCategoryGrid
            activeTab={activeTab}
            searchQuery={searchQuery}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            categoriesPerPage={categoriesPerPage}
            handleCategorySwitch={handleCategorySwitch}
            contentRef={contentRef}
          />
        </div>{/* end contentRef wrapper */}
      </main>
    </div>
  );
}

export default function ExploreHubPage() {
  return (
    <Suspense fallback={<div style={{ padding: "100px", textAlign: "center", color: "#6B7280" }}>Loading explore hub...</div>}>
      <CoursesContent />
    </Suspense>
  );
}
