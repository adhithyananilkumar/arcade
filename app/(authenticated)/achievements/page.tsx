'use client';

import { useState } from 'react';
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
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

// Types
interface AchievementBadge {
  id: string;
  name: string;
  category: 'learning' | 'community' | 'streaks' | 'challenges';
  description: string;
  icon: any;
  color: string;
  bgGradient: string;
  borderColor: string;
  xp: number;
  earned: boolean;
  earnedDate?: string;
  progress?: number; // 0-100
}

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialId: string;
  skills: string[];
  grade?: string;
  verificationUrl: string;
}

const mockBadges: AchievementBadge[] = [
  {
    id: '1',
    name: 'Streak Pioneer',
    category: 'streaks',
    description: 'Maintained an active learning streak for 7 consecutive days.',
    icon: Flame,
    color: 'text-amber-500',
    bgGradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
    borderColor: 'border-amber-500/30',
    xp: 250,
    earned: true,
    earnedDate: 'Jul 18, 2026',
  },
  {
    id: '2',
    name: 'Full Stack Master',
    category: 'learning',
    description: 'Completed 5 full-stack development courses with >90% score.',
    icon: Trophy,
    color: 'text-purple-500',
    bgGradient: 'from-purple-500/10 via-indigo-500/5 to-transparent',
    borderColor: 'border-purple-500/30',
    xp: 500,
    earned: true,
    earnedDate: 'Jul 21, 2026',
  },
  {
    id: '3',
    name: 'Assessment Ace',
    category: 'learning',
    description: 'Scored 100% on a comprehensive course final assessment.',
    icon: Award,
    color: 'text-emerald-500',
    bgGradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    borderColor: 'border-emerald-500/30',
    xp: 350,
    earned: true,
    earnedDate: 'Jul 12, 2026',
  },
  {
    id: '4',
    name: 'Community Helper',
    category: 'community',
    description: 'Answered 10 community discussion questions with marked solutions.',
    icon: Star,
    color: 'text-blue-500',
    bgGradient: 'from-blue-500/10 via-sky-500/5 to-transparent',
    borderColor: 'border-blue-500/30',
    xp: 200,
    earned: true,
    earnedDate: 'Jun 28, 2026',
  },
  {
    id: '5',
    name: 'Workshop Explorer',
    category: 'challenges',
    description: 'Attended and completed 3 live interactive technical workshops.',
    icon: Zap,
    color: 'text-rose-500',
    bgGradient: 'from-rose-500/10 via-pink-500/5 to-transparent',
    borderColor: 'border-rose-500/30',
    xp: 300,
    earned: true,
    earnedDate: 'Jul 05, 2026',
  },
  {
    id: '6',
    name: 'Polyglot Builder',
    category: 'learning',
    description: 'Complete project implementations in 3 different programming languages.',
    icon: Medal,
    color: 'text-cyan-500',
    bgGradient: 'from-cyan-500/10 via-blue-500/5 to-transparent',
    borderColor: 'border-cyan-500/30',
    xp: 450,
    earned: false,
    progress: 66,
  },
  {
    id: '7',
    name: '30-Day Legend',
    category: 'streaks',
    description: 'Maintain a daily learning streak for 30 consecutive days.',
    icon: Flame,
    color: 'text-orange-500',
    bgGradient: 'from-orange-500/10 via-red-500/5 to-transparent',
    borderColor: 'border-orange-500/30',
    xp: 1000,
    earned: false,
    progress: 40,
  },
  {
    id: '8',
    name: 'Hackathon Champion',
    category: 'challenges',
    description: 'Achieve a top 3 finish in an Arcade platform hackathon or challenge.',
    icon: Trophy,
    color: 'text-yellow-500',
    bgGradient: 'from-yellow-500/10 via-amber-500/5 to-transparent',
    borderColor: 'border-yellow-500/30',
    xp: 750,
    earned: false,
    progress: 0,
  },
];

const mockCertificates: Certificate[] = [
  {
    id: 'cert-1',
    title: 'Advanced Full-Stack Engineering & System Architecture',
    issuer: 'Arcade Academy & Amal Jyothi College of Engineering',
    issueDate: 'July 15, 2026',
    credentialId: 'ARC-2026-88492-FS',
    skills: ['React', 'Next.js', 'Spring Boot', 'System Design', 'PostgreSQL'],
    grade: '98% (Distinction)',
    verificationUrl: '#',
  },
  {
    id: 'cert-2',
    title: 'Cloud-Native DevOps & Container Orchestration',
    issuer: 'Arcade Cloud Institute',
    issueDate: 'June 30, 2026',
    credentialId: 'ARC-2026-77319-DO',
    skills: ['Docker', 'Kubernetes', 'CI/CD Pipelines', 'AWS Services'],
    grade: '95%',
    verificationUrl: '#',
  },
  {
    id: 'cert-3',
    title: 'Interactive Web Application Development',
    issuer: 'Arcade Academy',
    issueDate: 'May 20, 2026',
    credentialId: 'ARC-2026-66201-WD',
    skills: ['TypeScript', 'Tailwind CSS', 'State Management', 'REST APIs'],
    grade: '96%',
    verificationUrl: '#',
  },
];

export default function AchievementsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'all' | 'badges' | 'certificates'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(null);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const earnedBadgesCount = mockBadges.filter(b => b.earned).length;
  const totalXp = mockBadges.filter(b => b.earned).reduce((acc, b) => acc + b.xp, 0);

  const filteredBadges = mockBadges.filter(badge => {
    const matchesSearch = badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          badge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || badge.category === categoryFilter;
    const matchesTab = activeTab === 'all' || activeTab === 'badges' || (activeTab === 'all' && badge.earned);
    return matchesSearch && matchesCategory && matchesTab;
  });

  const handleShare = (title: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success(`Share link for "${title}" copied to clipboard!`);
    } else {
      toast.success(`Sharing ${title}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-black pt-24 pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-8 md:p-10 shadow-2xl border border-indigo-700/40">
          <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-40 -top-20 w-60 h-60 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-indigo-200">
                <Sparkles size={14} className="text-amber-400" />
                <span>Learner Milestones & Showcase</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Achievements & Verified Credentials
              </h1>
              <p className="text-indigo-200 text-sm sm:text-base max-w-2xl leading-relaxed">
                Track your learning progress, earn skill badges, maintain streaks, and showcase verified institutional certificates on Arcade.
              </p>
            </div>

            {/* Quick User Summary Badge */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shrink-0">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg text-lg">
                🏆
              </div>
              <div>
                <div className="text-xs font-medium text-indigo-200 uppercase tracking-wider">Level 8 Contributor</div>
                <div className="text-lg font-bold text-white">
                  {user?.fullName || user?.username || 'Learner'}
                </div>
                <div className="text-xs text-amber-300 font-semibold flex items-center gap-1 mt-0.5">
                  <Zap size={12} className="fill-amber-300" />
                  {totalXp} Total XP Earned
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="text-xs text-indigo-200 font-medium flex items-center gap-1.5">
                <Trophy size={16} className="text-amber-400" /> Badges Earned
              </div>
              <div className="text-2xl font-bold mt-1">{earnedBadgesCount} <span className="text-xs text-indigo-300 font-normal">/ {mockBadges.length}</span></div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="text-xs text-indigo-200 font-medium flex items-center gap-1.5">
                <Flame size={16} className="text-orange-400" /> Current Streak
              </div>
              <div className="text-2xl font-bold mt-1">7 Days</div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="text-xs text-indigo-200 font-medium flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-400" /> Certificates
              </div>
              <div className="text-2xl font-bold mt-1">{mockCertificates.length}</div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="text-xs text-indigo-200 font-medium flex items-center gap-1.5">
                <Zap size={16} className="text-purple-400" /> Total XP
              </div>
              <div className="text-2xl font-bold mt-1">{totalXp.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Tab & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'badges'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Badges ({mockBadges.length})
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'certificates'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Certificates ({mockCertificates.length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search achievements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>
        </div>

        {/* Section 1: Certificates Showcase (When selected or overview) */}
        {(activeTab === 'all' || activeTab === 'certificates') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="text-indigo-600 dark:text-indigo-400" size={22} />
                Verified Certificates
              </h2>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                {mockCertificates.length} credentials issued
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCertificates.map((cert) => (
                <motion.div
                  key={cert.id}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-200 dark:border-zinc-800 shadow-md hover:shadow-xl transition-all relative flex flex-col justify-between group overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                  
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                        <Award size={24} />
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                        <ShieldCheck size={12} /> Verified
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {cert.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                      {cert.issuer}
                    </p>

                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-zinc-400">Issue Date:</span>
                        <span className="font-medium text-slate-700 dark:text-zinc-300">{cert.issueDate}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-zinc-400">Grade Score:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{cert.grade}</span>
                      </div>
                    </div>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {cert.skills.map((skill, i) => (
                        <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2">
                    <button
                      onClick={() => handleShare(cert.title)}
                      className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Share2 size={14} /> Share
                    </button>
                    <button
                      onClick={() => toast.success(`Downloading certificate PDF for ${cert.title}`)}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Download size={14} /> PDF
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Badges & Trophies Grid */}
        {(activeTab === 'all' || activeTab === 'badges') && (
          <div className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="text-amber-500" size={22} />
                Skill Badges & Achievements
              </h2>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                {['all', 'learning', 'streaks', 'community', 'challenges'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                      categoryFilter === cat
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredBadges.map((badge) => {
                const IconComponent = badge.icon;

                return (
                  <motion.div
                    key={badge.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedBadge(badge)}
                    className={`cursor-pointer rounded-2xl p-5 border transition-all relative flex flex-col justify-between ${
                      badge.earned
                        ? `bg-gradient-to-b ${badge.bgGradient} bg-white dark:bg-zinc-900 ${badge.borderColor} shadow-sm hover:shadow-lg`
                        : 'bg-slate-50/50 dark:bg-zinc-900/40 border-slate-200/80 dark:border-zinc-800 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div>
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-2xl bg-white dark:bg-zinc-800 shadow-md ${badge.color}`}>
                          <IconComponent size={28} />
                        </div>

                        {badge.earned ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 size={12} /> Unlocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                            <Lock size={12} /> Locked
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {badge.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                        {badge.description}
                      </p>
                    </div>

                    {/* Progress Bar / Reward Footer */}
                    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                      {badge.earned ? (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 dark:text-zinc-500">{badge.earnedDate}</span>
                          <span className="font-bold text-amber-500 flex items-center gap-1">
                            <Zap size={12} className="fill-amber-500" /> +{badge.xp} XP
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-zinc-400 font-medium">Progress</span>
                            <span className="font-bold text-slate-700 dark:text-zinc-300">{badge.progress || 0}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                              style={{ width: `${badge.progress || 0}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Detail Modal for Selected Badge */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-6 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800 shadow-inner ${selectedBadge.color}`}>
                  <selectedBadge.icon size={40} />
                </div>
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-100 dark:bg-zinc-800"
                >
                  ✕
                </button>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mb-2 capitalize">
                  {selectedBadge.category} Achievement
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedBadge.name}</h3>
                <p className="text-sm text-slate-600 dark:text-zinc-300 mt-2 leading-relaxed">
                  {selectedBadge.description}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-700/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-zinc-400">Reward:</span>
                  <span className="font-bold text-amber-500 flex items-center gap-1">
                    <Zap size={14} className="fill-amber-500" /> +{selectedBadge.xp} XP
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-zinc-400">Status:</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    {selectedBadge.earned ? `Unlocked on ${selectedBadge.earnedDate}` : `In Progress (${selectedBadge.progress || 0}%)`}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleShare(selectedBadge.name);
                    setSelectedBadge(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <Share2 size={16} /> Share Badge
                </button>
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="py-3 px-5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
