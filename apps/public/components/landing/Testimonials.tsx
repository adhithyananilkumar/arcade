"use client";

import React, { useEffect, useState } from "react";
import { motion, useAnimation, useReducedMotion } from "framer-motion";
import "./Testimonials.css";

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  avatarInitials: string;
  avatarBg: string;
  isDark?: boolean;
  logoType?: "tailwind" | "fathom";
}

const TESTIMONIALS_COLUMN_1: Testimonial[] = [
  {
    id: 1,
    logoType: "tailwind",
    quote: "I've been using Arcade for nearly a semester and have never been tempted to switch to any other learning platform.",
    author: "Adam Wathan",
    role: "Founder, Tailwind",
    avatarInitials: "AW",
    avatarBg: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
    isDark: true,
  },
  {
    id: 2,
    quote: "Arcade is a breath of fresh air in the online education ecosystem, with a brilliant community around it.",
    author: "Erika Heidi",
    role: "Creator, Minicli",
    avatarInitials: "EH",
    avatarBg: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
  },
];

const TESTIMONIALS_COLUMN_2: Testimonial[] = [
  {
    id: 3,
    quote: "Arcade is our digital hub and multitool for student workshops large and small. It remains fresh, engaging and extremely useful.",
    author: "Ian Callahan",
    role: "Harvard Art Museums",
    avatarInitials: "IC",
    avatarBg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  },
  {
    id: 4,
    quote: "Arcade's elegance, performance, and student developer experience are completely unmatched.",
    author: "Chandresh Patel",
    role: "CEO, Bacancy",
    avatarInitials: "CP",
    avatarBg: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  },
  {
    id: 5,
    quote: "The platform courses, the workshop ecosystem and the community - it's the perfect learning package.",
    author: "Zuzana Kunckova",
    role: "Founder, Larabelles",
    avatarInitials: "ZK",
    avatarBg: "linear-gradient(135deg, #f43f5e 0%, #be185d 100%)",
  },
];

const TESTIMONIALS_COLUMN_3: Testimonial[] = [
  {
    id: 6,
    quote: "Arcade takes the pain out of hosting modern, interactive peer-to-peer classes.",
    author: "Aaron Francis",
    role: "Co-founder, Try Hard Studios",
    avatarInitials: "AF",
    avatarBg: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
  },
  {
    id: 7,
    logoType: "fathom",
    quote: "The Arcade ecosystem has been integral to the success of our bootcamps. The platform allows us to learn fast and build regularly.",
    author: "Jack Ellis",
    role: "Founder, Fathom Analytics",
    avatarInitials: "JE",
    avatarBg: "linear-gradient(135deg, #64748b 0%, #334155 100%)",
    isDark: true,
  },
];

function TailwindLogo() {
  return (
    <div className="l-testimonials__logo-wrapper">
      <svg className="l-testimonials__logo-svg" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 6.00001C8.4 6.00001 6.3 7.80001 5.7 11.4C7.5 9.00001 9.3 8.10001 11.1 8.70001C12.1286 9.04287 12.858 9.78201 13.6637 10.5986C14.978 11.9303 16.5144 13.4863 20.3 13.4863C23.9 13.4863 26 11.6863 26.6 8.08632C24.8 10.4863 23 11.3863 21.2 10.7863C20.1714 10.4435 19.442 9.70432 18.6363 8.88773C17.322 7.55601 15.7856 6.00001 12 6.00001ZM5.7 13.4863C2.1 13.4863 0 15.2863 -0.6 18.8863C1.2 16.4863 3 15.5863 4.8 16.1863C5.82857 16.5292 6.558 17.2683 7.36371 18.0849C8.67802 19.4166 10.2144 20.9726 14 20.9726C17.6 20.9726 19.7 19.1726 20.3 15.5726C18.5 17.9726 16.7 18.8726 14.9 18.2726C13.8714 17.9297 13.142 17.1906 12.3363 16.374C11.022 15.0423 9.48557 13.4863 5.7 13.4863Z"
          fill="#38bdf8"
        />
      </svg>
      <span className="l-testimonials__logo-text text-tailwind">tailwindcss</span>
    </div>
  );
}

function FathomLogo() {
  return (
    <div className="l-testimonials__logo-wrapper">
      <span className="l-testimonials__logo-text text-fathom">fathom <span className="fathom-sub">analytics/</span></span>
    </div>
  );
}

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <div className={`l-testimonials__card ${item.isDark ? "is-dark" : "is-light"}`}>
      {item.logoType === "tailwind" && <TailwindLogo />}
      {item.logoType === "fathom" && <FathomLogo />}
      
      <blockquote className="l-testimonials__quote">
        “{item.quote}”
      </blockquote>
      
      <div className="l-testimonials__author">
        <div className="l-testimonials__author-info">
          <span className="l-testimonials__author-name">{item.author}</span>
          <span className="l-testimonials__author-role">{item.role}</span>
        </div>
        <div 
          className="l-testimonials__avatar"
          style={{ background: item.avatarBg }}
        >
          {item.avatarInitials}
        </div>
      </div>
    </div>
  );
}

const BIRD_WAYPOINTS = [
  { x: "5%", y: "-15%" },
  { x: "30%", y: "-5%" },
  { x: "60%", y: "-20%" },
  { x: "85%", y: "0%" },
  { x: "90%", y: "45%" },
  { x: "70%", y: "60%" },
  { x: "50%", y: "40%" },
  { x: "20%", y: "55%" },
  { x: "-5%", y: "30%" },
  { x: "40%", y: "85%" },
  { x: "80%", y: "90%" },
];

function AnimatedBird() {
  const controls = useAnimation();
  const shouldReduceMotion = useReducedMotion();
  const [direction, setDirection] = useState<"left" | "right">("right");

  useEffect(() => {
    if (shouldReduceMotion) return;

    let isMounted = true;
    let currentWaypointIndex = 0;

    const moveBird = async () => {
      while (isMounted) {
        // Pick a random waypoint different from current
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * BIRD_WAYPOINTS.length);
        } while (nextIndex === currentWaypointIndex);

        const currentWP = BIRD_WAYPOINTS[currentWaypointIndex];
        const nextWP = BIRD_WAYPOINTS[nextIndex];
        
        // Determine direction
        const currentXVal = parseFloat(currentWP.x);
        const nextXVal = parseFloat(nextWP.x);
        if (nextXVal < currentXVal) {
          setDirection("left");
        } else {
          setDirection("right");
        }

        currentWaypointIndex = nextIndex;

        // Calculate a random duration for flying
        const duration = 3 + Math.random() * 3;

        await controls.start({
          left: nextWP.x,
          top: nextWP.y,
          transition: {
            duration,
            ease: "easeInOut",
          }
        });

        if (!isMounted) break;

        // Pause occasionally (like hovering/perching briefly)
        if (Math.random() > 0.6) {
          await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500));
        }
      }
    };

    moveBird();

    return () => {
      isMounted = false;
    };
  }, [controls, shouldReduceMotion]);

  // If reduced motion, stay still at a cute spot
  const initialStyle = shouldReduceMotion 
    ? { left: "80%", top: "10%" } 
    : { left: "10%", top: "-10%" };

  return (
    <motion.div
      className="l-animated-bird-container"
      initial={initialStyle}
      animate={controls}
      style={{
        position: "absolute",
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      <div 
        className="l-animated-bird-flipper"
        style={{
          transform: direction === "left" ? "scaleX(-1)" : "scaleX(1)",
          transition: "transform 0.4s ease-in-out"
        }}
      >
        <div className={`l-bird-body ${shouldReduceMotion ? '' : 'is-flying'}`}>
          <svg width="90" height="60" viewBox="0 0 90 60" fill="none">
            {/* Tail */}
            <path className="b-tail" d="M33 30 L15 22 L21 37 Z" fill="#0EA5E9" />
            {/* Back Wing */}
            <ellipse className="b-wing-back" cx="48" cy="24" rx="12" ry="6" fill="#0284C7" />
            {/* Body */}
            <rect x="30" y="22" width="30" height="22" rx="11" fill="#38BDF8" />
            {/* Head */}
            <circle cx="60" cy="25" r="12" fill="#38BDF8" />
            {/* Beak */}
            <path d="M70 22 L81 25 L70 28 Z" fill="#FBBF24" />
            {/* Eye */}
            <circle cx="64" cy="22" r="2.2" fill="#111827" />
            {/* Front Wing */}
            <ellipse className="b-wing" cx="45" cy="27" rx="13.5" ry="7.5" fill="#BAE6FD" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

export default function Testimonials() {
  return (
    <section className="l-testimonials" aria-label="Developer testimonials">
      <div className="l-testimonials__container">
        
        {/* Header */}
        <div className="l-testimonials__header" style={{ position: "relative", zIndex: 1 }}>
          <AnimatedBird />
          <h2 className="l-testimonials__title">
            <span className="l-typo-wrap">
              Trusted
              <svg className="l-typo-shape l-typo-shape--1" width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle cx="4" cy="12" r="3" fill="#14B8A6" />
                <circle cx="12" cy="5" r="4" fill="#0EA5E9" />
                <circle cx="20" cy="10" r="2.5" fill="#8B5CF6" />
              </svg>
            </span>
            {" "}by{" "}
            <span className="l-typo-wrap">
              millions
              <svg className="l-typo-shape l-typo-shape--2" width="22" height="22" viewBox="0 0 24 24" fill="#FBBF24">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            </span>
            {" "}of{" "}
            <span className="l-typo-wrap">
              developers
              <svg className="l-typo-shape l-typo-shape--3" width="28" height="28" viewBox="0 0 24 24" fill="#8B5CF6">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12H12V2Z" />
              </svg>
            </span>
            {" "}all{" "}
            <span className="l-typo-wrap">
              over
              <svg className="l-typo-shape l-typo-shape--4" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="3.5" strokeLinecap="round">
                <path d="M3 12c5-8 13-8 18 0" />
              </svg>
            </span>
            {" "}the{" "}
            <span className="l-typo-wrap">
              world
              <svg className="l-typo-shape l-typo-shape--5" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="4">
                <circle cx="12" cy="12" r="8" />
              </svg>
            </span>
          </h2>
        </div>

        {/* 3-Column Masonry Grid */}
        <div className="l-testimonials__grid">
          <div className="l-testimonials__col">
            {TESTIMONIALS_COLUMN_1.map((item) => (
              <TestimonialCard key={item.id} item={item} />
            ))}
          </div>
          <div className="l-testimonials__col">
            {TESTIMONIALS_COLUMN_2.map((item) => (
              <TestimonialCard key={item.id} item={item} />
            ))}
          </div>
          <div className="l-testimonials__col">
            {TESTIMONIALS_COLUMN_3.map((item) => (
              <TestimonialCard key={item.id} item={item} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
