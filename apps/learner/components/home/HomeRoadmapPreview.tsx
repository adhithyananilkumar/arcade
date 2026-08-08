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
};

const STATIONS: Station[] = [
  {
    id: '1',
    label: 'Spark',
    hint: 'First course',
    status: 'done',
    x: '8%',
    y: '58%',
    tone: '#1DB876',
  },
  {
    id: '2',
    label: 'Build',
    hint: 'Ship a project',
    status: 'done',
    x: '28%',
    y: '26%',
    tone: '#4C6FFF',
  },
  {
    id: '3',
    label: 'Arena',
    hint: 'First hackathon',
    status: 'current',
    x: '48%',
    y: '56%',
    tone: '#FF6B4A',
  },
  {
    id: '4',
    label: 'Crew',
    hint: 'Join a channel',
    status: 'locked',
    x: '68%',
    y: '24%',
    tone: '#9B5DE5',
  },
  {
    id: '5',
    label: 'Orbit',
    hint: 'Mentor others',
    status: 'locked',
    x: '90%',
    y: '50%',
    tone: '#F59E0B',
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
 * Roadmap preview on the page canvas (no card chrome).
 * One motivational quote per calendar day; station labels are solid color.
 */
export function HomeRoadmapPreview() {
  const [quote, setQuote] = useState(QUOTES[0]);

  useEffect(() => {
    setQuote(QUOTES[pickDailyQuoteIndex()]);
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full"
    >
      <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-xl font-bold tracking-tight text-[#14142b]">Your Road Map</h2>
        <p className="truncate text-[13px] font-medium italic text-slate-500 sm:max-w-md sm:text-right">
          “{quote}”
        </p>
      </div>

      <div className="relative w-full mt-6 h-[200px] sm:mt-12 sm:h-[260px] max-w-5xl mx-auto">
        {/* Soft canvas glow only — no box */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 35% 45% at 20% 50%, rgba(76,111,255,0.08) 0%, transparent 60%), radial-gradient(ellipse 35% 40% at 50% 50%, rgba(255,107,74,0.07) 0%, transparent 55%), radial-gradient(ellipse 35% 45% at 80% 50%, rgba(155,93,229,0.05) 0%, transparent 55%)',
          }}
        />

        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <motion.path
            d="M 8 58 C 16 58, 20 30, 28 26 S 40 52, 48 56 S 60 22, 68 24 S 80 52, 90 50"
            fill="none"
            stroke="rgba(20,20,43,0.12)"
            strokeWidth="0.55"
            strokeDasharray="1.1 1.5"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          <motion.path
            d="M 8 58 C 16 58, 20 30, 28 26 S 40 52, 48 56"
            fill="none"
            stroke="url(#roadGlowHome)"
            strokeWidth="0.95"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
          />
          <defs>
            <linearGradient id="roadGlowHome" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1DB876" />
              <stop offset="45%" stopColor="#4C6FFF" />
              <stop offset="100%" stopColor="#FF6B4A" />
            </linearGradient>
          </defs>
        </svg>

        {STATIONS.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.15, type: 'spring', stiffness: 260, damping: 20 }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: s.x, top: s.y }}
          >
            <div className="relative flex items-center justify-center">
              <div
                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-2xl border-2 bg-white ${
                  s.status === 'locked'
                    ? 'border-slate-200 text-slate-300'
                    : 'border-white text-[#14142b]'
                }`}
                style={
                  s.status !== 'locked'
                    ? { boxShadow: `0 8px 20px ${s.tone}40` }
                    : { boxShadow: '0 4px 14px rgba(20,20,43,0.06)' }
                }
              >
                {s.status === 'done' && (
                  <Check size={17} strokeWidth={2.5} style={{ color: s.tone }} />
                )}
                {s.status === 'current' && (
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: s.tone, boxShadow: `0 0 0 4px ${s.tone}33` }}
                  />
                )}
                {s.status === 'locked' && <Lock size={14} />}
              </div>

              <div 
                className={`absolute w-[140px] top-1/2 -translate-y-1/2 ${
                  parseInt(s.x) > 40 ? 'right-[50px] text-right' : 'left-[50px] text-left'
                }`}
              >
                <p
                  className="text-[13px] font-bold tracking-tight"
                  style={{ color: s.status === 'locked' ? '#94A3B8' : s.tone }}
                >
                  {s.label}
                </p>
                <p className="text-[10px] font-medium text-slate-400">{s.hint}</p>

                {(s.status === 'done' || s.status === 'current') && (
                  <div className={`mt-1 flex gap-0.5 ${parseInt(s.x) > 40 ? 'justify-end' : 'justify-start'}`}>
                    {[0, 1, 2].map((star) => {
                      const filled =
                        s.status === 'done' ? star < 2 : star < 1;
                      return (
                        <span
                          key={star}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            background: filled ? '#FBBF24' : 'rgba(148,163,184,0.45)',
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
