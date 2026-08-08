'use client';

import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';

type Station = {
  id: string;
  label: string;
  hint: string;
  status: 'done' | 'current' | 'locked';
  x: string;
  y: string;
  tone: string;
  textSide: 'left' | 'right';
};

const STATIONS: Station[] = [
  {
    id: '1',
    label: 'Spark',
    hint: 'First course',
    status: 'done',
    x: '22%',
    y: '12%',
    tone: '#1DB876',
    textSide: 'right',
  },
  {
    id: '2',
    label: 'Build',
    hint: 'Ship a project',
    status: 'done',
    x: '78%',
    y: '32%',
    tone: '#4C6FFF',
    textSide: 'left',
  },
  {
    id: '3',
    label: 'Arena',
    hint: 'First hackathon',
    status: 'current',
    x: '22%',
    y: '52%',
    tone: '#FF6B4A',
    textSide: 'right',
  },
  {
    id: '4',
    label: 'Crew',
    hint: 'Join a channel',
    status: 'locked',
    x: '78%',
    y: '72%',
    tone: '#9B5DE5',
    textSide: 'left',
  },
  {
    id: '5',
    label: 'Orbit',
    hint: 'Mentor others',
    status: 'locked',
    x: '22%',
    y: '92%',
    tone: '#F59E0B',
    textSide: 'right',
  },
];

const QUOTES = [
  'Maps don’t move. You do.',
  'The next station only unlocks for people who show up.',
  'Progress is a dotted line until you walk it.',
  'Stay curious. The path rewards the restless.',
  'You’re not behind — you’re mid-journey.',
  'Small steps compound into orbit.',
  'Finish today. Unlock tomorrow.',
  'Talent is noise. Consistency is signal.',
  'The arena is louder when you’re in it.',
  'Build in public. Grow in private. Win either way.',
];

const QUOTE_STORAGE_KEY = 'arc-roadmap-daily-quote';

function pickDailyQuoteIndex(): number {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const raw = localStorage.getItem(QUOTE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { day?: string; index?: number };
      if (parsed.day === today && typeof parsed.index === 'number') {
        return ((parsed.index % QUOTES.length) + QUOTES.length) % QUOTES.length;
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  const index = Math.floor(Math.random() * QUOTES.length);
  try {
    localStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify({ day: today, index }));
  } catch {
    /* ignore quota errors */
  }
  return index;
}

/**
 * Serpentine Wavy Roadmap with alternating content sides.
 */
export function HomeRoadmapPreview() {
  const [quote, setQuote] = useState(QUOTES[0]);

  useEffect(() => {
    setQuote(QUOTES[pickDailyQuoteIndex()]);
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.04 }}
      className="relative w-full"
    >
      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between border-b border-slate-100 pb-3">
        <h2 className="text-xl font-black tracking-tight text-[#14142b]">Your Road Map</h2>
        <p className="truncate text-[12px] font-medium italic text-slate-500 sm:max-w-md sm:text-right">
          “{quote}”
        </p>
      </div>

      {/* Serpentine Wavy Layout Container */}
      <div className="relative h-[320px] w-full sm:h-[340px]">
        {/* Soft Background Ambient Radial Glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 50% 45% at 20% 30%, rgba(76,111,255,0.07) 0%, transparent 70%), radial-gradient(ellipse 50% 45% at 80% 70%, rgba(255,107,74,0.07) 0%, transparent 70%)',
          }}
        />

        {/* Deep Serpentine Wavy SVG Path */}
        <svg
          className="absolute inset-0 h-full w-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="serpentineRoadGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1DB876" />
              <stop offset="25%" stopColor="#4C6FFF" />
              <stop offset="50%" stopColor="#FF6B4A" />
              <stop offset="75%" stopColor="#9B5DE5" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>

          {/* Background Soft Glow Wave */}
          <path
            d="M 22 12 C 78 12, 78 22, 78 32 C 78 42, 22 42, 22 52 C 22 62, 78 62, 78 72 C 78 82, 22 82, 22 92"
            fill="none"
            stroke="url(#serpentineRoadGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.2"
            className="blur-[4px]"
          />

          {/* Dotted Guide Path */}
          <path
            d="M 22 12 C 78 12, 78 22, 78 32 C 78 42, 22 42, 22 52 C 22 62, 78 62, 78 72 C 78 82, 22 82, 22 92"
            fill="none"
            stroke="rgba(20,20,43,0.12)"
            strokeWidth="0.8"
            strokeDasharray="1.5 2"
            strokeLinecap="round"
          />

          {/* Primary Animated Wavy Path */}
          <motion.path
            d="M 22 12 C 78 12, 78 22, 78 32 C 78 42, 22 42, 22 52 C 22 62, 78 62, 78 72 C 78 82, 22 82, 22 92"
            fill="none"
            stroke="url(#serpentineRoadGrad)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray="4 3"
            animate={{ strokeDashoffset: [0, -28] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
        </svg>

        {/* Alternating Wavy Station Nodes */}
        {STATIONS.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08 + i * 0.06, type: 'spring', stiffness: 260, damping: 18 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: s.x, top: s.y }}
          >
            <div className="relative flex items-center">
              {/* Central Station Icon Node */}
              <div
                className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border-2 bg-white transition-transform hover:scale-115 cursor-pointer ${
                  s.status === 'locked'
                    ? 'border-slate-200 text-slate-300'
                    : 'border-white text-[#14142b]'
                }`}
                style={
                  s.status !== 'locked'
                    ? { boxShadow: `0 6px 18px ${s.tone}40` }
                    : { boxShadow: '0 3px 10px rgba(20,20,43,0.05)' }
                }
              >
                {s.status === 'done' && (
                  <Check size={16} strokeWidth={2.5} style={{ color: s.tone }} />
                )}
                {s.status === 'current' && (
                  <span
                    className="h-2.5 w-2.5 rounded-full animate-pulse"
                    style={{ background: s.tone, boxShadow: `0 0 0 4px ${s.tone}33` }}
                  />
                )}
                {s.status === 'locked' && <Lock size={13} />}
              </div>

              {/* Alternating Content / Description Text (Flips side on opposite wave peaks) */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap flex flex-col ${
                  s.textSide === 'right'
                    ? 'left-full ml-3.5 items-start text-left'
                    : 'right-full mr-3.5 items-end text-right'
                }`}
              >
                <p
                  className="text-xs font-black tracking-tight"
                  style={{ color: s.status === 'locked' ? '#94A3B8' : s.tone }}
                >
                  {s.label}
                </p>
                <p className="text-[10px] font-semibold text-slate-400 -mt-0.5">{s.hint}</p>

                {(s.status === 'done' || s.status === 'current') && (
                  <div className="mt-0.5 flex gap-0.5">
                    {[0, 1, 2].map((star) => {
                      const filled = s.status === 'done' ? star < 2 : star < 1;
                      return (
                        <span
                          key={star}
                          className="h-1 w-1 rounded-full"
                          style={{
                            background: filled ? '#FBBF24' : 'rgba(148,163,184,0.35)',
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
