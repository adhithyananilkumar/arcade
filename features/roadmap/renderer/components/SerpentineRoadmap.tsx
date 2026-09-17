'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Trophy,
  ChevronRight,
  Code2,
} from 'lucide-react';
import { DEFAULT_FRONTEND_STAGES, StageData } from '../data/defaultFrontendRoadmap';
import { RoadmapStageCard } from './RoadmapStageCard';
import { AdditionalResourcesCard, RoadmapGoalCard } from './RoadmapAuxiliaryCards';
import { RoadmapConnectors } from './RoadmapConnectors';
import { LearningDrawer } from './LearningDrawer';
import { useRoadmapViewerStore } from '../store/useRoadmapViewerStore';
import { RoadmapNode } from '../types';
import '../styles/roadmap-serpentine.css';

interface SerpentineRoadmapProps {
  roadmapId?: string;
  title?: string;
  description?: string;
  graphJson?: string;
}

export const SerpentineRoadmap: React.FC<SerpentineRoadmapProps> = ({
  roadmapId = 'frontend',
  title = 'Frontend Developer',
  description = 'Learn the fundamentals → Build real projects → Get hired',
  graphJson = '',
}) => {
  const { init, activeNodeId, setActiveNode, progress, toggleNodeCompletion } = useRoadmapViewerStore();
  const [activeFilter, setActiveFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');
  const [screenMode, setScreenMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Initialize store on mount
  useEffect(() => {
    if (roadmapId) {
      init(roadmapId, [], []);
    }
  }, [roadmapId, init]);

  // Window Resize Listener for Responsive Layout Modes
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenMode('mobile');
      } else if (width < 1024) {
        setScreenMode('tablet');
      } else {
        setScreenMode('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter stages based on level
  const visibleStages = useMemo(() => {
    if (activeFilter === 'All') return DEFAULT_FRONTEND_STAGES;
    return DEFAULT_FRONTEND_STAGES.filter((s) => s.level === activeFilter);
  }, [activeFilter]);

  // Map progress to simple completed status
  const completedMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    DEFAULT_FRONTEND_STAGES.forEach((s) => {
      map[s.id] = progress[s.id]?.status === 'COMPLETED';
    });
    return map;
  }, [progress]);

  // Map stages to RoadmapNode format for LearningDrawer
  const drawerNodes = useMemo<RoadmapNode[]>(() => {
    return DEFAULT_FRONTEND_STAGES.map((s, idx) => ({
      id: s.id,
      label: s.title,
      description: s.subtitle,
      type: 'lesson',
      difficulty: s.level,
      duration: s.duration,
      completed: Boolean(completedMap[s.id]),
      x: idx * 100,
      y: 0,
      width: 300,
      height: 200,
    }));
  }, [completedMap]);

  // Handle stage card selection
  const handleStageClick = useCallback((id: string) => {
    setActiveNode(id);
  }, [setActiveNode]);

  return (
    <div className="serpentine-container">
      {/* Background Subtle Dot Pattern */}
      <div className="serpentine-bg-pattern" aria-hidden="true" />

      {/* Main Inner Wrapper */}
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 relative z-10">

        {/* ── TOP BREADCRUMB ── */}
        <div className="mb-3">
          <Link href="/roadmaps" className="roadmap-breadcrumb" title="Back to Learning Journeys">
            <span className="roadmap-breadcrumb-icon">
              <Check size={11} strokeWidth={3} />
            </span>
            <span>Learning Journeys &gt;</span>
          </Link>
        </div>

        {/* ── HEADER SECTION MATCHING REFERENCE IMAGE ── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 pb-6 border-b border-slate-200/70">
          
          {/* Left Title Group: Icon Badge + Title + Subtitle with Arrows */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            {/* Blue Rounded Square Code Icon Badge */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center font-mono font-bold text-xl sm:text-2xl shadow-sm shrink-0 select-none">
              &lt;/&gt;
            </div>

            <div>
              <h1 className="roadmap-hero-title text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight">
                Frontend Developer Roadmap
              </h1>
              <p className="roadmap-hero-subtitle text-xs sm:text-sm font-semibold text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span>Learn the fundamentals</span>
                <span className="text-slate-400 font-bold">→</span>
                <span>Build real projects</span>
                <span className="text-slate-400 font-bold">→</span>
                <span>Get hired</span>
              </p>
            </div>
          </div>

          {/* Right Slogan & Filter Group */}
          <div className="flex flex-row md:flex-col items-start md:items-end justify-between gap-3">
            {/* Cursive Handwriting Slogan from Reference: "Better UI. Better Web." */}
            <div
              className="text-2xl sm:text-3xl lg:text-4xl text-[#2563EB] font-bold tracking-wide select-none rotate-[-1deg]"
              style={{ fontFamily: "'Caveat', 'Dancing Script', cursive" }}
            >
              Better UI. Better Web.
            </div>

            {/* Level Filter Buttons */}
            <div className="roadmap-filters" role="tablist" aria-label="Roadmap Level Filter">
              {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`roadmap-filter-btn ${activeFilter === filter ? 'active' : ''}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* ── ROADMAP CANVAS CONTAINER ────────────────────────────────────── */}
        <div ref={containerRef} className="relative w-full pt-8 min-h-[620px]">

          {/* Dynamic SVG Connectors (Desktop & Tablet) */}
          <RoadmapConnectors
            containerRef={containerRef}
            visibleStages={visibleStages}
            mode={screenMode}
            completedMap={completedMap}
          />

          {/* 1. DESKTOP 2-ROW INFOGRAPHIC LAYOUT (1024px+) */}
          {screenMode === 'desktop' && (
            <AnimatePresence mode="wait">
              {activeFilter === 'All' ? (
                /* Full Infographic Flow when All is selected with horizontal scroll wrapper if needed */
                <div className="w-full overflow-x-auto pb-6 scrollbar-thin">
                  <motion.div
                    key="desktop-all"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="min-w-[1320px] w-full"
                  >
                    {/* ROW 1: Stages 1 through 7 (7 columns) */}
                    <div className="grid grid-cols-7 gap-5 sm:gap-6 items-stretch">
                      {DEFAULT_FRONTEND_STAGES.slice(0, 7).map((stage) => (
                        <RoadmapStageCard
                          key={stage.id}
                          stage={stage}
                          isActive={activeNodeId === stage.id}
                          isCompleted={Boolean(completedMap[stage.id])}
                          onClick={handleStageClick}
                        />
                      ))}
                    </div>

                    {/* ROW 2: Stages 8, 9, 10 + Additional Resources (2 cols) + Your Goal (2 cols) */}
                    <div className="grid grid-cols-7 gap-5 sm:gap-6 mt-16 items-stretch">
                      {/* Stage 8: Build Projects (col 1) */}
                      <div className="col-span-1">
                        <RoadmapStageCard
                          stage={DEFAULT_FRONTEND_STAGES[7]}
                          isActive={activeNodeId === DEFAULT_FRONTEND_STAGES[7].id}
                          isCompleted={Boolean(completedMap[DEFAULT_FRONTEND_STAGES[7].id])}
                          onClick={handleStageClick}
                        />
                      </div>

                      {/* Stage 9: Prepare for Jobs (col 2) */}
                      <div className="col-span-1">
                        <RoadmapStageCard
                          stage={DEFAULT_FRONTEND_STAGES[8]}
                          isActive={activeNodeId === DEFAULT_FRONTEND_STAGES[8].id}
                          isCompleted={Boolean(completedMap[DEFAULT_FRONTEND_STAGES[8].id])}
                          onClick={handleStageClick}
                        />
                      </div>

                      {/* Stage 10: Get Hired & Grow (col 3) */}
                      <div className="col-span-1">
                        <RoadmapStageCard
                          stage={DEFAULT_FRONTEND_STAGES[9]}
                          isActive={activeNodeId === DEFAULT_FRONTEND_STAGES[9].id}
                          isCompleted={Boolean(completedMap[DEFAULT_FRONTEND_STAGES[9].id])}
                          onClick={handleStageClick}
                        />
                      </div>

                      {/* Card 11: Additional Resources (col 4-5) */}
                      <div className="col-span-2">
                        <AdditionalResourcesCard />
                      </div>

                      {/* Card 12: Your Goal (col 6-7) */}
                      <div className="col-span-2">
                        <RoadmapGoalCard />
                      </div>
                    </div>
                  </motion.div>
                </div>
              ) : (
                /* Adaptive Grid when filtered */
                <motion.div
                  key={`desktop-filtered-${activeFilter}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  {visibleStages.map((stage) => (
                    <RoadmapStageCard
                      key={stage.id}
                      stage={stage}
                      isActive={activeNodeId === stage.id}
                      isCompleted={Boolean(completedMap[stage.id])}
                      onClick={handleStageClick}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* 2. TABLET LAYOUT (768px – 1023px) */}
          {screenMode === 'tablet' && (
            <AnimatePresence mode="wait">
              <motion.div
                key={`tablet-${activeFilter}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-6"
              >
                {visibleStages.map((stage) => (
                  <div key={stage.id} className="w-full">
                    <RoadmapStageCard
                      stage={stage}
                      isActive={activeNodeId === stage.id}
                      isCompleted={Boolean(completedMap[stage.id])}
                      onClick={handleStageClick}
                    />
                  </div>
                ))}
                {activeFilter === 'All' && (
                  <>
                    <div className="col-span-2">
                      <AdditionalResourcesCard />
                    </div>
                    <div className="col-span-1">
                      <RoadmapGoalCard />
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* 3. MOBILE VERTICAL TIMELINE LAYOUT (< 768px) */}
          {screenMode === 'mobile' && (
            <div className="timeline-mobile-wrapper">
              {/* Continuous vertical timeline spine */}
              <div className="timeline-spine" aria-hidden="true" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={`mobile-${activeFilter}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {visibleStages.map((stage) => (
                    <div key={stage.id} className="timeline-mobile-item">
                      {/* Timeline Milestone Dot */}
                      <div
                        className="timeline-node-dot"
                        style={{ backgroundColor: stage.color }}
                      >
                        {stage.number}
                      </div>

                      {/* Card Container */}
                      <div className="timeline-card-wrap">
                        <RoadmapStageCard
                          stage={stage}
                          isMobile={true}
                          isActive={activeNodeId === stage.id}
                          isCompleted={Boolean(completedMap[stage.id])}
                          onClick={handleStageClick}
                        />
                      </div>
                    </div>
                  ))}

                  {activeFilter === 'All' && (
                    <div className="mt-8 space-y-6 pl-4">
                      <AdditionalResourcesCard />
                      <RoadmapGoalCard />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}

        </div>

        {/* ── FOOTER MOTIVATIONAL BANNER ─────────────────────────────────── */}
        <div className="roadmap-footer-banner mt-12">
          <div className="roadmap-footer-left">
            <div className="roadmap-trophy-icon">
              <Trophy size={18} />
            </div>
            <span>
              <strong>Remember:</strong> Consistency beats talent. Keep building, keep learning!
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer">
            <span>Arcade Learning Path</span>
            <ChevronRight size={14} />
          </div>
        </div>

      </div>

      {/* ── LEARNING DRAWER (AI Tutor, Lessons, Topics, Progress Toggle) ──── */}
      <LearningDrawer nodes={drawerNodes} />
    </div>
  );
};
