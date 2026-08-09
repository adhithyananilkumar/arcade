'use client';
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { RoadmapNode, JourneyNodeAttachment } from '../types';
import {
  Clock,
  Lock,
  BookOpen,
  Sparkles,
  PlayCircle,
  HelpCircle,
  FileText,
  Rocket,
  Trophy,
  Check,
} from 'lucide-react';

interface LessonCardProps {
  node: RoadmapNode;
  attachment: JourneyNodeAttachment;
  isActive?: boolean;
  isHovered?: boolean;
  isDimmed?: boolean;
  index?: number;
  onSelect?: (nodeId: string) => void;
  onAction?: (node: RoadmapNode, state: string) => void;
}

const BG_ALIASES: Record<string, string> = {
  'bg-white':        '#ffffff',
  'bg-indigo-50':    '#eef2ff',
  'bg-indigo-600':   '#6366f1',
  'bg-rose-500':     '#f43f5e',
  'bg-amber-500':    '#f59e0b',
  'bg-emerald-500':  '#10b981',
  'bg-sky-500':      '#0ea5e9',
  'bg-slate-800':    '#1e293b',
};

function resolveBg(color?: string): string {
  if (!color) return '#6366f1';
  return BG_ALIASES[color] ?? color;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  node,
  attachment,
  isActive,
  isHovered,
  isDimmed,
  index = 1,
  onSelect,
  onAction,
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
    if (type === 'video') return <PlayCircle className="w-3.5 h-3.5 text-slate-400" />;
    if (type === 'quiz' || type === 'assessment' || milestoneType === 'quiz')
      return <HelpCircle className="w-3.5 h-3.5 text-slate-400" />;
    if (type === 'project' || milestoneType === 'project')
      return <Rocket className="w-3.5 h-3.5 text-slate-400" />;
    if (type === 'doc') return <FileText className="w-3.5 h-3.5 text-slate-400" />;
    if (type === 'certificate' || milestoneType === 'certificate')
      return <Trophy className="w-3.5 h-3.5 text-slate-400" />;
    return <BookOpen className="w-3.5 h-3.5 text-slate-400" />;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) onSelect(node.id);
    if (!isLocked && onAction) {
      onAction(node, state);
    }
  };

  const themeColor = resolveBg(node.color);

  // Set card borders and styles based on status
  const cardBorderColor = isCurrent
    ? 'border-indigo-400/80 shadow-indigo-100/50 shadow-[0_8px_20px_rgba(99,102,241,0.12)]'
    : isCompleted
    ? 'border-blue-200/80 shadow-blue-50/50 shadow-[0_8px_16px_rgba(37,99,235,0.06)]'
    : 'border-slate-100 shadow-slate-100/60';

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isDimmed ? 0.35 : isLocked ? 0.65 : 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        left: `${waypoint.cardX}px`,
        top: `${waypoint.cardY}px`,
        width: `${waypoint.cardWidth}px`,
        zIndex: isActive || isHovered ? 30 : 15,
      }}
      onClick={handleCardClick}
      className="pointer-events-auto cursor-pointer select-none"
    >
      {/* Light Clean White Card Frame */}
      <div
        className={`w-full bg-white rounded-2xl border-2 p-3.5 flex items-center justify-between min-h-[92px] relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${cardBorderColor} ${
          isActive || isHovered ? 'ring-2 ring-indigo-500/20 border-indigo-400' : ''
        }`}
      >
        {/* Left Side: Number bubble & text detail */}
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          {/* Waypoint Number Bubble */}
          <div
            style={{
              backgroundColor: isCompleted ? '#2563eb' : isCurrent ? '#f97316' : themeColor,
            }}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white font-extrabold text-[11px] shrink-0 shadow-sm"
          >
            {index}
          </div>

          {/* Title & Metadata details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-bold text-slate-800 truncate leading-snug tracking-tight">
              {node.label || 'Untitled Topic'}
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              {node.description ? node.description.split('•')[0].trim() : '8 Lessons'} • {durationText}
            </p>
            
            {/* Learning item icons list */}
            <div className="flex items-center gap-2.5 mt-2">
              <div className="flex items-center justify-center p-1 bg-slate-50 border border-slate-100 rounded-md shrink-0">
                {renderTypeIcon()}
              </div>
              <div className="flex items-center justify-center p-1 bg-slate-50 border border-slate-100 rounded-md shrink-0">
                <PlayCircle className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="flex items-center justify-center p-1 bg-slate-50 border border-slate-100 rounded-md shrink-0">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Status Indicator Badge */}
        <div className="ml-3 shrink-0">
          {isCompleted ? (
            /* Overlapping Top-Right completed badge in layout, or clean status badge */
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-100">
              <Check className="w-3.5 h-3.5 stroke-[3.5]" />
            </div>
          ) : isCurrent ? (
            /* Circular Progress Ring (60%) */
            <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="3"
                  strokeDasharray="60, 100"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[8px] font-black text-orange-600">60%</span>
            </div>
          ) : isLocked ? (
            /* Padlock badge */
            <div className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
              <Lock className="w-3.5 h-3.5" />
            </div>
          ) : (
            /* Ready to start */
            <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-colors">
              <PlayCircle className="w-4 h-4 fill-indigo-100/30" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

