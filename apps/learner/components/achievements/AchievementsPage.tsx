'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { UserService } from '@/domains/identity';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Award, Star, Search, Calendar, Download, X } from 'lucide-react';
import AchievementsHero from './AchievementsHero';
import { BadgeWallet } from './BadgeWallet';
import { BadgeDetailPanel } from './BadgeDetailPanel';
import { credentialsApi, type BadgeTierInfo, type IssuedBadge, type MyBadges } from '@/domains/credentials';

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
  const [certFilter, setCertFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [selectedBadge, setSelectedBadge] = useState<IssuedBadge | null>(null);
  const [badges, setBadges] = useState<MyBadges | null>(null);
  const [tiers, setTiers] = useState<BadgeTierInfo[]>([]);
  const [badgesError, setBadgesError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'badges' | 'certificates'>('badges');

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Issued badges come from the server; earning and backfill are decided there.
  useEffect(() => {
    let cancelled = false;
    credentialsApi
      .mine()
      .then((data) => !cancelled && setBadges(data))
      .catch((e) => !cancelled && setBadgesError(e instanceof Error ? e.message : 'Could not load your badges.'));
    credentialsApi
      .catalogue()
      .then((c) => !cancelled && setTiers(c.tiers))
      .catch(() => {
        // The ladder falls back to level numbers.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const replaceBadge = (next: IssuedBadge) => {
    setSelectedBadge(next);
    setBadges((prev) =>
      prev ? { ...prev, earned: prev.earned.map((b) => (b.credentialCode === next.credentialCode ? next : b)) } : prev
    );
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
  const unlockedCount = badges?.total ?? 0;
  const totalBadges = (badges?.earned.length ?? 0) + (badges?.inProgress.length ?? 0);

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
              label={`Badges (${unlockedCount})`}
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

        {/* ── TAB 1: BADGES ── */}
        {activeTab === 'badges' && (
          badges ? (
            <BadgeWallet data={badges} tiers={tiers} search={searchQuery} onOpen={setSelectedBadge} />
          ) : badgesError ? (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{badgesError}</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" aria-busy>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-80 animate-pulse rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl bg-slate-200/60 dark:bg-slate-800/60" />
              ))}
            </div>
          )
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

        <BadgeDetailPanel
          badge={selectedBadge}
          tiers={tiers}
          onClose={() => setSelectedBadge(null)}
          onChanged={replaceBadge}
        />
      </div>
    </div>
  );
}
