"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import BorderGlow from "./BorderGlow";
import { gsap } from "gsap";

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
  instructor: {
    name: string;
    role: string;
    avatarUrl: string;
  };
}

function getEnrichedCourse(course: { title: string; duration: string; level: string; desc: string }, index: number, categoryName: string): EnrichedCourse {
  const ratings = [4.8, 4.9, 4.7, 4.6];
  const reviews = [320, 240, 185, 95];
  const rating = ratings[index % ratings.length];
  const reviewsCount = reviews[index % reviews.length];

  let categoryTag = categoryName;
  if (categoryName === "Computer Science") {
    const tags = ["Programming", "Algorithms", "Databases", "Software Engineering"];
    categoryTag = tags[index % tags.length];
  } else if (categoryName === "Information Technology") {
    const tags = ["Networking", "Cybersecurity", "Cloud Computing", "Systems"];
    categoryTag = tags[index % tags.length];
  } else if (categoryName === "Business & Management") {
    const tags = ["Entrepreneurship", "Marketing", "Finance", "Product"];
    categoryTag = tags[index % tags.length];
  } else if (categoryName === "Civil & Mechanical") {
    const tags = ["CAD Design", "Fluid Mechanics", "Structural", "Robotics"];
    categoryTag = tags[index % tags.length];
  } else if (categoryName === "Basic Sciences") {
    const tags = ["Mathematics", "Physics", "Chemistry", "Biology"];
    categoryTag = tags[index % tags.length];
  } else if (categoryName === "Humanities & Languages") {
    const tags = ["Literature", "Linguistics", "Philosophy", "History"];
    categoryTag = tags[index % tags.length];
  } else if (categoryName === "Personal Development") {
    const tags = ["Productivity", "Leadership", "Communication", "Mindfulness"];
    categoryTag = tags[index % tags.length];
  }

  const instructors = [
    { name: "Dr. Sarah Jenkins", role: "Course Author", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" },
    { name: "Alex Rivera", role: "Instructor", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
    { name: "Prof. David Miller", role: "Course Author", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" },
    { name: "Elena Rostova", role: "Instructor", avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150" }
  ];
  const instructor = instructors[index % instructors.length];

  return {
    ...course,
    rating,
    reviewsCount,
    categoryTag,
    instructor
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
        border: isActive ? `1.5px solid ${activeData.colors.primary}` : "1.5px solid rgba(20, 23, 31, 0.06)",
        background: isActive ? activeData.colors.secondary : "rgba(255, 255, 255, 0.65)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        color: isActive ? activeData.colors.primary : "#5E606A",
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);

  const enriched = getEnrichedCourse(course, index, activeCategoryName);
  const courseSlug = slugify(course.title);

  useEffect(() => {
    if (descRef.current) {
      setIsOverflowing(descRef.current.scrollHeight > 45);
    }
  }, [course.desc]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <BorderGlow
        edgeSensitivity={30}
        glowColor={hexToHslStr(activeData.colors.primary)}
        backgroundColor="#FFFFFF"
        borderRadius={14}
        glowRadius={40}
        glowIntensity={0.3}
        coneSpread={25}
        animated={false}
        colors={[`${activeData.colors.primary}40`, '#E6E3F1', `${activeData.colors.primary}40`]}
        fillOpacity={0.08}
        className="w-full h-full"
      >
        <div
          style={{
            background: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            width: "100%",
            height: "100%",
            minHeight: "360px"
          }}
          className="course-card-premium"
        >
          <div
            style={{
              height: "90px",
              position: "relative",
              overflow: "hidden",
              background: `
                radial-gradient(circle at 25% 25%, ${activeData.colors.primary}12, transparent 55%),
                repeating-linear-gradient(135deg, ${activeData.colors.primary}08 0 2px, transparent 2px 14px),
                #F9FAFB
              `,
              borderBottom: "1px solid #E6E3F1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <div style={{ color: activeData.colors.primary, opacity: 0.25 }}>
              {getCourseGlyph(course.title, index, activeData.colors.primary)}
            </div>
          </div>

          <div style={{ padding: "16px 16px 14px", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "8px" }}>
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--l-ink)", margin: "0 0 6px", lineHeight: "1.3", fontFamily: "'Space Grotesk', sans-serif" }}>
                {course.title}
              </h3>

              <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.82rem", color: "#5A5870", fontWeight: "600" }}>
                  <span style={{ color: "#F59E0B", fontSize: "0.95rem" }}>★</span>
                  <span style={{ fontWeight: "700", color: "var(--l-ink)" }}>{realReviewsCount > 0 ? realRating.toFixed(1) : "0.0"}</span>
                  <span style={{ color: "#8886A0" }}>({realReviewsCount} {realReviewsCount === 1 ? "Review" : "Reviews"})</span>
                </div>
              </div>

              <div style={{ position: "relative", marginBottom: "12px" }}>
                <p
                  ref={descRef}
                  style={isExpanded ? {
                    fontSize: "0.86rem",
                    color: "#5A5870",
                    lineHeight: "1.5",
                    margin: 0
                  } : {
                    fontSize: "0.86rem",
                    color: "#5A5870",
                    lineHeight: "1.5",
                    margin: 0,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    maxHeight: "3em"
                  }}
                >
                  {course.desc}
                </p>
                {isOverflowing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: activeData.colors.primary,
                      fontSize: "0.8rem",
                      fontWeight: "800",
                      cursor: "pointer",
                      padding: "2px 0 0 0",
                      marginTop: "4px",
                      display: "block",
                      outline: "none"
                    }}
                  >
                    {isExpanded ? "Read less" : "Read more"}
                  </button>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <img
                  src={enriched.instructor.avatarUrl}
                  alt={enriched.instructor.name}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid #E6E3F1"
                  }}
                />
                <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.3" }}>
                  <span style={{ fontSize: "0.84rem", fontWeight: "700", color: "var(--l-ink)" }}>
                    {enriched.instructor.name}
                  </span>
                  <span style={{ fontSize: "0.68rem", color: "#8886A0", fontWeight: "600" }}>
                    {enriched.instructor.role}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                <button
                  onClick={() => router.push(`/courses/${courseSlug}?title=${encodeURIComponent(course.title)}`)}
                  style={{
                    width: "100%",
                    background: activeData.colors.secondary,
                    color: activeData.colors.primary,
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "10px",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "all 0.25s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = activeData.colors.secondary.replace('0.08', '0.16');
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = activeData.colors.secondary;
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  Enroll Now
                </button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #E6E3F1", paddingTop: "10px", marginTop: "2px" }}>
              <span
                onClick={() => router.push(`/courses/${courseSlug}?title=${encodeURIComponent(course.title)}`)}
                style={{
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  color: "#5A5870",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  cursor: "pointer",
                  transition: "color 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = activeData.colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#5A5870";
                }}
              >
                View Course
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="view-arrow" style={{ transition: "transform .15s" }}>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>

              <span style={{ fontSize: "0.84rem", color: "#8886A0", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                {course.duration}
              </span>
            </div>
          </div>
        </div>
      </BorderGlow>
    </div>
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
}

export default function CoursesView({
  activeData,
  activeCategoryName,
  router,
  isEmbeddedHub,
  courseSearchQuery,
  setCourseSearchQuery,
  courseStats
}: CoursesViewProps) {
  const coursesSectionRef = useRef<HTMLDivElement>(null);
  const filtersGridRef = useRef<HTMLDivElement>(null);

  const [selectedDifficulty, setSelectedDifficulty] = useState("All Levels");
  const [selectedTopic, setSelectedTopic] = useState("All Topics");

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

  return (
    <section ref={coursesSectionRef} style={{ marginBottom: isEmbeddedHub ? "36px" : "56px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "4px", height: "24px", borderRadius: "2px", background: activeData.colors.primary }} />
          <h2 style={{ fontSize: "1.5rem", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--l-ink)", fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>
            Popular Courses
          </h2>
        </div>
        <span style={{ fontSize: "0.85rem", fontWeight: "700", color: activeData.colors.primary }}>
          Showing {filteredCourses.length} of {activeData.courses.length} courses
        </span>
      </div>

      <CategoryGlobalSpotlight gridRef={filtersGridRef} spotlightRadius={160} />
      <div
        ref={filtersGridRef}
        style={{
          display: "flex",
          gap: "24px",
          marginBottom: "32px",
          background: "rgba(255, 255, 255, 0.65)",
          border: "1px solid rgba(20, 23, 31, 0.06)",
          borderRadius: "16px",
          padding: "20px 24px",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 4px 12px rgba(20, 23, 31, 0.02)",
          flexWrap: "wrap",
          alignItems: "flex-start"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "0.75rem", fontWeight: "800", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Course Level
          </label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {difficultyLevels.map((level) => {
              const isActive = selectedDifficulty === level;
              return (
                <FilterPillButton
                  key={level}
                  isActive={isActive}
                  activeData={activeData}
                  onClick={() => setSelectedDifficulty(level)}
                >
                  {level}
                </FilterPillButton>
              );
            })}
          </div>
        </div>

        <div style={{ width: "1px", height: "45px", background: "rgba(20, 23, 31, 0.08)", alignSelf: "center", display: "block" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexGrow: 1 }}>
          <label style={{ fontSize: "0.75rem", fontWeight: "800", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Course Type
          </label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {topics.map((topic: any) => {
              const isActive = selectedTopic === topic;
              return (
                <FilterPillButton
                  key={topic}
                  isActive={isActive}
                  activeData={activeData}
                  onClick={() => setSelectedTopic(topic)}
                >
                  {topic}
                </FilterPillButton>
              );
            })}
          </div>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", background: "rgba(255,255,255,0.65)", backdropFilter: "blur(12px)", borderRadius: "20px", border: "1px solid rgba(20, 23, 31, 0.06)" }}>
          <p style={{ color: "rgba(20, 20, 43, 0.5)", fontSize: "0.95rem" }}>No courses matching your search query were found.</p>
          <button
            onClick={() => setCourseSearchQuery("")}
            style={{ marginTop: "12px", background: activeData.colors.primary, color: "#FFFFFF", border: "none", padding: "8px 16px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}
          >
            Reset search
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "30px" }}>
          {filteredCourses.map((course: any, index: number) => {
            const slug = slugify(course.title);
            const stats = courseStats[slug] || { averageRating: 0.0, reviewsCount: 0 };
            return (
              <CourseCard
                key={course.title}
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
