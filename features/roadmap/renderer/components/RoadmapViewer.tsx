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
  Book,
  Sliders,
  ArrowRight,
  BookOpen,
  Layout,
  FileText,
  Quote,
  Calendar,
  User,
  Image,
  MessageSquare,
  HelpCircle,
  Users,
  Briefcase,
  Box,
  Clock,
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
  lightBg: string;
  borderColor: string;
  textColor: string;
  lineColor: string;
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
  const [collapsedBranches, setCollapsedBranches] = useState<Record<string, boolean>>({});
  const [activeTabSegment, setActiveTabSegment] = useState<'roadmap' | 'projects' | 'personalize' | 'guides'>('roadmap');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [selectedGoal, setSelectedGoal] = useState<'learn' | 'job' | 'projects'>('learn');
  const [selectedCommitment, setSelectedCommitment] = useState<'casual' | 'regular' | 'intensive'>('regular');
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>(['css', 'javascript']);
  const [guideTopicFilter, setGuideTopicFilter] = useState<'all' | 'html' | 'css' | 'javascript'>('all');
  const [isGuidesDropdownOpen, setIsGuidesDropdownOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [viewportRatio, setViewportRatio] = useState(0.2);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll > 0) {
      setScrollProgress(Math.max(0, Math.min(1, el.scrollTop / maxScroll)));
      setViewportRatio(el.clientHeight / el.scrollHeight);
    }
  }, []);

  const containerRefCallback = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    scrollContainerRef.current = node;
    handleScroll();
    node.addEventListener('scroll', handleScroll, { passive: true });
    const observer = new ResizeObserver(() => handleScroll());
    observer.observe(node);
  }, [handleScroll]);

  const parsedGraph = useMemo(() => parseRoadmapGraph(graphJson), [graphJson]);

  const projectsData = useMemo(() => [
    { id: 'proj-1', title: 'Single-Page CV', description: 'Create a single-page HTML CV to showcase your career history', difficulty: 'beginner', category: 'HTML', startedCount: '25,852 Started', icon: Code, iconBg: 'bg-purple-50', iconColor: '#8b5cf6' },
    { id: 'proj-2', title: 'Basic HTML Website', description: 'Create simple HTML only website with multiple pages.', difficulty: 'beginner', category: 'HTML', startedCount: '11,902 Started', icon: Layout, iconBg: 'bg-emerald-50', iconColor: '#10b981' },
    { id: 'proj-3', title: 'Personal Portfolio', description: 'Convert the previous simple HTML website into a personal portfolio.', difficulty: 'beginner', category: 'CSS', startedCount: '4,642 Started', icon: FileText, iconBg: 'bg-amber-50/70', iconColor: '#f59e0b' },
    { id: 'proj-4', title: 'Changelog Component', description: 'Create a changelog component for a website using HTML and CSS.', difficulty: 'beginner', category: 'CSS', startedCount: '1,735 Started', icon: Cloud, iconBg: 'bg-blue-50', iconColor: '#3b82f6' },
    { id: 'proj-5', title: 'Testimonial Cards', description: 'Create testimonial cards for a website using HTML and CSS.', difficulty: 'beginner', category: 'CSS', startedCount: '1,507 Started', icon: Quote, iconBg: 'bg-rose-50', iconColor: '#f43f5e' },
    { id: 'proj-6', title: 'Datepicker UI', description: 'Create a simple datepicker UI using HTML and CSS.', difficulty: 'beginner', category: 'CSS', startedCount: '1,104 Started', icon: Calendar, iconBg: 'bg-emerald-50', iconColor: '#10b981' },
    { id: 'proj-7', title: 'Accessible Form UI', description: 'Create an accessible form UI using HTML and CSS.', difficulty: 'beginner', category: 'Accessibility', startedCount: '840 Started', icon: User, iconBg: 'bg-purple-50', iconColor: '#8b5cf6' },
    { id: 'proj-8', title: 'Image Grid Layout', description: 'Create a grid layout of images using HTML and CSS.', difficulty: 'beginner', category: 'CSS', startedCount: '938 Started', icon: Image, iconBg: 'bg-orange-50', iconColor: '#f97316' },
    { id: 'proj-9', title: 'Tooltip UI', description: 'Create a tooltip for navigation items using only HTML and CSS.', difficulty: 'beginner', category: 'CSS', startedCount: '720 Started', icon: MessageSquare, iconBg: 'bg-blue-50', iconColor: '#3b82f6' },
    { id: 'proj-10', title: 'Weather App', description: 'Get real-time weather information using a weather API.', difficulty: 'intermediate', category: 'JavaScript', startedCount: '2,351 Started', icon: Cloud, iconBg: 'bg-sky-50', iconColor: '#0ea5e9' },
    { id: 'proj-11', title: 'Interactive Quiz App', description: 'Create a multiple choice quiz app with timer and progress tracking.', difficulty: 'intermediate', category: 'JavaScript', startedCount: '1,894 Started', icon: HelpCircle, iconBg: 'bg-amber-50/70', iconColor: '#f59e0b' },
    { id: 'proj-12', title: 'E-commerce UI Platform', description: 'Design and build a premium e-commerce product catalog with shopping cart.', difficulty: 'advanced', category: 'React', startedCount: '852 Started', icon: Trophy, iconBg: 'bg-rose-50', iconColor: '#ec4899' },
  ], []);

  const filteredProjects = useMemo(() =>
    projectFilter === 'all' ? projectsData : projectsData.filter(p => p.difficulty === projectFilter),
    [projectFilter, projectsData]);

  const guidesData = useMemo(() => [
    { id: 'guide-1', title: 'CSS Flexbox Complete Guide', description: 'Learn everything about Flexbox with examples.', category: 'CSS', readTime: '15 min read', icon: Code, iconBg: 'bg-blue-50', iconColor: '#3b82f6', tagBg: 'bg-emerald-50', tagColor: 'text-emerald-700', tagBorder: 'border-emerald-100' },
    { id: 'guide-2', title: 'JavaScript ES6+ Features', description: 'Modern JavaScript features you should know.', category: 'JavaScript', readTime: '20 min read', icon: Terminal, iconBg: 'bg-amber-50/70', iconColor: '#f59e0b', tagBg: 'bg-emerald-50', tagColor: 'text-emerald-700', tagBorder: 'border-emerald-100' },
    { id: 'guide-3', title: 'Responsive Web Design', description: 'Build websites that work on all devices.', category: 'HTML', readTime: '18 min read', icon: Layout, iconBg: 'bg-purple-50', iconColor: '#a855f7', tagBg: 'bg-amber-50', tagColor: 'text-amber-700', tagBorder: 'border-amber-100' },
    { id: 'guide-4', title: 'CSS Grid Layout Guide', description: 'Master CSS Grid with practical examples.', category: 'CSS', readTime: '16 min read', icon: Layout, iconBg: 'bg-emerald-50', iconColor: '#10b981', tagBg: 'bg-emerald-50', tagColor: 'text-emerald-700', tagBorder: 'border-emerald-100' },
  ], []);

  const filteredGuides = useMemo(() =>
    guideTopicFilter === 'all' ? guidesData : guidesData.filter(g => g.category.toLowerCase() === guideTopicFilter),
    [guideTopicFilter, guidesData]);

  const handleZoomIn = () => setZoomLevel(p => Math.min(p + 0.1, 1.5));
  const handleZoomOut = () => setZoomLevel(p => Math.max(p - 0.1, 0.6));
  const handleResetView = () => {
    setZoomLevel(1);
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setIsMounted(true);
    if (roadmapId) init(roadmapId, parsedGraph.nodes, parsedGraph.edges);
  }, [roadmapId, init, parsedGraph]);

  const roadmapSteps = useMemo<RoadmapStep[]>(() => [
    {
      id: 'node-internet', coreTitle: 'Internet', lightBg: '#EEF2FF', borderColor: '#C7D2FE', textColor: '#4F46E5', lineColor: '#6366F1', icon: Globe, isStart: true,
      rightBranch: {
        type: 'subtopics', subtopics: [
          { id: 'node-internet', label: 'What is Internet?', type: 'essential' },
          { id: 'node-web-works', label: 'How does the Internet work?', type: 'essential' },
          { id: 'node-web-works', label: 'Domain Name System (DNS)', type: 'essential' },
          { id: 'node-http-browsers', label: 'HTTP / HTTPS', type: 'essential' },
          { id: 'node-http-browsers', label: 'Browsers and how they work?', type: 'essential' },
        ]
      }
    },
    {
      id: 'node-html5', coreTitle: 'HTML', lightBg: '#EEF2FF', borderColor: '#C7D2FE', textColor: '#4F46E5', lineColor: '#6366F1', icon: Code,
      leftBranch: {
        type: 'subtopics', subtopics: [
          { id: 'node-semantic-seo', label: 'Semantic HTML', type: 'essential' },
          { id: 'node-html5', label: 'Forms & Validation', type: 'essential' },
          { id: 'node-html5', label: 'Accessibility', type: 'essential' },
          { id: 'node-semantic-seo', label: 'SEO Basics', type: 'essential' },
          { id: 'node-html5', label: 'Tables & Lists', type: 'essential' },
          { id: 'node-html5', label: 'Media (Audio, Video)', type: 'essential' },
        ]
      },
      rightBranch: { type: 'note', note: { text: 'HTML is the standard markup language for creating web structures.' } }
    },
    {
      id: 'node-css3', coreTitle: 'CSS', lightBg: '#EFF6FF', borderColor: '#BFDBFE', textColor: '#2563EB', lineColor: '#3B82F6', icon: Palette,
      leftBranch: { type: 'note', note: { text: 'CSS styles the layouts and elements of web documents.' } },
      rightBranch: {
        type: 'subtopics', subtopics: [
          { id: 'node-box-model', label: 'Selectors', type: 'important' },
          { id: 'node-box-model', label: 'Box Model', type: 'important' },
          { id: 'node-flex-grid', label: 'Flexbox', type: 'important' },
          { id: 'node-flex-grid', label: 'CSS Grid', type: 'important' },
          { id: 'node-responsive-tailwind', label: 'Responsive Design', type: 'important' },
          { id: 'node-css3', label: 'Animations', type: 'important' },
          { id: 'node-css3', label: 'CSS Variables', type: 'important' },
          { id: 'node-responsive-tailwind', label: 'Tailwind CSS', type: 'important' },
        ]
      }
    },
    {
      id: 'node-js-basics', coreTitle: 'JavaScript', lightBg: '#F0FDF4', borderColor: '#99F6E4', textColor: '#0D9488', lineColor: '#14B8A6', icon: Terminal,
      leftBranch: {
        type: 'subtopics', subtopics: [
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
        ]
      },
      rightBranch: { type: 'note', note: { text: 'JavaScript makes web pages interactive.' } }
    },
    {
      id: 'node-git', coreTitle: 'Version Control', lightBg: '#FFF7ED', borderColor: '#FFEDD5', textColor: '#EA580C', lineColor: '#F97316', icon: GitBranch,
      leftBranch: { type: 'note', note: { text: 'Version control helps track changes efficiently.' } },
      rightBranch: {
        type: 'subtopics', subtopics: [
          { id: 'node-git', label: 'Git Basics', type: 'essential' },
          { id: 'node-git-basics', label: 'GitHub', type: 'essential' },
          { id: 'node-git-basics', label: 'Branching', type: 'essential' },
          { id: 'node-git-basics', label: 'Pull Requests', type: 'essential' },
          { id: 'node-git-basics', label: 'Collaboration', type: 'essential' },
        ]
      }
    },
    {
      id: 'node-react', coreTitle: 'React', lightBg: '#FDF2F8', borderColor: '#FBCFE8', textColor: '#DB2777', lineColor: '#EC4899', icon: Atom,
      leftBranch: {
        type: 'subtopics', subtopics: [
          { id: 'node-react-jsx', label: 'Components', type: 'advanced' },
          { id: 'node-react-jsx', label: 'Props & State', type: 'advanced' },
          { id: 'node-state-hooks', label: 'Hooks', type: 'advanced' },
          { id: 'node-state-hooks', label: 'Context API', type: 'advanced' },
          { id: 'node-react-router', label: 'React Router', type: 'advanced' },
          { id: 'node-react', label: 'Lifecycle', type: 'advanced' },
          { id: 'node-react', label: 'Performance Optimization', type: 'advanced' },
        ]
      },
      rightBranch: { type: 'note', note: { text: 'React is a library for building user interfaces.' } }
    },
    {
      id: 'node-nextjs', coreTitle: 'Next.js', lightBg: '#F5F3FF', borderColor: '#DDD6FE', textColor: '#7C3AED', lineColor: '#8B5CF6', icon: Sparkles,
      leftBranch: { type: 'note', note: { text: 'Next.js is a React framework for production.' } },
      rightBranch: {
        type: 'subtopics', subtopics: [
          { id: 'node-next-routing', label: 'Routing', type: 'advanced' },
          { id: 'node-server-components', label: 'Data Fetching', type: 'advanced' },
          { id: 'node-nextjs', label: 'API Routes', type: 'advanced' },
          { id: 'node-server-components', label: 'Server Components', type: 'advanced' },
          { id: 'node-nextjs', label: 'Authentication', type: 'advanced' },
          { id: 'node-deployment', label: 'Deployment (Vercel)', type: 'advanced' },
        ]
      }
    },
    {
      id: 'node-typescript', coreTitle: 'Advanced Frontend', lightBg: '#F0F9FF', borderColor: '#BAE6FD', textColor: '#0284C7', lineColor: '#0EA5E9', icon: Rocket,
      leftBranch: {
        type: 'subtopics', subtopics: [
          { id: 'node-typescript', label: 'TypeScript', type: 'important' },
          { id: 'node-typescript', label: 'State Management (Redux / Zustand)', type: 'important' },
          { id: 'node-typescript', label: 'Component Libraries (Chakra UI / MUI)', type: 'important' },
          { id: 'node-typescript', label: 'NextAuth.js', type: 'important' },
          { id: 'node-typescript', label: 'TanStack Query', type: 'important' },
        ]
      },
      rightBranch: {
        type: 'subtopics', subtopics: [
          { id: 'node-typescript', label: 'Web Performance', type: 'important' },
          { id: 'node-typescript', label: 'Code Splitting', type: 'important' },
          { id: 'node-typescript', label: 'Lazy Loading', type: 'important' },
          { id: 'node-typescript', label: 'Caching Strategies', type: 'important' },
          { id: 'node-typescript', label: 'Bundle Optimization', type: 'important' },
        ]
      }
    },
    {
      id: 'node-testing-jest', coreTitle: 'Testing', lightBg: '#EEF2FF', borderColor: '#C7D2FE', textColor: '#4338CA', lineColor: '#6366F1', icon: ShieldCheck,
      leftBranch: {
        type: 'subtopics', subtopics: [
          { id: 'node-testing-jest', label: 'Unit Testing', type: 'important' },
          { id: 'node-testing-jest', label: 'Integration Testing', type: 'important' },
          { id: 'node-testing-jest', label: 'Jest', type: 'important' },
          { id: 'node-testing-jest', label: 'React Testing Library', type: 'important' },
          { id: 'node-testing-jest', label: 'Mocking', type: 'important' },
        ]
      },
      rightBranch: {
        type: 'subtopics', subtopics: [
          { id: 'node-testing-jest', label: 'End to End Testing', type: 'important' },
          { id: 'node-testing-jest', label: 'Playwright / Cypress', type: 'important' },
          { id: 'node-testing-jest', label: 'Accessibility Testing', type: 'important' },
          { id: 'node-testing-jest', label: 'Lighthouse', type: 'important' },
        ]
      }
    },
    {
      id: 'node-deployment', coreTitle: 'Deployment', lightBg: '#ECFEFF', borderColor: '#A5F3FC', textColor: '#0891B2', lineColor: '#06B6D4', icon: Cloud,
      leftBranch: { type: 'note', note: { text: 'Deploy your app and make it accessible.' } },
      rightBranch: {
        type: 'subtopics', subtopics: [
          { id: 'node-deployment', label: 'Vercel', type: 'essential' },
          { id: 'node-deployment', label: 'Netlify', type: 'essential' },
          { id: 'node-deployment', label: 'CI/CD', type: 'essential' },
          { id: 'node-deployment', label: 'Docker Basics', type: 'essential' },
          { id: 'node-deployment', label: 'Environment Variables', type: 'essential' },
        ]
      }
    },
  ], []);

  const toggleCollapse = (stepId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedBranches(prev => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  // Snake layout constants - Redesigned to 4 topics per row with generous spacing
  const NODES_PER_ROW = 4;
  const NODE_RADIUS = 28; // Sleek 56px diameter milestone circle
  const CANVAS_WIDTH = 1200;
  const CANVAS_PAD_X = 160;
  const ROW_HEIGHT = 440;
  const FIRST_ROW_Y = 220;

  const stepLayouts = useMemo(() => {
    return roadmapSteps.map((step, idx) => {
      const row = Math.floor(idx / NODES_PER_ROW);
      const posInRow = idx % NODES_PER_ROW;
      const isLTR = row % 2 === 0;
      const nodesInRow = Math.min(NODES_PER_ROW, roadmapSteps.length - row * NODES_PER_ROW);
      const usable = CANVAS_WIDTH - 2 * CANVAS_PAD_X;
      const gap = nodesInRow > 1 ? usable / (nodesInRow - 1) : 0;
      const posIndex = isLTR ? posInRow : (nodesInRow - 1 - posInRow);
      const coreCenterX = CANVAS_PAD_X + posIndex * gap;
      const coreCenterY = FIRST_ROW_Y + row * ROW_HEIGHT;
      // Align all topic checklist boxes ABOVE circles
      const isCardAbove = true;
      return { stepX: coreCenterX, coreCenterX, coreCenterY, row, posInRow, isLTR, nodesInRow, isCardAbove, isCollapsed: !!collapsedBranches[step.id] };
    });
  }, [roadmapSteps, collapsedBranches]);

  const numRows = Math.ceil(roadmapSteps.length / NODES_PER_ROW);

  const wrapperWidth = useMemo(() => activeTabSegment === 'roadmap' ? CANVAS_WIDTH : 1200, [activeTabSegment]);
  const wrapperHeight = useMemo(() => {
    if (activeTabSegment === 'roadmap') return FIRST_ROW_Y + numRows * ROW_HEIGHT + 240;
    if (activeTabSegment === 'projects') return 950;
    if (activeTabSegment === 'personalize') return 800;
    return 780;
  }, [activeTabSegment, numRows]);

  const windingPathD = useMemo(() => {
    if (stepLayouts.length === 0) return '';
    const parts: string[] = [];
    const f = stepLayouts[0];
    const startX = f.isLTR ? f.coreCenterX - 60 : f.coreCenterX + 60;
    parts.push(`M ${startX} ${f.coreCenterY}`);
    parts.push(`L ${f.coreCenterX} ${f.coreCenterY}`);

    for (let i = 1; i < stepLayouts.length; i++) {
      const prev = stepLayouts[i - 1];
      const curr = stepLayouts[i];
      if (prev.row === curr.row) {
        parts.push(`L ${curr.coreCenterX} ${curr.coreCenterY}`);
      } else {
        const prevIsLTR = prev.row % 2 === 0;
        if (prevIsLTR) {
          const rx = CANVAS_WIDTH - CANVAS_PAD_X + 90;
          parts.push(`C ${rx} ${prev.coreCenterY}, ${rx} ${curr.coreCenterY}, ${curr.coreCenterX} ${curr.coreCenterY}`);
        } else {
          const lx = CANVAS_PAD_X - 90;
          parts.push(`C ${lx} ${prev.coreCenterY}, ${lx} ${curr.coreCenterY}, ${curr.coreCenterX} ${curr.coreCenterY}`);
        }
      }
    }
    const last = stepLayouts[stepLayouts.length - 1];
    const lastIsLTR = last.row % 2 === 0;
    const outX = lastIsLTR ? last.coreCenterX + 60 : last.coreCenterX - 60;
    parts.push(`L ${outX} ${last.coreCenterY}`);
    return parts.join(' ');
  }, [stepLayouts]);

  const segmentPaths = useMemo(() => {
    return stepLayouts.map((curr, i) => {
      if (i === 0) return '';
      const prev = stepLayouts[i - 1];
      if (prev.row === curr.row) return `M ${prev.coreCenterX} ${prev.coreCenterY} L ${curr.coreCenterX} ${curr.coreCenterY}`;
      const prevIsLTR = prev.row % 2 === 0;
      if (prevIsLTR) {
        const rx = CANVAS_WIDTH - CANVAS_PAD_X + 90;
        return `M ${prev.coreCenterX} ${prev.coreCenterY} C ${rx} ${prev.coreCenterY}, ${rx} ${curr.coreCenterY}, ${curr.coreCenterX} ${curr.coreCenterY}`;
      } else {
        const lx = CANVAS_PAD_X - 90;
        return `M ${prev.coreCenterX} ${prev.coreCenterY} C ${lx} ${prev.coreCenterY}, ${lx} ${curr.coreCenterY}, ${curr.coreCenterX} ${curr.coreCenterY}`;
      }
    });
  }, [stepLayouts]);

  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    if (scrollContainerRef.current) {
      const el = scrollContainerRef.current;
      el.scrollTo({ top: ratio * (el.scrollHeight - el.clientHeight), behavior: 'smooth' });
    }
  };

  const completionPercentage = useMemo(() => {
    if (parsedGraph.nodes.length === 0) return 0;
    return (parsedGraph.nodes.filter(n => progress[n.id]?.status === 'COMPLETED').length / parsedGraph.nodes.length) * 100;
  }, [parsedGraph.nodes, progress]);

  const isStepCompleted = useCallback((step: RoadmapStep) => {
    const subtopics = [
      ...(step.leftBranch?.type === 'subtopics' ? (step.leftBranch.subtopics || []) : []),
      ...(step.rightBranch?.type === 'subtopics' ? (step.rightBranch.subtopics || []) : []),
    ];
    if (subtopics.length === 0) return false;
    return subtopics.every(sub => progress[sub.id]?.status === 'COMPLETED');
  }, [progress]);

  if (!isMounted) return null;

  const isRoadmapTab = activeTabSegment === 'roadmap';

  return (
    <div className="relative w-full h-screen overflow-hidden flex bg-[#F8FAFC]">

      {/* 1. Floating Header */}
      <div className="absolute top-6 left-0 right-0 px-8 z-30 pointer-events-none flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div onClick={() => router.push('/')} className="pointer-events-auto cursor-pointer bg-white px-5 py-2.5 rounded-full border border-slate-100/80 shadow-sm flex items-center justify-center hover:shadow-md transition-shadow">
            <img src="/arcade.svg" alt="arcade" className="h-5 w-auto" />
          </div>
          <div className="pointer-events-auto bg-white border border-slate-100/80 rounded-full pl-4 pr-1 py-1 shadow-sm flex items-center gap-2 w-64 hover:shadow-md transition-shadow">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-400 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search topics..." className="w-full bg-transparent text-xs font-semibold text-slate-700 placeholder-slate-400 outline-hidden border-none text-[11px] leading-none" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-650 pr-2 text-xs font-black cursor-pointer">x</button>}
          </div>
        </div>
        <div className="flex items-center gap-3 pointer-events-auto">
          <button onClick={() => router.push('/notifications')} className="w-10 h-10 bg-white border border-slate-100/80 rounded-full shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-655 transition-all hover:shadow-md cursor-pointer outline-hidden">
            <Bell className="w-4 h-4" />
          </button>
          <div onClick={() => router.push('/profile')} className="bg-white border border-slate-100/80 rounded-full pl-4 pr-1.5 py-1 shadow-sm flex items-center gap-3 cursor-pointer hover:shadow-md transition-all">
            <span className="text-[11px] font-extrabold text-slate-700">athirabiju20...</span>
            <div className="h-7.5 w-7.5 rounded-full bg-[#8D6E63] text-white flex items-center justify-center text-[10px] font-black uppercase shadow-xs">A</div>
          </div>
        </div>
      </div>

      {/* Centre header */}
      <div className="absolute top-6 left-0 right-0 flex flex-col items-center justify-center text-center select-none w-full pointer-events-none z-30">
        <div className="relative inline-block pt-1 pb-2 px-4 pointer-events-auto">
          <span className="text-4xl sm:text-5xl lg:text-[48px] font-extrabold text-[#2563eb] tracking-tight block leading-normal py-0.5 px-4 cursor-pointer hover:scale-[1.01] transition-transform" style={{ fontFamily: "'Dancing Script','Caveat',cursive" }} onClick={() => router.push('/')}>
            {title}
          </span>
          <svg className="absolute left-[50%] -translate-x-[50%] -bottom-0 w-[80%] h-3 text-[#2563eb] pointer-events-none" viewBox="0 0 300 20" fill="none">
            <path d="M 5,12 C 80,18 220,18 295,8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex items-center gap-4 mt-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            <span>{parsedGraph.nodes.length} TOPICS</span>
          </div>
          <span className="text-slate-200">|</span>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M6 6h10" /><path d="M6 10h10" /></svg>
            <span>BEGINNER</span>
          </div>
          <span className="text-slate-200">|</span>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
            <span>{Math.round(completionPercentage)}% COMPLETE</span>
          </div>
        </div>
        <div className="mt-4 pointer-events-auto bg-white border border-slate-200/80 p-1.5 rounded-full shadow-2xs flex items-center gap-1.5 w-fit">
          {([
            { id: 'roadmap' as const, Icon: Book, label: 'Roadmap' },
            { id: 'projects' as const, Icon: Trophy, label: 'Projects' },
            { id: 'personalize' as const, Icon: Sliders, label: 'Personalize' },
            { id: 'guides' as const, Icon: BookOpen, label: 'Guides' },
          ]).map(({ id, Icon, label }) => (
            <button key={id} onClick={() => setActiveTabSegment(id)}
              className={`px-4.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer outline-hidden focus:outline-hidden ${activeTabSegment === id ? 'bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] shadow-3xs font-black' : 'bg-transparent border border-transparent text-slate-500 hover:text-slate-800'
                }`}><Icon className="w-3.5 h-3.5" /><span>{label}</span>
            </button>
          ))}
        </div>
        {activeTabSegment === 'projects' && (
          <div className="mt-4 pointer-events-auto bg-white border border-slate-200/80 p-1.5 rounded-full shadow-2xs flex items-center gap-1.5 w-fit">
            {([
              { id: 'all' as const, Icon: Globe, label: 'All' },
              { id: 'beginner' as const, Icon: BookOpen, label: 'Beginner' },
              { id: 'intermediate' as const, Icon: Sliders, label: 'Intermediate' },
              { id: 'advanced' as const, Icon: Award, label: 'Advanced' },
            ]).map(({ id, Icon, label }) => (
              <button key={id} onClick={() => setProjectFilter(id)}
                className={`px-4.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer outline-hidden focus:outline-hidden ${projectFilter === id ? 'bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] shadow-3xs font-black' : 'bg-transparent border border-transparent text-slate-500 hover:text-slate-800'
                  }`}><Icon className="w-3.5 h-3.5" /><span>{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Scroll container */}
      <div
        ref={containerRefCallback}
        id="roadmap-scroll-container"
        className={`absolute inset-0 z-0 flex bg-[#F8FAFC] w-full h-full ${isRoadmapTab ? 'overflow-y-auto overflow-x-hidden pt-[220px]'
            : activeTabSegment === 'projects' ? 'overflow-y-auto overflow-x-hidden pt-[270px] pb-16'
              : 'overflow-y-auto overflow-x-hidden pt-[220px] pb-16'
          }`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div
          id="roadmap-content-wrapper"
          className={`relative transition-transform duration-300 origin-top-left z-10 ${isRoadmapTab ? 'py-6 mx-auto' : 'mx-auto py-6 px-8'}`}
          style={{ width: `${wrapperWidth}px`, height: `${wrapperHeight}px`, transform: `scale(${zoomLevel})` }}
        >
          <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Caveat:wght@700&display=swap');` }} />

          {/* ROADMAP TAB */}
          {activeTabSegment === 'roadmap' && (
            <>
              <svg className="absolute inset-0 pointer-events-none z-0 overflow-visible" style={{ width: CANVAS_WIDTH, height: wrapperHeight }}>
                <defs>
                  <filter id="road-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <filter id="seg-glow" x="-15%" y="-15%" width="130%" height="130%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  {roadmapSteps.map((step, idx) => {
                    const next = roadmapSteps[idx + 1];
                    if (!next) return null;
                    const sameRow = stepLayouts[idx]?.row === stepLayouts[idx + 1]?.row;
                    return (
                      <linearGradient key={`grad-${step.id}`} id={`grad-${step.id}`}
                        x1={sameRow ? '0%' : '50%'} y1={sameRow ? '50%' : '0%'}
                        x2={sameRow ? '100%' : '50%'} y2={sameRow ? '50%' : '100%'}
                        gradientUnits="objectBoundingBox">
                        <stop offset="0%" stopColor={step.lineColor} />
                        <stop offset="100%" stopColor={next.lineColor} />
                      </linearGradient>
                    );
                  })}
                </defs>
                <path d={windingPathD} fill="none" stroke="#0f172a" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" opacity={0.06} filter="url(#road-glow)" />
                <path d={windingPathD} fill="none" stroke="#1e293b" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" opacity={0.18} />
                <path d={windingPathD} fill="none" stroke="#94a3b8" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 12" opacity={0.35} />
                {roadmapSteps.map((step, idx) => {
                  if (idx === 0) return null;
                  const prev = roadmapSteps[idx - 1];
                  const pathD = segmentPaths[idx];
                  if (!pathD) return null;
                  const isCompleted = isStepCompleted(prev) && isStepCompleted(step);
                  const isCurrent = isStepCompleted(prev) && !isStepCompleted(step);
                  if (!isCompleted && !isCurrent) return null;
                  return (
                    <React.Fragment key={`seg-overlay-${step.id}`}>
                      <path d={pathD} fill="none" stroke={`url(#grad-${prev.id})`} strokeWidth={10} strokeLinecap="round" opacity={isCompleted ? 0.2 : 0.15} filter="url(#seg-glow)" />
                      <path d={pathD} fill="none" stroke={`url(#grad-${prev.id})`} strokeWidth={6} strokeLinecap="round" opacity={isCompleted ? 0.9 : 0.7} />
                      {isCurrent && (
                        <motion.path d={pathD} fill="none" stroke={`url(#grad-${prev.id})`} strokeWidth={6} strokeLinecap="round" strokeDasharray="14 18"
                          animate={{ strokeDashoffset: [-64, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }} />
                      )}
                    </React.Fragment>
                  );
                })}
                {stepLayouts.map((layout, idx) => {
                  const step = roadmapSteps[idx];
                  const isCompleted = isStepCompleted(step);
                  const isCurrent = !isCompleted && (idx === 0 || isStepCompleted(roadmapSteps[idx - 1]));
                  return (
                    <g key={`ring-${step.id}`}>
                      <circle cx={layout.coreCenterX} cy={layout.coreCenterY} r={NODE_RADIUS + 8} fill="white" opacity={0.8} />
                      <circle cx={layout.coreCenterX} cy={layout.coreCenterY} r={NODE_RADIUS + 8} fill="none" stroke={step.lineColor}
                        strokeWidth={isCompleted || isCurrent ? 3 : 2} opacity={isCompleted ? 1 : isCurrent ? 0.85 : 0.3}
                        strokeDasharray={!isCompleted && !isCurrent ? '5 4' : undefined} />
                    </g>
                  );
                })}
              </svg>

              {roadmapSteps.map((step, idx) => {
                const layout = stepLayouts[idx];
                if (!layout) return null;
                const { coreCenterX: cx, coreCenterY: cy, isCardAbove } = layout;
                const IconComponent = step.icon;
                const subtopics = [
                  ...(step.leftBranch?.type === 'subtopics' ? (step.leftBranch.subtopics || []) : []),
                  ...(step.rightBranch?.type === 'subtopics' ? (step.rightBranch.subtopics || []) : []),
                ];
                const noteText = step.leftBranch?.type === 'note' ? step.leftBranch.note?.text
                  : step.rightBranch?.type === 'note' ? step.rightBranch.note?.text : undefined;
                const hasSubtopics = subtopics.length > 0;
                const isDoubleCol = subtopics.length > 6;
                const col1 = isDoubleCol ? subtopics.slice(0, Math.ceil(subtopics.length / 2)) : [];
                const col2 = isDoubleCol ? subtopics.slice(Math.ceil(subtopics.length / 2)) : [];
                const isCompleted = isStepCompleted(step);
                const isCurrent = !isCompleted && (idx === 0 || isStepCompleted(roadmapSteps[idx - 1]));
                const stepMatched = searchQuery === '' ||
                  step.coreTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  subtopics.some(s => s.label.toLowerCase().includes(searchQuery.toLowerCase()));
                const cardW = isDoubleCol ? 320 : 250;
                const cardLeft = cx - cardW / 2;

                return (
                  <React.Fragment key={`snake-node-${step.id}`}>
                    {/* Start Badge */}
                    {step.isStart && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        style={{ position: 'absolute', left: `${cx - 46}px`, top: isCardAbove ? `${cy - NODE_RADIUS - 220}px` : `${cy - NODE_RADIUS - 44}px` }}
                        className="flex flex-col items-center gap-1 pointer-events-none select-none z-30">
                        <span className="bg-indigo-600 text-white font-black text-[9px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md animate-pulse">START HERE</span>
                        <svg className="w-3.5 h-4 text-indigo-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                        </svg>
                      </motion.div>
                    )}

                    {/* Circle Node */}
                    <motion.div
                      whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveNode(step.id)}
                      style={{
                        position: 'absolute', left: `${cx - NODE_RADIUS}px`, top: `${cy - NODE_RADIUS}px`,
                        width: `${NODE_RADIUS * 2}px`, height: `${NODE_RADIUS * 2}px`,
                        borderColor: step.lineColor,
                        boxShadow: `0 8px 24px -3px ${step.lineColor}35, 0 0 0 1px ${step.lineColor}20`,
                        opacity: stepMatched ? 1 : 0.15, zIndex: 20,
                      }}
                      className="rounded-full border-[3.5px] bg-white flex items-center justify-center cursor-pointer pointer-events-auto select-none transition-all group">
                      {isCompleted && <div style={{ backgroundColor: step.lineColor }} className="absolute inset-0 rounded-full opacity-10" />}
                      {isCurrent && (
                        <motion.div style={{ borderColor: step.lineColor }} className="absolute inset-[-6px] rounded-full border-2"
                          animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0.2, 0.6] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} />
                      )}
                      {step.coreTitle === 'JavaScript'
                        ? <span className="text-lg font-black tracking-tighter" style={{ color: step.textColor }}>JS</span>
                        : <IconComponent className="w-6 h-6 shrink-0 transition-transform duration-300 group-hover:rotate-6" style={{ color: step.textColor }} />
                      }
                      {isCompleted && (
                        <div style={{ backgroundColor: step.lineColor }} className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-xs border-2 border-white">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div style={{ backgroundColor: step.lineColor }} className="absolute -top-1 -left-1 w-5.5 h-5.5 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-xs border-2 border-white">
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                    </motion.div>

                    {/* Topic Title Directly Below Circle */}
                    <div style={{
                      position: 'absolute',
                      left: `${cx - 80}px`,
                      top: `${cy + NODE_RADIUS + 8}px`,
                      width: '160px',
                      opacity: stepMatched ? 1 : 0.15,
                      zIndex: 15
                    }}
                      className="text-center pointer-events-none select-none">
                      <h3 className="font-extrabold text-[12px] tracking-tight" style={{ color: step.textColor }}>{step.coreTitle}</h3>
                    </div>

                    {/* Connecting Dotted Stem Line */}
                    <svg style={{
                      position: 'absolute',
                      left: `${cx - 1}px`,
                      top: isCardAbove ? `${cy - NODE_RADIUS - 20}px` : `${cy + NODE_RADIUS + 28}px`,
                      width: '2px',
                      height: '20px',
                      opacity: stepMatched ? 1 : 0.15,
                      zIndex: 12
                    }} className="pointer-events-none">
                      <line x1="1" y1="0" x2="1" y2="20" stroke={step.lineColor} strokeWidth="1.5" strokeDasharray="3 3" opacity={0.75} />
                    </svg>

                    {/* Detail/Checklist Card (Alternating ABOVE / BELOW) */}
                    <div style={{
                      position: 'absolute',
                      left: `${cardLeft}px`,
                      ...(isCardAbove
                        ? { bottom: `${wrapperHeight - (cy - NODE_RADIUS - 18)}px` }
                        : { top: `${cy + NODE_RADIUS + 34}px` }),
                      width: `${cardW}px`,
                      opacity: stepMatched ? 1 : 0.15,
                      zIndex: 15
                    }}
                      className="flex flex-col items-center gap-2.5 pointer-events-auto transition-opacity duration-200">
                      {hasSubtopics && (
                        <div style={{ backgroundColor: `${step.lightBg}80`, borderColor: `${step.borderColor}95` }}
                          className="w-full rounded-2xl border p-3.5 shadow-xs flex flex-col gap-2 backdrop-blur-sm">
                          {!isDoubleCol ? (
                            <div className="relative w-full flex flex-col gap-2.5">
                              <div style={{ backgroundColor: `${step.lineColor}25` }} className="absolute left-[6.5px] top-1 bottom-1 w-[2px] rounded-full" />
                              {subtopics.map((sub, sIdx) => {
                                const isDone = progress[sub.id]?.status === 'COMPLETED';
                                return (
                                  <div key={`${sub.id}-${sIdx}`} onClick={e => { e.stopPropagation(); setActiveNode(sub.id); }} className="flex items-center gap-2 cursor-pointer group hover:scale-[1.01] transition-transform">
                                    {isDone
                                      ? <CheckCircle2 className="w-[14px] h-[14px] text-emerald-600 fill-emerald-50 shrink-0 cursor-pointer z-10" onClick={e => { e.stopPropagation(); toggleNodeCompletion(sub.id); }} />
                                      : <span style={{ borderColor: step.lineColor }} className="w-[14px] h-[14px] rounded-full border-2 bg-white flex items-center justify-center shrink-0 cursor-pointer z-10 group-hover:scale-105 transition-transform" onClick={e => { e.stopPropagation(); toggleNodeCompletion(sub.id); }}>
                                        <span style={{ backgroundColor: step.lineColor }} className="w-1.5 h-1.5 rounded-full" />
                                      </span>}
                                    <span className={`text-[10.5px] font-bold text-slate-700 truncate leading-tight ${isDone ? 'line-through opacity-60' : ''}`}>{sub.label}</span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="w-full flex flex-row gap-4 justify-between">
                              {[col1, col2].map((col, cIdx) => (
                                <div key={cIdx} className="flex-1 flex flex-col gap-2.5 relative min-w-0">
                                  <div style={{ backgroundColor: `${step.lineColor}25` }} className="absolute left-[6.5px] top-1 bottom-1 w-[2px] rounded-full" />
                                  {col.map((sub, sIdx) => {
                                    const isDone = progress[sub.id]?.status === 'COMPLETED';
                                    return (
                                      <div key={`${sub.id}-${sIdx}`} onClick={e => { e.stopPropagation(); setActiveNode(sub.id); }} className="flex items-center gap-2 cursor-pointer group hover:scale-[1.01] transition-transform min-w-0">
                                        {isDone
                                          ? <CheckCircle2 className="w-[14px] h-[14px] text-emerald-600 fill-emerald-50 shrink-0 cursor-pointer z-10" onClick={e => { e.stopPropagation(); toggleNodeCompletion(sub.id); }} />
                                          : <span style={{ borderColor: step.lineColor }} className="w-[14px] h-[14px] rounded-full border-2 bg-white flex items-center justify-center shrink-0 cursor-pointer z-10 group-hover:scale-105 transition-transform" onClick={e => { e.stopPropagation(); toggleNodeCompletion(sub.id); }}>
                                            <span style={{ backgroundColor: step.lineColor }} className="w-1.5 h-1.5 rounded-full" />
                                          </span>}
                                        <span className={`text-[10px] font-bold text-slate-700 truncate leading-tight ${isDone ? 'line-through opacity-60' : ''}`}>{sub.label}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {noteText && (
                        <div style={{ backgroundColor: `${step.lightBg}40`, borderColor: `${step.borderColor}60`, color: step.textColor }}
                          className="w-full border border-dashed rounded-xl px-3 py-2 text-[10px] font-bold leading-relaxed text-center shadow-3xs">
                          {noteText}
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}

              <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)' }}
                className="bg-[#e8f0fe]/40 border border-[#1a73e8]/20 px-6 py-2.5 rounded-full shadow-3xs flex items-center gap-2 pointer-events-auto z-20 animate-pulse whitespace-nowrap">
                <div className="w-5 h-5 rounded-full bg-[#1a73e8] text-white flex items-center justify-center text-[10px] shadow-sm">*</div>
                <span className="text-[11px] font-extrabold text-slate-700">Keep learning step by step. Complete each topic and build amazing projects!</span>
              </div>
            </>
          )}

          {/* PROJECTS TAB */}
          {activeTabSegment === 'projects' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
              style={{ position: 'absolute', top: '20px', left: '50px', width: '1100px' }}
              className="flex flex-col items-center pointer-events-auto pb-24 text-center select-none">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8 text-left">
                {filteredProjects.map(p => {
                  const Icon = p.icon;
                  return (
                    <motion.div key={p.id} whileHover={{ y: -3, scale: 1.01 }}
                      className="bg-white border border-slate-150/80 rounded-3xl p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between h-[190px] relative group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${p.iconBg} flex items-center justify-center border border-slate-100 shadow-3xs`}><Icon className="w-4.5 h-4.5" style={{ color: p.iconColor }} /></div>
                          <span className="bg-[#FEF3C7] text-[#D97706] rounded-md px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide">{p.difficulty}</span>
                        </div>
                        <span className="bg-[#F1F5F9] text-[#475569] rounded-md px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide">{p.category}</span>
                      </div>
                      <div className="flex-1 flex flex-col justify-center mt-2.5">
                        <h3 className="text-[13px] font-black text-slate-800 tracking-tight leading-snug">{p.title}</h3>
                        <p className="text-[10.5px] text-slate-400 font-semibold mt-1.5 leading-relaxed line-clamp-2">{p.description}</p>
                      </div>
                      <div className="flex items-center justify-between mt-3.5">
                        <div className="flex items-center gap-1.5 text-slate-400"><Users className="w-3.5 h-3.5" /><span className="text-[10px] font-extrabold">{p.startedCount || '0 Started'}</span></div>
                        <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center transition-all group-hover:bg-blue-50 group-hover:border-blue-200"><ArrowRight className="w-3 h-3 text-slate-700" /></div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* PERSONALIZE TAB */}
          {activeTabSegment === 'personalize' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
              style={{ position: 'absolute', top: '20px', left: '100px', width: '1000px' }}
              className="flex flex-col items-center pointer-events-auto pb-24 text-center select-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-2 text-left">
                <div className="bg-white border border-slate-150/80 rounded-3xl p-6 shadow-2xs flex flex-col gap-4">
                  <div><h3 className="text-sm font-black text-slate-800 tracking-tight">Your Goal</h3><p className="text-[11px] text-slate-400 font-semibold mt-0.5">What do you want to achieve?</p></div>
                  <div className="flex flex-col gap-3">
                    {([
                      { key: 'learn' as const, label: 'Learn Frontend', sub: 'I want to learn frontend development', icon: Code, bg: 'bg-purple-50', color: 'text-purple-600' },
                      { key: 'job' as const, label: 'Get a Job', sub: 'I want to become a frontend developer', icon: Briefcase, bg: 'bg-emerald-50', color: 'text-emerald-600' },
                      { key: 'projects' as const, label: 'Build Projects', sub: 'I want to build real-world projects', icon: Box, bg: 'bg-amber-50/70', color: 'text-amber-600' },
                    ]).map(({ key, label, sub, icon: Ic, bg, color }) => (
                      <div key={key} onClick={() => setSelectedGoal(key)}
                        className={`p-3.5 border rounded-2xl flex items-center cursor-pointer transition-all ${selectedGoal === key ? 'border-[#d2e3fc] bg-[#e8f0fe]/20 shadow-3xs' : 'border-slate-150 bg-white hover:bg-slate-50/50'}`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedGoal === key ? 'border-[#1a73e8] bg-white' : 'border-slate-300'}`}>
                          {selectedGoal === key && <div className="w-2.5 h-2.5 rounded-full bg-[#1a73e8]" />}
                        </div>
                        <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center border border-slate-100 shadow-3xs ml-3`}><Ic className={`w-4.5 h-4.5 ${color}`} /></div>
                        <div className="flex flex-col ml-3"><span className="text-xs font-black text-slate-800 leading-snug">{label}</span><span className="text-[10px] text-slate-400 font-semibold mt-0.5">{sub}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-slate-150/80 rounded-3xl p-6 shadow-2xs flex flex-col gap-4">
                  <div><h3 className="text-sm font-black text-slate-800 tracking-tight">Your Commitment</h3><p className="text-[11px] text-slate-400 font-semibold mt-0.5">How much time can you invest?</p></div>
                  <div className="flex flex-col gap-3">
                    {([
                      { key: 'casual' as const, label: 'Casual', sub: '1-2 hours / week', bg: 'bg-sky-50', color: 'text-sky-600' },
                      { key: 'regular' as const, label: 'Regular', sub: '3-5 hours / week', bg: 'bg-indigo-50', color: 'text-indigo-600' },
                      { key: 'intensive' as const, label: 'Intensive', sub: '10+ hours / week', bg: 'bg-rose-50', color: 'text-rose-600' },
                    ]).map(({ key, label, sub, bg, color }) => (
                      <div key={key} onClick={() => setSelectedCommitment(key)}
                        className={`p-3.5 border rounded-2xl flex items-center cursor-pointer transition-all ${selectedCommitment === key ? 'border-[#d2e3fc] bg-[#e8f0fe]/20 shadow-3xs' : 'border-slate-150 bg-white hover:bg-slate-50/50'}`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedCommitment === key ? 'border-[#1a73e8] bg-white' : 'border-slate-300'}`}>
                          {selectedCommitment === key && <div className="w-2.5 h-2.5 rounded-full bg-[#1a73e8]" />}
                        </div>
                        <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center border border-slate-100 shadow-3xs ml-3`}><Clock className={`w-4.5 h-4.5 ${color}`} /></div>
                        <div className="flex flex-col ml-3"><span className="text-xs font-black text-slate-800 leading-snug">{label}</span><span className="text-[10px] text-slate-400 font-semibold mt-0.5">{sub}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white border border-slate-150/80 rounded-3xl p-6 shadow-2xs flex flex-col gap-4 w-full mt-8">
                <div><h3 className="text-sm font-black text-slate-800 tracking-tight">Focus Areas</h3><p className="text-[11px] text-slate-400 font-semibold mt-0.5">Select the topics you want to focus on.</p></div>
                <div className="flex flex-wrap gap-2">
                  {['html', 'css', 'javascript', 'react', 'nextjs', 'typescript', 'testing', 'deployment'].map(area => {
                    const sel = selectedFocusAreas.includes(area);
                    return (
                      <button key={area} onClick={() => setSelectedFocusAreas(prev => sel ? prev.filter(a => a !== area) : [...prev, area])}
                        className={`px-4 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide transition-all cursor-pointer border ${sel ? 'bg-[#e8f0fe] text-[#1a73e8] border-[#d2e3fc]' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                      >{area}</button>
                    );
                  })}
                </div>
              </div>
              <button className="mt-8 bg-[#1a73e8] text-white font-black text-xs uppercase tracking-wider px-8 py-3 rounded-full shadow-md hover:bg-[#1558b0] transition-colors cursor-pointer">Save Preferences</button>
            </motion.div>
          )}

          {/* GUIDES TAB */}
          {activeTabSegment === 'guides' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
              style={{ position: 'absolute', top: '20px', left: '100px', width: '1000px' }}
              className="flex flex-col items-center pointer-events-auto pb-24 text-center select-none">
              <div className="mt-2 pointer-events-auto bg-white border border-slate-200/80 p-1.5 rounded-full shadow-2xs flex items-center gap-1.5 w-fit">
                {(['all', 'html', 'css', 'javascript'] as const).map(f => (
                  <button key={f} onClick={() => setGuideTopicFilter(f)}
                    className={`px-4.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer outline-hidden focus:outline-hidden ${guideTopicFilter === f ? 'bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] shadow-3xs font-black' : 'bg-transparent border border-transparent text-slate-500 hover:text-slate-800'}`}
                  >{f.toUpperCase()}</button>
                ))}
              </div>
              <div className="flex flex-col gap-4 w-full mt-6 text-left">
                {filteredGuides.map(g => {
                  const Icon = g.icon;
                  return (
                    <motion.div key={g.id} whileHover={{ y: -2, scale: 1.005 }}
                      className="bg-white border border-slate-150/80 rounded-3xl p-5 shadow-2xs hover:shadow-xs transition-all flex items-center gap-5 group cursor-pointer">
                      <div className={`w-11 h-11 rounded-full ${g.iconBg} flex items-center justify-center border border-slate-100 shadow-3xs shrink-0`}><Icon className="w-5 h-5" style={{ color: g.iconColor }} /></div>
                      <div className="flex-1 min-w-0"><h3 className="text-[13px] font-black text-slate-800 tracking-tight leading-snug">{g.title}</h3><p className="text-[10.5px] text-slate-400 font-semibold mt-0.5 leading-relaxed">{g.description}</p></div>
                      <div className="flex items-center gap-6">
                        <span className={`${g.tagBg} ${g.tagColor} ${g.tagBorder} border rounded-lg px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide`}>{g.category}</span>
                        <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap">{g.readTime}</span>
                        <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center transition-all group-hover:bg-blue-50 group-hover:border-blue-150"><ArrowRight className="w-3.5 h-3.5 text-blue-650" /></div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* 4. Minimap */}
      {isRoadmapTab && (
        <div className="absolute right-8 top-24 pointer-events-none z-20">
          <div onClick={handleMinimapClick}
            className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm w-60 h-24 flex flex-col justify-between pointer-events-auto cursor-pointer select-none hover:border-indigo-200 transition-colors animate-fade-in"
            title="Click to jump to scroll position">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">MINIMAP</span>
            <div className="flex-1 relative my-1 overflow-hidden bg-slate-50/70 rounded-lg border border-slate-100 p-1">
              <svg viewBox="0 0 160 60" className="w-full h-full fill-none">
                {Array.from({ length: numRows }).map((_, rIdx) => {
                  const rY = 12 + rIdx * (36 / Math.max(1, numRows - 1));
                  const isLastRow = rIdx === numRows - 1;
                  const isEvenRow = rIdx % 2 === 0;
                  const nextRY = 12 + (rIdx + 1) * (36 / Math.max(1, numRows - 1));
                  return (
                    <React.Fragment key={`mini-row-${rIdx}`}>
                      <line x1="8" y1={rY} x2="152" y2={rY} stroke="#cbd5e1" strokeWidth="1.2" />
                      {!isLastRow && (
                        isEvenRow
                          ? <path d={`M 152 ${rY} C 162 ${rY}, 162 ${nextRY}, 152 ${nextRY}`} stroke="#cbd5e1" strokeWidth="1.2" fill="none" />
                          : <path d={`M 8 ${rY} C -2 ${rY}, -2 ${nextRY}, 8 ${nextRY}`} stroke="#cbd5e1" strokeWidth="1.2" fill="none" />
                      )}
                    </React.Fragment>
                  );
                })}
                {roadmapSteps.map((step, idx) => {
                  const layout = stepLayouts[idx];
                  if (!layout) return null;
                  const miniY = 12 + layout.row * (36 / Math.max(1, numRows - 1));
                  const nodesInRow = Math.min(NODES_PER_ROW, roadmapSteps.length - layout.row * NODES_PER_ROW);
                  const posIndex = layout.isLTR ? layout.posInRow : (nodesInRow - 1 - layout.posInRow);
                  const miniX = 8 + posIndex * (144 / Math.max(1, nodesInRow - 1));
                  const isDone = isStepCompleted(step);
                  return <circle key={`mini-node-${step.id}`} cx={miniX} cy={miniY} r="3" fill={isDone ? step.lineColor : step.lightBg} stroke={step.lineColor} strokeWidth="0.8" opacity={isDone ? 1 : 0.7} />;
                })}
                {(() => {
                  const barH = Math.max(10, viewportRatio * 60);
                  const barY = scrollProgress * (60 - barH);
                  return <rect x="0" y={barY} width="160" height={barH} rx="3" stroke="#6366F1" strokeWidth="1" fill="rgba(99,102,241,0.08)" />;
                })()}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* 5. Zoom controls */}
      <div className="absolute right-8 bottom-8 pointer-events-none z-20">
        <div className="bg-white border border-slate-100 rounded-xl p-1 shadow-sm flex flex-col gap-1 w-9 pointer-events-auto">
          <button onClick={handleZoomIn} className="w-7 h-7 flex items-center justify-center hover:bg-slate-50 rounded-lg text-slate-500 font-extrabold text-sm transition-colors hover:text-indigo-600" title="Zoom In">+</button>
          <div className="h-[1px] bg-slate-100 mx-1.5" />
          <button onClick={handleZoomOut} className="w-7 h-7 flex items-center justify-center hover:bg-slate-50 rounded-lg text-slate-500 font-extrabold text-sm transition-colors hover:text-indigo-600" title="Zoom Out">-</button>
          <div className="h-[1px] bg-slate-100 mx-1.5" />
          <button onClick={handleResetView} className="w-7 h-7 flex items-center justify-center hover:bg-slate-50 rounded-lg text-slate-555 transition-colors hover:text-indigo-600" title="Reset View">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current fill-none stroke-[2]" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
          </button>
          <div className="h-[1px] bg-slate-100 mx-1.5" />
          <button onClick={() => { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); }}
            className="w-7 h-7 flex items-center justify-center hover:bg-slate-50 rounded-lg text-slate-555 transition-colors hover:text-indigo-600" title="Toggle Fullscreen">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current fill-none stroke-[2]" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
          </button>
        </div>
      </div>

      <LearningDrawer nodes={parsedGraph.nodes} />
    </div>
  );
};
