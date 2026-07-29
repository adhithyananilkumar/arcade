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
  BookOpen, GraduationCap, Video, Wrench, Laptop, Download, ClipboardList, X, Code, MoreVertical
} from 'lucide-react';
import Link from 'next/link';
import TiltedCard from '@/shared/design-system/ui/tilted-card';
import { MagicBento, ParticleCard } from '@/shared/design-system/ui/magic-bento';
import AchievementsHero from './AchievementsHero';

// ─── SVG Hexagonal Badge Graphic ─────────────────────────────────────────────
function BadgeGraphic({ type, unlocked }: { type: string; unlocked?: boolean }) {
  const outerHex = "50,5 95,30 95,100 50,125 5,100 5,30";
  const leftBevel = "50,5 50,125 5,100 5,30";
  const innerHex = "50,15 85,35 85,95 50,115 15,95 15,35";
  const innerShadow = "50,15 85,35 85,95 50,115";

  return (
    <svg
      viewBox="0 0 100 130"
      className={`w-full h-full drop-shadow-xl transition-all duration-300 ${!unlocked ? 'grayscale opacity-50' : 'group-hover:scale-105'}`}
    >
      {type === 'sword-crown' && (
        <g>
          <polygon points={outerHex} fill="#b8860b" />
          <polygon points={leftBevel} fill="#ffffff" opacity="0.2" />
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
          <polygon points={leftBevel} fill="#ffffff" opacity="0.2" />
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
          <polygon points={leftBevel} fill="#ffffff" opacity="0.2" />
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
          <polygon points={leftBevel} fill="#ffffff" opacity="0.2" />
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
          <polygon points={leftBevel} fill="#ffffff" opacity="0.2" />
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
          <polygon points={leftBevel} fill="#ffffff" opacity="0.2" />
          <polygon points={innerHex} fill="#2d1d00" />
          <polygon points={innerShadow} fill="#000000" opacity="0.3" />
          <path d="M 50,35 L 54,48 L 68,48 L 57,56 L 61,70 L 50,61 L 39,70 L 43,56 L 32,48 L 46,48 Z" fill="#ffeaa7" />
          <circle cx="50" cy="55" r="6" fill="#e17055" />
        </g>
      )}

      {type === 'shield-book' && (
        <g>
          <polygon points={outerHex} fill="#e17055" />
          <polygon points={leftBevel} fill="#ffffff" opacity="0.2" />
          <polygon points={innerHex} fill="#2b0900" />
          <polygon points={innerShadow} fill="#000000" opacity="0.3" />
          <path d="M 30,45 C 30,45 50,35 50,35 C 50,35 70,45 70,45 C 70,75 50,90 50,90 C 50,90 30,75 30,45 Z" fill="#fab1a0" />
          <path d="M 38,55 L 50,50 L 62,55 L 62,75 L 50,70 L 38,75 Z" fill="#d63031" />
        </g>
      )}

      {type === 'lightning' && (
        <g>
          <polygon points={outerHex} fill="#00cec9" />
          <polygon points={leftBevel} fill="#ffffff" opacity="0.2" />
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);
  const [activeTab, setActiveTab] = useState<'badges' | 'certificates' | 'quests'>('badges');

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
      return cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    });
  }, [searchQuery]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#EBF3FF] via-[#F4F8FF] to-white dark:from-[#0B1736] dark:via-[#0F1E42] dark:to-black text-slate-900 dark:text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto pt-10 pb-24 px-4 sm:px-6 lg:px-8">

      {/* ── Desktop Hero Celebration Section (Image 2 Exact Mock) ── */}
      <AchievementsHero
        unlockedCount={unlockedCount}
        totalBadges={totalBadges}
        streakDays={14}
        certificatesCount={CERTIFICATES.length}
      />

      {/* ── Main Navigation Tabs ── */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-neutral-800 mb-8 pb-4 mt-6">
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${activeTab === 'badges'
              ? 'bg-gradient-to-r from-[#2962D6] via-[#2C83F5] to-[#27C5D8] text-white shadow-md shadow-blue-500/25'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-900'
              }`}
          >
            <Trophy size={16} />
            <span>Badges & Honors ({unlockedCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${activeTab === 'certificates'
              ? 'bg-gradient-to-r from-[#2962D6] via-[#2C83F5] to-[#27C5D8] text-white shadow-md shadow-blue-500/25'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-900'
              }`}
          >
            <Award size={16} />
            <span>Certificates ({CERTIFICATES.length})</span>
          </button>
        </div>

        {(activeTab === 'badges' || activeTab === 'certificates') && (
          <div className="relative hidden md:block w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder={activeTab === 'certificates' ? "Search certificates..." : "Search badges..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2962D6]"
            />
          </div>
        )}
      </div>

      {/* ── TAB 1: BADGES GALLERY ── */}
      {activeTab === 'badges' && (
        <div>
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {['All', 'Unlocked', 'In Progress'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                  : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-neutral-800 hover:border-[#2962D6]'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Badges Grid — Magic Bento Grid with Cursor Spotlight & Border Glow (Particle dots disabled) */}
          <MagicBento
            textAutoHide={false}
            enableStars={false}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={300}
            particleCount={0}
            glowColor="41, 98, 214"
          >
            {filteredBadges.map((badge) => (
              <ParticleCard
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className="magic-bento-card magic-bento-card--border-glow group relative flex flex-col items-center justify-between text-center cursor-pointer p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 transition-all duration-300 shadow-sm hover:shadow-xl"
                glowColor="41, 98, 214"
                particleCount={0}
                enableTilt={true}
                clickEffect={true}
                enableMagnetism={true}
              >
                {/* Badge Hexagon Graphic */}
                <div className="w-28 h-32 relative flex items-center justify-center my-2 drop-shadow-lg group-hover:drop-shadow-2xl transition-all duration-300">
                  <BadgeGraphic type={badge.type} unlocked={badge.unlocked} />
                  {!badge.unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 backdrop-blur-[1px] rounded-2xl">
                      <Lock className="w-7 h-7 text-white drop-shadow-md" />
                    </div>
                  )}
                </div>

                {/* Badge Title & Unlocked Status Sub-line */}
                <div className="my-2 z-10">
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-snug group-hover:text-[#2962D6] dark:group-hover:text-[#2C83F5] transition-colors">
                    {badge.name}
                  </h3>

                  {badge.unlocked ? (
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
                      <span>{badge.achievedDate}</span>
                    </div>
                  ) : (
                    <div className="w-full max-w-[160px] mx-auto mt-2">
                      <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-extrabold mb-1">
                        <span>Progress</span>
                        <span>{badge.progressText}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#2962D6] h-full rounded-full transition-all duration-500"
                          style={{ width: `${badge.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </ParticleCard>
            ))}
          </MagicBento>
        </div>
      )}

      {/* ── TAB 2: CERTIFICATES (Compact & Refined Scale) ── */}
      {activeTab === 'certificates' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto gap-4 sm:gap-5">
          {filteredCertificates.map((cert) => (
            <TiltedCard
              key={cert.id}
              rotateAmplitude={6}
              scaleOnHover={1.02}
              showTooltip={false}
            >
              <div className="relative flex flex-col justify-between rounded-none bg-white dark:bg-neutral-900 border-2 border-[#2962D6] dark:border-[#38BDF8]/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden min-h-[220px] h-full group p-4">

                {/* Top Bar: Left Ribbon Tag (PASSED) */}
                <div className="flex items-center justify-between w-full relative z-10">

                  {/* Left Blue Ribbon Tag */}
                  <div className="flex items-center gap-1.5">
                    {/* Hanging Ribbon Banner */}
                    <div
                      className="w-6 h-7 bg-[#2962D6] shadow-2xs flex items-center justify-center text-white shrink-0 -mt-4"
                      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)' }}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-white text-[#2962D6] flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                      </div>
                    </div>
                    <span className="text-[#2962D6] dark:text-[#38BDF8] text-[10px] font-black tracking-wider uppercase -mt-1.5">
                      {cert.status || 'PASSED'}
                    </span>
                  </div>

                </div>

                {/* Center Graphic: Scalloped Medal Seal + 3 Stars */}
                <div className="flex flex-col items-center justify-center my-1.5 relative z-10">
                  {/* Circular Scalloped Medal Seal */}
                  <div className="w-14 h-14 rounded-full bg-slate-100/90 dark:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                    <Award className="w-7 h-7 text-amber-500 stroke-[2]" />
                  </div>

                  {/* 3 Blue Stars Underneath */}
                  <div className="flex items-center gap-1 mt-1 text-blue-300 dark:text-blue-400">
                    <Star className="w-2 h-2 fill-current" />
                    <Star className="w-2.5 h-2.5 fill-current" />
                    <Star className="w-2 h-2 fill-current" />
                  </div>
                </div>

                {/* Course Title */}
                <div className="text-center my-1 relative z-10 px-1">
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-snug tracking-tight group-hover:text-[#2962D6] dark:group-hover:text-[#38BDF8] transition-colors">
                    {cert.title}
                  </h3>
                </div>

                {/* Footer Bar: Date Left | Share & Download Right */}
                <div className="pt-2 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cert.issueDate}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <div className="w-px h-3.5 bg-slate-200 dark:bg-neutral-800" />

                    {/* Share Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard?.writeText(window.location.href);
                        toast.success(`Share link copied for "${cert.title}" 🚀`);
                      }}
                      title="Share Certificate"
                      className="p-1 rounded-md text-slate-400 hover:text-[#2962D6] dark:hover:text-[#38BDF8] hover:bg-blue-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Download Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success(`Downloading Certificate PDF for "${cert.title}" 📄`);
                      }}
                      title="Download Certificate PDF"
                      className="p-1 rounded-md text-slate-400 hover:text-[#2962D6] dark:hover:text-[#38BDF8] hover:bg-blue-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </TiltedCard>
          ))}
        </div>
      )}



      {/* ── RIGHT SLIDE-OVER SPOTLIGHT DRAWER (1:1 Exact Match to Reference Image) ── */}
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

            {/* Slide-Over Drawer Panel */}
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="w-screen max-w-md sm:max-w-[480px] bg-slate-50/90 dark:bg-neutral-950/90 backdrop-blur-md border-l border-slate-200/80 dark:border-neutral-800 shadow-2xl flex flex-col justify-between p-4 sm:p-6 overflow-y-auto"
              >
                {/* ── Top Header ── */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-neutral-800">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                      Badge Spotlight
                    </h3>
                    <p className="text-xs font-semibold text-slate-400">
                      {selectedBadge.category || 'Frontend'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedBadge(null)}
                    className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* ── Main Inner Card with V-Tear Reveal Header ── */}
                <div className="relative my-4 rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-xl overflow-hidden flex flex-col items-center text-center p-6 sm:p-8">

                  {/* V-Tear Sky Reveal Stage */}
                  <div className="relative w-full -mt-8 -mx-8 mb-6 pt-10 pb-16 bg-gradient-to-b from-[#EBF3FF] via-[#F4F8FF] to-white dark:from-[#132247] dark:via-[#192B54] dark:to-neutral-900 flex flex-col items-center justify-center overflow-hidden">

                    {/* Floating Sparkle Elements */}
                    <div className="absolute top-4 left-10 text-blue-400 text-sm animate-pulse">✦</div>
                    <div className="absolute top-8 right-12 text-cyan-400 text-xs animate-ping">✦</div>
                    <div className="absolute top-16 left-16 text-purple-300 text-xs">✦</div>

                    {/* Center Hexagonal Badge Graphic */}
                    <div className="w-32 h-36 relative flex items-center justify-center drop-shadow-[0_15px_30px_rgba(41,98,214,0.35)] z-20">
                      <BadgeGraphic type={selectedBadge.type} unlocked={selectedBadge.unlocked} />
                    </div>

                    {/* V-Shaped Torn Paper Fold Overlay */}
                    <div className="absolute bottom-0 inset-x-0 w-full z-10 pointer-events-none">
                      <svg
                        viewBox="0 0 400 130"
                        fill="none"
                        className="w-full h-auto text-white dark:text-neutral-900 drop-shadow-md"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M 0 0 Q 50 35 100 65 Q 150 95 200 120 Q 250 95 300 65 Q 350 35 400 0 L 400 130 L 0 130 Z"
                          fill="currentColor"
                        />
                        <path
                          d="M 0 0 Q 50 35 100 65 Q 150 95 200 120 Q 250 95 300 65 Q 350 35 400 0"
                          stroke="#E2E8F0"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>

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
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-sm mx-auto mb-2 mt-2">
                      {selectedBadge.description}
                    </p>
                  )}

                  {/* ── 4-Column Circular Arc Gauge Statistics Box (Exact Match to User Reference) ── */}
                  <div className="w-full rounded-3xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-sm p-4 sm:p-5 mt-4 grid grid-cols-4 gap-1 text-center divide-x divide-slate-100 dark:divide-neutral-800">

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
                      {/* Underline Pill */}
                      <div className="w-6 h-1 rounded-full bg-[#1877F2] mt-2.5" />
                    </div>

                    {/* Column 2: Projects Built */}
                    <div className="flex flex-col items-center justify-between px-1">
                      {/* Circular Arc Gauge Icon */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-1">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <defs>
                            <linearGradient id="arcGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#A7F3D0" />
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
                            stroke="url(#arcGreen)"
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
                        <div className="absolute inset-0 flex items-center justify-center text-[#10B981] dark:text-emerald-400">
                          <Code className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                        </div>
                      </div>

                      {/* Value */}
                      <span className="text-base sm:text-xl font-black text-[#10B981] dark:text-emerald-400 my-0.5 tracking-tight">
                        {selectedBadge.unlocked ? '4' : '1 / 4'}
                      </span>
                      {/* Label */}
                      <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 leading-tight">
                        Projects Built
                      </span>
                      {/* Underline Pill */}
                      <div className="w-6 h-1 rounded-full bg-[#10B981] mt-2.5" />
                    </div>

                    {/* Column 3: Quiz Score */}
                    <div className="flex flex-col items-center justify-between px-1">
                      {/* Circular Arc Gauge Icon */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-1">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <defs>
                            <linearGradient id="arcPurple" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#DDD6FE" />
                              <stop offset="50%" stopColor="#8B5CF6" />
                              <stop offset="100%" stopColor="#6D28D9" />
                            </linearGradient>
                          </defs>
                          {/* Faint Outer Ring Track */}
                          <path
                            d="M 22.5 73 A 36 36 0 1 1 77.5 73"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            className="text-purple-50 dark:text-neutral-800"
                          />
                          {/* Progress Arc */}
                          <path
                            d="M 22.5 73 A 36 36 0 1 1 77.5 73"
                            fill="none"
                            stroke="url(#arcPurple)"
                            strokeWidth="4.5"
                            strokeLinecap="round"
                          />
                          {/* End Cap Dot */}
                          <circle cx="77.5" cy="73" r="3.5" fill="#6D28D9" />
                          {/* Inner Elevated Circle */}
                          <circle
                            cx="50"
                            cy="50"
                            r="24"
                            className="fill-white dark:fill-neutral-900 filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.08)]"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[#8B5CF6] dark:text-purple-400">
                          <Star className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                        </div>
                      </div>

                      {/* Value */}
                      <span className="text-base sm:text-xl font-black text-[#8B5CF6] dark:text-purple-400 my-0.5 tracking-tight">
                        {selectedBadge.unlocked ? '98%' : '72%'}
                      </span>
                      {/* Label */}
                      <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 leading-tight">
                        {selectedBadge.unlocked ? 'Quiz Score' : 'Target: 80%'}
                      </span>
                      {/* Underline Pill */}
                      <div className="w-6 h-1 rounded-full bg-[#8B5CF6] mt-2.5" />
                    </div>

                    {/* Column 4: Time Invested */}
                    <div className="flex flex-col items-center justify-between px-1">
                      {/* Circular Arc Gauge Icon */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-1">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <defs>
                            <linearGradient id="arcOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#FFEDD5" />
                              <stop offset="50%" stopColor="#F97316" />
                              <stop offset="100%" stopColor="#C2410C" />
                            </linearGradient>
                          </defs>
                          {/* Faint Outer Ring Track */}
                          <path
                            d="M 22.5 73 A 36 36 0 1 1 77.5 73"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            className="text-orange-50 dark:text-neutral-800"
                          />
                          {/* Progress Arc */}
                          <path
                            d="M 22.5 73 A 36 36 0 1 1 77.5 73"
                            fill="none"
                            stroke="url(#arcOrange)"
                            strokeWidth="4.5"
                            strokeLinecap="round"
                          />
                          {/* End Cap Dot */}
                          <circle cx="77.5" cy="73" r="3.5" fill="#C2410C" />
                          {/* Inner Elevated Circle */}
                          <circle
                            cx="50"
                            cy="50"
                            r="24"
                            className="fill-white dark:fill-neutral-900 filter drop-shadow-[0_3px_6px_rgba(0,0,0,0.08)]"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[#F97316] dark:text-amber-400">
                          <Clock className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                        </div>
                      </div>

                      {/* Value */}
                      <span className="text-base sm:text-xl font-black text-[#F97316] dark:text-amber-400 my-0.5 tracking-tight">
                        {selectedBadge.unlocked ? '18h' : '4.5h'}
                      </span>
                      {/* Label */}
                      <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 leading-tight">
                        Time Invested
                      </span>
                      {/* Underline Pill */}
                      <div className="w-6 h-1 rounded-full bg-[#F97316] mt-2.5" />
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
                      className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-800 dark:text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Download className="w-4 h-4 text-[#2962D6]" />
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
                      className="py-3 px-4 rounded-2xl bg-[#2962D6] hover:bg-[#2354ba] text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  ) : (
                    <Link
                      href="/my-learning"
                      onClick={() => setSelectedBadge(null)}
                      className="py-3 px-4 rounded-2xl bg-[#2962D6] hover:bg-[#2354ba] text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20 text-center"
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
