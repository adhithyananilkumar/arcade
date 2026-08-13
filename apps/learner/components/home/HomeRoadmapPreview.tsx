'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { SimpleGraph, type GraphDataPoint } from '@/components/ui/SimpleGraph';

const STATIONS: GraphDataPoint[] = [
  {
    id: '1',
    label: 'Start',
    hint: 'Begin Journey',
    value: 28,
    status: 'done',
    tone: '#C4B5FD',
  },
  {
    id: '2',
    label: 'Spark',
    hint: 'First course',
    value: 10,
    status: 'done',
    tone: '#1DB876',
  },
  {
    id: '3',
    label: 'Build',
    hint: 'Ship a project',
    value: 54,
    status: 'done',
    tone: '#818CF8',
  },
  {
    id: '4',
    label: 'Arena',
    hint: 'First hackathon',
    value: 40,
    status: 'current',
    tone: '#FF6B4A',
  },
  {
    id: '5',
    label: 'Crew',
    hint: 'Join a channel',
    value: 74,
    status: 'locked',
    tone: '#C4B5FD',
  },
  {
    id: '6',
    label: 'Orbit',
    hint: 'Mentor others',
    value: 94,
    status: 'locked',
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
      className="relative w-full overflow-visible pt-2 pb-6"
    >
      {/* Section Header */}
      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between pb-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#14142b] uppercase">
            Your Road Map
          </h2>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500 max-w-md">
            Track your journey from first course to mentoring others.
          </p>
        </div>
        <p className="truncate text-xs font-medium italic text-slate-400 sm:max-w-xs sm:text-right">
          “{quote}”
        </p>
      </div>

      {/* Simple Graph Animated Line (Seamlessly integrated into page) */}
      <div className="relative w-full overflow-visible py-2">
        <SimpleGraph
          data={STATIONS}
          height={300}
          strokeColor="#4C6FFF"
          nodeColor="#818CF8"
          showGrid={false}
          animated={true}
        />
      </div>
    </motion.section>
  );
}
