'use client';

import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { parseRoadmapGraph } from '../engine/parser';
import { LearningDrawer } from './LearningDrawer';
import { useRoadmapViewerStore } from '../store/useRoadmapViewerStore';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Filter,
  Globe,
  Code,
  Palette,
  Terminal,
  GitBranch,
  Atom,
  Rocket,
  ShieldCheck,
  Cloud,
  Sparkles,
  Trophy,
  Award,
} from 'lucide-react';

interface RoadmapViewerProps {
  roadmapId: string;
  title: string;
  description: string;
  graphJson: string;
}

interface SubTopic {
  id: string;
  label: string;
  type: 'essential' | 'important' | 'advanced' | 'optional';
}

interface NoteBubble {
  text: string;
}

interface RoadmapStep {
  id: string;
  coreTitle: string;
  lightBg: string;      // soft pastel background
  borderColor: string;  // light pastel border
  textColor: string;    // vibrant text/icon color
  lineColor: string;    // dashed curve stroke color
  icon: React.ComponentType<any>;
  isStart?: boolean;
  leftBranch?: {
    type: 'subtopics' | 'note';
    subtopics?: SubTopic[];
    note?: NoteBubble;
  };
  rightBranch?: {
    type: 'subtopics' | 'note';
    subtopics?: SubTopic[];
    note?: NoteBubble;
  };
}

export const RoadmapViewer: React.FC<RoadmapViewerProps> = ({
  roadmapId,
  title,
  description,
  graphJson,
}) => {
  const { init, activeNodeId, setActiveNode, progress, toggleNodeCompletion } = useRoadmapViewerStore();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredStepId, setHoveredStepId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'essential' | 'important' | 'advanced'>('all');

  // Interactive Collapse / Expand state for branches
  const [collapsedBranches, setCollapsedBranches] = useState<Record<string, boolean>>({});

  // Realtime scroll position tracking for Minimap & Darkened Scroll Line
  const [scrollProgress, setScrollProgress] = useState(0); // 0 to 1
  const [viewportRatio, setViewportRatio] = useState(0.2);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Scroll listener to update scroll progress for darkened line & Minimap
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll > 0) {
      const progressRatio = Math.max(0, Math.min(1, el.scrollTop / maxScroll));
      setScrollProgress(progressRatio);
      setViewportRatio(el.clientHeight / el.scrollHeight);
    }
  }, []);

  // Set scroll container ref and observer
  const containerRefCallback = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    scrollContainerRef.current = node;

    const el = node;
    handleScroll();
    el.addEventListener('scroll', handleScroll, { passive: true });

    const observer = new ResizeObserver(() => {
      handleScroll();
    });

    observer.observe(el);
  }, [handleScroll]);

  // Parse roadmap graph to sync with store
  const parsedGraph = useMemo(() => {
    return parseRoadmapGraph(graphJson);
  }, [graphJson]);

  // Zoom Camera handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.6));
  const handleResetView = () => {
    setZoomLevel(1);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Store Initialization on mount
  useEffect(() => {
    setIsMounted(true);
    if (roadmapId) {
      init(roadmapId, parsedGraph.nodes, parsedGraph.edges);
    }
  }, [roadmapId, init, parsedGraph]);

  // Curriculum Tree Dataset with Soft Light Pastel Themes
  const roadmapSteps = useMemo<RoadmapStep[]>(() => [
    {
      id: 'node-internet',
      coreTitle: 'Internet',
      lightBg: '#EEF2FF',
      borderColor: '#C7D2FE',
      textColor: '#4F46E5',
      lineColor: '#6366F1',
      icon: Globe,
      isStart: true,
      rightBranch: {
        type: 'subtopics',
        subtopics: [
          { id: 'node-internet', label: 'What is Internet?', type: 'essential' },
          { id: 'node-web-works', label: 'How does the Internet work?', type: 'essential' },
          { id: 'node-web-works', label: 'Domain Name System (DNS)', type: 'essential' },
          { id: 'node-http-browsers', label: 'HTTP / HTTPS', type: 'essential' },
          { id: 'node-http-browsers', label: 'Browsers and how they work?', type: 'essential' },
        ],
      },
    },
    {
      id: 'node-html5',
      coreTitle: 'HTML',
      lightBg: '#EEF2FF',
      borderColor: '#C7D2FE',
      textColor: '#4F46E5',
      lineColor: '#6366F1',
      icon: Code,
      leftBranch: {
        type: 'note',
        note: { text: 'HTML is the standard markup language for creating web structures.' },
      },
    },
    {
      id: 'node-css3',
      coreTitle: 'CSS',
      lightBg: '#EFF6FF',
      borderColor: '#BFDBFE',
      textColor: '#2563EB',
      lineColor: '#3B82F6',
      icon: Palette,
      leftBranch: {
        type: 'subtopics',
        subtopics: [
          { id: 'node-semantic-seo', label: 'Semantic HTML', type: 'essential' },
          { id: 'node-html5', label: 'Forms & Validation', type: 'essential' },
          { id: 'node-html5', label: 'Accessibility', type: 'essential' },
          { id: 'node-semantic-seo', label: 'SEO Basics', type: 'essential' },
          { id: 'node-html5', label: 'Tables & Lists', type: 'essential' },
          { id: 'node-html5', label: 'Media (Audio, Video)', type: 'essential' },
        ],
      },
      rightBranch: {
        type: 'subtopics',
        subtopics: [
          { id: 'node-box-model', label: 'Selectors', type: 'important' },
          { id: 'node-box-model', label: 'Box Model', type: 'important' },
          { id: 'node-flex-grid', label: 'Flexbox', type: 'important' },
          { id: 'node-flex-grid', label: 'CSS Grid', type: 'important' },
          { id: 'node-responsive-tailwind', label: 'Responsive Design', type: 'important' },
          { id: 'node-css3', label: 'Animations', type: 'important' },
          { id: 'node-css3', label: 'CSS Variables', type: 'important' },
          { id: 'node-responsive-tailwind', label: 'Tailwind CSS', type: 'important' },
        ],
      },
    },
    {
      id: 'node-js-basics',
      coreTitle: 'JavaScript',
      lightBg: '#F0FDF4',
      borderColor: '#99F6E4',
      textColor: '#0D9488',
      lineColor: '#14B8A6',
      icon: Terminal,
      leftBranch: {
        type: 'subtopics',
        subtopics: [
          { id: 'node-js-basics', label: 'Variables & Data Types', type: 'important' },
          { id: 'node-js-scope', label: 'Operators', type: 'important' },
          { id: 'node-js-scope', label: 'Functions', type: 'important' },
          { id: 'node-js-basics', label: 'Arrays', type: 'important' },
          { id: 'node-js-basics', label: 'Objects', type: 'important' },
          { id: 'node-dom-events', label: 'DOM Manipulation', type: 'important' },
          { id: 'node-dom-events', label: 'Events', type: 'important' },
          { id: 'node-async-fetch', label: 'Async JavaScript', type: 'important' },
          { id: 'node-async-fetch', label: 'Fetch API', type: 'important' },
          { id: 'node-js-scope', label: 'ES6+ Features', type: 'important' },
        ],
      },
      rightBranch: {
        type: 'note',
        note: { text: 'JavaScript makes web pages interactive.' },
      },
    },
    {
      id: 'node-git',
      coreTitle: 'Version Control',
      lightBg: '#FFF7ED',
      borderColor: '#FFEDD5',
      textColor: '#EA580C',
      lineColor: '#F97316',
      icon: GitBranch,
      leftBranch: {
        type: 'note',
        note: { text: 'Version control helps track changes efficiently.' },
      },
      rightBranch: {
        type: 'subtopics',
        subtopics: [
          { id: 'node-git', label: 'Git Basics', type: 'essential' },
          { id: 'node-git-basics', label: 'GitHub', type: 'essential' },
          { id: 'node-git-basics', label: 'Branching', type: 'essential' },
          { id: 'node-git-basics', label: 'Pull Requests', type: 'essential' },
          { id: 'node-git-basics', label: 'Collaboration', type: 'essential' },
        ],
      },
    },
    {
      id: 'node-react',
      coreTitle: 'React',
      lightBg: '#FDF2F8',
      borderColor: '#FBCFE8',
      textColor: '#DB2777',
      lineColor: '#EC4899',
      icon: Atom,
      leftBranch: {
        type: 'subtopics',
        subtopics: [
          { id: 'node-react-jsx', label: 'Components', type: 'advanced' },
          { id: 'node-react-jsx', label: 'Props & State', type: 'advanced' },
          { id: 'node-state-hooks', label: 'Hooks', type: 'advanced' },
          { id: 'node-state-hooks', label: 'Context API', type: 'advanced' },
          { id: 'node-react-router', label: 'React Router', type: 'advanced' },
          { id: 'node-react', label: 'Lifecycle', type: 'advanced' },
          { id: 'node-react', label: 'Performance Optimization', type: 'advanced' },
        ],
      },
      rightBranch: {
        type: 'note',
        note: { text: 'React is a library for building user interfaces.' },
      },
    },
    {
      id: 'node-nextjs',
      coreTitle: 'Next.js',
      lightBg: '#F5F3FF',
      borderColor: '#DDD6FE',
      textColor: '#7C3AED',
      lineColor: '#8B5CF6',
      icon: Sparkles,
      leftBranch: {
        type: 'note',
        note: { text: 'Next.js is a React framework for production.' },
      },
      rightBranch: {
        type: 'subtopics',
        subtopics: [
          { id: 'node-next-routing', label: 'Routing', type: 'advanced' },
          { id: 'node-server-components', label: 'Data Fetching', type: 'advanced' },
          { id: 'node-nextjs', label: 'API Routes', type: 'advanced' },
          { id: 'node-server-components', label: 'Server Components', type: 'advanced' },
          { id: 'node-nextjs', label: 'Authentication', type: 'advanced' },
          { id: 'node-deployment', label: 'Deployment (Vercel)', type: 'advanced' },
        ],
      },
    },
    {
      id: 'node-typescript',
      coreTitle: 'Advanced Frontend',
      lightBg: '#F0F9FF',
      borderColor: '#BAE6FD',
      textColor: '#0284C7',
      lineColor: '#0EA5E9',
      icon: Rocket,
      leftBranch: {
        type: 'subtopics',
        subtopics: [
          { id: 'node-typescript', label: 'TypeScript', type: 'important' },
          { id: 'node-typescript', label: 'State Management (Redux / Zustand)', type: 'important' },
          { id: 'node-typescript', label: 'Component Libraries (Chakra UI / MUI)', type: 'important' },
          { id: 'node-typescript', label: 'NextAuth.js', type: 'important' },
          { id: 'node-typescript', label: 'TanStack Query', type: 'important' },
        ],
      },
      rightBranch: {
        type: 'subtopics',
        subtopics: [
          { id: 'node-typescript', label: 'Web Performance', type: 'important' },
          { id: 'node-typescript', label: 'Code Splitting', type: 'important' },
          { id: 'node-typescript', label: 'Lazy Loading', type: 'important' },
          { id: 'node-typescript', label: 'Caching Strategies', type: 'important' },
          { id: 'node-typescript', label: 'Bundle Optimization', type: 'important' },
        ],
      },
    },
    {
      id: 'node-testing-jest',
      coreTitle: 'Testing',
      lightBg: '#EEF2FF',
      borderColor: '#C7D2FE',
      textColor: '#4338CA',
      lineColor: '#6366F1',
      icon: ShieldCheck,
      leftBranch: {
        type: 'subtopics',
        subtopics: [
          { id: 'node-testing-jest', label: 'Unit Testing', type: 'important' },
          { id: 'node-testing-jest', label: 'Integration Testing', type: 'important' },
          { id: 'node-testing-jest', label: 'Jest', type: 'important' },
          { id: 'node-testing-jest', label: 'React Testing Library', type: 'important' },
          { id: 'node-testing-jest', label: 'Mocking', type: 'important' },
        ],
      },
      rightBranch: {
        type: 'subtopics',
        subtopics: [
          { id: 'node-testing-jest', label: 'End to End Testing', type: 'important' },
          { id: 'node-testing-jest', label: 'Playwright / Cypress', type: 'important' },
          { id: 'node-testing-jest', label: 'Accessibility Testing', type: 'important' },
          { id: 'node-testing-jest', label: 'Lighthouse', type: 'important' },
        ],
      },
    },
    {
      id: 'node-deployment',
      coreTitle: 'Deployment',
      lightBg: '#ECFEFF',
      borderColor: '#A5F3FC',
      textColor: '#0891B2',
      lineColor: '#06B6D4',
      icon: Cloud,
      leftBranch: {
        type: 'note',
        note: { text: 'Deploy your app and make it accessible.' },
      },
      rightBranch: {
        type: 'subtopics',
        subtopics: [
          { id: 'node-deployment', label: 'Vercel', type: 'essential' },
          { id: 'node-deployment', label: 'Netlify', type: 'essential' },
          { id: 'node-deployment', label: 'CI/CD', type: 'essential' },
          { id: 'node-deployment', label: 'Docker Basics', type: 'essential' },
          { id: 'node-deployment', label: 'Environment Variables', type: 'essential' },
        ],
      },
    },
  ], []);

  // Toggle step branch collapse state
  const toggleCollapse = (stepId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedBranches(prev => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  // ACCURATE COLLISION-FREE DYNAMIC STEP LAYOUT COMPUTATION
  const stepLayouts = useMemo(() => {
    let currentY = 80;
    return roadmapSteps.map((step) => {
      const isCollapsed = !!collapsedBranches[step.id];

      let leftHeight = 48;
      if (step.leftBranch && !isCollapsed) {
        if (step.leftBranch.type === 'note') leftHeight = 56;
        else if (step.leftBranch.subtopics) {
          const N = step.leftBranch.subtopics.length;
          leftHeight = N * 28 + (N - 1) * 4;
        }
      }

      let rightHeight = 48;
      if (step.rightBranch && !isCollapsed) {
        if (step.rightBranch.type === 'note') rightHeight = 56;
        else if (step.rightBranch.subtopics) {
          const N = step.rightBranch.subtopics.length;
          rightHeight = N * 28 + (N - 1) * 4;
        }
      }

      const maxBranchHeight = Math.max(leftHeight, rightHeight);
      const stepY = currentY;
      
      // Allocating safe height prevents any note bubble collision with neighboring stacks
      const stepHeightAllocated = Math.max(160, maxBranchHeight + 60);
      currentY += stepHeightAllocated;

      return {
        stepY,
        coreCenterY: stepY + 24,
        isCollapsed,
      };
    });
  }, [roadmapSteps, collapsedBranches]);

  // Total calculated canvas height
  const totalCanvasHeight = useMemo(() => {
    const last = stepLayouts[stepLayouts.length - 1];
    return last ? last.stepY + 240 : 2800;
  }, [stepLayouts]);

  // Track starts at top of "Start Here" node and ends at final node Y + 90
  const trackStartY = useMemo(() => (stepLayouts[0]?.stepY || 80) - 20, [stepLayouts]);
  const trackEndY = useMemo(() => (stepLayouts[stepLayouts.length - 1]?.coreCenterY || 2000) + 90, [stepLayouts]);
  const totalTrackLength = useMemo(() => Math.max(1, trackEndY - trackStartY), [trackEndY, trackStartY]);

  // Darkened line extends down from top Start node as user scrolls
  const darkLineFillY = useMemo(() => {
    return Math.min(trackEndY, trackStartY + scrollProgress * totalTrackLength);
  }, [trackStartY, trackEndY, totalTrackLength, scrollProgress]);

  // Minimap Click-to-Scroll handler
  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const ratio = Math.max(0, Math.min(1, clickY / rect.height));

    if (scrollContainerRef.current) {
      const el = scrollContainerRef.current;
      const maxScroll = el.scrollHeight - el.clientHeight;
      el.scrollTo({ top: ratio * maxScroll, behavior: 'smooth' });
    }
  };

  // Compute overall progress stats
  const completionPercentage = useMemo(() => {
    if (parsedGraph.nodes.length === 0) return 0;
    const completedNodes = parsedGraph.nodes.filter(
      n => progress[n.id]?.status === 'COMPLETED'
    ).length;
    return (completedNodes / parsedGraph.nodes.length) * 100;
  }, [parsedGraph.nodes, progress]);

  if (!isMounted) return null;

  return (
    <div className="relative w-full h-screen overflow-hidden flex bg-[#F8FAFC]">
      {/* 1. Floating Header Overlay */}
      <div className="absolute top-6 left-0 right-0 px-8 z-30 pointer-events-none flex items-center justify-between">
        {/* Left Floating Logo Pill */}
        <div 
          onClick={() => router.push('/')}
          className="pointer-events-auto cursor-pointer bg-white px-5 py-2.5 rounded-full border border-slate-100/80 shadow-sm flex items-center justify-center hover:shadow-md transition-shadow"
        >
          <img src="/arcade.svg" alt="arcade" className="h-5 w-auto" />
        </div>

        {/* Right Controls & Profile */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button className="w-10 h-10 bg-white border border-slate-100/80 rounded-full shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-655 transition-all hover:shadow-md">
            <Bell className="w-4 h-4" />
          </button>
          
          <div className="bg-white border border-slate-100/80 rounded-full pl-4 pr-1.5 py-1 shadow-sm flex items-center gap-3 cursor-pointer hover:shadow-md transition-all">
            <span className="text-[11px] font-extrabold text-slate-700">athirabiju20...</span>
            <div className="h-7.5 w-7.5 rounded-full bg-[#8D6E63] text-white flex items-center justify-center text-[10px] font-black uppercase shadow-xs">
              A
            </div>
          </div>
        </div>
      </div>

      {/* 2. Fullscreen Canvas Viewport */}
      <div
        ref={containerRefCallback}
        id="roadmap-scroll-container"
        className="absolute inset-0 overflow-auto z-0 flex scrollbar-none scroll-smooth bg-[#F8FAFC] w-full h-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Interactive roadmap tree wrapper */}
        <div
          id="roadmap-content-wrapper"
          className="relative transition-transform duration-300 origin-top center mx-auto z-10 py-16"
          style={{
            width: '1200px',
            height: `${totalCanvasHeight}px`,
            transform: `scale(${zoomLevel})`,
          }}
        >
          {/* SVG Connector Lines & Darkened Scroll Line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* Top lead-in dashed line */}
            {stepLayouts.length > 0 && (
              <line
                x1="600"
                y1="10"
                x2="600"
                y2={stepLayouts[0].coreCenterY - 24}
                stroke="#475569"
                strokeWidth="2"
                strokeDasharray="3 3"
                opacity="0.6"
              />
            )}

            {/* Subtle outer visual guide lines */}
            <line x1="280" y1="50" x2="280" y2={totalCanvasHeight - 100} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
            <line x1="920" y1="50" x2="920" y2={totalCanvasHeight - 100} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />

            {/* Base straight central track (Light Gray Background) */}
            <line
              x1="600"
              y1={trackStartY}
              x2="600"
              y2={trackEndY}
              stroke="#CBD5E1"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Darkened Progress Line extending down as you scroll */}
            {darkLineFillY > trackStartY && (
              <line
                x1="600"
                y1={trackStartY}
                x2="600"
                y2={darkLineFillY}
                stroke="#334155"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="transition-all duration-150 ease-out"
              />
            )}

            {/* Draw smooth, organic Bezier curves for each step */}
            {roadmapSteps.map((step, idx) => {
              const layout = stepLayouts[idx];
              if (!layout) return null;

              const { coreCenterY, isCollapsed } = layout;
              const isHovered = hoveredStepId === step.id;

              const strokeColor = step.lineColor;
              const strokeW = isHovered ? 2.0 : 1.3;
              const dashStyle = isHovered ? "none" : "3 3";

              const leftPaths: React.ReactNode[] = [];
              const rightPaths: React.ReactNode[] = [];

              // Left Branch lines
              if (step.leftBranch && !isCollapsed) {
                if (step.leftBranch.type === 'note') {
                  leftPaths.push(
                    <path
                      key={`left-note-line-${step.id}`}
                      d={`M 510 ${coreCenterY} C 470 ${coreCenterY}, 470 ${coreCenterY}, 430 ${coreCenterY}`}
                      stroke={strokeColor}
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                      fill="none"
                    />
                  );
                } else if (step.leftBranch.type === 'subtopics' && step.leftBranch.subtopics) {
                  const N = step.leftBranch.subtopics.length;
                  const stackHeight = N * 28 + (N - 1) * 4;
                  const stackTopY = coreCenterY - stackHeight / 2;

                  // Attachment dot on left edge of core box
                  leftPaths.push(
                    <circle
                      key={`left-dot-${step.id}`}
                      cx="510"
                      cy={coreCenterY}
                      r="3.5"
                      fill="#FFFFFF"
                      stroke={strokeColor}
                      strokeWidth="2"
                    />
                  );

                  // Ultra-smooth Bezier curves to each left pill
                  step.leftBranch.subtopics.forEach((sub, sIdx) => {
                    const pillY = stackTopY + sIdx * 32 + 14;
                    leftPaths.push(
                      <path
                        key={`left-to-pill-${step.id}-${sIdx}`}
                        d={`M 510 ${coreCenterY} C 470 ${coreCenterY}, 470 ${pillY}, 430 ${pillY}`}
                        stroke={strokeColor}
                        strokeWidth={strokeW}
                        strokeDasharray={dashStyle}
                        fill="none"
                      />
                    );
                  });
                }
              }

              // Right Branch lines
              if (step.rightBranch && !isCollapsed) {
                if (step.rightBranch.type === 'note') {
                  rightPaths.push(
                    <path
                      key={`right-note-line-${step.id}`}
                      d={`M 690 ${coreCenterY} C 730 ${coreCenterY}, 730 ${coreCenterY}, 770 ${coreCenterY}`}
                      stroke={strokeColor}
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                      fill="none"
                    />
                  );
                } else if (step.rightBranch.type === 'subtopics' && step.rightBranch.subtopics) {
                  const N = step.rightBranch.subtopics.length;
                  const stackHeight = N * 28 + (N - 1) * 4;
                  const stackTopY = coreCenterY - stackHeight / 2;

                  // Attachment dot on right edge of core box
                  rightPaths.push(
                    <circle
                      key={`right-dot-${step.id}`}
                      cx="690"
                      cy={coreCenterY}
                      r="3.5"
                      fill="#FFFFFF"
                      stroke={strokeColor}
                      strokeWidth="2"
                    />
                  );

                  // Ultra-smooth Bezier curves to each right pill
                  step.rightBranch.subtopics.forEach((sub, sIdx) => {
                    const pillY = stackTopY + sIdx * 32 + 14;
                    rightPaths.push(
                      <path
                        key={`right-to-pill-${step.id}-${sIdx}`}
                        d={`M 690 ${coreCenterY} C 730 ${coreCenterY}, 730 ${pillY}, 770 ${pillY}`}
                        stroke={strokeColor}
                        strokeWidth={strokeW}
                        strokeDasharray={dashStyle}
                        fill="none"
                      />
                    );
                  });
                }
              }

              // Intermediate checkpoint dot on main track (darkens as scroll line passes)
              let checkpointDot = null;
              if (idx < roadmapSteps.length - 1 && stepLayouts[idx + 1]) {
                const dotY = (coreCenterY + stepLayouts[idx + 1].coreCenterY) / 2;
                const isPassedByScroll = dotY <= darkLineFillY;

                checkpointDot = (
                  <circle
                    cx="600"
                    cy={dotY}
                    r="4"
                    fill={isPassedByScroll ? "#334155" : "#FFFFFF"}
                    stroke={isPassedByScroll ? "#1E293B" : "#94A3B8"}
                    strokeWidth="2.5"
                    className="transition-colors duration-200"
                  />
                );
              }

              return (
                <g key={`svg-step-${step.id}`}>
                  {checkpointDot}
                  {leftPaths}
                  {rightPaths}
                </g>
              );
            })}
          </svg>

          {/* Core Boxes (Center Aligned) */}
          {roadmapSteps.map((step, idx) => {
            const layout = stepLayouts[idx];
            if (!layout) return null;

            const { stepY, coreCenterY, isCollapsed } = layout;
            const subtopicsCount =
              (step.leftBranch?.subtopics?.length || 0) +
              (step.rightBranch?.subtopics?.length || 0);

            const IconComponent = step.icon;

            return (
              <div
                key={step.id}
                onMouseEnter={() => setHoveredStepId(step.id)}
                onMouseLeave={() => setHoveredStepId(null)}
                style={{ position: 'absolute', top: `${stepY}px`, left: '0', width: '1200px', height: '48px' }}
                className="pointer-events-none"
              >
                {/* Central Core Box */}
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveNode(step.id)}
                  style={{
                    left: '510px',
                    width: '180px',
                    backgroundColor: step.lightBg,
                    borderColor: step.borderColor,
                    color: step.textColor,
                  }}
                  className="absolute top-0 h-12 rounded-xl flex items-center justify-center cursor-pointer pointer-events-auto select-none transition-all border shadow-2xs hover:shadow-md z-10 px-4 relative"
                >
                  {step.isStart && (
                    <span className="absolute -top-6 bg-indigo-50 border border-indigo-100 text-indigo-600 font-extrabold text-[8px] uppercase px-2 py-0.5 rounded-full tracking-wider shadow-xs animate-pulse left-[50%] -translate-x-[50%]">
                      Start Here
                    </span>
                  )}
                  
                  {/* Centered Icon and Text */}
                  <div className="flex items-center justify-center gap-2 text-center">
                    <IconComponent className="w-4 h-4 shrink-0" style={{ color: step.textColor }} />
                    <span className="font-extrabold text-xs tracking-tight text-center truncate" style={{ color: step.textColor }}>
                      {step.coreTitle}
                    </span>
                  </div>

                  {/* Circular Chevron Down Toggle Pill */}
                  {subtopicsCount > 0 && (
                    <button
                      onClick={(e) => toggleCollapse(step.id, e)}
                      style={{ backgroundColor: step.borderColor, color: step.textColor }}
                      className="absolute right-2.5 top-3.5 w-5 h-5 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xs"
                      title={isCollapsed ? "Expand branches" : "Collapse branches"}
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </motion.div>

                {/* Left Side Content */}
                <AnimatePresence>
                  {step.leftBranch && !isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {step.leftBranch.type === 'note' && step.leftBranch.note && (
                        <div
                          style={{
                            left: '220px',
                            width: '210px',
                            top: '0px',
                          }}
                          className="absolute flex flex-col items-end pointer-events-auto"
                        >
                          <div className="w-full bg-indigo-50/60 border border-indigo-100/80 border-dashed rounded-xl px-3.5 py-2.5 text-[9.5px] text-slate-500 font-semibold leading-normal text-left shadow-2xs hover:bg-indigo-50/90 transition-colors">
                            {step.leftBranch.note.text}
                          </div>
                        </div>
                      )}
                      {step.leftBranch.type === 'subtopics' && step.leftBranch.subtopics && (() => {
                        const N = step.leftBranch.subtopics.length;
                        const stackHeight = N * 28 + (N - 1) * 4;
                        const topOffset = 24 - stackHeight / 2;

                        return (
                          <div
                            style={{
                              left: '280px',
                              width: '150px',
                              top: `${topOffset}px`,
                            }}
                            className="absolute flex flex-col gap-[4px] items-end pointer-events-auto"
                          >
                            {step.leftBranch.subtopics.map((sub, sIdx) => {
                              const isCompleted = progress[sub.id]?.status === 'COMPLETED';
                              const matchesCategory =
                                selectedCategory === 'all' || sub.type === selectedCategory;

                              const styleClass =
                                sub.type === 'essential'
                                  ? 'border-amber-250 bg-amber-50/40 text-amber-900 hover:bg-amber-100/60'
                                  : sub.type === 'important'
                                  ? 'border-emerald-250 bg-emerald-50/40 text-emerald-900 hover:bg-emerald-100/60'
                                  : 'border-indigo-200 bg-indigo-50/40 text-indigo-900 hover:bg-indigo-100/60';

                              return (
                                <motion.div
                                  key={`${sub.id}-${sIdx}`}
                                  whileHover={{ scale: 1.03, x: -2 }}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => setActiveNode(sub.id)}
                                  style={{ width: '150px', height: '28px' }}
                                  className={`rounded-lg border text-[9.5px] font-extrabold cursor-pointer select-none transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-xs px-2.5 ${styleClass} ${
                                    !matchesCategory ? 'opacity-30' : 'opacity-100'
                                  }`}
                                >
                                  {/* Completion Check dot */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleNodeCompletion(sub.id);
                                    }}
                                    className="shrink-0 group/dot"
                                    title={isCompleted ? "Mark incomplete" : "Mark complete"}
                                  >
                                    {isCompleted ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-650 fill-emerald-50" />
                                    ) : (
                                      <span className={`block w-2 h-2 rounded-full transition-transform group-hover/dot:scale-125 ${
                                        sub.type === 'essential'
                                          ? 'bg-amber-400'
                                          : sub.type === 'important'
                                          ? 'bg-emerald-400'
                                          : 'bg-indigo-400'
                                      }`} />
                                    )}
                                  </button>

                                  <span className={`truncate flex-1 text-left ${isCompleted ? 'line-through opacity-70' : ''}`}>
                                    {sub.label}
                                  </span>
                                </motion.div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Right Side Content */}
                <AnimatePresence>
                  {step.rightBranch && !isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {step.rightBranch.type === 'note' && step.rightBranch.note && (
                        <div
                          style={{
                            left: '770px',
                            width: '210px',
                            top: '0px',
                          }}
                          className="absolute flex flex-col items-start pointer-events-auto"
                        >
                          <div className="w-full bg-indigo-50/60 border border-indigo-100/80 border-dashed rounded-xl px-3.5 py-2.5 text-[9.5px] text-slate-500 font-semibold leading-normal text-left shadow-2xs hover:bg-indigo-50/80 transition-colors">
                            {step.rightBranch.note.text}
                          </div>
                        </div>
                      )}
                      {step.rightBranch.type === 'subtopics' && step.rightBranch.subtopics && (() => {
                        const N = step.rightBranch.subtopics.length;
                        const stackHeight = N * 28 + (N - 1) * 4;
                        const topOffset = 24 - stackHeight / 2;

                        return (
                          <div
                            style={{
                              left: '770px',
                              width: '150px',
                              top: `${topOffset}px`,
                            }}
                            className="absolute flex flex-col gap-[4px] items-start pointer-events-auto"
                          >
                            {step.rightBranch.subtopics.map((sub, sIdx) => {
                              const isCompleted = progress[sub.id]?.status === 'COMPLETED';
                              const matchesCategory =
                                selectedCategory === 'all' || sub.type === selectedCategory;

                              const styleClass =
                                sub.type === 'essential'
                                  ? 'border-amber-250 bg-amber-50/40 text-amber-900 hover:bg-amber-100/60'
                                  : sub.type === 'important'
                                  ? 'border-emerald-250 bg-emerald-50/40 text-emerald-900 hover:bg-emerald-100/60'
                                  : 'border-indigo-200 bg-indigo-50/40 text-indigo-900 hover:bg-indigo-100/60';

                              return (
                                <motion.div
                                  key={`${sub.id}-${sIdx}`}
                                  whileHover={{ scale: 1.03, x: 2 }}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => setActiveNode(sub.id)}
                                  style={{ width: '150px', height: '28px' }}
                                  className={`rounded-lg border text-[9.5px] font-extrabold cursor-pointer select-none transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-xs px-2.5 ${styleClass} ${
                                    !matchesCategory ? 'opacity-30' : 'opacity-100'
                                  }`}
                                >
                                  {/* Completion Check dot */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleNodeCompletion(sub.id);
                                    }}
                                    className="shrink-0 group/dot"
                                    title={isCompleted ? "Mark incomplete" : "Mark complete"}
                                  >
                                    {isCompleted ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-655 fill-emerald-50" />
                                    ) : (
                                      <span className={`block w-2 h-2 rounded-full transition-transform group-hover/dot:scale-125 ${
                                        sub.type === 'essential'
                                          ? 'bg-amber-400'
                                          : sub.type === 'important'
                                          ? 'bg-emerald-400'
                                          : 'bg-indigo-400'
                                      }`} />
                                    )}
                                  </button>

                                  <span className={`truncate flex-1 text-left ${isCompleted ? 'line-through opacity-70' : ''}`}>
                                    {sub.label}
                                  </span>
                                </motion.div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })}

          {/* Creative Final Mastery Achievement Card (Compact) */}
          <motion.div
            whileHover={{ scale: 1.03, y: -2 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              position: 'absolute',
              top: `${totalCanvasHeight - 110}px`,
              left: '475px',
              width: '250px',
            }}
            className="bg-white/95 backdrop-blur-md border border-indigo-150 rounded-xl p-3.5 shadow-xs hover:shadow-md transition-all select-none text-center flex flex-col items-center gap-2 z-10"
          >
            {/* Compact Circular Trophy Icon Badge */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-100 to-amber-50 border border-amber-200/80 flex items-center justify-center shadow-2xs">
              <Trophy className="w-4 h-4 text-amber-600" />
            </div>

            {/* Title & Subtitle */}
            <div className="flex flex-col gap-0.5 items-center">
              <span className="text-[11px] font-black text-slate-800 tracking-tight leading-tight">
                Frontend Mastery Achieved
              </span>
              <p className="text-[9px] text-slate-400 font-semibold leading-tight max-w-[210px]">
                You've covered the core path to becoming a frontend engineer.
              </p>
            </div>

            {/* Action Status Pills */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[8px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <span>🎉</span> 100% Path
              </span>
              <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[8px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <span>🚀</span> Next: Projects
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 3. Top-Left Floating Title & Progress Card */}
      <div className="absolute left-8 top-24 pointer-events-none z-20 flex flex-col gap-3">
        {/* Category Filter Dock Pill */}
        <div className="pointer-events-auto bg-white/90 backdrop-blur-md border border-slate-100/90 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 w-fit">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategory('essential')}
            className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all ${
              selectedCategory === 'essential'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'text-amber-800/70 hover:text-amber-900'
            }`}
          >
            Essential
          </button>
          <button
            onClick={() => setSelectedCategory('important')}
            className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all ${
              selectedCategory === 'important'
                ? 'bg-emerald-500 text-white shadow-2xs'
                : 'text-emerald-800/70 hover:text-emerald-900'
            }`}
          >
            Important
          </button>
          <button
            onClick={() => setSelectedCategory('advanced')}
            className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all ${
              selectedCategory === 'advanced'
                ? 'bg-indigo-500 text-white shadow-2xs'
                : 'text-indigo-800/70 hover:text-indigo-900'
            }`}
          >
            Advanced
          </button>
        </div>

        {/* Title & Progress Card */}
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col gap-2.5 pointer-events-auto w-72">
          <div>
            <h1 className="text-xs font-black text-slate-800 tracking-tight leading-tight">
              {title || "Frontend Developer Roadmap"}
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-normal truncate">
              {description || "Step by step guide to become a modern frontend developer."}
            </p>
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
              <span>Overall Progress</span>
              <span className="text-slate-800">{Math.round(completionPercentage)}%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Top-Right Floating Interactive MINIMAP Card */}
      <div className="absolute right-8 top-24 pointer-events-none z-20">
        <div 
          onClick={handleMinimapClick}
          className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm w-44 h-52 flex flex-col justify-between pointer-events-auto cursor-pointer select-none hover:border-indigo-200 transition-colors"
          title="Click to jump to scroll position"
        >
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">MINIMAP</span>
          
          {/* Miniature Roadmap Tree Representation */}
          <div className="flex-1 relative my-1.5 overflow-hidden bg-slate-50/70 rounded-lg border border-slate-100 p-1">
            <svg viewBox="0 0 100 160" className="w-full h-full fill-none">
              {/* Center Track Line */}
              <line x1="50" y1="10" x2="50" y2="150" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Render 10 Miniature Milestone Nodes in Soft Tint Colors */}
              {roadmapSteps.map((step, idx) => {
                const miniY = 12 + idx * 14;
                const hasLeft = !!step.leftBranch;
                const hasRight = !!step.rightBranch;

                return (
                  <g key={`mini-step-${step.id}`}>
                    {/* Left Mini Branch */}
                    {hasLeft && (
                      <line x1="50" y1={miniY} x2="25" y2={miniY} stroke={step.lineColor} strokeWidth="1" strokeDasharray="1 1" opacity="0.7" />
                    )}

                    {/* Right Mini Branch */}
                    {hasRight && (
                      <line x1="50" y1={miniY} x2="75" y2={miniY} stroke={step.lineColor} strokeWidth="1" strokeDasharray="1 1" opacity="0.7" />
                    )}

                    {/* Mini Core Box */}
                    <rect
                      x="38"
                      y={miniY - 4}
                      width="24"
                      height="8"
                      rx="2"
                      fill={step.lightBg}
                      stroke={step.borderColor}
                      strokeWidth="0.8"
                    />
                  </g>
                );
              })}

              {/* Dynamic Viewport Rectangle Indicator */}
              <rect
                x="6"
                y={Math.max(2, scrollProgress * 120)}
                width="88"
                height={Math.max(24, viewportRatio * 160)}
                rx="3"
                stroke="#6366F1"
                strokeWidth="1.5"
                fill="rgba(99, 102, 241, 0.12)"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 5. Bottom-Right Floating Zoom Controls */}
      <div className="absolute right-8 bottom-8 pointer-events-none z-20">
        <div className="bg-white border border-slate-100 rounded-xl p-1 shadow-sm flex flex-col gap-1 w-9 pointer-events-auto">
          <button 
            onClick={handleZoomIn}
            className="w-7 h-7 flex items-center justify-center hover:bg-slate-50 rounded-lg text-slate-500 font-extrabold text-sm transition-colors hover:text-indigo-600"
            title="Zoom In"
          >
            +
          </button>
          <div className="h-[1px] bg-slate-100 mx-1.5" />
          <button 
            onClick={handleZoomOut}
            className="w-7 h-7 flex items-center justify-center hover:bg-slate-50 rounded-lg text-slate-500 font-extrabold text-sm transition-colors hover:text-indigo-600"
            title="Zoom Out"
          >
            -
          </button>
          <div className="h-[1px] bg-slate-100 mx-1.5" />
          <button 
            onClick={handleResetView}
            className="w-7 h-7 flex items-center justify-center hover:bg-slate-50 rounded-lg text-slate-555 transition-colors hover:text-indigo-600"
            title="Reset View"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current fill-none stroke-[2]" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </button>
          <div className="h-[1px] bg-slate-100 mx-1.5" />
          <button 
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen();
              } else {
                document.documentElement.requestFullscreen();
              }
            }}
            className="w-7 h-7 flex items-center justify-center hover:bg-slate-50 rounded-lg text-slate-555 transition-colors hover:text-indigo-600"
            title="Toggle Fullscreen"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current fill-none stroke-[2]" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Slide-out Learning Drawer */}
      <LearningDrawer nodes={parsedGraph.nodes} />
    </div>
  );
};
