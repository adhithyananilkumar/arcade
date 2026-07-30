'use client';

import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { parseRoadmapGraph } from '../engine/parser';
import { calculateJourneyLayout } from '../engine/journeyLayoutEngine';
import { ViewerHeader } from './ViewerHeader';
import { RoadSVG } from './RoadSVG';
import { JourneyWaypoint } from './JourneyWaypoint';
import { LessonCard } from './LessonCard';
import { RoadControls } from './RoadControls';
import { LearningDrawer } from './LearningDrawer';
import { useRoadmapViewerStore } from '../store/useRoadmapViewerStore';
import { useRouter } from 'next/navigation';
import { RoadmapNode } from '../types';
import { AnimatePresence } from 'framer-motion';
import { HoverPreview } from './HoverPreview';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/design-system/ui/dialog';

interface RoadmapViewerProps {
  roadmapId: string;
  title: string;
  description: string;
  graphJson: string;
}

export const RoadmapViewer: React.FC<RoadmapViewerProps> = ({
  roadmapId,
  title,
  description,
  graphJson,
}) => {
  const { init, activeNodeId, setActiveNode, progress } = useRoadmapViewerStore();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  const [containerWidth, setContainerWidth] = useState(1200);
  const [containerHeight, setContainerHeight] = useState(800);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'current'>('all');

  const [activeHoverNodeId, setActiveHoverNodeId] = useState<string | null>(null);
  const [hoverAnchorRect, setHoverAnchorRect] = useState<DOMRect | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportNote, setReportNote] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const handleReportSubmit = async () => {
    if (!reportNote.trim()) {
      toast.error('Please provide a note about the issue.');
      return;
    }
    setIsReporting(true);
    try {
      const { api } = await import('@/infrastructure/http/api');
      await api.post('/api/v1/reports', {
        contentId: roadmapId,
        contentType: 'ROADMAP',
        note: reportNote
      });
      toast.success('Roadmap reported. Our moderation team will review it shortly.');
      setReportModalOpen(false);
      setReportNote('');
    } catch (err: any) {
      console.error('Failed to report roadmap:', err);
      toast.error(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsReporting(false);
    }
  };

  const handleNodeMouseEnter = (nodeId: string, rect: DOMRect) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoverAnchorRect(rect);
      setActiveHoverNodeId(nodeId);
    }, 150);
  };

  const handleNodeMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setActiveHoverNodeId(null);
      setHoverAnchorRect(null);
    }, 200);
  };

  const handlePreviewMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handlePreviewMouseLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setActiveHoverNodeId(null);
      setHoverAnchorRect(null);
    }, 200);
  };

  // Track container dimensions dynamically
  const containerRefCallback = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    scrollContainerRef.current = node;
    setContainerWidth(node.clientWidth || 1200);
    setContainerHeight(node.clientHeight || 800);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width || 1200);
        setContainerHeight(entry.contentRect.height || 800);
      }
    });

    observer.observe(node);
  }, []);

  // Compute Journey Layout procedurally
  const journeyResult = useMemo(() => {
    const { nodes, edges, canvasAppearance } = parseRoadmapGraph(graphJson);
    return calculateJourneyLayout(nodes, edges, containerWidth, progress, canvasAppearance);
  }, [graphJson, containerWidth, progress]);

  const canvasAppearance = journeyResult.canvasAppearance;

  // Dimming logic based on search & filter
  const dimmedNodeIds = useMemo(() => {
    const dimmed = new Set<string>();
    const hasActiveFilter = selectedFilter !== 'all';
    const hasActiveSearch = searchQuery.trim().length > 0;
    if (!hasActiveFilter && !hasActiveSearch) return dimmed;

    journeyResult.nodes.forEach(node => {
      const nodeProgress = progress[node.id];
      const isCompleted = nodeProgress?.status === 'COMPLETED';
      let matches = true;

      if (hasActiveSearch) {
        const labelMatch = node.label.toLowerCase().includes(searchQuery.toLowerCase());
        const descMatch = (node.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        matches = matches && (labelMatch || descMatch);
      }

      if (hasActiveFilter) {
        if (selectedFilter === 'completed') matches = matches && isCompleted;
        if (selectedFilter === 'current') {
          const nextAttachment = journeyResult.attachments.find(a => a.state === 'current');
          const isActiveStep = activeNodeId === node.id || (activeNodeId === null && nextAttachment?.node.id === node.id);
          matches = matches && isActiveStep;
        }
      }

      if (!matches) {
        dimmed.add(node.id);
      }
    });
    return dimmed;
  }, [journeyResult.nodes, journeyResult.attachments, progress, searchQuery, selectedFilter, activeNodeId]);

  // Smooth camera panning helper
  const panToWaypointY = useCallback((targetY: number) => {
    if (scrollContainerRef.current) {
      const centeredY = targetY - containerHeight / 2 + 80;
      scrollContainerRef.current.scrollTo({
        top: Math.max(0, centeredY),
        behavior: 'smooth',
      });
    }
  }, [containerHeight]);

  // Focus current incomplete lesson (scroll smoothly into viewport center)
  const handleFocusCurrent = useCallback(() => {
    const currentAttachment =
      journeyResult.attachments.find(a => a.state === 'current') ||
      journeyResult.attachments[0];

    if (currentAttachment) {
      panToWaypointY(currentAttachment.waypoint.y);
      setActiveNode(currentAttachment.node.id);
    }
  }, [journeyResult.attachments, panToWaypointY, setActiveNode]);

  // Primary Waypoint Action Handler (Triggered when user clicks a Waypoint)
  const handleWaypointAction = useCallback((node: RoadmapNode, state: string) => {
    if (state === 'locked') return;

    const contentId = node.contentId;
    if (contentId) {
      if (contentId.startsWith('les-') || contentId.startsWith('quiz-')) {
        router.push(`/learn/demo-course`);
      } else {
        router.push(`/learn/${contentId}`);
      }
    } else {
      router.push(`/learn/demo-course`);
    }
  }, [router]);

  // Zoom Camera handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.15, 1.6));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.15, 0.65));
  const handleResetView = () => {
    setZoomLevel(1);
    handleFocusCurrent();
  };

  // Store Initialization on mount
  useEffect(() => {
    setIsMounted(true);
    if (roadmapId) {
      init(roadmapId, journeyResult.nodes, journeyResult.edges);
    }
  }, [roadmapId, init]);

  // Synchronize dynamic coordinates with Zustand store
  useEffect(() => {
    if (isMounted) {
      useRoadmapViewerStore.setState({
        nodes: journeyResult.nodes,
        edges: journeyResult.edges,
      });
    }
  }, [journeyResult.nodes, journeyResult.edges, isMounted]);

  // Auto-focus current lesson on initial load
  useEffect(() => {
    if (isMounted && journeyResult.attachments.length > 0) {
      const timer = setTimeout(() => {
        handleFocusCurrent();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isMounted]);

  // Auto-pan camera when current lesson changes upon completion
  const prevCurrentNodeIdRef = useRef<string | null>(null);
  useEffect(() => {
    const currentAtt = journeyResult.attachments.find(a => a.state === 'current');
    if (currentAtt && prevCurrentNodeIdRef.current && prevCurrentNodeIdRef.current !== currentAtt.node.id) {
      // Smoothly pan camera to newly unlocked lesson
      panToWaypointY(currentAtt.waypoint.y);
    }
    if (currentAtt) {
      prevCurrentNodeIdRef.current = currentAtt.node.id;
    }
  }, [journeyResult.attachments, panToWaypointY]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'Escape', 'Enter'].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'Escape') {
        setActiveNode(null);
        setActiveHoverNodeId(null);
        return;
      }

      const attachments = journeyResult.attachments;
      if (attachments.length === 0) return;

      const currIdx = attachments.findIndex(a => a.node.id === activeNodeId);

      if (e.key === 'Enter' && currIdx !== -1) {
        const att = attachments[currIdx];
        handleWaypointAction(att.node, att.state);
        return;
      }

      if (e.key === 'ArrowDown') {
        const nextIdx = currIdx === -1 ? 0 : Math.min(currIdx + 1, attachments.length - 1);
        const nextAtt = attachments[nextIdx];
        setActiveNode(nextAtt.node.id);
        panToWaypointY(nextAtt.waypoint.y);
      } else if (e.key === 'ArrowUp') {
        const prevIdx = currIdx === -1 ? 0 : Math.max(currIdx - 1, 0);
        const prevAtt = attachments[prevIdx];
        setActiveNode(prevAtt.node.id);
        panToWaypointY(prevAtt.waypoint.y);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeNodeId, journeyResult.attachments, setActiveNode, handleWaypointAction, panToWaypointY]);

  // Metrics calculations
  const completionPercentage = useMemo(() => {
    if (journeyResult.nodes.length === 0) return 0;
    const completedNodes = journeyResult.nodes.filter(
      n => progress[n.id]?.status === 'COMPLETED'
    ).length;
    return (completedNodes / journeyResult.nodes.length) * 100;
  }, [journeyResult.nodes, progress]);

  const completedNodesCount = useMemo(() => {
    return journeyResult.nodes.filter(n => progress[n.id]?.status === 'COMPLETED').length;
  }, [journeyResult.nodes, progress]);

  const currentNodeLabel = useMemo(() => {
    if (!activeNodeId) return null;
    const node = journeyResult.nodes.find(n => n.id === activeNodeId);
    return node ? node.label : null;
  }, [journeyResult.nodes, activeNodeId]);

  const remainingNodesCount = useMemo(() => {
    return journeyResult.nodes.length - completedNodesCount;
  }, [journeyResult.nodes, completedNodesCount]);

  const estimatedDuration = useMemo(() => {
    const totalMinutes = journeyResult.nodes.reduce(
      (acc, node) => acc + (node.durationMinutes || 15),
      0
    );
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}m` : ''}`.trim();
  }, [journeyResult.nodes]);

  const difficulty = useMemo(() => {
    const difficulties = journeyResult.nodes.map(n => n.difficulty).filter(Boolean);
    if (difficulties.length === 0) return 'Intermediate';
    return difficulties[0]!;
  }, [journeyResult.nodes]);

  if (!isMounted) return null;

  return (
    <div
      className="flex-1 flex flex-col w-full h-screen relative overflow-hidden select-none bg-[#090d16]"
      style={{ backgroundColor: canvasAppearance?.backgroundColor || '#090d16' }}
    >
      {/* Header Bar */}
      <ViewerHeader
        title={title}
        description={description}
        completionPercentage={completionPercentage}
        totalNodes={journeyResult.nodes.length}
        difficulty={difficulty}
        estimatedDuration={estimatedDuration}
        completedNodesCount={completedNodesCount}
        currentNodeLabel={currentNodeLabel}
        remainingNodesCount={remainingNodesCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        onContinueLearning={handleFocusCurrent}
        onReportClick={() => setReportModalOpen(true)}
      />

      {/* Main Journey Scroll Viewport */}
      <div
        ref={containerRefCallback}
        id="roadmap-scroll-container"
        className="flex-1 overflow-auto relative w-full flex scrollbar-thin scrollbar-thumb-indigo-950 scroll-smooth"
      >
        {/* Subtle Ambient Background Grid & Stars */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 80%), radial-gradient(circle, #334155 1px, transparent 1px)`,
            backgroundSize: '100% 100%, 32px 32px',
          }}
        />

        {/* Scalable Journey Canvas Container */}
        <div
          id="roadmap-content-wrapper"
          className="relative transition-transform duration-300 origin-top center mx-auto z-10"
          style={{
            width: `${journeyResult.width}px`,
            height: `${journeyResult.height}px`,
            transform: `scale(${zoomLevel})`,
          }}
        >
          {/* Procedural SVG Winding Road Surface & Connectors */}
          <RoadSVG
            attachments={journeyResult.attachments}
            chapters={journeyResult.chapters}
            roadPath={journeyResult.roadPath}
            width={journeyResult.width}
            height={journeyResult.height}
            activeNodeId={activeNodeId}
            hoveredNodeId={activeHoverNodeId}
          />

          {/* Primary Interactive Waypoints directly attached to road */}
          {journeyResult.attachments.map(att => {
            const isWayActive = activeNodeId === att.node.id;
            const isWayHovered = activeHoverNodeId === att.node.id;

            return (
              <React.Fragment key={`att-group-${att.node.id}`}>
                {/* 1. Primary Interactive Circular Waypoint */}
                <JourneyWaypoint
                  node={att.node}
                  attachment={att}
                  isActive={isWayActive}
                  isHovered={isWayHovered}
                  onSelect={(id) => setActiveNode(id)}
                  onAction={handleWaypointAction}
                  onMouseEnter={handleNodeMouseEnter}
                  onMouseLeave={handleNodeMouseLeave}
                  isDimmed={dimmedNodeIds.has(att.node.id)}
                />

                {/* 2. Informational Lesson Card attached to waypoint (Always Visible) */}
                <LessonCard
                  node={att.node}
                  attachment={att}
                  isActive={isWayActive}
                  isHovered={isWayHovered}
                  isDimmed={dimmedNodeIds.has(att.node.id)}
                />
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Camera & Progress Controls */}
      <RoadControls
        onFocusCurrent={handleFocusCurrent}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        completionPercentage={completionPercentage}
        completedNodesCount={completedNodesCount}
        totalNodesCount={journeyResult.nodes.length}
      />

      {/* Slide-out Learning Drawer */}
      <LearningDrawer nodes={journeyResult.nodes} />

      {/* Hover Preview Popover */}
      <AnimatePresence>
        {activeHoverNodeId && hoverAnchorRect && (
          <HoverPreview
            nodeId={activeHoverNodeId}
            anchorRect={hoverAnchorRect}
            onMouseEnter={handlePreviewMouseEnter}
            onMouseLeave={handlePreviewMouseLeave}
          />
        )}
      </AnimatePresence>

      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Report Roadmap</DialogTitle>
            <DialogDescription>
              Please provide details about what is wrong with this roadmap.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <textarea
              className="min-h-[100px] w-full rounded-md border border-gray-200 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Tell us what's wrong..."
              value={reportNote}
              onChange={(e) => setReportNote(e.target.value)}
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => setReportModalOpen(false)}
              className="rounded-full px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleReportSubmit}
              disabled={isReporting}
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700 disabled:opacity-50"
            >
              {isReporting ? 'Submitting...' : 'Submit Report'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
