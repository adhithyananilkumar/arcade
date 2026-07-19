import React, { useCallback, useMemo } from 'react';
import type { RoadmapData } from '../types';
import { RoadmapCanvas } from './RoadmapCanvas';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface RoadmapViewerProps {
  roadmap: RoadmapData;
  onUpdateProgress: (newGraphJson: string) => void;
}

export function RoadmapViewer({ roadmap, onUpdateProgress }: RoadmapViewerProps) {

  const handleGraphChange = useCallback((newGraphJson: string) => {
    onUpdateProgress(newGraphJson);
  }, [onUpdateProgress]);

  // Calculate progress
  const progressPercent = useMemo(() => {
    if (!roadmap.graphJson) return 0;
    try {
      const parsed = JSON.parse(roadmap.graphJson);
      const nodes = parsed.nodes || [];
      
      // Filter out structural nodes (like sections) to calculate actual learning progress
      const actionableNodes = nodes.filter((n: any) => n.data?.nodeType !== 'section');
      
      if (actionableNodes.length === 0) return 0;
      
      const completed = actionableNodes.filter((n: any) => n.data?.completed).length;
      return Math.round((completed / actionableNodes.length) * 100);
    } catch (e) {
      return 0;
    }
  }, [roadmap.graphJson]);



  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/roadmaps" className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{roadmap.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{roadmap.description || 'No description provided.'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Your Progress</div>
            <div className="flex items-center gap-3 w-48">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-sm font-bold text-emerald-600">{progressPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <RoadmapCanvas 
          roadmap={roadmap} 
          saveState="saved"
          onGraphChange={handleGraphChange}
          onManualSave={() => {}}
          readOnly={true}
        />
      </div>
    </div>
  );
}
