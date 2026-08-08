"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ArrowUpRight, 
  Star, 
  BookOpen, 
  Users, 
  Clock, 
  Eye, 
  Layers,
  Palette
} from "lucide-react";
import "./InteractiveCardFan.css";

export interface ShowcaseCard {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  description: string;
  image: string;
  rating: number;
  reviewsCount: number;
  studentsCount: string;
  duration: string;
  level: string;
  instructor: {
    name: string;
    role: string;
  };
  tags: string[];
}

const defaultCards: ShowcaseCard[] = [
  {
    id: "card-1",
    title: "Architectural CAD & Spatial Physics",
    category: "Architecture",
    subtitle: "3D Modeling & Raw Materiality",
    description: "Explore structural design, space composition, and raw materiality through hands-on CAD modeling, parametric assemblies, and high-fidelity spatial visualization.",
    image: "/courses/cad.png",
    rating: 4.9,
    reviewsCount: 1240,
    studentsCount: "3.4k",
    duration: "8 Weeks",
    level: "Intermediate",
    instructor: {
      name: "Prof. Alan Vance",
      role: "Lead Architectural Engineer"
    },
    tags: ["3D CAD", "Parametric", "Engineering"]
  },
  {
    id: "card-2",
    title: "Full-Stack Web Engineering",
    category: "Development",
    subtitle: "Next.js 15, Server Components & React",
    description: "Master full-stack architecture with Next.js 15, React 19, TypeScript, Tailwind CSS, and production-ready serverless backend deployments.",
    image: "/courses/react.png",
    rating: 5.0,
    reviewsCount: 2150,
    studentsCount: "5.8k",
    duration: "12 Weeks",
    level: "All Levels",
    instructor: {
      name: "Dr. Sarah Jenkins",
      role: "Principal Software Architect"
    },
    tags: ["Next.js", "React", "TypeScript"]
  },
  {
    id: "card-3",
    title: "UI/UX & Motion Systems",
    category: "Design",
    subtitle: "Micro-interactions & Visual Aesthetics",
    description: "Craft high-fidelity design systems, fluid motion physics, accessible components, and captivating interactive user interfaces.",
    image: "/courses/uiux.png",
    rating: 4.9,
    reviewsCount: 1890,
    studentsCount: "4.2k",
    duration: "6 Weeks",
    level: "Intermediate",
    instructor: {
      name: "Elena Rostova",
      role: "Design System Lead"
    },
    tags: ["UI/UX", "Figma", "Design Systems"]
  },
  {
    id: "card-4",
    title: "Distributed Systems & Microservices",
    category: "Backend",
    subtitle: "Node.js, Redis & Event Pipelines",
    description: "Build resilient, event-driven backend architectures, high-throughput WebSockets, Redis caching layers, and database clusters.",
    image: "/courses/node.png",
    rating: 4.8,
    reviewsCount: 970,
    studentsCount: "2.9k",
    duration: "10 Weeks",
    level: "Advanced",
    instructor: {
      name: "Marcus Thorne",
      role: "Senior Systems Engineer"
    },
    tags: ["Node.js", "Microservices", "Cloud"]
  },
  {
    id: "card-5",
    title: "Product Strategy & Tech Leadership",
    category: "Management",
    subtitle: "Roadmaps, Agile & Engineering Teams",
    description: "Lead cross-functional technical teams, manage high-impact product roadmaps, and ship software reliably from ideation to scale.",
    image: "/courses/pm.png",
    rating: 4.9,
    reviewsCount: 840,
    studentsCount: "2.1k",
    duration: "6 Weeks",
    level: "Beginner to Pro",
    instructor: {
      name: "Claire Dupont",
      role: "VP of Product Strategy"
    },
    tags: ["Product", "Leadership", "Agile"]
  }
];

export default function InteractiveCardFan({ cards = defaultCards }: { cards?: ShowcaseCard[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<ShowcaseCard | null>(null);
  const [isMonochrome, setIsMonochrome] = useState<boolean>(false);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedCard(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Compute transform values for fanning cards (5 items arc layout)
  const getFanTransform = (index: number, total: number) => {
    const centerIndex = (total - 1) / 2;
    const offset = index - centerIndex; // e.g. -2, -1, 0, 1, 2
    
    // Horizontal spread step & rotation step
    const rotate = offset * 6.5; 
    const translateX = offset * 85; 
    const translateY = Math.abs(offset) * 8; 

    return { rotate, translateX, translateY };
  };

  const handleCardClick = (card: ShowcaseCard) => {
    setSelectedCard(card);
  };

  const handlePrevCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedCard) return;
    const currentIndex = cards.findIndex(c => c.id === selectedCard.id);
    const prevIndex = (currentIndex - 1 + cards.length) % cards.length;
    setSelectedCard(cards[prevIndex]);
  };

  const handleNextCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedCard) return;
    const currentIndex = cards.findIndex(c => c.id === selectedCard.id);
    const nextIndex = (currentIndex + 1) % cards.length;
    setSelectedCard(cards[nextIndex]);
  };

  return (
    <section className="card-fan-section" aria-label="Interactive Card Gallery">
      {/* Header controls & instructions */}
      <div className="card-fan-header">
        <div className="card-fan-badge">
          <Sparkles size={14} className="card-fan-sparkle" />
          <span>Interactive Showcase</span>
        </div>
        <h2 className="card-fan-title">
          Explore Arcade <span className="card-fan-title-highlight">Collections</span>
        </h2>
        <p className="card-fan-subtitle">
          Hover over any card to pop it up • Click a card to reveal full details
        </p>

        {/* Style Mode Toggle: Monochrome vs Color */}
        <button
          className={`card-fan-toggle-btn ${isMonochrome ? "active" : ""}`}
          onClick={() => setIsMonochrome(!isMonochrome)}
          title="Toggle Monochrome / Color Mode"
        >
          <Palette size={14} />
          <span>{isMonochrome ? "Monochrome Mode" : "Vibrant Mode"}</span>
        </button>
      </div>

      {/* Fan Cards Container */}
      <div className={`card-fan-container ${isMonochrome ? "is-monochrome" : ""}`}>
        <div className="card-fan-stack">
          {cards.map((card, index) => {
            const { rotate, translateX, translateY } = getFanTransform(index, cards.length);
            const isHovered = hoveredIndex === index;
            const isAnyHovered = hoveredIndex !== null;

            return (
              <motion.div
                key={card.id}
                className="card-fan-item"
                initial={{
                  rotate: rotate,
                  x: translateX,
                  y: translateY + 40,
                  opacity: 0,
                }}
                animate={{
                  rotate: isHovered ? 0 : rotate,
                  x: isHovered ? translateX * 0.9 : translateX,
                  y: isHovered ? -55 : isAnyHovered ? translateY + 12 : translateY,
                  scale: isHovered ? 1.15 : isAnyHovered ? 0.95 : 1,
                  zIndex: isHovered ? 50 : index + 1,
                  opacity: isAnyHovered && !isHovered ? 0.65 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 24,
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleCardClick(card)}
                role="button"
                tabIndex={0}
                aria-label={`View card ${card.title}`}
              >
                {/* Outer White Border Frame matching screenshot */}
                <div className="card-fan-inner">
                  {/* Image Background */}
                  <div className="card-fan-img-wrapper">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="card-fan-img"
                    />
                    <div className="card-fan-overlay-gradient" />
                  </div>

                  {/* Top Badge */}
                  <div className="card-fan-top-bar">
                    <span className="card-fan-category-pill">{card.category}</span>
                    <span className="card-fan-rating">
                      <Star size={12} fill="#eab308" color="#eab308" /> {card.rating}
                    </span>
                  </div>

                  {/* Bottom Card Information */}
                  <div className="card-fan-bottom-info">
                    <span className="card-fan-card-subtitle">{card.subtitle}</span>
                    <h3 className="card-fan-card-title">{card.title}</h3>
                    
                    <div className="card-fan-card-meta">
                      <span><Clock size={12} /> {card.duration}</span>
                      <span><Users size={12} /> {card.studentsCount}</span>
                    </div>
                  </div>

                  {/* Glossy Sheen Effect */}
                  <div className="card-fan-sheen" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* POPUP MODAL ON CLICK */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            className="card-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              className={`card-modal-content ${isMonochrome ? "is-monochrome" : ""}`}
              initial={{ scale: 0.8, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                className="card-modal-close"
                onClick={() => setSelectedCard(null)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              {/* Prev / Next Navigation Arrows */}
              <button
                className="card-modal-nav prev"
                onClick={handlePrevCard}
                aria-label="Previous card"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                className="card-modal-nav next"
                onClick={handleNextCard}
                aria-label="Next card"
              >
                <ChevronRight size={22} />
              </button>

              {/* Modal Body */}
              <div className="card-modal-grid">
                {/* Left: Card Visual */}
                <div className="card-modal-visual">
                  <div className="card-modal-img-wrap">
                    <img
                      src={selectedCard.image}
                      alt={selectedCard.title}
                      className="card-modal-img"
                    />
                    <div className="card-modal-img-gradient" />
                  </div>
                  <div className="card-modal-tag-row">
                    {selectedCard.tags.map((tag) => (
                      <span key={tag} className="card-modal-tag">#{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Right: Detailed Content */}
                <div className="card-modal-body">
                  <div className="card-modal-header">
                    <span className="card-modal-badge">{selectedCard.category}</span>
                    <div className="card-modal-rating-row">
                      <Star size={16} fill="#eab308" color="#eab308" />
                      <span className="card-modal-rating-val">{selectedCard.rating}</span>
                      <span className="card-modal-reviews">({selectedCard.reviewsCount} reviews)</span>
                    </div>
                  </div>

                  <h2 className="card-modal-title">{selectedCard.title}</h2>
                  <p className="card-modal-subtitle">{selectedCard.subtitle}</p>

                  <p className="card-modal-desc">{selectedCard.description}</p>

                  {/* Highlights Grid */}
                  <div className="card-modal-stats">
                    <div className="card-modal-stat-item">
                      <Clock size={16} className="card-modal-stat-icon" />
                      <div>
                        <span className="stat-label">Duration</span>
                        <span className="stat-val">{selectedCard.duration}</span>
                      </div>
                    </div>
                    <div className="card-modal-stat-item">
                      <Users size={16} className="card-modal-stat-icon" />
                      <div>
                        <span className="stat-label">Enrolled</span>
                        <span className="stat-val">{selectedCard.studentsCount} Students</span>
                      </div>
                    </div>
                    <div className="card-modal-stat-item">
                      <Layers size={16} className="card-modal-stat-icon" />
                      <div>
                        <span className="stat-label">Level</span>
                        <span className="stat-val">{selectedCard.level}</span>
                      </div>
                    </div>
                  </div>

                  {/* Instructor Info */}
                  <div className="card-modal-instructor">
                    <div className="instructor-avatar">
                      {selectedCard.instructor.name.charAt(0)}
                    </div>
                    <div>
                      <span className="instructor-name">{selectedCard.instructor.name}</span>
                      <span className="instructor-role">{selectedCard.instructor.role}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="card-modal-actions">
                    <button className="card-modal-primary-btn">
                      <span>Explore Collection</span>
                      <ArrowUpRight size={18} />
                    </button>
                    <button 
                      className="card-modal-secondary-btn"
                      onClick={() => setSelectedCard(null)}
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
