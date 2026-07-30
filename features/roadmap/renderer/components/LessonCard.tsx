'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { RoadmapNode, JourneyNodeAttachment } from '../types';
import {
  CheckCircle,
  Clock,
  Lock,
  Trophy,
  HelpCircle,
  FileText,
  BookOpen,
  Sparkles,
  PlayCircle,
  Rocket,
  Star,
  Check,
  ArrowRight,
} from 'lucide-react';

interface LessonCardProps {
  node: RoadmapNode;
  attachment: JourneyNodeAttachment;
  isActive?: boolean;
  isHovered?: boolean;
  isDimmed?: boolean;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  node,
  attachment,
  isActive,
  isHovered,
  isDimmed,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const { state, waypoint, isMilestone, milestoneType } = attachment;

  const isCompleted = state === 'completed';
  const isCurrent = state === 'current';
  const isLocked = state === 'locked';

  const durationText =
    node.duration || (node.durationMinutes ? `${node.durationMinutes}m` : '15m');

  const renderTypeIcon = () => {
    const type = (node.type || 'lesson').toLowerCase();
    if (type === 'video') return <PlayCircle className="w-3.5 h-3.5 text-red-400" />;
    if (type === 'quiz' || type === 'assessment' || milestoneType === 'quiz')
      return <HelpCircle className="w-3.5 h-3.5 text-amber-400" />;
    if (type === 'project' || milestoneType === 'project')
      return <Rocket className="w-3.5 h-3.5 text-blue-400" />;
    if (type === 'doc') return <FileText className="w-3.5 h-3.5 text-teal-400" />;
    if (type === 'certificate' || milestoneType === 'certificate')
      return <Trophy className="w-3.5 h-3.5 text-purple-400" />;
    return <BookOpen className="w-3.5 h-3.5 text-indigo-400" />;
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isDimmed ? 0.35 : isLocked ? 0.7 : 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        left: `${waypoint.cardX}px`,
        top: `${waypoint.cardY}px`,
        width: `${waypoint.cardWidth}px`,
        zIndex: isActive || isHovered ? 30 : 15,
      }}
      className="pointer-events-none select-none"
    >
      {/* Ambient Glow */}
      <div
        className="absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none"
        style={{
          filter: 'blur(14px)',
          backgroundColor: isCompleted
            ? '#10b981'
            : isCurrent
            ? '#6366f1'
            : '#475569',
          opacity: isCurrent ? 0.3 : isCompleted ? 0.18 : 0.05,
          transform: 'scale(0.96)',
          zIndex: -1,
        }}
      />

      {/* Lesson Card Container - Always Visible, Informational */}
      <div
        className={`w-full bg-slate-900/95 backdrop-blur-md rounded-2xl border-2 p-3 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.4)] flex flex-col justify-between min-h-[115px] relative overflow-hidden text-slate-100 transition-all duration-200 ${
          isActive || isHovered ? 'ring-2 ring-indigo-500/80 border-indigo-400' : ''
        } ${
          isMilestone
            ? 'border-purple-500/40 bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-900'
            : ''
        } ${isLocked ? 'bg-slate-950/90 opacity-75' : ''}`}
        style={{
          borderColor: isCompleted
            ? '#10b981'
            : isCurrent
            ? '#6366f1'
            : isMilestone
            ? '#a855f7'
            : '#334155',
        }}
      >
        {/* Top Accent Bar */}
        {isCurrent && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
        )}
        {isCompleted && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
        )}
        {isMilestone && !isCurrent && !isCompleted && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-amber-500 to-purple-500" />
        )}

        {/* Header Row: Type Icon & Status Badge */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-md bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0">
              {renderTypeIcon()}
            </div>
            <span className="text-[8.5px] font-black uppercase tracking-wider text-slate-400">
              {isMilestone ? (milestoneType || 'Milestone') : (node.type || 'Lesson')}
            </span>
          </div>

          {/* Action State Badge */}
          <div
            className={`px-2 py-0.5 rounded-full text-[8.5px] font-extrabold flex items-center gap-1 uppercase tracking-wider ${
              isCompleted
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                : isCurrent
                ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/40'
                : isLocked
                ? 'bg-slate-900 text-slate-500 border border-slate-800'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            {isCompleted ? (
              <>
                <Check className="w-3 h-3 text-emerald-400 stroke-[3]" /> Completed
              </>
            ) : isCurrent ? (
              <>
                <Sparkles className="w-2.5 h-2.5 text-indigo-400 animate-pulse" /> Continue Learning
              </>
            ) : isLocked ? (
              <>
                <Lock className="w-2.5 h-2.5 text-slate-500" /> Locked
              </>
            ) : (
              <>
                <PlayCircle className="w-2.5 h-2.5 text-indigo-400" /> Start
              </>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div className="my-1.5">
          <h3 className="text-xs font-black text-slate-100 line-clamp-1 leading-snug tracking-tight">
            {node.label || 'Untitled Topic'}
          </h3>
          <p className="text-[9.5px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">
            {node.description?.trim()
              ? node.description
              : 'Interactive learning module & skill verification.'}
          </p>
        </div>

        {/* Footer Metadata Row */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 mt-auto text-[8.5px] font-semibold text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-slate-400" />
              {durationText}
            </span>
            <span className="px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-bold uppercase tracking-wider text-[7.5px]">
              {node.difficulty || 'Intermediate'}
            </span>
          </div>

          <span className={`text-[8.5px] font-extrabold flex items-center gap-0.5 ${
            isCompleted
              ? 'text-emerald-400'
              : isCurrent
              ? 'text-indigo-400'
              : isLocked
              ? 'text-slate-500'
              : 'text-slate-300'
          }`}>
            {isCompleted ? '✓ Done' : isCurrent ? 'Active →' : isLocked ? 'Locked' : 'Ready'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
