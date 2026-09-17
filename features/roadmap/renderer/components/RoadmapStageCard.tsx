'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { StageData } from '../data/defaultFrontendRoadmap';

interface RoadmapStageCardProps {
  stage: StageData;
  isActive?: boolean;
  isCompleted?: boolean;
  onClick: (id: string) => void;
  isMobile?: boolean;
  cardRef?: (node: HTMLDivElement | null) => void;
  className?: string;
}

export const RoadmapStageCard: React.FC<RoadmapStageCardProps> = ({
  stage,
  isActive = false,
  isCompleted = false,
  onClick,
  isMobile = false,
  cardRef,
  className = '',
}) => {
  const [expandedOnMobile, setExpandedOnMobile] = useState(false);
  const Icon = stage.icon;

  // For mobile, collapse beyond 3 topics if needed
  const maxMobileTopics = 3;
  const hasMoreTopics = isMobile && stage.checklist.length > maxMobileTopics;
  const visibleTopics = isMobile && !expandedOnMobile
    ? stage.checklist.slice(0, maxMobileTopics)
    : stage.checklist;

  return (
    <motion.div
      ref={cardRef}
      id={`card-${stage.id}`}
      data-stage-id={stage.id}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(stage.id)}
      className={`roadmap-stage-card ${stage.theme} ${isActive ? 'is-active' : ''} ${isCompleted ? 'is-completed' : ''} ${className}`}
      style={{
        borderColor: isActive ? stage.color : stage.borderColor,
        backgroundColor: stage.lightBg,
        minHeight: isMobile ? 'auto' : '315px',
      }}
      role="button"
      tabIndex={0}
      aria-label={`${stage.number} - ${stage.title}`}
    >
      {/* ── CARD HEADER: Step Number Circle & Tech/Category Badge ── */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* Step Number Circle */}
        <div
          className="stage-number-pill flex items-center justify-center font-bold text-white text-xs sm:text-sm rounded-full shadow-xs"
          style={{ backgroundColor: stage.color, width: '28px', height: '28px' }}
        >
          {stage.number}
        </div>

        {/* Right Icon / Tech Badge */}
        <div className="flex items-center gap-1.5">
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300/60">
              <CheckCircle2 size={11} className="text-emerald-600" />
              Done
            </span>
          )}

          {stage.badgeLabel ? (
            <div
              className="px-2 py-0.5 rounded-md font-extrabold text-[11px] tracking-wider border shadow-2xs flex items-center justify-center"
              style={{
                color: stage.color,
                backgroundColor: '#FFFFFF',
                borderColor: stage.borderColor,
              }}
            >
              {stage.badgeLabel}
            </div>
          ) : (
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center border shadow-2xs"
              style={{
                color: stage.color,
                backgroundColor: '#FFFFFF',
                borderColor: stage.borderColor,
              }}
            >
              <Icon size={15} strokeWidth={2.4} />
            </div>
          )}
        </div>
      </div>

      {/* ── CARD TITLE ── */}
      <h3 className="stage-title font-extrabold text-sm sm:text-base text-slate-900 leading-snug mb-3">
        {stage.title}
      </h3>

      {/* ── CHECKLIST TOPICS (Hollow Circle Bullets matching reference) ── */}
      <ul className="stage-checklist flex flex-col gap-1.5 mb-4">
        {visibleTopics.map((topic, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2 text-xs font-medium text-slate-700 leading-tight"
          >
            {/* Hollow Circle Bullet ○ */}
            <span
              className="inline-flex items-center justify-center w-3 h-3 rounded-full border border-slate-400/80 mt-0.5 shrink-0 transition-colors"
              style={{
                borderColor: isCompleted ? '#10B981' : undefined,
                backgroundColor: isCompleted ? '#10B981' : 'transparent',
              }}
            >
              {isCompleted && (
                <span className="w-1 h-1 rounded-full bg-white block" />
              )}
            </span>
            <span className="stage-topic-text">{topic}</span>
          </li>
        ))}
      </ul>

      {/* Mobile Topics Expand/Collapse Toggle */}
      {hasMoreTopics && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpandedOnMobile(!expandedOnMobile);
          }}
          className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-2 self-start cursor-pointer"
          aria-expanded={expandedOnMobile}
        >
          {expandedOnMobile ? (
            <>
              <span>Show less</span>
              <ChevronUp size={12} />
            </>
          ) : (
            <>
              <span>View {stage.checklist.length - maxMobileTopics} more topics →</span>
              <ChevronDown size={12} />
            </>
          )}
        </button>
      )}

      {/* ── FOOTER: Duration Chip (Clock icon + Duration) ── */}
      <div className="stage-footer mt-auto pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
        <div
          className="stage-duration-chip inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px]"
          style={{
            color: stage.color,
            backgroundColor: '#FFFFFF',
            border: `1px solid ${stage.borderColor}`,
          }}
        >
          <Clock size={12} strokeWidth={2.2} />
          <span>{stage.duration}</span>
        </div>

        {/* Subtle indicator */}
        <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
          Explore →
        </span>
      </div>
    </motion.div>
  );
};
