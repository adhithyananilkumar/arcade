'use client';

import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { parseRoadmapGraph } from '../engine/parser';
import { LearningDrawer } from './LearningDrawer';
import { HybridTaskProjectCard, HybridCardTheme } from './HybridTaskProjectCard';
import { ColorThemeProjectCard, CardColorTheme } from './ColorThemeProjectCard';
import { ProjectDetailDrawer, ProjectDetailData } from './ProjectDetailDrawer';
import { RoadmapProjectDetailView, RoadmapProjectDetail } from './RoadmapProjectDetailView';
import { useRoadmapViewerStore } from '../store/useRoadmapViewerStore';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCircle2,
  Flame,
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
  Image as ImageIcon,
  MessageSquare,
  HelpCircle,
  Users,
  Briefcase,
  Box,
  Clock,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  Lock,
  X,
  Layers,
  Zap,
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
  code?: string;
  type: 'essential' | 'important' | 'advanced' | 'optional';
}

interface NoteBubble {
  text: string;
}

interface DeepSubBranch {
  id: string;
  code: string;
  title: string;
  topicCount: number;
  items: { code: string; label: string; active?: boolean }[];
}

const SUB_BRANCH_DICTIONARY: Record<string, DeepSubBranch> = {
  // INTERNET Subtopics
  '1.1': {
    id: 'subbranch-internet-whatis',
    code: '1.1',
    title: 'What is Internet?',
    topicCount: 4,
    items: [
      { code: '1.1.1', label: 'Global Network of Networks' },
      { code: '1.1.2', label: 'Packets & Data Routing' },
      { code: '1.1.3', label: 'Clients & Servers' },
      { code: '1.1.4', label: 'ISPs & Infrastructure' },
    ]
  },
  '1.2': {
    id: 'subbranch-internet-howitworks',
    code: '1.2',
    title: 'How Internet Works',
    topicCount: 4,
    items: [
      { code: '1.2.1', label: 'Submarine Fiber Cables' },
      { code: '1.2.2', label: 'IP Addressing (IPv4 & IPv6)' },
      { code: '1.2.3', label: 'Routers & Switches' },
      { code: '1.2.4', label: 'TCP/IP Protocol Suite' },
    ]
  },
  '1.3': {
    id: 'subbranch-dns-http',
    code: '1.3',
    title: 'DNS, HTTP & HTTPS',
    topicCount: 4,
    items: [
      { code: '1.3.1', label: 'DNS Name Resolution' },
      { code: '1.3.2', label: 'HTTP Methods & Headers' },
      { code: '1.3.3', label: 'SSL/TLS Encryption' },
      { code: '1.3.4', label: 'HTTP Status Codes' },
    ]
  },
  '1.4': {
    id: 'subbranch-browsers',
    code: '1.4',
    title: 'Browsers & Engines',
    topicCount: 4,
    items: [
      { code: '1.4.1', label: 'Rendering Engines (Blink/Gecko)' },
      { code: '1.4.2', label: 'HTML/CSS Parsing & DOM Tree' },
      { code: '1.4.3', label: 'JavaScript V8 Engine' },
      { code: '1.4.4', label: 'Browser Storage (Cookies/LocalStorage)' },
    ]
  },

  // HTML Subtopics
  '2.1': {
    id: 'subbranch-html-semantic',
    code: '2.1',
    title: 'Semantic HTML',
    topicCount: 8,
    items: [
      { code: '2.1.1', label: 'Semantic Elements (<header>, <nav>, <article>)' },
      { code: '2.1.2', label: 'Document Structure & Outline' },
      { code: '2.1.3', label: 'Sectioning vs Generic Containers' },
      { code: '2.1.4', label: 'Heading Hierarchy (h1-h6)' },
      { code: '2.1.5', label: '<main>, <footer> & <aside>' },
      { code: '2.1.6', label: '<figure> & <figcaption>' },
      { code: '2.1.7', label: 'SEO & Accessibility Impact' },
      { code: '2.1.8', label: 'HTML5 Best Practices' },
    ]
  },
  '2.2': {
    id: 'subbranch-html-forms',
    code: '2.2',
    title: 'Forms & Validation',
    topicCount: 8,
    items: [
      { code: '2.2.1', label: 'Form Elements' },
      { code: '2.2.2', label: 'Input Types' },
      { code: '2.2.3', label: 'Labels & Placeholders' },
      { code: '2.2.4', label: 'Validation Attributes' },
      { code: '2.2.5', label: 'Pattern Validation' },
      { code: '2.2.6', label: 'Custom Validation' },
      { code: '2.2.7', label: 'Radio & Checkbox' },
      { code: '2.2.8', label: 'Select & Textarea' },
    ]
  },
  '2.3': {
    id: 'subbranch-html-accessibility',
    code: '2.3',
    title: 'Accessibility',
    topicCount: 6,
    items: [
      { code: '2.3.1', label: 'ARIA Attributes & Roles' },
      { code: '2.3.2', label: 'Keyboard Navigation & Focus' },
      { code: '2.3.3', label: 'Screen Reader Compatibility' },
      { code: '2.3.4', label: 'Alt Text & Media Descriptions' },
      { code: '2.3.5', label: 'Color Contrast Standards' },
      { code: '2.3.6', label: 'Accessible Form Controls' },
    ]
  },
  '2.4': {
    id: 'subbranch-html-seo',
    code: '2.4',
    title: 'SEO Basics',
    topicCount: 5,
    items: [
      { code: '2.4.1', label: 'Meta Tags & Description' },
      { code: '2.4.2', label: 'Open Graph & Social Cards' },
      { code: '2.4.3', label: 'Structured Data & Schema.org' },
      { code: '2.4.4', label: 'Canonical Tags & Robots.txt' },
      { code: '2.4.5', label: 'Sitemaps & Indexing' },
    ]
  },
  '2.5': {
    id: 'subbranch-html-tables',
    code: '2.5',
    title: 'Tables & Lists',
    topicCount: 5,
    items: [
      { code: '2.5.1', label: '<table>, <thead> & <tbody>' },
      { code: '2.5.2', label: 'Ordered & Unordered Lists' },
      { code: '2.5.3', label: 'Nested Lists & Spacing' },
      { code: '2.5.4', label: 'Description Lists (<dl>, <dt>, <dd>)' },
      { code: '2.5.5', label: 'Table Accessibility & Headers' },
    ]
  },
  '2.6': {
    id: 'subbranch-html-media',
    code: '2.6',
    title: 'Media (Audio, Video)',
    topicCount: 5,
    items: [
      { code: '2.6.1', label: '<audio> Tag & Formats' },
      { code: '2.6.2', label: '<video> Tag & Controls' },
      { code: '2.6.3', label: '<track> & Captions/Subtitles' },
      { code: '2.6.4', label: 'Responsive Embedded Media' },
      { code: '2.6.5', label: 'Media Formats & Codecs' },
    ]
  },

  // CSS Subtopics
  '3.1': {
    id: 'subbranch-css-selectors',
    code: '3.1',
    title: 'Selectors',
    topicCount: 8,
    items: [
      { code: '3.1.1', label: 'Basic Selectors' },
      { code: '3.1.2', label: 'Combinators' },
      { code: '3.1.3', label: 'Pseudo-classes' },
      { code: '3.1.4', label: 'Pseudo-elements' },
      { code: '3.1.5', label: 'Attribute Selectors' },
      { code: '3.1.6', label: 'Advanced Selectors' },
      { code: '3.1.7', label: 'Specificity' },
      { code: '3.1.8', label: 'Best Practices' },
    ]
  },
  '3.2': {
    id: 'subbranch-css-boxmodel',
    code: '3.2',
    title: 'Box Model',
    topicCount: 6,
    items: [
      { code: '3.2.1', label: 'Content & Padding' },
      { code: '3.2.2', label: 'Borders & Outline' },
      { code: '3.2.3', label: 'Margin & Collapsing' },
      { code: '3.2.4', label: 'box-sizing: border-box' },
      { code: '3.2.5', label: 'Width & Height Constraints' },
      { code: '3.2.6', label: 'Overflow Handling' },
    ]
  },
  '3.3': {
    id: 'subbranch-css-flexbox',
    code: '3.3',
    title: 'Flexbox',
    topicCount: 6,
    items: [
      { code: '3.3.1', label: 'Flex Container & Items' },
      { code: '3.3.2', label: 'Flex Direction & Wrap' },
      { code: '3.3.3', label: 'Justify Content & Align Items' },
      { code: '3.3.4', label: 'Flex Grow, Shrink & Basis' },
      { code: '3.3.5', label: 'Align Self & Order' },
      { code: '3.3.6', label: 'Flexbox Layout Patterns' },
    ]
  },
  '3.4': {
    id: 'subbranch-css-grid',
    code: '3.4',
    title: 'CSS Grid',
    topicCount: 6,
    items: [
      { code: '3.4.1', label: 'Grid Template Columns & Rows' },
      { code: '3.4.2', label: 'Grid Gap & Fractional Units (fr)' },
      { code: '3.4.3', label: 'Grid Area & Placement' },
      { code: '3.4.4', label: 'Auto-fit & Auto-fill' },
      { code: '3.4.5', label: 'Subgrid & Nested Grids' },
      { code: '3.4.6', label: 'Grid vs Flexbox' },
    ]
  },
  '3.5': {
    id: 'subbranch-css-responsive',
    code: '3.5',
    title: 'Responsive Design',
    topicCount: 5,
    items: [
      { code: '3.5.1', label: 'Media Queries & Breakpoints' },
      { code: '3.5.2', label: 'Mobile-First Approach' },
      { code: '3.5.3', label: 'Fluid Typography & clamp()' },
      { code: '3.5.4', label: 'Responsive Images & picture' },
      { code: '3.5.5', label: 'Viewport Units (vw, vh, dvh)' },
    ]
  },
  '3.6': {
    id: 'subbranch-css-animations',
    code: '3.6',
    title: 'Animations',
    topicCount: 4,
    items: [
      { code: '3.6.1', label: 'Transitions & Timing Functions' },
      { code: '3.6.2', label: 'Keyframe Animations (@keyframes)' },
      { code: '3.6.3', label: 'Transforms (Scale, Rotate, Translate)' },
      { code: '3.6.4', label: 'GPU Acceleration & Performance' },
    ]
  },
  '3.7': {
    id: 'subbranch-css-variables',
    code: '3.7',
    title: 'CSS Variables',
    topicCount: 4,
    items: [
      { code: '3.7.1', label: 'Declaring Custom Properties' },
      { code: '3.7.2', label: 'var() Fallbacks & Scoping' },
      { code: '3.7.3', label: 'Dynamic Theme Switching' },
      { code: '3.7.4', label: 'JS Interaction with CSS Variables' },
    ]
  },
  '3.8': {
    id: 'subbranch-css-tailwind',
    code: '3.8',
    title: 'Tailwind CSS',
    topicCount: 4,
    items: [
      { code: '3.8.1', label: 'Utility-First Fundamentals' },
      { code: '3.8.2', label: 'Layout & Spacing Classes' },
      { code: '3.8.3', label: 'Responsive Breakpoints' },
      { code: '3.8.4', label: 'Dark Mode & Custom Config' },
    ]
  },

  // JS Subtopics
  '4.1': {
    id: 'subbranch-js-variables',
    code: '4.1',
    title: 'Variables & Data Types',
    topicCount: 6,
    items: [
      { code: '4.1.1', label: 'var vs let vs const' },
      { code: '4.1.2', label: 'Primitives vs Objects' },
      { code: '4.1.3', label: 'Type Conversion & Coercion' },
      { code: '4.1.4', label: 'Strings & Template Literals' },
      { code: '4.1.5', label: 'Numbers & BigInt' },
      { code: '4.1.6', label: 'Symbols & Booleans' },
    ]
  },
  '4.2': {
    id: 'subbranch-js-operators',
    code: '4.2',
    title: 'Operators',
    topicCount: 5,
    items: [
      { code: '4.2.1', label: 'Arithmetic & Assignment' },
      { code: '4.2.2', label: 'Comparison & Equality (== vs ===)' },
      { code: '4.2.3', label: 'Logical & Short-circuiting' },
      { code: '4.2.4', label: 'Nullish Coalescing (??)' },
      { code: '4.2.5', label: 'Ternary Operator' },
    ]
  },
  '4.3': {
    id: 'subbranch-js-functions',
    code: '4.3',
    title: 'Functions',
    topicCount: 10,
    items: [
      { code: '4.3.1', label: 'Function Declaration' },
      { code: '4.3.2', label: 'Function Expression' },
      { code: '4.3.3', label: 'Arrow Functions' },
      { code: '4.3.4', label: 'Default Parameters' },
      { code: '4.3.5', label: 'Rest Parameters' },
      { code: '4.3.6', label: 'Callbacks' },
      { code: '4.3.7', label: 'Higher Order Functions' },
      { code: '4.3.8', label: 'Recursion' },
      { code: '4.3.9', label: 'Closures' },
      { code: '4.3.10', label: 'Best Practices' },
    ]
  },
  '4.4': {
    id: 'subbranch-js-dom',
    code: '4.4',
    title: 'DOM Manipulation',
    topicCount: 6,
    items: [
      { code: '4.4.1', label: 'Selecting Elements (querySelector)' },
      { code: '4.4.2', label: 'Modifying Attributes & Styles' },
      { code: '4.4.3', label: 'Creating & Removing Elements' },
      { code: '4.4.4', label: 'classList API' },
      { code: '4.4.5', label: 'DOM Traversal' },
      { code: '4.4.6', label: 'Inner HTML vs TextContent' },
    ]
  },
  '4.5': {
    id: 'subbranch-js-arrays',
    code: '4.5',
    title: 'Arrays & Objects',
    topicCount: 6,
    items: [
      { code: '4.5.1', label: 'Array Methods (map, filter, reduce)' },
      { code: '4.5.2', label: 'Mutation vs Non-mutation' },
      { code: '4.5.3', label: 'Object Destructuring & Spread' },
      { code: '4.5.4', label: 'Object.keys(), values(), entries()' },
      { code: '4.5.5', label: 'Optional Chaining (?.)' },
      { code: '4.5.6', label: 'JSON Parsing & Serialization' },
    ]
  },
  '4.6': {
    id: 'subbranch-js-events',
    code: '4.6',
    title: 'Events',
    topicCount: 5,
    items: [
      { code: '4.6.1', label: 'addEventListener & Event Object' },
      { code: '4.6.2', label: 'Event Bubbling & Capturing' },
      { code: '4.6.3', label: 'Event Delegation' },
      { code: '4.6.4', label: 'Keyboard & Mouse Events' },
      { code: '4.6.5', label: 'Form Events & preventDefault()' },
    ]
  },
  '4.7': {
    id: 'subbranch-js-async',
    code: '4.7',
    title: 'Async JavaScript',
    topicCount: 6,
    items: [
      { code: '4.7.1', label: 'Event Loop & Microtasks' },
      { code: '4.7.2', label: 'Callbacks & Async Flow' },
      { code: '4.7.3', label: 'Promises & Chaining' },
      { code: '4.7.4', label: 'async / await Syntax' },
      { code: '4.7.5', label: 'fetch() API & Error Handling' },
      { code: '4.7.6', label: 'Promise.all & Promise.race' },
    ]
  },
  '4.8': {
    id: 'subbranch-js-es6',
    code: '4.8',
    title: 'ES6+ Features',
    topicCount: 5,
    items: [
      { code: '4.8.1', label: 'ES Modules (import / export)' },
      { code: '4.8.2', label: 'Spread & Rest Operators' },
      { code: '4.8.3', label: 'Template Literals' },
      { code: '4.8.4', label: 'Map & Set Data Structures' },
      { code: '4.8.5', label: 'Classes & Inheritance' },
    ]
  },

  // REACT Subtopics
  '5.1': {
    id: 'subbranch-react-components',
    code: '5.1',
    title: 'Components',
    topicCount: 5,
    items: [
      { code: '5.1.1', label: 'JSX Syntax & Rules' },
      { code: '5.1.2', label: 'Functional Components' },
      { code: '5.1.3', label: 'Component Nesting & Reusability' },
      { code: '5.1.4', label: 'Fragments & Conditional Rendering' },
      { code: '5.1.5', label: 'List Rendering & Keys' },
    ]
  },
  '5.2': {
    id: 'subbranch-react-props',
    code: '5.2',
    title: 'Props & State',
    topicCount: 5,
    items: [
      { code: '5.2.1', label: 'Passing & Destructuring Props' },
      { code: '5.2.2', label: 'Prop Types & Default Props' },
      { code: '5.2.3', label: 'State vs Props' },
      { code: '5.2.4', label: 'Lifting State Up' },
      { code: '5.2.5', label: 'Unidirectional Data Flow' },
    ]
  },
  '5.3': {
    id: 'subbranch-react-hooks',
    code: '5.3',
    title: 'Hooks',
    topicCount: 8,
    items: [
      { code: '5.3.1', label: 'useState' },
      { code: '5.3.2', label: 'useEffect' },
      { code: '5.3.3', label: 'useContext' },
      { code: '5.3.4', label: 'useReducer' },
      { code: '5.3.5', label: 'useCallback' },
      { code: '5.3.6', label: 'useMemo' },
      { code: '5.3.7', label: 'Custom Hooks' },
      { code: '5.3.8', label: 'Rules of Hooks' },
    ]
  },
  '5.4': {
    id: 'subbranch-react-router',
    code: '5.4',
    title: 'React Router',
    topicCount: 5,
    items: [
      { code: '5.4.1', label: 'BrowserRouter & Route' },
      { code: '5.4.2', label: 'Link & NavLink Components' },
      { code: '5.4.3', label: 'Dynamic URL Params (useParams)' },
      { code: '5.4.4', label: 'useNavigate Hook' },
      { code: '5.4.5', label: 'Nested Routes & Outlet' },
    ]
  },
  '5.5': {
    id: 'subbranch-react-state',
    code: '5.5',
    title: 'State Management',
    topicCount: 4,
    items: [
      { code: '5.5.1', label: 'Context API for Global State' },
      { code: '5.5.2', label: 'Zustand & Redux Toolkit' },
      { code: '5.5.3', label: 'React Query / TanStack Query' },
      { code: '5.5.4', label: 'Server State vs Client State' },
    ]
  },

  // GIT Subtopics
  '6.1': {
    id: 'subbranch-git-intro',
    code: '6.1',
    title: 'What is Git?',
    topicCount: 4,
    items: [
      { code: '6.1.1', label: 'Version Control Concepts' },
      { code: '6.1.2', label: 'Local vs Distributed VCS' },
      { code: '6.1.3', label: 'Git Architecture (Working, Staging, Repo)' },
      { code: '6.1.4', label: 'Installing & Configuring Git' },
    ]
  },
  '6.2': {
    id: 'subbranch-git-repos',
    code: '6.2',
    title: 'Repositories',
    topicCount: 4,
    items: [
      { code: '6.2.1', label: 'git init & Local Repos' },
      { code: '6.2.2', label: 'git clone & Remote Setup' },
      { code: '6.2.3', label: 'Managing Remotes (git remote)' },
      { code: '6.2.4', label: '.gitignore File Setup' },
    ]
  },
  '6.3': {
    id: 'subbranch-git-commit',
    code: '6.3',
    title: 'Commit & Push',
    topicCount: 4,
    items: [
      { code: '6.3.1', label: 'git add & Staging Area' },
      { code: '6.3.2', label: 'git commit & Commit Messages' },
      { code: '6.3.3', label: 'git push & Upstream Branches' },
      { code: '6.3.4', label: 'git status & git log History' },
    ]
  },
  '6.4': {
    id: 'subbranch-git-branches',
    code: '6.4',
    title: 'Branches',
    topicCount: 6,
    items: [
      { code: '6.4.1', label: 'Creating Branches' },
      { code: '6.4.2', label: 'Switching Branches' },
      { code: '6.4.3', label: 'Merging Branches' },
      { code: '6.4.4', label: 'Deleting Branches' },
      { code: '6.4.5', label: 'Branch Conflicts' },
      { code: '6.4.6', label: 'Best Practices' },
    ]
  },
  '6.5': {
    id: 'subbranch-git-pr',
    code: '6.5',
    title: 'Pull Requests',
    topicCount: 4,
    items: [
      { code: '6.5.1', label: 'Creating Pull Requests' },
      { code: '6.5.2', label: 'Code Review & Approvals' },
      { code: '6.5.3', label: 'Forking Repositories & Syncing' },
      { code: '6.5.4', label: 'GitHub Actions & CI/CD' },
    ]
  },
};

const getFallbackSubBranch = (code: string, label: string): DeepSubBranch => ({
  id: `subbranch-dynamic-${code}`,
  code: code || '1.1',
  title: label,
  topicCount: 5,
  items: [
    { code: `${code}.1`, label: `${label} Overview & Core Principles` },
    { code: `${code}.2`, label: `${label} Syntax & Basic Usage` },
    { code: `${code}.3`, label: `${label} Advanced Features & Techniques` },
    { code: `${code}.4`, label: `${label} Common Use Cases & Examples` },
    { code: `${code}.5`, label: `${label} Best Practices & Optimization` },
  ]
});

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
  deepSubBranch?: DeepSubBranch;
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
  const [activeTabSegment, setActiveTabSegment] = useState<'roadmap' | 'projects' | 'personalize' | 'guides'>('roadmap');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [cardStyleMode, setCardStyleMode] = useState<'color-theme' | 'hybrid-3d' | 'all'>('color-theme');
  const [selectedProjectForDrawer, setSelectedProjectForDrawer] = useState<ProjectDetailData | null>(null);
  const [activeProjectDetail, setActiveProjectDetail] = useState<RoadmapProjectDetail | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<'learn' | 'job' | 'projects'>('learn');
  const [selectedCommitment, setSelectedCommitment] = useState<'casual' | 'regular' | 'intensive'>('regular');
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>(['css', 'javascript']);
  const [guideTopicFilter, setGuideTopicFilter] = useState<'all' | 'html' | 'css' | 'javascript'>('all');

  const displayTitle = useMemo(() => {
    if (title && title.trim()) return title;
    try {
      if (graphJson) {
        const raw = JSON.parse(graphJson);
        if (raw.title || raw.name) return raw.title || raw.name;
      }
    } catch (e) {}
    return 'Backend';
  }, [title, graphJson]);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [viewportRatio, setViewportRatio] = useState(0.2);

  // Active selected subtopic for each step (e.g. '2.1', '2.2', '3.1').
  // Initialized to empty so Next Card ONLY appears when a topic is clicked!
  const [selectedSubTopicByStep, setSelectedSubTopicByStep] = useState<Record<string, string | null>>({});

  // Active selected category item for each step (Level 3 deep details)
  const [selectedItemByStep, setSelectedItemByStep] = useState<Record<string, string | null>>({});

  const handleSelectSubtopic = (stepId: string, subCode: string, subLabel?: string) => {
    setSelectedSubTopicByStep(prev => {
      const current = prev[stepId];
      if (current === subCode) {
        return { ...prev, [stepId]: null }; // Toggle off if clicked again
      }
      return { ...prev, [stepId]: subCode };
    });

    const subBranch = SUB_BRANCH_DICTIONARY[subCode] || (subLabel ? getFallbackSubBranch(subCode, subLabel) : null);
    if (subBranch && subBranch.items.length > 0) {
      setSelectedItemByStep(prev => ({ ...prev, [stepId]: subBranch.items[0].code }));
    }
  };

  const handleSelectSubItem = (stepId: string, code: string) => {
    setSelectedItemByStep(prev => {
      const current = prev[stepId];
      if (current === code) {
        return { ...prev, [stepId]: null }; // Toggle level 3 details off
      }
      return { ...prev, [stepId]: code };
    });
  };

  const closeNextCard = (stepId: string) => {
    setSelectedSubTopicByStep(prev => ({ ...prev, [stepId]: null }));
    setSelectedItemByStep(prev => ({ ...prev, [stepId]: null }));
  };

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(Math.max(0, Math.min(1, el.scrollLeft / maxScroll)));
      setViewportRatio(Math.max(0.1, Math.min(1, el.clientWidth / el.scrollWidth)));
    } else {
      setScrollProgress(0);
      setViewportRatio(1);
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

  const getSubTopicsForSelector = useCallback((code: string, label: string) => {
    const dictionary: Record<string, string[]> = {
      // HTML
      '2.1.1': ['<header> for page headers', '<nav> for main navigation', '<article> for self-contained content', '<section> for thematic grouping'],
      '2.1.2': ['Doctype declaration <!DOCTYPE html>', 'Root <html> element', '<head> metadata container', 'Document outline algorithm'],
      '2.1.3': ['Semantic vs Non-semantic tags', 'div & span generic containers', 'When to use section vs article', 'ARIA landmark roles'],
      '2.1.4': ['h1 for main page title', 'h2-h6 heading hierarchy', 'Skipping heading levels avoid', 'Screen reader navigation'],
      '2.1.5': ['<main> single primary content', '<footer> copyright & links', '<aside> sidebar & callouts', 'Accessibility landmarks'],
      '2.1.6': ['<figure> media container', '<figcaption> caption text', 'Linking image to caption', 'Styling figure elements'],

      '2.2.1': ['Form Tag & Attributes', '<input> & <label>', '<button> & <select>', '<textarea> & <fieldset>'],
      '2.2.2': ['text, password, email', 'number, range, date', 'checkbox & radio', 'file & submit'],
      '2.2.3': ['for Attribute & ID Matching', 'Implicit vs Explicit Labels', 'Placeholder Styling', 'Screen Reader Accessibility'],
      '2.2.4': ['required Attribute', 'minlength & maxlength', 'min & max Attributes', 'pattern Regex Validation'],
      '2.2.5': ['Regex Pattern Syntax', 'Email Pattern Matching', 'Password Complexity', 'Custom Error Bubbles'],
      '2.2.6': ['Using JavaScript', 'Error Messages', 'Real-time Validation', 'Form Submission', 'Best Practices'],
      '2.2.7': ['Radio Group Name Attribute', 'Checkbox Checked State', 'Custom Styled Checkboxes', 'Switch UI Components'],
      '2.2.8': ['<option> & <optgroup>', 'Multiple Selection', 'Textarea Rows & Cols', 'Auto-resizing Textareas'],

      // CSS
      '3.1.1': ['Element / Type Selector', 'Class Selector (.class)', 'ID Selector (#id)', 'Universal Selector (*)'],
      '3.1.2': ['Descendant (space)', 'Child Selector (>)', 'Adjacent Sibling (+)', 'General Sibling (~)'],
      '3.1.3': [':hover, :focus, :active', ':nth-child(n)', ':first-child & :last-child', ':not() & :has()'],
      '3.1.4': ['::before & ::after', '::first-line & ::first-letter', '::selection Styling', '::placeholder'],
      '3.1.5': ['[attr] Presence', '[attr=val] Exact', '[attr^=val] Starts with', '[attr*=val] Contains'],
      '3.1.6': [':is() & :where()', ':focus-within', ':focus-visible', ':target'],
      '3.1.7': ['Inline Styles (1000)', 'ID Selectors (100)', 'Class / Pseudo (10)', 'Elements (1)'],
      '3.1.8': ['Keep Specificity Low', 'Avoid !important', 'BEM Naming Convention', 'Utility-first Classes'],

      '3.3.1': ['display: flex container', 'Flex items direct children', 'Inline-flex display', 'Container vs item properties'],
      '3.3.2': ['flex-direction: row / column', 'flex-wrap: wrap / nowrap', 'flex-flow shorthand', 'Reverse direction flows'],
      '3.3.3': ['justify-content main axis', 'align-items cross axis', 'gap spacing between items', 'place-content shorthand'],
      '3.3.4': ['flex-grow sizing ratio', 'flex-shrink compression', 'flex-basis initial size', 'flex shorthand syntax'],
      '3.3.5': ['align-self individual override', 'order property reordering', 'Visual vs DOM order', 'Accessibility implications'],
      '3.3.6': ['Navigation Bar Layout', 'Centered Hero Card', 'Media Object Pattern', 'Sticky Footer Pattern'],

      // JS
      '4.3.1': ['function keyword syntax', 'Function Hoisting', 'Return values', 'Parameters vs Arguments'],
      '4.3.2': ['Anonymous functions', 'Named function expressions', 'First-class functions', 'Function assignment'],
      '4.3.3': ['Syntax variations () => {}', 'Implicit return', 'Lexical this binding', 'No arguments object'],
      '4.3.4': ['Default parameter syntax', 'Undefined parameter fallback', 'Expression defaults', 'Destructured defaults'],
      '4.3.5': ['Rest parameter ...args', 'Array gathering', 'Replacing arguments object', 'Parameter positioning'],
      '4.3.6': ['Callback functions', 'Asynchronous callbacks', 'Array method callbacks', 'Callback hell prevention'],
      '4.3.7': ['Functions as parameters', 'Returning functions', 'Array map, filter, reduce', 'Currying & Composition'],
      '4.3.8': ['Base case definition', 'Recursive call stack', 'Tail call optimization', 'Tree & DOM traversal'],
      '4.3.9': ['Lexical scope environment', 'Outer variable access', 'Data privacy & encapsulation', 'Memory leak watch'],
      '4.3.10': ['Single responsibility', 'Pure functions', 'Side effect minimization', 'Descriptive naming'],

      // REACT
      '5.3.1': ['Initial State Value', 'State Setter Function', 'Functional Updates', 'Object & Array State'],
      '5.3.2': ['Dependency Array', 'Cleanup Functions', 'API Fetching Effect', 'Infinite Loop Gotchas'],
      '5.3.3': ['createContext API', 'Provider Component', 'useContext Hook', 'Re-render Optimization'],
      '5.3.4': ['Reducer Function', 'Dispatching Actions', 'State & Action Types', 'Complex State Logic'],
      '5.3.5': ['Memoizing Functions', 'Dependency Array', 'Child Re-render Guard', 'Performance Profiling'],
      '5.3.6': ['Memoizing Values', 'Expensive Calculations', 'Dependency Tracking', 'When NOT to useMemo'],
      '5.3.7': ['Custom Hook Pattern', 'Reusing State Logic', 'Returning State & Handlers', 'Hook Composition'],
      '5.3.8': ['Top Level Calls Only', 'React Functions Only', 'ESLint Plugin Rules', 'Hook Lifecycle'],

      // GIT
      '6.4.1': ['git branch <name>', 'git checkout -b <name>', 'git switch -c <name>', 'Upstream tracking'],
      '6.4.2': ['git checkout <name>', 'git switch <name>', 'Stashing uncommitted work', 'Branch detached HEAD'],
      '6.4.3': ['Fast-forward merges', '3-way recursive merge', 'Merge commit messages', 'Squash merging'],
      '6.4.4': ['git branch -d local', 'git branch -D force', 'git push origin --delete', 'Pruning remote branches'],
      '6.4.5': ['Merge conflict markers', 'Resolving <<<<<<< HEAD', 'git mergetool', 'Aborting merge'],
      '6.4.6': ['Feature branch workflow', 'Short-lived branches', 'Pull Request reviews', 'Main branch protection'],
    };

    const list = dictionary[code] || [
      `${label} overview & core concepts`,
      `${label} syntax & basic implementation`,
      `${label} practical real-world examples`,
      `${label} optimization & best practices`
    ];

    return list.map((itemLabel, idx) => ({
      code: `${code}.${idx + 1}`,
      label: itemLabel
    }));
  }, []);

  const projectsData = useMemo(() => [
    {
      id: 'proj-1',
      title: 'Single-Page CV Website',
      description: 'Build a clean, semantic single-page resume site to present your professional experience, technical skills, and key projects.',
      difficulty: 'beginner',
      category: 'HTML & CSS',
      colorTheme: 'yellow',
      hybridTheme: 'rocket-yellow',
      membersCount: '25,850 Learners',
      timeAgo: 'Est. 2-3 Hours',
      icon: Code,
      techStack: ['HTML5', 'CSS Flexbox', 'Responsive UI', 'Accessibility'],
      starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Single-Page CV</title>
  <style>
    :root { --primary: #0f172a; --accent: #2563eb; }
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; color: var(--primary); }
    header { border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem; }
    .skill-tag { background: #e0f2fe; color: #0369a1; padding: 4px 10px; rounded-md; font-size: 12px; font-weight: bold; }
  </style>
</head>
<body>
  <header>
    <h1>Alex Rivera</h1>
    <p>Frontend Developer & UI Specialist</p>
  </header>
  <main>
    <section>
      <h2>About Me</h2>
      <p>Passionate developer with expertise in building responsive web applications.</p>
    </section>
  </main>
</body>
</html>`,
      tasks: [
        { id: 'proj-1-t1', phase: 'HTML Setup', label: 'Build Semantic Document Skeleton', description: 'Create semantic HTML5 structure with <header>, <main>, <section id="experience">, and <footer> tags.' },
        { id: 'proj-1-t2', phase: 'Styling', label: 'Implement Typography & Responsive Grid', description: 'Add Google Fonts, CSS custom variables, flexbox container layouts, and mobile media queries.' },
        { id: 'proj-1-t3', phase: 'Interactivity', label: 'Add Skills Filter & Contact Modal', description: 'Wire up vanilla JavaScript event handlers to filter skill badges dynamically.' },
        { id: 'proj-1-t4', phase: 'Deployment', label: 'Audit Accessibility & Live Deploy', description: 'Perform Lighthouse accessibility checks and publish your CV live on GitHub Pages.' }
      ]
    },
    {
      id: 'proj-2',
      title: 'Multi-Page HTML Website',
      description: 'Design a structured multi-page website with semantic navigation links, contact form controls, and embedded media.',
      difficulty: 'intermediate',
      category: 'HTML & CSS',
      colorTheme: 'white',
      hybridTheme: 'laptop-code',
      membersCount: '18,420 Learners',
      timeAgo: 'Est. 3-5 Hours',
      icon: Layout,
      techStack: ['HTML5 Navigation', 'CSS Grid', 'Forms', 'Media Embedding'],
      starterCode: `<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Corporate Website</title>
</head>
<body>
  <nav>
    <a href="index.html">Home</a> | 
    <a href="about.html">About</a> | 
    <a href="contact.html">Contact</a>
  </nav>
  <main><h1>Welcome to our Company</h1></main>
</body>
</html>`,
      tasks: [
        { id: 'proj-2-t1', phase: 'Navigation', label: 'Create Shared Header & Nav Bar', description: 'Build reusable navigation links across index.html, about.html, and contact.html pages.' },
        { id: 'proj-2-t2', phase: 'Layout', label: 'Design Responsive Page Content', description: 'Use CSS Grid to create multi-column feature sections and team showcase cards.' },
        { id: 'proj-2-t3', phase: 'Form Validation', label: 'Build Validated Contact Form', description: 'Add HTML5 input attributes (required, pattern, email) and user feedback styling.' },
        { id: 'proj-2-t4', phase: 'Optimization', label: 'Optimize Images & Assets', description: 'Compress images, add alt attributes, and verify navigation link paths.' }
      ]
    },
    {
      id: 'proj-3',
      title: 'Personal Developer Portfolio',
      description: 'Craft a responsive personal portfolio featuring smooth section scrolling, dark mode theme toggles, and interactive project cards.',
      difficulty: 'advanced',
      category: 'CSS & Flexbox',
      colorTheme: 'green',
      hybridTheme: 'lightbulb-purple',
      membersCount: '14,910 Learners',
      timeAgo: 'Est. 4-6 Hours',
      icon: FileText,
      techStack: ['CSS Variables', 'Dark Mode', 'Animations', 'Flexbox'],
      starterCode: `/* Dark mode setup */
:root {
  --bg-primary: #ffffff;
  --text-primary: #0f172a;
}
[data-theme="dark"] {
  --bg-primary: #0f172a;
  --text-primary: #f8fafc;
}
body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease;
}`,
      tasks: [
        { id: 'proj-3-t1', phase: 'Design System', label: 'Setup Color Tokens & Theme State', description: 'Define CSS variables for light/dark themes and store theme preference in localStorage.' },
        { id: 'proj-3-t2', phase: 'Hero Section', label: 'Build Hero Header with Bio', description: 'Create an engaging hero section with animated call-to-action buttons and profile badge.' },
        { id: 'proj-3-t3', phase: 'Project Showcase', label: 'Build Interactive Project Grid', description: 'Display past projects in a responsive card grid with hover effects and live links.' },
        { id: 'proj-3-t4', phase: 'Interactivity', label: 'Implement Dark Mode Toggle Button', description: 'Add a theme toggle button that switches data-theme attribute smoothly.' }
      ]
    },
    {
      id: 'proj-4',
      title: 'Interactive Task Manager',
      description: 'Develop a web application with drag-and-drop task columns, localStorage data persistence, and category filter pills.',
      difficulty: 'beginner',
      category: 'JavaScript',
      colorTheme: 'blue',
      hybridTheme: 'browser-blue',
      membersCount: '12,300 Learners',
      timeAgo: 'Est. 5-7 Hours',
      icon: Layout,
      techStack: ['Vanilla JS', 'DOM Manipulation', 'LocalStorage', 'Events'],
      starterCode: `// Task state manager
const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

function addTask(title) {
  const newTask = { id: Date.now(), title, completed: false };
  tasks.push(newTask);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}`,
      tasks: [
        { id: 'proj-4-t1', phase: 'UI Layout', label: 'Build Task Board & Form UI', description: 'Create columns for To Do, In Progress, and Completed tasks with input form.' },
        { id: 'proj-4-t2', phase: 'State Logic', label: 'Implement Add/Edit/Delete Task', description: 'Write JavaScript functions to dynamically add, update, and remove tasks from DOM.' },
        { id: 'proj-4-t3', phase: 'Persistence', label: 'Sync State with LocalStorage', description: 'Save task state changes so user data persists across browser refreshes.' },
        { id: 'proj-4-t4', phase: 'Filters', label: 'Add Category & Status Filter Pills', description: 'Allow filtering tasks by status (All, Active, Completed).' }
      ]
    },
    {
      id: 'proj-5',
      title: 'Real-Time Weather Dashboard',
      description: 'Build a live weather forecasting app integrating geolocation APIs, 7-day weather predictions, and animated weather widgets.',
      difficulty: 'intermediate',
      category: 'JavaScript & API',
      colorTheme: 'purple',
      hybridTheme: 'database-violet',
      membersCount: '9,640 Learners',
      timeAgo: 'Est. 6-8 Hours',
      icon: Cloud,
      techStack: ['Fetch API', 'Async/Await', 'REST API', 'JSON Parsing'],
      starterCode: `async function fetchWeather(city) {
  const API_KEY = 'YOUR_API_KEY';
  const response = await fetch(\`https://api.openweathermap.org/data/2.5/weather?q=\${city}&appid=\${API_KEY}&units=metric\`);
  const data = await response.json();
  return data;
}`,
      tasks: [
        { id: 'proj-5-t1', phase: 'API Setup', label: 'Connect OpenWeather API', description: 'Setup async fetch calls to retrieve current temperature, humidity, and forecast data.' },
        { id: 'proj-5-t2', phase: 'Search UI', label: 'Build City Search & Geolocation', description: 'Implement city search bar with auto-complete and Geolocation API fallback.' },
        { id: 'proj-5-t3', phase: 'Forecast Grid', label: 'Render 7-Day Weather Cards', description: 'Map daily weather JSON responses into styled forecast cards with weather icons.' },
        { id: 'proj-5-t4', phase: 'Dynamic UI', label: 'Add Dynamic Weather Backgrounds', description: 'Change background gradient based on weather condition (Sunny, Rainy, Snowy).' }
      ]
    },
    {
      id: 'proj-6',
      title: 'Full-Stack Developer Blog',
      description: 'Create a responsive developer blog powered by Next.js App Router, MDX file parsing, syntax highlighting, and SEO optimization.',
      difficulty: 'advanced',
      category: 'React & Next.js',
      colorTheme: 'rose',
      hybridTheme: 'smartphone-teal',
      membersCount: '8,120 Learners',
      timeAgo: 'Est. 8-10 Hours',
      icon: Code,
      techStack: ['Next.js 14', 'MDX Parsing', 'Prism.js', 'Tailwind CSS'],
      starterCode: `// app/blog/[slug]/page.tsx
import { getPostBySlug } from '@/lib/mdx';

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  return (
    <article className="prose lg:prose-xl mx-auto">
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}`,
      tasks: [
        { id: 'proj-6-t1', phase: 'App Router', label: 'Setup Next.js Project Structure', description: 'Create dynamic route handler app/blog/[slug]/page.tsx for rendering posts.' },
        { id: 'proj-6-t2', phase: 'MDX Pipeline', label: 'Integrate MDX Content Parsing', description: 'Parse local markdown files and frontmatter metadata into React components.' },
        { id: 'proj-6-t3', phase: 'Syntax Highlighting', label: 'Add Code Block Highlighting', description: 'Enable Prism.js syntax highlighting and add a click-to-copy code button.' },
        { id: 'proj-6-t4', phase: 'SEO & Deploy', label: 'Configure OpenGraph Metadata & Deploy', description: 'Generate dynamic social share cards and deploy live to Vercel platform.' }
      ]
    },
  ], []);

  const filteredProjects = useMemo(() =>
    projectFilter === 'all' ? projectsData : projectsData.filter(p => p.difficulty === projectFilter),
    [projectFilter, projectsData]);

  const guidesData = useMemo(() => [
    { id: 'guide-1', title: 'CSS Flexbox Complete Guide', description: 'Learn everything about Flexbox with examples.', category: 'CSS', readTime: '15 min read', icon: Code, iconBg: 'bg-blue-50', iconColor: '#3b82f6', tagBg: 'bg-emerald-50', tagColor: 'text-emerald-700', tagBorder: 'border-emerald-100' },
    { id: 'guide-2', title: 'JavaScript ES6+ Features', description: 'Modern JavaScript features you should know.', category: 'JavaScript', readTime: '20 min read', icon: Terminal, iconBg: 'bg-amber-50/70', iconColor: '#f59e0b', tagBg: 'bg-emerald-50', tagColor: 'text-emerald-700', tagBorder: 'border-emerald-100' },
    { id: 'guide-3', title: 'Responsive Web Design', description: 'Learn how to build responsive layouts across devices.', category: 'HTML', readTime: '18 min read', icon: Layout, iconBg: 'bg-purple-50', iconColor: '#a855f7', tagBg: 'bg-amber-50', tagColor: 'text-amber-700', tagBorder: 'border-amber-100' },
    { id: 'guide-4', title: 'CSS Grid Layout Guide', description: 'Master CSS Grid with practical examples.', category: 'CSS', readTime: '16 min read', icon: Layout, iconBg: 'bg-emerald-50', iconColor: '#10b981', tagBg: 'bg-emerald-50', tagColor: 'text-emerald-700', tagBorder: 'border-emerald-100' },
  ], []);

  const filteredGuides = useMemo(() =>
    guideTopicFilter === 'all' ? guidesData : guidesData.filter(g => g.category.toLowerCase() === guideTopicFilter),
    [guideTopicFilter, guidesData]);

  const handleZoomIn = () => setZoomLevel(p => Math.min(p + 0.1, 1.5));
  const handleZoomOut = () => setZoomLevel(p => Math.max(p - 0.1, 0.6));
  const handleResetView = () => {
    setZoomLevel(1);
    scrollContainerRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setIsMounted(true);
    if (roadmapId) init(roadmapId, parsedGraph.nodes, parsedGraph.edges);
  }, [roadmapId, init, parsedGraph]);

  const roadmapSteps = useMemo<RoadmapStep[]>(() => {
    const baseSteps: RoadmapStep[] = [
      {
        id: 'node-internet', coreTitle: 'INTERNET', lightBg: '#EEF2FF', borderColor: '#818CF8', textColor: '#4338CA', lineColor: '#6366F1', icon: Globe, isStart: true,
        rightBranch: {
          type: 'subtopics', subtopics: [
            { id: 'node-internet', label: 'What is Internet?', code: '1.1', type: 'essential' },
            { id: 'node-web-works', label: 'How Internet works', code: '1.2', type: 'essential' },
            { id: 'node-web-works', label: 'DNS, HTTP, HTTPS', code: '1.3', type: 'essential' },
            { id: 'node-http-browsers', label: 'Browsers & Engines', code: '1.4', type: 'essential' },
          ]
        }
      },
      {
        id: 'node-html5', coreTitle: 'HTML', lightBg: '#FDF4FF', borderColor: '#C084FC', textColor: '#6B21A8', lineColor: '#9333EA', icon: Code,
        leftBranch: {
          type: 'subtopics', subtopics: [
            { id: 'node-semantic-seo', label: 'Semantic HTML', code: '2.1', type: 'essential' },
            { id: 'node-html5', label: 'Forms & Validation', code: '2.2', type: 'essential' },
            { id: 'node-html5', label: 'Accessibility', code: '2.3', type: 'essential' },
            { id: 'node-semantic-seo', label: 'SEO Basics', code: '2.4', type: 'essential' },
            { id: 'node-html5', label: 'Tables & Lists', code: '2.5', type: 'essential' },
            { id: 'node-html5', label: 'Media (Audio, Video)', code: '2.6', type: 'essential' },
          ]
        },
        rightBranch: { type: 'note', note: { text: 'HTML is the standard markup language for creating web structures.' } },
      },
      {
        id: 'node-css3', coreTitle: 'CSS', lightBg: '#F0F9FF', borderColor: '#60A5FA', textColor: '#1E40AF', lineColor: '#2563EB', icon: Palette,
        leftBranch: { type: 'note', note: { text: 'CSS styles the layouts and elements of web documents.' } },
        rightBranch: {
          type: 'subtopics', subtopics: [
            { id: 'node-box-model', label: 'Selectors', code: '3.1', type: 'important' },
            { id: 'node-box-model', label: 'Box Model', code: '3.2', type: 'important' },
            { id: 'node-flex-grid', label: 'Flexbox', code: '3.3', type: 'important' },
            { id: 'node-flex-grid', label: 'CSS Grid', code: '3.4', type: 'important' },
            { id: 'node-responsive-tailwind', label: 'Responsive Design', code: '3.5', type: 'important' },
            { id: 'node-css3', label: 'Animations', code: '3.6', type: 'important' },
            { id: 'node-css3', label: 'CSS Variables', code: '3.7', type: 'important' },
            { id: 'node-responsive-tailwind', label: 'Tailwind CSS', code: '3.8', type: 'important' },
          ]
        },
      },
      {
        id: 'node-js-basics', coreTitle: 'JAVASCRIPT', lightBg: '#FFFBEB', borderColor: '#FBBF24', textColor: '#92400E', lineColor: '#D97706', icon: Terminal,
        leftBranch: {
          type: 'subtopics', subtopics: [
            { id: 'node-js-basics', label: 'Variables & Data Types', code: '4.1', type: 'important' },
            { id: 'node-js-scope', label: 'Operators', code: '4.2', type: 'important' },
            { id: 'node-js-scope', label: 'Functions', code: '4.3', type: 'important' },
            { id: 'node-dom-events', label: 'DOM Manipulation', code: '4.4', type: 'important' },
            { id: 'node-js-basics', label: 'Arrays & Objects', code: '4.5', type: 'important' },
            { id: 'node-dom-events', label: 'Events', code: '4.6', type: 'important' },
            { id: 'node-async-fetch', label: 'Async JavaScript', code: '4.7', type: 'important' },
            { id: 'node-js-scope', label: 'ES6+ Features', code: '4.8', type: 'important' },
          ]
        },
        rightBranch: { type: 'note', note: { text: 'JavaScript makes web pages interactive.' } },
      },
      {
        id: 'node-react', coreTitle: 'REACT', lightBg: '#ECFDF5', borderColor: '#34D399', textColor: '#065F46', lineColor: '#059669', icon: Atom,
        leftBranch: {
          type: 'subtopics', subtopics: [
            { id: 'node-react-jsx', label: 'Components', code: '5.1', type: 'advanced' },
            { id: 'node-react-jsx', label: 'Props & State', code: '5.2', type: 'advanced' },
            { id: 'node-state-hooks', label: 'Hooks', code: '5.3', type: 'advanced' },
            { id: 'node-react-router', label: 'React Router', code: '5.4', type: 'advanced' },
            { id: 'node-state-hooks', label: 'State Management', code: '5.5', type: 'advanced' },
          ]
        },
        rightBranch: { type: 'note', note: { text: 'React is a JavaScript library for building user interfaces.' } },
      },
      {
        id: 'node-git', coreTitle: 'GIT & GITHUB', lightBg: '#FFF1F2', borderColor: '#FB7185', textColor: '#9F1239', lineColor: '#E11D48', icon: GitBranch,
        rightBranch: {
          type: 'subtopics', subtopics: [
            { id: 'node-git', label: 'What is Git?', code: '6.1', type: 'essential' },
            { id: 'node-git-basics', label: 'Repositories', code: '6.2', type: 'essential' },
            { id: 'node-git-basics', label: 'Commit & Push', code: '6.3', type: 'essential' },
            { id: 'node-git-basics', label: 'Branches', code: '6.4', type: 'essential' },
            { id: 'node-git-basics', label: 'Pull Requests', code: '6.5', type: 'essential' },
          ]
        },
        leftBranch: { type: 'note', note: { text: 'Git helps you track changes in your code.' } },
      },
    ];

    if (parsedGraph.nodes.length > 0) {
      const existingIds = new Set(baseSteps.map(s => s.id));
      const palette = [
        { lightBg: '#F0F9FF', borderColor: '#BAE6FD', textColor: '#0284C7', lineColor: '#0EA5E9', icon: Rocket },
        { lightBg: '#F5F3FF', borderColor: '#DDD6FE', textColor: '#7C3AED', lineColor: '#8B5CF6', icon: Sparkles },
        { lightBg: '#ECFEFF', borderColor: '#A5F3FC', textColor: '#0891B2', lineColor: '#06B6D4', icon: Cloud },
      ];
      let pIdx = 0;
      parsedGraph.nodes.forEach(n => {
        if (!existingIds.has(n.id)) {
          const theme = palette[pIdx % palette.length];
          pIdx++;
          baseSteps.push({
            id: n.id,
            coreTitle: n.label.toUpperCase(),
            lightBg: theme.lightBg,
            borderColor: theme.borderColor,
            textColor: theme.textColor,
            lineColor: theme.lineColor,
            icon: theme.icon,
            rightBranch: {
              type: 'subtopics',
              subtopics: [
                { id: n.id, label: n.label, type: 'essential' }
              ]
            }
          });
        }
      });
    }

    return baseSteps;
  }, [parsedGraph.nodes]);

  // SPACIOUS LAYOUT CONSTANTS
  const NODE_RADIUS = 32; // 64px milestone circle
  const NODE_SPACING = 640; // Generous horizontal spacing so Next Cards sit neatly side-by-side without overlap
  const CANVAS_PAD_X = 260; // Clean left padding so Milestone 01 & cards start comfortably inside the viewport
  const NODE_Y = 90; // Shifting nodes upwards

  const stepLayouts = useMemo(() => {
    return roadmapSteps.map((step, idx) => {
      const coreCenterX = CANVAS_PAD_X + idx * NODE_SPACING;
      const coreCenterY = NODE_Y;
      return { stepX: coreCenterX, coreCenterX, coreCenterY, stepIndex: idx };
    });
  }, [roadmapSteps, NODE_SPACING, CANVAS_PAD_X, NODE_Y]);

  const CANVAS_WIDTH = useMemo(() => {
    if (activeTabSegment === 'roadmap') {
      return CANVAS_PAD_X * 2 + (roadmapSteps.length + 1) * NODE_SPACING + 400;
    }
    return 1300;
  }, [activeTabSegment, roadmapSteps.length, NODE_SPACING, CANVAS_PAD_X]);

  const wrapperHeight = useMemo(() => {
    if (activeTabSegment === 'roadmap') return 1200;
    if (activeTabSegment === 'projects') return 1000;
    if (activeTabSegment === 'personalize') return 850;
    return 800;
  }, [activeTabSegment]);

  // Curved road path for connecting main milestone node circles
  const segmentPaths = useMemo(() => {
    return stepLayouts.map((curr, i) => {
      if (i === 0) return '';
      const prev = stepLayouts[i - 1];
      const cy = prev.coreCenterY;
      const dropY = cy + 50;
      return `M ${prev.coreCenterX} ${cy} L ${prev.coreCenterX + 55} ${cy} C ${prev.coreCenterX + 90} ${cy}, ${prev.coreCenterX + 110} ${dropY}, ${prev.coreCenterX + 140} ${dropY} L ${curr.coreCenterX - 140} ${dropY} C ${curr.coreCenterX - 110} ${dropY}, ${curr.coreCenterX - 90} ${cy}, ${curr.coreCenterX - 55} ${cy} L ${curr.coreCenterX} ${cy}`;
    });
  }, [stepLayouts]);

  const windingPathD = useMemo(() => {
    if (stepLayouts.length === 0) return '';
    const first = stepLayouts[0];
    const cy = first.coreCenterY;
    const parts: string[] = [];

    parts.push(`M ${first.coreCenterX - 100} ${cy}`);
    parts.push(`L ${first.coreCenterX} ${cy}`);

    for (let i = 1; i < segmentPaths.length; i++) {
      const segD = segmentPaths[i];
      if (segD) {
        const commaIdx = segD.indexOf('L');
        if (commaIdx !== -1) {
          parts.push(segD.substring(commaIdx));
        }
      }
    }

    const last = stepLayouts[stepLayouts.length - 1];
    const addTopicX = last.coreCenterX + NODE_SPACING;
    const dropY = cy + 50;
    parts.push(
      `L ${last.coreCenterX + 55} ${cy} C ${last.coreCenterX + 90} ${cy}, ${last.coreCenterX + 110} ${dropY}, ${last.coreCenterX + 140} ${dropY} L ${addTopicX - 140} ${dropY} C ${addTopicX - 110} ${dropY}, ${addTopicX - 90} ${cy}, ${addTopicX - 55} ${cy} L ${addTopicX} ${cy}`
    );

    return parts.join(' ');
  }, [stepLayouts, segmentPaths, NODE_SPACING]);

  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (scrollContainerRef.current) {
      const el = scrollContainerRef.current;
      el.scrollTo({ left: ratio * (el.scrollWidth - el.clientWidth), behavior: 'smooth' });
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (scrollContainerRef.current) {
      const el = scrollContainerRef.current;
      el.scrollTo({ left: ratio * (el.scrollWidth - el.clientWidth), behavior: 'smooth' });
    }
  };

  const completionPercentage = useMemo(() => {
    if (parsedGraph.nodes.length === 0) return 0;
    return (parsedGraph.nodes.filter(n => progress[n.id]?.status === 'COMPLETED').length / parsedGraph.nodes.length) * 100;
  }, [parsedGraph.nodes, progress]);

  const isStepCompleted = useCallback((step: RoadmapStep) => {
    if (progress[step.id]?.status === 'COMPLETED') return true;
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

      {/* TOP NAVBAR (MATCHING SCREENSHOT LAYOUT) */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-6 py-3 flex items-center justify-between pointer-events-auto select-none">
        {/* Left: arcade. Logo Pill + Search Capsule */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => router.push('/')}
            className="cursor-pointer bg-white px-5 py-2 rounded-full border border-slate-200/80 shadow-2xs flex items-center justify-center hover:scale-[1.02] transition-all"
          >
            <img src="/arcade.svg" alt="arcade" className="h-5 w-auto" />
          </div>

          <div className="bg-white border border-slate-200/80 rounded-full px-3.5 py-1.5 shadow-2xs flex items-center gap-2 w-56">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics..."
              className="w-full bg-transparent text-xs font-semibold text-slate-700 placeholder-slate-400 outline-none border-none leading-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 text-xs font-black cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Right: Notification Bell & Profile Capsule */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/notifications')}
            className="w-10 h-10 bg-white border border-slate-200/80 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
          >
            <Bell className="w-4 h-4" />
          </button>

          <div
            onClick={() => router.push('/profile')}
            className="bg-white border border-slate-200/80 rounded-full pl-4 pr-1 py-1 flex items-center gap-2.5 cursor-pointer shadow-2xs hover:shadow-xs transition-all"
          >
            <span className="text-xs font-extrabold text-slate-700">athirabiju20...</span>
            <div className="h-7 w-7 rounded-full bg-[#8D6E63] text-white flex items-center justify-center text-[10px] font-black uppercase shadow-2xs">
              A
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div className="w-full h-full flex flex-col pt-20 overflow-y-auto">

        {/* PAGE HERO SECTION (COMPACT TOP OFFSET) */}
        <div className="w-full max-w-7xl mx-auto px-6 pt-2 pb-1 pointer-events-auto flex flex-col items-center justify-center gap-1.5 text-center select-none z-20 relative">
          {/* Cursive Title with Underline */}
          <div className="relative flex flex-col items-center justify-center">
            <h1
              className="text-5xl sm:text-6xl font-normal text-[#2563eb] cursor-pointer select-none leading-none tracking-normal"
              style={{ fontFamily: "'Dancing Script', 'Caveat', 'Brush Script MT', cursive" }}
              onClick={() => router.push('/')}
            >
              {displayTitle ? displayTitle.toLowerCase() : 'frontend'}
            </h1>

            {/* Blue Curved Underline Stroke */}
            <svg className="w-48 sm:w-56 h-3 text-[#2563eb] mt-1" viewBox="0 0 200 12" fill="none">
              <path
                d="M 5 6 C 60 11, 140 11, 195 4"
                stroke="#2563eb"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          {/* Subtitle Metadata Row: Unique Glassmorphic Badges with Live Progress */}
          <div className="flex items-center gap-2 text-[10px] font-black tracking-wider uppercase mt-0.5 flex-wrap justify-center">
            <span className="bg-blue-50/90 text-blue-700 border border-blue-200/70 px-3 py-0.5 rounded-full shadow-2xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              {roadmapSteps.length} TOPICS
            </span>
            <span className="text-slate-300">•</span>
            <span className="bg-emerald-50/90 text-emerald-700 border border-emerald-200/70 px-3 py-0.5 rounded-full shadow-2xs flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-emerald-600" />
              BEGINNER
            </span>
            <span className="text-slate-300">•</span>
            <div className="bg-purple-50/90 text-purple-700 border border-purple-200/70 px-3 py-0.5 rounded-full shadow-2xs flex items-center gap-2">
              <Clock className="w-3 h-3 text-purple-600" />
              <span>{Math.round(completionPercentage)}% COMPLETE</span>
              <div className="w-12 h-1.5 bg-purple-200/80 rounded-full overflow-hidden">
                <div
                  style={{ width: `${completionPercentage}%` }}
                  className="h-full bg-purple-600 rounded-full transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Mode Switcher Controller Tabs */}
          <div className="bg-white border border-slate-200/80 p-1.5 rounded-full flex items-center gap-2 shadow-2xs mt-2">
            {[
              { id: 'roadmap' as const, label: 'Roadmap', icon: BookOpen },
              { id: 'projects' as const, label: 'Projects', icon: Trophy },
              { id: 'personalize' as const, label: 'Personalize', icon: Sliders },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTabSegment === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabSegment(tab.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border border-blue-200/80 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Canvas Scroll Area */}
        <div
          ref={containerRefCallback}
          className="flex-1 w-full overflow-x-auto overflow-y-auto relative scrollbar-none select-none cursor-grab active:cursor-grabbing"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
        >
          <div
            style={{ width: `${CANVAS_WIDTH}px`, height: `${wrapperHeight}px`, minWidth: '100%' }}
            className="relative p-0 m-0"
          >
            {isRoadmapTab && (
              <>
                {/* SVG OVERLAY CANVAS FOR ROAD TRACKS & CONNECTORS */}
                <svg
                  className="absolute inset-0 pointer-events-none"
                  style={{ width: `${CANVAS_WIDTH}px`, height: `${wrapperHeight}px` }}
                >
                  <defs>
                    <filter id="road-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="seg-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>

                    {roadmapSteps.map((step, idx) => {
                      if (idx === 0) return null;
                      const prev = roadmapSteps[idx - 1];
                      return (
                        <linearGradient key={`grad-${step.id}`} id={`grad-seg-${idx}`} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor={prev.lineColor} />
                          <stop offset="100%" stopColor={step.lineColor} />
                        </linearGradient>
                      );
                    })}
                  </defs>

                  {/* Main Road Track Path */}
                  <path d={windingPathD} fill="none" stroke="#0f172a" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" opacity={0.03} filter="url(#road-glow)" />

                  {/* Main Connecting Upper Road Segments: Solid Dark Line for Completed, Dotted Line for Incomplete */}
                  {roadmapSteps.map((step, idx) => {
                    if (idx === 0) return null;
                    const prev = roadmapSteps[idx - 1];
                    const pathD = segmentPaths[idx];
                    if (!pathD) return null;

                    const isCompleted = isStepCompleted(prev) && isStepCompleted(step);
                    const isCurrent = isStepCompleted(prev) && !isStepCompleted(step);

                    return (
                      <React.Fragment key={`seg-${step.id}`}>
                        <path
                          d={pathD}
                          fill="none"
                          stroke={isCompleted ? prev.lineColor : '#94a3b8'}
                          strokeWidth={isCompleted ? 8 : 6}
                          strokeLinecap="round"
                          opacity={isCompleted ? 0.25 : 0.08}
                          filter="url(#seg-glow)"
                        />
                        
                        {isCompleted ? (
                          /* COMPLETED: SOLID DARK / VIBRANT LINE (NO DOTS) */
                          <motion.path
                            d={pathD}
                            fill="none"
                            stroke={`url(#grad-seg-${idx})`}
                            strokeWidth="4.5"
                            strokeLinecap="round"
                            strokeDasharray="none"
                            opacity={1}
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        ) : (
                          /* NOT COMPLETED: DOTTED LINE */
                          <motion.path
                            d={pathD}
                            fill="none"
                            stroke={isCurrent ? prev.lineColor : '#94a3b8'}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeDasharray="6 6"
                            opacity={isCurrent ? 0.9 : 0.55}
                            animate={{ strokeDashoffset: [-24, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}

                  {/* Milestone Circle Animated Orbit & Pulse Rings */}
                  {stepLayouts.map((layout, idx) => {
                    const step = roadmapSteps[idx];
                    const isCompleted = isStepCompleted(step);
                    const isCurrent = !isCompleted && (idx === 0 || isStepCompleted(roadmapSteps[idx - 1]));
                    const isActive = activeNodeId === step.id;

                    return (
                      <g key={`ring-${step.id}`}>
                        {/* Inner White Base Ring */}
                        <circle cx={layout.coreCenterX} cy={layout.coreCenterY} r={NODE_RADIUS + 8} fill="white" opacity={0.85} />

                        {/* Continuous Sonar Ripple Wave */}
                        <motion.circle
                          cx={layout.coreCenterX} cy={layout.coreCenterY} r={NODE_RADIUS + 8}
                          fill="none" stroke={step.lineColor} strokeWidth="2.5"
                          animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0.2, 0.8] }}
                          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.3 }}
                          style={{ transformOrigin: `${layout.coreCenterX}px ${layout.coreCenterY}px` }}
                        />

                        {/* Outer Rotating Dashed Orbit Ring */}
                        <motion.circle
                          cx={layout.coreCenterX} cy={layout.coreCenterY} r={NODE_RADIUS + 14}
                          fill="none" stroke={step.lineColor} strokeWidth="1.8" strokeDasharray="6 6"
                          opacity={isCompleted || isCurrent || isActive ? 0.75 : 0.35}
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                          style={{ transformOrigin: `${layout.coreCenterX}px ${layout.coreCenterY}px` }}
                        />
                      </g>
                    );
                  })}

                  {/* DOTTED CONNECTION LINES WITH ENDPOINT DOTS CONNECTING CLICKED TOPICS TO THE NEXT CARD */}
                  {stepLayouts.map((layout, idx) => {
                    const step = roadmapSteps[idx];
                    const activeSubTopicCode = selectedSubTopicByStep[step.id];
                    if (!activeSubTopicCode) return null;

                    const cx = layout.coreCenterX;
                    const cy = layout.coreCenterY;
                    const card1Top = cy + NODE_RADIUS + 55;
                    const nextCardLeft = cx + 175;
                    const nextCardTop = card1Top;

                    const subtopics = [
                      ...(step.leftBranch?.type === 'subtopics' ? (step.leftBranch.subtopics || []) : []),
                      ...(step.rightBranch?.type === 'subtopics' ? (step.rightBranch.subtopics || []) : []),
                    ];

                    const subtopicIndex = subtopics.findIndex(s => s.code === activeSubTopicCode);
                    const safeSubIndex = subtopicIndex >= 0 ? subtopicIndex : 0;

                    // Compute exact Y position of the clicked row on Card 1
                    const line1StartX = cx + 150; // Right edge of Card 1
                    const line1StartY = card1Top + 50 + safeSubIndex * 34 + 17;

                    // Next Card header connection entry point
                    const line1EndX = nextCardLeft;
                    const line1EndY = nextCardTop + 24;

                    const activeItemCode = selectedItemByStep[step.id];
                    const currentDeepSubBranch = SUB_BRANCH_DICTIONARY[activeSubTopicCode] || getFallbackSubBranch(activeSubTopicCode, subtopics[safeSubIndex]?.label || '');
                    const selectedCategoryIndex = currentDeepSubBranch.items.findIndex(it => it.code === activeItemCode);
                    const safeCatIndex = selectedCategoryIndex >= 0 ? selectedCategoryIndex : 0;

                    const nextCardHeight = currentDeepSubBranch.items.length * 36 + 65;
                    const line2StartY = nextCardTop + 55 + safeCatIndex * 36 + 18;
                    const level3CardTop = nextCardTop + nextCardHeight + 20;

                    return (
                      <g key={`dotted-connections-${step.id}`}>
                        {/* 1. Animated Dotted Line connecting clicked topic row on Card 1 -> Next Card (Level 2) */}
                        <motion.path
                          d={`M ${line1StartX} ${line1StartY} C ${line1StartX + 15} ${line1StartY}, ${line1EndX - 15} ${line1EndY}, ${line1EndX} ${line1EndY}`}
                          fill="none" stroke={step.lineColor} strokeWidth="3" strokeDasharray="6 6" opacity={0.95}
                          animate={{ strokeDashoffset: [-24, 0] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                        />
                        {/* Start Dot on Card 1 */}
                        <motion.circle
                          cx={line1StartX} cy={line1StartY} r="4.5" fill="white" stroke={step.lineColor} strokeWidth="2.5"
                          animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <circle cx={line1StartX} cy={line1StartY} r="1.5" fill={step.lineColor} />
                        {/* End Dot on Next Card */}
                        <motion.circle
                          cx={line1EndX} cy={line1EndY} r="5" fill={step.lineColor}
                          animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                        />

                        {/* 2. Animated Dotted Line connecting clicked category row on Next Card -> Level 3 Detail Card */}
                        {activeItemCode && (
                          <>
                            <motion.path
                              d={`M ${nextCardLeft + 15} ${line2StartY} C ${nextCardLeft - 10} ${line2StartY}, ${nextCardLeft + 10} ${level3CardTop - 10}, ${nextCardLeft + 25} ${level3CardTop}`}
                              fill="none" stroke={step.lineColor} strokeWidth="3" strokeDasharray="6 6" opacity={0.95}
                              animate={{ strokeDashoffset: [-24, 0] }}
                              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                            />
                            <motion.circle
                              cx={nextCardLeft + 15} cy={line2StartY} r="4" fill={step.lineColor}
                              animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                            />
                            <motion.circle
                              cx={nextCardLeft + 25} cy={level3CardTop} r="4" fill={step.lineColor}
                              animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          </>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* DOM CARDS LAYER */}
                {roadmapSteps.map((step, idx) => {
                  const layout = stepLayouts[idx];
                  if (!layout) return null;
                  const { coreCenterX: cx, coreCenterY: cy } = layout;
                  const IconComponent = step.icon;
                  const subtopics = [
                    ...(step.leftBranch?.type === 'subtopics' ? (step.leftBranch.subtopics || []) : []),
                    ...(step.rightBranch?.type === 'subtopics' ? (step.rightBranch.subtopics || []) : []),
                  ];
                  const hasSubtopics = subtopics.length > 0;
                  const isCompleted = isStepCompleted(step);
                  const isCurrent = !isCompleted && (idx === 0 || isStepCompleted(roadmapSteps[idx - 1]));
                  const isActiveFocus = activeNodeId === step.id;
                  const stepMatched = searchQuery === '' ||
                    step.coreTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    subtopics.some(s => s.label.toLowerCase().includes(searchQuery.toLowerCase()));

                  const activeSubTopicCode = selectedSubTopicByStep[step.id];
                  const activeSubtopicObj = subtopics.find(s => s.code === activeSubTopicCode);
                  const currentDeepSubBranch = activeSubTopicCode
                    ? (SUB_BRANCH_DICTIONARY[activeSubTopicCode] || getFallbackSubBranch(activeSubTopicCode, activeSubtopicObj?.label || 'Topics'))
                    : null;

                  const activeItemCode = selectedItemByStep[step.id];
                  const selectedCategoryIndex = currentDeepSubBranch ? currentDeepSubBranch.items.findIndex(it => it.code === activeItemCode) : 0;
                  const safeCatIndex = selectedCategoryIndex >= 0 ? selectedCategoryIndex : 0;
                  const activeItemObj = currentDeepSubBranch?.items[safeCatIndex] || null;
                  const dynamicSubTopics = activeItemObj ? getSubTopicsForSelector(activeItemObj.code, activeItemObj.label) : [];

                  const card1Top = cy + NODE_RADIUS + 55;
                  const nextCardLeft = cx + 175;
                  const nextCardTop = card1Top;
                  const nextCardHeight = currentDeepSubBranch ? (currentDeepSubBranch.items.length * 36 + 65) : 0;
                  const level3CardTop = nextCardTop + nextCardHeight + 20;

                  return (
                    <React.Fragment key={`horizontal-node-${step.id}`}>

                      {/* Animated Step Index Badge */}
                      <motion.div
                        animate={{ y: [-2, 2, -2] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.3 }}
                        style={{
                          position: 'absolute',
                          left: `${cx - NODE_RADIUS - 38}px`,
                          top: `${cy - 9}px`,
                          backgroundColor: step.lineColor,
                          zIndex: 25,
                          opacity: isCompleted || isCurrent ? 1 : 0.85
                        }}
                        className="px-2 py-0.5 rounded-full flex items-center justify-center text-[9.5px] font-black text-white shadow-xs border-2 border-white pointer-events-none"
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </motion.div>

                      {/* Milestone Circle Node */}
                      <motion.div
                        animate={{ y: [-3, 3, -3] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.3 }}
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveNode(step.id)}
                        style={{
                          position: 'absolute', left: `${cx - NODE_RADIUS}px`, top: `${cy - NODE_RADIUS}px`,
                          width: `${NODE_RADIUS * 2}px`, height: `${NODE_RADIUS * 2}px`,
                          borderColor: step.lineColor,
                          boxShadow: isActiveFocus
                            ? `0 0 0 6px ${step.lineColor}40, 0 12px 32px -3px ${step.lineColor}60`
                            : isCompleted || isCurrent ? `0 8px 24px -3px ${step.lineColor}40` : `0 4px 12px -2px ${step.lineColor}20`,
                          opacity: stepMatched ? 1 : 0.3, zIndex: 20,
                        }}
                        className={`rounded-full border-[3.5px] bg-white flex items-center justify-center cursor-pointer pointer-events-auto select-none transition-shadow group ${isActiveFocus ? 'ring-4 ring-indigo-400/40 ring-offset-2' : ''
                          }`}
                      >
                        {isCompleted && <div style={{ backgroundColor: step.lineColor }} className="absolute inset-0 rounded-full opacity-10" />}
                        {(isCurrent || isActiveFocus) && (
                          <motion.div
                            style={{ borderColor: step.lineColor }}
                            className="absolute inset-[-8px] rounded-full border-2"
                            animate={{ scale: [1, 1.18, 1], opacity: [0.8, 0.2, 0.8] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                          />
                        )}
                        <motion.div
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.2 }}
                          className="flex items-center justify-center"
                        >
                          {step.coreTitle === 'JAVASCRIPT' || step.coreTitle === 'JS'
                            ? <span className="text-xl font-black tracking-tighter" style={{ color: step.textColor }}>JS</span>
                            : <IconComponent className="w-6 h-6 shrink-0 transition-transform duration-300 group-hover:scale-110" style={{ color: step.textColor }} />
                          }
                        </motion.div>
                        {isCompleted && (
                          <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            style={{ backgroundColor: step.lineColor }}
                            className="absolute -bottom-1 -right-1 w-5.5 h-5.5 rounded-full flex items-center justify-center shadow-xs border-2 border-white"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          </motion.div>
                        )}
                      </motion.div>

                      {/* Topic Header Title */}
                      <div style={{
                        position: 'absolute',
                        left: `${cx - 90}px`,
                        top: `${cy + NODE_RADIUS + 8}px`,
                        width: '180px',
                        opacity: stepMatched ? 1 : 0.3,
                        zIndex: 18
                      }}
                        className="text-center pointer-events-none select-none flex flex-col items-center gap-0.5">
                        <h3 className="font-black text-[12.5px] tracking-wider uppercase" style={{ color: step.textColor }}>{step.coreTitle}</h3>
                        {isActiveFocus && (
                          <span className="bg-indigo-600 text-white text-[8px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-2xs">STUDYING NOW</span>
                        )}
                      </div>

                      {/* Animated Stem Line connecting Node Circle to Card 1 */}
                      <svg style={{
                        position: 'absolute',
                        left: `${cx - 6}px`,
                        top: `${cy + NODE_RADIUS + (isActiveFocus ? 38 : 24)}px`,
                        width: '12px',
                        height: '32px',
                        opacity: stepMatched ? 1 : 0.3,
                        zIndex: 12
                      }} className="pointer-events-none overflow-visible">
                        <motion.line
                          x1="6" y1="0" x2="6" y2="32"
                          stroke={step.lineColor} strokeWidth="2.5" strokeDasharray="4 4" opacity={0.9}
                          animate={{ strokeDashoffset: [-16, 0] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                        />
                        <motion.circle cx="6" cy="0" r="2.5" fill={step.lineColor} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                        <motion.circle cx="6" cy="32" r="2.5" fill={step.lineColor} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                      </svg>

                      {/* CARD 1: MAIN TOPIC CARD */}
                      <div style={{
                        position: 'absolute',
                        left: `${cx - 150}px`,
                        top: `${card1Top}px`,
                        width: '300px',
                        opacity: stepMatched ? 1 : 0.3,
                        zIndex: 15
                      }}
                        className="flex flex-col items-center gap-2.5 pointer-events-auto transition-opacity duration-200">
                        {hasSubtopics && (
                          <div style={{ backgroundColor: `${step.lightBg}F0`, borderColor: `${step.borderColor}` }}
                            className={`w-full rounded-3xl border-2 p-4 shadow-md flex flex-col gap-2.5 backdrop-blur-md hover:shadow-lg transition-all ${isActiveFocus ? 'ring-2 ring-indigo-500/30' : ''
                              }`}>
                            <div className="flex items-center justify-between border-b border-slate-200/70 pb-2 mb-0.5">
                              <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">{subtopics.length} TOPICS</span>
                              <span className="text-[9px] font-bold text-slate-400">Click topic to view categories</span>
                            </div>

                            <div className="relative w-full flex flex-col gap-1.5">
                              {subtopics.map((sub, sIdx) => {
                                const isDone = progress[sub.id]?.status === 'COMPLETED';
                                const isSelectedSubtopic = activeSubTopicCode === sub.code;

                                return (
                                  <div
                                    key={`${sub.id}-${sIdx}`}
                                    onClick={e => {
                                      e.stopPropagation();
                                      setActiveNode(sub.id);
                                      if (sub.code) {
                                        handleSelectSubtopic(step.id, sub.code, sub.label);
                                      }
                                    }}
                                    style={{
                                      backgroundColor: isSelectedSubtopic ? `${step.lineColor}20` : undefined,
                                      borderColor: isSelectedSubtopic ? step.lineColor : 'transparent',
                                    }}
                                    className={`relative flex items-center justify-between gap-2 cursor-pointer group hover:scale-[1.01] transition-all py-1.5 px-3 rounded-2xl border ${isSelectedSubtopic
                                        ? 'font-black text-slate-900 shadow-2xs ring-1 ring-white/50'
                                        : 'hover:bg-white/80'
                                      }`}
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      {isDone
                                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" onClick={e => {
                                          e.stopPropagation();
                                          toggleNodeCompletion(sub.id);
                                        }} />
                                        : <span style={{ borderColor: step.lineColor }} className="w-3 h-3 rounded-full border-2 bg-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform" onClick={e => {
                                          e.stopPropagation();
                                          toggleNodeCompletion(sub.id);
                                        }}>
                                          <span style={{ backgroundColor: step.lineColor }} className="w-1 h-1 rounded-full" />
                                        </span>}
                                      <span className={`text-[11px] font-extrabold leading-tight ${isSelectedSubtopic ? 'text-slate-900 font-black' : 'text-slate-700'} ${isDone ? 'line-through opacity-60' : ''}`}>{sub.label}</span>
                                    </div>
                                    {sub.code && (
                                      <div className="flex items-center gap-1 shrink-0">
                                        <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded-md ${isSelectedSubtopic ? 'bg-slate-900 text-white font-black' : 'text-slate-400 bg-slate-100'}`}>{sub.code}</span>
                                        {isSelectedSubtopic && (
                                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* CARD 2: NEXT CARD (LEVEL 2 CATEGORIES CARD - SHOWN ONLY WHEN TOPIC IS CLICKED) */}
                      <AnimatePresence mode="wait">
                        {activeSubTopicCode && currentDeepSubBranch && (
                          <motion.div
                            key={`next-card-${step.id}-${activeSubTopicCode}`}
                            initial={{ opacity: 0, x: -15, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -15, scale: 0.95 }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}
                            style={{
                              position: 'absolute',
                              left: `${nextCardLeft}px`,
                              top: `${nextCardTop}px`,
                              width: '280px',
                              zIndex: 16,
                            }}
                            className="pointer-events-auto flex flex-col gap-3"
                          >
                            <div style={{ backgroundColor: 'white', borderColor: `${step.lineColor}40` }}
                              className="w-full rounded-3xl border-2 p-4 shadow-xl flex flex-col gap-2.5 backdrop-blur-md">
                              {/* Next Card Header */}
                              <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-0.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-mono text-[10px] font-black border border-indigo-200 shrink-0">
                                    &lt;/&gt;
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-[12px] font-black text-slate-800 tracking-tight leading-none truncate">{currentDeepSubBranch.code} {currentDeepSubBranch.title}</span>
                                    <span className="text-[9px] font-bold text-slate-400 mt-0.5">{currentDeepSubBranch.topicCount} Categories</span>
                                  </div>
                                </div>
                                <button onClick={() => closeNextCard(step.id)} className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shrink-0">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Categories Items List */}
                              <div className="flex flex-col gap-1.5 relative pl-5 pr-0 py-0.5">
                                {/* Vertical tree dotted guide line */}
                                <div
                                  style={{ borderColor: `${step.lineColor}60` }}
                                  className="absolute left-[7px] top-[12px] bottom-[12px] w-[1.5px] border-l-2 border-dashed opacity-80 pointer-events-none"
                                />

                                {currentDeepSubBranch.items.map((item) => {
                                  const isSelected = activeItemCode === item.code;

                                  return (
                                    <div key={item.code} className="relative flex items-center">
                                      {/* Indicator dot on tree line */}
                                      <div
                                        style={{
                                          borderColor: step.lineColor,
                                          backgroundColor: isSelected ? step.lineColor : 'white',
                                        }}
                                        className={`absolute left-[-20px] w-2.5 h-2.5 rounded-full border-2 z-10 transition-transform ${isSelected ? 'scale-125 shadow-xs' : ''
                                          }`}
                                      />

                                      {/* Category Item Button */}
                                      <div
                                        onClick={() => handleSelectSubItem(step.id, item.code)}
                                        style={{
                                          backgroundColor: isSelected ? `${step.lineColor}15` : undefined,
                                          borderColor: isSelected ? `${step.lineColor}40` : 'transparent',
                                        }}
                                        className={`w-full flex items-center justify-between text-[10.5px] font-bold px-3 py-2 rounded-xl transition-all cursor-pointer border ${isSelected
                                            ? 'font-black text-indigo-950 shadow-2xs bg-indigo-50/70 border-indigo-200'
                                            : 'text-slate-700 hover:bg-slate-50'
                                          }`}
                                      >
                                        <div className="flex items-center gap-2 truncate">
                                          <span className={`font-mono text-[9px] ${isSelected ? 'text-indigo-700 font-black' : 'text-slate-400 font-bold'}`}>{item.code}</span>
                                          <span className="truncate">{item.label}</span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* CARD 3: LEVEL 3 DETAIL CARD (DEEP SUB-CATEGORIES SHOWN WHEN CATEGORY IS CLICKED) */}
                      <AnimatePresence mode="wait">
                        {activeSubTopicCode && activeItemCode && activeItemObj && (
                          <motion.div
                            key={`level3-card-${step.id}-${activeItemObj.code}`}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            style={{
                              position: 'absolute',
                              left: `${nextCardLeft}px`,
                              top: `${level3CardTop}px`,
                              width: '280px',
                              zIndex: 17,
                            }}
                            className="pointer-events-auto"
                          >
                            <div style={{ backgroundColor: 'white', borderColor: `${step.lineColor}40` }}
                              className="w-full rounded-3xl border-2 p-3.5 shadow-2xl flex flex-col gap-2 backdrop-blur-md">
                              <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 px-1">
                                <Layers className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                <span className="text-[11px] font-black text-slate-800 tracking-tight leading-none truncate">{activeItemObj.code} {activeItemObj.label}</span>
                              </div>
                              <div className="flex flex-col gap-1 relative pl-4 pr-1 py-0.5">
                                {dynamicSubTopics.map((item, itemIdx) => {
                                  const isLast = itemIdx === dynamicSubTopics.length - 1;
                                  return (
                                    <div key={item.code} className="relative flex items-center gap-2 text-[10.5px] font-bold text-slate-700 py-1 px-1.5 rounded-lg hover:bg-indigo-50/50 transition-colors">
                                      {!isLast && (
                                        <div
                                          style={{ backgroundColor: `${step.lineColor}50` }}
                                          className="absolute left-[-11px] top-[14px] bottom-[-6px] w-[1.5px]"
                                        />
                                      )}
                                      <div
                                        style={{ borderColor: step.lineColor }}
                                        className="absolute left-[-14px] w-2.5 h-2.5 rounded-full border-2 bg-white z-10"
                                      />
                                      <span className="text-indigo-600 font-mono text-[9px] font-black shrink-0">{item.code}</span>
                                      <span className="truncate">{item.label}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </React.Fragment>
                  );
                })}

                {/* + ADD TOPIC BUTTON NODE */}
                {(() => {
                  const lastLayout = stepLayouts[stepLayouts.length - 1];
                  if (!lastLayout) return null;
                  const addTopicX = lastLayout.coreCenterX + NODE_SPACING;
                  const addTopicY = NODE_Y;
                  return (
                    <div key="add-topic-node" style={{
                      position: 'absolute',
                      left: `${addTopicX - 24}px`,
                      top: `${addTopicY - 24}px`,
                      zIndex: 20
                    }} className="flex flex-col items-center pointer-events-auto">
                      <motion.button
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const newTitle = prompt('Enter new topic title:');
                          if (newTitle) {
                            alert(`Added new topic: ${newTitle}`);
                          }
                        }}
                        className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 bg-white hover:border-indigo-500 hover:bg-indigo-50/50 flex items-center justify-center shadow-2xs transition-all cursor-pointer group"
                      >
                        <Plus className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      </motion.button>
                      <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wide mt-1.5">Add Topic</span>
                    </div>
                  );
                })()}
              </>
            )}

            {/* PROJECTS TAB (Standard Page Layout with roadmap.sh Detail View) */}
            {activeTabSegment === 'projects' && (
              activeProjectDetail ? (
                <RoadmapProjectDetailView
                  project={activeProjectDetail}
                  onBack={() => setActiveProjectDetail(null)}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-24 pointer-events-auto flex flex-col gap-6 select-none h-full overflow-y-auto"
                >
                  {/* Filter Toolbar (Colorful Vibrant Pill Capsules) */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Difficulty Filter Pills */}
                    <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 p-1.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                      {[
                        {
                          id: 'all' as const,
                          label: 'All Levels',
                          count: projectsData.length,
                          activeClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25',
                          inactiveClass: 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/70',
                          badgeActive: 'bg-white/20 text-white',
                          badgeInactive: 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700',
                        },
                        {
                          id: 'beginner' as const,
                          label: 'Beginner',
                          count: projectsData.filter(p => p.difficulty === 'beginner').length,
                          activeClass: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25',
                          inactiveClass: 'text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50/70',
                          badgeActive: 'bg-white/20 text-white',
                          badgeInactive: 'bg-emerald-100 text-emerald-800',
                        },
                        {
                          id: 'intermediate' as const,
                          label: 'Intermediate',
                          count: projectsData.filter(p => p.difficulty === 'intermediate').length,
                          activeClass: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25',
                          inactiveClass: 'text-amber-700 hover:text-amber-800 hover:bg-amber-50/70',
                          badgeActive: 'bg-white/20 text-white',
                          badgeInactive: 'bg-amber-100 text-amber-800',
                        },
                        {
                          id: 'advanced' as const,
                          label: 'Advanced',
                          count: projectsData.filter(p => p.difficulty === 'advanced').length,
                          activeClass: 'bg-gradient-to-r from-purple-600 to-rose-600 text-white shadow-md shadow-purple-500/25',
                          inactiveClass: 'text-purple-700 hover:text-purple-800 hover:bg-purple-50/70',
                          badgeActive: 'bg-white/20 text-white',
                          badgeInactive: 'bg-purple-100 text-purple-800',
                        },
                      ].map((filter) => {
                        const isActive = projectFilter === filter.id;
                        return (
                          <button
                            key={filter.id}
                            onClick={() => setProjectFilter(filter.id)}
                            className={`group px-3.5 py-1.5 rounded-full text-xs font-black capitalize transition-all cursor-pointer flex items-center gap-1.5 ${
                              isActive ? filter.activeClass : filter.inactiveClass
                            }`}
                          >
                            <span>{filter.label}</span>
                            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full transition-colors ${
                              isActive ? filter.badgeActive : filter.badgeInactive
                            }`}>
                              {filter.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Project Count Badge */}
                    <div className="bg-white border border-slate-200/80 px-3.5 py-1.5 rounded-full text-xs font-black text-slate-600 shadow-2xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{filteredProjects.length} Projects Available</span>
                    </div>
                  </div>

                  {/* Soft Pastel Light Color Theme Projects Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 w-full text-left">
                    {filteredProjects.map((p) => {
                      const fullProjectDetail: RoadmapProjectDetail = {
                        id: p.id,
                        title: p.title,
                        description: p.description,
                        difficulty: p.difficulty,
                        category: p.category,
                        membersCount: p.membersCount,
                        timeAgo: p.timeAgo,
                        colorTheme: p.colorTheme,
                        overview: p.description,
                        userStories: [
                          "The layout must render cleanly across mobile, tablet, and desktop screens.",
                          "All semantic HTML tags (<header>, <main>, <section>, <footer>) must be used properly.",
                          "No horizontal scrollbars should appear on mobile viewport widths (320px+).",
                          "Page must pass W3C HTML markup validation without critical errors.",
                        ],
                        starterCode: p.starterCode,
                        tasks: p.tasks.map((t) => ({
                          id: t.id,
                          title: t.label || t.phase,
                          description: t.description,
                        })),
                      };

                      return (
                        <div
                          key={p.id}
                          onClick={() => setActiveProjectDetail(fullProjectDetail)}
                        >
                          <ColorThemeProjectCard
                            id={p.id}
                            title={p.title}
                            description={p.description}
                            difficulty={p.difficulty}
                            category={p.category || 'HTML'}
                            membersCount={p.membersCount}
                            timeAgo={p.timeAgo}
                            colorTheme={p.colorTheme as CardColorTheme}
                            icon={p.icon}
                            onJoin={() => setActiveProjectDetail(fullProjectDetail)}
                            onShare={() => setActiveProjectDetail(fullProjectDetail)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )
            )}

            {/* Project Implementation Plan Detail Drawer */}
            <ProjectDetailDrawer
              project={selectedProjectForDrawer}
              isOpen={!!selectedProjectForDrawer}
              onClose={() => setSelectedProjectForDrawer(null)}
            />

            {/* PERSONALIZE TAB (UNIFIED PAGE LAYOUT MATCHING OTHER TABS) */}
            {activeTabSegment === 'personalize' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-2 pb-24 pointer-events-auto flex flex-col items-center gap-6 text-left select-none relative z-10"
              >
                {/* Grid Container: Step 1 (Your Goal) & Step 2 (Your Commitment) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {/* Step 1: Your Goal */}
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col gap-5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#0a463d] text-white font-black text-xs flex items-center justify-center shrink-0">
                        1
                      </div>
                      <div>
                        <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">Your Goal</h2>
                        <p className="text-[11px] text-slate-400 font-medium">What do you want to achieve?</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {[
                        { key: 'learn' as const, label: 'Learn Frontend', sub: 'I want to learn frontend development', icon: Code, bg: 'bg-indigo-50', color: 'text-indigo-600' },
                        { key: 'job' as const, label: 'Get a Job', sub: 'I want to become a frontend developer', icon: Briefcase, bg: 'bg-emerald-50', color: 'text-emerald-700' },
                        { key: 'projects' as const, label: 'Build Projects', sub: 'I want to build real-world projects', icon: Box, bg: 'bg-amber-50', color: 'text-amber-700' },
                      ].map(({ key, label, sub, icon: Ic, bg, color }) => {
                        const isSel = selectedGoal === key;
                        return (
                          <div
                            key={key}
                            onClick={() => setSelectedGoal(key)}
                            className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                              isSel
                                ? 'border-[#147a6e] bg-[#147a6e]/5 shadow-2xs'
                                : 'border-slate-200/80 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isSel ? 'border-[#147a6e] bg-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isSel && <div className="w-2.5 h-2.5 rounded-full bg-[#147a6e]" />}
                            </div>

                            <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center border border-slate-100 shrink-0`}>
                              <Ic className={`w-4 h-4 ${color}`} />
                            </div>

                            <div className="flex flex-col text-left">
                              <span className="text-xs font-black text-slate-900 leading-snug">{label}</span>
                              <span className="text-[10.5px] text-slate-400 font-medium">{sub}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Your Commitment */}
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col gap-5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#0a463d] text-white font-black text-xs flex items-center justify-center shrink-0">
                        2
                      </div>
                      <div>
                        <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">Your Commitment</h2>
                        <p className="text-[11px] text-slate-400 font-medium">How much time can you invest?</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {[
                        { key: 'casual' as const, label: 'Casual', sub: '1–2 hours / week', bg: 'bg-sky-50', color: 'text-sky-600' },
                        { key: 'regular' as const, label: 'Regular', sub: '3–5 hours / week', bg: 'bg-amber-50', color: 'text-amber-700' },
                        { key: 'intensive' as const, label: 'Intensive', sub: '10+ hours / week', bg: 'bg-teal-50', color: 'text-teal-700' },
                      ].map(({ key, label, sub, bg, color }) => {
                        const isSel = selectedCommitment === key;
                        return (
                          <div
                            key={key}
                            onClick={() => setSelectedCommitment(key)}
                            className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                              isSel
                                ? 'border-[#147a6e] bg-[#147a6e]/5 shadow-2xs'
                                : 'border-slate-200/80 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isSel ? 'border-[#147a6e] bg-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isSel && <div className="w-2.5 h-2.5 rounded-full bg-[#147a6e]" />}
                            </div>

                            <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center border border-slate-100 shrink-0`}>
                              <Clock className={`w-4 h-4 ${color}`} />
                            </div>

                            <div className="flex flex-col text-left">
                              <span className="text-xs font-black text-slate-900 leading-snug">{label}</span>
                              <span className="text-[10.5px] text-slate-400 font-medium">{sub}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Step 3: Focus Areas Container */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col gap-4 w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#0a463d] text-white font-black text-xs flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">Focus Areas</h2>
                      <p className="text-[11px] text-slate-400 font-medium">Select the topics you want to focus on.</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    {['HTML', 'CSS', 'JAVASCRIPT', 'REACT', 'NEXTJS', 'TYPESCRIPT', 'TESTING', 'DEPLOYMENT'].map(area => {
                      const lower = area.toLowerCase();
                      const sel = selectedFocusAreas.includes(lower);
                      return (
                        <button
                          key={area}
                          onClick={() => setSelectedFocusAreas(prev => sel ? prev.filter(a => a !== lower) : [...prev, lower])}
                          className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer border-2 ${
                            sel
                              ? 'bg-[#147a6e]/10 text-[#147a6e] border-[#147a6e] shadow-2xs'
                              : 'bg-white text-slate-600 border-slate-200/90 hover:border-slate-300'
                          }`}
                        >
                          {area}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Save Button */}
                <button
                  onClick={() => alert('Preferences saved successfully!')}
                  className="mt-4 bg-[#0a463d] hover:bg-[#07362f] text-white font-black text-xs uppercase tracking-widest px-10 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  SAVE PREFERENCES
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* 3. Floating Left/Right Scroll Arrows */}
        {isRoadmapTab && (
          <>
            <button
              onClick={() => scrollContainerRef.current?.scrollBy({ left: -500, behavior: 'smooth' })}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-40 bg-white/95 border border-slate-200/90 shadow-lg hover:shadow-xl w-11 h-11 rounded-full flex items-center justify-center text-slate-700 hover:text-indigo-600 hover:scale-110 transition-all cursor-pointer backdrop-blur-md"
              title="Scroll Left"
            >
              <span className="text-lg font-black">&larr;</span>
            </button>
            <button
              onClick={() => scrollContainerRef.current?.scrollBy({ left: 500, behavior: 'smooth' })}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-40 bg-white/95 border border-slate-200/90 shadow-lg hover:shadow-xl w-11 h-11 rounded-full flex items-center justify-center text-slate-700 hover:text-indigo-600 hover:scale-110 transition-all cursor-pointer backdrop-blur-md"
              title="Scroll Right"
            >
              <span className="text-lg font-black">&rarr;</span>
            </button>
          </>
        )}

        {/* 4. Bottom Fixed Controls & Minimap Bar */}
        <div className="fixed bottom-4 left-6 right-6 z-40 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-1.5 shadow-md flex items-center gap-1">
              <button onClick={handleZoomOut} className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-black transition-colors cursor-pointer" title="Zoom Out">-</button>
              <span className="text-[11px] font-black text-slate-700 px-2 min-w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
              <button onClick={handleZoomIn} className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-black transition-colors cursor-pointer" title="Zoom In">+</button>
              <div className="h-4 w-px bg-slate-200 mx-1" />
              <button onClick={handleResetView} className="px-3 py-1.5 rounded-xl hover:bg-slate-100 text-[10.5px] font-bold text-slate-600 transition-colors cursor-pointer">Reset</button>
            </div>
          </div>

          {/* Minimap Track Bar */}
          {isRoadmapTab && (
            <div className="pointer-events-auto bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-2 shadow-md flex items-center gap-3 w-80">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Map</span>
              <div onClick={handleMinimapClick} className="flex-1 h-3.5 bg-slate-100 rounded-full relative overflow-hidden cursor-pointer border border-slate-200/60">
                <div
                  style={{
                    left: `${scrollProgress * 100}%`,
                    width: `${viewportRatio * 100}%`,
                  }}
                  className="absolute top-0 bottom-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-xs transition-all duration-75"
                />
              </div>
            </div>
          )}
        </div>

      </div>

      <LearningDrawer nodes={parsedGraph.nodes} />
    </div>
  );
};
