'use client';

import { useState } from 'react';
import LogoLoop, { LogoItem } from '@/components/LogoLoop';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Award,
  Medal,
  Star,
  Flame,
  CheckCircle2,
  Lock,
  Share2,
  Download,
  Search,
  Sparkles,
  GraduationCap,
  Clock,
  ShieldCheck,
  Zap,
  ChevronRight,
  Filter,
  Rocket,
  BookOpen,
  Calendar,
  Layers,
  ArrowUpRight,
  ChevronLeft,
  Check,
  TrendingUp,
  UserCheck,
  HelpCircle,
  Gift,
  Tv,
  Wrench,
  Eye,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Data Types ──────────────────────────────────────────────────────────────
interface BadgeItem {
  id: string;
  name: string;
  date: string;
  category: 'Completion' | 'Streaks' | 'Performance' | 'Knowledge' | 'Participation' | 'Special';
  icon: any;
  color: string;
  bgGradient: string;
  badgeType: string;
}

interface CertificateItem {
  id: string;
  title: string;
  issueDate: string;
  courseName: string;
  orgName: string;
  orgIcon: string;
  thumbnailColor: string;
  credentialId: string;
  imageUrl: string;
}

interface RecentItem {
  id: string;
  name: string;
  description: string;
  date: string;
  icon: any;
  color: string;
}

interface GoalItem {
  id: string;
  title: string;
  current: number;
  total: number;
  percentage: number;
  icon: any;
  color: string;
}

// ─── Content Exact Data (from Screenshot) ────────────────────────────────────
const badgesData: BadgeItem[] = [
  {
    id: 'b1',
    name: 'First Course Completed',
    date: 'May 12, 2025',
    category: 'Completion',
    icon: Star,
    color: 'text-indigo-500',
    bgGradient: 'from-indigo-500/20 via-purple-500/10 to-transparent',
    badgeType: 'Level Badge',
  },
  {
    id: 'b2',
    name: '7-Day Streak',
    date: 'May 20, 2025',
    category: 'Streaks',
    icon: Calendar,
    color: 'text-emerald-500',
    bgGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    badgeType: 'Consistency',
  },
  {
    id: 'b3',
    name: 'Top Performer',
    date: 'Jun 2, 2025',
    category: 'Performance',
    icon: Trophy,
    color: 'text-amber-500',
    bgGradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    badgeType: 'Excellence',
  },
  {
    id: 'b4',
    name: 'Quiz Master',
    date: 'Jun 10, 2025',
    category: 'Knowledge',
    icon: GraduationCap,
    color: 'text-sky-500',
    bgGradient: 'from-sky-500/20 via-blue-500/10 to-transparent',
    badgeType: 'Assessment',
  },
  {
    id: 'b5',
    name: 'Active Learner',
    date: 'Jun 18, 2025',
    category: 'Participation',
    icon: Star,
    color: 'text-pink-500',
    bgGradient: 'from-pink-500/20 via-rose-500/10 to-transparent',
    badgeType: 'Engagement',
  },
];

// ─── Arcade Hexagon Badges for React Bits LogoLoop ───────────────────────────
const arcadeBadgeItems: LogoItem[] = [
  {
    title: 'Sword Master',
    node: (
      <div
        onClick={() => {
          const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 74 84"><rect width="100%" height="100%" fill="#090a0f" rx="20"/><path d="M 37 4 L 68 21 L 68 63 L 37 80 L 6 63 L 6 21 Z" fill="#b45309" /><path d="M 37 8 L 64 23 L 64 61 L 37 76 L 10 61 L 10 23 Z" fill="#d97706" /><path d="M 37 12 L 60 25 L 60 59 L 37 72 L 14 59 L 14 25 Z" fill="#0f172a" /><text x="37" y="44" font-family="sans-serif" font-size="7" font-weight="900" fill="#fbbf24" text-anchor="middle" letter-spacing="1">ARCADE BADGE</text><text x="37" y="54" font-family="serif" font-size="6" font-weight="bold" fill="#ffffff" text-anchor="middle">Sword Master</text></svg>`;
          const blob = new Blob([svgContent], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `sword-master-badge.svg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success(`Downloaded "Sword Master" Badge! 🏆`);
        }}
        className="relative group cursor-pointer flex flex-col items-center p-1"
      >
        <svg width="76" height="86" viewBox="0 0 74 84" fill="none" className="drop-shadow-md group-hover:scale-110 transition-transform duration-300">
          <path d="M 37 4 L 68 21 L 68 63 L 37 80 L 6 63 L 6 21 Z" fill="#b45309" />
          <path d="M 37 8 L 64 23 L 64 61 L 37 76 L 10 61 L 10 23 Z" fill="#d97706" />
          <path d="M 37 12 L 60 25 L 60 59 L 37 72 L 14 59 L 14 25 Z" fill="#0f172a" />
          <path d="M 37 15 L 57 26 L 57 58 L 37 69 L 17 58 L 17 26 Z" fill="#1e293b" />
          <path d="M 37 20 L 40 38 L 40 50 L 37 54 L 34 50 L 34 38 Z" fill="#e2e8f0" />
          <path d="M 37 18 L 41 24 L 37 54 L 33 24 Z" fill="#ffffff" />
          <path d="M 28 42 H 46 V 45 H 28 Z" fill="#cbd5e1" />
          <path d="M 35 54 H 39 V 60 H 35 Z" fill="#94a3b8" />
          <path d="M 24 50 L 28 38 L 37 45 L 46 38 L 50 50 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
          <circle cx="28" cy="38" r="2" fill="#ef4444" />
          <circle cx="37" cy="45" r="2.5" fill="#3b82f6" />
          <circle cx="46" cy="38" r="2" fill="#ef4444" />
        </svg>
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 text-white text-[9px] font-black gap-1 p-1 shadow-lg">
          <Download size={13} className="text-amber-400" />
          <span>Download</span>
        </div>
      </div>
    )
  },
  {
    title: 'Potion Alchemist',
    node: (
      <div
        onClick={() => {
          const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 74 84"><rect width="100%" height="100%" fill="#090a0f" rx="20"/><path d="M 37 4 L 68 21 L 68 63 L 37 80 L 6 63 L 6 21 Z" fill="#0369a1" /><path d="M 37 8 L 64 23 L 64 61 L 37 76 L 10 61 L 10 23 Z" fill="#0284c7" /><path d="M 37 12 L 60 25 L 60 59 L 37 72 L 14 59 L 14 25 Z" fill="#0f172a" /><text x="37" y="44" font-family="sans-serif" font-size="7" font-weight="900" fill="#22d3ee" text-anchor="middle" letter-spacing="1">ARCADE BADGE</text><text x="37" y="54" font-family="serif" font-size="6" font-weight="bold" fill="#ffffff" text-anchor="middle">Potion Alchemist</text></svg>`;
          const blob = new Blob([svgContent], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `potion-alchemist-badge.svg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success(`Downloaded "Potion Alchemist" Badge! 🏆`);
        }}
        className="relative group cursor-pointer flex flex-col items-center p-1"
      >
        <svg width="76" height="86" viewBox="0 0 74 84" fill="none" className="drop-shadow-md group-hover:scale-110 transition-transform duration-300">
          <path d="M 37 4 L 68 21 L 68 63 L 37 80 L 6 63 L 6 21 Z" fill="#0369a1" />
          <path d="M 37 8 L 64 23 L 64 61 L 37 76 L 10 61 L 10 23 Z" fill="#0284c7" />
          <path d="M 37 12 L 60 25 L 60 59 L 37 72 L 14 59 L 14 25 Z" fill="#0f172a" />
          <path d="M 37 15 L 57 26 L 57 58 L 37 69 L 17 58 L 17 26 Z" fill="#0c4a6e" />
          <path d="M 33 24 H 41 V 32 L 49 48 C 51 52 48 57 43 57 H 31 C 26 57 23 52 25 48 L 33 32 Z" fill="#22d3ee" opacity="0.9" />
          <path d="M 31 22 H 43 V 25 H 31 Z" fill="#e0f2fe" />
          <path d="M 35 44 H 39 M 37 42 V 46" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 text-white text-[9px] font-black gap-1 p-1 shadow-lg">
          <Download size={13} className="text-cyan-400" />
          <span>Download</span>
        </div>
      </div>
    )
  },
  {
    title: 'Summit Scaler',
    node: (
      <div
        onClick={() => {
          const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 74 84"><rect width="100%" height="100%" fill="#090a0f" rx="20"/><path d="M 37 4 L 68 21 L 68 63 L 37 80 L 6 63 L 6 21 Z" fill="#475569" /><path d="M 37 8 L 64 23 L 64 61 L 37 76 L 10 61 L 10 23 Z" fill="#94a3b8" /><path d="M 37 12 L 60 25 L 60 59 L 37 72 L 14 59 L 14 25 Z" fill="#0f172a" /><text x="37" y="44" font-family="sans-serif" font-size="7" font-weight="900" fill="#38bdf8" text-anchor="middle" letter-spacing="1">ARCADE BADGE</text><text x="37" y="54" font-family="serif" font-size="6" font-weight="bold" fill="#ffffff" text-anchor="middle">Summit Scaler</text></svg>`;
          const blob = new Blob([svgContent], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `summit-scaler-badge.svg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success(`Downloaded "Summit Scaler" Badge! 🏆`);
        }}
        className="relative group cursor-pointer flex flex-col items-center p-1"
      >
        <svg width="76" height="86" viewBox="0 0 74 84" fill="none" className="drop-shadow-md group-hover:scale-110 transition-transform duration-300">
          <path d="M 37 4 L 68 21 L 68 63 L 37 80 L 6 63 L 6 21 Z" fill="#475569" />
          <path d="M 37 8 L 64 23 L 64 61 L 37 76 L 10 61 L 10 23 Z" fill="#94a3b8" />
          <path d="M 37 12 L 60 25 L 60 59 L 37 72 L 14 59 L 14 25 Z" fill="#0f172a" />
          <path d="M 37 15 L 57 26 L 57 58 L 37 69 L 17 58 L 17 26 Z" fill="#1e293b" />
          <path d="M 18 56 L 37 28 L 56 56 Z" fill="#0284c7" />
          <path d="M 37 28 L 56 56 H 37 Z" fill="#0369a1" />
          <path d="M 37 28 L 30 38 L 37 34 L 44 38 Z" fill="#ffffff" />
          <path d="M 31 26 L 33 20 L 37 23 L 41 20 L 43 26 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
        </svg>
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 text-white text-[9px] font-black gap-1 p-1 shadow-lg">
          <Download size={13} className="text-sky-400" />
          <span>Download</span>
        </div>
      </div>
    )
  },
  {
    title: 'Botanist Master',
    node: (
      <div
        onClick={() => {
          const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 74 84"><rect width="100%" height="100%" fill="#090a0f" rx="20"/><path d="M 37 4 L 68 21 L 68 63 L 37 80 L 6 63 L 6 21 Z" fill="#047857" /><path d="M 37 8 L 64 23 L 64 61 L 37 76 L 10 61 L 10 23 Z" fill="#10b981" /><path d="M 37 12 L 60 25 L 60 59 L 37 72 L 14 59 L 14 25 Z" fill="#064e3b" /><text x="37" y="44" font-family="sans-serif" font-size="7" font-weight="900" fill="#34d399" text-anchor="middle" letter-spacing="1">ARCADE BADGE</text><text x="37" y="54" font-family="serif" font-size="6" font-weight="bold" fill="#ffffff" text-anchor="middle">Botanist Master</text></svg>`;
          const blob = new Blob([svgContent], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `botanist-master-badge.svg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success(`Downloaded "Botanist Master" Badge! 🏆`);
        }}
        className="relative group cursor-pointer flex flex-col items-center p-1"
      >
        <svg width="76" height="86" viewBox="0 0 74 84" fill="none" className="drop-shadow-md group-hover:scale-110 transition-transform duration-300">
          <path d="M 37 4 L 68 21 L 68 63 L 37 80 L 6 63 L 6 21 Z" fill="#047857" />
          <path d="M 37 8 L 64 23 L 64 61 L 37 76 L 10 61 L 10 23 Z" fill="#10b981" />
          <path d="M 37 12 L 60 25 L 60 59 L 37 72 L 14 59 L 14 25 Z" fill="#064e3b" />
          <path d="M 37 15 L 57 26 L 57 58 L 37 69 L 17 58 L 17 26 Z" fill="#022c22" />
          <circle cx="37" cy="34" r="8" fill="#34d399" />
          <circle cx="29" cy="46" r="8" fill="#34d399" />
          <circle cx="45" cy="46" r="8" fill="#34d399" />
          <circle cx="37" cy="42" r="5" fill="#a7f3d0" />
          <path d="M 37 44 V 56" stroke="#a7f3d0" strokeWidth="3" strokeLinecap="round" />
          <path d="M 34 48 H 40 M 37 45 V 51" stroke="#064e3b" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 text-white text-[9px] font-black gap-1 p-1 shadow-lg">
          <Download size={13} className="text-emerald-400" />
          <span>Download</span>
        </div>
      </div>
    )
  },
  {
    title: 'Skull Boss',
    node: (
      <div
        onClick={() => {
          const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 74 84"><rect width="100%" height="100%" fill="#090a0f" rx="20"/><path d="M 37 4 L 68 21 L 68 63 L 37 80 L 6 63 L 6 21 Z" fill="#b45309" /><path d="M 37 8 L 64 23 L 64 61 L 37 76 L 10 61 L 10 23 Z" fill="#f59e0b" /><path d="M 37 12 L 60 25 L 60 59 L 37 72 L 14 59 L 14 25 Z" fill="#18181b" /><text x="37" y="44" font-family="sans-serif" font-size="7" font-weight="900" fill="#ef4444" text-anchor="middle" letter-spacing="1">ARCADE BADGE</text><text x="37" y="54" font-family="serif" font-size="6" font-weight="bold" fill="#ffffff" text-anchor="middle">Skull Boss</text></svg>`;
          const blob = new Blob([svgContent], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `skull-boss-badge.svg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success(`Downloaded "Skull Boss" Badge! 🏆`);
        }}
        className="relative group cursor-pointer flex flex-col items-center p-1"
      >
        <svg width="76" height="86" viewBox="0 0 74 84" fill="none" className="drop-shadow-md group-hover:scale-110 transition-transform duration-300">
          <path d="M 37 4 L 68 21 L 68 63 L 37 80 L 6 63 L 6 21 Z" fill="#b45309" />
          <path d="M 37 8 L 64 23 L 64 61 L 37 76 L 10 61 L 10 23 Z" fill="#f59e0b" />
          <path d="M 37 12 L 60 25 L 60 59 L 37 72 L 14 59 L 14 25 Z" fill="#18181b" />
          <path d="M 37 15 L 57 26 L 57 58 L 37 69 L 17 58 L 17 26 Z" fill="#27272a" />
          <path d="M 22 28 L 52 56 M 52 28 L 22 56" stroke="#ef4444" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 22 28 L 52 56 M 52 28 L 22 56" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" />
          <circle cx="37" cy="38" r="11" fill="#f8fafc" />
          <path d="M 32 46 H 42 V 51 C 42 52 40 53 37 53 C 34 53 32 52 32 51 Z" fill="#f8fafc" />
          <circle cx="33" cy="38" r="3" fill="#0f172a" />
          <circle cx="41" cy="38" r="3" fill="#0f172a" />
          <path d="M 37 42 L 35.5 45 H 38.5 Z" fill="#0f172a" />
        </svg>
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 text-white text-[9px] font-black gap-1 p-1 shadow-lg">
          <Download size={13} className="text-amber-400" />
          <span>Download</span>
        </div>
      </div>
    )
  }
];

// ─── Image 3 Custom Professional Vector Line Icons ────────────────────────────
const MedalIcon = ({ className = "w-7 h-7 text-purple-600" }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className}>
    <path d="M 14 4 L 20 18 L 22 18 L 16 4 Z" fill="currentColor" opacity="0.3" />
    <path d="M 26 4 L 20 18 L 18 18 L 24 4 Z" fill="currentColor" opacity="0.3" />
    <path d="M 12 4 L 18 18 M 28 4 L 22 18 M 20 4 L 20 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="20" cy="27" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="20" cy="27" r="8" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" fill="none" />
    <path d="M 18.5 25 L 20 23.5 V 30.5 H 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrophyIcon = ({ className = "w-7 h-7 text-emerald-500" }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className}>
    <path d="M 11 8 H 29 V 18 C 29 23 25 26 20 26 C 15 26 11 23 11 18 V 8 Z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" />
    <path d="M 11 11 H 7 C 5.5 11 4.5 12.5 4.5 14 C 4.5 17.5 7 19.5 11 19.5" stroke="currentColor" strokeWidth="1.8" fill="none" />
    <path d="M 29 11 H 33 C 34.5 11 35.5 12.5 35.5 14 C 35.5 17.5 33 19.5 29 19.5" stroke="currentColor" strokeWidth="1.8" fill="none" />
    <path d="M 20 26 V 32 M 13 35 H 27 M 15 32 H 25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CertificateIcon = ({ className = "w-7 h-7 text-amber-500" }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className}>
    <rect x="6" y="8" width="22" height="24" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
    <line x1="10" y1="13" x2="22" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="10" y1="17" x2="19" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="10" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="28" cy="24" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M 25 29 L 23 35 L 27 33 L 29 35 L 28 29" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
  </svg>
);

const GradCapIcon = ({ className = "w-7 h-7 text-blue-500" }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className}>
    <path d="M 20 8 L 36 15 L 20 22 L 4 15 Z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" />
    <path d="M 10 18.5 V 26 C 10 29.5 14.5 32 20 32 C 25.5 32 30 29.5 30 26 V 18.5" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M 9 17.5 V 27 M 7.5 27 C 7.5 28.5 10.5 28.5 10.5 27 Z" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const TargetIcon = ({ className = "w-7 h-7 text-pink-500" }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className}>
    <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="20" cy="20" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <circle cx="20" cy="20" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
    <line x1="20" y1="3" x2="20" y2="37" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
    <line x1="3" y1="20" x2="37" y2="20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
  </svg>
);

const FlagIcon = ({ className = "w-7 h-7 text-cyan-500" }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className}>
    <line x1="10" y1="6" x2="10" y2="34" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M 10 8 C 17 5 23 13 32 9 V 23 C 23 27 17 19 10 22 Z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" />
  </svg>
);

const APlusIcon = ({ className = "w-7 h-7 text-rose-500" }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className}>
    <path d="M 9 32 L 17 8 L 25 32 M 11.5 24 H 22.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 29 14 H 35 M 32 11 V 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

// ─── Image 2 Partner Universities & Companies ────────────────────────────────
const partnerLogos: LogoItem[] = [
  {
    title: 'Illinois',
    node: (
      <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white tracking-wider text-sm px-2">
        <span className="text-orange-600 text-xl font-black font-serif">I</span>
        <span className="font-extrabold tracking-widest text-xs text-slate-800 dark:text-zinc-200">ILLINOIS</span>
      </div>
    )
  },
  {
    title: 'Duke University',
    node: (
      <div className="flex items-center gap-1.5 px-2">
        <span className="text-indigo-900 dark:text-indigo-400 font-serif font-black text-xl italic">Duke</span>
        <span className="text-[10px] font-bold text-indigo-950 dark:text-zinc-300 uppercase tracking-widest">UNIVERSITY</span>
      </div>
    )
  },
  {
    title: 'Google',
    node: (
      <div className="flex items-center px-2">
        <span className="text-xl font-black tracking-tighter">
          <span className="text-blue-500">G</span>
          <span className="text-red-500">o</span>
          <span className="text-yellow-500">o</span>
          <span className="text-blue-500">g</span>
          <span className="text-green-500">l</span>
          <span className="text-red-500">e</span>
        </span>
      </div>
    )
  },
  {
    title: 'University of Michigan',
    node: (
      <div className="flex items-center gap-2 px-2">
        <div className="w-7 h-7 rounded-lg bg-blue-950 text-amber-400 font-black flex items-center justify-center text-sm shadow-xs border border-amber-400/40">
          M
        </div>
        <div className="text-[9px] font-black text-slate-800 dark:text-zinc-200 leading-none">
          UNIVERSITY OF<br />MICHIGAN
        </div>
      </div>
    )
  },
  {
    title: 'IBM',
    node: (
      <div className="flex items-center px-2">
        <span className="text-xl font-black tracking-widest text-blue-600 dark:text-blue-400 font-mono">
          I≡B≡M
        </span>
      </div>
    )
  },
  {
    title: 'Vanderbilt University',
    node: (
      <div className="flex items-center gap-1.5 px-2">
        <span className="text-amber-600 font-serif text-xl font-black">V</span>
        <span className="text-[10px] font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider">VANDERBILT UNIVERSITY</span>
      </div>
    )
  },
  {
    title: 'Johns Hopkins',
    node: (
      <div className="flex items-center gap-2 px-2">
        <div className="w-6 h-6 rounded bg-blue-700 text-white font-bold text-[10px] flex items-center justify-center">
          JHU
        </div>
        <span className="text-xs font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">JOHNS HOPKINS</span>
      </div>
    )
  }
];

const certificatesData: CertificateItem[] = [
  {
    id: 'c1',
    title: 'Introduction to Web Development',
    issueDate: 'May 12, 2025',
    courseName: 'Web Development Basics',
    orgName: 'Arcade Academy',
    orgIcon: '⚡',
    thumbnailColor: 'from-indigo-600 via-purple-600 to-pink-500',
    credentialId: 'ARC-2025-WEB-001',
    imageUrl: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'c2',
    title: 'Python for Beginners',
    issueDate: 'Jun 5, 2025',
    courseName: 'Python Fundamentals',
    orgName: 'Arcade Academy',
    orgIcon: '🐍',
    thumbnailColor: 'from-amber-500 via-orange-500 to-red-500',
    credentialId: 'ARC-2025-PYT-004',
    imageUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'c3',
    title: 'Data Structures Essentials',
    issueDate: 'Jun 15, 2025',
    courseName: 'Data Structures & Algorithms',
    orgName: 'Arcade Academy',
    orgIcon: '📊',
    thumbnailColor: 'from-blue-600 via-cyan-500 to-teal-400',
    credentialId: 'ARC-2025-DS-012',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'c4',
    title: 'Advanced React & Next.js Architecture',
    issueDate: 'Jul 1, 2025',
    courseName: 'Modern Frontend Architecture',
    orgName: 'Frontend Masters',
    orgIcon: '⚛️',
    thumbnailColor: 'from-sky-500 via-indigo-600 to-purple-600',
    credentialId: 'ARC-2025-RCT-089',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'c5',
    title: 'Cloud Infrastructure & DevOps',
    issueDate: 'Jul 18, 2025',
    courseName: 'AWS & Docker Orchestration',
    orgName: 'AWS Academy',
    orgIcon: '☁️',
    thumbnailColor: 'from-orange-500 via-amber-500 to-yellow-500',
    credentialId: 'ARC-2025-AWS-104',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'c6',
    title: 'UI/UX Design System Tokens',
    issueDate: 'Aug 4, 2025',
    courseName: 'Enterprise Design Systems',
    orgName: 'Design Guild',
    orgIcon: '🎨',
    thumbnailColor: 'from-pink-500 via-rose-500 to-red-400',
    credentialId: 'ARC-2025-DES-210',
    imageUrl: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'c7',
    title: 'Full Stack Web Engineering',
    issueDate: 'Sep 10, 2025',
    courseName: 'MERN Stack Production Apps',
    orgName: 'Arcade Academy',
    orgIcon: '💻',
    thumbnailColor: 'from-emerald-500 via-teal-600 to-cyan-600',
    credentialId: 'ARC-2025-FS-305',
    imageUrl: 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'c8',
    title: 'Machine Learning Foundations',
    issueDate: 'Oct 2, 2025',
    courseName: 'Applied Neural Networks',
    orgName: 'AI Institute',
    orgIcon: '🤖',
    thumbnailColor: 'from-purple-600 via-indigo-700 to-blue-600',
    credentialId: 'ARC-2025-AI-412',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'c9',
    title: 'Mobile App Dev with Flutter',
    issueDate: 'Oct 20, 2025',
    courseName: 'Cross-Platform Mobile Apps',
    orgName: 'Mobile Guild',
    orgIcon: '📱',
    thumbnailColor: 'from-blue-500 via-indigo-600 to-purple-500',
    credentialId: 'ARC-2025-MOB-501',
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'c10',
    title: 'Cybersecurity & Ethical Hacking',
    issueDate: 'Nov 8, 2025',
    courseName: 'Network Security & Auditing',
    orgName: 'Security Hub',
    orgIcon: '🛡️',
    thumbnailColor: 'from-rose-600 via-red-600 to-amber-500',
    credentialId: 'ARC-2025-SEC-602',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'c11',
    title: 'GraphQL & Microservices',
    issueDate: 'Nov 25, 2025',
    courseName: 'High-Scale API Design',
    orgName: 'API Academy',
    orgIcon: '🚀',
    thumbnailColor: 'from-pink-600 via-purple-600 to-indigo-600',
    credentialId: 'ARC-2025-GQL-710',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'c12',
    title: 'TypeScript Design Patterns',
    issueDate: 'Dec 4, 2025',
    courseName: 'Type-Safe Software Architecture',
    orgName: 'Arcade Academy',
    orgIcon: '📘',
    thumbnailColor: 'from-blue-600 via-sky-600 to-teal-500',
    credentialId: 'ARC-2025-TS-815',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'c13',
    title: 'System Design & Scalability',
    issueDate: 'Jan 12, 2026',
    courseName: 'Distributed Systems & Caching',
    orgName: 'Tech Lead Guild',
    orgIcon: '⚙️',
    thumbnailColor: 'from-slate-700 via-slate-800 to-zinc-900',
    credentialId: 'ARC-2026-SYS-901',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'c14',
    title: 'Data Science & DataPipelines',
    issueDate: 'Feb 2, 2026',
    courseName: 'Big Data Processing & Pandas',
    orgName: 'Data Academy',
    orgIcon: '📈',
    thumbnailColor: 'from-emerald-600 via-teal-600 to-blue-600',
    credentialId: 'ARC-2026-DS-940',
    imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'c15',
    title: 'Generative AI & Prompt Engineering',
    issueDate: 'Mar 1, 2026',
    courseName: 'LLM Integration & Agents',
    orgName: 'AI Institute',
    orgIcon: '✨',
    thumbnailColor: 'from-violet-600 via-purple-600 to-fuchsia-600',
    credentialId: 'ARC-2026-GEN-999',
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop',
  },
];

const recentData: RecentItem[] = [
  {
    id: 'r1',
    name: 'First Course Completed',
    description: 'Completed your first course. Great start!',
    date: 'May 12, 2025',
    icon: Star,
    color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60',
  },
  {
    id: 'r2',
    name: '7-Day Streak',
    description: "You've maintained a 7-day learning streak.",
    date: 'May 20, 2025',
    icon: Calendar,
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60',
  },
  {
    id: 'r3',
    name: 'Top Performer',
    description: 'Scored above 90% in a quiz.',
    date: 'Jun 2, 2025',
    icon: Trophy,
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60',
  },
  {
    id: 'r4',
    name: '5 Courses Completed',
    description: 'Completed 5 courses. Keep it up!',
    date: 'Jun 10, 2025',
    icon: GraduationCap,
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/60',
  },
  {
    id: 'r5',
    name: 'Active Learner',
    description: 'Logged in and learned consistently.',
    date: 'Jun 18, 2025',
    icon: UserCheck,
    color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/60',
  },
];

const journeySteps = [
  { level: 'Beginner', text: 'Start your learning', status: 'completed', icon: '🌱' },
  { level: 'Explorer', text: 'Complete 3 courses', status: 'completed', icon: '⭐' },
  { level: 'Adventurer', text: 'Complete 10 courses', status: 'current', icon: '🌌' },
  { level: 'Scholar', text: 'Complete 20 courses', status: 'locked', icon: '🎓' },
  { level: 'Master', text: 'Complete 30 courses', status: 'locked', icon: '🏆' },
];

const goalsData: GoalItem[] = [
  {
    id: 'g1',
    title: 'Complete 20 Courses',
    current: 15,
    total: 20,
    percentage: 75,
    icon: GraduationCap,
    color: 'from-[#2962D6] via-[#2C83F5] to-[#27C5D8]',
  },
  {
    id: 'g2',
    title: 'Maintain 30-Day Streak',
    current: 22,
    total: 30,
    percentage: 73,
    icon: Calendar,
    color: 'from-emerald-500 to-teal-400',
  },
  {
    id: 'g3',
    title: 'Score 95% in a Quiz',
    current: 2,
    total: 3,
    percentage: 67,
    icon: Trophy,
    color: 'from-amber-500 to-orange-400',
  },
  {
    id: 'g4',
    title: 'Earn 10 Badges',
    current: 5,
    total: 10,
    percentage: 50,
    icon: Sparkles,
    color: 'from-purple-500 via-pink-500 to-rose-400',
  },
];

export default function AchievementsVarietyPage() {
  const { user } = useAuthStore();
  const [selectedBadgeCategory, setSelectedBadgeCategory] = useState<string>('All');
  const [certSearchQuery, setCertSearchQuery] = useState<string>('');
  const [certPage, setCertPage] = useState<number>(1);
  const [selectedCertModal, setSelectedCertModal] = useState<CertificateItem | null>(null);

  const handleDownloadCert = (title: string) => {
    toast.success(`Downloading official certificate PDF for "${title}"`);
  };

  const handleViewCert = (cert: CertificateItem) => {
    toast.info(`Viewing credential details for "${cert.title}" (${cert.credentialId})`);
  };

  const handleShareCert = (title: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success(`Share link for "${title}" copied to clipboard!`);
    } else {
      toast.success(`Sharing certificate: ${title}`);
    }
  };

  const handleDownloadBadge = (title: string) => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 74 84"><rect width="100%" height="100%" fill="#090a0f" rx="20"/><path d="M 37 4 L 68 21 L 68 63 L 37 80 L 6 63 L 6 21 Z" fill="#2962D6" /><path d="M 37 8 L 64 23 L 64 61 L 37 76 L 10 61 L 10 23 Z" fill="#2C83F5" /><path d="M 37 12 L 60 25 L 60 59 L 37 72 L 14 59 L 14 25 Z" fill="#0f172a" /><text x="37" y="44" font-family="sans-serif" font-size="7" font-weight="900" fill="#27C5D8" text-anchor="middle" letter-spacing="1">ARCADE BADGE</text><text x="37" y="54" font-family="serif" font-size="6" font-weight="bold" fill="#ffffff" text-anchor="middle">${title}</text></svg>`;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-badge.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded "${title}" Badge! 🏆`);
  };

  const filteredBadges = selectedBadgeCategory === 'All'
    ? badgesData
    : badgesData.filter(b => b.category === selectedBadgeCategory);

  const filteredCerts = certificatesData.filter(c =>
    c.title.toLowerCase().includes(certSearchQuery.toLowerCase()) ||
    c.courseName.toLowerCase().includes(certSearchQuery.toLowerCase()) ||
    c.orgName.toLowerCase().includes(certSearchQuery.toLowerCase())
  );

  const badgesCount = badgesData.length;
  const certsCount = certificatesData.length;
  const totalAchievements = badgesCount + certsCount;
  const totalXp = badgesCount * 100 + certsCount * 250;

  const itemsPerPage = 4;
  const totalCertPages = Math.max(1, Math.ceil(filteredCerts.length / itemsPerPage));
  const paginatedCerts = filteredCerts.slice((certPage - 1) * itemsPerPage, certPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white pt-24 pb-36 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ─── HERO HEADER & MILESTONE STAT PODIUM (CENTER ALIGNED, CARDLESS) ─── */}
        <div className="pt-6 sm:pt-10 pb-4 space-y-8">
          {/* Header Title & Subtitle (Center Aligned) */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none flex items-center justify-center gap-3">
              <span className="text-slate-900 dark:text-white">My</span>
              <span className="bg-gradient-to-r from-[#2962D6] via-[#2C83F5] to-[#27C5D8] bg-clip-text text-transparent">
                Achievements
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 font-medium leading-relaxed">
              Track your learning milestones and accomplishments — celebrate every step of your growth as you master new skills! 🚀
            </p>
          </div>

          {/* Stat Pods Grid — 3 equal pods matching design spec */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">

            {/* Pod 1: Badges Collected */}
            <div
              onClick={() => toast.info(`${badgesCount} Badges Collected`)}
              className="group bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 hover:border-emerald-400/60 dark:hover:border-emerald-500/60 rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer select-none"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">{badgesCount}</div>
                <div className="text-sm font-bold text-slate-700 dark:text-zinc-300 mt-0.5">Badges</div>
                <div className="text-xs font-medium text-slate-400 dark:text-zinc-500">Collected</div>
              </div>
            </div>

            {/* Pod 2: Achievements Earned */}
            <div
              onClick={() => toast.info(`${totalAchievements} Achievements Earned`)}
              className="group bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 hover:border-violet-400/60 dark:hover:border-violet-500/60 rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer select-none"
            >
              <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-950/50 border border-violet-200/80 dark:border-violet-800/80 text-violet-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
                <Medal className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">{totalAchievements}</div>
                <div className="text-sm font-bold text-slate-700 dark:text-zinc-300 mt-0.5">Achievements</div>
                <div className="text-xs font-medium text-slate-400 dark:text-zinc-500">Earned</div>
              </div>
            </div>

            {/* Pod 3: Certificates Verified */}
            <div
              onClick={() => toast.info(`${certsCount} Certificates Verified`)}
              className="group bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 hover:border-amber-400/60 dark:hover:border-amber-500/60 rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer select-none"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/80 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">{certsCount}</div>
                <div className="text-sm font-bold text-slate-700 dark:text-zinc-300 mt-0.5">Certificates</div>
                <div className="text-xs font-medium text-slate-400 dark:text-zinc-500">Verified</div>
              </div>
            </div>

          </div>
        </div>



        {/* ─── SECTION 3: CERTIFICATES GALLERY (EXACT USER SCREENSHOT REPLICA) ─── */}
        <div className="space-y-6">
          {/* Header Row: Clean Floating Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
            <div>
              <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                CERTIFICATES EARNED
              </h2>
              <div className="h-0.5 w-8 bg-gradient-to-r from-[#2962D6] to-[#27C5D8] rounded-full mt-1" />
            </div>

            {/* Right Search Input (Extended Length) */}
            <div className="relative w-full sm:w-80 md:w-[480px] lg:w-[560px]">
              <input
                type="text"
                placeholder="Search certificates..."
                value={certSearchQuery}
                onChange={(e) => setCertSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 text-xs sm:text-sm bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2C83F5]/40 shadow-xs transition-all duration-300"
              />
              <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Responsive Horizontal Cards Grid Layout (4 Cards per Page in a Desktop Row) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {paginatedCerts.map((cert) => {
              const emblemBg = cert.id === 'c1' || cert.id === 'c11'
              return (
                <div
                  key={cert.id}
                  className="bg-white dark:bg-zinc-900 rounded-[20px] border border-slate-100 dark:border-zinc-800/80 p-3.5 shadow-xs hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden"
                >
                  {/* Top Miniature Certificate Document Display Banner */}
                  <div
                    onClick={() => setSelectedCertModal(cert)}
                    className="w-full h-32 rounded-xl relative overflow-hidden group/img cursor-pointer bg-[#fcfaf7] dark:bg-[#121316] border-2 border-amber-400/60 dark:border-amber-500/40 p-2.5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300 select-none"
                  >
                    {/* Ornate Gold Frame Corner Brackets */}
                    <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-500/80 pointer-events-none" />
                    <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-500/80 pointer-events-none" />
                    <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-500/80 pointer-events-none" />
                    <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-500/80 pointer-events-none" />

                    {/* Top Certificate Header Bar */}
                    <div className="flex items-center justify-between z-10">
                      <span className="text-[8px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 truncate">
                        {cert.orgName}
                      </span>
                    </div>

                    {/* Certificate Title & Recipient Body Content */}
                    <div className="text-center my-auto px-1 z-10 space-y-0.5">
                      <p className="text-[6.5px] font-black tracking-widest text-amber-600/80 dark:text-amber-400/80 uppercase">
                        CERTIFICATE OF COMPLETION
                      </p>
                      <h4 className="text-[11px] font-black font-serif text-slate-900 dark:text-amber-100 leading-tight line-clamp-1">
                        {cert.title}
                      </h4>
                      <p className="text-[7px] font-medium text-slate-500 dark:text-zinc-400 italic">
                        Presented to <span className="font-bold text-slate-800 dark:text-zinc-200">{user?.fullName || 'Alex Rivera'}</span>
                      </p>
                    </div>

                    {/* Bottom Row: Signature & Gold Medal Seal */}
                    <div className="flex items-end justify-between pt-1 border-t border-amber-300/40 dark:border-zinc-800/80 z-10">
                      <div className="flex items-center gap-1 text-[6.5px] font-mono text-slate-400 dark:text-zinc-500">
                        <span>OFFICIAL CREDENTIAL</span>
                        <span className="italic font-serif text-[7.5px] text-slate-600 dark:text-zinc-400">Signature</span>
                      </div>

                      {/* Gold Foil Medal Emblem */}
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold text-[9px] shadow-xs border border-amber-200 shrink-0">
                        ★
                      </div>
                    </div>

                    {/* Hover Prompt Overlay */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1.5px] flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity z-20">
                      <div className="bg-white/95 dark:bg-zinc-900/95 text-slate-900 dark:text-white px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg border border-amber-400/50">
                        <Eye size={13} className="text-amber-500" /> View Full Certificate
                      </div>
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div className="my-2.5 space-y-0.5">
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-tight min-h-[32px] flex items-center line-clamp-2">
                      {cert.title}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 truncate">
                      {cert.orgName}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-zinc-400 font-medium">
                      <Calendar size={11} className="text-slate-400" />
                      <span>{cert.issueDate}</span>
                    </div>
                  </div>

                  {/* Bottom Action Row */}
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                    <button
                      title="Preview Certificate"
                      onClick={() => setSelectedCertModal(cert)}
                      className="text-[11px] font-extrabold text-[#2962D6] dark:text-[#27C5D8] hover:opacity-80 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Eye size={12} className="text-[#2962D6] dark:text-[#27C5D8]" /> Preview
                    </button>
                    <div className="flex items-center gap-1.5">
                      <button
                        title="Share Certificate"
                        onClick={() => handleShareCert(cert.title)}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center shadow-2xs cursor-pointer"
                      >
                        <Share2 size={12} />
                      </button>
                      <button
                        title="Download Certificate"
                        onClick={() => handleDownloadCert(cert.title)}
                        className="w-7 h-7 rounded-lg bg-gradient-to-r from-[#2962D6] via-[#2C83F5] to-[#27C5D8] hover:opacity-90 text-white transition-all flex items-center justify-center shadow-xs cursor-pointer"
                      >
                        <Download size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Pagination Bar Placed on the Right Side (< 1 2 3 >) */}
          <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2 select-none">
              {/* Left Arrow Button */}
              <button
                disabled={certPage === 1}
                onClick={() => setCertPage((prev) => Math.max(prev - 1, 1))}
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-slate-400 hover:text-[#2962D6] hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                &lt;
              </button>

              {/* Page Number Buttons */}
              {Array.from({ length: totalCertPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCertPage(pageNum)}
                  className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center transition-all cursor-pointer ${certPage === pageNum
                    ? 'bg-gradient-to-r from-[#2962D6] via-[#2C83F5] to-[#27C5D8] text-white shadow-md shadow-[#2C83F5]/30 scale-105'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  {pageNum}
                </button>
              ))}

              {/* Right Arrow Button */}
              <button
                disabled={certPage === totalCertPages}
                onClick={() => setCertPage((prev) => Math.min(prev + 1, totalCertPages))}
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-slate-400 hover:text-[#2962D6] hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>

        {/* ─── FULL-WIDTH BORDERLESS BADGES SECTION (DIRECTLY BELOW CERTIFICATES EARNED) ─── */}
        <div className="space-y-4 py-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                BADGES COLLECTED
              </h2>
              <div className="h-0.5 w-8 bg-gradient-to-r from-[#2962D6] to-[#27C5D8] rounded-full mt-1" />
            </div>
          </div>

          {/* Cardless Full-Width LogoLoop Marquee */}
          <div className="py-2 overflow-hidden relative">
            <LogoLoop
              logos={arcadeBadgeItems}
              speed={70}
              direction="left"
              logoHeight={86}
              gap={64}
              hoverSpeed={0}
              scaleOnHover={true}
              fadeOut={true}
              ariaLabel="Badges collection loop"
            />
          </div>
        </div>

        {/* ─── SECTION 4: LEARNING JOURNEY & PROGRESS GOALS ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-8">


            {/* BLOCK 2: YOUR LEARNING JOURNEY ROADMAP - COLORFUL MATCHING THEME */}
            <div className="bg-gradient-to-br from-slate-50 via-indigo-50/50 to-purple-50/60 dark:from-zinc-900 dark:via-indigo-950/30 dark:to-purple-950/20 p-6 sm:p-8 rounded-[28px] border border-indigo-100 dark:border-zinc-800 shadow-sm relative overflow-hidden space-y-4">
              {/* Title Header */}
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Your Learning Journey</h2>
                <p className="text-xs text-indigo-600/80 dark:text-indigo-400 font-semibold mt-0.5">Level 3 of 5 Unlocked</p>
              </div>

              {/* Ascending Straight Roadmap Container */}
              <div className="relative w-full py-6 min-h-[220px] flex items-center justify-center">
                <div className="relative w-full h-[180px]">

                  {/* SVG Ascending Straight Slope Line */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 180" preserveAspectRatio="none" fill="none">
                    <defs>
                      {/* Vibrant Multi-Color Active Line Gradient */}
                      <linearGradient id="journey-active-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#14b8a6" />
                        <stop offset="50%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>

                    {/* Full Ascending Dashed Line */}
                    <line
                      x1="80"
                      y1="140"
                      x2="900"
                      y2="20"
                      stroke="#cbd5e1"
                      className="dark:stroke-zinc-800"
                      strokeWidth="3.5"
                      strokeDasharray="8 6"
                      strokeLinecap="round"
                    />

                    {/* Active Progress Line (Beginner to Adventurer) */}
                    <line
                      x1="80"
                      y1="140"
                      x2="500"
                      y2="80"
                      stroke="url(#journey-active-line-grad)"
                      strokeWidth="4"
                      strokeDasharray="8 6"
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* NODE 1: BEGINNER (left: 8%, top: 140px) */}
                  <div className="absolute left-[8%] top-[140px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                    <div className="relative mb-1 flex flex-col items-center">
                      <div className="text-2xl select-none filter drop-shadow-xs">
                        🌱
                      </div>
                      <div className="w-3.5 h-3.5 rounded-full bg-teal-400 border-2 border-white dark:border-zinc-900 shadow-md" />
                    </div>
                    <div className="text-center mt-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Beginner</div>
                      <div className="text-[10px] text-teal-600 dark:text-teal-400 font-bold whitespace-nowrap">Start learning</div>
                    </div>
                  </div>

                  {/* NODE 2: EXPLORER (left: 28%, top: 110px) */}
                  <div className="absolute left-[28%] top-[110px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                    <div className="h-11 w-11 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-400 dark:border-emerald-600 flex items-center justify-center shadow-md">
                      <Star size={18} className="fill-emerald-500 text-emerald-500" />
                    </div>
                    <div className="text-center mt-1.5">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Explorer</div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">3 Courses</div>
                    </div>
                  </div>

                  {/* NODE 3: ADVENTURER - CURRENT ACTIVE LEVEL (left: 50%, top: 80px) */}
                  <div className="absolute left-[50%] top-[80px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
                    {/* Purple Flag Banner */}
                    <div className="relative -top-1">
                      <svg width="20" height="22" viewBox="0 0 20 24" fill="none">
                        <path d="M 4 2 L 4 22" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M 4 2 L 18 6 L 4 10 Z" fill="#6366f1" />
                      </svg>
                    </div>

                    {/* Active Halo & Emblem */}
                    <div className="relative flex items-center justify-center">
                      <div className="absolute h-16 w-16 rounded-full bg-indigo-500/25 dark:bg-indigo-500/40 animate-ping opacity-75" />
                      <div className="h-13 w-13 rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xl border-2 border-white dark:border-zinc-800 relative z-10">
                        <Star size={22} className="fill-white text-white drop-shadow-xs" />
                      </div>
                    </div>

                    <div className="text-center mt-1.5">
                      <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">Adventurer</div>
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-300 font-extrabold whitespace-nowrap">Current Level (10)</div>
                    </div>
                  </div>

                  {/* NODE 4: SCHOLAR - LOCKED (left: 72%, top: 50px) */}
                  <div className="absolute left-[72%] top-[50px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                    <div className="h-10 w-10 rounded-full bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-400 dark:text-zinc-500 shadow-sm">
                      <Lock size={15} />
                    </div>
                    <div className="text-center mt-1.5">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Scholar</div>
                      <div className="text-[10px] text-slate-400 dark:text-zinc-400 font-medium whitespace-nowrap">20 Courses</div>
                    </div>
                  </div>

                  {/* NODE 5: MASTER - LOCKED (left: 90%, top: 20px) */}
                  <div className="absolute left-[90%] top-[20px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                    <div className="h-10 w-10 rounded-full bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-400 dark:text-zinc-500 shadow-sm">
                      <Lock size={15} />
                    </div>
                    <div className="text-center mt-1.5">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Master</div>
                      <div className="text-[10px] text-slate-400 dark:text-zinc-400 font-medium whitespace-nowrap">30 Courses</div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Background Hills & Pine Trees Vector (Bottom Right Corner - Rich Palette) */}
              <div className="absolute bottom-0 right-0 pointer-events-none opacity-40 dark:opacity-20 flex items-end">
                <svg width="260" height="70" viewBox="0 0 240 65" fill="none">
                  {/* Rolling Hill */}
                  <path d="M 0 65 Q 80 30 240 50 L 240 65 Z" fill="#c7d2fe" />
                  {/* Pine Trees */}
                  <path d="M 140 65 L 148 40 L 156 65 Z" fill="#818cf8" />
                  <path d="M 170 65 L 180 30 L 190 65 Z" fill="#6366f1" />
                  <path d="M 205 65 L 213 38 L 221 65 Z" fill="#a5b4fc" />
                </svg>
              </div>
            </div>
          </div>

          {/* BLOCK 4: PROGRESS & GOALS (CREATIVE CARDLESS VARIETY DESIGN) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                  PROGRESS & GOALS
                </h2>
                <div className="h-0.5 w-8 bg-gradient-to-r from-[#2962D6] to-[#27C5D8] rounded-full mt-1" />
              </div>
              <button
                onClick={() => toast.info('Viewing all progress goals')}
                className="text-xs font-bold text-[#2962D6] dark:text-[#27C5D8] hover:underline flex items-center gap-1 transition-colors group cursor-pointer"
              >
                View all goals <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </button>
            </div>

            {/* Creative Cardless Progress Rows */}
            <div className="space-y-5 pt-2">
              {goalsData.map((goal) => {
                const GoalIcon = goal.icon;
                return (
                  <div
                    key={goal.id}
                    className="group space-y-2 py-1 transition-all duration-300 select-none"
                  >
                    {/* Top Row: Icon + Title + Ratio + Percentage */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 text-[#2962D6] dark:text-[#27C5D8] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-[#2962D6] group-hover:text-white transition-all duration-300 shadow-xs">
                          <GoalIcon size={17} />
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-[#2962D6] dark:group-hover:text-[#27C5D8] transition-colors">
                            {goal.title}
                          </span>
                          <div className="text-[11px] font-bold text-slate-400 dark:text-zinc-500">
                            {goal.current} of {goal.total} completed
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {goal.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Bottom Progress Bar with Glow Accent */}
                    <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800/80 rounded-full overflow-hidden p-0.5">
                      <div
                        className={`h-full bg-gradient-to-r ${goal.color} rounded-full transition-all duration-500 group-hover:brightness-110 shadow-xs`}
                        style={{ width: `${goal.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>



      </div>

      {/* ─── FULL-SCREEN CERTIFICATE PREVIEW MODAL ─── */}
      <AnimatePresence>
        {selectedCertModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedCertModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-950 border-4 border-amber-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-900 dark:text-white my-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedCertModal(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors z-20 cursor-pointer font-bold"
              >
                ✕
              </button>

              {/* Full Official Certificate Document Frame Preview */}
              <div className="relative border-4 border-amber-400/80 dark:border-amber-500/60 rounded-2xl p-6 sm:p-10 bg-[#faf8f5] dark:bg-[#121316] space-y-6 text-center shadow-inner select-none overflow-hidden">

                {/* Ornate Certificate Frame Corner Brackets */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-500/80 pointer-events-none" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-500/80 pointer-events-none" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-500/80 pointer-events-none" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-500/80 pointer-events-none" />

                {/* Top Header Row: Organization Name */}
                <div className="flex items-center justify-start border-b border-amber-300/40 dark:border-zinc-800 pb-3">
                  <div className="text-left">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                      {selectedCertModal.orgName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">OFFICIAL ACADEMIC CREDENTIAL</span>
                  </div>
                </div>

                {/* Certificate Heading */}
                <div className="space-y-1 py-1">
                  <span className="text-xs font-black tracking-[0.25em] text-amber-700 dark:text-amber-400 uppercase block">
                    CERTIFICATE OF COMPLETION
                  </span>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">THIS CERTIFIES THAT</p>
                </div>

                {/* Recipient Name */}
                <div className="py-1">
                  <h2 className="text-3xl sm:text-4xl font-black font-serif text-slate-900 dark:text-amber-100 tracking-wide underline decoration-amber-400/60 decoration-2 underline-offset-8">
                    {user?.fullName || 'Alex Rivera'}
                  </h2>
                </div>

                {/* Course Name & Statement */}
                <div className="space-y-2 max-w-lg mx-auto">
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                    has successfully completed all requirements, practical modules, and examinations for
                  </p>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {selectedCertModal.title}
                  </h3>
                  <p className="text-xs text-[#2962D6] dark:text-[#27C5D8] font-semibold pt-1">
                    Issued on {selectedCertModal.issueDate} by {selectedCertModal.orgName}
                  </p>
                </div>

                {/* Footer Signatures, Seal & Credential ID */}
                <div className="pt-6 border-t border-amber-300/40 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CREDENTIAL ID</p>
                    <p className="text-xs font-mono font-bold text-slate-800 dark:text-zinc-200">{selectedCertModal.credentialId}</p>
                  </div>

                  {/* Center Gold Foil Emblem */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold text-xl shadow-md border-2 border-amber-200 shrink-0">
                    ★
                  </div>

                  <div className="text-right">
                    <p className="font-serif italic text-base font-bold text-slate-800 dark:text-zinc-200">Arcade Academic Board</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Authorized Digital Signature</p>
                  </div>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => handleShareCert(selectedCertModal.title)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Share2 size={14} /> Share Link
                </button>
                <button
                  onClick={() => handleDownloadCert(selectedCertModal.title)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#2962D6] via-[#2C83F5] to-[#27C5D8] hover:opacity-90 text-white shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Download size={14} /> Download PDF
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
