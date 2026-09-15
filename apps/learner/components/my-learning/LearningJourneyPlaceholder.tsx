'use client';

/**
 * Learning Journey — visual placeholder, deliberately non-functional.
 *
 * The previous version computed a live level from `completedCount` (3 / 10 / 20 / 30 completed
 * courses => Explorer / Adventurer / Scholar / Master) and lit up the path accordingly. That
 * looked like a real progression system, but no progression domain exists anywhere in the
 * backend: no XP, no levels, no thresholds, no persistence. The thresholds were invented by the
 * page itself, so two learners with identical achievement could see different "levels" purely
 * because of how their enrollments happened to be counted.
 *
 * Per the audit, building an achievement engine is explicitly out of scope. So the progression
 * calculation is removed and the milestones render as an unstarted, clearly-labelled preview.
 * Nothing here reads learner data, and nothing claims the learner has reached any level.
 *
 * If progression is later wanted as a real product capability it needs its own backend domain
 * decision (D4) — not a client-side score.
 */

import { Sprout, Target, Flag, Award, Crown, Lock } from 'lucide-react';

const MILESTONES = [
  { level: 1, title: 'Beginner', left: '10%', top: '70px', Icon: Sprout },
  { level: 2, title: 'Explorer', left: '30%', top: '80px', Icon: Target },
  { level: 3, title: 'Adventurer', left: '50%', top: '60px', Icon: Flag },
  { level: 4, title: 'Scholar', left: '70%', top: '70px', Icon: Award },
  { level: 5, title: 'Master', left: '90%', top: '50px', Icon: Crown },
] as const;

const PATH =
  'M 0 70 C 30 70, 30 70, 60 70 C 120 70, 120 80, 180 80 C 240 80, 240 60, 300 60 C 360 60, 360 70, 420 70 C 480 70, 480 50, 540 50 C 570 50, 600 50, 600 50';

export function LearningJourneyPlaceholder() {
  return (
    <section className="rounded-tr-none rounded-bl-none rounded-tl-[2.5rem] rounded-br-[2.5rem] border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs relative overflow-hidden">
      <div className="p-4 sm:p-5 pb-0 text-center">
        <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white tracking-tight">
          Your Learning Journey
        </h3>
        <p className="mt-1 text-[10.5px] font-semibold text-slate-400 dark:text-slate-500">
          Coming soon — progression tracking is not available yet
        </p>
      </div>

      <div className="w-full pb-3 mt-1" aria-hidden>
        <div className="w-full h-[140px] relative mx-auto opacity-70">
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 600 135"
            preserveAspectRatio="none"
          >
            <path
              d={PATH}
              fill="none"
              stroke="#EDE9FE"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="dark:stroke-slate-800"
            />
          </svg>

          {MILESTONES.map((node) => (
            <div
              key={node.level}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{ left: node.left, top: node.top }}
            >
              <div className="w-0.5 h-3 bg-[#EDE9FE] dark:bg-slate-800 absolute bottom-1" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#EDE9FE] dark:bg-slate-800 relative z-10 mt-4" />
              <div className="absolute bottom-3 w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                <Lock size={12} className="text-slate-400 dark:text-slate-600" />
              </div>
              <div className="absolute top-7 text-center w-[70px] sm:w-[85px] pointer-events-none">
                <p className="text-[10px] sm:text-[10.5px] font-bold text-slate-400 dark:text-slate-500">
                  {node.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
