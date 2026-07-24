import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { RoadmapNode } from '../types';
import { Play, FileText, HelpCircle, Code, BookOpen, Lock, Award, Beaker, Laptop } from 'lucide-react';
import { useRoadmapViewerStore } from '../store/useRoadmapViewerStore';

interface NodeCardProps {
  node: RoadmapNode;
  onMouseEnter?: (nodeId: string, rect: DOMRect) => void;
  onMouseLeave?: () => void;
}

const getNodeIcon = (node: RoadmapNode) => {
  const type = (node.type || '').toLowerCase();
  const label = (node.label || '').toLowerCase();
  
  if (type.includes('video') || label.includes('video') || label.includes('watch') || label.includes('🎥')) {
    return <Play className="w-4 h-4 text-red-500" />;
  }
  if (type.includes('quiz') || label.includes('quiz') || type.includes('question') || label.includes('❓')) {
    return <HelpCircle className="w-4 h-4 text-amber-500" />;
  }
  if (type.includes('assessment') || label.includes('exam') || label.includes('certification') || label.includes('🏆')) {
    return <Award className="w-4 h-4 text-yellow-500" />;
  }
  if (type.includes('exercise') || type.includes('lab') || label.includes('practice') || label.includes('🧪')) {
    return <Beaker className="w-4 h-4 text-purple-500" />;
  }
  if (type.includes('project') || label.includes('project') || label.includes('💻')) {
    return <Laptop className="w-4 h-4 text-blue-500" />;
  }
  if (type.includes('code') || label.includes('code') || label.includes('build')) {
    return <Code className="w-4 h-4 text-sky-500" />;
  }
  if (type.includes('doc') || type.includes('article') || label.includes('read') || type.includes('documentation') || label.includes('📄')) {
    return <FileText className="w-4 h-4 text-teal-500" />;
  }
  return <BookOpen className="w-4 h-4 text-indigo-500" />;
};

export const NodeCard: React.FC<NodeCardProps> = ({ node, onMouseEnter, onMouseLeave }) => {
  const { 
    activeNodeId, 
    setActiveNode, 
    focusMode, 
    progress, 
    lockedNodeIds, 
    setHoveredNode, 
    toggleNodeCompletion 
  } = useRoadmapViewerStore();
  
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (onMouseEnter && cardRef.current) {
      onMouseEnter(node.id, cardRef.current.getBoundingClientRect());
    }
    setHoveredNode(node.id);
  };

  const handleMouseLeave = () => {
    if (onMouseLeave) {
      onMouseLeave();
    }
    setHoveredNode(null);
  };

  const handleFocus = () => {
    if (onMouseEnter && cardRef.current) {
      onMouseEnter(node.id, cardRef.current.getBoundingClientRect());
    }
  };

  const handleBlur = () => {
    if (onMouseLeave) {
      onMouseLeave();
    }
  };

  const isActive = activeNodeId === node.id;
  const isFaded = activeNodeId !== null && !isActive;

  const nodeProgress = progress[node.id];
  const isCompleted = nodeProgress?.status === 'COMPLETED';
  const isLocked = lockedNodeIds.has(node.id);

  // Auto-scroll into view when this node becomes active
  useEffect(() => {
    if (isActive && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, [isActive]);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLocked) {
      toggleNodeCompletion(node.id);
    }
  };

  const handleCardClick = () => {
    if (!isLocked) {
      setActiveNode(isActive ? null : node.id);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isFaded ? 0.35 : 1, 
        y: 0,
        scale: isActive ? [1.02, 1.04, 1.02] : 1,
        borderColor: isActive ? '#6366F1' : isCompleted ? '#22C55E' : isLocked ? '#F3F4F6' : '#E5E7EB',
        boxShadow: isActive 
          ? '0 0 18px 3px rgba(99, 102, 241, 0.3), 0 10px 25px -5px rgba(99, 102, 241, 0.2)' 
          : isCompleted 
            ? '0 4px 14px rgba(34, 197, 94, 0.06)'
            : '0 4px 8px -1px rgba(0, 0, 0, 0.04)'
      }}
      whileHover={!isFaded && !isLocked ? { 
        y: -4, 
        scale: 1.02,
        boxShadow: '0 16px 24px -8px rgba(0, 0, 0, 0.08)',
        borderColor: isActive ? '#6366F1' : isCompleted ? '#22C55E' : '#C7D2FE'
      } : {}}
      transition={{ 
        scale: isActive 
          ? { repeat: Infinity, duration: 2, ease: "easeInOut" } 
          : { duration: 0.2 },
        default: { duration: 0.2 }
      }}
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={0}
      onClick={handleCardClick}
      className={`
        absolute flex flex-col p-5 bg-white rounded-2xl cursor-pointer lp-node-card
        border-2 transition-all duration-200 select-none shadow-sm hover:shadow-md
        ${isCompleted ? 'bg-green-50/15' : ''}
        ${isLocked ? 'bg-gray-50/60 cursor-not-allowed opacity-60' : ''}
      `}
      style={{
        left: `${node.x}px`,
        top: `${node.y}px`,
        width: `${node.width}px`,
        height: `${node.height}px`,
        zIndex: isActive ? 10 : 1,
      }}
    >
      <div className="flex gap-4 h-full items-center">
        {/* Left side: Spring Animated Checkbox */}
        <motion.button
          onClick={handleCheckboxClick}
          disabled={isLocked}
          whileHover={!isLocked ? { scale: 1.15, boxShadow: '0 0 8px rgba(99, 102, 241, 0.3)', borderColor: '#6366F1' } : {}}
          whileTap={!isLocked ? { scale: 0.92 } : {}}
          transition={{ type: "spring", stiffness: 450, damping: 15 }}
          className={`relative w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            isCompleted
              ? 'border-green-500 bg-green-500 text-white'
              : isLocked
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed text-gray-300'
                : isActive
                  ? 'border-indigo-500 bg-white ring-2 ring-indigo-100'
                  : 'border-gray-300 bg-white text-transparent'
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <motion.polyline
              points="20 6 9 17 4 12"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: isCompleted ? 1 : 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            />
          </svg>
          
          {/* Gentle pulse ring outer layer */}
          {isActive && !isCompleted && (
            <motion.span
              className="absolute inset-0 rounded-full border border-indigo-500"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </motion.button>
        
        {/* Right side: Content Details */}
        <div className="flex-grow flex flex-col justify-between h-full min-w-0">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                {getNodeIcon(node)}
                <span>{node.type || 'Lesson'}</span>
              </div>
              
              {isLocked && <Lock className="text-gray-400 w-3 h-3" />}
            </div>
            
            <h3 className={`font-bold text-sm text-gray-900 leading-snug line-clamp-2 ${isCompleted ? 'text-gray-400 line-through' : ''}`} style={{ letterSpacing: '-0.01em' }}>
              {node.label}
            </h3>
          </div>
          
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-100">
            <span className="text-[10px] text-gray-400 font-semibold tracking-wide">
              {node.difficulty ? node.difficulty.toUpperCase() : 'INTERMEDIATE'}
            </span>
            {node.durationMinutes && (
              <span className="text-[10px] font-medium text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                {node.durationMinutes}m
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
