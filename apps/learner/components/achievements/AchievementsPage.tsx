'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { UserService } from '@/domains/identity';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Trophy, Award, Flame, Star, CheckCircle2, Lock,
  Search, Shield, ArrowRight, Calendar,
  BookOpen, Download, X, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import AchievementsHero from './AchievementsHero';

// ─── SVG Hexagonal Badge Graphic ─────────────────────────────────────────────
function BadgeGraphic({ type, unlocked }: { type: string; unlocked?: boolean }) {
  const outerHex = "50,8 92,30 92,100 50,122 8,100 8,30";
  const innerHex = "50,17 84,35 84,95 50,113 16,95 16,35";
  const innerShadow = "50,17 84,35 84,95 50,113";

  return (
    <svg
      viewBox="0 0 100 130"
      className={`w-full h-full drop-shadow-xl overflow-visible transition-all duration-300 ${!unlocked ? 'grayscale opacity-50' : 'group-hover:scale-105'}`}
    >
      {type === 'sword-crown' && (
        <g>
          <polygon points={outerHex} fill="#b8860b" />
          <polygon points={innerHex} fill="#0a2a43" />
          <polygon points={innerShadow} fill="#000000" opacity="0.3" />
          <path d="M 50,25 L 50,105 M 25,50 L 75,80 M 25,80 L 75,50" stroke="#4682b4" strokeWidth="2" opacity="0.4" />
          <path d="M 25,70 L 35,80 L 50,65 L 65,80 L 75,70 L 70,90 L 30,90 Z" fill="#daa520" />
          <polygon points="50,35 58,55 50,95 42,55" fill="#a9c2d9" />
          <rect x="40" y="90" width="20" height="5" fill="#4682b4" />
          <rect x="47" y="95" width="6" height="10" fill="#2c3e50" />
        </g>
      )}

      {type === 'potion' && (
        <g>
          <polygon points={outerHex} fill="#2980b9" />
          <polygon points={innerHex} fill="#0d1f2d" />
          <polygon points={innerShadow} fill="#000000" opacity="0.3" />
          <path d="M 30,75 C 30,95 70,95 70,75 C 70,65 60,60 60,50 L 60,40 L 40,40 L 40,50 C 40,60 30,65 30,75 Z" fill="#81ecec" />
          <path d="M 32,75 C 45,80 55,70 68,75 C 65,90 35,90 32,75 Z" fill="#00cec9" opacity="0.7" />
          <rect x="47" y="90" width="6" height="15" fill="#81ecec" />
          <rect x="42.5" y="94.5" width="15" height="6" fill="#81ecec" />
          <rect x="42" y="35" width="16" height="8" fill="#4a69bd" />
        </g>
      )}

      {type === 'mountain' && (
        <g>
          <polygon points={outerHex} fill="#b2bec3" />
          <polygon points={innerHex} fill="#2d3436" />
          <polygon points={innerShadow} fill="#000000" opacity="0.3" />
          <path d="M 35,50 L 42,60 L 50,45 L 58,60 L 65,50 L 60,65 L 40,65 Z" fill="#f1c40f" />
          <polygon points="15,87 40,55 60,75 70,65 85,87" fill="#74b9ff" />
          <polygon points="40,55 32,64 43,66 48,61" fill="#dfe6e9" />
          <polygon points="70,65 64,72 73,74" fill="#dfe6e9" />
          <polygon points="15,87 85,87 50,105" fill="#0984e3" />
        </g>
      )}

      {type === 'flower' && (
        <g>
          <polygon points={outerHex} fill="#00b894" />
          <polygon points={innerHex} fill="#004d40" />
          <polygon points={innerShadow} fill="#000000" opacity="0.3" />
          <circle cx="50" cy="70" r="12" fill="#55efc4" />
          <path d="M 50,58 C 40,40 60,40 50,58 Z" fill="#81ecec" />
          <path d="M 50,82 C 40,100 60,100 50,82 Z" fill="#81ecec" />
          <path d="M 38,70 C 20,60 20,80 38,70 Z" fill="#81ecec" />
          <path d="M 62,70 C 80,60 80,80 62,70 Z" fill="#81ecec" />
        </g>
      )}

      {type === 'skull-arrows' && (
        <g>
          <polygon points={outerHex} fill="#6c5ce7" />
          <polygon points={innerHex} fill="#1e152a" />
          <polygon points={innerShadow} fill="#000000" opacity="0.3" />
          <path d="M 30,55 L 70,85 M 70,55 L 30,85" stroke="#a29bfe" strokeWidth="4" />
          <circle cx="50" cy="65" r="14" fill="#fd79a8" />
          <circle cx="44" cy="62" r="3" fill="#1e152a" />
          <circle cx="56" cy="62" r="3" fill="#1e152a" />
          <path d="M 45,73 L 55,73" stroke="#1e152a" strokeWidth="2" />
        </g>
      )}

      {type === 'star' && (
        <g>
          <polygon points={outerHex} fill="#fdcb6e" />
          <polygon points={innerHex} fill="#2d1d00" />
          <polygon points={innerShadow} fill="#000000" opacity="0.3" />
          <path d="M 50,35 L 54,48 L 68,48 L 57,56 L 61,70 L 50,61 L 39,70 L 43,56 L 32,48 L 46,48 Z" fill="#ffeaa7" />
          <circle cx="50" cy="55" r="6" fill="#e17055" />
        </g>
      )}

      {type === 'shield-book' && (
        <g>
          <polygon points={outerHex} fill="#e17055" />
          <polygon points={innerHex} fill="#2b0900" />
          <polygon points={innerShadow} fill="#000000" opacity="0.3" />
          <path d="M 30,45 C 30,45 50,35 50,35 C 50,35 70,45 70,45 C 70,75 50,90 50,90 C 50,90 30,75 30,45 Z" fill="#fab1a0" />
          <path d="M 38,55 L 50,50 L 62,55 L 62,75 L 50,70 L 38,75 Z" fill="#d63031" />
        </g>
      )}

      {type === 'lightning' && (
        <g>
          <polygon points={outerHex} fill="#00cec9" />
          <polygon points={innerHex} fill="#002b2a" />
          <polygon points={innerShadow} fill="#000000" opacity="0.3" />
          <polygon points="55,30 35,65 50,65 45,100 65,60 50,60" fill="#74b9ff" />
        </g>
      )}
    </svg>
  );
}

// ─── Badge Data ───────────────────────────────────────────────────────────────
interface BadgeItem {
  id: string;
  name: string;
  category: 'Frontend' | 'Backend' | 'DevOps' | 'Systems' | 'Architecture' | 'AI';
  tier: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  xp: number;
  unlocked: boolean;
  achievedDate?: string;
  progress?: number; // percentage (0-100) if locked
  progressText?: string;
  description: string;
  courseName: string;
  type: string;
}

const BADGES: BadgeItem[] = [
  {
    id: 'b1',
    name: 'React Fundamentals',
    category: 'Frontend',
    tier: 'Common',
    xp: 50,
    unlocked: true,
    achievedDate: 'Oct 15, 2026',
    description: 'Mastered React component basics, hooks, and state management.',
    courseName: 'React Fundamentals',
    type: 'sword-crown'
  },
  {
    id: 'b2',
    name: 'Advanced Next.js',
    category: 'Frontend',
    tier: 'Rare',
    xp: 150,
    unlocked: true,
    achievedDate: 'Nov 02, 2026',
    description: 'Built production App Router apps with Server Components and Streaming SSR.',
    courseName: 'Advanced Next.js',
    type: 'potion'
  },
  {
    id: 'b3',
    name: 'TypeScript Masterclass',
    category: 'Frontend',
    tier: 'Rare',
    xp: 200,
    unlocked: true,
    achievedDate: 'Dec 12, 2026',
    description: 'Wrote bulletproof type definitions, generics, template literals, and utility types.',
    courseName: 'TypeScript Masterclass',
    type: 'mountain'
  },
  {
    id: 'b4',
    name: 'System Architecture',
    category: 'Architecture',
    tier: 'Epic',
    xp: 300,
    unlocked: true,
    achievedDate: 'Jan 05, 2027',
    description: 'Designed distributed microservices, message queues, and fault-tolerant APIs.',
    courseName: 'System Architecture',
    type: 'flower'
  },
  {
    id: 'b5',
    name: 'Cloud Native DevOps',
    category: 'DevOps',
    tier: 'Epic',
    xp: 500,
    unlocked: false,
    progress: 75,
    progressText: '3 / 4 Modules Completed',
    description: 'Deploys Kubernetes clusters, CI/CD pipelines, Terraform, and Docker containers.',
    courseName: 'Cloud Native DevOps',
    type: 'skull-arrows'
  },
  {
    id: 'b6',
    name: 'Full Stack Master',
    category: 'Frontend',
    tier: 'Legendary',
    xp: 600,
    unlocked: false,
    progress: 50,
    progressText: '5 / 10 Courses Completed',
    description: 'End-to-end web engineering mastery across client, backend DB, and infrastructure.',
    courseName: 'Full Stack Master',
    type: 'star'
  },
  {
    id: 'b7',
    name: 'Backend Specialist',
    category: 'Backend',
    tier: 'Epic',
    xp: 450,
    unlocked: true,
    achievedDate: 'Feb 10, 2027',
    description: 'Built high-throughput Spring Boot REST/GraphQL microservices with PostgreSQL.',
    courseName: 'Backend Specialist',
    type: 'shield-book'
  },
  {
    id: 'b8',
    name: 'Performance Guru',
    category: 'Systems',
    tier: 'Legendary',
    xp: 900,
    unlocked: false,
    progress: 30,
    progressText: '2 / 6 Labs Completed',
    description: 'Optimized SQL query plans, Redis caching, bundle size, and web vital metrics.',
    courseName: 'Performance Guru',
    type: 'lightning'
  }
];

// ─── Certificate Data ────────────────────────────────────────────────────────
interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  code: string;
  skills: string[];
  score: number;
  percentile: number;
  status: 'PASSED' | 'FAILED';
}

const CERTIFICATES: CertificateItem[] = [
  {
    id: 'cert-1',
    title: 'Two-Dimensional Arrays and Pointers in C',
    issuer: 'Arcade Engineering Academy',
    issueDate: 'Mar 8, 2024',
    code: 'ARC-C-2024-8891',
    skills: ['Arrays', 'Pointers', 'Memory Allocation'],
    score: 60,
    percentile: 60,
    status: 'PASSED'
  },
  {
    id: 'cert-2',
    title: 'Pointers In C Programming',
    issuer: 'Arcade Engineering Academy',
    issueDate: 'Mar 2, 2024',
    code: 'ARC-PTR-2024-9412',
    skills: ['Pointers', 'C Programming', 'Memory'],
    score: 60,
    percentile: 60,
    status: 'PASSED'
  },
  {
    id: 'cert-3',
    title: 'C Programming Course',
    issuer: 'Arcade Engineering Academy',
    issueDate: 'Mar 2, 2024',
    code: 'ARC-C-2024-7731',
    skills: ['C Language', 'Algorithms', 'Syntax'],
    score: 66,
    percentile: 66,
    status: 'PASSED'
  },
  {
    id: 'cert-4',
    title: 'Advanced Memory Management & Dynamic Allocation',
    issuer: 'Arcade Engineering Academy',
    issueDate: 'Jan 14, 2024',
    code: 'ARC-MEM-2024-3104',
    skills: ['Malloc', 'Free', 'Heap Management'],
    score: 45,
    percentile: 45,
    status: 'FAILED'
  }
];

// ─── Asymmetric TabButton Matching My Learning ───────────────────────────────
function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative px-5 sm:px-6 py-2 rounded-tl-[1.25rem] rounded-br-[1.25rem] rounded-tr-md rounded-bl-md text-xs sm:text-sm font-black tracking-tight transition-all duration-200 select-none cursor-pointer min-w-[120px] text-center ${
        active
          ? 'bg-white dark:bg-slate-900 text-[#2962D6] dark:text-[#3B82F6] border-2 border-[#2962D6] dark:border-[#3B82F6] shadow-xs'
          : 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      <span className="relative z-10">{label}</span>
    </button>
  );
}

// ─── Main Achievements Page Component ─────────────────────────────────────────
export default function AchievementsPage() {
  const { user, updateUser } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [certFilter, setCertFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);
  const [badgeSpinKey, setBadgeSpinKey] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'badges' | 'certificates'>('badges');

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const openBadgeDetails = (badge: BadgeItem) => {
    setSelectedBadge(badge);
    setBadgeSpinKey((k) => k + 1);
  };

  // Load fresh profile details from DB if available
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await UserService.getMe();
        if (data) updateUser(data);
      } catch (err) {
        console.error('Failed to load user profile in achievements:', err);
      }
    };
    loadUserData();
  }, []);

  const handleDownloadCert = (certTitle: string) => {
    toast.success(`Downloading certificate PDF for "${certTitle}"...`);
  };

  // Stats calculation
  const unlockedCount = BADGES.filter(b => b.unlocked).length;
  const totalBadges = BADGES.length;

  const filteredBadges = useMemo(() => {
    return BADGES.filter(badge => {
      const matchesCategory =
        selectedCategory === 'All' ? true :
          selectedCategory === 'Unlocked' ? badge.unlocked :
            selectedCategory === 'In Progress' ? !badge.unlocked :
              badge.category === selectedCategory;

      const matchesSearch = badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        badge.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const filteredCertificates = useMemo(() => {
    return CERTIFICATES.filter((cert) => {
      const matchesFilter =
        certFilter === 'All' ? true :
          certFilter === 'Passed' ? cert.status === 'PASSED' :
            certFilter === 'Failed' ? cert.status === 'FAILED' : true;

      const matchesSearch = cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesFilter && matchesSearch;
    });
  }, [certFilter, searchQuery]);

  return (
    <div className="relative min-h-screen w-full text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/40">
      {/* Background — celebratory ambient gradient matching Home and Explore pages */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 dark:hidden -z-10"
        style={{
          background: `
            radial-gradient(ellipse 55% 40% at 8% 12%, rgba(76, 111, 255, 0.16) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 92% 20%, rgba(245, 158, 11, 0.16) 0%, transparent 60%),
            radial-gradient(ellipse 45% 35% at 5% 50%, rgba(147, 51, 234, 0.11) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 95% 52%, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 6% 78%, rgba(14, 165, 233, 0.11) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 94% 80%, rgba(251, 191, 36, 0.13) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 50% 95%, rgba(244, 63, 94, 0.08) 0%, transparent 60%),
            linear-gradient(to bottom, #E9EEFB 0%, #FAF7FE 25%, #FFFFFF 50%, #FFFFFF 75%, #FEF5E7 100%)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 hidden dark:block -z-10 bg-slate-950"
        style={{
          background: `
            radial-gradient(ellipse 65% 45% at 8% 12%, rgba(76, 111, 255, 0.20) 0%, transparent 60%),
            radial-gradient(ellipse 55% 40% at 92% 24%, rgba(245, 158, 11, 0.18) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 5% 52%, rgba(147, 51, 234, 0.14) 0%, transparent 60%),
            radial-gradient(ellipse 55% 40% at 6% 76%, rgba(14, 165, 233, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 55% 40% at 94% 76%, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
            linear-gradient(to bottom, #030712 0%, #0E0F26 35%, #16102B 70%, #030712 100%)
          `,
        }}
      />

      {/* Main Page Container matching My Learning layout & responsive spacing */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-24 space-y-6 sm:space-y-8">
        {/* ── Page Hero: Heading, Subtitle & Statistics ── */}
        <AchievementsHero
          unlockedCount={unlockedCount}
          totalBadges={totalBadges}
          streakDays={14}
          certificatesCount={CERTIFICATES.length}
        />

        {/* ── Toolbar: Left Asymmetric Tabs | Right Search ── */}
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-1">
          {/* LEFT: Arcade Signature Geometric Asymmetric Tabs */}
          <div
            className="flex flex-wrap items-center justify-start gap-2.5 sm:gap-3 w-full md:w-auto"
            role="tablist"
            aria-label="Achievements sections"
          >
            <TabButton
              active={activeTab === 'badges'}
              onClick={() => {
                setActiveTab('badges');
                setSearchQuery('');
              }}
              label={`Badges & Honors (${unlockedCount})`}
            />
            <TabButton
              active={activeTab === 'certificates'}
              onClick={() => {
                setActiveTab('certificates');
                setSearchQuery('');
              }}
              label={`Certificates (${CERTIFICATES.length})`}
            />
          </div>

          {/* RIGHT: Search Field with Asymmetric Geometric Border */}
          <div className="w-full md:w-72 flex items-center justify-start md:justify-end shrink-0">
            <AnimatePresence initial={false}>
              {isSearchOpen || searchQuery ? (
                <motion.div
                  key="search-input-field"
                  initial={{ opacity: 0, width: '40px' }}
                  animate={{ opacity: 1, width: '100%' }}
                  exit={{ opacity: 0, width: '40px' }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="relative w-full flex items-center"
                >
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
                  />
                  <input
                    ref={(el) => {
                      searchInputRef.current = el;
                      if (el) el.focus();
                    }}
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setSearchQuery('');
                        setIsSearchOpen(false);
                      }
                    }}
                    placeholder={activeTab === 'certificates' ? 'Search certificates...' : 'Search badges...'}
                    className="w-full pl-9 pr-8 py-2 rounded-tl-[1.25rem] rounded-br-[1.25rem] rounded-tr-md rounded-bl-md text-xs sm:text-sm bg-transparent border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-700 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    aria-label="Close search"
                    title="Close search"
                  >
                    <X size={15} />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="search-icon-toggle"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.15 }}
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors flex items-center justify-center cursor-pointer"
                  aria-label="Open search"
                  title="Search"
                >
                  <Search size={21} className="stroke-[2.2]" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── TAB 1: BADGES GALLERY ── */}
        {activeTab === 'badges' && (
          <section aria-label="Badges & Honors" className="space-y-6">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {['All', 'Unlocked', 'In Progress'].map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all select-none cursor-pointer border ${
                      isActive
                        ? 'bg-gradient-to-r from-[#2962D6] via-[#2C83F5] to-[#27C5D8] text-white border-transparent shadow-sm'
                        : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Badges Grid using My Learning Card Design System */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
              {filteredBadges.map((badge, idx) => (
                <motion.div
                  key={badge.id}
                  layout="position"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: Math.min(idx * 0.04, 0.2) }}
                  className="group relative flex flex-col items-center justify-between overflow-hidden rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-5 shadow-[0_8px_30px_rgba(20,20,43,0.05)] transition-all hover:shadow-[0_12px_36px_rgba(20,20,43,0.08)] hover:-translate-y-1 backdrop-blur-sm"
                >
                  {/* Decorative ambient background glow */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-12 -bottom-12 h-44 w-44 rounded-full bg-gradient-to-br from-[#4C6FFF]/10 via-[#1DB876]/8 to-transparent blur-2xl"
                  />

                  {/* Interactive Badge Button (No inner box container) */}
                  <button
                    type="button"
                    onClick={() => openBadgeDetails(badge)}
                    aria-label={`View ${badge.name} badge details`}
                    className="group/badge relative w-full pt-2 pb-2 flex flex-col items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2962D6] dark:focus-visible:ring-[#3B82F6] rounded-2xl transition-all"
                  >
                    {/* Badge Image sitting directly on outer card background */}
                    <div className="w-28 h-32 sm:w-32 sm:h-36 relative flex items-center justify-center drop-shadow-md transition-transform duration-300 group-hover/badge:scale-105 group-active/badge:scale-95">
                      <BadgeGraphic type={badge.type} unlocked={badge.unlocked} />
                      {!badge.unlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/25 backdrop-blur-[1px] rounded-2xl">
                          <Lock className="w-8 h-8 text-white drop-shadow-md" />
                        </div>
                      )}
                    </div>

                    {/* Badge Title */}
                    <span className="mt-4 text-base sm:text-lg font-bold tracking-tight text-[#14142b] dark:text-white line-clamp-1 text-center group-hover/badge:text-[#2962D6] dark:group-hover/badge:text-[#3B82F6] transition-colors">
                      {badge.name}
                    </span>
                    
                    {/* Two-line description */}
                    <span className="mt-1 text-[13px] leading-5 text-slate-500 dark:text-slate-400 text-center line-clamp-2 h-[40px] px-1">
                      {badge.description}
                    </span>
                  </button>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ── TAB 2: CERTIFICATES ── */}
        {activeTab === 'certificates' && (
          <section aria-label="Certificates" className="space-y-6">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {['All', 'Passed', 'Failed'].map((filter) => {
                const isActive = certFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setCertFilter(filter)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all select-none cursor-pointer border ${
                      isActive
                        ? 'bg-gradient-to-r from-[#2962D6] via-[#2C83F5] to-[#27C5D8] text-white border-transparent shadow-sm'
                        : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>

            {/* Certificates Grid matching My Learning Card System */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {filteredCertificates.map((cert, idx) => {
                const isPassed = cert.status !== 'FAILED';

                return (
                  <motion.div
                    key={cert.id}
                    layout="position"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: Math.min(idx * 0.04, 0.2) }}
                    className="group relative flex h-full flex-col justify-between overflow-hidden rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 sm:p-5 shadow-[0_8px_30px_rgba(20,20,43,0.05)] transition-all hover:shadow-[0_12px_36px_rgba(20,20,43,0.08)] hover:-translate-y-1 backdrop-blur-sm"
                  >
                    {/* Ambient Glow */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -bottom-12 h-44 w-44 rounded-full bg-gradient-to-br from-[#4C6FFF]/10 via-[#1DB876]/8 to-transparent blur-2xl"
                    />

                    <div className="relative z-10 flex flex-1 flex-col justify-between gap-4">
                      {/* Top Header Seal Artwork */}
                      <div className="relative h-44 sm:h-48 w-full shrink-0 overflow-hidden rounded-tl-[1.75rem] rounded-br-[1.75rem] rounded-tr-md rounded-bl-md border border-slate-200/70 dark:border-slate-800 shadow-xs transition-transform duration-500 group-hover:scale-[1.02] bg-slate-50/70 dark:bg-slate-800/40 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs bg-white dark:bg-slate-800 my-1">
                          <Award className={`w-8 h-8 stroke-[2] ${isPassed ? 'text-[#2962D6]' : 'text-rose-500'}`} />
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className={`w-3.5 h-3.5 fill-current ${isPassed ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                          <Star className={`w-4 h-4 fill-current ${isPassed ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                          <Star className={`w-3.5 h-3.5 fill-current ${isPassed ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                        </div>
                      </div>

                      {/* Details */}
                      {/* Details */}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {!isPassed && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300">
                              <X size={11} />
                              Failed
                            </span>
                          )}
                          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            {cert.issuer}
                          </span>
                        </div>

                        <h3 className="line-clamp-1 text-base sm:text-lg font-bold tracking-tight text-[#14142b] dark:text-white">
                          {cert.title}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Issued on {cert.issueDate}</span>
                        </div>
                      </div>

                      {/* Bottom Action Button */}
                      <div className="pt-1">
                        {isPassed ? (
                          <button
                            type="button"
                            onClick={() => handleDownloadCert(cert.title)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-[#12141C] hover:bg-[#232735] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 px-5 py-3 text-[13px] font-semibold transition-all shadow-xs hover:shadow-md cursor-pointer select-none"
                          >
                            <Download size={15} />
                            <span>Download Certificate</span>
                          </button>
                        ) : (
                          <span
                            className="inline-flex w-full items-center justify-center gap-2 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-slate-100 dark:bg-slate-800 px-5 py-3 text-[13px] font-semibold text-slate-400 dark:text-slate-500 cursor-not-allowed select-none"
                            aria-disabled="true"
                          >
                            Certificate Unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Slide-Over Spotlight Drawer for Badge Details ── */}
        <AnimatePresence>
          {selectedBadge && (
            <div className="fixed inset-0 z-50 overflow-hidden">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedBadge(null)}
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm cursor-pointer"
              />

              {/* Slide-Over Drawer Panel */}
              <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  className="w-screen max-w-md sm:max-w-[480px] bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col justify-between p-6 sm:p-8 overflow-y-auto"
                >
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSelectedBadge(null)}
                      className="group/back p-2 rounded-full text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Go back to Achievements"
                    >
                      <ArrowLeft className="w-5 h-5 transition-transform group-hover/back:-translate-x-0.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedBadge(null)}
                      className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Drawer Main Content */}
                  <div className="flex-1 flex flex-col items-center text-center py-6">
                    {/* Badge Hero Presentation with 3D Spin */}
                    <div
                      className="relative w-full mb-6 pt-4 pb-4 flex flex-col items-center justify-center overflow-visible"
                      style={{ perspective: 1000 }}
                    >
                      {/* Luminous Pulsing Glow */}
                      <motion.div
                        key={`glow-${badgeSpinKey}`}
                        initial={{ opacity: 0.2, scale: 0.6 }}
                        animate={{
                          opacity: [0.2, 0.75, 0.4, 0.8, 0.45],
                          scale: [0.6, 1.3, 0.95, 1.25, 1.05],
                        }}
                        transition={{ duration: 10, ease: 'easeOut' }}
                        className="absolute w-48 h-48 rounded-full bg-gradient-to-tr from-[#2962D6]/25 via-[#2C83F5]/20 to-[#27C5D8]/15 blur-2xl -z-10 pointer-events-none"
                      />

                      {/* 3D Rotating Badge Graphic */}
                      <motion.div
                        key={`badge-spin-${selectedBadge.id}-${badgeSpinKey}`}
                        initial={{ rotateY: 0, rotateX: 12, scale: 0.45, opacity: 0 }}
                        animate={{
                          rotateY: [0, 720, 1440, 2160, 2880, 3600],
                          rotateX: [12, -10, 8, -6, 3, 0],
                          scale: [0.45, 1.15, 0.95, 1.08, 0.98, 1],
                          opacity: [0, 1, 1, 1, 1, 1],
                        }}
                        transition={{
                          duration: 10,
                          ease: [0.16, 1, 0.3, 1],
                          times: [0, 0.2, 0.4, 0.65, 0.85, 1],
                        }}
                        style={{ transformStyle: 'preserve-3d' }}
                        onClick={() => setBadgeSpinKey((k) => k + 1)}
                        className="w-32 h-36 relative flex items-center justify-center drop-shadow-[0_20px_35px_rgba(41,98,214,0.25)] z-20 cursor-pointer select-none"
                        title="Click to spin badge again!"
                        whileHover={{ scale: 1.08, transition: { duration: 0.2 } }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <BadgeGraphic type={selectedBadge.type} unlocked={selectedBadge.unlocked} />
                      </motion.div>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {selectedBadge.name}
                    </h2>

                    <div className="flex items-center justify-center gap-1.5 mt-2 text-xs sm:text-sm font-bold">
                      {selectedBadge.unlocked ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-extrabold">
                          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                          <span>Unlocked on {selectedBadge.achievedDate || 'Nov 02, 2026'}</span>
                        </span>
                      ) : (
                        <span className="text-amber-500 dark:text-amber-400 flex items-center gap-1.5 font-extrabold">
                          <Lock className="w-4 h-4 stroke-[2.5]" />
                          <span>{selectedBadge.progressText || 'In Progress (45% Complete)'}</span>
                        </span>
                      )}
                    </div>

                    {selectedBadge.description && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-sm mx-auto mb-3 mt-3">
                        {selectedBadge.description}
                      </p>
                    )}

                    {/* Circular Arc Gauges */}
                    <div className="w-full pt-4 pb-2 mt-2 grid grid-cols-3 gap-2 text-center">
                      {/* Modules */}
                      <div className="flex flex-col items-center justify-between px-1">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-1">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <defs>
                              <linearGradient id="arcBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#93C5FD" />
                                <stop offset="50%" stopColor="#3B82F6" />
                                <stop offset="100%" stopColor="#1D4ED8" />
                              </linearGradient>
                            </defs>
                            <path
                              d="M 22.5 73 A 36 36 0 1 1 77.5 73"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3.5"
                              className="text-slate-100 dark:text-slate-800"
                            />
                            <path
                              d="M 22.5 73 A 36 36 0 1 1 77.5 73"
                              fill="none"
                              stroke="url(#arcBlue)"
                              strokeWidth="4.5"
                              strokeLinecap="round"
                            />
                            <circle cx="77.5" cy="73" r="3.5" fill="#1D4ED8" />
                            <circle
                              cx="50"
                              cy="50"
                              r="24"
                              className="fill-white dark:fill-slate-900 filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.08)]"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-[#1877F2] dark:text-blue-400">
                            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                          </div>
                        </div>
                        <span className="text-base sm:text-xl font-black text-[#1877F2] dark:text-blue-400 my-0.5 tracking-tight">
                          {selectedBadge.unlocked ? '12 / 12' : '5 / 12'}
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 leading-tight">
                          Modules Completed
                        </span>
                      </div>

                      {/* Quiz Score */}
                      <div className="flex flex-col items-center justify-between px-1">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-1">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <defs>
                              <linearGradient id="arcEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#6EE7B7" />
                                <stop offset="50%" stopColor="#10B981" />
                                <stop offset="100%" stopColor="#047857" />
                              </linearGradient>
                            </defs>
                            <path
                              d="M 22.5 73 A 36 36 0 1 1 77.5 73"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3.5"
                              className="text-slate-100 dark:text-slate-800"
                            />
                            <path
                              d="M 22.5 73 A 36 36 0 1 1 77.5 73"
                              fill="none"
                              stroke="url(#arcEmerald)"
                              strokeWidth="4.5"
                              strokeLinecap="round"
                            />
                            <circle cx="77.5" cy="73" r="3.5" fill="#047857" />
                            <circle
                              cx="50"
                              cy="50"
                              r="24"
                              className="fill-white dark:fill-slate-900 filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.08)]"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Star className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                          </div>
                        </div>
                        <span className="text-base sm:text-xl font-black text-emerald-600 dark:text-emerald-400 my-0.5 tracking-tight">
                          {selectedBadge.unlocked ? '98%' : '72%'}
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 leading-tight">
                          {selectedBadge.unlocked ? 'Quiz Score' : 'Target: 80%'}
                        </span>
                      </div>

                      {/* Time Invested */}
                      <div className="flex flex-col items-center justify-between px-1">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-1">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <defs>
                              <linearGradient id="arcCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#BAE6FD" />
                                <stop offset="50%" stopColor="#0EA5E9" />
                                <stop offset="100%" stopColor="#0284C7" />
                              </linearGradient>
                            </defs>
                            <path
                              d="M 22.5 73 A 36 36 0 1 1 77.5 73"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3.5"
                              className="text-slate-100 dark:text-slate-800"
                            />
                            <path
                              d="M 22.5 73 A 36 36 0 1 1 77.5 73"
                              fill="none"
                              stroke="url(#arcCyan)"
                              strokeWidth="4.5"
                              strokeLinecap="round"
                            />
                            <circle cx="77.5" cy="73" r="3.5" fill="#0284C7" />
                            <circle
                              cx="50"
                              cy="50"
                              r="24"
                              className="fill-white dark:fill-slate-900 filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.08)]"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-[#0EA5E9] dark:text-cyan-400">
                            <Flame className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                          </div>
                        </div>
                        <span className="text-base sm:text-xl font-black text-[#0EA5E9] dark:text-cyan-400 my-0.5 tracking-tight">
                          {selectedBadge.unlocked ? '18h' : '4.5h'}
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 leading-tight">
                          Time Invested
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Drawer Footer Action Buttons */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedBadge(null)}
                      className="py-3 px-4 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Close
                    </button>

                    {selectedBadge.unlocked ? (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(window.location.href);
                          toast.success(`Share link for "${selectedBadge.name}" copied! 🚀`);
                        }}
                        className="py-3 px-4 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-[#12141C] hover:bg-[#232735] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Trophy className="w-4 h-4" />
                        <span>Share Badge</span>
                      </button>
                    ) : (
                      <Link
                        href="/learning"
                        onClick={() => setSelectedBadge(null)}
                        className="py-3 px-4 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-[#12141C] hover:bg-[#232735] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs text-center"
                      >
                        <span>Continue Course</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
