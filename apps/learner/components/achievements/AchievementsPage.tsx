'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { UserService } from '@/domains/identity';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Trophy, Award, Flame, Star, Zap, CheckCircle2, Lock,
  Search, Shield, ChevronRight, Share2, Sparkles, Filter,
  Check, ArrowRight, ExternalLink, Calendar, Medal, Clock,
  BookOpen, GraduationCap, Video, Wrench, Laptop, Download, ClipboardList, X, Code, MoreVertical, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import TiltedCard from '@/shared/design-system/ui/tilted-card';
import { MagicBento, ParticleCard } from '@/shared/design-system/ui/magic-bento';
import SpecularButton from '@/shared/design-system/ui/SpecularButton';
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
    description: 'Mastered component state, hooks, lifecycle, and modern JSX patterns.',
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
    code: 'ARC-[#0F172A]-2024-7731',
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

// ─── Quests Data ─────────────────────────────────────────────────────────────
const QUESTS = [
  {
    id: 'q1',
    title: 'Daily Code Sprint',
    description: 'Complete at least 1 lesson module today.',
    xp: 50,
    completed: true,
    progressText: '1 / 1 Completed'
  },
  {
    id: 'q2',
    title: 'Weekly Streaker',
    description: 'Maintain an active learning streak for 7 consecutive days.',
    xp: 150,
    completed: true,
    progressText: '7 / 7 Days'
  },
  {
    id: 'q3',
    title: 'Quiz Titan',
    description: 'Pass 3 course quizzes with a score of 90% or higher.',
    xp: 200,
    completed: false,
    progressText: '2 / 3 Quizzes Passed'
  }
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function AchievementsPage() {
  const { user, updateUser } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [certFilter, setCertFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);
  const [badgeSpinKey, setBadgeSpinKey] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'badges' | 'certificates' | 'quests'>('badges');
  const [hoveredTab, setHoveredTab] = useState<'badges' | 'certificates' | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredCertFilter, setHoveredCertFilter] = useState<string | null>(null);

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

  // User display helpers
  const displayName = user?.fullName || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Arcade Learner');
  const displayBio = user?.bio || user?.workingAt || 'Arcade Learner & Content Explorer';
  const usernameTag = user?.username ? `@${user.username}` : '@learner';

  // Stats calculation
  const unlockedCount = BADGES.filter(b => b.unlocked).length;
  const totalBadges = BADGES.length;
  const totalXp = 4850;
  const level = 12;
  const nextLevelXp = 5000;
  const xpPercent = Math.round((totalXp / nextLevelXp) * 100);

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
    <div 
      className="w-full min-h-screen text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 relative overflow-hidden"
      style={{ 
        background: `
          radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.14) 0px, transparent 50%),
          radial-gradient(at 100% 0%, rgba(14, 165, 233, 0.12) 0px, transparent 50%),
          radial-gradient(at 50% 40%, rgba(240, 253, 250, 0.8) 0px, transparent 60%),
          radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.15) 0px, transparent 50%),
          radial-gradient(at 0% 100%, rgba(56, 189, 248, 0.12) 0px, transparent 50%),
          linear-gradient(135deg, #f0fdf4 0%, #ecfeff 35%, #f8fafc 70%, #f0fdfa 100%)
        `
      }}
    >
      {/* Ambient Glow Orbs in Mint / Emerald / Cyan / Sky Blue Tones */}
      <div className="absolute -top-10 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#10B981]/15 via-[#34D399]/10 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-10 -right-10 w-[550px] h-[550px] bg-gradient-to-bl from-[#0EA5E9]/15 via-[#10B981]/10 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-[45%] -left-10 w-[450px] h-[450px] bg-gradient-to-tr from-[#10B981]/12 via-[#38BDF8]/10 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute -bottom-10 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-[#059669]/12 via-[#0EA5E9]/12 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto pt-10 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Desktop Hero Celebration Section ── */}
        <AchievementsHero
          unlockedCount={unlockedCount}
          totalBadges={totalBadges}
          streakDays={14}
          certificatesCount={CERTIFICATES.length}
        />

        {/* ── Main Navigation Tabs with Moving Selection Pill on Hover/Click ── */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-neutral-800 mb-8 pb-4 mt-6">
          <div 
            className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-1 relative"
            onMouseLeave={() => setHoveredTab(null)}
          >
            {[
              { id: 'badges' as const, label: `Badges & Honors (${unlockedCount})`, icon: Trophy },
              { id: 'certificates' as const, label: `Certificates (${CERTIFICATES.length})`, icon: Award }
            ].map(({ id, label, icon: Icon }) => {
              const isTargeted = (hoveredTab ?? activeTab) === id;

              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  onMouseEnter={() => setHoveredTab(id)}
                  className={`relative px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-colors duration-200 cursor-pointer flex items-center gap-2 select-none z-10 ${
                    isTargeted
                      ? 'text-white font-black'
                      : 'text-slate-600 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isTargeted && (
                    <motion.div
                      layoutId="activeNavTabPill"
                      className="absolute inset-0 rounded-xl shadow-md shadow-emerald-500/20 -z-10"
                      style={{
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                      }}
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <Icon size={16} className="relative z-10" />
                  <span className="relative z-10">{label}</span>
                </button>
              );
            })}
          </div>

          {(activeTab === 'badges' || activeTab === 'certificates') && (
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder={activeTab === 'certificates' ? "Search certificates..." : "Search badges..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/95 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-900 dark:text-white shadow-xs"
              />
            </div>
          )}
        </div>

        {/* ── TAB 1: BADGES GALLERY ── */}
        {activeTab === 'badges' && (
          <div>
            {/* Category Filter Pills with Moving Hover/Active Indicator */}
            <div 
              className="flex flex-wrap items-center gap-2 mb-6 relative"
              onMouseLeave={() => setHoveredCategory(null)}
            >
              {['All', 'Unlocked', 'In Progress'].map((cat) => {
                const isTargeted = (hoveredCategory ?? selectedCategory) === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    onMouseEnter={() => setHoveredCategory(cat)}
                    className={`relative px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-colors duration-200 cursor-pointer select-none ${
                      isTargeted
                        ? 'text-emerald-800 dark:text-emerald-200'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {isTargeted ? (
                      <motion.div
                        layoutId="activeCategoryPill"
                        className="absolute inset-0 bg-emerald-100/90 dark:bg-emerald-950/60 border border-emerald-400/80 dark:border-emerald-600 rounded-full shadow-xs -z-10"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-white/90 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-full -z-10 hover:border-emerald-300" />
                    )}
                    <span className="relative z-10">{cat}</span>
                  </button>
                );
              })}
            </div>

            {/* Keyframe animation for moving dotted lines */}
            <style>{`
              @keyframes marchingDots {
                from {
                  stroke-dashoffset: 0;
                }
                to {
                  stroke-dashoffset: -24;
                }
              }
              .animate-marching-dots {
                animation: marchingDots 2.5s linear infinite;
              }
              .group:hover .animate-marching-dots {
                animation-duration: 1.2s;
              }
            `}</style>

            {/* Badges Grid — Diagonal Curve Cards with Modern Emerald / Sky / Teal Gradient Fills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBadges.map((badge, idx) => {
                const cardColors = [
                  '#059669', // Emerald Green
                  '#0284C7', // Sky Blue
                  '#0D9488', // Teal
                  '#2563EB', // Royal Blue
                  '#10B981', // Mint Emerald
                  '#0891B2', // Cyan
                  '#4F46E5', // Indigo
                  '#16A34A', // Vibrant Green
                ];
                const cardColor = cardColors[idx % cardColors.length];

                return (
                  <div
                    key={badge.id}
                    onClick={() => openBadgeDetails(badge)}
                    className="group relative rounded-tl-[36px] rounded-br-[36px] rounded-tr-none rounded-bl-none p-5 sm:p-6 border shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between hover:scale-[1.02]"
                    style={{
                      background: `linear-gradient(145deg, ${cardColor}18 0%, ${cardColor}08 35%, rgba(255,255,255,0.96) 65%, ${cardColor}14 100%)`,
                      borderColor: `${cardColor}35`
                    }}
                  >
                    <div>
                      {/* Top Header with Pill & Badge Graphic */}
                      <div className="relative w-full flex flex-col items-center justify-center mb-5 pt-1">
                        {/* Top-Left Status Pill Badge */}
                        <div className={`self-start mb-2 ${badge.unlocked ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-100'} backdrop-blur-md font-extrabold text-[10px] tracking-wider uppercase px-3 py-1 rounded-full shadow-sm`}>
                          {badge.unlocked ? 'UNLOCKED' : 'IN PROGRESS'}
                        </div>

                        {/* Hexagon Badge Graphic */}
                        <div className="w-24 h-28 sm:w-28 sm:h-32 relative flex items-center justify-center drop-shadow-md group-hover:scale-105 transition-all duration-300 my-2">
                          <BadgeGraphic type={badge.type} unlocked={badge.unlocked} />
                          {!badge.unlocked && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 backdrop-blur-[1px] rounded-2xl">
                              <Lock className="w-7 h-7 text-white drop-shadow-md" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Category & Tier Label */}
                      <span 
                        className="text-[11px] font-black uppercase tracking-wider block mb-1"
                        style={{ color: cardColor }}
                      >
                        {badge.category} • {badge.tier}
                      </span>

                      {/* Main Title */}
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-snug mb-1.5 line-clamp-1">
                        {badge.name}
                      </h3>

                      {/* Subtitle / Description / Progress */}
                      {badge.unlocked ? (
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-2 leading-relaxed">
                          {badge.description}
                        </p>
                      ) : (
                        <div className="w-full mt-2">
                          <div className="flex justify-between text-[11px] text-slate-700 dark:text-slate-300 font-extrabold mb-1">
                            <span>{badge.progressText}</span>
                            <span>{badge.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-200/80 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${badge.progress || 0}%`, backgroundColor: cardColor }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Text Link */}
                    <div
                      className="w-full pt-3 pb-1 flex items-center justify-center gap-2 font-extrabold text-xs sm:text-sm mt-3 transition-all"
                      style={{ color: cardColor }}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>{badge.unlocked ? 'View Badge Details' : 'Continue Learning'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 2: CERTIFICATES (Diagonal Curve/Sharp Shape Cards with Gradient Fills) ── */}
        {activeTab === 'certificates' && (
          <div>
            {/* Certificate Filter Pills with Moving Hover/Active Indicator */}
            <div 
              className="flex flex-wrap items-center gap-2 mb-6 relative"
              onMouseLeave={() => setHoveredCertFilter(null)}
            >
              {['All', 'Passed', 'Failed'].map((filter) => {
                const isTargeted = (hoveredCertFilter ?? certFilter) === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setCertFilter(filter)}
                    onMouseEnter={() => setHoveredCertFilter(filter)}
                    className={`relative px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-colors duration-200 cursor-pointer select-none ${
                      isTargeted
                        ? 'text-emerald-800 dark:text-emerald-200'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {isTargeted ? (
                      <motion.div
                        layoutId="activeCertFilterPill"
                        className="absolute inset-0 bg-emerald-100/90 dark:bg-emerald-950/60 border border-emerald-400/80 dark:border-emerald-600 rounded-full shadow-xs -z-10"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-white/90 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-full -z-10 hover:border-emerald-300" />
                    )}
                    <span className="relative z-10">{filter}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-2 w-full">
            {filteredCertificates.map((cert, idx) => {
              const isPassed = cert.status !== 'FAILED';
              
              const certColors = [
                '#059669', // Emerald Green
                '#0284C7', // Sky Blue
                '#0D9488', // Teal
                '#2563EB', // Royal Blue
                '#10B981', // Mint Emerald
                '#0891B2', // Cyan
                '#4F46E5', // Indigo
                '#16A34A', // Vibrant Green
              ];
              const cardColor = isPassed ? certColors[idx % certColors.length] : '#E11D48';

              return (
                <div
                  key={cert.id}
                  className="group relative rounded-tl-[36px] rounded-br-[36px] rounded-tr-none rounded-bl-none p-5 sm:p-6 border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:scale-[1.02]"
                  style={{
                    background: `linear-gradient(145deg, ${cardColor}18 0%, ${cardColor}08 35%, rgba(255,255,255,0.96) 65%, ${cardColor}14 100%)`,
                    borderColor: `${cardColor}35`
                  }}
                >
                  <div>
                    {/* Top Header with Pill & Medal Seal */}
                    <div className="relative w-full flex flex-col items-center justify-center mb-5 pt-1">
                      {/* Top-Left Status Pill Badge */}
                      <div className={`self-start mb-2 ${isPassed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'} backdrop-blur-md font-extrabold text-[10px] tracking-wider uppercase px-3 py-1 rounded-full shadow-sm`}>
                        {cert.status || (isPassed ? 'PASSED' : 'FAILED')}
                      </div>

                      {/* Scalloped Medal Seal */}
                      <div 
                        className="w-16 h-16 rounded-full border flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300 bg-white/90 dark:bg-neutral-800 my-2"
                        style={{ borderColor: `${cardColor}40` }}
                      >
                        <Award className="w-8 h-8 stroke-[2]" style={{ color: cardColor }} />
                      </div>

                      {/* 3 Stars Underneath */}
                      <div 
                        className="flex items-center gap-1 mt-1"
                        style={{ color: isPassed ? cardColor : '#94a3b8' }}
                      >
                        <Star className="w-3 h-3 fill-current" />
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </div>
                    </div>

                    {/* Category Label */}
                    <span 
                      className="text-[11px] font-black uppercase tracking-wider block mb-1"
                      style={{ color: cardColor }}
                    >
                      {cert.issuer || 'ACCREDITED CERTIFICATE'}
                    </span>

                    {/* Course Title */}
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-snug mb-1.5 line-clamp-1">
                      {cert.title}
                    </h3>

                    {/* Issue Date Details */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Issued on {cert.issueDate}</span>
                    </div>
                  </div>

                  {/* Bottom Action Text Link */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isPassed) {
                        toast.error(`Certificate unavailable. Minimum passing score required for "${cert.title}".`);
                      } else {
                        toast.info(`Downloading certificate for "${cert.title}"...`);
                      }
                    }}
                    className="w-full pt-3 pb-1 flex items-center justify-center gap-2 font-extrabold text-xs sm:text-sm mt-3 cursor-pointer transition-opacity hover:opacity-80"
                    style={{ color: cardColor }}
                  >
                    <Download className="w-4 h-4" />
                    <span>{isPassed ? 'Download Certificate' : 'Retake Assessment'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}



        {/* ── RIGHT SLIDE-OVER SPOTLIGHT DRAWER ── */}
        <AnimatePresence>
          {selectedBadge && (
            <div className="fixed inset-0 z-50 overflow-hidden">
              {/* Backdrop Blur Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedBadge(null)}
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm cursor-pointer"
              />

              {/* Slide-Over Drawer Panel — Clean White Main Box */}
              <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  className="w-screen max-w-md sm:max-w-[480px] bg-white dark:bg-neutral-900 border-l border-slate-200/80 dark:border-neutral-800 shadow-2xl flex flex-col justify-between p-6 sm:p-8 overflow-y-auto"
                >
                  {/* ── Top Header: Back Arrow to return to Achievements page ── */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setSelectedBadge(null)}
                      className="group/back p-2 rounded-full text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-white hover:bg-emerald-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Go back to Achievements"
                    >
                      <ArrowLeft className="w-5 h-5 transition-transform group-hover/back:-translate-x-0.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedBadge(null)}
                      className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* ── Main Blended Content ── */}
                  <div className="flex-1 flex flex-col items-center text-center py-6">

                    {/* Badge Hero Presentation with 3D 3-Second Spin */}
                    <div 
                      className="relative w-full mb-6 pt-4 pb-4 flex flex-col items-center justify-center overflow-visible"
                      style={{ perspective: 1000 }}
                    >
                      {/* Floating Sparkle Elements in Mint / Cyan / Emerald */}
                      <motion.div
                        key={`sparkle1-${badgeSpinKey}`}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: [0, 1, 0.6, 1, 0.8, 1], scale: [0, 1.3, 0.9, 1.2, 0.95, 1] }}
                        transition={{ duration: 3.5, delay: 0.1, repeat: 2 }}
                        className="absolute top-2 left-8 text-[#10B981] text-sm animate-pulse"
                      >
                        ✦
                      </motion.div>
                      <motion.div
                        key={`sparkle2-${badgeSpinKey}`}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: [0, 1, 0.8, 1, 0.6, 1], scale: [0, 1.5, 1, 1.3, 1, 1] }}
                        transition={{ duration: 3.2, delay: 0.4, repeat: 2 }}
                        className="absolute top-6 right-10 text-[#0EA5E9] text-xs animate-ping"
                      >
                        ✦
                      </motion.div>
                      <motion.div
                        key={`sparkle3-${badgeSpinKey}`}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: [0, 1, 0.7, 1, 0.8, 1], scale: [0, 1.2, 1, 1.1, 0.95, 1] }}
                        transition={{ duration: 3.3, delay: 0.2, repeat: 2 }}
                        className="absolute bottom-2 left-12 text-[#34D399] text-xs"
                      >
                        ✦
                      </motion.div>

                      {/* Luminous Pulsing Glow Backdrop during 10s Spin */}
                      <motion.div
                        key={`glow-${badgeSpinKey}`}
                        initial={{ opacity: 0.2, scale: 0.6 }}
                        animate={{
                          opacity: [0.2, 0.75, 0.4, 0.8, 0.45],
                          scale: [0.6, 1.3, 0.95, 1.25, 1.05],
                        }}
                        transition={{ duration: 10, ease: 'easeOut' }}
                        className="absolute w-48 h-48 rounded-full bg-gradient-to-tr from-[#10B981]/30 via-[#0EA5E9]/25 to-[#34D399]/20 blur-2xl -z-10 pointer-events-none"
                      />

                      {/* 3D 10-Second Rotating Center Hexagonal Badge Graphic */}
                      <motion.div
                        key={`badge-spin-${selectedBadge.id}-${badgeSpinKey}`}
                        initial={{
                          rotateY: 0,
                          rotateX: 12,
                          scale: 0.45,
                          opacity: 0,
                        }}
                        animate={{
                          rotateY: [0, 720, 1440, 2160, 2880, 3600], // 10 full 360° revolutions
                          rotateX: [12, -10, 8, -6, 3, 0],
                          scale: [0.45, 1.15, 0.95, 1.08, 0.98, 1],
                          opacity: [0, 1, 1, 1, 1, 1],
                        }}
                        transition={{
                          duration: 10, // Exactly 10 seconds
                          ease: [0.16, 1, 0.3, 1], // Majestic smooth deceleration curve
                          times: [0, 0.2, 0.4, 0.65, 0.85, 1],
                        }}
                        style={{
                          transformStyle: 'preserve-3d',
                        }}
                        onClick={() => setBadgeSpinKey((k) => k + 1)}
                        className="w-32 h-36 relative flex items-center justify-center drop-shadow-[0_20px_35px_rgba(16,185,129,0.28)] z-20 cursor-pointer select-none"
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

                    {/* Description Paragraph */}
                    {selectedBadge.description && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-sm mx-auto mb-3 mt-3">
                        {selectedBadge.description}
                      </p>
                    )}

                    {/* ── 3-Column Circular Arc Gauge Statistics — Seamlessly Blended ── */}
                    <div className="w-full pt-4 pb-2 mt-2 grid grid-cols-3 gap-2 text-center">

                      {/* Column 1: Modules Completed */}
                      <div className="flex flex-col items-center justify-between px-1">
                        {/* Circular Arc Gauge Icon */}
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-1">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <defs>
                              <linearGradient id="arcBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#93C5FD" />
                                <stop offset="50%" stopColor="#3B82F6" />
                                <stop offset="100%" stopColor="#1D4ED8" />
                              </linearGradient>
                            </defs>
                            {/* Faint Outer Ring Track */}
                            <path
                              d="M 22.5 73 A 36 36 0 1 1 77.5 73"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3.5"
                              className="text-blue-50 dark:text-neutral-800"
                            />
                            {/* Progress Arc */}
                            <path
                              d="M 22.5 73 A 36 36 0 1 1 77.5 73"
                              fill="none"
                              stroke="url(#arcBlue)"
                              strokeWidth="4.5"
                              strokeLinecap="round"
                            />
                            {/* End Cap Dot */}
                            <circle cx="77.5" cy="73" r="3.5" fill="#1D4ED8" />
                            {/* Inner Elevated Circle */}
                            <circle
                              cx="50"
                              cy="50"
                              r="24"
                              className="fill-white dark:fill-neutral-900 filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.08)]"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-[#1877F2] dark:text-blue-400">
                            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                          </div>
                        </div>

                        {/* Value */}
                        <span className="text-base sm:text-xl font-black text-[#1877F2] dark:text-blue-400 my-0.5 tracking-tight">
                          {selectedBadge.unlocked ? '12 / 12' : '5 / 12'}
                        </span>
                        {/* Label */}
                        <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 leading-tight">
                          Modules Completed
                        </span>
                      </div>

                      {/* Column 2: Quiz Score */}
                      <div className="flex flex-col items-center justify-between px-1">
                        {/* Circular Arc Gauge Icon */}
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-1">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <defs>
                              <linearGradient id="arcEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#6EE7B7" />
                                <stop offset="50%" stopColor="#10B981" />
                                <stop offset="100%" stopColor="#047857" />
                              </linearGradient>
                            </defs>
                            {/* Faint Outer Ring Track */}
                            <path
                              d="M 22.5 73 A 36 36 0 1 1 77.5 73"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3.5"
                              className="text-emerald-50 dark:text-neutral-800"
                            />
                            {/* Progress Arc */}
                            <path
                              d="M 22.5 73 A 36 36 0 1 1 77.5 73"
                              fill="none"
                              stroke="url(#arcEmerald)"
                              strokeWidth="4.5"
                              strokeLinecap="round"
                            />
                            {/* End Cap Dot */}
                            <circle cx="77.5" cy="73" r="3.5" fill="#047857" />
                            {/* Inner Elevated Circle */}
                            <circle
                              cx="50"
                              cy="50"
                              r="24"
                              className="fill-white dark:fill-neutral-900 filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.08)]"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Star className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                          </div>
                        </div>

                        {/* Value */}
                        <span className="text-base sm:text-xl font-black text-emerald-600 dark:text-emerald-400 my-0.5 tracking-tight">
                          {selectedBadge.unlocked ? '98%' : '72%'}
                        </span>
                        {/* Label */}
                        <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 leading-tight">
                          {selectedBadge.unlocked ? 'Quiz Score' : 'Target: 80%'}
                        </span>
                      </div>

                      {/* Column 3: Time Invested */}
                      <div className="flex flex-col items-center justify-between px-1">
                        {/* Circular Arc Gauge Icon */}
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-1">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <defs>
                              <linearGradient id="arcCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#BAE6FD" />
                                <stop offset="50%" stopColor="#0EA5E9" />
                                <stop offset="100%" stopColor="#0284C7" />
                              </linearGradient>
                            </defs>
                            {/* Faint Outer Ring Track */}
                            <path
                              d="M 22.5 73 A 36 36 0 1 1 77.5 73"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3.5"
                              className="text-cyan-50 dark:text-neutral-800"
                            />
                            {/* Progress Arc */}
                            <path
                              d="M 22.5 73 A 36 36 0 1 1 77.5 73"
                              fill="none"
                              stroke="url(#arcCyan)"
                              strokeWidth="4.5"
                              strokeLinecap="round"
                            />
                            {/* End Cap Dot */}
                            <circle cx="77.5" cy="73" r="3.5" fill="#0284C7" />
                            {/* Inner Elevated Circle */}
                            <circle
                              cx="50"
                              cy="50"
                              r="24"
                              className="fill-white dark:fill-neutral-900 filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.08)]"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-[#0EA5E9] dark:text-cyan-400">
                            <Clock className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                          </div>
                        </div>

                        {/* Value */}
                        <span className="text-base sm:text-xl font-black text-[#0EA5E9] dark:text-cyan-400 my-0.5 tracking-tight">
                          {selectedBadge.unlocked ? '18h' : '4.5h'}
                        </span>
                        {/* Label */}
                        <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 leading-tight">
                          Time Invested
                        </span>
                      </div>

                    </div>

                  </div>

                  {/* ── Dynamic Footer Action Bar (Unlocked vs. Locked CTAs) ── */}
                  <div className="pt-2 grid grid-cols-3 gap-3">
                    {/* Close */}
                    <button
                      type="button"
                      onClick={() => setSelectedBadge(null)}
                      className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-800 dark:text-white font-extrabold text-xs transition-colors cursor-pointer shadow-2xs"
                    >
                      Close
                    </button>

                    {/* Secondary Action: Download (Unlocked) vs View Requirements (Locked) */}
                    {selectedBadge.unlocked ? (
                      <button
                        type="button"
                        onClick={() => {
                          toast.success(`Downloading "${selectedBadge.name}" badge graphic... 🏆`);
                        }}
                        className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-emerald-50/60 dark:hover:bg-neutral-800 text-slate-800 dark:text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Download className="w-4 h-4 text-emerald-600" />
                        <span>Download</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          toast.info(`Prerequisites: Complete 12 modules & score > 80% on final quiz! 📚`);
                        }}
                        className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-800 dark:text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Shield className="w-4 h-4 text-amber-500" />
                        <span>Requirements</span>
                      </button>
                    )}

                    {/* Primary CTA Action: Share (Unlocked) vs Continue Course (Locked) */}
                    {selectedBadge.unlocked ? (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(window.location.href);
                          toast.success(`Share link for "${selectedBadge.name}" copied to clipboard! 🚀`);
                        }}
                        className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:opacity-95 text-white font-extrabold text-xs transition-opacity flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/25"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                    ) : (
                      <Link
                        href="/my-learning"
                        onClick={() => setSelectedBadge(null)}
                        className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:opacity-95 text-white font-extrabold text-xs transition-opacity flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/25 text-center"
                      >
                        <span>Continue</span>
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
