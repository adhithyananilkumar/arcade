"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { courseRoutes } from '@/shared/routes/content.routes';
import BorderGlow from "./BorderGlow";
import { gsap } from "gsap";
import { useAuthStore } from '@/infrastructure/auth/auth.store';

import { getCourseChannel, type AttributableCourse, type CardChannel } from "./courseAttribution";
import ExploreEmptyState from "./ExploreEmptyState";
import { UnifiedContentCard } from "@/shared/design-system/ui/cards";
import { ContentCardsGridSkeleton } from "./ContentCardsGridSkeleton";

function hexToRgbStr(hex: string): string {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

function hexToHslStr(hex: string): string {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)} ${Math.round(l * 100)}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .trim();
}

interface EnrichedCourse {
  title: string;
  duration: string;
  level: string;
  desc: string;
  rating: number;
  reviewsCount: number;
  categoryTag: string;
  channel: CardChannel | null;
}

function getEnrichedCourse(course: { title: string; duration: string; level: string; desc: string; category?: string } & AttributableCourse, index: number, categoryName: string): EnrichedCourse {
  // Ratings come from the reviews API via `courseStats` at the call site; an unrated course
  // reads as unrated rather than borrowing a plausible-looking number.
  const rating = 0;
  const reviewsCount = 0;

  const effectiveCategory = (course.category && course.category.toLowerCase() !== "all") ? course.category : categoryName;
  let categoryTag = effectiveCategory;
  if (effectiveCategory === "Computer Science") {
    const tags = ["Programming", "Algorithms", "Databases", "Software Engineering"];
    categoryTag = tags[index % tags.length];
  } else if (effectiveCategory === "Information Technology") {
    const tags = ["Networking", "Cybersecurity", "Cloud Computing", "Systems"];
    categoryTag = tags[index % tags.length];
  } else if (effectiveCategory === "Business & Management") {
    const tags = ["Entrepreneurship", "Marketing", "Finance", "Product"];
    categoryTag = tags[index % tags.length];
  } else if (effectiveCategory === "Civil & Mechanical") {
    const tags = ["CAD Design", "Fluid Mechanics", "Structural", "Robotics"];
    categoryTag = tags[index % tags.length];
  } else if (effectiveCategory === "Basic Sciences") {
    const tags = ["Mathematics", "Physics", "Chemistry", "Biology"];
    categoryTag = tags[index % tags.length];
  } else if (effectiveCategory === "Humanities & Languages") {
    const tags = ["Literature", "Linguistics", "Philosophy", "History"];
    categoryTag = tags[index % tags.length];
  } else if (effectiveCategory === "Personal Development") {
    const tags = ["Productivity", "Leadership", "Communication", "Mindfulness"];
    categoryTag = tags[index % tags.length];
  } else if (effectiveCategory.toLowerCase() === "all") {
    categoryTag = course.category || "General";
  }

  const channel = getCourseChannel(course as AttributableCourse);

  return {
    ...course,
    rating,
    reviewsCount,
    categoryTag,
    channel
  };
}

function getCourseGlyph(title: string, index: number, color: string): React.ReactNode {
  const norm = title.toLowerCase();

  if (norm.includes("database") || norm.includes("sql") || norm.includes("query")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
        <rect x="4" y="3" width="16" height="12" rx="1.5" />
        <line x1="9" y1="21" x2="16" y2="21" />
        <line x1="12" y1="15" x2="12" y2="21" />
      </svg>
    );
  }
  if (norm.includes("structure") || norm.includes("algorithm")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
        <path d="M4 6h16M4 12h10M4 18h13" />
        <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (norm.includes("principle") || norm.includes("architecture") || norm.includes("design") || norm.includes("software")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
        <path d="M12 12v9M4 7.5l8 4.5 8-4.5" />
      </svg>
    );
  }
  if (norm.includes("operating") || norm.includes("system") || norm.includes("concurrency") || norm.includes("network")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
        <rect x="4" y="4" width="16" height="7" rx="1.5" />
        <rect x="4" y="13" width="16" height="7" rx="1.5" />
        <circle cx="7.5" cy="7.5" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="7.5" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  const m = index % 4;
  if (m === 0) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
        <rect x="4" y="3" width="16" height="12" rx="1.5" />
        <line x1="9" y1="21" x2="16" y2="21" />
        <line x1="12" y1="15" x2="12" y2="21" />
      </svg>
    );
  }
  if (m === 1) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
        <path d="M4 6h16M4 12h10M4 18h13" />
        <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (m === 2) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
        <path d="M12 12v9M4 7.5l8 4.5 8-4.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" style={{ width: "38px", height: "38px" }}>
      <rect x="4" y="4" width="16" height="7" rx="1.5" />
      <rect x="4" y="13" width="16" height="7" rx="1.5" />
      <circle cx="7.5" cy="7.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="7.5" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

interface FilterPillButtonProps {
  isActive: boolean;
  activeData: any;
  onClick: () => void;
  children: React.ReactNode;
}

const FilterPillButton: React.FC<FilterPillButtonProps> = ({
  isActive,
  activeData,
  onClick,
  children
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const isHoveredRef = useRef(false);
  const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null);

  const glowColor = hexToRgbStr(activeData.colors.primary);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach(particle => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => {
          particle.parentNode?.removeChild(particle);
        }
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!buttonRef.current || !isHoveredRef.current) return;

    const { width, height } = buttonRef.current.getBoundingClientRect();

    for (let i = 0; i < 6; i++) {
      const px = Math.random() * width;
      const py = Math.random() * height;

      const particle = document.createElement("div");
      particle.className = "category-particle";
      particle.style.cssText = `
        position: absolute;
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: rgba(${glowColor}, 1);
        box-shadow: 0 0 4px rgba(${glowColor}, 0.6);
        pointer-events: none;
        z-index: 10;
        left: ${px}px;
        top: ${py}px;
      `;

      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !buttonRef.current) return;
        buttonRef.current.appendChild(particle);
        particlesRef.current.push(particle);

        gsap.fromTo(particle, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" });

        gsap.to(particle, {
          x: (Math.random() - 0.5) * 50,
          y: (Math.random() - 0.5) * 50,
          rotation: Math.random() * 360,
          duration: 1.5 + Math.random() * 1.5,
          ease: "none",
          repeat: -1,
          yoyo: true
        });

        gsap.to(particle, {
          opacity: 0.3,
          duration: 1.2,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true
        });
      }, i * 120);

      timeoutsRef.current.push(timeoutId);
    }
  }, [glowColor]);

  useEffect(() => {
    const element = buttonRef.current;
    if (!element) return;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();

      gsap.to(element, {
        rotateX: 4,
        rotateY: 4,
        duration: 0.3,
        ease: "power2.out",
        transformPerspective: 600
      });
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();

      gsap.to(element, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.3,
        ease: "power2.out"
      });

      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      gsap.to(element, {
        rotateX,
        rotateY,
        duration: 0.1,
        ease: "power2.out",
        transformPerspective: 600
      });

      const magnetX = (x - centerX) * 0.08;
      const magnetY = (y - centerY) * 0.08;
      magnetismAnimationRef.current = gsap.to(element, {
        x: magnetX,
        y: magnetY,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    const handleClick = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );

      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.3) 0%, rgba(${glowColor}, 0.1) 40%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 10;
      `;

      element.appendChild(ripple);

      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        {
          scale: 1,
          opacity: 0,
          duration: 0.7,
          ease: "power2.out",
          onComplete: () => ripple.remove()
        }
      );
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("click", handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("click", handleClick);
      clearAllParticles();
    };
  }, [animateParticles, clearAllParticles, glowColor]);

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={`magic-bento-card category-bento-card category-bento-card--border-glow`}
      style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        borderRadius: "10px",
        border: isActive ? `1.5px solid ${activeData.colors.primary}` : "1px solid var(--theme-n-200, rgba(20, 23, 31, 0.06))",
        background: isActive ? `linear-gradient(${activeData.colors.secondary}, ${activeData.colors.secondary}), var(--theme-surface-raised, #FFFFFF)` : "var(--theme-surface-raised, rgba(255, 255, 255, 0.65))",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        color: isActive ? activeData.colors.primary : "var(--theme-n-600, #5E606A)",
        fontSize: "0.82rem",
        fontWeight: "700",
        cursor: "pointer",
        boxShadow: isActive
          ? `0 10px 20px -8px ${activeData.colors.primary}33`
          : "0 4px 10px -2px rgba(0,0,0,0.02)",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "--glow-color": glowColor
      } as React.CSSProperties}
    >
      {children}
    </button>
  );
};

interface CategoryGlobalSpotlightProps {
  gridRef: React.RefObject<HTMLDivElement | null>;
  spotlightRadius?: number;
}

const CategoryGlobalSpotlight: React.FC<CategoryGlobalSpotlightProps> = ({
  gridRef,
  spotlightRadius = 160
}) => {
  useEffect(() => {
    if (!gridRef?.current) return;

    const container = gridRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const cards = container.querySelectorAll(".category-bento-card");

      cards.forEach(card => {
        const cardElement = card as HTMLElement;
        const cardRect = cardElement.getBoundingClientRect();

        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);

        const proximity = spotlightRadius * 0.5;
        const fadeDistance = spotlightRadius * 0.75;

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }

        const relativeX = ((e.clientX - cardRect.left) / cardRect.width) * 100;
        const relativeY = ((e.clientY - cardRect.top) / cardRect.height) * 100;

        cardElement.style.setProperty("--glow-x", `${relativeX}%`);
        cardElement.style.setProperty("--glow-y", `${relativeY}%`);
        cardElement.style.setProperty("--glow-intensity", glowIntensity.toString());
        cardElement.style.setProperty("--glow-radius", `${spotlightRadius}px`);
      });
    };

    const handleMouseLeave = () => {
      container.querySelectorAll(".category-bento-card").forEach(card => {
        (card as HTMLElement).style.setProperty("--glow-intensity", "0");
      });
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [gridRef, spotlightRadius]);

  return null;
};

interface CourseCardProps {
  course: any;
  index: number;
  activeCategoryName: string;
  activeData: any;
  router: any;
  realRating: number;
  realReviewsCount: number;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  index,
  activeCategoryName,
  activeData,
  router,
  realRating,
  realReviewsCount
}) => {
  const enriched = getEnrichedCourse(course, index, activeCategoryName);
  const courseSlug = slugify(course.title);
  const href = courseRoutes.landing(course.id || courseSlug);

  return (
    <UnifiedContentCard
      id={course.id || `course-${index}`}
      title={course.title}
      description={course.desc || course.description}
      type="COURSE"
      typeLabel={enriched.categoryTag || 'Course'}
      category={course.category || activeCategoryName}
      channelName={enriched.channel?.name}
      channelIconUrl={enriched.channel?.iconUrl}
      metaTags={[
        course.duration ? course.duration : null,
        course.level ? course.level : null,
      ].filter(Boolean)}
      metadataBadges={
        realReviewsCount > 0 ? (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
            <span className="text-amber-500">★</span>
            <span className="font-bold text-slate-800">{realRating.toFixed(1)}</span>
            <span className="text-slate-400">({realReviewsCount} {realReviewsCount === 1 ? 'Review' : 'Reviews'})</span>
          </div>
        ) : null
      }
      actionHref={href}
      actionLabel="Enroll Now"
    />
  );
};

interface CoursesViewProps {
  activeData: any;
  activeCategoryName: string;
  router: any;
  isEmbeddedHub: boolean;
  courseSearchQuery: string;
  setCourseSearchQuery: (q: string) => void;
  courseStats: Record<string, { averageRating: number; reviewsCount: number }>;
  isLoading?: boolean;
}

export default function CoursesView({
  activeData,
  activeCategoryName,
  router,
  isEmbeddedHub,
  courseSearchQuery,
  setCourseSearchQuery,
  courseStats,
  isLoading = false
}: CoursesViewProps) {
  const coursesSectionRef = useRef<HTMLDivElement>(null);
  const filtersGridRef = useRef<HTMLDivElement>(null);

  const [selectedDifficulty, setSelectedDifficulty] = useState("All Levels");
  const [selectedTopic, setSelectedTopic] = useState("All Topics");
  const [sortBy, setSortBy] = useState<"popular" | "rating" | "duration">("popular");

  const difficultyLevels = ["All Levels", "Beginner", "Intermediate", "Advanced"];
  const topics = ["All Topics", ...Array.from(new Set(activeData.courses.map((c: any, i: number) => getEnrichedCourse(c, i, activeCategoryName).categoryTag)))];

  const filteredCourses = activeData.courses.filter((course: any, index: number) => {
    const enriched = getEnrichedCourse(course, index, activeCategoryName);
    const matchesSearch = course.title.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
      course.desc.toLowerCase().includes(courseSearchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === "All Levels" || course.level === selectedDifficulty;
    const matchesTopic = selectedTopic === "All Topics" || enriched.categoryTag === selectedTopic;
    return matchesSearch && matchesDifficulty && matchesTopic;
  });

  const sortedCourses = [...filteredCourses].sort((a: any, b: any) => {
    // Stats are keyed by course id, matching the reviews API. Unrated courses sort to the
    // bottom of a rating sort rather than being handed a flattering default.
    const ratingA = courseStats[a.id]?.averageRating ?? 0;
    const ratingB = courseStats[b.id]?.averageRating ?? 0;

    if (sortBy === "rating") {
      return ratingB - ratingA;
    }
    if (sortBy === "duration") {
      return (a.duration || "").localeCompare(b.duration || "");
    }
    return 0;
  });

  const headingTitle = React.useMemo(() => {
    const q = courseSearchQuery.trim();
    if (q) {
      return `Results for "${q}"`;
    }
    const isAll = !activeCategoryName || activeCategoryName.toLowerCase() === "all";
    if (!isAll) {
      if (selectedDifficulty !== "All Levels") {
        return `${selectedDifficulty} ${activeCategoryName} Courses`;
      }
      return `${activeCategoryName} Courses`;
    }
    if (selectedDifficulty !== "All Levels") {
      return `${selectedDifficulty} Courses`;
    }
    return "Popular Courses";
  }, [courseSearchQuery, activeCategoryName, selectedDifficulty]);

  return (
    <section ref={coursesSectionRef} style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "4px", height: "24px", borderRadius: "2px", background: activeData.colors.primary }} />
          <h2 style={{ fontSize: "1.45rem", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--l-ink)", fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>
            {headingTitle}
          </h2>
        </div>
        {sortedCourses.length > 0 && (
          <span style={{ fontSize: "0.82rem", fontWeight: "600", color: "var(--theme-n-500, #6B7280)" }}>
            {sortedCourses.length} {sortedCourses.length === 1 ? "course available" : "courses available"}
          </span>
        )}
      </div>

      {/* Uniform Horizontal Filter & Sort Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "28px",
          padding: "10px 16px",
          background: "var(--theme-surface-raised, rgba(255, 255, 255, 0.75))",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: "14px",
          border: "1px solid var(--theme-n-200, rgba(20, 23, 31, 0.08))",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.02)"
        }}
      >
        {/* Left: Filter by Level */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.82rem",
              fontWeight: "800",
              color: "var(--theme-n-600, #4B5563)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              paddingRight: "4px"
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Level:</span>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            {difficultyLevels.map((level) => {
              const isActive = selectedDifficulty === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSelectedDifficulty(level)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    fontWeight: isActive ? "700" : "600",
                    border: isActive ? `1.5px solid ${activeData.colors.primary}` : "1px solid var(--theme-n-200, rgba(20, 23, 31, 0.08))",
                    background: isActive ? `linear-gradient(${activeData.colors.primary}18, ${activeData.colors.primary}18), var(--theme-surface-raised, #FFFFFF)` : "var(--theme-surface-raised, #FFFFFF)",
                    color: isActive ? activeData.colors.primary : "var(--theme-n-600, #4B5563)",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Horizontal Sort */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.82rem",
              fontWeight: "800",
              color: "var(--theme-n-600, #4B5563)",
              textTransform: "uppercase",
              letterSpacing: "0.04em"
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span>Sort:</span>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            {[
              { id: "popular", label: "Popular" },
              { id: "rating", label: "Highest Rated" },
              { id: "duration", label: "Duration" }
            ].map((s) => {
              const isActive = sortBy === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSortBy(s.id as any)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    fontWeight: isActive ? "700" : "600",
                    border: isActive ? `1.5px solid ${activeData.colors.primary}` : "1px solid var(--theme-n-200, rgba(20, 23, 31, 0.08))",
                    background: isActive ? `linear-gradient(${activeData.colors.primary}18, ${activeData.colors.primary}18), var(--theme-surface-raised, #FFFFFF)` : "var(--theme-surface-raised, #FFFFFF)",
                    color: isActive ? activeData.colors.primary : "var(--theme-n-600, #4B5563)",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {isLoading ? (
        <ContentCardsGridSkeleton count={6} />
      ) : sortedCourses.length === 0 ? (
        <ExploreEmptyState
          title={courseSearchQuery.trim() ? "No matching courses found" : "No courses found"}
          description={
            courseSearchQuery.trim()
              ? `We couldn't find any courses matching "${courseSearchQuery}". Try checking for spelling errors or searching with broader keywords.`
              : selectedDifficulty !== "All Levels"
                ? `There are currently no ${selectedDifficulty.toLowerCase()} courses in ${activeCategoryName}. Try selecting "All Levels" to view other courses.`
                : "No courses are currently available in this category. Try choosing a different category or clearing filters."
          }
          actionLabel="Reset Filters"
          onAction={() => {
            setCourseSearchQuery("");
            setSelectedDifficulty("All Levels");
            setSelectedTopic("All Topics");
          }}
          accentColor={activeData.colors.primary}
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
          {sortedCourses.map((course: any, index: number) => {
            const stats = courseStats[course.id] || { averageRating: 0.0, reviewsCount: 0 };
            return (
              <CourseCard
                key={course.id || `${course.title}-${index}`}
                course={course}
                index={index}
                activeCategoryName={activeCategoryName}
                activeData={activeData}
                router={router}
                realRating={stats.averageRating}
                realReviewsCount={stats.reviewsCount}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
