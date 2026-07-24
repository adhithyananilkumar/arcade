import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { useRoadmapViewerStore } from '../store/useRoadmapViewerStore';
import { RoadmapNode } from '../types';
import { CheckCircle, PlayCircle, BookOpen, Clock, FileText, HelpCircle, Laptop } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HoverPreviewProps {
  nodeId: string;
  anchorRect: DOMRect;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const HoverPreview: React.FC<HoverPreviewProps> = ({ nodeId, anchorRect, onMouseEnter, onMouseLeave }) => {
  const { nodes, progress, toggleNodeCompletion, setActiveNode } = useRoadmapViewerStore();
  const router = useRouter();
  const previewRef = useRef<HTMLDivElement>(null);

  const node = useMemo(() => nodes.find(n => n.id === nodeId), [nodes, nodeId]);
  const nodeProgress = useMemo(() => progress[nodeId], [progress, nodeId]);
  const isCompleted = nodeProgress?.status === 'COMPLETED';

  // Calculate positioning state
  const [position, setPosition] = useState({ left: 0, top: 0, arrowDir: 'left' });

  const resources = useMemo(() => {
    if (!node) return [];
    const list = [];
    const label = node.label;
    const type = node.type || 'lesson';
    const contentId = node.contentId;

    if (contentId) {
      if (contentId.startsWith('les-')) {
        list.push({ title: `Introduction to ${label}`, type: 'lesson', url: `/learn/demo-course` });
      } else if (contentId.startsWith('quiz-')) {
        list.push({ title: `${label} Quiz`, type: 'quiz', url: `/learn/demo-course` });
      } else if (contentId.startsWith('vid-')) {
        list.push({ title: `Video: Learn ${label}`, type: 'video', url: `https://www.youtube.com` });
      } else if (contentId.startsWith('res-')) {
        list.push({ title: `${label} Documentation`, type: 'doc', url: `https://developer.mozilla.org` });
      } else {
        list.push({ title: `Course: ${label}`, type: 'lesson', url: `/learn/${contentId}` });
      }
    } else {
      if (type === 'video') {
        list.push({ title: `Video: ${label} Basics`, type: 'video', url: 'https://www.youtube.com' });
        list.push({ title: `Documentation: ${label} Guide`, type: 'doc', url: 'https://developer.mozilla.org' });
      } else if (type === 'quiz' || type === 'assessment') {
        list.push({ title: `Quiz: Test ${label}`, type: 'quiz', url: '#' });
      } else if (type === 'project') {
        list.push({ title: `Lab: ${label} Workspace`, type: 'project', url: '#' });
      } else {
        list.push({ title: `Lesson: ${label} Fundamentals`, type: 'lesson', url: '#' });
      }
    }
    return list;
  }, [node]);

  useLayoutEffect(() => {
    if (!previewRef.current || !anchorRect) return;

    const elHeight = previewRef.current.offsetHeight || 380;
    const elWidth = 340;
    const padding = 16;

    let targetLeft = anchorRect.right + 16;
    let targetTop = anchorRect.top + (anchorRect.height - elHeight) / 2;
    let arrowDir = 'left';

    // 1. Right overflow checks
    if (targetLeft + elWidth > window.innerWidth - padding) {
      // Try Left
      targetLeft = anchorRect.left - elWidth - 16;
      arrowDir = 'right';

      // 2. Left overflow checks
      if (targetLeft < padding) {
        // Try Bottom
        targetLeft = anchorRect.left + (anchorRect.width - elWidth) / 2;
        targetTop = anchorRect.bottom + 16;
        arrowDir = 'top';

        // 3. Bottom overflow checks
        if (targetTop + elHeight > window.innerHeight - padding) {
          // Try Top
          targetTop = anchorRect.top - elHeight - 16;
          arrowDir = 'bottom';
        }
      }
    }

    // Clamp coordinates to screen boundaries
    const clampedLeft = Math.max(padding, Math.min(targetLeft, window.innerWidth - elWidth - padding));
    const clampedTop = Math.max(padding, Math.min(targetTop, window.innerHeight - elHeight - padding));

    setPosition({ left: clampedLeft, top: clampedTop, arrowDir });
  }, [anchorRect]);

  if (!node) return null;

  const handleOpenResource = (res: any) => {
    if (res.url && res.url !== '#') {
      if (res.url.startsWith('http')) {
        window.open(res.url, '_blank');
      } else {
        router.push(res.url);
      }
    } else {
      alert(`Launching module: "${res.title}"`);
    }
  };

  const handleStartLearning = () => {
    if (resources.length > 0) {
      handleOpenResource(resources[0]);
    }
  };

  const handleMarkComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleNodeCompletion(node.id);
  };

  const handleViewResources = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveNode(node.id); // Opens the detailed side drawer
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.left}px`,
        top: `${position.top}px`,
        zIndex: 100,
        pointerEvents: 'auto',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <motion.div
        ref={previewRef}
        initial={{ opacity: 0, scale: 0.96, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 4 }}
        transition={{ duration: 0.15 }}
        className="w-[340px] bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/60 p-5 relative select-none"
        role="dialog"
        aria-label={`Preview details for topic ${node.label}`}
      >
        {/* Sub-arrow indicator pointing to card */}
        {position.arrowDir === 'left' && (
          <div className="absolute top-[50%] left-[-6px] translate-y-[-50%] border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-white drop-shadow-[-1px_0_1px_rgba(0,0,0,0.04)]" />
        )}
        {position.arrowDir === 'right' && (
          <div className="absolute top-[50%] right-[-6px] translate-y-[-50%] border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-white drop-shadow-[1px_0_1px_rgba(0,0,0,0.04)]" />
        )}
        {position.arrowDir === 'top' && (
          <div className="absolute top-[-6px] left-[50%] translate-x-[-50%] border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-white" />
        )}
        {position.arrowDir === 'bottom' && (
          <div className="absolute bottom-[-6px] left-[50%] translate-x-[-50%] border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white" />
        )}

        {/* Header Metadata */}
        <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
          <span>{node.type || 'LESSON'}</span>
          <div className="flex items-center gap-3">
            {node.durationMinutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {node.durationMinutes}m
              </span>
            )}
            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold ${
              node.difficulty === 'advanced' ? 'bg-red-50 text-red-600' :
              node.difficulty === 'beginner' ? 'bg-green-50 text-green-600' :
              'bg-blue-50 text-blue-600'
            }`}>
              {node.difficulty || 'Intermediate'}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 leading-tight mb-2 flex items-center gap-2">
          {node.label}
          {isCompleted && <span className="text-green-500 text-xs font-semibold">✓ Completed</span>}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-3">
          {node.description || "No description available."}
        </p>

        {/* Learning Objectives */}
        <div className="mb-4">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            Objectives
          </h4>
          <ul className="space-y-1 text-xs text-gray-600 list-disc list-inside">
            <li>Master the basics of {node.label}.</li>
            <li>Apply concepts in interactive challenges.</li>
            <li>Launch assessments to test your knowledge.</li>
          </ul>
        </div>

        {/* Dynamic Resource Preview */}
        {resources.length > 0 && (
          <div className="mb-5">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <PlayCircle className="w-3.5 h-3.5 text-indigo-500" />
              Featured Resource
            </h4>
            <div 
              onClick={() => handleOpenResource(resources[0])}
              className="p-2.5 bg-gray-50/70 border border-gray-100 rounded-xl flex items-center justify-between hover:bg-indigo-50/20 hover:border-indigo-100 cursor-pointer transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                {resources[0].type === 'video' ? <PlayCircle className="w-3.5 h-3.5 text-red-500" /> : 
                 resources[0].type === 'quiz' ? <HelpCircle className="w-3.5 h-3.5 text-amber-500" /> :
                 resources[0].type === 'doc' ? <FileText className="w-3.5 h-3.5 text-teal-500" /> :
                 resources[0].type === 'project' ? <Laptop className="w-3.5 h-3.5 text-blue-500" /> :
                 <BookOpen className="w-3.5 h-3.5 text-indigo-500" />}
                <span className="text-[11px] font-semibold text-gray-700 truncate max-w-[200px]">
                  {resources[0].title}
                </span>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase">Launch →</span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="border-t border-gray-50 pt-3.5 flex items-center gap-2">
          <button
            onClick={handleStartLearning}
            disabled={resources.length === 0}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-[11px] font-bold py-2 rounded-lg shadow-sm transition-all active:scale-95 flex justify-center items-center gap-1"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            Start Learning
          </button>

          <button
            onClick={handleMarkComplete}
            className={`px-3 py-2 border rounded-lg text-[11px] font-bold transition-all active:scale-95 flex items-center gap-1 ${
              isCompleted 
                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100/50' 
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
            title={isCompleted ? 'Marked as completed' : 'Mark as completed'}
          >
            <CheckCircle className={`w-3.5 h-3.5 ${isCompleted ? 'text-green-600' : 'text-gray-400'}`} />
          </button>

          <button
            onClick={handleViewResources}
            className="px-3 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 text-[11px] font-bold rounded-lg transition-all active:scale-95 flex items-center gap-1"
            title="View all objectives & resources"
          >
            <FileText className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
