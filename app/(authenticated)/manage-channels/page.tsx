'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Channel, channelService } from '@/domains/channels';
import {
  Tv,
  Clock,
  CheckCircle,
  ChevronRight,
  Users,
  Crown,
  XCircle,
  Search,
  X,
  Loader2,
  Sparkles,
  Building2,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

type Row = Channel & { relationship: 'OWNER' | 'STAFF' };
type Tab = 'all' | 'owner' | 'staff';

const CHANNELS_MESSAGES = [
  'Manage your personal and organization channels',
  'Publish courses, workshops, and build developer communities',
  'Collaborate with staff, manage content, and view analytics',
  'Build and grow your creator presence on Arcade',
];

export default function ManageChannelsPage() {
  const shouldReduceMotion = useReducedMotion();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % CHANNELS_MESSAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const fetchMyChannels = useCallback(async () => {
    try {
      setLoading(true);
      const [ownedChannels, pendingRequests, workspaces] = await Promise.all([
        channelService.getMyChannels(),
        channelService.getMyChannelRequests().catch((): Channel[] => []),
        channelService.getMyWorkspaces(),
      ]);

      const byId = new Map<string, Row>();
      [...ownedChannels, ...pendingRequests].forEach((c) => byId.set(c.id, { ...c, relationship: 'OWNER' }));
      workspaces.forEach((c) => {
        if (!byId.has(c.id)) byId.set(c.id, { ...c, relationship: 'STAFF' });
      });

      setRows(Array.from(byId.values()));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load your channels');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyChannels();
  }, [fetchMyChannels]);

  const ownerChannels = useMemo(() => rows.filter((r) => r.relationship === 'OWNER'), [rows]);
  const staffChannels = useMemo(() => rows.filter((r) => r.relationship === 'STAFF'), [rows]);

  const tabRows = useMemo(() => {
    if (tab === 'owner') return ownerChannels;
    if (tab === 'staff') return staffChannels;
    return rows;
  }, [tab, ownerChannels, staffChannels, rows]);

  const filteredChannels = useMemo(() => {
    if (!query.trim()) return tabRows;
    const q = query.toLowerCase().trim();
    return tabRows.filter(
      (c) =>
        (c.name ?? '').toLowerCase().includes(q) ||
        (c.handle ?? '').toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q)
    );
  }, [tabRows, query]);

  return (
    <div className="relative min-h-screen w-full text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/40">
      {/* Background — vibrant ambient gradient matching Home, My Learning, and Exams */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 dark:hidden -z-10"
        style={{
          background: `
            radial-gradient(ellipse 55% 40% at 8% 12%, rgba(41, 98, 214, 0.16) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 92% 20%, rgba(39, 197, 216, 0.14) 0%, transparent 60%),
            radial-gradient(ellipse 45% 35% at 5% 50%, rgba(99, 102, 241, 0.09) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 95% 52%, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 6% 78%, rgba(14, 165, 233, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 94% 80%, rgba(20, 184, 166, 0.11) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 50% 95%, rgba(44, 131, 245, 0.08) 0%, transparent 60%),
            linear-gradient(to bottom, #E9EEFB 0%, #F5F9FD 25%, #FFFFFF 50%, #FFFFFF 75%, #E8F7F8 100%)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 hidden dark:block -z-10 bg-slate-950"
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

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-28 space-y-6 sm:space-y-8">
        {/* PAGE HEADER / TITLE */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="pb-1 text-center flex flex-col items-center justify-center"
        >
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Satisfy&display=swap');
          `}</style>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none mb-3 flex items-baseline justify-center flex-wrap gap-2.5">
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block text-slate-900 dark:text-white font-extrabold text-4xl sm:text-5xl lg:text-6xl"
            >
              Manage
            </motion.span>

            <div className="relative inline-block pb-2">
              <motion.span
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block bg-gradient-to-r from-[#2962D6] via-[#2C83F5] to-[#27C5D8] bg-clip-text text-transparent px-1 text-5xl sm:text-6xl lg:text-7xl font-bold italic"
                style={{ fontFamily: "'Dancing Script', 'Satisfy', 'Amira-Grace', cursive" }}
              >
                Channels
              </motion.span>

              {/* Blue-to-Cyan Gradient Curved Underline Stroke */}
              <motion.svg
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                viewBox="0 0 300 20"
                fill="none"
                className="absolute -bottom-1 left-0 w-full h-4 pointer-events-none"
              >
                <path
                  d="M 8 13 C 90 4, 210 3, 292 11"
                  stroke="url(#channelsBrushGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="channelsBrushGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2962D6" />
                    <stop offset="55%" stopColor="#2C83F5" />
                    <stop offset="100%" stopColor="#27C5D8" />
                  </linearGradient>
                </defs>
              </motion.svg>
            </div>
          </h1>

          <div className="mt-1 relative h-[30px] flex items-center justify-center w-full max-w-lg mx-auto overflow-hidden">
            <AnimatePresence>
              <motion.p
                key={msgIndex}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -12 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold leading-relaxed text-center w-full px-4"
              >
                {CHANNELS_MESSAGES[msgIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── TOOLBAR: LEFT TABS | RIGHT SEARCH & INVITE HINT ── */}
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-2">
          {/* LEFT: Arcade Signature Geometric Asymmetric Tabs */}
          <div
            id="channels-items-section"
            className="scroll-mt-24 flex flex-wrap items-center justify-start gap-2.5 sm:gap-3 w-full md:w-auto shrink-0"
            role="tablist"
            aria-label="Channel sections"
          >
            <TabButton
              active={tab === 'all'}
              onClick={() => {
                setTab('all');
                setQuery('');
              }}
              label="All Channels"
              count={rows.length}
            />
            <TabButton
              active={tab === 'owner'}
              onClick={() => {
                setTab('owner');
                setQuery('');
              }}
              label="Owned"
              count={ownerChannels.length}
            />
            <TabButton
              active={tab === 'staff'}
              onClick={() => {
                setTab('staff');
                setQuery('');
              }}
              label="Staff Workspaces"
              count={staffChannels.length}
            />
          </div>

          {/* RIGHT: Search Toggle / Input */}
          <div className="w-full md:w-auto flex items-center justify-start md:justify-end shrink-0 gap-3">
            <p className="hidden lg:block text-xs font-medium text-slate-400 dark:text-slate-500">
              Channel creation is invite-only
            </p>
            <div className="w-full sm:w-64 flex items-center justify-start sm:justify-end shrink-0">
              <AnimatePresence initial={false}>
                {isSearchOpen || query ? (
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
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setQuery('');
                          setIsSearchOpen(false);
                        }
                      }}
                      placeholder="Search channels..."
                      className="w-full pl-9 pr-8 py-2.5 rounded-tl-[1.25rem] rounded-br-[1.25rem] rounded-tr-md rounded-bl-md text-xs sm:text-sm bg-transparent border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-700 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('');
                        setIsSearchOpen(false);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
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
                    title="Search channels"
                  >
                    <Search size={21} className="stroke-[2.2]" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── SECTION: CHANNELS CONTENT ── */}
        <section aria-label="Manage Channels Content" className="relative space-y-4 sm:space-y-5 pt-0">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {tab === 'all'
                ? 'Your Channels & Communities'
                : tab === 'owner'
                ? 'Owned Channels'
                : 'Staff Workspaces'}
            </h2>
          </div>

          <div className="relative z-10 space-y-6">
            {loading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="animate-spin text-slate-400" size={28} />
              </div>
            ) : filteredChannels.length === 0 ? (
              <EmptyChannelsState searching={Boolean(query.trim())} tab={tab} />
            ) : (
              <div className="overflow-hidden rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-[0_8px_30px_rgba(20,20,43,0.05)] divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredChannels.map((channel) => (
                  <ChannelRowItem key={channel.id} channel={channel} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative px-5 sm:px-6 py-2 rounded-tl-[1.25rem] rounded-br-[1.25rem] rounded-tr-md rounded-bl-md text-xs sm:text-sm font-black tracking-tight transition-all duration-200 select-none cursor-pointer min-w-[96px] text-center inline-flex items-center justify-center gap-2 ${
        active
          ? 'bg-white dark:bg-slate-900 text-[#2962D6] dark:text-[#3B82F6] border-2 border-[#2962D6] dark:border-[#3B82F6]'
          : 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      <span className="relative z-10">{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={`relative z-10 text-[11px] px-1.5 py-0.2 rounded-full font-bold tabular-nums ${
            active
              ? 'bg-[#2962D6]/10 dark:bg-[#3B82F6]/20 text-[#2962D6] dark:text-[#3B82F6]'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function ChannelRowItem({ channel }: { channel: Row }) {
  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 sm:px-6 py-4.5 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
      <div className="flex min-w-0 items-center gap-4">
        <div className="relative flex h-13 w-13 shrink-0 items-center justify-center overflow-hidden rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-500 dark:text-slate-400 group-hover:scale-105 transition-transform">
          {channel.iconUrl ? (
            <img src={channel.iconUrl} alt={channel.name} className="h-full w-full object-cover" />
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#2962D6] dark:text-[#3B82F6]"
            >
              {/* Megaphone Cone Body */}
              <path
                d="M3.5 10.5V13.5C3.5 14.1 4 14.5 4.5 14.5H6.5L14 18V6L6.5 9.5H4.5C4 9.5 3.5 9.9 3.5 10.5Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              {/* Megaphone Back rim */}
              <path
                d="M14 6C15 6 16 8.7 16 12C16 15.3 15 18 14 18"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              {/* Handle */}
              <path
                d="M7 14.5L7.8 19C7.9 19.6 8.4 20 9 20C9.6 20 10.1 19.5 10 18.9L9.5 14.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Accent dot on cone */}
              <circle cx="5" cy="12" r="0.75" fill="#F59E0B" />
              {/* Soundwaves / Broadcast arcs */}
              <path
                d="M18 9C19.2 10 19.8 11 19.8 12C19.8 13 19.2 14 18 15"
                stroke="#27C5D8"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M20.5 7C22.2 8.5 23 10.2 23 12C23 13.8 22.2 15.5 20.5 17"
                stroke="#27C5D8"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-base font-bold text-[#14142b] dark:text-white group-hover:text-[#2962D6] dark:group-hover:text-[#3B82F6] transition-colors">
              {channel.name}
            </h4>
            {channel.handle && (
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                @{channel.handle}
              </span>
            )}
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            {channel.status === 'PENDING' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 font-bold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <Clock size={11} /> Awaiting approval
              </span>
            ) : channel.status === 'SUSPENDED' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 font-bold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                Suspended
              </span>
            ) : channel.status === 'REJECTED' ? (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                title={channel.rejectionReason || undefined}
              >
                <XCircle size={11} /> Rejected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle size={11} /> Active
              </span>
            )}
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              {channel.isPersonal ? (
                <span>Personal</span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <Building2 size={12} /> Organization
                </span>
              )}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              {channel.relationship === 'OWNER' ? (
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <Crown size={12} /> Owner
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                  <UserCheck size={12} /> Staff
                </span>
              )}
            </span>
            {channel.status === 'PENDING' && channel.createdAt && (
              <>
                <span>·</span>
                <span>Requested {new Date(channel.createdAt).toLocaleDateString()}</span>
              </>
            )}
            {channel.status === 'REJECTED' && channel.rejectionReason && (
              <>
                <span>·</span>
                <span className="truncate max-w-[220px] text-rose-500">{channel.rejectionReason}</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        {channel.status !== 'PENDING' && channel.status !== 'REJECTED' && (
          <Link
            href={`/channels/${channel.id}/manage`}
            className="inline-flex items-center gap-1 rounded-full bg-[#12141C] dark:bg-white text-white dark:text-slate-900 px-4 py-2 text-xs sm:text-sm font-bold shadow-sm hover:opacity-90 transition-all cursor-pointer"
          >
            Dashboard
            <ChevronRight size={15} />
          </Link>
        )}
      </div>
    </div>
  );
}

function ChannelsDoodle() {
  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.82 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative mb-3 flex items-center justify-center select-none opacity-85 hover:opacity-100 transition-opacity"
    >
      <svg
        width="110"
        height="100"
        viewBox="0 0 110 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        {/* Soft background glow */}
        <ellipse cx="55" cy="50" rx="38" ry="32" className="fill-[#2962D6]/10 dark:fill-[#2962D6]/15" />

        {/* Minimal doodle TV screen */}
        <rect
          x="26"
          y="28"
          width="58"
          height="44"
          rx="10"
          className="fill-white dark:fill-slate-900 stroke-slate-800 dark:stroke-slate-200"
          strokeWidth="2"
        />

        {/* TV Antennas */}
        <path d="M42 16L52 28" className="stroke-slate-800 dark:stroke-slate-200" strokeWidth="2" strokeLinecap="round" />
        <path d="M68 16L58 28" className="stroke-slate-800 dark:stroke-slate-200" strokeWidth="2" strokeLinecap="round" />
        <circle cx="42" cy="16" r="2" className="fill-amber-400" />
        <circle cx="68" cy="16" r="2" className="fill-amber-400" />

        {/* Play Icon / Broadcast wave */}
        <path
          d="M51 44L63 50L51 56V44Z"
          className="fill-[#2962D6] stroke-[#2962D6]"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Signal waves */}
        <path d="M72 42C75 46 75 54 72 58" className="stroke-[#27C5D8]" strokeWidth="1.8" strokeLinecap="round" />

        {/* Sparkles */}
        <path d="M18 36L19 32L23 31L19 30L18 26L17 30L13 31L17 32Z" className="fill-amber-400 dark:fill-amber-300" />
        <path d="M90 28L91 25L94 24L91 23L90 20L89 23L86 24L89 25Z" className="fill-[#27C5D8]" />
      </svg>
    </motion.div>
  );
}

function EmptyChannelsState({ searching, tab }: { searching: boolean; tab: Tab }) {
  return (
    <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
      <ChannelsDoodle />
      <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
        {searching
          ? 'No channels matched your search'
          : tab === 'owner'
          ? "You don't own any channels yet"
          : tab === 'staff'
          ? "You aren't a staff member in any channels"
          : 'No channels yet'}
      </p>
      <p className="mt-1 max-w-sm text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
        {searching
          ? 'Try searching with a different channel name or handle.'
          : 'A channel is where your content lives. Channel creation is invite-only — ask a platform admin to invite you.'}
      </p>
    </div>
  );
}
