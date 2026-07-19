"use client";

import React from "react";
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

export default function Testimonials() {
  return (
    <section className="l-testimonials" aria-label="Developer testimonials">
      <div className="l-testimonials__container">
        
        {/* Header */}
        <div className="l-testimonials__header">
          <h2 className="l-testimonials__title">
            Trusted by millions of developers all over the world
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
