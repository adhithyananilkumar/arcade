'use client';

/**
 * Arcade Learner Architecture
 * Layer: Apps (learner)
 *
 * Achievements Page — matching the exact UI style, layout, typography,
 * colors, buttons, and responsive feel of My Learning (/learning).
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { UserService } from '@/domains/identity';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Search, Calendar, X, ShieldAlert, TimerOff, EyeOff, Compass } from 'lucide-react';
import Link from 'next/link';
import AchievementsHero from './AchievementsHero';
import { BadgeWallet } from './BadgeWallet';
import { BadgeDetailPanel } from './BadgeDetailPanel';
import { CertificateDetailPanel } from './CertificateDetailPanel';
import {
  CertificateFace,
  credentialsApi,
  type BadgeTierInfo,
  type IssuedBadge,
  type IssuedCertificate,
  type MyBadges,
} from '@/domains/credentials';
import { examRoutes } from '@/shared/routes/content.routes';

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

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

function CertificateDoodle() {
  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative mb-3 flex items-center justify-center select-none"
    >
      <svg
        width="110"
        height="100"
        viewBox="0 0 110 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        <ellipse cx="55" cy="50" rx="38" ry="32" className="fill-[#2962D6]/10 dark:fill-[#3B82F6]/15" />
        <rect
          x="30"
          y="20"
          width="50"
          height="60"
          rx="8"
          className="fill-white dark:fill-slate-900 stroke-slate-800 dark:stroke-slate-200"
          strokeWidth="2"
        />
        <path d="M40 32H70M40 40H62M40 48H66" stroke="#2962D6" strokeWidth="2" strokeLinecap="round" />
        <circle cx="55" cy="62" r="7" className="fill-[#27C5D8]/20 stroke-[#27C5D8]" strokeWidth="2" />
        <path d="M52 62L54.5 64.5L58.5 60.5" stroke="#27C5D8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.div>
  );
}

// ─── Main Achievements Page Component ─────────────────────────────────────────
export default function AchievementsPage() {
  const { updateUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [selectedBadge, setSelectedBadge] = useState<IssuedBadge | null>(null);
  const [badges, setBadges] = useState<MyBadges | null>(null);
  const [tiers, setTiers] = useState<BadgeTierInfo[]>([]);
  const [badgesError, setBadgesError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'badges' | 'certificates'>('badges');
  const [certificates, setCertificates] = useState<IssuedCertificate[] | null>(null);
  const [certificatesError, setCertificatesError] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<IssuedCertificate | null>(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Issued badges come from the server
  useEffect(() => {
    let cancelled = false;
    credentialsApi
      .mine()
      .then((data) => !cancelled && setBadges(data))
      .catch((e) => !cancelled && setBadgesError(e instanceof Error ? e.message : 'Could not load your badges.'));
    credentialsApi
      .catalogue()
      .then((c) => !cancelled && setTiers(c.tiers))
      .catch(() => {});
    credentialsApi
      .myCertificates()
      .then((data) => !cancelled && setCertificates(data))
      .catch((e) => !cancelled && setCertificatesError(e instanceof Error ? e.message : 'Could not load your certificates.'));
    return () => {
      cancelled = true;
    };
  }, []);

  const replaceCertificate = (next: IssuedCertificate) => {
    setSelectedCertificate(next);
    setCertificates((prev) => prev?.map((c) => (c.credentialCode === next.credentialCode ? next : c)) ?? prev);
  };

  const replaceBadge = (next: IssuedBadge) => {
    setSelectedBadge(next);
    setBadges((prev) =>
      prev ? { ...prev, earned: prev.earned.map((b) => (b.credentialCode === next.credentialCode ? next : b)) } : prev
    );
  };

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

  const unlockedCount = badges?.total ?? 0;
  const totalBadges = (badges?.earned.length ?? 0) + (badges?.inProgress.length ?? 0);
  const certificateCount = certificates?.filter((c) => !c.revoked).length ?? 0;

  const filteredCertificates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!certificates) return [];
    if (!q) return certificates;
    return certificates.filter((c) =>
      [c.title, c.issuerName, c.programme ?? '', c.credentialCode].some((s) => s.toLowerCase().includes(q))
    );
  }, [certificates, searchQuery]);

  return (
    <div className="relative min-h-screen w-full text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/40">
      {/* Background — vibrant ambient gradient matching My Learning */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 dark:hidden -z-10"
        style={{
          background: `var(--theme-wash,
            radial-gradient(ellipse 55% 40% at 8% 12%, rgba(41, 98, 214, 0.16) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 92% 20%, rgba(39, 197, 216, 0.14) 0%, transparent 60%),
            radial-gradient(ellipse 45% 35% at 5% 50%, rgba(99, 102, 241, 0.09) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 95% 52%, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 6% 78%, rgba(14, 165, 233, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 94% 80%, rgba(20, 184, 166, 0.11) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 50% 95%, rgba(44, 131, 245, 0.08) 0%, transparent 60%),
            linear-gradient(to bottom, #E9EEFB 0%, #F5F9FD 25%, #FFFFFF 50%, #FFFFFF 75%, #E8F7F8 100%)
          )`,
        }}
      />
      <div
        aria-hidden
        className="theme-page-layer pointer-events-none fixed inset-0 hidden dark:block -z-10 bg-slate-950"
        style={{
          background: `
            radial-gradient(ellipse 65% 45% at 8% 12%, rgba(41, 98, 214, 0.22) 0%, transparent 60%),
            radial-gradient(ellipse 55% 40% at 92% 24%, rgba(39, 197, 216, 0.16) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 5% 52%, rgba(99, 102, 241, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 55% 40% at 6% 76%, rgba(14, 165, 233, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 55% 40% at 94% 76%, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
            linear-gradient(to bottom, #020617 0%, #081126 35%, #0B1528 70%, #020617 100%)
          `,
        }}
      />

      {/* Main Page Container matching My Learning layout & responsive spacing */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-20 space-y-6 sm:space-y-8">
        {/* ── Page Hero: Heading & Subtitle ── */}
        <AchievementsHero
          unlockedCount={unlockedCount}
          totalBadges={totalBadges}
          streakDays={14}
          certificatesCount={certificateCount}
        />

        {/* ── Toolbar: Left Asymmetric Tabs | Right Search ── */}
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-2">
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
              label={`Certificates (${certificateCount})`}
            />
          </div>

          {/* RIGHT: Search Field with Asymmetric Geometric Border */}
          <div className="w-full md:w-64 flex items-center justify-start md:justify-end shrink-0">
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
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
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
                    className="w-full pl-9 pr-8 py-2.5 rounded-tl-[1.25rem] rounded-br-[1.25rem] rounded-tr-md rounded-bl-md text-xs sm:text-sm bg-transparent border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-700 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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
                  className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer"
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
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{badgesError}</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-pulse" aria-busy>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-72 rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl bg-slate-200/70 dark:bg-slate-800/70" />
              ))}
            </div>
          )
        )}

        {/* ── TAB 2: CERTIFICATES ── */}
        {activeTab === 'certificates' && (
          <section aria-label="Certificates" className="space-y-6">
            {certificatesError && (
              <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{certificatesError}</p>
            )}
            {!certificates && !certificatesError && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-pulse" aria-busy>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-72 rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl bg-slate-200/70 dark:bg-slate-800/70" />
                ))}
              </div>
            )}
            {certificates && certificates.length === 0 && (
              <div className="py-10 px-4 text-center flex flex-col items-center justify-center">
                <CertificateDoodle />
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">No certificates yet</h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Certificates are awarded when you pass a certification exam. Each one is sealed by Arcade, verifiable by its ID, and downloadable as a PDF.
                </p>
                <Link
                  href={examRoutes.catalogue}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-slate-900 dark:bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-white dark:text-slate-900 hover:opacity-90 transition shadow-sm"
                >
                  <Award className="h-4 w-4" />
                  Browse exams
                </Link>
              </div>
            )}
            {certificates && certificates.length > 0 && filteredCertificates.length === 0 && (
              <div className="py-10 px-4 text-center flex flex-col items-center justify-center">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">No matching certificates</h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  No certificates matched &ldquo;{searchQuery}&rdquo;. Try a different search term.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {filteredCertificates.map((cert, idx) => {
                const inactive = cert.revoked || cert.expired;

                return (
                  <motion.button
                    type="button"
                    onClick={() => setSelectedCertificate(cert)}
                    aria-label={`Open ${cert.title} certificate`}
                    key={cert.credentialCode}
                    layout="position"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: Math.min(idx * 0.04, 0.2) }}
                    className="group relative flex h-full flex-col justify-between overflow-hidden rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface/95 p-4 sm:p-5 text-left shadow-[0_8px_30px_rgba(20,20,43,0.05)] transition-all hover:shadow-[0_12px_36px_rgba(20,20,43,0.08)] hover:-translate-y-1 backdrop-blur-sm cursor-pointer"
                  >
                    {/* Ambient Glow matching My Learning */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -bottom-12 -right-12 h-44 w-44 rounded-full bg-gradient-to-br from-[#2962D6]/10 via-[#27C5D8]/8 to-transparent blur-2xl"
                    />

                    <div className="relative z-10 flex flex-1 flex-col justify-between gap-4">
                      {/* The certificate face in miniature */}
                      <div className="relative w-full shrink-0 overflow-hidden rounded-tl-[1.75rem] rounded-br-[1.75rem] rounded-tr-md rounded-bl-md border border-slate-200/70 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3 transition-transform duration-500 group-hover:scale-[1.02]">
                        <CertificateFace certificate={cert} className="shadow-md" />
                      </div>

                      {/* Details */}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {cert.revoked && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300">
                              <ShieldAlert size={11} />
                              Revoked
                            </span>
                          )}
                          {!cert.revoked && cert.expired && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                              <TimerOff size={11} />
                              Expired
                            </span>
                          )}
                          {!cert.publicVisible && !inactive && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                              <EyeOff size={11} />
                              Private
                            </span>
                          )}
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            {cert.issuerName}
                          </span>
                        </div>

                        <h3 className="line-clamp-1 text-base sm:text-lg font-bold tracking-tight text-ink">
                          {cert.title}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Awarded {shortDate(cert.achievedAt)}</span>
                          <span className="ml-auto font-mono text-[11px] tracking-wider text-slate-400">{cert.credentialCode}</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>
        )}

        <CertificateDetailPanel
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
          onChanged={replaceCertificate}
        />

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
