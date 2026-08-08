'use client';

import { motion } from 'framer-motion';
import { Plus, Check, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRef, useEffect } from 'react';

export type RoadmapSectionProps = {
  enrolledCourses: any[];
};

const STATIONS = [
  {
    id: '1',
    label: 'Spark',
    hint: 'First course',
    desc: 'Lorem Ipsum Dolor Sit Amet Consectetur. Lorem Enim Arcu Massa Urna.',
    status: 'done',
    tone: '#1DB876',
    x: '50%',
    y: '10%',
  },
  {
    id: '2',
    label: 'Build',
    hint: 'Ship a project',
    desc: 'Lorem Ipsum Dolor Sit Amet Consectetur. Lorem Enim Arcu Massa Urna.',
    status: 'done',
    tone: '#4C6FFF',
    x: '80%',
    y: '30%',
  },
  {
    id: '3',
    label: 'Arena',
    hint: 'First hackathon',
    desc: 'Lorem Ipsum Dolor Sit Amet Consectetur. Lorem Enim Arcu Massa Urna.',
    status: 'current',
    tone: '#FF6B4A',
    x: '20%',
    y: '50%',
  },
  {
    id: '4',
    label: 'Crew',
    hint: 'Join a channel',
    desc: 'Lorem Ipsum Dolor Sit Amet Consectetur. Lorem Enim Arcu Massa Urna.',
    status: 'locked',
    tone: '#94A3B8',
    x: '70%',
    y: '70%',
  },
  {
    id: '5',
    label: 'Orbit',
    hint: 'Mentor others',
    desc: 'Lorem Ipsum Dolor Sit Amet Consectetur. Lorem Enim Arcu Massa Urna.',
    status: 'locked',
    tone: '#94A3B8',
    x: '30%',
    y: '90%',
  },
];

export function RoadmapSection({ enrolledCourses }: RoadmapSectionProps) {
  // Take up to 4 courses
  const coursesToDisplay = enrolledCourses?.slice(0, 4) || [];

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (containerRef.current) {
        const currentElement = containerRef.current.querySelector('[data-status="current"]');
        if (currentElement) {
          currentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full mt-32 lg:mt-[200px] mb-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_auto_1.2fr] lg:gap-12">
          
          {/* Left Column: Heading + Enrolled Courses */}
          <div className="flex flex-col gap-6">
            <h2 className="text-[1.85rem] font-bold tracking-tight text-[#14142b] md:text-3xl">
              Roadmap
            </h2>
            
            <div className="flex flex-col gap-4">
              {coursesToDisplay.length > 0 ? (
              coursesToDisplay.map((course: any, index: number) => (
                <Link href={`/course/${course.id}`} key={course.id || index}>
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="group flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white/80 p-5 transition-all hover:bg-white hover:border-slate-300 shadow-[0_2px_10px_rgba(20,20,43,0.03)] hover:shadow-[0_4px_15px_rgba(20,20,43,0.06)]"
                  >
                    <div className="flex flex-col pr-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Phase {index + 1}
                      </span>
                      <h4 className="text-[15px] font-bold text-[#14142b] line-clamp-2">
                        {course.title || 'Untitled Course'}
                      </h4>
                    </div>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center text-slate-400 group-hover:text-[#14142b] transition-colors">
                      <Plus size={20} strokeWidth={1.5} />
                    </div>
                  </motion.div>
                </Link>
              ))
            ) : (
              <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/40 text-center">
                <p className="text-[14px] font-medium text-slate-500">
                  No enrolled courses yet.
                </p>
                <Link href="/search" className="mt-3 text-[13px] font-semibold text-[#4C6FFF] hover:underline">
                  Browse courses
                </Link>
              </div>
              )}
            </div>

            {/* Change Button */}
            {coursesToDisplay.length > 0 && (
              <div className="mt-2">
                <button className="px-6 py-2.5 rounded-xl border-2 border-[#14142b] text-[14px] font-bold text-[#14142b] transition-all hover:bg-[#14142b] hover:text-white w-fit shadow-sm">
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Middle Divider */}
          <div className="hidden lg:block w-[2px] bg-slate-200/60 min-h-[480px] mt-[60px]"></div>

          {/* Right Column: Vertical Wavy Timeline */}
          <div 
            ref={containerRef}
            className="relative h-[480px] lg:h-[580px] w-full overflow-y-auto overflow-x-hidden lg:mt-[60px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="relative h-[800px] w-full min-w-[280px]">
              {/* Wavy SVG Background Line */}
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden
              >
                {/* Dashed base line for entire path */}
                <path
                  d="M 50 10 C 50 20, 80 20, 80 30 C 80 40, 20 40, 20 50 C 20 60, 70 60, 70 70 C 70 80, 30 80, 30 90"
                  fill="none"
                  stroke="rgba(20,20,43,0.12)"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                
                {/* Solid gradient line for completed/current portion */}
                <path
                  d="M 50 10 C 50 20, 80 20, 80 30 C 80 40, 20 40, 20 50"
                  fill="none"
                  stroke="url(#wavy-vert-grad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                <defs>
                  <linearGradient id="wavy-vert-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1DB876" />
                    <stop offset="50%" stopColor="#4C6FFF" />
                    <stop offset="100%" stopColor="#FF6B4A" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Absolute positioned nodes */}
              {STATIONS.map((station, index) => {
                const alignLeft = parseInt(station.x) > 50;
                const isCenter = station.x === '50%';
                
                return (
                  <motion.div 
                    key={station.id}
                    data-status={station.status}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                    className="absolute flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
                    style={{ left: station.x, top: station.y }}
                  >
                    {/* Node Badge */}
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_4px_15px_rgba(0,0,0,0.06)] border border-slate-100 z-10 relative">
                      {station.status === 'done' && (
                        <Check size={20} strokeWidth={3} style={{ color: station.tone }} />
                      )}
                      {station.status === 'current' && (
                        <div className="relative flex items-center justify-center">
                          <div className="absolute h-8 w-8 animate-pulse rounded-full opacity-20" style={{ backgroundColor: station.tone }}></div>
                          <div className="absolute h-5 w-5 animate-pulse rounded-full opacity-40" style={{ backgroundColor: station.tone }}></div>
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: station.tone }}></div>
                        </div>
                      )}
                      {station.status === 'locked' && (
                        <Lock size={16} strokeWidth={2} className="text-slate-300" />
                      )}
                    </div>
                    
                    {/* Details Box */}
                    <div 
                      className={`absolute w-[150px] sm:w-[180px] ${
                        isCenter ? 'left-[36px] text-left' :
                        alignLeft ? 'right-[36px] text-right' : 'left-[36px] text-left'
                      }`}
                    >
                      <h3 
                        className="text-[14px] font-bold" 
                        style={{ color: station.status === 'locked' ? '#64748b' : station.tone }}
                      >
                        {station.label}
                      </h3>
                      <p className="mt-0.5 text-[11px] font-medium text-slate-400 leading-tight">
                        {station.hint}
                      </p>
                      <p className="mt-1.5 text-[10px] text-slate-500 leading-snug line-clamp-2">
                        {station.desc}
                      </p>
                      
                      {/* 3 little dots */}
                      <div className={`mt-2 flex gap-1 ${alignLeft && !isCenter ? 'justify-end' : 'justify-start'}`}>
                        <div className={`h-1 w-1 rounded-full ${station.status === 'locked' ? 'bg-slate-200' : 'bg-[#F59E0B]'}`}></div>
                        <div className={`h-1 w-1 rounded-full ${station.status === 'locked' ? 'bg-slate-200' : 'bg-[#4C6FFF]'}`}></div>
                        <div className="h-1 w-1 rounded-full bg-slate-200"></div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
