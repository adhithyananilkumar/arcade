'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Flag, Heart, ExternalLink } from 'lucide-react';
import { ADDITIONAL_RESOURCES, ROADMAP_GOAL } from '../data/defaultFrontendRoadmap';

interface AdditionalResourcesCardProps {
  className?: string;
}

export const AdditionalResourcesCard: React.FC<AdditionalResourcesCardProps> = ({
  className = '',
}) => {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`roadmap-resource-card bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${className}`}
      style={{ minHeight: '290px' }}
    >
      <div>
        {/* Header: Book icon + Title */}
        <div className="flex items-center gap-2.5 mb-3.5 pb-2.5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <BookOpen size={17} />
          </div>
          <h3 className="font-extrabold text-sm sm:text-base text-slate-800 tracking-tight">
            Additional Resources
          </h3>
        </div>

        {/* Resources list */}
        <ul className="space-y-2.5 text-xs">
          {ADDITIONAL_RESOURCES.map((res, i) => (
            <li key={i} className="flex items-start gap-2 leading-relaxed text-slate-600">
              <span className="text-slate-400 font-bold select-none">•</span>
              <div>
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-slate-800 hover:text-blue-600 inline-flex items-center gap-1 transition-colors"
                >
                  <span>{res.title}</span>
                  <ExternalLink size={10} className="text-slate-400" />
                </a>
                <span className="text-slate-400 mx-1">—</span>
                <span className="text-slate-500 break-all font-normal">
                  {res.description}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
        <span>Curated references</span>
        <span className="text-blue-600 font-extrabold">Self-paced study</span>
      </div>
    </motion.div>
  );
};

interface RoadmapGoalCardProps {
  className?: string;
}

export const RoadmapGoalCard: React.FC<RoadmapGoalCardProps> = ({
  className = '',
}) => {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`roadmap-goal-card bg-gradient-to-b from-[#FAF5FF] to-white rounded-2xl p-5 border border-purple-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between items-center text-center ${className}`}
      style={{ minHeight: '290px' }}
    >
      {/* Header: Flag icon + Your Goal */}
      <div className="w-full flex items-center justify-center gap-2 pb-2.5 border-b border-purple-100">
        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
          <Flag size={16} />
        </div>
        <h3 className="font-extrabold text-sm sm:text-base text-purple-950 tracking-tight">
          {ROADMAP_GOAL.title}
        </h3>
      </div>

      {/* Motivational Content */}
      <div className="my-auto py-3 px-2 flex flex-col items-center">
        <p className="text-xs sm:text-[13px] font-semibold text-slate-700 leading-relaxed max-w-[210px]">
          {ROADMAP_GOAL.quote}
        </p>

        {/* Heart Icon */}
        <div className="my-3 text-purple-400 hover:text-purple-500 transition-colors">
          <Heart size={20} className="stroke-[2.2] fill-purple-100 text-purple-500 animate-pulse" />
        </div>

        {/* Handwritten Cursive "Keep going!" */}
        <span
          className="text-2xl sm:text-3xl text-blue-600 font-bold tracking-wide -rotate-3 select-none"
          style={{ fontFamily: "'Caveat', 'Dancing Script', cursive" }}
        >
          {ROADMAP_GOAL.encouragement}
        </span>
      </div>

      <div className="w-full pt-2.5 border-t border-purple-100/80 text-[10.5px] font-bold text-purple-600/80">
        <span>Dream big • Ship often</span>
      </div>
    </motion.div>
  );
};
