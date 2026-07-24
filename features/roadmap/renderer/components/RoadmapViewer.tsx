import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { parseRoadmapGraph } from '../engine/parser';
import { calculateLayout } from '../engine/layout';
import { ViewerHeader } from './ViewerHeader';
import { EdgeRenderer } from './EdgeRenderer';
import { NodeCard } from './NodeCard';
import { LearningDrawer } from './LearningDrawer';
import { useRoadmapViewerStore } from '../store/useRoadmapViewerStore';
import { useRouter } from 'next/navigation';
import { RoadmapNode } from '../types';
import { AnimatePresence } from 'framer-motion';
import { HoverPreview } from './HoverPreview';

interface RoadmapViewerProps {
  roadmapId: string;
  title: string;
  description: string;
  graphJson: string;
}

export const RoadmapViewer: React.FC<RoadmapViewerProps> = ({ roadmapId, title, description, graphJson }) => {
  const { init, focusMode, activeNodeId, setActiveNode, progress } = useRoadmapViewerStore();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  const [containerWidth, setContainerWidth] = useState(960);

  const [activeHoverNodeId, setActiveHoverNodeId] = useState<string | null>(null);
  const [hoverAnchorRect, setHoverAnchorRect] = useState<DOMRect | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Track scroll container width dynamically to reflow layouts
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    setContainerWidth(node.clientWidth || 960);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width || 960);
      }
    });

    observer.observe(node);
  }, []);

  // Compute layout positions dynamically based on current viewport width
  const graph = useMemo(() => {
    const { nodes, edges } = parseRoadmapGraph(graphJson);
    return calculateLayout(nodes, edges, containerWidth);
  }, [graphJson, containerWidth]);

  // Initialize store once on mount
  useEffect(() => {
    setIsMounted(true);
    if (roadmapId) {
      init(roadmapId, graph.nodes, graph.edges);
    }
  }, [roadmapId, init]); // only run when roadmapId changes to prevent resetting selection on layout reflow

  // Synchronize dynamic coordinates with the store to ensure edge renderer & lock calculations stay in sync
  useEffect(() => {
    if (isMounted) {
      useRoadmapViewerStore.setState({ nodes: graph.nodes, edges: graph.edges });
    }
  }, [graph.nodes, graph.edges, isMounted]);

  // Group nodes by Y coordinate to create logical rows for keyboard navigation
  const levels = useMemo(() => {
    const yGroups: Record<number, RoadmapNode[]> = {};
    graph.nodes.forEach(node => {
      const y = node.y;
      if (!yGroups[y]) {
        yGroups[y] = [];
      }
      yGroups[y].push(node);
    });

    return Object.keys(yGroups)
      .map(Number)
      .sort((a, b) => a - b)
      .map(y => yGroups[y].sort((a, b) => a.x - b.x));
  }, [graph.nodes]);

  // Keyboard navigation across responsive levels
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape', 'Enter'].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'Escape') {
        setActiveNode(null);
        setActiveHoverNodeId(null);
        return;
      }
      
      if (levels.length === 0) return;

      if (!activeNodeId) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
          setActiveNode(levels[0][0].id);
        }
        return;
      }

      let activeL = -1;
      let activeN = -1;
      for (let l = 0; l < levels.length; l++) {
        const idx = levels[l].findIndex(n => n.id === activeNodeId);
        if (idx !== -1) {
          activeL = l;
          activeN = idx;
          break;
        }
      }

      if (activeL === -1 || activeN === -1) return;

      if (e.key === 'Enter') {
        const activeNode = levels[activeL][activeN];
        const contentId = activeNode.contentId;
        if (contentId) {
          if (contentId.startsWith('les-') || contentId.startsWith('quiz-')) {
            router.push(`/learn/demo-course`);
          } else {
            router.push(`/learn/${contentId}`);
          }
        }
        return;
      }

      let nextNodeId = null;
      if (e.key === 'ArrowLeft') {
        if (activeN > 0) {
          nextNodeId = levels[activeL][activeN - 1].id;
        }
      } else if (e.key === 'ArrowRight') {
        if (activeN < levels[activeL].length - 1) {
          nextNodeId = levels[activeL][activeN + 1].id;
        }
      } else if (e.key === 'ArrowDown') {
        if (activeL < levels.length - 1) {
          const nextLNodes = levels[activeL + 1];
          const targetIndex = Math.min(activeN, nextLNodes.length - 1);
          nextNodeId = nextLNodes[targetIndex].id;
        }
      } else if (e.key === 'ArrowUp') {
        if (activeL > 0) {
          const prevLNodes = levels[activeL - 1];
          const targetIndex = Math.min(activeN, prevLNodes.length - 1);
          nextNodeId = prevLNodes[targetIndex].id;
        }
      }

      if (nextNodeId) {
        setActiveNode(nextNodeId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeNodeId, levels, setActiveNode, router]);

  const completionPercentage = useMemo(() => {
    if (graph.nodes.length === 0) return 0;
    const completedNodes = graph.nodes.filter(n => progress[n.id]?.status === 'COMPLETED').length;
    return (completedNodes / graph.nodes.length) * 100;
  }, [graph.nodes, progress]);

  const completedNodesCount = useMemo(() => {
    return graph.nodes.filter(n => progress[n.id]?.status === 'COMPLETED').length;
  }, [graph.nodes, progress]);

  const currentNodeLabel = useMemo(() => {
    if (!activeNodeId) return null;
    const node = graph.nodes.find(n => n.id === activeNodeId);
    return node ? node.label : null;
  }, [graph.nodes, activeNodeId]);

  const remainingNodesCount = useMemo(() => {
    return graph.nodes.length - completedNodesCount;
  }, [graph.nodes, completedNodesCount]);

  const estimatedDuration = useMemo(() => {
    const totalMinutes = graph.nodes.reduce((acc, node) => acc + (node.durationMinutes || 0), 0);
    if (totalMinutes === 0) return "2h 30m";
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}m` : ''}`.trim();
  }, [graph.nodes]);

  const difficulty = useMemo(() => {
    const difficulties = graph.nodes.map(n => n.difficulty).filter(Boolean);
    if (difficulties.length === 0) return "Intermediate";
    const counts: Record<string, number> = {};
    let maxCount = 0;
    let mostFrequent = "Intermediate";
    for (const d of difficulties) {
      if (d) {
        counts[d] = (counts[d] || 0) + 1;
        if (counts[d] > maxCount) {
          maxCount = counts[d];
          mostFrequent = d;
        }
      }
    }
    return mostFrequent.charAt(0).toUpperCase() + mostFrequent.slice(1);
  }, [graph.nodes]);

  if (!isMounted) return null;

  return (
    <div className="flex-1 flex flex-col w-full h-screen bg-[#FAFAFA] relative overflow-hidden">
      <ViewerHeader 
        title={title}
        description={description}
        completionPercentage={completionPercentage}
        totalNodes={graph.nodes.length}
        difficulty={difficulty}
        estimatedDuration={estimatedDuration}
        completedNodesCount={completedNodesCount}
        currentNodeLabel={currentNodeLabel}
        remainingNodesCount={remainingNodesCount}
      />
      
      <div 
        ref={containerRef}
        id="roadmap-scroll-container"
        className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-12 relative w-full flex flex-col items-center scrollbar-thin scrollbar-thumb-gray-200 scroll-smooth"
      >
        {/* Max width container centering the layout absolutely */}
        <div 
          id="roadmap-content-wrapper"
          className="w-full max-w-[960px] relative transition-all duration-300 mx-auto"
          style={{ 
            height: `${graph.height}px` 
          }}
        >
          {/* Synchronous connection lines */}
          <EdgeRenderer edges={graph.edges} />

          {/* Absolute positioning of card nodes */}
          {graph.nodes.map(node => (
            <NodeCard 
              key={node.id} 
              node={node} 
              onMouseEnter={handleNodeMouseEnter}
              onMouseLeave={handleNodeMouseLeave}
            />
          ))}
        </div>
      </div>

      <LearningDrawer nodes={graph.nodes} />

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
    </div>
  );
};
