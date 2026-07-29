import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/design-system/ui/button';
import { Search, Compass, BookOpen, Clock, Award, Star, ShieldCheck, CheckCircle2, ChevronRight, Flag } from 'lucide-react';

interface ViewerHeaderProps {
  title: string;
  description: string;
  completionPercentage: number;
  totalNodes: number;
  difficulty: string;
  estimatedDuration: string;
  completedNodesCount: number;
  currentNodeLabel: string | null;
  remainingNodesCount: number;
  
  // Search & Filter Props
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFilter: 'all' | 'completed' | 'current';
  setSelectedFilter: (filter: 'all' | 'completed' | 'current') => void;
  
  // Continue Learning Action
  onContinueLearning: () => void;

  // Report Action
  onReportClick?: () => void;
}

export const ViewerHeader: React.FC<ViewerHeaderProps> = ({
  title,
  description,
  completionPercentage,
  totalNodes,
  difficulty,
  estimatedDuration,
  completedNodesCount,
  currentNodeLabel,
  remainingNodesCount,
  searchQuery,
  setSearchQuery,
  selectedFilter,
  setSelectedFilter,
  onContinueLearning,
  onReportClick,
}) => {
  // Calculate remaining time based on 30m average if duration is missing
  const estimatedRemainingTime = React.useMemo(() => {
    const remainingCount = remainingNodesCount;
    if (remainingCount === 0) return "0m";
    const totalMinutes = remainingCount * 30; // 30 minutes average per incomplete topic
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}m` : ''}`.trim();
  }, [remainingNodesCount]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-8 py-5 flex flex-col gap-5 shadow-sm">
      {/* Top Section: Title & Progress Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Metadata & Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold mb-1">
            <span>Learning Roadmap</span>
            <span>•</span>
            <span>Created by Arcade Team</span>
            <span>•</span>
            <span>Updated July 2026</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-3xl leading-relaxed">
            {description}
          </p>
          
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50/50 text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100/30">
              <Compass className="w-3.5 h-3.5" />
              {difficulty}
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50/50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-100/30">
              <Clock className="w-3.5 h-3.5" />
              {estimatedDuration} Total
            </span>
          </div>
        </div>

        {/* Right: Progress Tracker & Continue Learning CTA */}
        <div className="flex flex-wrap items-center gap-5 bg-gray-50/70 border border-gray-100 p-4 rounded-2xl md:min-w-[400px]">
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center text-xs font-bold text-gray-400 mb-1.5">
              <span>{completedNodesCount} / {totalNodes} Lessons Completed</span>
              <span className="text-emerald-600 font-extrabold">{Math.round(completionPercentage)}%</span>
            </div>
            
            {/* Animated Progress Bar */}
            <div className="w-full h-2 bg-gray-200/60 rounded-full overflow-hidden relative">
              <motion.div 
                className="h-full bg-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            
            {/* Helper metrics */}
            <div className="flex justify-between items-center mt-2 text-[10px] font-bold text-gray-500 uppercase tracking-wide">
              {currentNodeLabel ? (
                <span className="text-indigo-600 truncate max-w-[170px]">
                  Next: {currentNodeLabel}
                </span>
              ) : (
                <span>Roadmap Complete!</span>
              )}
              {remainingNodesCount > 0 && (
                <span>~{estimatedRemainingTime} Left</span>
              )}
            </div>
          </div>

          <Button 
            onClick={onContinueLearning}
            className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-100 hover:shadow-lg transition-all active:scale-95 text-xs h-auto"
          >
            Continue Learning
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Bottom Section: Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-1 border-t border-gray-50">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-[50%] translate-y-[-50%] w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topic or keywords..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Filter Switcher Tabs */}
        <div className="flex bg-gray-50/70 border border-gray-100/60 p-1 rounded-xl w-full sm:w-auto">
          {(['all', 'completed', 'current'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFilter(f)}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wide ${
                selectedFilter === f
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {f === 'current' ? 'In Progress' : f}
            </button>
          ))}
        </div>

        {/* Report Button */}
        {onReportClick && (
          <div className="flex-grow flex justify-end">
            <button
              onClick={onReportClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors uppercase tracking-wide"
              aria-label="Report Roadmap"
            >
              <Flag className="w-3.5 h-3.5" />
              Report
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
